import { TezosToolkit } from '@taquito/taquito';
import { TzktApiProvider } from '../api';
import { ghostnetConfig } from '../config';
import { RpcGovernancePeriodsProvider, RpcGovernanceConfigProvider, RpcGovernanceStateProvider } from '../governance';
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
      governance: {
        configProvider: new RpcGovernanceConfigProvider(toolkit),
        stateProvider: new RpcGovernanceStateProvider(config.rpcUrl, apiProvider),
        periodsProvider: new RpcGovernancePeriodsProvider(toolkit, apiProvider)
      }
    };
  }

  return appContext;
}
