import { TezosToolkit } from '@taquito/taquito';
import { TzktProvider } from '../blockchain';
import { ghostnetConfig } from '../config';
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
    const config = ghostnetConfig; //TODO select depending on env
    const toolkit = new TezosToolkit(config.rpcUrl);
    const blockchainProvider = new TzktProvider(config.tzktApiUrl);

    appContext = {
      config,
      blockchain: blockchainProvider,
      explorer: new TzktExplorer(config.tzktExplorerUrl),
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
