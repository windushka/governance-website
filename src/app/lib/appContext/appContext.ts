import { BlockchainProvider } from '../blockchain';
import { Config } from '../config';
import { Explorer } from '../explorer';
import { GovernanceConfigProvider, GovernanceStateProvider, GovernancePeriodsProvider } from '../governance';

export interface AppContext {
  config: Config;
  blockchain: BlockchainProvider;
  explorer: Explorer;
  governance: {
    config: GovernanceConfigProvider;
    state: GovernanceStateProvider;
    periods: GovernancePeriodsProvider;
  }
}