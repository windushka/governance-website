import { Config } from '../types';

export const ghostnetConfig: Config = {
  rpcUrl: 'https://rpc.tzkt.io/ghostnet',
  tzktApiUrl: 'https://api.ghostnet.tzkt.io',
  contracts: [{
    address: 'KT1MtNbeDYiBTFHfKrocHdzds1GYKNkNeAfe',
    name: 'kernel'
  }, {
    address: 'KT1MHAVKVVDSgZsKiwNrRfYpKHiTLLrtGqod',//KT1QDgF5pBkXEizj5RnmagEyxLxMTwVRpmYk
    name: 'security'
  }, {
    address: 'KT1V7eizWmUKSu8oFPaLTpCKsMh6QgD33m9i', //KT1LBBNtit9k2YU1eky2YqTFeqrpLqAhc1T8
    name: 'sequencer'
  }]
}