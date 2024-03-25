import { getAppContext } from '@/app/lib/appContext/getAppContext';
import { getCurrentPeriodIndex } from '@/app/lib/governance/utils/calculators';
import VotingState from '@/app/ui/voting/votingState';
import BigNumber from 'bignumber.js';
import { redirectToPeriodPage } from '@/app/actions';

interface HomeProps {
  params: {
    periodIndex: string[] | undefined;
    contract: string;
  }
}

export default async function Home({ params }: HomeProps) {
  const context = getAppContext();
  const contract = context.config.contracts.find(c => c.name === params.contract);
  if (!contract) {
    redirectToPeriodPage(context.config.contracts[0].name);
    return;
  }

  const currentBlockLevel = await context.apiProvider.getCurrentBlockLevel();

  const config = await context.governance.configProvider.getConfig(contract.address);
  const { startedAtLevel, periodLength } = config;
  const currentPeriodIndex = getCurrentPeriodIndex(currentBlockLevel, startedAtLevel, periodLength);

  const periodIndex = params.periodIndex && params.periodIndex.length === 1 ? BigNumber(params.periodIndex[0]) : undefined;
  if (!periodIndex || periodIndex.isNaN() || periodIndex.gt(currentPeriodIndex) || periodIndex.lt(0)) {
    redirectToPeriodPage(contract.name, currentPeriodIndex.toNumber());
    return;
  }

  return <>
    <VotingState contract={contract} config={config} periodIndex={periodIndex} />
  </>;
}
