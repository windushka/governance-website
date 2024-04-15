'use client'

import { redirectToPeriodPage, getPeriods } from '@/app/actions';
import { Contract } from '@/lib/config';
import { GovernanceConfig, GovernancePeriod } from '@/lib/governance';
import { formatDateTime } from '@/lib/governance/utils';
import { ConfigProvider, Select, SelectProps, theme } from 'antd';
import clsx from 'clsx';
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

export const PeriodSelector = ({ contract, config, currentPeriodIndex }: PeriodSelectorProps) => {
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

  const options = periods.map(p => ({
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
      className={clsx('!h-[40px]', opened && 'sm:!w-[200px]')}
      labelRender={labelRender}
      showSearch
      optionFilterProp="children"
      open={opened}
      filterOption={filterOption}
      popupClassName="sm:!w-[500px]"
      onDropdownVisibleChange={(e) => setOpened(!!e)}
      onChange={(v) => redirectToPeriodPage(contract.name, v)}
      options={options}
    />
  </ConfigProvider>
};