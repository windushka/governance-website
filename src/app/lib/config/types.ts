export enum Network {
  Mainnet = 'Mainnet',
  Ghostnet = 'Ghostnet',
}

export interface Contract {
  name: string;
  address: string;
}

export interface Config {
  network: Network;
  contracts: Contract[];
  rpcUrl: string;
  tzktApiUrl: string;
  tzktExplorerUrl: string;
}