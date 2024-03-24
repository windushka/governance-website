'use client'

import { redirectToPeriodPage } from '@/app/actions';
import { ConfigProvider, Select, SelectProps, theme } from 'antd';

interface PeriodSelectorProps {
  contractName: string;
  minValue: number;
  maxValue: number;
  value: number;
}

const labelRender: SelectProps['labelRender'] = (props) => {
  const { value } = props;

  return <span>{value}</span>;
};

const filterOption = (input: string, option?: { label: string; value: string }) =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

export default function PeriodSelector({ contractName, minValue, maxValue, value }: PeriodSelectorProps) {
  let options = [];
  for (let i = minValue; i <= maxValue; i++)
    options.push({ value: i.toString(), label: `Period: ${i}` });

  return <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
    }}>
    <Select
      defaultValue={value.toString()}
      style={{ height: 40, minWidth: 100 }}
      labelRender={labelRender}
      showSearch
      optionFilterProp="children"
      filterOption={filterOption}
      dropdownStyle={{ width: 120 }}
      onChange={(v) => redirectToPeriodPage(contractName, +v)}
      options={options}
    />
  </ConfigProvider>

}