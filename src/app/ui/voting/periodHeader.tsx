import { PeriodType } from "@/app/lib/governance/state/state"
import Link from "@/app/ui/common/link";
import { getPeriodPageUrl } from '@/app/actions';
import { formatDateTimeCompact } from '@/app/lib/governance/utils';
import PeriodTime from './periodTime';

interface PeriodHeaderProps {
  contractName: string;
  periodType: PeriodType;
  disabled?: boolean;
  periodIndex: bigint;
  startLevel: bigint;
  startTime: Date;
  endTime: Date;
  endLevel: bigint;
}

export default function PeriodHeader({
  contractName,
  periodType,
  disabled,
  periodIndex,
  startTime,
  startLevel,
  endTime,
  endLevel
}: PeriodHeaderProps) {
  const periodName = periodType === PeriodType.Proposal ? 'Proposal' : 'Promotion';

  return <div className="flex flex-col items-start">
    <Link href={getPeriodPageUrl(contractName, periodIndex.toString())} disabled={disabled}>{`${periodName}`}</Link>
    <div className="text-[10px]">
      <PeriodTime time={startTime} level={startLevel} /> - <PeriodTime time={endTime} level={endLevel} />
    </div>
  </div>
}