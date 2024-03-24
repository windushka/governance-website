import BigNumber from 'bignumber.js';
import { MichelsonOptional, MichelsonPeriodEnumType } from './types';
import { PayloadKey } from './storage';

export interface VotingFinishedEventPayload<T = PayloadKey> {
  finished_at_period_index: BigNumber;
  finished_at_period_type: Symbol;
  winner_proposal_payload: MichelsonOptional<T>;
}

export interface VotingState<T = PayloadKey> {
  period_index: BigNumber;
  period_type: MichelsonPeriodEnumType;
  remaining_blocks: BigNumber;
  finished_voting: MichelsonOptional<VotingFinishedEventPayload<T>>;
}