import BigNumber from 'bignumber.js';
import ProposalState from '@/app/ui/voting/proposalState';
import PromotionState from '@/app/ui/voting/promotionState';
import { GovernanceConfig } from '@/app/lib/governance/config/config';
import { getCurrentPeriodIndex } from '@/app/lib/governance/utils';
import VotingStateHeader from './votingStateHeader';
import { Contract } from '@/app/lib/config';
import { createAppContext } from '@/app/lib/appContext/createAppContext';

interface VotingStateProps {
  contract: Contract;
  config: GovernanceConfig;
  periodIndex: BigNumber;
}

export default async function VotingState({ config, contract, periodIndex }: VotingStateProps) {
  const context = createAppContext();
  const currentBlockLevel = await context.apiProvider.getCurrentBlockLevel();
  const timeBetweenBlocks = await context.apiProvider.getTimeBetweenBlocks();

  const { startedAtLevel, periodLength } = config;
  const currentPeriodIndex = getCurrentPeriodIndex(currentBlockLevel, startedAtLevel, periodLength);

  const state = await context.governanceStateProvider.getState(contract.address, config, periodIndex);

  const votingContext = state.votingContext;
  const { periodEndLevel } = votingContext.promotionPeriod ? votingContext.promotionPeriod : votingContext.proposalPeriod;
  const blocksRemain = periodEndLevel.minus(currentBlockLevel).plus(1);
  const secondsRemain = blocksRemain.multipliedBy(timeBetweenBlocks);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always', style: 'long' });
  const timeRemains = formatter.format(secondsRemain.toNumber(), 'seconds');

  return <>
    <VotingStateHeader
      contractName={contract.name}
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