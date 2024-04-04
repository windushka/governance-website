import { getAppContext } from '../lib/appContext'

export const preload = (): void => {
  const context = getAppContext();
  context.config.contracts.forEach(c => context.governance.config.getConfig(c.address));
} 