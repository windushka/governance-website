import { BigMapAbstraction, MichelsonMap } from "@taquito/taquito";
import BigNumber from 'bignumber.js';
import { MichelsonOptional } from "./types";

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

export interface Proposal {
  readonly proposer: string;
  readonly upvotes_voting_power: BigNumber;
}

export interface UpvotersProposalsKey<T = unknown> {
  readonly key_hash: string;
  readonly bytes: T;
}

export interface ProposalPeriod<T = unknown> {
  readonly upvoters_upvotes_count: BigMapAbstraction | null;
  readonly upvoters_proposals: BigMapAbstraction | null;
  readonly proposals: BigMapAbstraction | null;
  readonly max_upvotes_voting_power: MichelsonOptional<BigNumber>;
  readonly winner_candidate: MichelsonOptional<NonNullable<T>>;
  readonly total_voting_power: BigNumber;
}

export interface PromotionPeriod<T = unknown> {
  readonly winner_candidate: NonNullable<T>;
  readonly voters: BigMapAbstraction | null;
  readonly yea_voting_power: BigNumber;
  readonly nay_voting_power: BigNumber;
  readonly pass_voting_power: BigNumber;
  readonly total_voting_power: BigNumber;
}

export type MichelsonPeriodType<T = unknown> = {
  readonly proposal: ProposalPeriod<T>;
} | {
  readonly promotion: PromotionPeriod<T>;
}

export interface VotingContext<T = unknown> {
  readonly period_index: BigNumber;
  readonly period: MichelsonPeriodType<T>;
}

export interface VotingWinner<T = unknown> {
  readonly payload: NonNullable<T>;
  readonly trigger_history: BigMapAbstraction;
}

export interface GovernanceContractStorage<T = unknown> {
  readonly config: Config;
  readonly voting_context: MichelsonOptional<VotingContext<T>>;
  readonly last_winner: MichelsonOptional<VotingWinner<T>>;
  readonly metadata: BigMapAbstraction;
}