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
  periodIndex: bigint;
}

export default async function VotingState({ config, contract, periodIndex }: VotingStateProps) {
  const context = getAppContext();
  const currentBlockLevel = await context.blockchain.getCurrentBlockLevel();

  const { startedAtLevel, periodLength } = config;
  const currentPeriodIndex = getCurrentPeriodIndex(currentBlockLevel, startedAtLevel, periodLength);
  const state = await context.governance.state.getState(contract.address, config, periodIndex);
  const votingContext = state.votingContext;

  return <>
    <VotingStateHeader
      contract={contract}
      currentPeriodIndex={currentPeriodIndex}
      periodIndex={periodIndex}
      votingContext={votingContext}
      config={config} />
    {votingContext.promotionPeriod && periodIndex == votingContext.promotionPeriod.index
      ? <PromotionState promotionPeriod={votingContext.promotionPeriod} config={config} />
      : <ProposalState proposalPeriod={votingContext.proposalPeriod} config={config} />}
  </>
}