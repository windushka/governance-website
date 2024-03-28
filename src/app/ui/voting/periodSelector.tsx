'use client'

import { redirectToPeriodPage } from '@/app/actions';
import { GovernancePeriod } from '@/app/lib/governance';
import { formatDateTime } from '@/app/lib/governance/utils';
import { ConfigProvider, Select, SelectProps, theme } from 'antd';

interface PeriodSelectorProps {
  contractName: string;
  periods: GovernancePeriod[];
  currentPeriodIndex: bigint;
}

const labelRender: SelectProps['labelRender'] = (props) => {
  const { value } = props;

  return <span>{value}</span>;
};

const filterOption = (input: string, option?: { label: string; value: string }) =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

export default function PeriodSelector({ contractName, periods, currentPeriodIndex }: PeriodSelectorProps) {
  let options = periods.map(p => ({
    value: p.index.toString(),
    label: `${p.index}. ${p.type} (${formatDateTime(p.startTime)} - ${formatDateTime(p.endTime)})${p.winnerPayload ? ' (new winner)' : ''}`
  }));

  return <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
    }}>
    <Select
      defaultValue={currentPeriodIndex.toString()}
      style={{ height: 40 }}
      labelRender={labelRender}
      showSearch
      optionFilterProp="children"
      filterOption={filterOption}
      dropdownStyle={{ width: 500 }}
      onChange={(v) => redirectToPeriodPage(contractName, v)}
      options={options}
    />
  </ConfigProvider>

}