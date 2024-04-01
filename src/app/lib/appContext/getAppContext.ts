import { TezosToolkit } from '@taquito/taquito';
import { TzktProvider } from '../blockchain';
import { ghostnetConfig } from '../config';
import { RpcGovernancePeriodsProvider, RpcGovernanceConfigProvider, RpcGovernanceStateProvider, RpcGovernanceOperationsProvider } from '../governance';
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
        config: new RpcGovernanceConfigProvider(toolkit),
        state: new RpcGovernanceStateProvider(config.rpcUrl, blockchainProvider),
        periods: new RpcGovernancePeriodsProvider(toolkit, blockchainProvider),
        operations: new RpcGovernanceOperationsProvider(blockchainProvider)
      }
    };
  }

  return appContext;
}
