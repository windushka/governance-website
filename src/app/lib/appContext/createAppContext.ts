import { TezosToolkit } from '@taquito/taquito';
import { TzktApiProvider } from '../api';
import { ghostnetConfig } from '../config';
import { RpcGovernanceConfigProvider, RpcGovernanceStateProvider } from '../governance';
import { AppContext } from './appContext';

export const createAppContext = (): AppContext => {
  const config = ghostnetConfig; //TODO select depending on env
  const toolkit = new TezosToolkit(config.rpcUrl);
  const apiProvider = new TzktApiProvider(config.tzktApiUrl);

  return {
    config,
    apiProvider,
    governanceConfigProvider: new RpcGovernanceConfigProvider(toolkit),
    governanceStateProvider: new RpcGovernanceStateProvider<string>(config.rpcUrl, apiProvider)
  }
}
