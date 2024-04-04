import { getAppContext } from '@/app/lib/appContext/getAppContext';
import { getCurrentPeriodIndex } from '@/app/lib/governance/utils/calculators';
import { VotingState } from '@/app/ui/voting/votingState';
import { redirectToPeriodPage } from '@/app/actions';
import { Suspense } from 'react';

interface HomeProps {
  params: {
    periodIndex: string[] | undefined;
    contract: string;
  }
}

export default async function Home({ params }: HomeProps) {
  const context = getAppContext();
  const contract = context.config.contracts.find(c => c.name === params.contract);
  if (!contract)
    return redirectToPeriodPage(context.config.contracts[0].name);

  const [
    currentBlockLevel,
    config
  ] = await Promise.all([
    context.blockchain.getCurrentBlockLevel(),
    context.governance.config.getConfig(contract.address)
  ]);

  const { startedAtLevel, periodLength } = config;
  const currentPeriodIndex = getCurrentPeriodIndex(currentBlockLevel, startedAtLevel, periodLength);

  const periodIndex = params.periodIndex && params.periodIndex.length === 1 ? parseInt(params.periodIndex[0]) : undefined;
  if (Number.isNaN(periodIndex) || periodIndex && (periodIndex > currentPeriodIndex || periodIndex < 0))
    return redirectToPeriodPage(contract.name, currentPeriodIndex.toString());

  return <VotingState contract={contract} config={config} periodIndex={periodIndex || currentPeriodIndex} currentBlockLevel={currentBlockLevel} />;
}
