/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo } from 'react';
import { MotionIconContext } from './MotionIconContext';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface MotionIconProviderProps {
  animated?: boolean;
  children?: React.ReactNode;
}

export function MotionIconProvider({
  animated,
  children,
}: MotionIconProviderProps): React.ReactElement {
  const reducedMotion = useReducedMotion();

  // If no explicit `animated` prop is passed, default to false when reduced
  // motion is active, otherwise true.
  //
  // `useReducedMotion` is a shared, hydration-safe store: descendants
  // re-render when the OS setting changes, and SSR markup matches.
  const resolvedAnimated = animated !== undefined ? animated : !reducedMotion;

  // Stable value: a new object every render would re-render every icon
  // below the provider whenever the provider's parent re-renders.
  const value = useMemo(
    () => ({ animated: resolvedAnimated }),
    [resolvedAnimated]
  );

  return (
    <MotionIconContext.Provider value={value}>
      {children}
    </MotionIconContext.Provider>
  );
}
