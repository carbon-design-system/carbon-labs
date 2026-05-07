/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { animated, useSpring } from '@react-spring/three';
import { useCursor } from '@react-three/drei';
import * as THREE from 'three';
import * as colors from '@carbon/colors';
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

// Custom easing for skeleton animations - cubic-bezier(0.20, 0.00, 1.00, 0.90)
const skeletonEase = (t) => {
  // Cubic bezier approximation for (0.20, 0.00, 1.00, 0.90)
  // This creates a smooth ease-out effect
  const p0 = 0;
  const p1 = 0.2;
  const p2 = 1.0;
  const p3 = 1;

  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return mt3 * p0 + 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + t3 * p3;
};

// Loading animation constants
const LOADING_OPACITY = 0.5; // 50% transparent gray blocks
const LOADING_COLOR = colors.gray[50]; // gray color for loading state

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
 * PrimaryLayer Component
 * Renders a 3D block representing a tenant, primary, or cluster
 * This is the top layer of colored blocks in the visualization
 */
const PrimaryLayer = memo(function PrimaryLayer({
  position,
  dimensions,
  color,
  leftColor,
  topColor,
  faceColors,
  text,
  hoverText,
  textColor = '#ffffff',
  isFocused,
  enterIndex = 0,
  enterDelayMs: enterDelayMsOverride,
  exitDelayMs,
  skeletonLoader = false,
  loadingCycleKey = 0,
  loadingPhase = 'in',
  skipEnterAnimation = false,
  onBlockClick,
  blockId,
  ...props
}) {
  const meshRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const interactionApi = useCanvasInteractionApi();
  const isExternallyHovered = useCanvasItemHover(blockId, 'primary');
  const theme = useCanvasTheme();
  const sceneColors = getSceneColors(theme);

  const frontColor = skeletonLoader ? LOADING_COLOR : color || 'gray';
  const sideColor = skeletonLoader ? LOADING_COLOR : leftColor || frontColor;
  const topFaceColor = skeletonLoader ? LOADING_COLOR : topColor || frontColor;
  const resolvedFaceColors = useMemo(() => {
    const baseColor = skeletonLoader ? LOADING_COLOR : frontColor;
    const baseSideColor = skeletonLoader ? LOADING_COLOR : sideColor;
    const baseTopColor = skeletonLoader ? LOADING_COLOR : topFaceColor;

    const colors =
      faceColors && faceColors.length === 6 && !skeletonLoader
        ? faceColors
        : [
            baseSideColor,
            baseSideColor,
            baseTopColor,
            baseTopColor,
            baseColor,
            baseColor,
          ];

    return colors;
  }, [faceColors, frontColor, sideColor, topFaceColor, skeletonLoader]);

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
    if (skeletonLoader) return 0;
    return isHovered || isFocused || isExternallyHovered ? 0.3 : 0;
  }, [isExternallyHovered, isFocused, isHovered, skeletonLoader]);

  const enterFromPosition = useMemo(
    () => [basePosition[0], basePosition[1] + enterOffset, basePosition[2]],
    [basePosition, enterOffset]
  );

  const enterDelayMs = useMemo(
    () =>
      enterDelayMsOverride ?? Math.max(0, enterIndex) * ENTER_STAGGER * 1000,
    [enterDelayMsOverride, enterIndex]
  );

  const animConfig = {
    duration: (hasEntered ? ANIM_DURATION : ENTER_ANIM_DURATION) * 1000,
    easing: easeInOutCubic,
  };

  // Imperative spring API for full control over animation
  const [spring, api] = useSpring(() => ({
    position: skipEnterAnimation ? targetPosition : enterFromPosition,
    opacity: skipEnterAnimation ? 1 : 0,
    hoverOverlayOpacity: skipEnterAnimation ? targetHoverOverlayOpacity : 0,
    config: animConfig,
  }));

  // Drive the spring based on loading state and phase
  useEffect(() => {
    if (skeletonLoader) {
      if (loadingPhase === 'in') {
        // Reset to start position, then animate in with same stagger as regular blocks
        api.set({
          position: enterFromPosition,
          opacity: 0,
          hoverOverlayOpacity: 0,
        });
        api.start({
          position: basePosition,
          opacity: LOADING_OPACITY,
          hoverOverlayOpacity: 0,
          delay: enterDelayMs,
          config: {
            duration: ENTER_ANIM_DURATION * 1000 * 0.8,
            easing: skeletonEase,
          },
        });
      } else {
        // Staggered fade out - use exitDelayMs which reverses item order within columns
        // Top blocks in each column leave first, maintaining column-to-column stagger
        // Moving out of the way prevents depth-buffer occlusion of the core layer
        const phaseOutDelay = exitDelayMs ?? enterDelayMs;

        api.start({
          position: enterFromPosition,
          opacity: 0,
          hoverOverlayOpacity: 0,
          delay: phaseOutDelay,
          config: {
            duration: ENTER_ANIM_DURATION * 1000 * 0.8,
            easing: skeletonEase,
          },
        });
      }
    } else {
      if (skipEnterAnimation && !hasEntered) {
        api.set({
          position: targetPosition,
          opacity: 1,
          hoverOverlayOpacity: targetHoverOverlayOpacity,
        });
        setHasEntered(true);
        return;
      }

      // Normal mode: animate to target position
      api.start({
        position: targetPosition,
        opacity: 1,
        hoverOverlayOpacity: targetHoverOverlayOpacity,
        delay: hasEntered ? 0 : enterDelayMs,
        config: {
          duration: (hasEntered ? ANIM_DURATION : ENTER_ANIM_DURATION) * 1000,
          easing: easeInOutCubic,
        },
        onRest: () => setHasEntered(true),
      });
    }
  }, [
    api,
    basePosition,
    enterDelayMs,
    enterFromPosition,
    exitDelayMs,
    hasEntered,
    loadingCycleKey,
    loadingPhase,
    skeletonLoader,
    skipEnterAnimation,
    targetHoverOverlayOpacity,
    targetPosition,
    theme,
  ]);

  // Update hover/focus animation in normal mode
  useEffect(() => {
    if (!skeletonLoader && hasEntered) {
      api.start({
        position: targetPosition,
        hoverOverlayOpacity: targetHoverOverlayOpacity,
        config: { duration: ANIM_DURATION * 1000, easing: easeInOutCubic },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, isFocused, targetPosition, targetHoverOverlayOpacity]);

  useCursor(Boolean(onBlockClick) && isHovered);

  const handlePointerOver = useCallback(
    (event) => {
      if (event.object !== meshRef.current) return;
      event.stopPropagation();
      setIsHovered(true);
      interactionApi?.publishHoveredItem({ id: blockId, layer: 'primary' });
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
      renderOrder={skeletonLoader ? 2 : 0}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerLeave={handlePointerOut}
      onClick={onBlockClick ? handleClick : undefined}>
      {/* Main block faces - 6 materials for each face of the cube (left, right, top, bottom, front, back) */}
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
            depthWrite={!skeletonLoader}
            opacity={spring.opacity}
          />
        );
      })}
      {/* Hover overlay mesh - gradient effect that appears when block is hovered/focused */}
      <AnimatedMesh
        geometry={geometry}
        position={[0, 0, 0]}
        renderOrder={skeletonLoader ? 3 : 1}
        raycast={() => null}>
        <AnimatedMaterial
          vertexColors
          transparent
          opacity={spring.hoverOverlayOpacity}
          depthWrite={false}
          toneMapped={false}
        />
      </AnimatedMesh>
      {/* Text overlay mesh - for primary layer labels */}
      {!skeletonLoader && (
        <>
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
        </>
      )}
    </AnimatedMesh>
  );
});

export default PrimaryLayer;
