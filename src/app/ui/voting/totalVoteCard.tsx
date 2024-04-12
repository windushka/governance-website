import { formatPercentageCompact, getVotingPowerPercent } from '@/app/lib/governance/utils';
import { IntValuePure, appTheme } from "@/app/ui/common";
import { MinusCircleIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import clsx from "clsx";

export enum TotalVoteType {
  Yea, Nay, Pass
}

interface TotalVoteCardProps {
  type: TotalVoteType;
  votingPower: bigint;
  totalVotingPower: bigint;
  className?: string;
}

export const TotalVoteCard = ({ type, votingPower, totalVotingPower, className }: TotalVoteCardProps) => {
  const iconClassName = 'h-5 w-5'
  const [text, textColor, icon] = type === TotalVoteType.Yea
    ? ['Yea', appTheme.accentBorderColor, <HandThumbUpIcon key={1} className={clsx(iconClassName, appTheme.accentTextColor)} />]
    : type === TotalVoteType.Nay
      ? ['Nay', appTheme.redBorderColor, <HandThumbDownIcon key={2} className={clsx(iconClassName, appTheme.redTextColor)} />]
      : ['Pass', appTheme.whiteBorderColor, <MinusCircleIcon key={3} className={clsx(iconClassName)} />]

  return <div className={clsx(appTheme.componentBgColor, appTheme.componentBgHoverColor, 'flex flex-row justify-center items-center gap-4 grow shrink basis-0 border p-2 xl:py-4 xl:px-8', textColor, className)}>
    {icon}
    <div className="flex flex-row">
      {formatPercentageCompact(getVotingPowerPercent(votingPower, totalVotingPower))}
      <div>&nbsp;(<IntValuePure value={votingPower} />)</div>
    </div>
    <span>{text}</span>
  </div>
}