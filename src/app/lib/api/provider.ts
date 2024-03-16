import BigNumber from 'bignumber.js';
import { Baker, TzktBigMapEntry } from './dto';

export interface ApiProvider {
    getCurrentBlockLevel(): Promise<BigNumber>;
    getTimeBetweenBlocks(): Promise<BigNumber>;
    getTezosVotingPeriodIndex(level: BigNumber): Promise<BigNumber>
    getBakers(level: BigNumber): Promise<Baker[]>;
    getTotalVotingPower(): Promise<BigNumber>;
    getBigMapEntries<K, V>(id: BigNumber): Promise<Array<TzktBigMapEntry<K, V>>>;
}