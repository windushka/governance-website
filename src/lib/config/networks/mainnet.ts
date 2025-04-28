import { BaseConfig, Network } from '../types';

export const mainnetConfig: BaseConfig = {
  key: 'mainnet',
  name: 'Mainnet',
  network: Network.Mainnet,
  rpcUrl: 'https://rpc.tzkt.io/mainnet',
  tzktApiUrl: 'https://api.tzkt.io',
  tzktExplorerUrl: 'https://tzkt.io',
  contracts: {
    5316609: [
      {
        address: 'KT1H5pCmFuhAwRExzNNrPQFKpunJx1yEVa6J',
        name: 'kernel'
      }, {
        address: 'KT1N5MHQW5fkqXkW9GPjRYfn5KwbuYrvsY1g',
        name: 'security'
      }, {
        address: 'KT1NcZQ3y9Wv32BGiUfD2ZciSUz9cY1DBDGF',
        name: 'sequencer'
      }],
    7692289: [{
      address: 'KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK',
      name: 'kernel'
    }, {
      address: 'KT1GRAN26ni19mgd6xpL6tsH52LNnhKSQzP2',
      name: 'security'
    }, {
      address: 'KT1UvCsnXpLAssgeJmrbQ6qr3eFkYXxsTG9U',
      name: 'sequencer'
    }],
    8767489: [{
      address: 'KT1XdSAYGXrUDE1U5GNqUKKscLWrMhzyjNeh',
      name: 'kernel'
    }, {
      address: 'KT1D1fRgZVdjTj5sUZKcSTPPnuR7LRxVYnDL',
      name: 'security'
    }, {
      address: 'KT1NnH9DCAoY1pfPNvb9cw9XPKQnHAFYFHXa',
      name: 'sequencer'
    }]
  },
};
