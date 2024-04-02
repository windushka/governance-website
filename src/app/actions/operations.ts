'use server'

import { getAppContext } from '../lib/appContext';
import { Upvoter, Voter } from '../lib/governance';

export const getVoters = (
  contractAddress: string,
  periodStartLevel: number,
  periodEndLevel: number
): Promise<Voter[]> => {
  const context = getAppContext();
  return context.governance.operations.getVoters(contractAddress, periodStartLevel, periodEndLevel);
}

export const getUpvoters = (
  contractAddress: string,
  periodStartLevel: number,
  periodEndLevel: number
): Promise<Upvoter[]> => {
  const context = getAppContext();
  return context.governance.operations.getUpvoters(contractAddress, periodStartLevel, periodEndLevel);
}