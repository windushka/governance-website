import { PeriodType, VotingContext } from '@/app/lib/governance/state/state';
import BigNumber from 'bignumber.js'
import PeriodHeader from './periodHeader';
import { getFirstBlockOfPeriod, getLastBlockOfPeriod } from '@/app/lib/governance/utils/calculators';
import { GovernanceConfig } from '@/app/lib/governance/config/config';
import NavButton from './navButton';
import PeriodSelector from './periodSelector';
import ContractConfigModalButton from './contractConfigModalButton';
import { Contract } from '@/app/lib/config';

interface VotingStateHeaderProps {
  contract: Contract;
  periodIndex: BigNumber;
  currentPeriodIndex: BigNumber;
  currentLevel: BigNumber;
  blockTime: BigNumber;
  votingContext: VotingContext;
  config: GovernanceConfig
}

export default function VotingStateHeader({ contract, periodIndex, votingContext, currentPeriodIndex, config, currentLevel, blockTime }: VotingStateHeaderProps) {
  const promotionPeriodIndex = votingContext.proposalPeriod.periodIndex.plus(1);
  const { startedAtLevel, periodLength } = config;
  const prevPeriodIndex = periodIndex.minus(1);
  const nextPeriodIndex = periodIndex.plus(1);

  return <div className="flex flex-row justify-between items-center pb-4 mb-8 border-b">
    <div className="flex flex-row gap-10 items-center">
      <NavButton contractName={contract.name} disabled={prevPeriodIndex.lte(0)} periodIndex={prevPeriodIndex} />
      <PeriodSelector
        contractName={contract.name}
        minValue={0}
        maxValue={currentPeriodIndex.toNumber()}
        value={periodIndex.toNumber()} />
      <PeriodHeader
        contractName={contract.name}
        currentLevel={currentLevel}
        blockTime={blockTime}
        periodType={PeriodType.Proposal}
        periodIndex={votingContext.proposalPeriod.periodIndex}
        startLevel={votingContext.proposalPeriod.periodStartLevel}
        endLevel={votingContext.proposalPeriod.periodEndLevel} />
      {(votingContext.promotionPeriod || currentPeriodIndex.eq(votingContext.proposalPeriod.periodIndex)) && <PeriodHeader
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
        startedAtLevel={config.startedAtLevel.toString()}
        periodLength={config.periodLength.toString()}
        adoptionPeriodSec={config.adoptionPeriodSec.toString()}
        upvotingLimit={config.upvotingLimit.toString()}
        proposalQuorum={config.proposalQuorum.toString()}
        promotionQuorum={config.promotionQuorum.toString()}
        promotionSupermajority={config.promotionSupermajority.toString()}
      />
      <NavButton contractName={contract.name} isNext disabled={nextPeriodIndex.gt(currentPeriodIndex)} periodIndex={nextPeriodIndex} />
    </div>
  </div>
}