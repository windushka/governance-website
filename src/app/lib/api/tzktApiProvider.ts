import BigNumber from "bignumber.js";
import { ApiProvider } from "./provider";
import { BigMapEntry } from "./dto";

export class TzktApiProvider implements ApiProvider {
  constructor(
    private readonly baseUrl: string
  ) { }

  async getCurrentBlockLevel(): Promise<BigNumber> {
    const url = `${this.baseUrl}/v1/head`;
    const res = await fetch(url);
    return BigNumber((await res.json()).level);
  }

  async getTimeBetweenBlocks(): Promise<BigNumber> {
    const url = `${this.baseUrl}/v1/protocols/current`;
    const res = await fetch(url);
    return BigNumber((await res.json()).constants.timeBetweenBlocks);
  }

  async getTotalVotingPower(): Promise<BigNumber> {
    //TODO: improve
    const url = `${this.baseUrl}/v1/voting/periods/current`;
    const res = await fetch(url);
    return BigNumber((await res.json()).totalVotingPower);
  }

  async getBigMapEntries<K, V>(id: BigNumber): Promise<Array<BigMapEntry<K, V>>> {
    const url = `${this.baseUrl}/v1/bigmaps/${id.toString(10)}/keys?select=key,value`;
    const res = await fetch(url);
    return res.json();
  }

}