import BigNumber from 'bignumber.js'

export interface GovernanceConfig {
  readonly startedAtLevel: BigNumber;
  readonly periodLength: BigNumber;
  readonly adoptionPeriodSec: BigNumber;
  readonly upvotingLimit: BigNumber;
  readonly proposalQuorum: BigNumber;
  readonly promotionQuorum: BigNumber;
  readonly promotionSupermajority: BigNumber;
}