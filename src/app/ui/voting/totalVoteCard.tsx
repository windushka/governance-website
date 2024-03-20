import VotingPower from "@/app/ui/common/votingPower";
import BigNumber from 'bignumber.js';
import clsx from "clsx";

interface TotalVoteCardProps {
  text: string;
  value: BigNumber;
  className?: string;
}

export default function TotalVoteCard({ text, value, className }: TotalVoteCardProps) {
  return <div className={clsx(className, "flex flex-column gap-8 border border-slate-500 py-4 px-8")}>
    <span>{text}</span>
    <VotingPower value={value} />
  </div>
}