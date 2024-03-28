import { BlockchainProvider } from '../blockchain';
import { Config } from '../config';
import { GovernanceConfigProvider, GovernanceStateProvider, GovernancePeriodsProvider } from '../governance';

export interface AppContext {
  config: Config;
  blockchain: BlockchainProvider;
  governance: {
    config: GovernanceConfigProvider;
    state: GovernanceStateProvider;
    periods: GovernancePeriodsProvider;
  }
}