import BigNumber from "bignumber.js";
import { ApiProvider } from "./provider";
import { Baker, TzktBigMapEntry, TzktTezosPeriodInfo, TzktVoter } from "./dto";

export class TzktApiProvider implements ApiProvider {
  constructor(
    private readonly baseUrl: string
  ) { }

  async getCurrentBlockLevel(): Promise<BigNumber> {
    const url = `${this.baseUrl}/v1/head`;
    return BigNumber((await this.fetchJson(url) as any).level);
  }

  async getTimeBetweenBlocks(): Promise<BigNumber> {
    const url = `${this.baseUrl}/v1/protocols/current`;
    return BigNumber((await this.fetchJson(url) as any).constants.timeBetweenBlocks);
  }

  async getTotalVotingPower(level: BigNumber): Promise<BigNumber> {
    const period = await this.getTezosVotingPeriod(level)
    return BigNumber(period.totalVotingPower);
  }

  async getTezosVotingPeriod(level: BigNumber): Promise<TzktTezosPeriodInfo> {
    const levelNumber = level.toNumber();
    const url = `${this.baseUrl}/v1/voting/periods`;
    const params = {
      'firstLevel.le': levelNumber.toString(),
      'lastLevel.ge': levelNumber.toString(),
    };
    const periods: TzktTezosPeriodInfo[] = await this.fetchJson<TzktTezosPeriodInfo[]>(url, params)
    const result = periods[0]

    if (result === undefined)
      throw new Error(`Impossible to find tezos voting period for level ${level.toString()}`)

    return result;
  }

  async getBakers(level: BigNumber): Promise<Baker[]> {
    const votingPeriod = await this.getTezosVotingPeriod(level);
    const index = votingPeriod.index;
    const url = `${this.baseUrl}/v1/voting/periods/${index}/voters`;
    const rawResult = await this.fetchAllChunks<TzktVoter>(url, 100);
    return rawResult.map(r => ({
      address: r.delegate.address,
      alias: r.delegate.alias,
      votingPower: BigNumber(r.votingPower),
    }) as Baker)
  }

  async getBigMapEntries<K, V>(id: BigNumber): Promise<Array<TzktBigMapEntry<K, V>>> {
    const url = `${this.baseUrl}/v1/bigmaps/${id.toString(10)}/keys`;
    return this.fetchJson(url, { select: 'key,value' });
  }

  private async fetchAllChunks<T>(url: string, limit: number, params?: Record<string, string>): Promise<T[]> {
    let offset = 0;
    let chunk: T[] = [];
    let result: T[] = [];
    do {
      chunk = await this.fetchJson<T[]>(url, { ...params, limit: limit.toString(), offset: offset.toString() });
      result.push(...chunk)
      offset += limit;
    } while (chunk.length)
    return result;
  }

  private async fetchJson<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    //TODO: improve
    let url = endpoint;
    if (params)
      url = `${url}?${new URLSearchParams(params).toString()}`;

    const res = await fetch(url);
    return await res.json() as T;
  }
}