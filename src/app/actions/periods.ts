'use server'

import { getAppContext } from '../lib/appContext';
import { GovernanceConfig, GovernancePeriod } from '../lib/governance';

export const getPeriods = (contractAddress: string, config: GovernanceConfig): Promise<GovernancePeriod[]> => {
  const context = getAppContext();
  return context.governance.periods.getPeriods(contractAddress, config);
}