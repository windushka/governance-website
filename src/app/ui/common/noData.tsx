import { memo } from 'react';

interface NoDataProps {
  text:string;
}

export const NoData = ({ text: children }: NoDataProps) => {
  return <div className="flex justify-center items-center grow text-slate-400 text-xl">
    {children}
  </div>
};

export const NoDataPure = memo(NoData);