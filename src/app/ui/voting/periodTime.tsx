'use client'

import { formatDateTimeCompact } from '@/app/lib/governance/utils';

interface PeriodTimeProps {
  time: Date;
  level: bigint;
}

export default function PeriodTime({ time, level }: PeriodTimeProps) {
  const now = new Date();
  const timeStr = formatDateTimeCompact(time);
  const isEstimatedTime = now < time;
  const content = `${timeStr}${isEstimatedTime ? '*' : ''}`;
  const title = `Level: ${level.toString()}; ${isEstimatedTime ? ' Estimated ' : ' '}Time: ${time.toLocaleString()}`

  return <span title={title}>{content}</span>
}