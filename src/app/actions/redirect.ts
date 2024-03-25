'use server'

import { redirect } from 'next/navigation';

export const getPeriodPageUrl = (contractName: string, periodIndex?: number) => {
  return `/${contractName}/period${periodIndex !== undefined ? `/${periodIndex}` : ''}`;
}

export const redirectToPeriodPage = (contractName: string, periodIndex?: number): never => {
  return redirect(getPeriodPageUrl(contractName, periodIndex));
}