export interface GovernanceConfig {
  readonly startedAtLevel: bigint;
  readonly periodLength: bigint;
  readonly adoptionPeriodSec: bigint;
  readonly upvotingLimit: bigint;
  readonly scale: bigint;
  readonly proposalQuorum: bigint;
  readonly promotionQuorum: bigint;
  readonly promotionSupermajority: bigint;
}