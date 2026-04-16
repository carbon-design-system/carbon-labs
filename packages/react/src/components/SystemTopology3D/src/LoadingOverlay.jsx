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
