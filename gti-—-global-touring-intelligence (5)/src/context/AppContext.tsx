import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Assumptions, DEFAULT_ASSUMPTIONS } from '../lib/calculations';

interface AppContextType {
  selectedArtistId: string | null;
  setSelectedArtistId: (id: string | null) => void;
  selectedTourId: string | null;
  setSelectedTourId: (id: string | null) => void;
  proMode: boolean;
  setProMode: (mode: boolean) => void;
  assumptions: Assumptions;
  setAssumptions: (assumptions: Assumptions) => void;
  resetAssumptions: () => void;
  globalLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [proMode, setProMode] = useState<boolean>(true);
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [activeRequests, setActiveRequests] = useState<number>(0);

  const globalLoading = activeRequests > 0;
  const startLoading = useCallback(() => setActiveRequests(prev => prev + 1), []);
  const stopLoading = useCallback(() => setActiveRequests(prev => Math.max(0, prev - 1)), []);

  const resetAssumptions = useCallback(() => setAssumptions(DEFAULT_ASSUMPTIONS), []);

  return (
    <AppContext.Provider 
      value={{ 
        selectedArtistId, 
        setSelectedArtistId, 
        selectedTourId, 
        setSelectedTourId, 
        proMode, 
        setProMode,
        assumptions,
        setAssumptions,
        resetAssumptions,
        globalLoading,
        startLoading,
        stopLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
