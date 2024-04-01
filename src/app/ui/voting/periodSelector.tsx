'use client'

import { redirectToPeriodPage, getPeriods } from '@/app/actions';
import { Contract } from '@/app/lib/config';
import { GovernanceConfig, GovernancePeriod } from '@/app/lib/governance';
import { formatDateTime } from '@/app/lib/governance/utils';
import { ConfigProvider, Select, SelectProps, theme } from 'antd';
import { useEffect, useState } from 'react';

interface PeriodSelectorProps {
  contract: Contract;
  config: GovernanceConfig;
  currentPeriodIndex: number;
}

const labelRender: SelectProps['labelRender'] = (props) => {
  const { value } = props;

  return <span>{value}</span>;
};

const filterOption = (input: string, option?: { label: string; value: string }) =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

export default function PeriodSelector({ contract, config, currentPeriodIndex }: PeriodSelectorProps) {
  const [loading, setLoading] = useState(true); 
  const [periods, setPeriods] = useState<GovernancePeriod[]>([]);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const periods = await getPeriods(contract.address, config);
      setPeriods(periods);
      setLoading(false);
    })()
  }, [config, contract.address])

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
      loading={loading}
      style={{ height: 40, width: opened ? 200 : 'auto' }}
      labelRender={labelRender}
      showSearch
      optionFilterProp="children"
      open={opened}
      filterOption={filterOption}
      dropdownStyle={{ width: 500 }}
      onDropdownVisibleChange={(e) => setOpened(!!e)}
      onChange={(v) => redirectToPeriodPage(contract.name, v)}
      options={options}
    />
  </ConfigProvider>

}