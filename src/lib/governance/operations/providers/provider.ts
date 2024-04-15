import { Upvoter, Voter } from '..';

export interface GovernanceOperationsProvider {
  getUpvoters(
    contractAddress: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Upvoter[]>;

  getVoters(
    contractAddress: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Voter[]>;
}