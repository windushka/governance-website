import BigNumber from 'bignumber.js';
import { MichelsonOptional, MichelsonPeriodEnumType } from './types';
import { PayloadKey } from './storage';

export interface VotingFinishedEventPayload {
  finished_at_period_index: BigNumber;
  finished_at_period_type: MichelsonPeriodEnumType;
  winner_proposal_payload: MichelsonOptional<PayloadKey>;
}

export interface VotingState {
  period_index: BigNumber;
  period_type: MichelsonPeriodEnumType;
  remaining_blocks: BigNumber;
  finished_voting: MichelsonOptional<VotingFinishedEventPayload>;
}