export interface Contract {
  name: string;
  address: string;
}

export interface Config {
  contracts: Contract[];
  rpcUrl: string;
  tzktApiUrl: string;
}