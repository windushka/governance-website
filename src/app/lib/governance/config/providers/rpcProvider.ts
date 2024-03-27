import { TezosToolkit } from '@taquito/taquito';
import { GovernanceConfig } from '../config';
import { GovernanceContractStorage, Config as MichelsonConfig } from '../../contract';
import { GovernanceConfigProvider } from './provider';

export class RpcGovernanceConfigProvider implements GovernanceConfigProvider {
  constructor(
    private readonly toolkit: TezosToolkit,
  ) { }

  async getConfig(contractAddress: string): Promise<GovernanceConfig> {
    const contract = await this.toolkit.contract.at(contractAddress);
    const storage = await contract.storage() as GovernanceContractStorage;
    return this.mapConfig(storage.config);
  }

  private mapConfig(config: MichelsonConfig): GovernanceConfig {
    return {
      startedAtLevel: BigInt(config.started_at_level.toString()),
      upvotingLimit: BigInt(config.upvoting_limit.toString()),
      adoptionPeriodSec: BigInt(config.adoption_period_sec.toString()),
      periodLength: BigInt(config.period_length.toString()),
      scale: BigInt(config.scale.toString()),
      proposalQuorum: BigInt(config.promotion_quorum.toString()),
      promotionQuorum: BigInt(config.promotion_quorum.toString()),
      promotionSupermajority: BigInt(config.promotion_supermajority.toString()),
    }
  }
}