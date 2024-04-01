import { getAppContext } from '@/app/lib/appContext';
import { memo } from 'react';
import { IntValuePure, LinkPure } from '@/app/ui/common';
import PayloadKey from './payloadKey';
import { formatDateTimeCompact } from '@/app/lib/governance/utils';

interface UpvotersTableProps {
  contractAddress: string;
  upvotersBigMapId: string | null;
  periodStartLevel: number;
  periodEndLevel: number;
}

export const UpvotersTable = async ({ contractAddress, upvotersBigMapId, periodStartLevel, periodEndLevel }: UpvotersTableProps) => {
  const context = getAppContext();
  const upvoters = upvotersBigMapId ? await context.governance.operations.getUpvoters(
    contractAddress,
    upvotersBigMapId,
    periodStartLevel,
    periodEndLevel
  ) : [];

  const tableCellClass = 'text-center border border-slate-500 p-2';

  return upvoters.length ? <table className="table-auto w-full border-collapse border border-slate-500 text-sm">
    <thead>
      <tr>
        <th className={tableCellClass}>Baker</th>
        <th className={tableCellClass}>Voting power</th>
        <th className={tableCellClass}>Proposal</th>
        <th className={tableCellClass}>Time</th>
      </tr>
    </thead>
    <tbody>
      {upvoters.map(p => <tr key={JSON.stringify(p.proposalKey)}>
        <td className={tableCellClass}>
          <LinkPure className="underline" href={context.explorer.getOperationUrl(p.operationHash)} target="_blank">{p.alias || p.address}</LinkPure>
        </td>
        <td className={tableCellClass}><IntValuePure value={p.votingPower} /></td>
        <td className={tableCellClass}><PayloadKey value={p.proposalKey} /></td>
        <td className={tableCellClass}>{formatDateTimeCompact(p.operationTime)}</td>
      </tr>)}
    </tbody>
  </table> : <span className="block">No Upvoters</span>
}

export const UpvotersTablePure = memo(UpvotersTable);