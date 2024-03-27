import { PayloadKey, PeriodType } from '..';

export interface GovernancePeriod {
  type: PeriodType;
  index: bigint;
  firstBlockLevel: bigint;
  lastBlockLevel: bigint;
  winnerPayload: PayloadKey | null;
}