'use server'

import { getAppContext } from '../lib/appContext';
import { Upvoter, Voter } from '../lib/governance';

export const getVoters = (
  contractAddress: string,
  bigMapId: string,
  periodStartLevel: number,
  periodEndLevel: number
): Promise<Voter[]> => {
  const context = getAppContext();
  return context.governance.operations.getVoters(contractAddress, bigMapId, periodStartLevel, periodEndLevel);
}

export const getUpvoters = (
  contractAddress: string,
  bigMapId: string,
  periodStartLevel: number,
  periodEndLevel: number
): Promise<Upvoter[]> => {
  const context = getAppContext();
  return context.governance.operations.getUpvoters(contractAddress, bigMapId, periodStartLevel, periodEndLevel);
}