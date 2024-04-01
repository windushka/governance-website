import { GovernanceState, PeriodType, PromotionPeriod, Proposal, ProposalPeriod, Upvoter, Voter, VotingContext } from '../state';
import { TezosToolkit } from '@taquito/taquito';
import * as Storage from '../../contract/storage';
import { VotingFinishedEventPayload, VotingState } from '../../contract/views';
import BigNumber from 'bignumber.js';
import { MichelsonOptional } from '../../contract/types';
import { BlockchainProvider, Baker } from '../../../blockchain';
import { GovernanceConfig } from '../../config/config';
import { getFirstBlockOfPeriod, getLastBlockOfPeriod, min, callGetVotingStateView, mapPayloadKey } from '../../utils';
import { GovernanceStateProvider } from './provider';
import { HistoricalRpcClient } from '@/app/lib/rpc/historicalRpcClient';

export class RpcGovernanceStateProvider implements GovernanceStateProvider {
  constructor(
    private readonly rpcUrl: string,
    private readonly blockchainProvider: BlockchainProvider
  ) { }

  async getState(contractAddress: string, config: GovernanceConfig, periodIndex: bigint): Promise<GovernanceState> {
    const currentBlockLevel = await this.blockchainProvider.getCurrentBlockLevel();
    const blockLevel = min(getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength), currentBlockLevel);
    const originatedAtLevel = await this.blockchainProvider.getContractOriginationLevel(contractAddress);
    if (blockLevel <= originatedAtLevel)
      return await this.getEmptyGovernanceState(periodIndex, config);

    const toolkit = this.getToolkit(blockLevel);
    const [storage, stateViewResult] = await Promise.all([
      this.loadStorage(contractAddress, toolkit),
      callGetVotingStateView(contractAddress, toolkit)
    ]);
    return await this.getStateCore(contractAddress, currentBlockLevel, periodIndex, storage, stateViewResult, config);
  }

  private getToolkit(blockLevel?: bigint): TezosToolkit {
    return new TezosToolkit(blockLevel ? new HistoricalRpcClient(this.rpcUrl, blockLevel) : this.rpcUrl);
  }

  private async loadStorage(contractAddress: string, toolkit: TezosToolkit): Promise<Storage.GovernanceContractStorage> {
    const contract = await toolkit.contract.at(contractAddress);
    return contract.storage<Storage.GovernanceContractStorage>();
  }

  private async getEmptyGovernanceState(periodIndex: bigint, config: GovernanceConfig): Promise<GovernanceState> {
    const periodStartLevel = getFirstBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const periodEndLevel = getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const [periodStartTime, periodEndTime, totalVotingPower] = await Promise.all([
      this.blockchainProvider.getBlockCreationTime(periodStartLevel),
      this.blockchainProvider.getBlockCreationTime(periodEndLevel),
      this.blockchainProvider.getTotalVotingPower(periodStartLevel)
    ])

    return {
      votingContext: {
        periodIndex: periodIndex,
        periodType: PeriodType.Proposal,
        proposalPeriod: {
          index: periodIndex,
          startLevel: periodStartLevel,
          startTime: periodStartTime,
          endLevel: periodEndLevel,
          endTime: periodEndTime,
          totalVotingPower,
          proposals: [],
          upvoters: [],
          winnerCandidate: undefined,
          candidateUpvotesVotingPower: undefined,
        },
        promotionPeriod: undefined,
      },
      lastWinnerPayload: undefined
    }
  }

  private async getStateCore(
    contractAddress: string,
    currentBlockLevel: bigint,
    periodIndex: bigint,
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

    return this.createState(contractAddress, periodIndex, periodType, proposalPeriod, promotionPeriod, lastWinner, currentBlockLevel, config);
  }

  private async getPeriodsFromActualStorage(
    contractAddress: string,
    periodIndex: bigint,
    periodType: PeriodType,
    period: Storage.MichelsonPeriodType,
    currentBlockLevel: bigint,
    config: GovernanceConfig
  ): Promise<[Storage.ProposalPeriod, Storage.PromotionPeriod | undefined]> {
    let proposalPeriod: Storage.ProposalPeriod;
    let promotionPeriod: Storage.PromotionPeriod | undefined;

    if (periodType === PeriodType.Proposal) {
      proposalPeriod = this.unpackProposalPeriod(period)
      const lastBlockOfPromotionPeriod = getLastBlockOfPeriod(periodIndex + BigInt(1), config.startedAtLevel, config.periodLength);
      const historicalToolkit = this.getToolkit(min(lastBlockOfPromotionPeriod, currentBlockLevel));
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
      const lastBlockOfProposalPeriod = getLastBlockOfPeriod(periodIndex - BigInt(1), config.startedAtLevel, config.periodLength);
      const historicalToolkit = this.getToolkit(lastBlockOfProposalPeriod);
      const storageOfPreviousProposalPeriod = await this.loadStorage(contractAddress, historicalToolkit);
      proposalPeriod = this.unpackProposalPeriod(storageOfPreviousProposalPeriod.voting_context?.Some.period!);
      promotionPeriod = this.unpackPromotionPeriod(period);
    }

    return [proposalPeriod, promotionPeriod];
  }

  private async getPeriodsFromOutdatedStorage(
    periodIndex: bigint,
    periodType: PeriodType,
    period: Storage.MichelsonPeriodType | undefined,
    currentBlockLevel: bigint,
    config: GovernanceConfig
  ): Promise<[Storage.ProposalPeriod, Storage.PromotionPeriod | undefined]> {
    const firstBlockOfPeriod = getFirstBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const totalVotingPower = await this.blockchainProvider.getTotalVotingPower(min(firstBlockOfPeriod, currentBlockLevel));
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
    contractAddress: string,
    periodIndex: bigint,
    periodType: PeriodType,
    proposal: Storage.ProposalPeriod,
    promotion: Storage.PromotionPeriod | undefined,
    lastWinnerPayload: NonNullable<Storage.PayloadKey> | undefined,
    currentBlockLevel: bigint,
    config: GovernanceConfig
  ): Promise<GovernanceState> {
    const [
      proposalPeriod,
      promotionPeriod
    ] = await Promise.all([
      this.createProposalPeriodState(contractAddress, proposal, periodIndex, periodType, currentBlockLevel, config),
      promotion && await this.createPromotionPeriodState(contractAddress, promotion, periodIndex, periodType, currentBlockLevel, config)
    ]);

    return {
      votingContext: {
        periodIndex,
        periodType,
        proposalPeriod,
        promotionPeriod,
      },
      lastWinnerPayload: lastWinnerPayload && mapPayloadKey(lastWinnerPayload)
    }
  }

  private async createProposalPeriodState(
    contractAddress: string,
    proposal: Storage.ProposalPeriod,
    periodIndex: bigint,
    periodType: PeriodType,
    currentBlockLevel: bigint,
    config: GovernanceConfig
  ): Promise<ProposalPeriod> {
    const proposalPeriodIndex = periodType === PeriodType.Proposal ? periodIndex : periodIndex - BigInt(1);
    const proposalPeriodStartLevel = getFirstBlockOfPeriod(proposalPeriodIndex, config.startedAtLevel, config.periodLength);
    const proposalPeriodEndLevel = getLastBlockOfPeriod(proposalPeriodIndex, config.startedAtLevel, config.periodLength);
    const winnerCandidate = proposal.winner_candidate?.Some;

    const [
      periodStartTime,
      periodEndTime,
      proposalPeriodBakers,
      proposals,
    ] = await Promise.all([
      this.blockchainProvider.getBlockCreationTime(proposalPeriodStartLevel),
      this.blockchainProvider.getBlockCreationTime(proposalPeriodEndLevel),
      this.blockchainProvider.getBakers(min(proposalPeriodEndLevel, currentBlockLevel)),
      this.getProposals(proposal)
    ])

    const proposalPeriodBakersMap = new Map(proposalPeriodBakers.map(b => [b.address, b]));

    return {
      totalVotingPower: BigInt(proposal.total_voting_power.toString()),
      winnerCandidate: winnerCandidate && mapPayloadKey(winnerCandidate),
      candidateUpvotesVotingPower: proposal.max_upvotes_voting_power?.Some && BigInt(proposal.max_upvotes_voting_power.Some.toString()),
      index: proposalPeriodIndex,
      startLevel: proposalPeriodStartLevel,
      startTime: periodStartTime,
      endLevel: proposalPeriodEndLevel,
      endTime: periodEndTime,
      proposals,
      upvoters: await this.getUpvoters(contractAddress, proposal, proposalPeriodBakersMap, proposalPeriodStartLevel, proposalPeriodEndLevel)
    };
  }

  private async createPromotionPeriodState(
    contractAddress: string,
    promotion: Storage.PromotionPeriod,
    periodIndex: bigint,
    periodType: PeriodType,
    currentBlockLevel: bigint,
    config: GovernanceConfig
  ): Promise<PromotionPeriod> {
    const promotionPeriodIndex = periodType === PeriodType.Proposal ? periodIndex + BigInt(1) : periodIndex;
    const promotionPeriodStartLevel = getFirstBlockOfPeriod(promotionPeriodIndex, config.startedAtLevel, config.periodLength);
    const promotionPeriodEndLevel = getLastBlockOfPeriod(promotionPeriodIndex, config.startedAtLevel, config.periodLength);

    const [
      periodStartTime,
      periodEndTime,
      promotionPeriodBakers
    ] = await Promise.all([
      this.blockchainProvider.getBlockCreationTime(promotionPeriodStartLevel),
      this.blockchainProvider.getBlockCreationTime(promotionPeriodEndLevel),
      this.blockchainProvider.getBakers(min(promotionPeriodEndLevel, currentBlockLevel))
    ]);

    const promotionPeriodBakersMap = new Map(promotionPeriodBakers.map(b => [b.address, b]));

    return {
      index: promotionPeriodIndex,
      startLevel: promotionPeriodStartLevel,
      startTime: periodStartTime,
      endLevel: promotionPeriodEndLevel,
      endTime: periodEndTime,
      totalVotingPower: BigInt(promotion.total_voting_power.toString()),
      yeaVotingPower: BigInt(promotion.yea_voting_power.toString()),
      nayVotingPower: BigInt(promotion.nay_voting_power.toString()),
      passVotingPower: BigInt(promotion.pass_voting_power.toString()),
      winnerCandidate: promotion.winner_candidate && mapPayloadKey(promotion.winner_candidate),
      voters: await this.getVoters(contractAddress, promotion, promotionPeriodBakersMap, promotionPeriodStartLevel, promotionPeriodEndLevel)
    }
  }

  private async getProposals(proposalPeriod: Storage.ProposalPeriod): Promise<Proposal[]> {
    let proposals: Proposal[] = [];
    if (proposalPeriod.proposals) {
      const rawEntries = await this.blockchainProvider.getBigMapEntries<Storage.PayloadKey, Storage.Proposal>(BigInt(proposalPeriod.proposals.toString()));
      proposals = rawEntries.map(({ key, value }) => ({
        key: mapPayloadKey(key),
        proposer: value.proposer,
        upvotesVotingPower: BigInt(value.upvotes_voting_power.toString())
      } as Proposal));
    }

    return proposals.toSorted((a, b) => b.upvotesVotingPower > a.upvotesVotingPower ? 1 : b.upvotesVotingPower < a.upvotesVotingPower ? -1 : 0);
  }

  private async getUpvoters(
    contractAddress: string,
    proposalPeriod: Storage.ProposalPeriod, bakers: Map<Baker['address'], Baker>,
    periodStartLevel: bigint,
    periodEndLevel: bigint
  ): Promise<Upvoter[]> {
    let upvoters: Upvoter[] = [];
    if (proposalPeriod.upvoters_proposals) {
      const [
        rawEntries,
        operations
      ] = await Promise.all([
        this.blockchainProvider.getBigMapEntries<Storage.UpvotersProposalsKey, never>(BigInt(proposalPeriod.upvoters_proposals.toString())),
        this.blockchainProvider.getContractOperations(contractAddress, ['new_proposal', 'upvote_proposal'], periodStartLevel, periodEndLevel)
      ])
      const operationsMap = new Map(operations.map(o => [o.sender.address, o]));

      upvoters = rawEntries.map(({ key }) => {
        const operation = operationsMap.get(key.key_hash);
        const baker = bakers.get(key.key_hash);
        return {
          address: key.key_hash,
          alias: baker!.alias,
          proposalKey: 'bytes' in key ? key.bytes : mapPayloadKey(key),
          votingPower: baker!.votingPower,
          operationHash: operation!.hash,
          operationTime: operation!.time
        } as Upvoter
      });
    }

    return upvoters;
  }

  private async getVoters(
    contractAddress: string,
    promotionPeriod: Storage.PromotionPeriod,
    bakers: Map<Baker['address'], Baker>,
    periodStartLevel: bigint,
    periodEndLevel: bigint
  ): Promise<Voter[]> {
    let voters: Voter[] = [];
    if (promotionPeriod.voters) {
      const [
        rawEntries,
        operations
      ] = await Promise.all([
        this.blockchainProvider.getBigMapEntries<string, string>(BigInt(promotionPeriod.voters.toString())),
        this.blockchainProvider.getContractOperations(contractAddress, ['vote'], periodStartLevel, periodEndLevel)
      ])
      const operationsMap = new Map(operations.map(o => [o.sender.address, o]));
      voters = rawEntries.map(({ key, value }) => {
        const operation = operationsMap.get(key);
        const baker = bakers.get(key);
        return {
          address: key,
          alias: baker!.alias,
          vote: value,
          votingPower: baker!.votingPower,
          operationHash: operation!.hash,
          operationTime: operation!.time
        } as Voter
      });
    }

    return voters;
  }
}