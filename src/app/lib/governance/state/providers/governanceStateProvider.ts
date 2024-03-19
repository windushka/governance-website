import { GovernanceState, PeriodType, Proposal, Upvoter, Voter, VotingContext } from '../state';
import { BigMapAbstraction, ContractAbstraction, ContractProvider, TezosToolkit } from "@taquito/taquito";
import { Config as MichelsonConfig, GovernanceContractStorage, MichelsonPeriodType, PromotionPeriod, ProposalPeriod, VotingWinner, Proposal as MichelsonProposal, UpvotersProposalsKey } from "../../contract/storage";
import { VotingState } from "../../contract/views";
import BigNumber from 'bignumber.js';
import { MichelsonOptional } from "../../contract/types";
import { ApiProvider } from "../../../api/provider";
import { HistoricalRpcClient } from '@/app/lib/rpc/historicalRpcClient';
import { Baker } from '@/app/lib/api/dto';

export interface GovernanceStateProvider<T = unknown> {
  getState(contractAddress: string, blockLevel: BigNumber): Promise<GovernanceState<T>>;
}

export class RpcGovernanceStateProvider<T = unknown> implements GovernanceStateProvider<T> {
  constructor(
    private readonly rpcUrl: string,
    private readonly apiProvider: ApiProvider
  ) {

  }

  async getState(contractAddress: string, blockLevel: BigNumber): Promise<GovernanceState<T>> {
    const storage = await this.loadStorage(contractAddress, blockLevel);
    const stateViewResult = await this.callGetVotingStateView(contractAddress, blockLevel);
    return await this.getStateCore(contractAddress, storage, stateViewResult, blockLevel);
  }

  private async getContract(contractAddress: string, blockLevel: BigNumber): Promise<ContractAbstraction<ContractProvider>> {
    //TODO: optimize
    const rpcClient = new HistoricalRpcClient(this.rpcUrl, blockLevel)
    const toolkit = new TezosToolkit(rpcClient);
    return await toolkit.contract.at(contractAddress);
  }

  private async callGetVotingStateView(contractAddress: string, blockLevel: BigNumber): Promise<VotingState<T>> {
    const contract = await this.getContract(contractAddress, blockLevel);
    const view = contract.contractViews.get_voting_state();
    return await view.executeView({ viewCaller: contractAddress });
  }

  private async loadStorage(contractAddress: string, blockLevel: BigNumber): Promise<GovernanceContractStorage<T>> {
    const contract = await this.getContract(contractAddress, blockLevel);
    return contract.storage<GovernanceContractStorage<T>>();
  }


  private initializeProposalPeriod(totalVotingPower: BigNumber): ProposalPeriod<T> {
    return {
      upvoters_upvotes_count: null,
      upvoters_proposals: null,
      proposals: null,
      max_upvotes_voting_power: null,
      winner_candidate: null,
      total_voting_power: totalVotingPower
    }
  }

  private initializePromotionPeriod(period: MichelsonPeriodType<T>, totalVotingPower: BigNumber): PromotionPeriod<T> {
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

  private unpackLastWinnerPayload(lastWinner: MichelsonOptional<VotingWinner<T>>): NonNullable<T> | undefined {
    const lastWinnerData = lastWinner?.Some
    return lastWinnerData && lastWinnerData.payload;
  }

  private unpackProposalPeriod(period: MichelsonPeriodType<T>): ProposalPeriod<T> {
    if ('proposal' in period)
      return period.proposal;

    throw new Error('Unable to find proposal period')
  }
  private unpackPromotionPeriod(period: MichelsonPeriodType<T>): PromotionPeriod<T> {
    if ('promotion' in period)
      return period.promotion;

    throw new Error('Unable to find promotion period')
  }

  private getFirstBlockOfPeriod(
    periodIndex: BigNumber,
    startedAtLevel: BigNumber,
    periodLength: BigNumber
  ): BigNumber {
    return startedAtLevel.plus(periodIndex.multipliedBy(periodLength));
  }

  private getLastBlockOfPeriod(
    periodIndex: BigNumber,
    startedAtLevel: BigNumber,
    periodLength: BigNumber
  ): BigNumber {
    return this.getFirstBlockOfPeriod(periodIndex.plus(1), startedAtLevel, periodLength).minus(1);
  }

  private async getStateCore(
    contractAddress: string,
    storage: GovernanceContractStorage<T>,
    stateViewResult: VotingState<T>,
    blockLevel: BigNumber
  ): Promise<GovernanceState<T>> {
    const periodIndex = stateViewResult.period_index;
    const periodType = 'proposal' in stateViewResult.period_type ? PeriodType.Proposal : PeriodType.Promotion;
    const votingContext = storage.voting_context?.Some;
    const period = votingContext?.period;

    let proposalPeriod: ProposalPeriod<T>;
    let promotionPeriod: PromotionPeriod<T> | undefined;
    let lastWinner: NonNullable<T> | undefined;

    if (votingContext && periodIndex.eq(votingContext.period_index) && period) {
      if (periodType === PeriodType.Proposal) {
        proposalPeriod = this.unpackProposalPeriod(period)
        console.log((proposalPeriod.proposals as any as BigMapAbstraction).toString())
        console.log((proposalPeriod.proposals as any).id.toString())
      } else {
        const { started_at_level: startedAtLevel, period_length: periodLength } = storage.config;
        const lastBlockOfProposalPeriod = this.getLastBlockOfPeriod(periodIndex.minus(1), startedAtLevel, periodLength);
        const storageOfPreviousProposalPeriod = await this.loadStorage(contractAddress, lastBlockOfProposalPeriod);
        proposalPeriod = this.unpackProposalPeriod(storageOfPreviousProposalPeriod.voting_context?.Some.period!)
        promotionPeriod = this.unpackPromotionPeriod(period)
      }
      lastWinner = this.unpackLastWinnerPayload(storage.last_winner);
    } else {
      const totalVotingPower = await this.apiProvider.getTotalVotingPower();
      [proposalPeriod, promotionPeriod] = (periodType === PeriodType.Proposal || !period)
        ? [this.initializeProposalPeriod(totalVotingPower), undefined]
        : [this.unpackProposalPeriod(period), this.initializePromotionPeriod(period, totalVotingPower)];

      const winnerPayloadFromEvent = stateViewResult.finished_voting?.Some.winner_proposal_payload;
      lastWinner = winnerPayloadFromEvent?.Some
        ? winnerPayloadFromEvent.Some
        : this.unpackLastWinnerPayload(storage.last_winner);
    }

    return this.mapStorageToState(periodIndex, storage.config, proposalPeriod, promotionPeriod, lastWinner, blockLevel);
  }

  private async mapStorageToState(
    periodIndex: BigNumber,
    config: MichelsonConfig,
    proposal: ProposalPeriod<T>,
    promotion: PromotionPeriod<T> | undefined,
    lastWinnerPayload: NonNullable<T> | undefined,
    blockLevel: BigNumber
  ): Promise<GovernanceState<T>> {
    const periodType = promotion ? PeriodType.Promotion : PeriodType.Proposal;

    const proposalPeriodIndex = periodType === PeriodType.Proposal ? periodIndex : periodIndex.minus(1);
    const proposalPeriodStartLevel = this.getFirstBlockOfPeriod(proposalPeriodIndex, config.started_at_level, config.period_length);
    const proposalPeriodEndLevel = this.getLastBlockOfPeriod(proposalPeriodIndex, config.started_at_level, config.period_length);
    const proposalPeriodBakers = await this.apiProvider.getBakers(BigNumber.min(proposalPeriodEndLevel, blockLevel));
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
    let votingContextBase = {
      periodIndex,
      proposalPeriod
    }
    let votingContext: VotingContext<T>;
    if (periodType === PeriodType.Proposal) {
      votingContext = {
        ...votingContextBase,
        periodType,
        promotionPeriod: undefined,
      }
    } else {
      const promotionPeriodIndex = periodIndex;
      const promotionPeriodStartLevel = this.getFirstBlockOfPeriod(promotionPeriodIndex, config.started_at_level, config.period_length);
      const promotionPeriodEndLevel = this.getLastBlockOfPeriod(promotionPeriodIndex, config.started_at_level, config.period_length);
      const promotionPeriodBakers = await this.apiProvider.getBakers(BigNumber.min(promotionPeriodEndLevel, blockLevel));
      const promotionPeriodBakersMap = new Map(promotionPeriodBakers.map(b => [b.address, b]));

      votingContext = {
        ...votingContextBase,
        periodType,
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

  private async getProposals(proposalPeriod: ProposalPeriod): Promise<Proposal<T>[]> {
    let proposals: Proposal<T>[] = [];
    if (proposalPeriod.proposals) {
      const rawEntries = await this.apiProvider.getBigMapEntries<T, MichelsonProposal>(BigNumber(proposalPeriod.proposals.toString()));
      proposals = rawEntries.map(({ key, value }) => ({
        key: key,
        proposer: value.proposer,
        upvotesVotingPower: BigNumber(value.upvotes_voting_power)
      }));
    }

    return proposals;
  }

  private async getUpvoters(proposalPeriod: ProposalPeriod, bakers: Map<Baker['address'], Baker>): Promise<Upvoter<T>[]> {
    let upvoters: Upvoter<T>[] = [];
    if (proposalPeriod.upvoters_proposals) {
      const rawEntries = await this.apiProvider.getBigMapEntries<UpvotersProposalsKey<T>, never>(BigNumber(proposalPeriod.upvoters_proposals.toString()));
      upvoters = rawEntries.map(({ key }) => ({
        address: key.key_hash,
        proposalKey: key.bytes, //TODO:
        votingPower: bakers.get(key.key_hash)!.votingPower
      } as Upvoter<T>));
    }

    return upvoters;
  }

  private async getVoters(promotionPeriod: PromotionPeriod, bakers: Map<Baker['address'], Baker>): Promise<Voter[]> {
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