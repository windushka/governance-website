import { memo } from 'react';
import { appTheme } from './appTheme';

interface GlobalMessageProps {
  children: React.ReactNode;
}

export const GlobalMessage = ({ children }: GlobalMessageProps) => {
  return <div className={`flex justify-center items-start sm:items-center grow ${appTheme.disabledTextColor} text-xl text-center`}>
    {children}
  </div>
};

export const GlobalMessagePure = memo(GlobalMessage);