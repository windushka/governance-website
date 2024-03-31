import { memo } from 'react'
import BigNumber from 'bignumber.js'
import { formatPercentageCompact } from '@/app/lib/governance/utils';
import { Progress as ProgressAnt } from 'antd';
import clsx from 'clsx';

interface ProgressProps {
  value: BigNumber;
  target: BigNumber;
  text: string;
  className?: string;
}

export const Progress = ({ value, target, text, className }: ProgressProps) => {
  return <div className={clsx('flex flex-col', className)}>
    <div className="flex flex-row gap-6 justify-between">
      <span>{text}:</span>
      <span className={value.gte(target) ? 'text-emerald-400' : 'text-red-400'}>
        {`${formatPercentageCompact(value)} of ${formatPercentageCompact(target)}`}
      </span>
    </div>
    <ProgressAnt
      style={{ fontSize: 4 }}
      strokeWidth={2}
      size="small"
      percent={value.toNumber()}
      showInfo={false}
      strokeColor={value.gte(target) ? 'rgb(52, 211, 153)' : 'rgb(248, 113, 113)'}
      trailColor="rgb(71, 85, 105)"
      status={value.gte(target) ? 'success' : 'exception'} />
  </div>
};

export const ProgressPure = memo(Progress);