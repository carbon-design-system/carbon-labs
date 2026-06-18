/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { animated, useSpring } from '@react-spring/three';
import { useCursor } from '@react-three/drei';
import * as THREE from 'three';
import FrontLabel from '../shared/FrontLabel';
import {
  ANIM_DURATION,
  ENTER_ANIM_DURATION,
  ENTER_OFFSET,
  ENTER_STAGGER,
} from '../../constants';
import { createGradientTexture, isGradient } from '../../utils/gradientParser';
import { getFocusRingGeometry } from '../shared/focusRingGeometry';
import {
  useCanvasInteractionApi,
  useCanvasItemHover,
} from '../../interactionContext';
import { useCanvasTheme } from '../../themeContext';
import { getSceneColors } from '../../styles/themeTokens';

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const geometryCache = new Map();
const AnimatedMesh = animated.mesh;
const AnimatedMaterial = animated.meshBasicMaterial;

const getGeometry = (width, height, depth) => {
  const key = `${width}|${height}|${depth}`;
  let geometry = geometryCache.get(key);
  if (!geometry) {
    geometry = new THREE.BoxGeometry(width, height, depth);
    const positionAttr = geometry.getAttribute('position');
    const vertexColors = new Float32Array(positionAttr.count * 3);
    const minY = -height / 2;
    const gradientSpan = height * 1.2596;

    for (let i = 0; i < positionAttr.count; i += 1) {
      const y = positionAttr.getY(i);
      const t = (y - minY) / gradientSpan;
      const c = 1 - Math.max(0, Math.min(1, t));
      const idx = i * 3;
      vertexColors[idx] = c;
      vertexColors[idx + 1] = c;
      vertexColors[idx + 2] = c;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));
    geometryCache.set(key, geometry);
  }
  return geometry;
};

/**
 * CoreLayer Component
 * Renders the middle core layer (Sovereign Core) - a long horizontal block
 * This spans the full width of the visualization
 */
const CoreLayer = memo(function CoreLayer({
  position,
  dimensions,
  color = 'linear-gradient(90deg, rgb(216, 227, 246) 0%, rgb(244, 244, 244) 100%)',
  leftColor,
  topColor,
  faceColors,
  text,
  hoverText,
  textColor = '#000000',
  isFocused,
  enterIndex = 0,
  enterDelayMs: enterDelayMsOverride,
  onBlockClick,
  blockId,
  ...props
}) {
  const meshRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const interactionApi = useCanvasInteractionApi();
  const isExternallyHovered = useCanvasItemHover(blockId, 'core');

  const theme = useCanvasTheme();
  const sceneColors = getSceneColors(theme);

  const frontColor = color || 'gray';
  const resolvedFaceColors = useMemo(() => {
    if (faceColors && faceColors.length === 6) {
      return faceColors;
    }

    // If it's a gradient, only apply to front face, use solid colors for others
    if (isGradient(frontColor)) {
      const sideColor = leftColor || sceneColors.coreLayerSide;
      const topFaceColor = topColor || sceneColors.coreLayerTop;
      return [
        sideColor, // left
        sideColor, // right
        topFaceColor, // top
        topFaceColor, // bottom
        frontColor, // front - gradient here
        sideColor, // back
      ];
    }

    // For solid colors, create darker/lighter variations
    const baseColor = new THREE.Color(frontColor);
    return [
      baseColor.clone().multiplyScalar(0.7),
      baseColor.clone().multiplyScalar(0.7),
      baseColor.clone().multiplyScalar(0.5),
      baseColor.clone().multiplyScalar(0.5),
      baseColor.clone(),
      baseColor.clone().multiplyScalar(0.8),
    ];
  }, [
    faceColors,
    frontColor,
    leftColor,
    topColor,
    sceneColors.coreLayerSide,
    sceneColors.coreLayerTop,
  ]);

  const geometry = useMemo(
    () => getGeometry(dimensions.width, dimensions.height, dimensions.depth),
    [dimensions.depth, dimensions.height, dimensions.width]
  );
  const focusRingGeometry = useMemo(
    () => getFocusRingGeometry(dimensions.width, dimensions.height),
    [dimensions.height, dimensions.width]
  );

  const enterOffset = ENTER_OFFSET;

  const basePosition = useMemo(() => {
    if (position?.length === 3) return position;
    return [0, 0, 0];
  }, [position]);

  const targetPosition = useMemo(() => {
    const hoverOffset = isHovered || isFocused || isExternallyHovered ? 2 : 0;
    return [basePosition[0], basePosition[1], basePosition[2] + hoverOffset];
  }, [basePosition, isExternallyHovered, isFocused, isHovered]);
  const targetHoverOverlayOpacity = useMemo(() => {
    return isHovered || isFocused || isExternallyHovered ? 0.3 : 0;
  }, [isExternallyHovered, isFocused, isHovered]);

  const enterFromPosition = useMemo(
    () => [basePosition[0], basePosition[1] + enterOffset, basePosition[2]],
    [basePosition, enterOffset]
  );

  const enterDelayMs = useMemo(
    () =>
      enterDelayMsOverride ?? Math.max(0, enterIndex) * ENTER_STAGGER * 1000,
    [enterDelayMsOverride, enterIndex]
  );

  const spring = useSpring({
    from: {
      position: enterFromPosition,
      opacity: 0,
      overlayOpacity: 0,
      hoverOverlayOpacity: 0,
    },
    to: {
      position: targetPosition,
      opacity: 1,
      overlayOpacity: 0,
      hoverOverlayOpacity: targetHoverOverlayOpacity,
    },
    delay: hasEntered ? 0 : enterDelayMs,
    config: {
      duration: (hasEntered ? ANIM_DURATION : ENTER_ANIM_DURATION) * 1000,
      easing: easeInOutCubic,
    },
    onRest: () => setHasEntered(true),
  });

  useCursor(Boolean(onBlockClick) && isHovered);

  const handlePointerOver = useCallback(
    (event) => {
      if (event.object !== meshRef.current) return;
      event.stopPropagation();
      setIsHovered(true);
      interactionApi?.publishHoveredItem({ id: blockId, layer: 'core' });
    },
    [blockId, interactionApi]
  );

  const handlePointerOut = useCallback(
    (event) => {
      if (event.object !== meshRef.current) return;
      event.stopPropagation();
      setIsHovered(false);
      interactionApi?.publishHoveredItem(null);
    },
    [interactionApi]
  );

  const handleClick = useCallback(
    (event) => {
      if (!onBlockClick) return;
      event.stopPropagation();
      onBlockClick(blockId);
    },
    [onBlockClick, blockId]
  );

  return (
    <AnimatedMesh
      {...props}
      ref={meshRef}
      position={spring.position}
      geometry={geometry}
      dispose={null}
      renderOrder={1}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerLeave={handlePointerOut}
      onClick={onBlockClick ? handleClick : undefined}>
      {resolvedFaceColors.map((faceColor, index) => {
        const texture = isGradient(faceColor)
          ? createGradientTexture(faceColor)
          : null;

        return (
          <AnimatedMaterial
            key={`${index}-${typeof faceColor}`}
            attach={`material-${index}`}
            {...(texture ? { map: texture } : { color: faceColor })}
            toneMapped={false}
            transparent
            opacity={spring.opacity}
          />
        );
      })}
      <AnimatedMesh
        geometry={geometry}
        position={[0, 0, 0]}
        renderOrder={2}
        raycast={() => null}>
        <AnimatedMaterial
          color="#000000"
          transparent
          opacity={spring.overlayOpacity}
          depthWrite={false}
          toneMapped={false}
        />
      </AnimatedMesh>
      <AnimatedMesh
        geometry={geometry}
        position={[0, 0, 0]}
        renderOrder={3}
        raycast={() => null}>
        <AnimatedMaterial
          vertexColors
          transparent
          opacity={spring.hoverOverlayOpacity}
          depthWrite={false}
          toneMapped={false}
        />
      </AnimatedMesh>
      <AnimatedMesh
        geometry={focusRingGeometry}
        position={[0, 0, dimensions.depth / 2 + 0.058]}
        renderOrder={4}
        raycast={() => null}>
        <AnimatedMaterial
          color={sceneColors.focusRing}
          transparent
          opacity={isFocused ? spring.opacity : 0}
          depthWrite={false}
          toneMapped={false}
        />
      </AnimatedMesh>
      <FrontLabel
        text={text}
        hoverText={hoverText}
        textColor={textColor}
        width={dimensions.width}
        height={dimensions.height}
        depth={dimensions.depth}
        opacity={spring.opacity}
        isHovered={isHovered || isFocused || isExternallyHovered}
        renderOrder={5}
      />
    </AnimatedMesh>
  );
});

export default CoreLayer;
