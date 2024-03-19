"use client"

import clsx from "clsx";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

interface LinkProps {
  href: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Link({ children, href, disabled, className }: LinkProps) {
  const pathname = usePathname();

  return !disabled ? <NextLink
    href={href}
    className={clsx(className, 'hover:text-sky-500', { 'text-sky-400': href && pathname.startsWith(href) })}>
    {children}
  </NextLink> : <span className="text-slate-400">{children}</span>;
}