import { Explorer } from './explorer';

export class TzktExplorer implements Explorer {
  constructor(
    private readonly baseUrl: string
  ) { }

  getOperationUrl(hash: string): string {
    return `${this.baseUrl}/${hash}`
  }

  getAccountUrl(address: string): string {
    return `${this.baseUrl}/${address}`
  }
}