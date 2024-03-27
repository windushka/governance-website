'use server'

import { redirect } from 'next/navigation';

export const getPeriodPageUrl = (contractName: string, periodIndex?: string) => {
  return `/${contractName}/period${periodIndex !== undefined ? `/${periodIndex}` : ''}`;
}

export const redirectToPeriodPage = (contractName: string, periodIndex?: string): never => {
  return redirect(getPeriodPageUrl(contractName, periodIndex));
}