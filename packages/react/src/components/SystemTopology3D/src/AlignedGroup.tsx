/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/no-unknown-property */

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { AlignedGroupProps, SceneBounds } from './types/component-props';

function AlignedGroup({
  children,
  onReady,
  onBoundsChange,
  pivotX = 0,
  tiltDeg = { x: 0, y: 0, z: 0 },
}: AlignedGroupProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const contentRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    if (!groupRef.current || !contentRef.current) {
      return;
    }

    groupRef.current.position.set(0, 0, 0);

    const publishBounds = () => {
      if (!contentRef.current) {
        return;
      }

      const box = new THREE.Box3().setFromObject(contentRef.current);
      if (box.isEmpty()) {
        onBoundsChange?.(null);
        return;
      }

      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      const nextBounds: SceneBounds = {
        center: [center.x, center.y, center.z],
        size: [size.x, size.y, size.z],
      };

      onBoundsChange?.(nextBounds);
    };

    // Wait for scene content to render before triggering dependent camera motion.
    const rafId1 = requestAnimationFrame(() => {
      const rafId2 = requestAnimationFrame(() => {
        publishBounds();
        onReady?.();
      });

      return () => cancelAnimationFrame(rafId2);
    });

    return () => cancelAnimationFrame(rafId1);
  }, [onBoundsChange, onReady]);

  const tiltRotation = useMemo(
    (): [number, number, number] => [
      THREE.MathUtils.degToRad(tiltDeg?.x ?? 0),
      THREE.MathUtils.degToRad(tiltDeg?.y ?? 0),
      THREE.MathUtils.degToRad(tiltDeg?.z ?? 0),
    ],
    [tiltDeg]
  );

  return (
    <group ref={groupRef as any}>
      <group
        ref={contentRef as any}
        position={[pivotX, 0, 0]}
        rotation={tiltRotation}>
        <group position={[-pivotX, 0, 0]}>{children}</group>
      </group>
    </group>
  );
}

export default AlignedGroup;
