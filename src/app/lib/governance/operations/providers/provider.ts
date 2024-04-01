import { Upvoter, Voter } from '..';

export interface GovernanceOperationsProvider {
  getUpvoters(
    contractAddress: string,
    bigMapId: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Upvoter[]>;

  getVoters(
    contractAddress: string,
    bigMapId: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Voter[]>;
}