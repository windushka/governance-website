import { PayloadKey, PeriodType } from '../state';
import * as Storage from '../contract';
import { VotingFinishedEventPayloadDto } from '../../api';

export const mapPayloadKey = (michelsonKey: Storage.PayloadKey): PayloadKey => {
  if (typeof michelsonKey === 'string')
    return michelsonKey;

  return {
    poolAddress: michelsonKey.pool_address,
    sequencerPublicKey: michelsonKey.sequencer_pk
  }
}

export const mapOptionalPayloadKeyDto = (michelsonKey: VotingFinishedEventPayloadDto['winner_proposal_payload'] | null): PayloadKey | null => {
  return michelsonKey !== null ? mapPayloadKey(michelsonKey) : null;
}

export const mapPeriodType = (michelsonPeriod: Storage.MichelsonPeriodEnumType): PeriodType => {
  return ('proposal' in michelsonPeriod) ? PeriodType.Proposal : PeriodType.Promotion;
}