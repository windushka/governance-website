import { PeriodType, VotingContext } from '@/app/lib/governance/state/state';
import PeriodHeader from './periodHeader';
import { getFirstBlockOfPeriod, getLastBlockOfPeriod } from '@/app/lib/governance/utils/calculators';
import { GovernanceConfig } from '@/app/lib/governance/config/config';
import NavButton from './navButton';
import PeriodSelector from './periodSelector';
import ContractConfigModalButton from './contractConfigModalButton';
import { Contract } from '@/app/lib/config';
import { getAppContext } from '@/app/lib/appContext';

interface VotingStateHeaderProps {
  contract: Contract;
  periodIndex: bigint;
  currentPeriodIndex: bigint;
  currentLevel: bigint;
  blockTime: bigint;
  votingContext: VotingContext;
  config: GovernanceConfig
}

export default async function VotingStateHeader({ contract, periodIndex, votingContext, currentPeriodIndex, config, currentLevel, blockTime }: VotingStateHeaderProps) {
  const promotionPeriodIndex = votingContext.proposalPeriod.periodIndex + BigInt(1);
  const { startedAtLevel, periodLength } = config;
  const prevPeriodIndex = periodIndex - BigInt(1);
  const nextPeriodIndex = periodIndex + BigInt(1);

  const context = getAppContext();
  const periods = await context.governance.periodsProvider.getPeriods(contract.address, config);

  return <div className="flex flex-row justify-between items-center pb-4 mb-8 border-b">
    <div className="flex flex-row gap-10 items-center">
      <NavButton contractName={contract.name} disabled={prevPeriodIndex < 0} periodIndex={prevPeriodIndex} />
      <PeriodSelector
        contractName={contract.name}
        periods={periods}
        currentPeriodIndex={periodIndex} />
      <PeriodHeader
        contractName={contract.name}
        currentLevel={currentLevel}
        blockTime={blockTime}
        periodType={PeriodType.Proposal}
        periodIndex={votingContext.proposalPeriod.periodIndex}
        startLevel={votingContext.proposalPeriod.periodStartLevel}
        endLevel={votingContext.proposalPeriod.periodEndLevel} />
      {(votingContext.promotionPeriod || currentPeriodIndex === votingContext.proposalPeriod.periodIndex) && <PeriodHeader
        contractName={contract.name}
        currentLevel={currentLevel}
        blockTime={blockTime}
        disabled={!votingContext.promotionPeriod}
        periodIndex={promotionPeriodIndex}
        periodType={PeriodType.Promotion}
        startLevel={votingContext.promotionPeriod?.periodStartLevel || getFirstBlockOfPeriod(promotionPeriodIndex, startedAtLevel, periodLength)}
        endLevel={votingContext.promotionPeriod?.periodEndLevel || getLastBlockOfPeriod(promotionPeriodIndex, startedAtLevel, periodLength)} />}
    </div>
    <div className='flex flex-row gap-10 items-center'>
      <ContractConfigModalButton
        buttonText="Contract"
        contractName={contract.name}
        contractAddress={contract.address}
        config={config}
      />
      <NavButton contractName={contract.name} isNext disabled={nextPeriodIndex > (currentPeriodIndex)} periodIndex={nextPeriodIndex} />
    </div>
  </div>
}