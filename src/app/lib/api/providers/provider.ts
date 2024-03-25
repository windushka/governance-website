import BigNumber from 'bignumber.js';
import { Baker, TzktBigMapEntry, TzktTezosPeriodInfo, VotingFinishedEventPayloadDto } from '../dto';

export interface ApiProvider {
  getCurrentBlockLevel(): Promise<BigNumber>;
  getTimeBetweenBlocks(): Promise<BigNumber>;
  getTezosVotingPeriod(level: BigNumber): Promise<TzktTezosPeriodInfo>
  getBakers(level: BigNumber): Promise<Baker[]>;
  getTotalVotingPower(level: BigNumber): Promise<BigNumber>;
  getBigMapEntries<K, V>(id: BigNumber): Promise<Array<TzktBigMapEntry<K, V>>>;
  getContractOriginationLevel(address: string): Promise<BigNumber>;
  getVotingFinishedEvents(address: string): Promise<VotingFinishedEventPayloadDto[]>
}