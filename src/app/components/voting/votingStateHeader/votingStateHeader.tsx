'use client';

import { PeriodType, VotingContext } from '@/lib/governance/state';
import { PeriodHeader } from './periodHeader';
import { GovernanceConfig } from '@/lib/governance/config';
import { NavButton } from './navButton';
import { PeriodSelector } from './periodSelector';
import { ContractConfigModalButton } from './contractConfigModalButton';
import { Contract } from '@/lib/config';
import { appTheme, useClientContext } from '@/app/components/common';
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
  return <div className={`mt-3 sm:mt-0 flex flex-row justify-between items-start sm:items-center ${appTheme.componentBgColor} px-2 py-4 mb-8 gap-4 sm:gap-10`}>
    <NavButton contractName={contract.name} disabled={prevPeriodIndex < 0} periodIndex={prevPeriodIndex} />
    <div className="flex flex-col sm:flex-row flex-wrap grow gap-x-10 gap-y-4 justify-center sm:justify-between items-stretch sm:items-center">
      <div className="contents sm:flex flex-row gap-x-10 gap-y-4 items-center">
        <PeriodSelector
          contract={contract}
          config={config}
          currentPeriodIndex={periodIndex} />
        {headerContent}
      </div>
      {!votingContext && <div className="grow flex justify-center items-center self-stretch">
        <Skeleton.Button active block style={{ height: 38 }} />
      </div>}
      <ContractConfigModalButton
        buttonText="Contract"
        contract={contract}
        contractUrl={context.explorer.getAccountUrl(contract.address)}
        config={config}
      />
    </div>
    <NavButton contractName={contract.name} isNext disabled={nextPeriodIndex > (currentPeriodIndex)} periodIndex={nextPeriodIndex} />
  </div>
}