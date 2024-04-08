import { TezosToolkit } from '@taquito/taquito';
import { TzktProvider } from '../blockchain';
import { Config, BaseConfig, allConfigs } from '../config';
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
    const config = buildConfig(getBaseConfig());
    if (!config)
      throw new Error('Impossible to build config. Check env variables');

    const toolkit = new TezosToolkit(config.rpcUrl);
    const blockchainProvider = new TzktProvider(config.tzktApiUrl);

    appContext = {
      config,
      allConfigs: allConfigs.map(c => buildConfig(c)).filter((c): c is Config => !!c),
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

const buildConfig = (baseConfig: BaseConfig): Config | null => {
  const domainsEnvVariable = process.env.DOMAINS;
  if (!domainsEnvVariable)
    throw new Error('The DOMAINS env variable is not set');

  const domains = JSON.parse(domainsEnvVariable);
  const url = domains[baseConfig.key];
  if (!url)
    return null;

  return {
    ...baseConfig,
    url
  };
}

const getBaseConfig = (): BaseConfig => {
  const networkKeyEnvValue = process.env.NETWORK_KEY;
  if (!networkKeyEnvValue)
    throw new Error('The NETWORK_KEY env variable is not set. See the .env.example file');

  const config = allConfigs.find(c => c.key === networkKeyEnvValue);
  if (!config)
    throw new Error(`There is no config with key: ${networkKeyEnvValue}`);

  return config;
} 