'use client'

import { ConfigProvider, Table as AntTable, TableProps as AntTableProps, theme, } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { memo } from 'react';
import { appTheme } from './appTheme';

interface TableProps<RecordType = any> {
  rowKey: AntTableProps<RecordType>['rowKey'];
  dataSource: AntTableProps<RecordType>['dataSource'];
  columns: AntTableProps<RecordType>['columns'];
  loading?: boolean;
}

export const Table = ({ rowKey, dataSource, columns, loading }: TableProps) => {
  return <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
    }}>
    <AntTable
      rowKey={rowKey}
      dataSource={dataSource}
      columns={columns}
      loading={loading ? { spinning: true, indicator: <LoadingOutlined style={{ fontSize: 36, color: appTheme.textColorValue }} spin /> } : false}
      pagination={false}
      showSorterTooltip={false}
      scroll={{ x: true }}
      size='middle' />
  </ConfigProvider>
}

export const TablePure = memo(Table); 