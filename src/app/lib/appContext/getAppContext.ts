import { TezosToolkit } from '@taquito/taquito';
import { TzktProvider } from '../blockchain';
import { Config, BaseConfig, ghostnetConfig, ghostnetTestConfig, mainnetConfig, allConfigs } from '../config';
import {
  RpcGovernancePeriodsProvider,
  RpcGovernanceConfigProvider,
  RpcGovernanceStateProvider,
  RpcGovernanceOperationsProvider,
  CachingGovernanceConfigProvider,
  CachingGovernanceStateProvider,
  CachingGovernancePeriodsProvider,
  CachingGovernanceOperationsProvider
} from '../governance';
import { AppContext } from './appContext';

let appContext: AppContext | undefined;
export const getAppContext = (): AppContext => {
  if (!appContext) {
    const config = getConfig(getBaseConfig());
    const toolkit = new TezosToolkit(config.rpcUrl);
    const blockchainProvider = new TzktProvider(config.tzktApiUrl);

    appContext = {
      config,
      allConfigs: allConfigs.map(c => getConfig(c)),
      blockchain: blockchainProvider,
      governance: {
        config: new CachingGovernanceConfigProvider(new RpcGovernanceConfigProvider(toolkit)),
        state: new CachingGovernanceStateProvider(new RpcGovernanceStateProvider(config.rpcUrl, blockchainProvider), blockchainProvider),
        periods: new CachingGovernancePeriodsProvider(new RpcGovernancePeriodsProvider(toolkit, blockchainProvider), blockchainProvider),
        operations: new CachingGovernanceOperationsProvider(new RpcGovernanceOperationsProvider(blockchainProvider), blockchainProvider)
      }
    };
  }

  return appContext;
}

const getConfig = (baseConfig: BaseConfig): Config => {
  const domainsEnvVariable = process.env.DOMAINS;
  if (!domainsEnvVariable)
    throw new Error('The DOMAINS env variable is not set');

  const domains = JSON.parse(domainsEnvVariable);
  const url = domains[baseConfig.key];
  if (!url)
    throw new Error(`The DOMAINS env variable does not contain url for key: ${baseConfig.key}`);

  return {
    ...baseConfig,
    url
  };
}

const getBaseConfig = (): BaseConfig => {
  const envValue = process.env.NETWORK;
  switch (envValue) {
    case 'ghostnet':
      return ghostnetConfig;
    case 'ghostnet_test':
      return ghostnetTestConfig;
    case 'mainnet':
      return mainnetConfig;
  }
  throw new Error(`Incorrect process.env.NETWORK value: ${envValue}`);
} 