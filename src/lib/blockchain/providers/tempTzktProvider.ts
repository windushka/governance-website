import { TzktProvider } from './tzktProvider';

export class TempTzktProvider extends TzktProvider {
  constructor(
    baseUrl: string,
    private readonly rpcBaseUrl: string,
  ) {
    super(baseUrl);
  }

  /*

    tzkt does not return totalVotingPower for some period types,
    for example: when {"kind": "testing"}. 
    The developers promised to fix it after 06/2024, if so,
    then we can remove this TempTzktProvider class

  */
  async getTotalVotingPower(level: number): Promise<bigint> {
    const url = `${this.rpcBaseUrl}/chains/main/blocks/${level}/votes/total_voting_power`
    const result = BigInt(await this.fetchJson<string>(url));

    return result;
  }
}