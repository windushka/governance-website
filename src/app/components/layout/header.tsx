import Link from 'next/link'
import { NetworkSelectorPure, appTheme } from '../common'
import { NavLinks } from './navLinks'
import { getAppContext } from '@/lib/appContext';

export const Header = () => {
  const appContext = getAppContext();

  return <header className={`border-b ${appTheme.borderColor} container grow-0 py-4 flex flex-col justify-center items-center gap-x-4 gap-y-6 sm:flex-row sm:justify-between sm:border-b-0`}>
    <div className="flex flex-col sm:flex-row gap-x-4 gap-y-2 justify-center items-center">
      <Link href="/" className={`text-2xl text-center focus-visible:outline focus-visible:outline-2 ${appTheme.accentOutlineColorFocus}`}>Etherlink governance</Link>
      <NetworkSelectorPure currentConfigKey={appContext.config.key} allConfigs={appContext.allConfigs} />
    </div>
    <NavLinks />
  </header>
}