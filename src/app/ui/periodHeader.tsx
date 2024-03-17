import { PeriodType } from "@/app/lib/governance/state/state"
import BigNumber from 'bignumber.js'

interface PeriodHeaderProps {
  periodType: PeriodType;
  disabled?: boolean;
  startLevel?: BigNumber;
  endLevel?: BigNumber;
}

export default function PeriodHeader({ periodType, startLevel, endLevel, disabled }: PeriodHeaderProps) {
  const periodName = periodType === PeriodType.Proposal ? 'Proposal' : 'Promotion';
  const postfix = startLevel && endLevel ? `(${startLevel.toString()} - ${endLevel.toString()})` : '';
  return <span className={disabled ? 'text-slate-400' : ''}>{periodName} {postfix}</span>;
}