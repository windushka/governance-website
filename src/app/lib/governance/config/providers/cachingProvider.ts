import { GovernanceConfig } from '../config';
import { GovernanceConfigProvider } from './provider';

export class CachingGovernanceConfigProvider implements GovernanceConfigProvider {
  private readonly cache = new Map<string, GovernanceConfig>();
  constructor(
    private readonly provider: GovernanceConfigProvider
  ) { }

  async getConfig(contractAddress: string): Promise<GovernanceConfig> {
    let cachedConfig = this.cache.get(contractAddress);
    if (!cachedConfig) {
      cachedConfig = await this.provider.getConfig(contractAddress);
      this.cache.set(contractAddress, cachedConfig);
    }

    return cachedConfig;
  }
}