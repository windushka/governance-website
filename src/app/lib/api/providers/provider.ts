import { Baker, TzktBigMapEntry, TzktTezosPeriodInfo, VotingFinishedEventPayloadDto } from '../dto';

export interface ApiProvider {
  getCurrentBlockLevel(): Promise<bigint>;
  getTimeBetweenBlocks(): Promise<bigint>;
  getTezosVotingPeriod(level: bigint): Promise<TzktTezosPeriodInfo>
  getBakers(level: bigint): Promise<Baker[]>;
  getTotalVotingPower(level: bigint): Promise<bigint>;
  getBigMapEntries<K, V>(id: bigint): Promise<Array<TzktBigMapEntry<K, V>>>;
  getContractOriginationLevel(address: string): Promise<bigint>;
  getVotingFinishedEvents(address: string): Promise<VotingFinishedEventPayloadDto[]>
}