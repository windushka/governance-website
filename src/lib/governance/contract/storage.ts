import { BigMapAbstraction } from '@taquito/taquito';
import BigNumber from 'bignumber.js';
import { MichelsonOptional } from './types';

export interface Config {
  readonly started_at_level: BigNumber;
  readonly period_length: BigNumber;
  readonly adoption_period_sec: BigNumber;
  readonly upvoting_limit: BigNumber;
  readonly proposers_governance_contract: MichelsonOptional<string>;
  readonly scale: BigNumber;
  readonly proposal_quorum: BigNumber;
  readonly promotion_quorum: BigNumber;
  readonly promotion_supermajority: BigNumber;
}

export type KernelKey = string;
export interface SequencerKey {
  readonly pool_address: string;
  readonly sequencer_pk: string;
};
export type PayloadKey = KernelKey | SequencerKey;


export interface Proposal {
  readonly proposer: string;
  readonly upvotes_voting_power: BigNumber;
}

export interface ProposalPeriod {
  readonly upvoters_upvotes_count: BigMapAbstraction | null;
  readonly upvoters_proposals: BigMapAbstraction | null;
  readonly proposals: BigMapAbstraction | null;
  readonly max_upvotes_voting_power: MichelsonOptional<BigNumber>;
  readonly winner_candidate: MichelsonOptional<NonNullable<PayloadKey>>;
  readonly total_voting_power: BigNumber;
}

export interface PromotionPeriod {
  readonly winner_candidate: NonNullable<PayloadKey>;
  readonly voters: BigMapAbstraction | null;
  readonly yea_voting_power: BigNumber;
  readonly nay_voting_power: BigNumber;
  readonly pass_voting_power: BigNumber;
  readonly total_voting_power: BigNumber;
}

export type MichelsonPeriodType = {
  readonly proposal: ProposalPeriod;
} | {
  readonly promotion: PromotionPeriod;
}

export interface VotingContext {
  readonly period_index: BigNumber;
  readonly period: MichelsonPeriodType;
}

export interface VotingWinner {
  readonly payload: NonNullable<PayloadKey>;
  readonly trigger_history: BigMapAbstraction;
}

export interface GovernanceContractStorage {
  readonly config: Config;
  readonly voting_context: MichelsonOptional<VotingContext>;
  readonly last_winner: MichelsonOptional<VotingWinner>;
  readonly metadata: BigMapAbstraction;
}

export interface KernelUpvotersProposalsKey {
  readonly key_hash: string;
  readonly bytes: KernelKey;
}
export interface SequencerUpvotersProposalsKey extends SequencerKey {
  readonly key_hash: string;
}
export type UpvotersProposalsKey = KernelUpvotersProposalsKey | SequencerUpvotersProposalsKey;
