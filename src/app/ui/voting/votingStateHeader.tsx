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
  votingContext: VotingContext;
  config: GovernanceConfig
}

export default async function VotingStateHeader({ contract, periodIndex, votingContext, currentPeriodIndex, config }: VotingStateHeaderProps) {
  const promotionPeriodIndex = votingContext.proposalPeriod.index + BigInt(1);
  const { startedAtLevel, periodLength } = config;
  const prevPeriodIndex = periodIndex - BigInt(1);
  const nextPeriodIndex = periodIndex + BigInt(1);

  const context = getAppContext();
  const periods = await context.governance.periods.getPeriods(contract.address, config);

  let promotionPeriodHeader = null;
  if (votingContext.promotionPeriod || currentPeriodIndex === votingContext.proposalPeriod.index) {
    const periodStartLevel = votingContext.promotionPeriod?.startLevel || getFirstBlockOfPeriod(promotionPeriodIndex, startedAtLevel, periodLength);
    const periodStartTime = votingContext.promotionPeriod?.startTime || await context.blockchain.getBlockCreationTime(periodStartLevel);

    const periodEndLevel = votingContext.promotionPeriod?.endLevel || getLastBlockOfPeriod(promotionPeriodIndex, startedAtLevel, periodLength);
    const periodEndTime = votingContext.promotionPeriod?.endTime || await context.blockchain.getBlockCreationTime(periodEndLevel);

    promotionPeriodHeader = <PeriodHeader
      contractName={contract.name}
      disabled={!votingContext.promotionPeriod}
      periodIndex={promotionPeriodIndex}
      periodType={PeriodType.Promotion}
      startTime={periodStartTime}
      startLevel={periodStartLevel}
      endTime={periodEndTime}
      endLevel={periodEndLevel}
    />
  }

  return <div className="flex flex-row justify-between items-center pb-4 mb-8 border-b border-slate-400">
    <div className="flex flex-row gap-10 items-center">
      <NavButton contractName={contract.name} disabled={prevPeriodIndex < 0} periodIndex={prevPeriodIndex} />
      <PeriodSelector
        contractName={contract.name}
        periods={periods}
        currentPeriodIndex={periodIndex} />
      <PeriodHeader
        contractName={contract.name}
        periodType={PeriodType.Proposal}
        periodIndex={votingContext.proposalPeriod.index}
        startTime={votingContext.proposalPeriod.startTime}
        startLevel={votingContext.proposalPeriod.startLevel}
        endTime={votingContext.proposalPeriod.endTime}
        endLevel={votingContext.proposalPeriod.endLevel} />
      {promotionPeriodHeader}
    </div>
    <div className='flex flex-row gap-10 items-center'>
      <ContractConfigModalButton
        buttonText="Contract"
        contractName={contract.name}
        contractAddress={contract.address}
        contractUrl={context.explorer.getAccountUrl(contract.address)}
        config={config}
      />
      <NavButton contractName={contract.name} isNext disabled={nextPeriodIndex > (currentPeriodIndex)} periodIndex={nextPeriodIndex} />
    </div>
  </div>
}