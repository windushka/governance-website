'use client'

import { ClientContext } from '@/lib/clientContext';
import { createContext, useContext } from 'react';

const Context = createContext<ClientContext | null>(null);

interface ContextProviderProps {
  children: React.ReactNode;
  context: ClientContext;
}

export const ClientContextProvider = ({ children, context }: ContextProviderProps) => {
  return (
    <Context.Provider value={context}>
      {children}
    </Context.Provider>
  );
}

export const useClientContext = () => {
  return useContext(Context)!;
}