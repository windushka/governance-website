"use client"

import clsx from "clsx";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { HTMLAttributeAnchorTarget, memo } from 'react';
import { appTheme } from '.';

interface LinkProps {
  href: string;
  disabled?: boolean;
  className?: string;
  target?: HTMLAttributeAnchorTarget;
  children: React.ReactNode;
}

export const Link = ({ children, href, disabled, className, target }: LinkProps) => {
  const pathname = usePathname();

  return !disabled ? <NextLink
    target={target}
    href={href}
    className={clsx(className, appTheme.accentTextColorHover, { [appTheme.accentTextColor]: href && pathname.startsWith(href) })}>
    {children}
  </NextLink> : <span className="text-slate-400">{children}</span>;
};

export const LinkPure = memo(Link);