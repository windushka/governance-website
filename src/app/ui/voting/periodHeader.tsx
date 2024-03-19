import { PeriodType } from "@/app/lib/governance/state/state"
import BigNumber from 'bignumber.js'
import Link from "@/app/ui/common/link";

interface PeriodHeaderProps {
  periodType: PeriodType;
  disabled?: boolean;
  periodIndex: BigNumber;
  startLevel?: BigNumber;
  endLevel?: BigNumber;
}

export default function PeriodHeader({ periodType, startLevel, endLevel, disabled, periodIndex }: PeriodHeaderProps) {
  const periodName = periodType === PeriodType.Proposal ? 'Proposal' : 'Promotion';
  const postfix = startLevel && endLevel ? `${startLevel} - ${endLevel}` : '';

  return <div className="flex flex-col items-center">
    <Link href={`/period/${periodIndex}`} disabled={disabled}>{`${periodName}`}</Link>
    <span className="text-[10px]">{postfix}</span>
  </div>
}