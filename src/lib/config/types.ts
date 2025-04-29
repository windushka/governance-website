export enum Network {
  Mainnet = 'Mainnet',
  Ghostnet = 'Ghostnet',
}

export interface Contract {
  name: string;
  address: string;
}

export interface BaseConfig {
  key: string;
  name: string;
  network: Network;
  contracts: Record<number, Contract[]>;
  rpcUrl: string;
  tzktApiUrl: string;
  tzktExplorerUrl: string;
}

export type Config = BaseConfig & {
  url: string;
}
