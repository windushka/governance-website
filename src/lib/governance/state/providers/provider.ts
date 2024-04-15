import { GovernanceConfig } from '../../config';
import { GovernanceState } from '../state';

export interface GovernanceStateProvider {
  getState(contractAddress: string, config: GovernanceConfig, periodIndex: number): Promise<GovernanceState>;
}
