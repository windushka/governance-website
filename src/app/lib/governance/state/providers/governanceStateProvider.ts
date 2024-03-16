import { ActiveProposalPeriod, FinishedProposalPeriod, GovernanceState, PeriodType, Proposal, ProposalPeriodBase, VotingContext } from '../state';
import { BigMapAbstraction, ContractAbstraction, ContractProvider, TezosToolkit } from "@taquito/taquito";
import { Config, GovernanceContractStorage, MichelsonPeriodType, PromotionPeriod, ProposalPeriod, VotingWinner, Proposal as MichelsonProposal } from "../../contract/storage";
import { VotingState } from "../../contract/views";
import BigNumber from 'bignumber.js';
import { MichelsonOptional } from "../../contract/types";
import { ApiProvider } from "../../../api/provider";
import { HistoricalRpcClient } from '@/app/lib/rpc/historicalRpcClient';

export interface GovernanceStateProvider<T = unknown> {
  getState(blockLevel: BigNumber): Promise<GovernanceState<T>>;
}

export class RpcGovernanceStateProvider<T = unknown> implements GovernanceStateProvider<T> {
  constructor(
    private readonly contractAddress: string,
    private readonly rpcUrl: string,
    private readonly apiProvider: ApiProvider
  ) {

  }

  async getState(blockLevel: BigNumber): Promise<GovernanceState<T>> {
    const storage = await this.loadStorage(blockLevel);
    const stateViewResult = await this.callGetVotingStateView(blockLevel);
    return await this.getStateCore(storage, stateViewResult);
  }

  private async getContract(blockLevel: BigNumber): Promise<ContractAbstraction<ContractProvider>> {
    //TODO: optimize
    const rpcClient = new HistoricalRpcClient(this.rpcUrl, blockLevel)
    const toolkit = new TezosToolkit(rpcClient);
    return await toolkit.contract.at(this.contractAddress);
  }

  private async callGetVotingStateView(blockLevel: BigNumber): Promise<VotingState<T>> {
    const contract = await this.getContract(blockLevel);
    const view = contract.contractViews.get_voting_state();
    return await view.executeView({ viewCaller: this.contractAddress });
  }

  private async loadStorage(blockLevel: BigNumber): Promise<GovernanceContractStorage<T>> {
    const contract = await this.getContract(blockLevel);
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
    storage: GovernanceContractStorage<T>,
    stateViewResult: VotingState<T>
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
        const storageOfPreviousProposalPeriod = await this.loadStorage(lastBlockOfProposalPeriod);
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

    return this.mapStorageToState(periodIndex, storage.config, proposalPeriod, promotionPeriod, lastWinner);
  }

  private async mapStorageToState(
    periodIndex: BigNumber,
    config: Config,
    proposal: ProposalPeriod<T>,
    promotion: PromotionPeriod<T> | undefined,
    lastWinnerPayload: NonNullable<T> | undefined
  ): Promise<GovernanceState<T>> {
    const periodType = promotion ? PeriodType.Promotion : PeriodType.Proposal;

    let proposals: Map<T, Proposal> = new Map();
    if (proposal.proposals) {
      const rawEntries = await this.apiProvider.getBigMapEntries<T, MichelsonProposal>(BigNumber(proposal.proposals.toString()));
      const entries: Array<[T, Proposal]> = rawEntries.map(({ key, value }) => [
        key,
        {
          proposer: value.proposer,
          upvotesVotingPower: value.upvotes_voting_power
        }
      ]);
      proposals = new Map(entries)
    }

    const proposalPeriodIndex = periodType === PeriodType.Proposal ? periodIndex : periodIndex.minus(1);
    let upvoters: Map<string, BigNumber> = new Map();
    const proposalPeriod = {
      totalVotingPower: proposal.total_voting_power,
      winnerCandidate: proposal.winner_candidate?.Some!,
      periodIndex: proposalPeriodIndex,
      periodStartLevel: this.getFirstBlockOfPeriod(proposalPeriodIndex, config.started_at_level, config.period_length),
      periodEndLevel: this.getLastBlockOfPeriod(proposalPeriodIndex, config.started_at_level, config.period_length),
      proposals,
      upvoters
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
      votingContext = {
        ...votingContextBase,
        periodType,
        promotionPeriod: {
          periodIndex: promotionPeriodIndex,
          periodStartLevel: this.getFirstBlockOfPeriod(promotionPeriodIndex, config.started_at_level, config.period_length),
          periodEndLevel: this.getLastBlockOfPeriod(promotionPeriodIndex, config.started_at_level, config.period_length),
          totalVotingPower: promotion!.total_voting_power,
          yeaVotingPower: promotion!.yea_voting_power,
          nayVotingPower: promotion!.nay_voting_power,
          passVotingPower: promotion!.pass_voting_power,
          winnerCandidate: promotion!.winner_candidate,
          voters: new Map(), //TODO: fill
        }
      }
    }

    return {
      votingContext,
      lastWinnerPayload
    }
  }
}