/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

// Sets DPR based on device DPR and R3F performance scaling.
function AdaptivePixelRatio({ maxDpr = 1.5 }) {
  const current = useThree((state) => state.performance.current);
  const setDpr = useThree((state) => state.setDpr);

  useEffect(() => {
    const deviceDpr =
      typeof window !== 'undefined' && window.devicePixelRatio
        ? window.devicePixelRatio
        : 1;
    // Clamp by maxDpr, then scale by R3F performance.current (0..1).
    const base = Math.min(maxDpr, deviceDpr);
    setDpr(base * current);
  }, [current, maxDpr, setDpr]);

  return null;
}

export default AdaptivePixelRatio;
