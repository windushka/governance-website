import { ApiProvider } from '../api';
import { Config } from '../config';
import { GovernanceConfigProvider, GovernanceStateProvider, GovernancePeriodsProvider } from '../governance';

export interface AppContext {
  config: Config;
  apiProvider: ApiProvider;
  governance: {
    configProvider: GovernanceConfigProvider;
    stateProvider: GovernanceStateProvider;
    periodsProvider: GovernancePeriodsProvider;
  }
}