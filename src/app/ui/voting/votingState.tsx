import BigNumber from 'bignumber.js';
import ProposalState from '@/app/ui/voting/proposalState';
import PromotionState from '@/app/ui/voting/promotionState';
import { GovernanceConfig } from '@/app/lib/governance/config/config';
import { getCurrentPeriodIndex } from '@/app/lib/governance/utils';
import VotingStateHeader from './votingStateHeader';
import { Contract } from '@/app/lib/config';
import { getAppContext } from '@/app/lib/appContext/getAppContext';

interface VotingStateProps {
  contract: Contract;
  config: GovernanceConfig;
  periodIndex: BigNumber;
}

export default async function VotingState({ config, contract, periodIndex }: VotingStateProps) {
  const context = getAppContext();
  const currentBlockLevel = await context.apiProvider.getCurrentBlockLevel();
  const timeBetweenBlocks = await context.apiProvider.getTimeBetweenBlocks();

  const { startedAtLevel, periodLength } = config;
  const currentPeriodIndex = getCurrentPeriodIndex(currentBlockLevel, startedAtLevel, periodLength);
  const state = await context.governanceStateProvider.getState(contract.address, config, periodIndex);
  const votingContext = state.votingContext;

  return <>
    <VotingStateHeader
      contract={contract}
      blockTime={timeBetweenBlocks}
      currentLevel={currentBlockLevel}
      currentPeriodIndex={currentPeriodIndex}
      periodIndex={periodIndex}
      votingContext={votingContext}
      config={config} />
    {votingContext.promotionPeriod && periodIndex.eq(votingContext.promotionPeriod.periodIndex)
      ? <PromotionState promotionPeriod={votingContext.promotionPeriod} config={config} />
      : <ProposalState proposalPeriod={votingContext.proposalPeriod} config={config} />}
  </>
}