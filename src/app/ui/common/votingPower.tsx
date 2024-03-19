import BigNumber from 'bignumber.js'

interface VotingPowerProps {
  value: BigNumber;
  className?: string;
}

export default function VotingPower({ value, className }: VotingPowerProps) {
  const content = Intl.NumberFormat('en-US', {
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value.toNumber());

  return <span title={value.toString()} className={className}>{content}</span>
}