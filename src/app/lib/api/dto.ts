import BigNumber from 'bignumber.js'

export interface TzktBigMapEntry<K, V> {
  key: K;
  value: V;
}

export interface TzktVoter {
  delegate: {
    alias?: string;
    address: string
  },
  votingPower: number,
}

export interface Baker {
  address: string;
  alias?: string;
  votingPower: BigNumber;
}

export interface TzktTezosPeriodInfo {
  index: number;
  firstLevel: number;
  lastLevel: number;
  totalVotingPower: number;
}