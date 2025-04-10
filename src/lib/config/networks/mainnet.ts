import { BaseConfig, Network } from '../types';

export const mainnetConfig: BaseConfig = {
  key: 'mainnet',
  name: 'Mainnet',
  network: Network.Mainnet,
  rpcUrl: 'https://rpc.tzkt.io/mainnet',
  tzktApiUrl: 'https://api.tzkt.io',
  tzktExplorerUrl: 'https://tzkt.io',
  contracts: [{
    address: 'KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK',
    name: 'kernel'
  }, {
    address: 'KT1GRAN26ni19mgd6xpL6tsH52LNnhKSQzP2',
    name: 'security'
  }, {
    address: 'KT1UvCsnXpLAssgeJmrbQ6qr3eFkYXxsTG9U',
    name: 'sequencer'
  }]
};
