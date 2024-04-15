'use server'

import { getAppContext } from '@/lib/appContext';
import { GovernanceConfig, GovernanceState } from '@/lib/governance';

export const getState = (contractAddress: string, config: GovernanceConfig, periodIndex: number): Promise<GovernanceState> => {
  const context = getAppContext();
  return context.governance.state.getState(contractAddress, config, periodIndex);
}