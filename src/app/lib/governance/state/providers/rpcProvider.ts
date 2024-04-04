import { GovernanceState, PeriodType, PromotionPeriod, Proposal, ProposalPeriod } from '../state';
import { TezosToolkit } from '@taquito/taquito';
import * as Storage from '../../contract/storage';
import { VotingFinishedEventPayload, VotingState } from '../../contract/views';
import BigNumber from 'bignumber.js';
import { MichelsonOptional } from '../../contract/types';
import { BlockchainProvider } from '../../../blockchain';
import { GovernanceConfig } from '../../config/config';
import { getFirstBlockOfPeriod, getLastBlockOfPeriod, callGetVotingStateView, mapPayloadKey } from '../../utils';
import { GovernanceStateProvider } from './provider';
import { HistoricalRpcClient } from '@/app/lib/rpc/historicalRpcClient';

export class RpcGovernanceStateProvider implements GovernanceStateProvider {
  constructor(
    private readonly rpcUrl: string,
    private readonly blockchainProvider: BlockchainProvider
  ) { }

  async getState(contractAddress: string, config: GovernanceConfig, periodIndex: number): Promise<GovernanceState> {
    const [
      currentBlockLevel,
      originatedAtLevel
    ] = await Promise.all([
      this.blockchainProvider.getCurrentBlockLevel(),
      this.blockchainProvider.getContractOriginationLevel(contractAddress)
    ]);
    const blockLevel = Math.min(getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength), currentBlockLevel);
    if (blockLevel <= originatedAtLevel)
      return await this.createEmptyGovernanceState(periodIndex, config);

    const toolkit = this.getToolkit(blockLevel);
    const [storage, stateViewResult] = await Promise.all([
      this.loadStorage(contractAddress, toolkit),
      callGetVotingStateView(contractAddress, toolkit)
    ]);
    return await this.getStateCore(contractAddress, currentBlockLevel, periodIndex, storage, stateViewResult, config);
  }

  private getToolkit(blockLevel?: number): TezosToolkit {
    return new TezosToolkit(blockLevel ? new HistoricalRpcClient(this.rpcUrl, blockLevel) : this.rpcUrl);
  }

  private async loadStorage(contractAddress: string, toolkit: TezosToolkit): Promise<Storage.GovernanceContractStorage> {
    const contract = await toolkit.contract.at(contractAddress);
    return contract.storage<Storage.GovernanceContractStorage>();
  }

  private async createEmptyGovernanceState(periodIndex: number, config: GovernanceConfig): Promise<GovernanceState> {
    const periodStartLevel = getFirstBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const periodEndLevel = getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const [
      periodStartTime,
      periodEndTime,
      totalVotingPower,
      promotionPeriod
    ] = await Promise.all([
      this.blockchainProvider.getBlockCreationTime(periodStartLevel),
      this.blockchainProvider.getBlockCreationTime(periodEndLevel),
      this.blockchainProvider.getTotalVotingPower(periodStartLevel),
      this.createEmptyPromotionPeriod(periodIndex + 1, config)
    ])

    return {
      votingContext: {
        periodIndex,
        periodType: PeriodType.Proposal,
        proposalPeriod: {
          index: periodIndex,
          startLevel: periodStartLevel,
          startTime: periodStartTime,
          endLevel: periodEndLevel,
          endTime: periodEndTime,
          totalVotingPower,
          proposals: [],
          upvotersBigMapId: null,
          winnerCandidate: null,
          candidateUpvotesVotingPower: null,
        },
        promotionPeriod,
      },
      lastWinnerPayload: null
    }
  }

  private async createEmptyPromotionPeriod(promotionPeriodIndex: number, config: GovernanceConfig): Promise<PromotionPeriod> {
    const periodStartLevel = getFirstBlockOfPeriod(promotionPeriodIndex, config.startedAtLevel, config.periodLength);
    const periodEndLevel = getLastBlockOfPeriod(promotionPeriodIndex, config.startedAtLevel, config.periodLength);
    const [
      periodStartTime,
      periodEndTime
    ] = await Promise.all([
      this.blockchainProvider.getBlockCreationTime(periodStartLevel),
      this.blockchainProvider.getBlockCreationTime(periodEndLevel)
    ]);

    return {
      happened: false,
      index: promotionPeriodIndex,
      startLevel: periodStartLevel,
      startTime: periodStartTime,
      endLevel: periodEndLevel,
      endTime: periodEndTime,
      winnerCandidate: null,
      votersBigMapId: null,
      yeaVotingPower: BigInt(0),
      nayVotingPower: BigInt(0),
      passVotingPower: BigInt(0),
      totalVotingPower: BigInt(0),
    }
  }

  private async getStateCore(
    contractAddress: string,
    currentBlockLevel: number,
    periodIndex: number,
    storage: Storage.GovernanceContractStorage,
    stateViewResult: VotingState,
    config: GovernanceConfig
  ): Promise<GovernanceState> {
    const periodType = 'proposal' in stateViewResult.period_type ? PeriodType.Proposal : PeriodType.Promotion;
    const votingContext = storage.voting_context?.Some;
    const period = votingContext?.period;

    const lastWinner = this.unpackLastWinnerPayload(stateViewResult.finished_voting, storage.last_winner);
    const [proposalPeriod, promotionPeriod] = votingContext && periodIndex.toString(10) === votingContext.period_index.toString(10) && period
      ? await this.getPeriodsFromActualStorage(contractAddress, periodIndex, periodType, period, currentBlockLevel, config)
      : await this.getPeriodsFromOutdatedStorage(periodIndex, periodType, period, currentBlockLevel, config)

    return this.createState(periodIndex, periodType, proposalPeriod, promotionPeriod, lastWinner, config);
  }

  private async getPeriodsFromActualStorage(
    contractAddress: string,
    periodIndex: number,
    periodType: PeriodType,
    period: Storage.MichelsonPeriodType,
    currentBlockLevel: number,
    config: GovernanceConfig
  ): Promise<[Storage.ProposalPeriod, Storage.PromotionPeriod | undefined]> {
    let proposalPeriod: Storage.ProposalPeriod;
    let promotionPeriod: Storage.PromotionPeriod | undefined;

    if (periodType === PeriodType.Proposal) {
      proposalPeriod = this.unpackProposalPeriod(period)
      const lastBlockOfPromotionPeriod = getLastBlockOfPeriod(periodIndex + 1, config.startedAtLevel, config.periodLength);
      const historicalToolkit = this.getToolkit(Math.min(lastBlockOfPromotionPeriod, currentBlockLevel));
      const promotionPeriodViewResult = await callGetVotingStateView(contractAddress, historicalToolkit);
      if ('promotion' in promotionPeriodViewResult.period_type) {
        const storageOfNextPromotionPeriod = await this.loadStorage(contractAddress, historicalToolkit);
        const promotionMichelsonPeriod = storageOfNextPromotionPeriod.voting_context?.Some.period;
        promotionPeriod = promotionMichelsonPeriod
          && 'promotion' in promotionMichelsonPeriod
          && promotionPeriodViewResult.period_index.eq(storageOfNextPromotionPeriod.voting_context.Some.period_index)
          ? this.unpackPromotionPeriod(promotionMichelsonPeriod)
          : this.initializePromotionPeriod(period, await this.blockchainProvider.getTotalVotingPower(lastBlockOfPromotionPeriod));
      }
    } else {
      const lastBlockOfProposalPeriod = getLastBlockOfPeriod(periodIndex - 1, config.startedAtLevel, config.periodLength);
      const historicalToolkit = this.getToolkit(lastBlockOfProposalPeriod);
      const storageOfPreviousProposalPeriod = await this.loadStorage(contractAddress, historicalToolkit);
      proposalPeriod = this.unpackProposalPeriod(storageOfPreviousProposalPeriod.voting_context?.Some.period!);
      promotionPeriod = this.unpackPromotionPeriod(period);
    }

    return [proposalPeriod, promotionPeriod];
  }

  private async getPeriodsFromOutdatedStorage(
    periodIndex: number,
    periodType: PeriodType,
    period: Storage.MichelsonPeriodType | undefined,
    currentBlockLevel: number,
    config: GovernanceConfig
  ): Promise<[Storage.ProposalPeriod, Storage.PromotionPeriod | undefined]> {
    const firstBlockOfPeriod = getFirstBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const totalVotingPower = await this.blockchainProvider.getTotalVotingPower(Math.min(firstBlockOfPeriod, currentBlockLevel));
    return (periodType === PeriodType.Proposal || !period)
      ? [this.initializeProposalPeriod(totalVotingPower), undefined]
      : [this.unpackProposalPeriod(period), this.initializePromotionPeriod(period, totalVotingPower)];
  }

  private initializeProposalPeriod(totalVotingPower: bigint): Storage.ProposalPeriod {
    return {
      upvoters_upvotes_count: null,
      upvoters_proposals: null,
      proposals: null,
      max_upvotes_voting_power: null,
      winner_candidate: null,
      total_voting_power: BigNumber(totalVotingPower.toString())
    }
  }

  private initializePromotionPeriod(period: Storage.MichelsonPeriodType, totalVotingPower: bigint): Storage.PromotionPeriod {
    if (!('proposal' in period))
      throw new Error('Not proposal period')

    const winnerCandidate = period.proposal.winner_candidate?.Some
    if (!winnerCandidate)
      throw new Error('Unable to detect winner candidate')

    return {
      winner_candidate: winnerCandidate,
      yea_voting_power: BigNumber(0),
      nay_voting_power: BigNumber(0),
      pass_voting_power: BigNumber(0),
      voters: null,
      total_voting_power: BigNumber(totalVotingPower.toString())
    }
  }

  private unpackLastWinnerPayload(
    finishedVoting: MichelsonOptional<VotingFinishedEventPayload>,
    lastWinner: MichelsonOptional<Storage.VotingWinner>
  ): NonNullable<Storage.PayloadKey> | undefined {
    const winnerPayloadFromEvent = finishedVoting?.Some.winner_proposal_payload;
    return winnerPayloadFromEvent?.Some || lastWinner?.Some?.payload
  }

  private unpackProposalPeriod(period: Storage.MichelsonPeriodType): Storage.ProposalPeriod {
    if ('proposal' in period)
      return period.proposal;

    throw new Error('Unable to find proposal period');
  }

  private unpackPromotionPeriod(period: Storage.MichelsonPeriodType): Storage.PromotionPeriod {
    if ('promotion' in period)
      return period.promotion;

    throw new Error('Unable to find promotion period');
  }

  private async createState(
    periodIndex: number,
    periodType: PeriodType,
    proposal: Storage.ProposalPeriod,
    promotion: Storage.PromotionPeriod | undefined,
    lastWinnerPayload: NonNullable<Storage.PayloadKey> | undefined,
    config: GovernanceConfig
  ): Promise<GovernanceState> {
    const proposalPeriodIndex = periodType === PeriodType.Proposal ? periodIndex : periodIndex - 1;
    const promotionPeriodIndex = periodType === PeriodType.Proposal ? periodIndex + 1 : periodIndex;

    const [
      proposalPeriod,
      promotionPeriod
    ] = await Promise.all([
      this.createProposalPeriodState(proposal, proposalPeriodIndex, config),
      promotion ? this.createPromotionPeriodState(promotion, promotionPeriodIndex, config) : this.createEmptyPromotionPeriod(promotionPeriodIndex, config)
    ]);

    return {
      votingContext: {
        periodIndex,
        periodType,
        proposalPeriod,
        promotionPeriod,
      },
      lastWinnerPayload: lastWinnerPayload ? mapPayloadKey(lastWinnerPayload) : null
    }
  }

  private async createProposalPeriodState(
    proposal: Storage.ProposalPeriod,
    periodIndex: number,
    config: GovernanceConfig
  ): Promise<ProposalPeriod> {
    const proposalPeriodStartLevel = getFirstBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const proposalPeriodEndLevel = getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const winnerCandidate = proposal.winner_candidate?.Some;

    const [
      periodStartTime,
      periodEndTime,
      proposals,
    ] = await Promise.all([
      this.blockchainProvider.getBlockCreationTime(proposalPeriodStartLevel),
      this.blockchainProvider.getBlockCreationTime(proposalPeriodEndLevel),
      this.getProposals(proposal)
    ])

    return {
      totalVotingPower: BigInt(proposal.total_voting_power.toString()),
      winnerCandidate: winnerCandidate ? mapPayloadKey(winnerCandidate) : null,
      candidateUpvotesVotingPower: proposal.max_upvotes_voting_power?.Some ? BigInt(proposal.max_upvotes_voting_power.Some.toString()) : null,
      index: periodIndex,
      startLevel: proposalPeriodStartLevel,
      startTime: periodStartTime,
      endLevel: proposalPeriodEndLevel,
      endTime: periodEndTime,
      proposals,
      upvotersBigMapId: proposal.upvoters_proposals?.toString() ?? null
    };
  }

  private async createPromotionPeriodState(
    promotion: Storage.PromotionPeriod,
    periodIndex: number,
    config: GovernanceConfig
  ): Promise<PromotionPeriod> {
    const promotionPeriodStartLevel = getFirstBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const promotionPeriodEndLevel = getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);

    const [
      periodStartTime,
      periodEndTime,
    ] = await Promise.all([
      this.blockchainProvider.getBlockCreationTime(promotionPeriodStartLevel),
      this.blockchainProvider.getBlockCreationTime(promotionPeriodEndLevel),
    ]);

    return {
      happened: true,
      index: periodIndex,
      startLevel: promotionPeriodStartLevel,
      startTime: periodStartTime,
      endLevel: promotionPeriodEndLevel,
      endTime: periodEndTime,
      totalVotingPower: BigInt(promotion.total_voting_power.toString()),
      yeaVotingPower: BigInt(promotion.yea_voting_power.toString()),
      nayVotingPower: BigInt(promotion.nay_voting_power.toString()),
      passVotingPower: BigInt(promotion.pass_voting_power.toString()),
      winnerCandidate: promotion.winner_candidate && mapPayloadKey(promotion.winner_candidate),
      votersBigMapId: promotion.voters?.toString() ?? null
    }
  }

  private async getProposals(proposalPeriod: Storage.ProposalPeriod): Promise<Proposal[]> {
    let proposals: Proposal[] = [];
    if (proposalPeriod.proposals) {
      const rawEntries = await this.blockchainProvider.getBigMapEntries<Storage.PayloadKey, Storage.Proposal>(proposalPeriod.proposals.toString());
      proposals = rawEntries.map(({ key, value }) => ({
        key: mapPayloadKey(key),
        proposer: value.proposer,
        upvotesVotingPower: BigInt(value.upvotes_voting_power.toString())
      } as Proposal));
    }

    return proposals.toSorted((a, b) => b.upvotesVotingPower > a.upvotesVotingPower ? 1 : b.upvotesVotingPower < a.upvotesVotingPower ? -1 : 0);
  }
}