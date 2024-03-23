import { GovernanceState, PeriodType, Proposal, Upvoter, Voter, VotingContext } from '../state';
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

export class RpcGovernanceStateProvider<T = unknown> implements GovernanceStateProvider<T> {
  constructor(
    private readonly rpcUrl: string,
    private readonly apiProvider: ApiProvider
  ) {

  }

  async getState(contractAddress: string, config: GovernanceConfig, periodIndex: BigNumber): Promise<GovernanceState<T>> {
    const currentBlockLevel = BigNumber((await this.getToolkit().rpc.getBlockHeader()).level);
    const blockLevel = BigNumber.min(getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength), currentBlockLevel);
    const originatedAtLevel = await this.apiProvider.getContractOriginationLevel(contractAddress);
    if (blockLevel.lte(originatedAtLevel))
      return await this.getEmptyGovernanceState(periodIndex, config);

    const toolkit = this.getToolkit(blockLevel);
    const storage = await this.loadStorage(contractAddress, toolkit);
    const stateViewResult = await this.callGetVotingStateView(contractAddress, toolkit);
    return await this.getStateCore(contractAddress, periodIndex, storage, stateViewResult, currentBlockLevel);
  }

  private getToolkit(blockLevel?: BigNumber): TezosToolkit {
    return new TezosToolkit(blockLevel ? new HistoricalRpcClient(this.rpcUrl, blockLevel) : this.rpcUrl);
  }

  private async callGetVotingStateView(contractAddress: string, toolkit: TezosToolkit): Promise<VotingState<T>> {
    const contract = await toolkit.contract.at(contractAddress);
    const view = contract.contractViews.get_voting_state();
    return await view.executeView({ viewCaller: contractAddress });
  }

  private async loadStorage(contractAddress: string, toolkit: TezosToolkit): Promise<Storage.GovernanceContractStorage<T>> {
    const contract = await toolkit.contract.at(contractAddress);
    return contract.storage<Storage.GovernanceContractStorage<T>>();
  }

  private initializeProposalPeriod(totalVotingPower: BigNumber): Storage.ProposalPeriod<T> {
    return {
      upvoters_upvotes_count: null,
      upvoters_proposals: null,
      proposals: null,
      max_upvotes_voting_power: null,
      winner_candidate: null,
      total_voting_power: totalVotingPower
    }
  }

  private initializePromotionPeriod(period: Storage.MichelsonPeriodType<T>, totalVotingPower: BigNumber): Storage.PromotionPeriod<T> {
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

  private async getEmptyGovernanceState(periodIndex: BigNumber, config: GovernanceConfig): Promise<GovernanceState<T>> {
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

  private unpackLastWinnerPayload(lastWinner: MichelsonOptional<Storage.VotingWinner<T>>): NonNullable<T> | undefined {
    const lastWinnerData = lastWinner?.Some
    return lastWinnerData && lastWinnerData.payload;
  }

  private unpackProposalPeriod(period: Storage.MichelsonPeriodType<T>): Storage.ProposalPeriod<T> {
    if ('proposal' in period)
      return period.proposal;

    throw new Error('Unable to find proposal period')
  }
  private unpackPromotionPeriod(period: Storage.MichelsonPeriodType<T>): Storage.PromotionPeriod<T> {
    if ('promotion' in period)
      return period.promotion;

    throw new Error('Unable to find promotion period')
  }

  private async getStateCore(
    contractAddress: string,
    periodIndex: BigNumber,
    storage: Storage.GovernanceContractStorage<T>,
    stateViewResult: VotingState<T>,
    currentBlockLevel: BigNumber,
  ): Promise<GovernanceState<T>> {
    const periodType = 'proposal' in stateViewResult.period_type ? PeriodType.Proposal : PeriodType.Promotion;
    const votingContext = storage.voting_context?.Some;
    const period = votingContext?.period;
    const { started_at_level: startedAtLevel, period_length: periodLength } = storage.config;

    let proposalPeriod: Storage.ProposalPeriod<T>;
    let promotionPeriod: Storage.PromotionPeriod<T> | undefined;
    let lastWinner: NonNullable<T> | undefined;

    if (votingContext && periodIndex.eq(votingContext.period_index) && period) {
      if (periodType === PeriodType.Proposal) {
        proposalPeriod = this.unpackProposalPeriod(period)
        const lastBlockOfPromotionPeriod = getLastBlockOfPeriod(periodIndex.plus(1), startedAtLevel, periodLength);
        const historicalToolkit = this.getToolkit(BigNumber.min(lastBlockOfPromotionPeriod, currentBlockLevel));
        const promotionPeriodViewResult = await this.callGetVotingStateView(contractAddress, historicalToolkit);
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
    proposal: Storage.ProposalPeriod<T>,
    promotion: Storage.PromotionPeriod<T> | undefined,
    lastWinnerPayload: NonNullable<T> | undefined,
    currentBlockLevel: BigNumber
  ): Promise<GovernanceState<T>> {
    const proposalPeriodIndex = periodType === PeriodType.Proposal ? periodIndex : periodIndex.minus(1);
    const proposalPeriodStartLevel = getFirstBlockOfPeriod(proposalPeriodIndex, config.started_at_level, config.period_length);
    const proposalPeriodEndLevel = getLastBlockOfPeriod(proposalPeriodIndex, config.started_at_level, config.period_length);
    const proposalPeriodBakers = await this.apiProvider.getBakers(BigNumber.min(proposalPeriodEndLevel, currentBlockLevel));
    const proposalPeriodBakersMap = new Map(proposalPeriodBakers.map(b => [b.address, b]));

    //TODO: promise all
    const proposalPeriod = {
      totalVotingPower: proposal.total_voting_power,
      winnerCandidate: proposal.winner_candidate?.Some!,
      candidateUpvotesVotingPower: proposal.max_upvotes_voting_power?.Some!,
      periodIndex: proposalPeriodIndex,
      periodStartLevel: proposalPeriodStartLevel,
      periodEndLevel: proposalPeriodEndLevel,
      proposals: await this.getProposals(proposal),
      upvoters: await this.getUpvoters(proposal, proposalPeriodBakersMap)
    };

    //TODO: refactor
    let votingContext: VotingContext<T> = {
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
          winnerCandidate: promotion!.winner_candidate,
          voters: await this.getVoters(promotion!, promotionPeriodBakersMap)
        }
      }
    }

    return {
      votingContext,
      lastWinnerPayload
    }
  }

  private async getProposals(proposalPeriod: Storage.ProposalPeriod): Promise<Proposal<T>[]> {
    let proposals: Proposal<T>[] = [];
    if (proposalPeriod.proposals) {
      const rawEntries = await this.apiProvider.getBigMapEntries<T, Storage.Proposal>(BigNumber(proposalPeriod.proposals.toString()));
      proposals = rawEntries.map(({ key, value }) => ({
        key: key,
        proposer: value.proposer,
        upvotesVotingPower: BigNumber(value.upvotes_voting_power)
      }));
    }

    return proposals.toSorted((a, b) => b.upvotesVotingPower.comparedTo(a.upvotesVotingPower));
  }

  private async getUpvoters(proposalPeriod: Storage.ProposalPeriod, bakers: Map<Baker['address'], Baker>): Promise<Upvoter<T>[]> {
    let upvoters: Upvoter<T>[] = [];
    if (proposalPeriod.upvoters_proposals) {
      const rawEntries = await this.apiProvider.getBigMapEntries<Storage.UpvotersProposalsKey<T>, never>(BigNumber(proposalPeriod.upvoters_proposals.toString()));
      upvoters = rawEntries.map(({ key }) => ({
        address: key.key_hash,
        proposalKey: key.bytes, //TODO:
        votingPower: bakers.get(key.key_hash)!.votingPower
      } as Upvoter<T>));
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