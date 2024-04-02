'use client'

import { getAppContext } from '@/app/lib/appContext';
import { useEffect, useState } from 'react';
import { IntValuePure, LinkPure, TablePure, appTheme } from '@/app/ui/common';
import PayloadKey from './payloadKey';
import { formatDateTime } from '@/app/lib/governance/utils';
import { getUpvoters } from '@/app/actions';
import { Upvoter } from '@/app/lib/governance';
import { ColumnsType } from 'antd/es/table';
import clsx from 'clsx';

interface UpvotersTableProps {
  contractAddress: string;
  upvotersBigMapId: string | null;
  periodStartLevel: number;
  periodEndLevel: number;
}

export const UpvotersTable = ({ contractAddress, upvotersBigMapId, periodStartLevel, periodEndLevel }: UpvotersTableProps) => {
  const [loading, setLoading] = useState(true);
  const [voters, setVoters] = useState<Upvoter[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const voters = upvotersBigMapId
        ? await getUpvoters(
          contractAddress,
          periodStartLevel,
          periodEndLevel)
        : [];
      setVoters(voters);
      setLoading(false);
    })();
  }, [contractAddress, upvotersBigMapId, periodStartLevel, periodEndLevel]);

  const context = getAppContext();

  const columns: ColumnsType<Upvoter> = [
    {
      title: 'Baker',
      dataIndex: 'address',
      render: (_, r) => <LinkPure className={clsx(appTheme.textColor, 'underline')} href={context.explorer.getOperationUrl(r.operationHash)} target="_blank">{r.alias || r.address}</LinkPure>,
      sorter: (a, b) => (a.alias || a.address).localeCompare(b.alias || b.address),
    },
    {
      title: 'Voting power',
      dataIndex: 'votingPower',
      render: (_, r) => <IntValuePure value={r.votingPower} />,
      sorter: (a, b) => parseInt((a.votingPower - b.votingPower).toString()),
    },
    {
      title: 'Proposal',
      dataIndex: 'proposal',
      render: (_, r) => <PayloadKey value={r.proposalKey} />,
    },
    {
      title: 'Time',
      dataIndex: 'operationTime',
      render: (_, r) => <span>{formatDateTime(r.operationTime)}</span>,
      sorter: (a, b) => a.operationTime.getTime() - b.operationTime.getTime(),
    },
  ];

  return <TablePure rowKey="operationHash" dataSource={voters} columns={columns} loading={loading} />
}
