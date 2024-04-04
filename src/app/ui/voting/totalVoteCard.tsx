import { formatPercentageCompact, getVotingPowerPercent } from '@/app/lib/governance/utils';
import { IntValuePure, appTheme } from "@/app/ui/common";
import clsx from "clsx";

interface TotalVoteCardProps {
  text: string;
  votingPower: bigint;
  totalVotingPower: bigint;
  className?: string;
}

export const TotalVoteCard = ({ text, votingPower, totalVotingPower, className }: TotalVoteCardProps) => {
  return <div className={clsx(appTheme.componentBgColor, 'flex flex-column justify-center grow shrink basis-0 border py-4 px-8', className)}>
    <span>{text}:&nbsp;</span>
    <IntValuePure value={votingPower} />
    &nbsp;({formatPercentageCompact(getVotingPowerPercent(votingPower, totalVotingPower))})
  </div>
}