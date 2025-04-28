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
  contracts: {
    0: [{
      address: 'KT1MtNbeDYiBTFHfKrocHdzds1GYKNkNeAfe',
      name: 'kernel'
    }, {
      address: 'KT1QDgF5pBkXEizj5RnmagEyxLxMTwVRpmYk',
      name: 'security'
    }, {
      address: 'KT1LBBNtit9k2YU1eky2YqTFeqrpLqAhc1T8',
      name: 'sequencer'
    }]
  }
};

export const ghostnetTestConfig: BaseConfig = {
  key: 'ghostnet_demo',
  name: 'Demo',
  ...ghostnetBase,
  contracts: {
    0: [{
      address: 'KT1QucBSp3oNuYXieNCw9ojpC3KTvccg4JMo',
      name: 'kernel'
    }, {
      address: 'KT1MHAVKVVDSgZsKiwNrRfYpKHiTLLrtGqod',
      name: 'security'
    }, {
      address: 'KT1V7eizWmUKSu8oFPaLTpCKsMh6QgD33m9i',
      name: 'sequencer'
    }]
  }
};
