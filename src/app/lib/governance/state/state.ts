export enum PeriodType {
  Proposal = 'Proposal',
  Promotion = 'Promotion'
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

export interface ProposalPeriod {
  readonly index: number;
  readonly startLevel: number;
  readonly startTime: Date;
  readonly endLevel: number;
  readonly endTime: Date;
  readonly proposals: Proposal[];
  readonly upvotersBigMapId: string | null;
  readonly totalVotingPower: bigint;
  readonly winnerCandidate: NonNullable<PayloadKey> | null;
  readonly candidateUpvotesVotingPower: bigint | null;
}

export interface PromotionPeriod {
  readonly index: number;
  readonly startLevel: number;
  readonly startTime: Date;
  readonly endLevel: number;
  readonly endTime: Date;
  readonly winnerCandidate: PayloadKey;
  readonly votersBigMapId: string | null;
  readonly yeaVotingPower: bigint;
  readonly nayVotingPower: bigint;
  readonly passVotingPower: bigint;
  readonly totalVotingPower: bigint;
}

export interface VotingContext {
  readonly periodIndex: number;
  readonly periodType: PeriodType;
  readonly proposalPeriod: ProposalPeriod;
  readonly promotionPeriod: PromotionPeriod | null;
}

export interface GovernanceState {
  readonly votingContext: VotingContext;
  readonly lastWinnerPayload: NonNullable<PayloadKey> | null;
}