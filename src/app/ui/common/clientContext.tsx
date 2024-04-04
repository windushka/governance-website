'use client'

import { ClientContext } from '@/app/lib/clientContext';
import { createContext, useContext } from 'react';

const Context = createContext<ClientContext | null>(null);

interface ContextProviderProps {
  children: React.ReactNode;
  context: ClientContext;
}

export function ClientContextProvider({ children, context }: ContextProviderProps) {
  return (
    <Context.Provider value={context}>
      {children}
    </Context.Provider>
  );
}

export function useClientContext() {
  return useContext(Context)!;
}