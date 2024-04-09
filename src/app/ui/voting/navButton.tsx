'use client'

import { getPeriodPageUrl } from '@/app/actions';
import clsx from 'clsx';
import Link from 'next/link';
import { appTheme } from '../common';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

interface NavButtonProps {
  contractName: string;
  periodIndex: number;
  disabled?: boolean;
  isNext?: boolean;
}

export const NavButton = ({ contractName, periodIndex, isNext, disabled }: NavButtonProps) => {
  const className = clsx(`flex shrink-0 justify-center items-center ${appTheme.componentBgColor} border ${appTheme.borderColor} rounded-md h-[40px] w-[40px] text-lg`, disabled ? 'opacity-50' : appTheme.componentBgHoverColor);
  const iconClassName = 'h-5 w-5';
  const content = isNext ? <ArrowRightIcon className={iconClassName} /> : <ArrowLeftIcon className={iconClassName} />;

  return !disabled
    ? <Link
      className={className}
      href={getPeriodPageUrl(contractName, periodIndex.toString())}>
      {content}
    </Link>
    : <span className={clsx(className, 'cursor-default')}>{content}</span>
};