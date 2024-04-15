'use client'

import { ReactNode, useEffect, useState } from 'react';
import { Vote, Voter } from '@/lib/governance';
import { ColumnsType } from 'antd/es/table';
import { getVoters } from '@/app/actions';
import { IntValuePure, LinkPure, TablePure, appTheme, useClientContext } from '@/app/components';
import { formatDateTime } from '@/lib/governance/utils';
import clsx from 'clsx';
import Media from 'react-media';

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
  const rowClassName = 'flex flex-col gap-1';
  const labelClassName = appTheme.disabledTextColor;
  const renderBaker: (...args: Parameters<NonNullable<ColumnsType<Voter>['0']['render']>>) => ReactNode = (_, r) => {
    return <LinkPure className={clsx(appTheme.textColor, 'underline hover:underline')} href={context.explorer.getOperationUrl(r.operationHash)} target="_blank">{r.alias || r.address}</LinkPure>;
  };
  const renderVote: (...args: Parameters<NonNullable<ColumnsType<Voter>['0']['render']>>) => ReactNode = (_, r) => {
    return <span className={clsx(r.vote === 'yea' && appTheme.accentTextColor, r.vote === 'nay' && appTheme.redTextColor)}>{r.vote}</span>;
  };

  return <Media query={`(max-width: ${appTheme.screenSMMaxWidth})`}>
    {isSmallScreen => {
      const columns: ColumnsType<Voter> = isSmallScreen
        ? [{
          title: 'Operation',
          dataIndex: 'operationTime',
          render: (v, r, i) => <div className="flex flex-col gap-4">
            <div className={rowClassName}>
              <span className={labelClassName}>Baker</span>
              {renderBaker(v, r, i)}
            </div>
            <div className={rowClassName}>
              <span className={labelClassName}>Voting Power</span>
              <IntValuePure value={r.votingPower} />
            </div>
            <div className={rowClassName}>
              <span className={labelClassName}>Vote</span>
              {renderVote(v, r, i)}
            </div>
            <div className={rowClassName}>
              <span className={labelClassName}>Date</span>
              <span>{formatDateTime(r.operationTime)}</span>
            </div>
          </div>,
          sorter: (a, b) => a.operationTime.getTime() - b.operationTime.getTime(),
          defaultSortOrder: 'descend'
        }]
        : [
          {
            title: 'Baker',
            dataIndex: 'address',
            render: renderBaker,
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
            render: renderVote,
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
    }}
  </Media>;
}