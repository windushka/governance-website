import { Baker, ContractOperation, TzktBigMapEntry, TzktTezosPeriodInfo, VotingFinishedEventPayloadDto } from '../dto';

export interface BlockchainProvider {
  getBlockCreationTime(level: number): Promise<Date>;
  getBlocksCreationTime(levels: number[]): Promise<Map<number, Date>>;
  getCurrentBlockLevel(): Promise<number>;
  getTimeBetweenBlocks(): Promise<number>;
  getTezosVotingPeriod(level: number): Promise<TzktTezosPeriodInfo>
  getBakers(level: number): Promise<Baker[]>;
  getTotalVotingPower(level: number): Promise<bigint>;
  getBigMapEntries<K, V>(id: string): Promise<Array<TzktBigMapEntry<K, V>>>;
  getContractOriginationLevel(address: string): Promise<number>;
  getVotingFinishedEvents(address: string): Promise<VotingFinishedEventPayloadDto[]>;
  getContractOperations(address: string, entrypoints: string[], startLevel: number, endLevel: number): Promise<ContractOperation[]>;
}