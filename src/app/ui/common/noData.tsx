import { memo } from 'react';
import { appTheme } from './appTheme';

interface NoDataProps {
  text:string;
}

export const NoData = ({ text: children }: NoDataProps) => {
  return <div className={`flex justify-center items-center grow ${appTheme.disabledTextColor} text-xl`}>
    {children}
  </div>
};

export const NoDataPure = memo(NoData);