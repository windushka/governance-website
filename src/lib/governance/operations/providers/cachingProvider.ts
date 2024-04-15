import { BlockchainProvider } from '@/lib/blockchain';
import { GovernanceOperationsProvider } from './provider';
import { Upvoter, Voter } from '../models';

export class CachingGovernanceOperationsProvider implements GovernanceOperationsProvider {
  private readonly upvotersCache = new Map<string, Upvoter[]>();
  private readonly votersCache = new Map<string, Voter[]>();

  constructor(
    private readonly provider: GovernanceOperationsProvider,
    private readonly blockchainProvider: BlockchainProvider
  ) { }

  async getUpvoters(
    contractAddress: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Upvoter[]> {
    return this.getData(
      contractAddress,
      periodStartLevel,
      periodEndLevel,
      this.upvotersCache,
      () => this.provider.getUpvoters(contractAddress, periodStartLevel, periodEndLevel)
    )
  }

  async getVoters(
    contractAddress: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Voter[]> {
    return this.getData(
      contractAddress,
      periodStartLevel,
      periodEndLevel,
      this.votersCache,
      () => this.provider.getVoters(contractAddress, periodStartLevel, periodEndLevel)
    )
  }

  async getData<T>(
    contractAddress: string,
    periodStartLevel: number,
    periodEndLevel: number,
    cache: Map<string, T[]>,
    fetchFunction: () => Promise<T[]>
  ): Promise<T[]> {
    const key = this.getCacheKey(contractAddress, periodStartLevel, periodEndLevel);

    let data = cache.get(key);
    if (!data) {
      const promiseResults = await Promise.all([
        this.blockchainProvider.getCurrentBlockLevel(),
        fetchFunction()
      ]);
      const currentBlockLevel = promiseResults[0];
      data = promiseResults[1];

      if (currentBlockLevel >= periodEndLevel)
        cache.set(key, data);
    }

    return data;
  }

  private getCacheKey(
    contractAddress: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): string {
    return `${contractAddress}-${periodStartLevel}-${periodEndLevel}`;
  }
}