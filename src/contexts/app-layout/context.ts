import { createContext } from 'react';
import type { AppLayoutContextType } from './types';

export const AppLayoutContext = createContext<AppLayoutContextType | undefined>(
  undefined,
);
