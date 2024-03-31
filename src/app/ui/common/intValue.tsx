import { memo } from 'react';

interface VotingPowerProps {
  value: bigint;
  className?: string;
}

export const IntValue = ({ value, className }: VotingPowerProps) => {
  const content = Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(parseInt(value.toString()));

  const title = Intl.NumberFormat('en-US', {
    notation: "standard",
  }).format(parseInt(value.toString()));

  return <span title={title} className={className}>{content}</span>
};

export const IntValuePure = memo(IntValue);