'use server'

import { redirect } from 'next/navigation';
import { getPeriodPageUrl } from '.';

export const redirectToPeriodPage = (contractName: string, periodIndex?: string): never => {
  return redirect(getPeriodPageUrl(contractName, periodIndex));
}