import { BlockchainProvider } from './provider';
import { Baker, ContractOperation, TzktBigMapEntry, TzktContractOperation, TzktTezosPeriodInfo, TzktVoter, VotingFinishedEventPayloadDto } from '../dto';
import { getEstimatedBlockCreationTime } from '../../governance/utils';

export class TzktProvider implements BlockchainProvider {
  constructor(
    private readonly baseUrl: string
  ) { }

  async getContractOperations(address: string, entrypoints: string[], startLevel: number, endLevel: number): Promise<ContractOperation[]> {
    const url = 'https://api.ghostnet.tzkt.io/v1/operations/transactions';
    const params = {
      target: address,
      'entrypoint.in': entrypoints.join(','),
      'level.ge': startLevel.toString(),
      'level.le': endLevel.toString(),
      'select': 'hash,timestamp,sender,parameter'
    };
    const rawResult = await this.fetchAllChunks<TzktContractOperation>(url, 100, params);
    return rawResult.map(r => ({
      hash: r.hash,
      sender: r.sender,
      time: new Date(r.timestamp),
      parameter: r.parameter
    }))
  }

  async getBlocksCreationTime(levels: number[]): Promise<Map<number, Date>> {
    const result = new Map<number, Date>();
    const url = `${this.baseUrl}/v1/blocks`;
    const limit = 500;
    let promises = [];
    for (let i = 0; i <= levels.length; i += limit) {
      const levelsChunk = levels.slice(i, i + limit);
      const params = {
        'level.in': levelsChunk.join(','),
        'select.values': 'level,timestamp',
        limit: limit.toString()
      }
      promises.push(this.fetchJson<Array<[number, string]>>(url, params));
    }

    const results = await Promise.all(promises);
    results.forEach(blocks => {
      blocks.forEach(([level, timestamp]) => result.set(level, new Date(timestamp)));
    });

    return result;
  }

  async getBlockCreationTime(level: number): Promise<Date> {
    const url = `${this.baseUrl}/v1/blocks/${level.toString()}`;
    let result;

    try {
      result = new Date(((await this.fetchJson(url)) as any).timestamp);
    } catch {
      const [
        currentBlockLevel,
        timeBetweenBlocks
      ] = await Promise.all([
        this.getCurrentBlockLevel(),
        this.getTimeBetweenBlocks()
      ]);
      result = getEstimatedBlockCreationTime(level, currentBlockLevel, timeBetweenBlocks);
    }

    return result;
  }

  getVotingFinishedEvents(address: string): Promise<VotingFinishedEventPayloadDto[]> {
    const url = `${this.baseUrl}/v1/contracts/events`;
    const params = {
      contract: address,
      tag: 'voting_finished',
      'select.fields': 'payload',
      'sort.desc': 'id'
    }
    //TODO: we can use get count and then use Promise.all
    return this.fetchAllChunks(url, 300, params);
  }

  async getContractOriginationLevel(address: string): Promise<number> {
    const url = `${this.baseUrl}/v1/contracts/${address}`;
    return (await this.fetchJson(url) as any).firstActivity;
  }

  async getCurrentBlockLevel(): Promise<number> {
    const url = `${this.baseUrl}/v1/head`;
    return (await this.fetchJson(url) as any).level;
  }

  async getTimeBetweenBlocks(): Promise<number> {
    const url = `${this.baseUrl}/v1/protocols/current`;
    return (await this.fetchJson(url) as any).constants.timeBetweenBlocks;
  }

  async getTotalVotingPower(level: number): Promise<bigint> {
    const period = await this.getTezosVotingPeriod(level)
    return BigInt(period.totalVotingPower.toString());
  }

  async getTezosVotingPeriod(level: number): Promise<TzktTezosPeriodInfo> {
    const url = `${this.baseUrl}/v1/voting/periods`;
    const params = {
      'firstLevel.le': level.toString(),
      'lastLevel.ge': level.toString(),
    };
    const periods: TzktTezosPeriodInfo[] = await this.fetchJson<TzktTezosPeriodInfo[]>(url, params)
    const result = periods[0]

    if (result === undefined)
      throw new Error(`Impossible to find tezos voting period for level ${level.toString()}`)

    return result;
  }

  async getBakers(level: number): Promise<Baker[]> {
    const votingPeriod = await this.getTezosVotingPeriod(level);
    const index = votingPeriod.index;
    const url = `${this.baseUrl}/v1/voting/periods/${index}/voters`;
    const rawResult = await this.fetchAllChunks<TzktVoter>(url, 100);
    return rawResult.map(r => ({
      address: r.delegate.address,
      alias: r.delegate.alias,
      votingPower: BigInt(r.votingPower.toString()),
    }) as Baker)
  }

  async getBigMapEntries<K, V>(id: string): Promise<Array<TzktBigMapEntry<K, V>>> {
    const url = `${this.baseUrl}/v1/bigmaps/${id}/keys`;
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

    const res = await fetch(url, { cache: 'no-store' });
    return await res.json() as T;
  }
}