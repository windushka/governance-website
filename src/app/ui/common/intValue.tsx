import { memo } from 'react';

interface VotingPowerProps {
  value: bigint;
  className?: string;
}

export const IntValue = ({ value, className }: VotingPowerProps) => {
  const content = Intl.NumberFormat('en-US', {
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseInt(value.toString()));

  return <span title={value.toString()} className={className}>{content}</span>
};

export const IntValuePure = memo(IntValue);