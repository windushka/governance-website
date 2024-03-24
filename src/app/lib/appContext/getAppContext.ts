import { TezosToolkit } from '@taquito/taquito';
import { TzktApiProvider } from '../api';
import { ghostnetConfig } from '../config';
import { RpcGovernanceConfigProvider, RpcGovernanceStateProvider } from '../governance';
import { AppContext } from './appContext';

let appContext: AppContext | undefined;
export const getAppContext = (): AppContext => {
  if (!appContext) {
    const config = ghostnetConfig; //TODO select depending on env
    const toolkit = new TezosToolkit(config.rpcUrl);
    const apiProvider = new TzktApiProvider(config.tzktApiUrl);

    appContext = {
      config,
      apiProvider,
      governanceConfigProvider: new RpcGovernanceConfigProvider(toolkit),
      governanceStateProvider: new RpcGovernanceStateProvider(config.rpcUrl, apiProvider)
    };
  }

  return appContext;
}
