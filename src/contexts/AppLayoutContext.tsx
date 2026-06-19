import { createContext, useContext, useState, ReactNode } from 'react';

interface AppLayoutContextType {
  showTopBar: boolean;
  setShowTopBar: (show: boolean) => void;
}

const AppLayoutContext = createContext<AppLayoutContextType | undefined>(
  undefined,
);

export function AppLayoutProvider({ children }: { children: ReactNode }) {
  const [showTopBar, setShowTopBar] = useState(true);

  return (
    <AppLayoutContext.Provider value={{ showTopBar, setShowTopBar }}>
      {children}
    </AppLayoutContext.Provider>
  );
}

export function useAppLayout() {
  const context = useContext(AppLayoutContext);
  if (context === undefined) {
    throw new Error('useAppLayout must be used within AppLayoutProvider');
  }
  return context;
}
