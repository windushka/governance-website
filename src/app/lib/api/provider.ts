import BigNumber from 'bignumber.js';
import { BigMapEntry } from './dto';

export interface ApiProvider {
    getCurrentBlockLevel(): Promise<BigNumber>;
    getTimeBetweenBlocks(): Promise<BigNumber>;
    getTotalVotingPower(): Promise<BigNumber>;
    getBigMapEntries<K, V>(id: BigNumber): Promise<Array<BigMapEntry<K, V>>>;
}