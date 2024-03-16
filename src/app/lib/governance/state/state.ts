import BigNumber from 'bignumber.js';

export enum PeriodType {
  Proposal = 'Proposal',
  Promotion = 'Promotion'
}

export enum Vote {
  Yea = 'yea',
  Nay = 'nay',
  Pass = 'pass'
}

export enum ContractType {
  KernelGovernance,
  SequencerCommitteeGovernance
}

export interface Proposal<T = unknown> {
  readonly key: T;
  readonly proposer: string;
  readonly upvotesVotingPower: BigNumber;
}

export interface Upvoter<T> {
  readonly address: string;
  readonly proposalKey: T;
  readonly votingPower: BigNumber;
}

export interface ProposalPeriodBase<T = unknown> {
  readonly periodIndex: BigNumber;
  readonly periodStartLevel: BigNumber;
  readonly periodEndLevel: BigNumber;
  readonly proposals: Array<Proposal<T>>;
  readonly upvoters: Array<Upvoter<T>>;
  readonly totalVotingPower: BigNumber;
}

export interface ActiveProposalPeriod<T = unknown> extends ProposalPeriodBase<T> {
  readonly winnerCandidate: NonNullable<T> | undefined;
}

export interface FinishedProposalPeriod<T = unknown> extends ProposalPeriodBase<T> {
  readonly winnerCandidate: NonNullable<T>;
}

export interface Voter {
  readonly address: string;
  readonly vote: Vote;
  readonly votingPower: BigNumber;
}

export interface PromotionPeriod<T = unknown> {
  readonly periodIndex: BigNumber;
  readonly periodStartLevel: BigNumber;
  readonly periodEndLevel: BigNumber;
  readonly winnerCandidate: T;
  readonly voters: Voter[];
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

export interface GovernanceConfig {
  readonly startedAtLevel: BigNumber;
  readonly periodLength: BigNumber;
  readonly adoptionPeriodSec: BigNumber;
  readonly upvotingLimit: BigNumber;
  readonly proposalQuorum: BigNumber;
  readonly promotionQuorum: BigNumber;
  readonly promotionSupermajority: BigNumber;
}

export interface GovernanceState<T = unknown> {
  readonly config: GovernanceConfig;
  readonly votingContext: VotingContext<T>;
  readonly lastWinnerPayload: NonNullable<T> | undefined;
}

