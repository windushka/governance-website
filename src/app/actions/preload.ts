import { getAppContext } from '@/lib/appContext'

export const preload = (): void => {
  const context = getAppContext();
  Object.values(context.config.contracts)
    .forEach(arr => arr.forEach(c => context.governance.config.getConfig(c.address)));
}
