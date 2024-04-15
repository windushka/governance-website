import { LinkPure, appTheme } from '@/app/components'
import { memo } from 'react';

export const Footer = () => {
  return <footer className={`container grow-0 text-center text-sm ${appTheme.disabledTextColor} mt-4 `}>
    <div className={`border-t ${appTheme.borderColor} p-2`}>
      {new Date().getFullYear()}
      &nbsp;| <LinkPure href="https://www.etherlink.com/" target="_blank" >Etherlink</LinkPure>
      &nbsp;| <LinkPure href="https://docs.etherlink.com/" target="_blank" >Documentation</LinkPure>
      {/* &nbsp;| <LinkPure href="#" >Terms of use</LinkPure> */}
    </div>
  </footer>
};

export const FooterPure = memo(Footer);