import { BaseConfig, Network } from '../types';

const ghostnetBase: Pick<BaseConfig, 'network' | 'rpcUrl' | 'tzktApiUrl' | 'tzktExplorerUrl'> = {
  network: Network.Ghostnet,
  rpcUrl: 'https://rpc.tzkt.io/ghostnet',
  tzktApiUrl: 'https://api.ghostnet.tzkt.io',
  tzktExplorerUrl: 'https://ghostnet.tzkt.io',
}

export const ghostnetConfig: BaseConfig = {
  key: 'ghostnet',
  name: 'Ghostnet',
  ...ghostnetBase,
  contracts: [{
    address: 'KT1MtNbeDYiBTFHfKrocHdzds1GYKNkNeAfe',
    name: 'slow'
  }, {
    address: 'KT1QDgF5pBkXEizj5RnmagEyxLxMTwVRpmYk',
    name: 'fast'
  }, {
    address: 'KT1LBBNtit9k2YU1eky2YqTFeqrpLqAhc1T8',
    name: 'sequencer'
  }]
};

export const ghostnetTestConfig: BaseConfig = {
  key: 'ghostnet_demo',
  name: 'Demo',
  ...ghostnetBase,
  contracts: [{
    address: 'KT1QucBSp3oNuYXieNCw9ojpC3KTvccg4JMo',
    name: 'slow'
  }, {
    address: 'KT1MHAVKVVDSgZsKiwNrRfYpKHiTLLrtGqod',
    name: 'fast'
  }, {
    address: 'KT1V7eizWmUKSu8oFPaLTpCKsMh6QgD33m9i',
    name: 'sequencer'
  }]
};