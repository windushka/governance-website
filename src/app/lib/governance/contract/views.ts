import BigNumber from 'bignumber.js';
import { MichelsonOptional, MichelsonPeriodEnumType } from './types';

export interface VotingFinishedEventPayload<T = unknown> {
  finished_at_period_index: BigNumber;
  finished_at_period_type: Symbol;
  winner_proposal_payload: MichelsonOptional<T>;
}

export interface VotingState<T = unknown> {
  period_index: BigNumber;
  period_type: MichelsonPeriodEnumType;
  remaining_blocks: BigNumber;
  finished_voting: MichelsonOptional<VotingFinishedEventPayload<T>>;
}