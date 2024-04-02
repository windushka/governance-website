import { BlockchainProvider } from '@/app/lib/blockchain';
import { GovernancePeriod } from '../types';
import { GovernancePeriodsProvider } from './provider';
import { GovernanceConfig } from '../..';

export class CachingGovernancePeriodsProvider implements GovernancePeriodsProvider {
  private lastBlockLevel: number = -1;
  private storedPeriods: GovernancePeriod[] = [];

  constructor(
    private readonly provider: GovernancePeriodsProvider,
    private readonly blockchainProvider: BlockchainProvider,
    private readonly cacheLifetimeInBlocks: number = 10 
  ) { }

  async getPeriods(contractAddress: string, config: GovernanceConfig): Promise<GovernancePeriod[]> {
    const currentBlockLevel = await this.blockchainProvider.getCurrentBlockLevel();
    if (currentBlockLevel - this.lastBlockLevel > this.cacheLifetimeInBlocks) {
      this.storedPeriods = await this.provider.getPeriods(contractAddress, config);
      this.lastBlockLevel = currentBlockLevel;
    }

    return this.storedPeriods;
  }
}