import { getPeriodPageUrl } from '@/app/actions';
import clsx from 'clsx';
import Link from 'next/link';
import { appTheme } from '../common';

interface NavButtonProps {
  contractName: string;
  periodIndex: number;
  disabled?: boolean;
  isNext?: boolean;
}

export default function NavButton({ contractName, periodIndex, isNext, disabled }: NavButtonProps) {
  const className = clsx(`flex justify-center items-center ${appTheme.componentBgColor} border ${appTheme.borderColor} rounded-md h-[40px] w-[40px] text-lg`, disabled ? 'opacity-50' : appTheme.componentBgHoverColor);
  const content = { __html: isNext ? '&#8594;' : '&#8592;' };

  return !disabled
    ? <Link
      className={className}
      href={getPeriodPageUrl(contractName, periodIndex.toString())}
      dangerouslySetInnerHTML={content} />
    : <span className={clsx(className, 'cursor-default')} dangerouslySetInnerHTML={content}></span>
}