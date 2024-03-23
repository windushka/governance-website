import { GovernanceConfig } from '../../config';
import { GovernanceState } from '../state';
import BigNumber from 'bignumber.js';

export interface GovernanceStateProvider<T = unknown> {
  getState(contractAddress: string, config: GovernanceConfig, periodIndex?: BigNumber): Promise<GovernanceState<T>>;
}
