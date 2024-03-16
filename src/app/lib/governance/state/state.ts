import BigNumber from 'bignumber.js';

export enum PeriodType {
    Proposal = 'Proposal',
    Promotion = 'Promotion'
} 

export interface Proposal {
  readonly proposer: string;
  readonly upvotesVotingPower: BigNumber;
}

export interface ProposalPeriodBase<T> {
  readonly periodIndex: BigNumber;
  readonly periodStartLevel: BigNumber;
  readonly periodEndLevel: BigNumber;
  readonly proposals: Map<T, Proposal>;
  readonly upvoters: Map<string, BigNumber>;
  readonly totalVotingPower: BigNumber;
}

export interface ActiveProposalPeriod<T = unknown> extends ProposalPeriodBase<T> {
  readonly winnerCandidate: NonNullable<T> | undefined;
}

export interface FinishedProposalPeriod<T = unknown> extends ProposalPeriodBase<T> {
  readonly winnerCandidate: NonNullable<T>;
}

export interface PromotionPeriod<T = unknown> {
  readonly periodIndex: BigNumber;
  readonly periodStartLevel: BigNumber;
  readonly periodEndLevel: BigNumber;
  readonly winnerCandidate: T;
  readonly voters: Map<string, BigNumber>;
  readonly yeaVotingPower: BigNumber;
  readonly nayVotingPower: BigNumber;
  readonly passVotingPower: BigNumber;
  readonly totalVotingPower: BigNumber;
}

export interface VotingContextBase {
    readonly periodIndex: BigNumber;
}

export interface ProposalVotingContext<T = unknown> extends VotingContextBase {
    readonly periodType: PeriodType.Proposal;
    readonly proposalPeriod: ActiveProposalPeriod<T>;
    readonly promotionPeriod: undefined;
}

export interface PromotionVotingContext<T = unknown> extends VotingContextBase {
    readonly periodType: PeriodType.Promotion;
    readonly proposalPeriod: FinishedProposalPeriod<T>;
    readonly promotionPeriod: PromotionPeriod<T>;
}

export type VotingContext<T> = ProposalVotingContext<T> | PromotionVotingContext<T> 

export interface GovernanceState<T = unknown> {
    readonly votingContext: VotingContext<T>;
    readonly lastWinnerPayload: NonNullable<T> | undefined;
}

export interface GovernanceConfig {
    readonly name: string;
    readonly description: string;
    readonly type: string; //TODO: enum
    readonly startedAtLevel: BigNumber;
    readonly periodLength: BigNumber;
    readonly adoptionPeriodSec?: BigNumber;
    readonly upvotingLimit: BigNumber;
    readonly proposersGovernanceContract: string | undefined;
    readonly scale: BigNumber; //TODO: remove and use precalculated quorum and supermajority
    readonly proposalQuorum: BigNumber;
    readonly promotionQuorum: BigNumber;
    readonly promotionSupermajority: BigNumber;
}