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

export interface ProposalPeriod<T = unknown> {
  readonly periodIndex: BigNumber;
  readonly periodStartLevel: BigNumber;
  readonly periodEndLevel: BigNumber;
  readonly proposals: Array<Proposal<T>>;
  readonly upvoters: Array<Upvoter<T>>;
  readonly totalVotingPower: BigNumber;
  readonly winnerCandidate: NonNullable<T> | undefined;
  readonly candidateUpvotesVotingPower: BigNumber | undefined;
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

export interface VotingContext<T = unknown> {
  readonly periodIndex: BigNumber;
  readonly periodType: PeriodType;
  readonly proposalPeriod: ProposalPeriod<T>;
  readonly promotionPeriod: PromotionPeriod | undefined;
}

export interface GovernanceState<T = unknown> {
  readonly votingContext: VotingContext<T>;
  readonly lastWinnerPayload: NonNullable<T> | undefined;
}
