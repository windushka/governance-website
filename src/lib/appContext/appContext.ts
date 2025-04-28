import { BlockchainProvider } from '../blockchain';
import { Config, Contract } from '../config';
import { GovernanceConfigProvider, GovernanceStateProvider, GovernancePeriodsProvider, GovernanceOperationsProvider } from '../governance';

export interface AppContext {
  config: Config;
  getContracts: (currentBlockLevel: number) => Contract[]
  allConfigs: Config[];
  blockchain: BlockchainProvider;
  governance: {
    config: GovernanceConfigProvider;
    state: GovernanceStateProvider;
    periods: GovernancePeriodsProvider;
    operations: GovernanceOperationsProvider;
  }
}
