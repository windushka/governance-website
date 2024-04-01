import { PayloadKey } from '../state';

export enum Vote {
  Yea = 'yea',
  Nay = 'nay',
  Pass = 'pass'
}

export interface Voter {
  readonly address: string;
  readonly alias: string | null;
  readonly vote: Vote;
  readonly votingPower: bigint;
  readonly operationHash: string;
  readonly operationTime: Date;
}

export interface Upvoter {
  readonly address: string;
  readonly alias: string | null;
  readonly proposalKey: PayloadKey;
  readonly votingPower: bigint;
  readonly operationHash: string;
  readonly operationTime: Date;
}