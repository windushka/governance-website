import { PayloadKey, PeriodType } from '..';

export interface GovernancePeriod {
  readonly type: PeriodType;
  readonly index: number;
  readonly startLevel: number;
  readonly startTime: Date;
  readonly endLevel: number;
  readonly endTime: Date;
  readonly winnerPayload: PayloadKey | null;
}