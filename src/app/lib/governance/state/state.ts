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

export type KernelKey = string;
export interface SequencerKey {
  readonly poolAddress: string;
  readonly sequencerPublicKey: string;
}
export type PayloadKey = KernelKey | SequencerKey;


export interface Proposal {
  readonly key: PayloadKey;
  readonly proposer: string;
  readonly upvotesVotingPower: BigNumber;
}

export interface Upvoter {
  readonly address: string;
  readonly proposalKey: PayloadKey;
  readonly votingPower: BigNumber;
}

export interface ProposalPeriod {
  readonly periodIndex: BigNumber;
  readonly periodStartLevel: BigNumber;
  readonly periodEndLevel: BigNumber;
  readonly proposals: Array<Proposal>;
  readonly upvoters: Array<Upvoter>;
  readonly totalVotingPower: BigNumber;
  readonly winnerCandidate: NonNullable<PayloadKey> | undefined;
  readonly candidateUpvotesVotingPower: BigNumber | undefined;
}

export interface Voter {
  readonly address: string;
  readonly vote: Vote;
  readonly votingPower: BigNumber;
}

export interface PromotionPeriod {
  readonly periodIndex: BigNumber;
  readonly periodStartLevel: BigNumber;
  readonly periodEndLevel: BigNumber;
  readonly winnerCandidate: PayloadKey;
  readonly voters: Voter[];
  readonly yeaVotingPower: BigNumber;
  readonly nayVotingPower: BigNumber;
  readonly passVotingPower: BigNumber;
  readonly totalVotingPower: BigNumber;
}

export interface VotingContext {
  readonly periodIndex: BigNumber;
  readonly periodType: PeriodType;
  readonly proposalPeriod: ProposalPeriod;
  readonly promotionPeriod: PromotionPeriod | undefined;
}

export interface GovernanceState {
  readonly votingContext: VotingContext;
  readonly lastWinnerPayload: NonNullable<PayloadKey> | undefined;
}