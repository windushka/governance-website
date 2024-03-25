import { PayloadKey, PeriodType } from '..';
import BigNumber from 'bignumber.js';

export interface GovernancePeriod {
  type: PeriodType;
  index: BigNumber;
  firstBlockLevel: BigNumber;
  lastBlockLevel: BigNumber;
  winnerPayload: PayloadKey | null;
}