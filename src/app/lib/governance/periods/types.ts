import { PayloadKey, PeriodType } from '..';

export interface GovernancePeriod {
  readonly type: PeriodType;
  readonly index: bigint;
  readonly startLevel: bigint;
  readonly startTime: Date;
  readonly endLevel: bigint;
  readonly endTime: Date;
  readonly winnerPayload: PayloadKey | null;
}