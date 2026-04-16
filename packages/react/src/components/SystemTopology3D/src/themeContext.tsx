import React, { createContext, useContext, ReactNode } from 'react';
import type { Theme } from './types/color-tokens';

const CanvasThemeContext = createContext<Theme>('dark');

export function CanvasThemeProvider({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <CanvasThemeContext.Provider value={theme}>
      {children}
    </CanvasThemeContext.Provider>
  );
}

export function useCanvasTheme(): Theme {
  return useContext(CanvasThemeContext);
}
