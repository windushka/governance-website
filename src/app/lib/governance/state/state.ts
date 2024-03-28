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
  readonly upvotesVotingPower: bigint;
}

export interface Upvoter {
  readonly address: string;
  readonly proposalKey: PayloadKey;
  readonly votingPower: bigint;
}

export interface ProposalPeriod {
  readonly index: bigint;
  readonly startLevel: bigint;
  readonly startTime: Date;
  readonly endLevel: bigint;
  readonly endTime: Date;
  readonly proposals: Array<Proposal>;
  readonly upvoters: Array<Upvoter>;
  readonly totalVotingPower: bigint;
  readonly winnerCandidate: NonNullable<PayloadKey> | undefined;
  readonly candidateUpvotesVotingPower: bigint | undefined;
}

export interface Voter {
  readonly address: string;
  readonly vote: Vote;
  readonly votingPower: bigint;
}

export interface PromotionPeriod {
  readonly index: bigint;
  readonly startLevel: bigint;
  readonly startTime: Date;
  readonly endLevel: bigint;
  readonly endTime: Date;
  readonly winnerCandidate: PayloadKey;
  readonly voters: Voter[];
  readonly yeaVotingPower: bigint;
  readonly nayVotingPower: bigint;
  readonly passVotingPower: bigint;
  readonly totalVotingPower: bigint;
}

export interface VotingContext {
  readonly periodIndex: bigint;
  readonly periodType: PeriodType;
  readonly proposalPeriod: ProposalPeriod;
  readonly promotionPeriod: PromotionPeriod | undefined;
}

export interface GovernanceState {
  readonly votingContext: VotingContext;
  readonly lastWinnerPayload: NonNullable<PayloadKey> | undefined;
}