'use client'

import { memo } from 'react'
import { appTheme } from './appTheme';
import { SpinIcon } from './spinIcon';

export const Loader = () => {
  return <div className={`absolute inset-0 ${appTheme.overlayBgColor} flex justify-center items-center`}>
    <SpinIcon className={`animate-spin h-10 w-10 ${appTheme.accentTextColor}`} />
  </div>
};

export const LoaderPure = memo(Loader);