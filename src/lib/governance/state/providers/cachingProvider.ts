import { GovernanceStateProvider } from './provider';
import { GovernanceConfig, GovernanceState } from '../..';
import { getLastBlockOfPeriod } from '../../utils';
import { BlockchainProvider } from '@/lib/blockchain';

export class CachingGovernanceStateProvider implements GovernanceStateProvider {
  private readonly cache = new Map<string, GovernanceState>();

  constructor(
    private readonly provider: GovernanceStateProvider,
    private readonly blockchainProvider: BlockchainProvider
  ) { }

  async getState(contractAddress: string, config: GovernanceConfig, periodIndex: number): Promise<GovernanceState> {
    const key = this.getCacheKey(contractAddress, periodIndex);
    let state = this.cache.get(key);
    if (!state) {
      const promiseResults = await Promise.all([
        this.blockchainProvider.getCurrentBlockLevel(),
        this.provider.getState(contractAddress, config, periodIndex)
      ]);
      const currentBlockLevel = promiseResults[0];
      state = promiseResults[1];
      const lastBlockOfRequestedPeriod = getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);

      if (currentBlockLevel >= lastBlockOfRequestedPeriod)
        this.cache.set(key, state);
    }

    return state;
  }

  private getCacheKey(contractAddress: string, periodIndex: number): string {
    return `${contractAddress}-${periodIndex}`;
  }
}