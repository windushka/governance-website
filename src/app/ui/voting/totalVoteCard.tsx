import { IntValuePure } from "@/app/ui/common";
import clsx from "clsx";

interface TotalVoteCardProps {
  text: string;
  value: bigint;
  className?: string;
}

export default function TotalVoteCard({ text, value, className }: TotalVoteCardProps) {
  return <div className={clsx("flex flex-column gap-8 border py-4 px-8", className)}>
    <span>{text}</span>
    <IntValuePure value={value} />
  </div>
}