'use client'

import { useEffect, useState } from 'react';
import { Vote, Voter } from '@/app/lib/governance';
import { ColumnsType } from 'antd/es/table';
import { getVoters } from '@/app/actions';
import { IntValuePure, LinkPure, TablePure, appTheme, useClientContext } from '../common';
import { formatDateTime } from '@/app/lib/governance/utils';
import clsx from 'clsx';

interface VotersTableProps {
  contractAddress: string;
  votersBigMapId: string | null;
  periodStartLevel: number;
  periodEndLevel: number;
}

export const VotersTable = ({ contractAddress, votersBigMapId, periodStartLevel, periodEndLevel }: VotersTableProps) => {
  const [loading, setLoading] = useState(true);
  const [voters, setVoters] = useState<Voter[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const voters = votersBigMapId
        ? await getVoters(
          contractAddress,
          periodStartLevel,
          periodEndLevel)
        : [];
      setVoters(voters);
      setLoading(false);
    })();
  }, [contractAddress, votersBigMapId, periodStartLevel, periodEndLevel]);

  const context = useClientContext();

  const columns: ColumnsType<Voter> = [
    {
      title: 'Baker',
      dataIndex: 'address',
      render: (_, r) => <LinkPure className={clsx(appTheme.textColor, 'underline hover:underline')} href={context.explorer.getOperationUrl(r.operationHash)} target="_blank">{r.alias || r.address}</LinkPure>,
      sorter: (a, b) => (a.alias || a.address).localeCompare(b.alias || b.address),
    },
    {
      title: 'Voting power',
      dataIndex: 'votingPower',
      render: (_, r) => <IntValuePure value={r.votingPower} />,
      sorter: (a, b) => parseInt((a.votingPower - b.votingPower).toString()),
    },
    {
      title: 'Vote',
      dataIndex: 'vote',
      render: (_, r) => <span className={clsx(r.vote === 'yea' && appTheme.accentTextColor, r.vote === 'nay' && appTheme.redTextColor)}>{r.vote}</span>,
      sorter: (a, b) => a.vote.localeCompare(b.vote),
      filters: [
        {
          text: 'Yea',
          value: Vote.Yea,
        },
        {
          text: 'Nay',
          value: Vote.Nay,
        },
        {
          text: 'Pass',
          value: Vote.Pass,
        },
      ],
      onFilter: (value, record) => record.vote.indexOf(value as string) === 0,
    },
    {
      title: 'Time',
      dataIndex: 'operationTime',
      render: (_, r) => <span>{formatDateTime(r.operationTime)}</span>,
      sorter: (a, b) => a.operationTime.getTime() - b.operationTime.getTime(),
      defaultSortOrder: 'descend'
    },
  ];

  return <TablePure rowKey="operationHash" dataSource={voters} columns={columns} loading={loading} />
}