'use client'

import { Config } from '@/lib/config';
import { ConfigProvider, Select, theme } from 'antd';
import { useRouter } from 'next/navigation'
import { memo } from 'react';

interface NetworkSelectorProps {
  allConfigs: Config[];
  currentConfigKey: Config['key'];
}

export const NetworkSelector = ({ allConfigs, currentConfigKey }: NetworkSelectorProps) => {
  const options = allConfigs.map(n => ({
    value: n.key,
    label: n.name
  }));

  const router = useRouter();

  const onChange = (value: string) => {
    const selectedNetwork = allConfigs.find(n => n.key === value);
    if (!selectedNetwork)
      return;

    router.push(selectedNetwork.url);
  };

  return <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
    }}>
    <Select
      defaultValue={currentConfigKey}
      style={{ width: 100 }}
      onChange={onChange}
      options={options}
      size='small'
    />
  </ConfigProvider>
};

export const NetworkSelectorPure = memo(NetworkSelector);