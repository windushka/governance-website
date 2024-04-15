export interface GovernanceConfig {
  readonly startedAtLevel: number;
  readonly periodLength: number;
  readonly adoptionPeriodSec: number;
  readonly upvotingLimit: number;
  readonly scale: number;
  readonly proposalQuorum: number;
  readonly promotionQuorum: number;
  readonly promotionSupermajority: number;
}