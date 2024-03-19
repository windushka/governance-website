import { TzktApiProvider } from '@/app/lib/api/tzktApiProvider';
import { RpcGovernanceStateProvider } from '@/app/lib/governance/state/providers/governanceStateProvider';
import BigNumber from 'bignumber.js';
import { GovernanceState, PeriodType } from '@/app/lib/governance/state/state';
import { unstable_noStore as noStore } from 'next/cache';
import ProposalState from '@/app/ui/voting/proposalState';
import PeriodHeader from '@/app/ui/voting/periodHeader';
import PromotionState from '@/app/ui/voting/promotionState';
import { RpcGovernanceConfigProvider } from '../../lib/governance/config/providers/governanceConfigProvider';
import { TezosToolkit } from '@taquito/taquito';
import { redirect } from 'next/navigation';

const rpcUrl = 'https://rpc.tzkt.io/ghostnet';
const apiProvider = new TzktApiProvider('https://api.ghostnet.tzkt.io');
const configProvider = new RpcGovernanceConfigProvider(new TezosToolkit(rpcUrl));

const readContractStateAtBlock = async <T,>(contractAddress: string, blockLevel: BigNumber): Promise<GovernanceState<T>> => {
  noStore();
  console.warn('Request Contract State')
  const provider = new RpcGovernanceStateProvider<T>(contractAddress, rpcUrl, apiProvider);
  return await provider.getState(blockLevel);
};

const getCurrentBlockLevel = async () => {
  noStore();
  return await apiProvider.getCurrentBlockLevel();
}

interface VotingStateProps {
  periodIndex?: string[] | undefined;
}

export default async function VotingState(props: VotingStateProps) {
  const contractAddress = 'KT1MHAVKVVDSgZsKiwNrRfYpKHiTLLrtGqod';
  const blockLevel = await getCurrentBlockLevel();
  const timeBetweenBlocks = await apiProvider.getTimeBetweenBlocks();

  const state = await readContractStateAtBlock<string>(contractAddress, blockLevel);
  const config = await configProvider.getConfig(contractAddress);

  const votingContext = state.votingContext;
  const { periodEndLevel } = votingContext.promotionPeriod ? votingContext.promotionPeriod : votingContext.proposalPeriod;
  const blocksRemain = periodEndLevel.minus(blockLevel).plus(1);
  const secondsRemain = blocksRemain.multipliedBy(timeBetweenBlocks);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always', style: 'long' });
  const timeRemains = formatter.format(secondsRemain.toNumber(), 'seconds');

  const redirectUrl = `/period/${votingContext.periodIndex}`;

  if (!props.periodIndex || props.periodIndex.length !== 1)
    redirect(redirectUrl);

  const periodIndex = BigNumber(props.periodIndex[0])
  if (periodIndex.isNaN() || periodIndex > votingContext.periodIndex || periodIndex < votingContext.proposalPeriod.periodIndex)
    redirect(redirectUrl);

  return <>
    <div className="flex flex-row justify-between items-center pb-4 mb-8 border-b">
      <div className="flex flex-row gap-10 items-center">
        <span>Period: {periodIndex.toString()}</span>
        <PeriodHeader
          periodType={PeriodType.Proposal}
          periodIndex={votingContext.proposalPeriod.periodIndex}
          startLevel={votingContext.proposalPeriod.periodStartLevel}
          endLevel={votingContext.proposalPeriod.periodEndLevel} />
        {<PeriodHeader
          disabled={!votingContext.promotionPeriod}
          periodIndex={votingContext.proposalPeriod.periodIndex.plus(1)}
          periodType={PeriodType.Promotion}
          startLevel={votingContext.promotionPeriod?.periodStartLevel}
          endLevel={votingContext.promotionPeriod?.periodEndLevel} />}
      </div>
      <span>Config</span>
    </div>
    <div>
      {votingContext.promotionPeriod && periodIndex.eq(votingContext.promotionPeriod.periodIndex)
        ? <PromotionState promotionPeriod={votingContext.promotionPeriod} config={config} />
        : <ProposalState proposalPeriod={votingContext.proposalPeriod} config={config} />}

      <br />
      <br />
      <div className='text-slate-400'>
        <h1>Technical info:</h1>
        <p>Contract: {contractAddress}</p>
        <p>Current level: {blockLevel.toString()}</p>
        <p>Blocks remain: {blocksRemain.toString()}</p>
        <p>Period finishes: {timeRemains}</p>
        <p>Last winner payload: {state.lastWinnerPayload}</p>
        <p>Config: {JSON.stringify(config, undefined, 2)}</p>
      </div>
    </div >
  </>
}