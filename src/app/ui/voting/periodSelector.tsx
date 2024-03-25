'use client'

import { redirectToPeriodPage } from '@/app/actions';
import { GovernancePeriod } from '@/app/lib/governance';
import { ConfigProvider, Select, SelectProps, theme } from 'antd';

interface PeriodSelectorProps {
  contractName: string;
  periods: GovernancePeriod[];
  currentPeriodIndex: number;
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
    label: `${p.index}. ${p.type}`
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
      dropdownStyle={{ width: 220 }}
      onChange={(v) => redirectToPeriodPage(contractName, +v)}
      options={options}
    />
  </ConfigProvider>

}