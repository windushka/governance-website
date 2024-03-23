import { TezosToolkit } from '@taquito/taquito';
import { GovernanceConfig } from '../config';
import { GovernanceContractStorage, Config as MichelsonConfig } from '../../contract';
import BigNumber from 'bignumber.js'
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
      startedAtLevel: config.started_at_level,
      upvotingLimit: config.upvoting_limit,
      adoptionPeriodSec: config.adoption_period_sec,
      periodLength: config.period_length,
      proposalQuorum: this.natToPercent(config.promotion_quorum, config.scale),
      promotionQuorum: this.natToPercent(config.promotion_quorum, config.scale),
      promotionSupermajority: this.natToPercent(config.promotion_supermajority, config.scale),
    }
  }

  //TODO: move to utils
  private natToPercent(value: BigNumber, scale: BigNumber) {
    return value.multipliedBy(100).div(scale)
  }
}