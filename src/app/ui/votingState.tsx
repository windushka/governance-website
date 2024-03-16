import { TzktApiProvider } from '@/app/lib/api/tzktApiProvider';
import { RpcGovernanceStateProvider } from '@/app/lib/governance/state/providers/governanceStateProvider';
import BigNumber from 'bignumber.js';
import { GovernanceState, PeriodType } from '@/app/lib/governance/state/state';
import { unstable_noStore as noStore } from 'next/cache';
import ProposalState from '@/app/ui/proposalState';
import PeriodHeader from '@/app/ui/periodHeader';
import PromotionState from '@/app/ui/promotionState';

const apiProvider = new TzktApiProvider('https://api.ghostnet.tzkt.io');

const readContractStateAtBlock = async <T,>(contractAddress: string, blockLevel: BigNumber): Promise<GovernanceState<T>> => {
  noStore();
  console.warn('Request Contract State')
  const provider = new RpcGovernanceStateProvider<T>(contractAddress, 'https://rpc.tzkt.io/ghostnet', apiProvider);
  return await provider.getState(blockLevel);
};

const getCurrentBlockLevel = async () => {
  noStore();
  return await apiProvider.getCurrentBlockLevel();
}

export default async function VotingState() {
  const blockLevel = await getCurrentBlockLevel();
  const timeBetweenBlocks = await apiProvider.getTimeBetweenBlocks();

  const state = await readContractStateAtBlock<string>('KT1MHAVKVVDSgZsKiwNrRfYpKHiTLLrtGqod', blockLevel);

  const votingContext = state.votingContext;
  const { periodEndLevel } = votingContext.promotionPeriod ? votingContext.promotionPeriod : votingContext.proposalPeriod;
  const blocksRemain = periodEndLevel.minus(blockLevel).plus(1);
  const secondsRemain = blocksRemain.multipliedBy(timeBetweenBlocks);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always', style: 'long' });
  const timeRemains = formatter.format(secondsRemain.toNumber(), 'seconds');

  return <>
    <div className="flex gap-8 mb-4">
      <span title="Period index">{votingContext.periodIndex.toString()}</span>
      <PeriodHeader periodType={PeriodType.Proposal} startLevel={votingContext.proposalPeriod.periodStartLevel} endLevel={votingContext.proposalPeriod.periodEndLevel} />
      {votingContext.periodType === PeriodType.Promotion
        && <PeriodHeader periodType={PeriodType.Promotion} startLevel={votingContext.promotionPeriod.periodStartLevel} endLevel={votingContext.promotionPeriod.periodEndLevel} />}
    </div>
    <div>
      <h1>Current Voting State</h1>
      <p>Current level: {blockLevel.toString()}</p>
      <p>Blocks remain: {blocksRemain.toString()}</p>
      <p>Period finishes: {timeRemains}</p>
      <br />
      <br />
      <ProposalState proposalPeriod={votingContext.proposalPeriod} />
      {votingContext.promotionPeriod && <><br /><br /><PromotionState promotionPeriod={votingContext.promotionPeriod} /></>}
    </div >
  </>
}