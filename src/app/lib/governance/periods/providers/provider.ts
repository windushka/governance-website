import { GovernanceConfig } from '../..';
import { GovernancePeriod } from '../types';

export interface GovernancePeriodsProvider {
  getPeriods(contractAddress: string, config: GovernanceConfig): Promise<GovernancePeriod[]>;
}