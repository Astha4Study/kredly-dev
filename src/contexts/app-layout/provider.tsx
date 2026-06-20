import { useState } from 'react';
import type { ReactNode } from 'react';
import { AppLayoutContext } from './context';

export function AppLayoutProvider({ children }: { children: ReactNode }) {
  const [showTopBar, setShowTopBar] = useState(true);

  return (
    <AppLayoutContext.Provider value={{ showTopBar, setShowTopBar }}>
      {children}
    </AppLayoutContext.Provider>
  );
}
