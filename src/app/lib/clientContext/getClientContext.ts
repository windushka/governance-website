import { Config } from '../config';
import { TzktExplorer } from '../explorer';
import { ClientContext } from './clientContext';

let cachedClientContext: ClientContext | undefined;
let cachedConfig: Config;
export const getClientContext = (config: Config): ClientContext => {
  if (!cachedClientContext || cachedConfig !== config) {
    cachedClientContext = {
      explorer: new TzktExplorer(config.tzktExplorerUrl),
    };
    cachedConfig = config;
  }

  return cachedClientContext;
}
