import { BlockchainProvider } from '@/app/lib/blockchain';
import { GovernancePeriod } from '../types';
import { GovernancePeriodsProvider } from './provider';
import { GovernanceConfig } from '../..';

interface CacheValue {
  storedAtBlockLevel: number;
  periods: GovernancePeriod[];
}

export class CachingGovernancePeriodsProvider implements GovernancePeriodsProvider {
  private readonly cache = new Map<string, CacheValue>();

  constructor(
    private readonly provider: GovernancePeriodsProvider,
    private readonly blockchainProvider: BlockchainProvider,
    private readonly cacheLifetimeInBlocks: number = 10
  ) { }

  async getPeriods(contractAddress: string, config: GovernanceConfig): Promise<GovernancePeriod[]> {
    const currentBlockLevel = await this.blockchainProvider.getCurrentBlockLevel();
    let cacheValue = this.cache.get(contractAddress);
    if (!cacheValue || (currentBlockLevel - cacheValue.storedAtBlockLevel) > this.cacheLifetimeInBlocks) {
      cacheValue = {
        storedAtBlockLevel: currentBlockLevel,
        periods: await this.provider.getPeriods(contractAddress, config)
      }
      this.cache.set(contractAddress, cacheValue);
    }

    return cacheValue.periods;
  }
}