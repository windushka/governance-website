import { TzktApiProvider } from '@/app/lib/api/tzktApiProvider';
import { RpcGovernanceStateProvider } from '@/app/lib/governance/state/providers/governanceStateProvider';
import BigNumber from 'bignumber.js';
import { GovernanceState, PeriodType } from '@/app/lib/governance/state/state';
import { unstable_noStore as noStore } from 'next/cache';
import ProposalState from '@/app/ui/voting/proposalState';
import PromotionState from '@/app/ui/voting/promotionState';
import { RpcGovernanceConfigProvider } from '@/app/lib/governance/config/providers/governanceConfigProvider';
import { TezosToolkit } from '@taquito/taquito';
import { redirect } from 'next/navigation';
import { GovernanceConfig } from '@/app/lib/governance/config/config';
import { getCurrentPeriodIndex, getFirstBlockOfPeriod, getLastBlockOfPeriod } from '@/app/lib/governance/utils/calculators';
import VotingStateHeader from './votingStateHeader';

const rpcUrl = 'https://rpc.tzkt.io/ghostnet';
const apiProvider = new TzktApiProvider('https://api.ghostnet.tzkt.io');
const configProvider = new RpcGovernanceConfigProvider(new TezosToolkit(rpcUrl));

const getContractState = async <T,>(contractAddress: string, config: GovernanceConfig, periodIndex: BigNumber): Promise<GovernanceState<T>> => {
  noStore();
  console.warn('Request Contract State')
  const provider = new RpcGovernanceStateProvider<T>(rpcUrl, apiProvider);
  return await provider.getState(contractAddress, config, periodIndex);
};

const getCurrentBlockLevel = async () => {
  noStore();
  return await apiProvider.getCurrentBlockLevel();
}

interface VotingStateProps {
  contractAddress: string;
  periodIndex?: string[] | undefined;
}

export default async function VotingState(props: VotingStateProps) {
  const currentBlockLevel = await getCurrentBlockLevel();
  const timeBetweenBlocks = await apiProvider.getTimeBetweenBlocks();
  const config = await configProvider.getConfig(props.contractAddress);
  const { startedAtLevel, periodLength } = config;
  const currentPeriodIndex = getCurrentPeriodIndex(currentBlockLevel, startedAtLevel, periodLength);
  const redirectUrl = `/period/${currentPeriodIndex.toString()}`;

  const periodIndex = props.periodIndex && props.periodIndex.length === 1 ? BigNumber(props.periodIndex[0]) : undefined;
  if (!periodIndex || periodIndex.isNaN() || periodIndex.gt(currentPeriodIndex) || periodIndex.lt(0))
    redirect(redirectUrl);

  const state = await getContractState<string>(props.contractAddress, config, periodIndex);

  const votingContext = state.votingContext;
  const { periodEndLevel } = votingContext.promotionPeriod ? votingContext.promotionPeriod : votingContext.proposalPeriod;
  const blocksRemain = periodEndLevel.minus(currentBlockLevel).plus(1);
  const secondsRemain = blocksRemain.multipliedBy(timeBetweenBlocks);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always', style: 'long' });
  const timeRemains = formatter.format(secondsRemain.toNumber(), 'seconds');

  return <>
    <VotingStateHeader
      blockTime={timeBetweenBlocks}
      currentLevel={currentBlockLevel}
      currentPeriodIndex={currentPeriodIndex}
      periodIndex={periodIndex}
      votingContext={votingContext}
      config={config} />
    {votingContext.promotionPeriod && periodIndex.eq(votingContext.promotionPeriod.periodIndex)
      ? <PromotionState promotionPeriod={votingContext.promotionPeriod} config={config} />
      : <ProposalState proposalPeriod={votingContext.proposalPeriod} config={config} />}

    {/* <br />
    <br />
    <div className='text-slate-400'>
      <h1>Temp technical info:</h1>
      <p>Contract: {props.contractAddress}</p>
      <p>Current level: {currentBlockLevel.toString()}</p>
      <p>Blocks remain: {blocksRemain.toString()} ({timeRemains})</p>
      <p>Last winner payload: {state.lastWinnerPayload}</p>
      <p>{JSON.stringify(votingContext, undefined, 2)}</p>
    </div> */}
  </>
}