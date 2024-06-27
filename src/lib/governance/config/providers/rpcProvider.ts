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
      startedAtLevel: config.started_at_level.toNumber(),
      upvotingLimit: config.upvoting_limit.toNumber(),
      adoptionPeriodSec: config.adoption_period_sec.toNumber(),
      periodLength: config.period_length.toNumber(),
      scale: config.scale.toNumber(),
      proposalQuorum: config.proposal_quorum.toNumber(),
      promotionQuorum: config.promotion_quorum.toNumber(),
      promotionSupermajority: config.promotion_supermajority.toNumber(),
    }
  }
}
