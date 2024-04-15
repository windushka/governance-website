import { BlockchainProvider } from '@/lib/blockchain';
import { GovernanceOperationsProvider } from './provider'
import { Upvoter, Voter } from '..';
import { mapPayloadKey } from '../../utils';

export class RpcGovernanceOperationsProvider implements GovernanceOperationsProvider {
  constructor(
    private readonly blockchainProvider: BlockchainProvider
  ) { }

  async getUpvoters(
    contractAddress: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Upvoter[]> {
    const [
      operations,
      bakers
    ] = await Promise.all([
      this.blockchainProvider.getContractOperations(contractAddress, ['new_proposal', 'upvote_proposal'], periodStartLevel, periodEndLevel),
      this.blockchainProvider.getBakers(periodEndLevel)
    ])
    const bakersMap = new Map(bakers.map(b => [b.address, b]));

    return operations.map(o => {
      const baker = bakersMap.get(o.sender.address);

      return {
        address: o.sender.address,
        alias: o.sender.alias,
        proposalKey: mapPayloadKey(o.parameter.value),
        votingPower: baker!.votingPower,
        operationHash: o.hash,
        operationTime: o.time
      } as Upvoter
    });
  }

  async getVoters(
    contractAddress: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Voter[]> {
    const [
      operations,
      bakers
    ] = await Promise.all([
      this.blockchainProvider.getContractOperations(contractAddress, ['vote'], periodStartLevel, periodEndLevel),
      this.blockchainProvider.getBakers(periodEndLevel)
    ])
    const bakersMap = new Map(bakers.map(b => [b.address, b]));

    return operations.map(o => {
      const baker = bakersMap.get(o.sender.address);

      return {
        address: o.sender.address,
        alias: o.sender.alias,
        vote: o.parameter.value,
        votingPower: baker!.votingPower,
        operationHash: o.hash,
        operationTime: o.time
      } as Voter
    });
  }
}