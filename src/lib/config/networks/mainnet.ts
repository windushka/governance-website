import { BaseConfig, Network } from '../types';

export const mainnetConfig: BaseConfig = {
  key: 'mainnet',
  name: 'Mainnet',
  network: Network.Mainnet,
  rpcUrl: 'https://rpc.tzkt.io/mainnet',
  tzktApiUrl: 'https://api.tzkt.io',
  tzktExplorerUrl: 'https://tzkt.io',
  contracts: [{
    address: 'KT1H5pCmFuhAwRExzNNrPQFKpunJx1yEVa6J',
    name: 'kernel'
  }, {
    address: 'KT1N5MHQW5fkqXkW9GPjRYfn5KwbuYrvsY1g',
    name: 'security'
  }, {
    address: 'KT1NcZQ3y9Wv32BGiUfD2ZciSUz9cY1DBDGF',
    name: 'sequencer'
  }]
};