/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
