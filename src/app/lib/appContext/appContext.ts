import { ApiProvider } from '../api';
import { Config } from '../config';
import { GovernanceConfigProvider, GovernanceStateProvider } from '../governance';

export interface AppContext {
  config: Config;
  apiProvider: ApiProvider;
  governanceConfigProvider: GovernanceConfigProvider;
  governanceStateProvider: GovernanceStateProvider<string>;
}