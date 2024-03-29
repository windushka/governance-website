import { MichelsonPeriodEnumType, PayloadKey } from '../governance/contract';

export interface TzktBigMapEntry<K, V> {
  key: K;
  value: V;
}

export interface TzktVoter {
  delegate: {
    alias?: string;
    address: string;
  },
  votingPower: number,
}

export interface Baker {
  address: string;
  alias?: string;
  votingPower: bigint;
}

export interface TzktTezosPeriodInfo {
  index: number;
  firstLevel: number;
  lastLevel: number;
  totalVotingPower: number;
}

export interface VotingFinishedEventPayloadDto {
  finished_at_period_index: bigint;
  finished_at_period_type: MichelsonPeriodEnumType;
  winner_proposal_payload: PayloadKey | null;
}

export interface TzktContractOperation {
  hash: string;
  timestamp: string;
  sender: {
    alias?: string;
    address: string;
  }
}

export interface ContractOperation {
  hash: string;
  sender: {
    address: string;
    alias?: string;
  };
  time: Date;
}