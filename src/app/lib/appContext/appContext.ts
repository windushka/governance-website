import { BlockchainProvider } from '../blockchain';
import { Config } from '../config';
import { Explorer } from '../explorer';
import { GovernanceConfigProvider, GovernanceStateProvider, GovernancePeriodsProvider, GovernanceOperationsProvider } from '../governance';

export interface AppContext {
  config: Config;
  blockchain: BlockchainProvider;
  explorer: Explorer;
  governance: {
    config: GovernanceConfigProvider;
    state: GovernanceStateProvider;
    periods: GovernancePeriodsProvider;
    operations: GovernanceOperationsProvider;
  }
}