import { GovernanceState, PeriodType, Proposal, ProposalPeriod, Upvoter, Voter, VotingContext } from '../state';
import { TezosToolkit } from '@taquito/taquito';
import * as Storage from '../../contract/storage';
import { VotingState } from '../../contract/views';
import BigNumber from 'bignumber.js';
import { MichelsonOptional } from '../../contract/types';
import { ApiProvider } from '../../../api/providers/provider';
import { Baker } from '@/app/lib/api/dto';
import { GovernanceConfig } from '../../config/config';
import { getFirstBlockOfPeriod, getLastBlockOfPeriod } from '../../utils/calculators';
import { GovernanceStateProvider } from './provider';
import { HistoricalRpcClient } from '@/app/lib/rpc/historicalRpcClient';
import { callGetVotingStateView, mapPayloadKey } from '../../utils';

export class RpcGovernanceStateProvider implements GovernanceStateProvider {
  constructor(
    private readonly rpcUrl: string,
    private readonly apiProvider: ApiProvider
  ) { }

  async getState(contractAddress: string, config: GovernanceConfig, periodIndex: BigNumber): Promise<GovernanceState> {
    const currentBlockLevel = BigNumber((await this.getToolkit().rpc.getBlockHeader()).level);
    const blockLevel = BigNumber.min(getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength), currentBlockLevel);
    const originatedAtLevel = await this.apiProvider.getContractOriginationLevel(contractAddress);
    if (blockLevel.lte(originatedAtLevel))
      return await this.getEmptyGovernanceState(periodIndex, config);

    const toolkit = this.getToolkit(blockLevel);
    const storage = await this.loadStorage(contractAddress, toolkit);
    const stateViewResult = await callGetVotingStateView(contractAddress, toolkit);
    return await this.getStateCore(contractAddress, periodIndex, storage, stateViewResult, currentBlockLevel);
  }

  private getToolkit(blockLevel?: BigNumber): TezosToolkit {
    return new TezosToolkit(blockLevel ? new HistoricalRpcClient(this.rpcUrl, blockLevel) : this.rpcUrl);
  }

  private async loadStorage(contractAddress: string, toolkit: TezosToolkit): Promise<Storage.GovernanceContractStorage> {
    const contract = await toolkit.contract.at(contractAddress);
    return contract.storage<Storage.GovernanceContractStorage>();
  }

  private initializeProposalPeriod(totalVotingPower: BigNumber): Storage.ProposalPeriod {
    return {
      upvoters_upvotes_count: null,
      upvoters_proposals: null,
      proposals: null,
      max_upvotes_voting_power: null,
      winner_candidate: null,
      total_voting_power: totalVotingPower
    }
  }

  private initializePromotionPeriod(period: Storage.MichelsonPeriodType, totalVotingPower: BigNumber): Storage.PromotionPeriod {
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
      total_voting_power: totalVotingPower
    }
  }

  private async getEmptyGovernanceState(periodIndex: BigNumber, config: GovernanceConfig): Promise<GovernanceState> {
    const periodStartLevel = getFirstBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const periodEndLevel = getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const totalVotingPower = await this.apiProvider.getTotalVotingPower(periodStartLevel)

    return {
      votingContext: {
        periodIndex: periodIndex,
        periodType: PeriodType.Proposal,
        proposalPeriod: {
          periodIndex,
          periodStartLevel,
          periodEndLevel,
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

  private unpackLastWinnerPayload(lastWinner: MichelsonOptional<Storage.VotingWinner>): NonNullable<Storage.PayloadKey> | undefined {
    const lastWinnerData = lastWinner?.Some
    return lastWinnerData && lastWinnerData.payload;
  }

  private unpackProposalPeriod(period: Storage.MichelsonPeriodType): Storage.ProposalPeriod {
    if ('proposal' in period)
      return period.proposal;

    throw new Error('Unable to find proposal period')
  }
  private unpackPromotionPeriod(period: Storage.MichelsonPeriodType): Storage.PromotionPeriod {
    if ('promotion' in period)
      return period.promotion;

    throw new Error('Unable to find promotion period')
  }

  private async getStateCore(
    contractAddress: string,
    periodIndex: BigNumber,
    storage: Storage.GovernanceContractStorage,
    stateViewResult: VotingState,
    currentBlockLevel: BigNumber,
  ): Promise<GovernanceState> {
    const periodType = 'proposal' in stateViewResult.period_type ? PeriodType.Proposal : PeriodType.Promotion;
    const votingContext = storage.voting_context?.Some;
    const period = votingContext?.period;
    const { started_at_level: startedAtLevel, period_length: periodLength } = storage.config;

    let proposalPeriod: Storage.ProposalPeriod;
    let promotionPeriod: Storage.PromotionPeriod | undefined;
    let lastWinner: NonNullable<Storage.PayloadKey> | undefined;

    if (votingContext && periodIndex.eq(votingContext.period_index) && period) {
      if (periodType === PeriodType.Proposal) {
        proposalPeriod = this.unpackProposalPeriod(period)
        const lastBlockOfPromotionPeriod = getLastBlockOfPeriod(periodIndex.plus(1), startedAtLevel, periodLength);
        const historicalToolkit = this.getToolkit(BigNumber.min(lastBlockOfPromotionPeriod, currentBlockLevel));
        const promotionPeriodViewResult = await callGetVotingStateView(contractAddress, historicalToolkit);
        if ('promotion' in promotionPeriodViewResult.period_type) {
          const storageOfNextPromotionPeriod = await this.loadStorage(contractAddress, historicalToolkit);
          const promotionMichelsonPeriod = storageOfNextPromotionPeriod.voting_context?.Some.period;
          promotionPeriod = promotionMichelsonPeriod
            && 'promotion' in promotionMichelsonPeriod
            && promotionPeriodViewResult.period_index.eq(storageOfNextPromotionPeriod.voting_context.Some.period_index)
            ? this.unpackPromotionPeriod(promotionMichelsonPeriod)
            : this.initializePromotionPeriod(period, await this.apiProvider.getTotalVotingPower(lastBlockOfPromotionPeriod));
        }
      } else {
        const lastBlockOfProposalPeriod = getLastBlockOfPeriod(periodIndex.minus(1), startedAtLevel, periodLength);
        const historicalToolkit = this.getToolkit(lastBlockOfProposalPeriod);
        const storageOfPreviousProposalPeriod = await this.loadStorage(contractAddress, historicalToolkit);
        proposalPeriod = this.unpackProposalPeriod(storageOfPreviousProposalPeriod.voting_context?.Some.period!)
        promotionPeriod = this.unpackPromotionPeriod(period)
      }
      lastWinner = this.unpackLastWinnerPayload(storage.last_winner);
    } else {
      const firstBlockOfPeriod = getFirstBlockOfPeriod(periodIndex, startedAtLevel, periodLength);
      const totalVotingPower = await this.apiProvider.getTotalVotingPower(BigNumber.min(firstBlockOfPeriod, currentBlockLevel));
      [proposalPeriod, promotionPeriod] = (periodType === PeriodType.Proposal || !period)
        ? [this.initializeProposalPeriod(totalVotingPower), undefined]
        : [this.unpackProposalPeriod(period), this.initializePromotionPeriod(period, totalVotingPower)];

      const winnerPayloadFromEvent = stateViewResult.finished_voting?.Some.winner_proposal_payload;
      lastWinner = winnerPayloadFromEvent?.Some
        ? winnerPayloadFromEvent.Some
        : this.unpackLastWinnerPayload(storage.last_winner);
    }

    return this.mapStorageToState(periodIndex, periodType, storage.config, proposalPeriod, promotionPeriod, lastWinner, currentBlockLevel);
  }

  private async mapStorageToState(
    periodIndex: BigNumber,
    periodType: PeriodType,
    config: Storage.Config,
    proposal: Storage.ProposalPeriod,
    promotion: Storage.PromotionPeriod | undefined,
    lastWinnerPayload: NonNullable<Storage.PayloadKey> | undefined,
    currentBlockLevel: BigNumber
  ): Promise<GovernanceState> {
    const proposalPeriodIndex = periodType === PeriodType.Proposal ? periodIndex : periodIndex.minus(1);
    const proposalPeriodStartLevel = getFirstBlockOfPeriod(proposalPeriodIndex, config.started_at_level, config.period_length);
    const proposalPeriodEndLevel = getLastBlockOfPeriod(proposalPeriodIndex, config.started_at_level, config.period_length);
    const proposalPeriodBakers = await this.apiProvider.getBakers(BigNumber.min(proposalPeriodEndLevel, currentBlockLevel));
    const proposalPeriodBakersMap = new Map(proposalPeriodBakers.map(b => [b.address, b]));

    const winnerCandidate = proposal.winner_candidate?.Some;

    //TODO: promise all
    const proposalPeriod = {
      totalVotingPower: proposal.total_voting_power,
      winnerCandidate: winnerCandidate && mapPayloadKey(winnerCandidate),
      candidateUpvotesVotingPower: proposal.max_upvotes_voting_power?.Some!,
      periodIndex: proposalPeriodIndex,
      periodStartLevel: proposalPeriodStartLevel,
      periodEndLevel: proposalPeriodEndLevel,
      proposals: await this.getProposals(proposal),
      upvoters: await this.getUpvoters(proposal, proposalPeriodBakersMap)
    } as ProposalPeriod;

    //TODO: refactor
    let votingContext: VotingContext = {
      periodIndex,
      proposalPeriod,
      periodType,
      promotionPeriod: undefined
    }

    if (promotion) {
      const promotionPeriodIndex = periodType === PeriodType.Proposal ? periodIndex.plus(1) : periodIndex;
      const promotionPeriodStartLevel = getFirstBlockOfPeriod(promotionPeriodIndex, config.started_at_level, config.period_length);
      const promotionPeriodEndLevel = getLastBlockOfPeriod(promotionPeriodIndex, config.started_at_level, config.period_length);
      const promotionPeriodBakers = await this.apiProvider.getBakers(BigNumber.min(promotionPeriodEndLevel, currentBlockLevel));
      const promotionPeriodBakersMap = new Map(promotionPeriodBakers.map(b => [b.address, b]));

      votingContext = {
        ...votingContext,
        promotionPeriod: {
          periodIndex: promotionPeriodIndex,
          periodStartLevel: promotionPeriodStartLevel,
          periodEndLevel: promotionPeriodEndLevel,
          totalVotingPower: promotion!.total_voting_power,
          yeaVotingPower: promotion!.yea_voting_power,
          nayVotingPower: promotion!.nay_voting_power,
          passVotingPower: promotion!.pass_voting_power,
          winnerCandidate: promotion!.winner_candidate && mapPayloadKey(promotion.winner_candidate),
          voters: await this.getVoters(promotion!, promotionPeriodBakersMap)
        }
      }
    }

    return {
      votingContext,
      lastWinnerPayload: lastWinnerPayload && mapPayloadKey(lastWinnerPayload)
    }
  }

  private async getProposals(proposalPeriod: Storage.ProposalPeriod): Promise<Proposal[]> {
    let proposals: Proposal[] = [];
    if (proposalPeriod.proposals) {
      const rawEntries = await this.apiProvider.getBigMapEntries<Storage.PayloadKey, Storage.Proposal>(BigNumber(proposalPeriod.proposals.toString()));
      proposals = rawEntries.map(({ key, value }) => ({
        key: mapPayloadKey(key),
        proposer: value.proposer,
        upvotesVotingPower: BigNumber(value.upvotes_voting_power)
      } as Proposal));
    }

    return proposals.toSorted((a, b) => b.upvotesVotingPower.comparedTo(a.upvotesVotingPower));
  }

  private async getUpvoters(proposalPeriod: Storage.ProposalPeriod, bakers: Map<Baker['address'], Baker>): Promise<Upvoter[]> {
    let upvoters: Upvoter[] = [];
    if (proposalPeriod.upvoters_proposals) {
      const rawEntries = await this.apiProvider.getBigMapEntries<Storage.UpvotersProposalsKey, never>(BigNumber(proposalPeriod.upvoters_proposals.toString()));
      upvoters = rawEntries.map(({ key }) => ({
        address: key.key_hash,
        proposalKey: 'bytes' in key ? key.bytes : mapPayloadKey(key),
        votingPower: bakers.get(key.key_hash)!.votingPower
      } as Upvoter));
    }

    return upvoters;
  }

  private async getVoters(promotionPeriod: Storage.PromotionPeriod, bakers: Map<Baker['address'], Baker>): Promise<Voter[]> {
    let voters: Voter[] = [];
    if (promotionPeriod.voters) {
      const rawEntries = await this.apiProvider.getBigMapEntries<string, string>(BigNumber(promotionPeriod.voters.toString()));
      voters = rawEntries.map(({ key, value }) => ({
        address: key,
        vote: value,
        votingPower: bakers.get(key)!.votingPower
      } as Voter));
    }

    return voters;
  }
}