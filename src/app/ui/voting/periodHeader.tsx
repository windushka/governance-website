import { PeriodType } from "@/app/lib/governance/state/state"
import Link from "@/app/ui/common/link";
import { getPeriodPageUrl } from '@/app/actions';

interface PeriodHeaderProps {
  contractName: string;
  periodType: PeriodType;
  disabled?: boolean;
  periodIndex: bigint;
  blockTime: bigint;
  currentLevel: bigint;
  startLevel: bigint;
  endLevel: bigint;
}

const getLevelDateTime = (level: bigint, currentLevel: bigint, blockTime: bigint): string => {
  //if (level.gt(currentLevel)) {
  const now = new Date();
  const nowSeconds = Math.floor(Date.now() / 1000);
  const restSeconds = (parseInt(level.toString()) - parseInt(currentLevel.toString())) * parseInt(blockTime.toString());
  const value = new Date((nowSeconds + restSeconds) * 1000);
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

export default function PeriodHeader({ contractName, periodType, startLevel, endLevel, disabled, periodIndex, currentLevel, blockTime }: PeriodHeaderProps) {
  const periodName = periodType === PeriodType.Proposal ? 'Proposal' : 'Promotion';

  const startDate = getLevelDateTime(startLevel, currentLevel, blockTime);
  const endDate = getLevelDateTime(endLevel, currentLevel, blockTime);
  const postfix = `${startDate} - ${endDate}`;

  return <div className="flex flex-col items-start">
    <Link href={getPeriodPageUrl(contractName, periodIndex.toString())} disabled={disabled}>{`${periodName}`}</Link>
    <span className="text-[10px]">{postfix}</span>
  </div>
}