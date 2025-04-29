import { getAppContext } from '@/lib/appContext';
import { getCurrentPeriodIndex } from '@/lib/governance/utils';
import { redirectToPeriodPage } from '@/app/actions';
import { VotingStateView } from '@/app/views';
import { Metadata } from 'next';

interface HomeProps {
  params: {
    periodIndex: string[] | undefined;
    contract: string;
  }
}

export const generateMetadata = ({ params }: HomeProps): Metadata => {
  const contract = params.contract.length
    ? params.contract.charAt(0).toUpperCase() + params.contract.slice(1)
    : params.contract;
  const periodIndex = params.periodIndex?.[0] ?? '';

  return {
    title: `${contract}${periodIndex ? ` - period ${periodIndex}` : ''}`
  };
}

export default async function Home({ params }: HomeProps) {
  const context = getAppContext();
  const currentBlockLevel = await context.blockchain.getCurrentBlockLevel();
  const contracts = context.getContracts(currentBlockLevel);
  const contract = contracts.find(c => c.name === params.contract);

  if (!contract)
    return redirectToPeriodPage(contracts[0].name);

  const config = await context.governance.config.getConfig(contract.address);

  const { startedAtLevel, periodLength } = config;
  const currentPeriodIndex = getCurrentPeriodIndex(currentBlockLevel, startedAtLevel, periodLength);

  const periodIndex = params.periodIndex && params.periodIndex.length === 1 ? parseInt(params.periodIndex[0]) : undefined;
  if (Number.isNaN(periodIndex) || periodIndex !== undefined && (periodIndex > currentPeriodIndex || periodIndex < 0))
    return redirectToPeriodPage(contract.name);

  return <VotingStateView appConfig={context.config} contract={contract} config={config} periodIndex={periodIndex ?? currentPeriodIndex} currentBlockLevel={currentBlockLevel} />;
}
