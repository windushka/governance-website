import { getAppContext } from '@/app/lib/appContext';
import { memo } from 'react';
import { IntValuePure, LinkPure } from '@/app/ui/common';
import { formatDateTimeCompact } from '@/app/lib/governance/utils';
import clsx from 'clsx';

interface VotersTableProps {
  contractAddress: string;
  votersBigMapId: string | null;
  periodStartLevel: number;
  periodEndLevel: number;
}

export const VotersTable = async ({ contractAddress, votersBigMapId, periodStartLevel, periodEndLevel }: VotersTableProps) => {
  const context = getAppContext();
  const voters = votersBigMapId ? await context.governance.operations.getVoters(
    contractAddress,
    votersBigMapId,
    periodStartLevel,
    periodEndLevel
  ) : [];

  const tableCellClass = 'text-center border border-slate-500 p-2';

  return voters.length ? <table className="table-auto w-full border-collapse border border-slate-500 text-sm">
    <thead>
      <tr>
        <th className={tableCellClass}>Baker</th>
        <th className={tableCellClass}>Voting power</th>
        <th className={tableCellClass}>Vote</th>
        <th className={tableCellClass}>Time</th>
      </tr>
    </thead>
    <tbody>
      {voters.map(v =>
        <tr key={v.address}>
          <td className={clsx(tableCellClass, 'underline')}>
            <LinkPure href={context.explorer.getOperationUrl(v.operationHash)} target="_blank">{v.alias || v.address}</LinkPure>
          </td>
          <td className={tableCellClass}><IntValuePure value={v.votingPower} /></td>
          <td className={clsx(tableCellClass, v.vote === 'yea' && 'text-emerald-400', v.vote === 'nay' && 'text-red-400')}>{v.vote}</td>
          <td className={tableCellClass}>{formatDateTimeCompact(v.operationTime)}</td>
        </tr>)}
    </tbody>
  </table> : null;
}

export const VotersTablePure = memo(VotersTable);