'use client'

import clsx from 'clsx';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { HTMLAttributeAnchorTarget, memo } from 'react';
import { appTheme } from './appTheme';

interface LinkProps {
  href: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  target?: HTMLAttributeAnchorTarget;
  children: React.ReactNode;
}

export const Link = ({ children, href, disabled, active, className, target }: LinkProps) => {
  const pathname = usePathname();
  const hasActiveState = active ?? (href && pathname.startsWith(href));

  return !disabled ? <NextLink
    target={target}
    href={href}
    className={clsx(className, appTheme.accentTextColorHover, hasActiveState && appTheme.accentTextColor)}>
    {children}
  </NextLink> : <span className={appTheme.disabledTextColor}>{children}</span>;
};

export const LinkPure = memo(Link);