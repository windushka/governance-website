'use client'

import { ProposalState } from '@/app/ui/voting/proposalState';
import { PromotionState } from '@/app/ui/voting/promotionState';
import { GovernanceConfig } from '@/lib/governance/config/config';
import { getCurrentPeriodIndex } from '@/lib/governance/utils';
import { VotingStateHeader } from './votingStateHeader';
import { Config, Contract } from '@/lib/config';
import { useEffect, useState } from 'react';
import { GovernanceState } from '@/lib/governance';
import { getState } from '@/app/actions';
import { ClientContextProvider } from '../common';
import { getClientContext } from '@/lib/clientContext';

interface VotingStateProps {
  appConfig: Config;
  contract: Contract;
  currentBlockLevel: number;
  config: GovernanceConfig;
  periodIndex: number;
}

export const VotingState = ({ appConfig, config, contract, periodIndex, currentBlockLevel }: VotingStateProps) => {
  const [state, setState] = useState<GovernanceState | null>(null);
  useEffect(() => {
    (async () => {
      const state = await getState(contract.address, config, periodIndex);
      setState(state);
    })()
  }, [config, contract.address, periodIndex])

  const { startedAtLevel, periodLength } = config;
  const currentPeriodIndex = getCurrentPeriodIndex(currentBlockLevel, startedAtLevel, periodLength);
  const votingContext = state?.votingContext ?? null;
  const clientContext = getClientContext(appConfig);

  return <ClientContextProvider context={clientContext}>
    <VotingStateHeader
      contract={contract}
      currentPeriodIndex={currentPeriodIndex}
      periodIndex={periodIndex}
      votingContext={votingContext}
      config={config} />
    {votingContext && votingContext.promotionPeriod.happened && periodIndex == votingContext.promotionPeriod.index
      ? <PromotionState contractAddress={contract.address} promotionPeriod={votingContext.promotionPeriod} config={config} />
      : <ProposalState contractAddress={contract.address} proposalPeriod={votingContext?.proposalPeriod ?? null} config={config} />}
  </ClientContextProvider>
};