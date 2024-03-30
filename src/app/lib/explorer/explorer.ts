export interface Explorer {
  getOperationUrl(hash: string): string;
  getAccountUrl(address: string): string;
}