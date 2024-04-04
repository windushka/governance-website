import { TezosToolkit } from '@taquito/taquito';
import { TzktProvider } from '../blockchain';
import { Config, ghostnetConfig, ghostnetTestConfig, mainnetConfig } from '../config';
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
import { TzktExplorer } from '../explorer';

let appContext: AppContext | undefined;
export const getAppContext = (): AppContext => {
  if (!appContext) {
    const config = getConfig();
    const toolkit = new TezosToolkit(config.rpcUrl);
    const blockchainProvider = new TzktProvider(config.tzktApiUrl);

    appContext = {
      config,
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

const getConfig = (): Config => {
  const envValue = process.env.NETWORK;
  switch (envValue) {
    case 'ghostnet':
      return ghostnetConfig;
    case 'ghostnet_test':
      return ghostnetTestConfig;
    case 'mainnet':
      return mainnetConfig;
  }
  console.log(envValue);
  throw new Error(`Incorrect process.env.NETWORK value: ${envValue}`);
} 