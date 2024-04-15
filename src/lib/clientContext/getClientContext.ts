import { Config } from '../config';
import { TzktExplorer } from '../explorer';
import { ClientContext } from './clientContext';

let cachedConfig: Config;
const cache = new Map<string, ClientContext>();
export const getClientContext = (config: Config): ClientContext => {
  let cachedClientContext = cache.get(config.key);
  if (!cachedClientContext) {
    cachedClientContext = {
      explorer: new TzktExplorer(config.tzktExplorerUrl),
    };
    cache.set(config.key, cachedClientContext);
  }

  return cachedClientContext;
}
