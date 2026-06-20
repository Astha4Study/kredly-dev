import { useContext } from 'react';
import { AppLayoutContext } from './context';

export function useAppLayout() {
  const context = useContext(AppLayoutContext);
  if (context === undefined) {
    throw new Error('useAppLayout must be used within AppLayoutProvider');
  }
  return context;
}
