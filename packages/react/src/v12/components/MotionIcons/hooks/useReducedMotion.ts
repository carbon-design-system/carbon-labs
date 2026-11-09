/**
 * Copyright IBM Corp. 2025, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useSyncExternalStore } from 'react';
import {
  onReducedMotionChange,
  prefersReducedMotion,
} from '@carbon-labs/motion-icons-core/engine/env';

const getServerSnapshot = () => false;

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    onReducedMotionChange,
    prefersReducedMotion,
    getServerSnapshot
  );
}
