'use client'

import { ProposalState, PromotionState, VotingStateHeader, ClientContextProvider } from '@/app/components';
import { getCurrentPeriodIndex } from '@/lib/governance/utils';
import { Config, Contract } from '@/lib/config';
import { useEffect, useState } from 'react';
import { GovernanceState, GovernanceConfig } from '@/lib/governance';
import { getState } from '@/app/actions';
import { getClientContext } from '@/lib/clientContext';

interface VotingStateViewProps {
  appConfig: Config;
  contract: Contract;
  currentBlockLevel: number;
  config: GovernanceConfig;
  periodIndex: number;
}

export const VotingStateView = ({ appConfig, config, contract, periodIndex, currentBlockLevel }: VotingStateViewProps) => {
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