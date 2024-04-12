import { memo } from 'react';
import { appTheme } from './appTheme';

interface NoDataProps {
  text:string;
}

export const NoData = ({ text: children }: NoDataProps) => {
  return <div className={`flex justify-center items-start sm:items-center grow ${appTheme.disabledTextColor} text-xl text-center`}>
    {children}
  </div>
};

export const NoDataPure = memo(NoData);