import { PeriodType } from "@/app/lib/governance/state/state"
import BigNumber from 'bignumber.js'

interface PeriodHeaderProps {
    periodType: PeriodType;
    startLevel: BigNumber;
    endLevel: BigNumber;
}

export default function PeriodHeader({ periodType, startLevel, endLevel }: PeriodHeaderProps) {
    const periodName = periodType === PeriodType.Proposal ? 'Proposal' : 'Promotion';
    return <span>{periodName} ({startLevel.toString()} - {endLevel.toString()})</span>;
}