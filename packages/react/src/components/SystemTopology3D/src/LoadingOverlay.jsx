/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { useProgress } from '@react-three/drei';

function LoadingOverlay() {
  const { active } = useProgress();

  if (!active) return null;

  return (
    <div className="system-topology-3d-loading" aria-hidden="true">
      <div className="system-topology-3d-spinner" />
    </div>
  );
}

export default LoadingOverlay;
