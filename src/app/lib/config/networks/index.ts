import { mainnetConfig } from '.';
import { ghostnetConfig, ghostnetTestConfig } from './ghostnet';

export { ghostnetConfig, ghostnetTestConfig } from './ghostnet';
export { mainnetConfig } from './mainnet';

export const allConfigs = [
  mainnetConfig,
  ghostnetConfig,
  ghostnetTestConfig,
];