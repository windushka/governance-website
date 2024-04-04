'use client';

import { PeriodType, VotingContext } from '@/app/lib/governance/state/state';
import { PeriodHeader } from './periodHeader';
import { GovernanceConfig } from '@/app/lib/governance/config/config';
import { NavButton } from './navButton';
import { PeriodSelector } from './periodSelector';
import { ContractConfigModalButton } from './contractConfigModalButton';
import { Contract } from '@/app/lib/config';
import { appTheme, useClientContext } from '../common';
import { Skeleton } from 'antd';

interface VotingStateHeaderProps {
  contract: Contract;
  periodIndex: number;
  currentPeriodIndex: number;
  votingContext: VotingContext | null;
  config: GovernanceConfig;
}

export const VotingStateHeader = ({ contract, periodIndex, votingContext, currentPeriodIndex, config }: VotingStateHeaderProps) => {
  const prevPeriodIndex = periodIndex - 1;
  const nextPeriodIndex = periodIndex + 1;

  const context = useClientContext();

  let promotionPeriodHeader = null;
  if (votingContext && (votingContext.promotionPeriod.happened || currentPeriodIndex === votingContext.proposalPeriod.index)) {
    const promotionPeriod = votingContext.promotionPeriod;

    promotionPeriodHeader = <PeriodHeader
      contractName={contract.name}
      disabled={!votingContext.promotionPeriod.happened}
      active={periodIndex === promotionPeriod.index}
      periodIndex={promotionPeriod.index}
      periodType={PeriodType.Promotion}
      startTime={promotionPeriod.startTime}
      startLevel={promotionPeriod.startLevel}
      endTime={promotionPeriod.endTime}
      endLevel={promotionPeriod.endLevel}
    />
  }
  const headerContent = votingContext && <>
    <PeriodHeader
      contractName={contract.name}
      periodType={PeriodType.Proposal}
      active={periodIndex === votingContext.proposalPeriod.index}
      periodIndex={votingContext.proposalPeriod.index}
      startTime={votingContext.proposalPeriod.startTime}
      startLevel={votingContext.proposalPeriod.startLevel}
      endTime={votingContext.proposalPeriod.endTime}
      endLevel={votingContext.proposalPeriod.endLevel} />
    {promotionPeriodHeader}
  </>
  return <div className={`flex flex-row justify-between items-center ${appTheme.componentBgColor} px-2 py-4 mb-8 gap-10`}>
    <div className="flex flex-row gap-10 items-center">
      <NavButton contractName={contract.name} disabled={prevPeriodIndex < 0} periodIndex={prevPeriodIndex} />
      <PeriodSelector
        contract={contract}
        config={config}
        currentPeriodIndex={periodIndex} />
      {headerContent}
    </div>
    {!votingContext && <div className="grow flex justify-center items-center">
      <Skeleton.Button active block style={{ height: 38 }} />
    </div>}
    <div className='flex flex-row gap-10 items-center'>
      <ContractConfigModalButton
        buttonText="Contract"
        contract={contract}
        contractUrl={context.explorer.getAccountUrl(contract.address)}
        config={config}
      />
      <NavButton contractName={contract.name} isNext disabled={nextPeriodIndex > (currentPeriodIndex)} periodIndex={nextPeriodIndex} />
    </div>
  </div>
}