import { GovernanceConfig } from '../config';

export interface GovernanceConfigProvider {
  getConfig(contractAddress: string): Promise<GovernanceConfig>;
}