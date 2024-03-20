import { PeriodType } from "@/app/lib/governance/state/state"
import BigNumber from 'bignumber.js'
import Link from "@/app/ui/common/link";

interface PeriodHeaderProps {
  periodType: PeriodType;
  disabled?: boolean;
  periodIndex: BigNumber;
  blockTime: BigNumber;
  currentLevel: BigNumber;
  startLevel: BigNumber;
  endLevel: BigNumber;
}

const getLevelDateTime = (level: BigNumber, currentLevel: BigNumber, blockTime: BigNumber): string => {
  //if (level.gt(currentLevel)) {
  const now = new Date();
  const value = new Date(BigNumber(Date.now()).dividedToIntegerBy(1000).plus(level.minus(currentLevel).multipliedBy(blockTime)).multipliedBy(1000).toNumber())
  const isToday = now.getFullYear() === value.getFullYear() && now.getMonth() === value.getMonth() && now.getDate() === value.getDate();

  const formatter = new Intl.DateTimeFormat('en', {
    year: now.getFullYear() !== value.getFullYear() ? '2-digit' : undefined,
    month: !isToday ? '2-digit' : undefined,
    day: !isToday ? '2-digit' : undefined,
    hour: '2-digit',
    minute: '2-digit',
    formatMatcher: 'best fit',
  });
  return formatter.format(value);
  //} 
}

export default function PeriodHeader({ periodType, startLevel, endLevel, disabled, periodIndex, currentLevel, blockTime }: PeriodHeaderProps) {
  const periodName = periodType === PeriodType.Proposal ? 'Proposal' : 'Promotion';

  const startDate = getLevelDateTime(startLevel, currentLevel, blockTime);
  const endDate = getLevelDateTime(endLevel, currentLevel, blockTime);
  const postfix = `${startDate} - ${endDate}`;

  return <div className="flex flex-col items-start">
    <Link href={`/period/${periodIndex}`} disabled={disabled}>{`${periodName}`}</Link>
    <span className="text-[10px]">{postfix}</span>
  </div>
}