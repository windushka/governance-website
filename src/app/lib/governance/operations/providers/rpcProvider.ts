import { BlockchainProvider } from '@/app/lib/blockchain';
import { GovernanceOperationsProvider } from './provider'
import { Upvoter, Voter } from '..';
import * as Storage from '../../contract/storage';
import { mapPayloadKey } from '../../utils';

export class RpcGovernanceOperationsProvider implements GovernanceOperationsProvider {
  constructor(
    private readonly blockchainProvider: BlockchainProvider
  ) { }

  async getUpvoters(
    contractAddress: string,
    bigMapId: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Upvoter[]> {
    const [
      rawEntries,
      operations,
      bakers
    ] = await Promise.all([
      this.blockchainProvider.getBigMapEntries<Storage.UpvotersProposalsKey, never>(bigMapId),
      this.blockchainProvider.getContractOperations(contractAddress, ['new_proposal', 'upvote_proposal'], periodStartLevel, periodEndLevel),
      this.blockchainProvider.getBakers(periodEndLevel)
    ])
    const bakersMap = new Map(bakers.map(b => [b.address, b]));
    const operationsMap = new Map(operations.map(o => [o.sender.address, o]));

    return rawEntries.map(({ key }) => {
      const operation = operationsMap.get(key.key_hash);
      const baker = bakersMap.get(key.key_hash);

      return {
        address: key.key_hash,
        alias: baker!.alias,
        proposalKey: 'bytes' in key ? key.bytes : mapPayloadKey(key),
        votingPower: baker!.votingPower,
        operationHash: operation!.hash,
        operationTime: operation!.time
      } as Upvoter
    });
  }

  async getVoters(
    contractAddress: string,
    bigMapId: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Voter[]> {
    const [
      rawEntries,
      operations,
      bakers
    ] = await Promise.all([
      this.blockchainProvider.getBigMapEntries<string, string>(bigMapId),
      this.blockchainProvider.getContractOperations(contractAddress, ['vote'], periodStartLevel, periodEndLevel),
      this.blockchainProvider.getBakers(periodEndLevel)
    ])
    const operationsMap = new Map(operations.map(o => [o.sender.address, o]));
    const bakersMap = new Map(bakers.map(b => [b.address, b]));

    return rawEntries.map(({ key, value }) => {
      const operation = operationsMap.get(key);
      const baker = bakersMap.get(key);

      return {
        address: key,
        alias: baker!.alias,
        vote: value,
        votingPower: baker!.votingPower,
        operationHash: operation!.hash,
        operationTime: operation!.time
      } as Voter
    });
  }
}