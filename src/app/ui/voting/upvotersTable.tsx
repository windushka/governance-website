'use client'

import { ReactNode, useEffect, useState } from 'react';
import { IntValuePure, LinkPure, TablePure, appTheme, useClientContext } from '@/app/ui/common';
import { PayloadKey } from './payloadKey';
import { formatDateTime } from '@/app/lib/governance/utils';
import { getUpvoters } from '@/app/actions';
import { Upvoter } from '@/app/lib/governance';
import { ColumnsType } from 'antd/es/table';
import clsx from 'clsx';
import Media from 'react-media';

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

  const context = useClientContext();
  const rowClassName = 'flex flex-col gap-1';
  const labelClassName = appTheme.disabledTextColor;
  const renderBaker: (...args: Parameters<NonNullable<ColumnsType<Upvoter>['0']['render']>>) => ReactNode = (_, r) => {
    return <LinkPure className={clsx(appTheme.textColor, 'underline hover:underline')} href={context.explorer.getOperationUrl(r.operationHash)} target="_blank">{r.alias || r.address}</LinkPure>;
  };

  return <Media query={`(max-width: ${appTheme.screenSMMaxWidth})`}>
    {isSmallScreen => {
      const columns: ColumnsType<Upvoter> = isSmallScreen
        ? [{
          title: 'Operation',
          dataIndex: 'operationTime',
          render: (_, r, i) => <div className="flex flex-col gap-4">
            <div className={rowClassName}>
              <span className={labelClassName}>Baker</span>
              {renderBaker(_, r, i)}
            </div>
            <div className={rowClassName}>
              <span className={labelClassName}>Voting Power</span>
              <IntValuePure value={r.votingPower} />
            </div>
            <div className={rowClassName}>
              <span className={labelClassName}>Payload</span>
              <PayloadKey value={r.proposalKey} />
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
            title: 'Proposal',
            dataIndex: 'proposal',
            render: (_, r) => <PayloadKey value={r.proposalKey} />,
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