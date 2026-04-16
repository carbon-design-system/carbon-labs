import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { animated, useSpring } from '@react-spring/three';
import { useCursor } from '@react-three/drei';
import * as THREE from 'three';
import {
  ANIM_DURATION,
  BLOCK_DEPTH,
  ENTER_ANIM_DURATION,
  ENTER_OFFSET,
  ENTER_STAGGER,
} from '../../constants';
import ServerDrawer from './ServerDrawer';
import { createGradientTexture, isGradient } from '../../utils/gradientParser';
import { getFocusRingGeometry } from '../shared/focusRingGeometry';
import {
  useCanvasInteractionApi,
  useCanvasItemHover,
} from '../../interactionContext';
import { useCanvasTheme } from '../../themeContext';
import { getFoundationTokens, getSceneColors } from '../../styles/themeTokens';

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const AnimatedGroup = animated.group;
const AnimatedMesh = animated.mesh;
const AnimatedMaterial = animated.meshBasicMaterial;
const FOUNDATION_LAYOUT_RATIOS = Object.freeze({
  // Frame thickness scales with height but has min/max bounds
  frameThicknessByHeight: 0.0585, // ~0.3 on a 5.125-high rack
  frameThicknessMin: 0.18,
  frameThicknessMax: 0.45,

  // All spacing derives from frame thickness for consistency
  // Spacing creates gaps between drawers where background shows through
  drawerSpacingRatio: 0.15, // spacing = frameThickness * ratio (increased to create visible gaps)
  dividerThicknessRatio: 0.03, // divider = frameThickness * ratio

  // Z-fighting prevention for empty state layering
  panelLayerBias: 0.012,
  outlineLayerBias: 0.02,
});

/**
 * FoundationLayer Component
 * Renders server racks with worker nodes (drawers)
 * This is the bottom layer showing the infrastructure
 */
const FoundationLayer = memo(function FoundationLayer({
  position,
  dimensions,
  variant = 'closed', // Default to closed state
  status = 'green',
  drawerCount = 4,
  drawerSlideDistance = 3,
  enterIndex = 0,
  enterDelayMs: enterDelayMsOverride,
  frameThickness: frameThicknessProp,
  rackIndex = 0,
  isFocused = false,
  onBlockClick,
  blockId,
  ...props
}) {
  const groupRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  useCursor(Boolean(onBlockClick) && isHovered);
  const interactionApi = useCanvasInteractionApi();
  const isExternallyHovered = useCanvasItemHover(blockId, 'foundation');
  const theme = useCanvasTheme();
  const foundationTokens = getFoundationTokens(theme);
  const sceneColors = getSceneColors(theme);

  // Auto-resolve variant based on drawer count
  // If drawerCount is 0, force empty state regardless of variant prop
  // Otherwise, use the provided variant (empty, closed, or open)
  const resolvedVariant =
    drawerCount === 0 ? 'empty' : variant === 'empty' ? 'empty' : variant;

  // Rack colors matching Figma design
  const frontColor = foundationTokens.foundationRackFront;
  const leftFaceColor = foundationTokens.foundationRackSide;
  const rightFaceColor = foundationTokens.foundationRackSide;
  const topFaceColor = foundationTokens.foundationRackTop;
  const bottomFaceColor = foundationTokens.foundationRackBottom;
  const backFaceColor = foundationTokens.foundationRackBack;
  const frontPanelColor = frontColor;
  const frontOutlineColor = foundationTokens.foundationRackBorder;

  // Helper function to create material for a face
  // Disable depthWrite during fade-in to prevent z-fighting with other transparent layers
  const createFaceMaterial = useCallback(
    (color, opacity, shouldWriteDepth = true) => {
      const texture = isGradient(color) ? createGradientTexture(color) : null;

      return (
        <AnimatedMaterial
          {...(texture ? { map: texture } : { color })}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent
          opacity={opacity}
          depthWrite={shouldWriteDepth}
          depthTest={true}
        />
      );
    },
    []
  );

  const { width, height, depth } = dimensions;
  const frameThickness = useMemo(
    () =>
      frameThicknessProp ??
      Math.min(
        FOUNDATION_LAYOUT_RATIOS.frameThicknessMax,
        Math.max(
          FOUNDATION_LAYOUT_RATIOS.frameThicknessMin,
          height * FOUNDATION_LAYOUT_RATIOS.frameThicknessByHeight
        )
      ),
    [frameThicknessProp, height]
  );

  const enterOffset = ENTER_OFFSET;

  const basePosition = useMemo(() => {
    if (position?.length === 3) return position;
    return [0, 0, 0];
  }, [position]);

  const targetPosition = useMemo(() => {
    // Chassis should not animate on hover, only on enter
    return basePosition;
  }, [basePosition]);

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
    from: { position: enterFromPosition, opacity: 0 },
    to: { position: targetPosition, opacity: 1 },
    delay: hasEntered ? 0 : enterDelayMs,
    config: {
      duration: (hasEntered ? ANIM_DURATION : ENTER_ANIM_DURATION) * 1000,
      easing: easeInOutCubic,
    },
    onRest: () => setHasEntered(true),
  });

  const handlePointerEnter = useCallback(
    (event) => {
      event.stopPropagation();
      setIsHovered(true);
      interactionApi?.publishHoveredItem({ id: blockId, layer: 'foundation' });
    },
    [blockId, interactionApi]
  );

  const handlePointerLeave = useCallback(
    (event) => {
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

  // Create geometries for the box faces and frame
  const backGeometry = useMemo(
    () => new THREE.PlaneGeometry(width, height),
    [width, height]
  );
  const frontGeometry = useMemo(
    () => new THREE.PlaneGeometry(width, height),
    [width, height]
  );
  const leftGeometry = useMemo(
    () => new THREE.PlaneGeometry(depth, height),
    [depth, height]
  );
  const rightGeometry = useMemo(
    () => new THREE.PlaneGeometry(depth, height),
    [depth, height]
  );
  const topGeometry = useMemo(
    () => new THREE.PlaneGeometry(width, depth),
    [width, depth]
  );
  const bottomGeometry = useMemo(
    () => new THREE.PlaneGeometry(width, depth),
    [width, depth]
  );

  // Frame geometries (4 bars around the front opening)
  const frameHorizontalGeometry = useMemo(
    () => new THREE.BoxGeometry(width, frameThickness, frameThickness),
    [width, frameThickness]
  );
  const frameVerticalGeometry = useMemo(
    () => new THREE.BoxGeometry(frameThickness, height, frameThickness),
    [height, frameThickness]
  );

  // Shared front-content box used by both empty and populated rack states.
  // This keeps the empty cover and drawer stack perfectly aligned.
  const minFaceEdge = Math.min(width, height);
  const frontOpeningWidth = Math.max(width - 2 * frameThickness, 0.1);
  const frontOpeningHeight = Math.max(height - 2 * frameThickness, 0.1);
  const contentInsetX = 0;
  const contentInsetY = 0;
  const contentWidth = Math.max(frontOpeningWidth - 2 * contentInsetX, 0.1);
  const contentHeight = Math.max(frontOpeningHeight - 2 * contentInsetY, 0.1);

  // Calculate drawer spacing first (needed for edge gaps)
  const drawerSpacing =
    frameThickness * FOUNDATION_LAYOUT_RATIOS.drawerSpacingRatio;
  const edgeGap = drawerSpacing; // Same gap on all edges for consistency

  // Outline dimensions (same as empty state)
  const outlineThickness = Math.max(frameThickness * 0.12, minFaceEdge * 0.012);

  // Drawer dimensions account for edge gaps AND outline thickness
  // The outline creates an inner border, so drawers must fit inside it
  const innerWidth = contentWidth - 2 * edgeGap - 2 * outlineThickness; // Gap + outline on left and right
  const innerHeight = contentHeight - 2 * edgeGap - 2 * outlineThickness; // Gap + outline on top and bottom

  // Background panel should match the drawable area (with edge gaps but before outline)
  const innerPanelWidth = contentWidth - 2 * edgeGap;
  const innerPanelHeight = contentHeight - 2 * edgeGap;

  // Empty cover aligns exactly to the same content box as the drawer fronts.
  const panelInsetX = frameThickness + contentInsetX;
  const panelInsetY = frameThickness + contentInsetY;
  // Outline positioning - same for both empty and populated states
  const outlineGapX = edgeGap;
  const outlineGapY = edgeGap;
  const outlineInsetX = panelInsetX + outlineGapX;
  const outlineInsetY = panelInsetY + outlineGapY;
  const outlineWidth = Math.max(width - outlineInsetX * 2, 0.1);
  const outlineHeight = Math.max(height - outlineInsetY * 2, 0.1);
  const panelGeometry = useMemo(
    () => new THREE.PlaneGeometry(innerPanelWidth, innerPanelHeight),
    [innerPanelWidth, innerPanelHeight]
  );
  const focusRingGeometry = useMemo(
    () => getFocusRingGeometry(width, height),
    [height, width]
  );
  const outlineRingGeometry = useMemo(() => {
    const outerHalfW = outlineWidth / 2;
    const outerHalfH = outlineHeight / 2;
    const innerHalfW = Math.max(
      0.01,
      (outlineWidth - outlineThickness * 2) / 2
    );
    const innerHalfH = Math.max(
      0.01,
      (outlineHeight - outlineThickness * 2) / 2
    );

    const shape = new THREE.Shape();
    shape.moveTo(-outerHalfW, -outerHalfH);
    shape.lineTo(outerHalfW, -outerHalfH);
    shape.lineTo(outerHalfW, outerHalfH);
    shape.lineTo(-outerHalfW, outerHalfH);
    shape.closePath();

    const hole = new THREE.Path();
    hole.moveTo(-innerHalfW, -innerHalfH);
    hole.lineTo(-innerHalfW, innerHalfH);
    hole.lineTo(innerHalfW, innerHalfH);
    hole.lineTo(innerHalfW, -innerHalfH);
    hole.closePath();

    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape);
  }, [outlineHeight, outlineThickness, outlineWidth]);

  // Calculate drawer dimensions and positions
  const safeDrawerCount = Math.max(0, Math.floor(drawerCount));
  const drawerSlotCount = Math.max(4, safeDrawerCount);

  // Calculate drawer height with equal spacing between them
  const totalSpacing =
    drawerSlotCount > 1 ? drawerSpacing * (drawerSlotCount - 1) : 0;
  const drawerHeight =
    drawerSlotCount > 0
      ? Math.max(0.25, (innerHeight - totalSpacing) / drawerSlotCount)
      : 0;
  const drawerDepth = BLOCK_DEPTH; // Use standard block depth for all drawers

  const drawerDimensions = {
    width: innerWidth,
    height: drawerHeight,
    depth: drawerDepth,
  };

  // Calculate drawer positions (centered in the frame)
  const drawerPositions = useMemo(() => {
    if (safeDrawerCount === 0) return [];
    const positions = [];
    const startY = innerHeight / 2 - drawerHeight / 2;
    const missingTopSlots = Math.max(0, drawerSlotCount - safeDrawerCount);

    for (let i = 0; i < safeDrawerCount; i++) {
      const slotIndex = missingTopSlots + i;
      const y = startY - slotIndex * (drawerHeight + drawerSpacing);
      positions.push([0, y, 0]); // Drawers positioned at Z=0 in rack coordinates
    }

    return positions;
  }, [
    drawerHeight,
    drawerSlotCount,
    drawerSpacing,
    innerHeight,
    safeDrawerCount,
  ]);

  const shouldShowDrawers = resolvedVariant !== 'empty';
  const shouldShowOpenFrame = resolvedVariant !== 'empty';
  // Drawers extend on hover for both "closed" and "open" variants
  const isRackActive = isHovered || isExternallyHovered || isFocused;
  const drawersExtended = shouldShowDrawers && isRackActive;
  // Position background panel behind the drawer backs
  // Drawers are positioned at Z=0, their backs are at -drawerDepth/2
  // Place background slightly behind that
  const interiorBackgroundZ = -drawerDepth / 2 - 0.2;
  const dividerThickness = Math.max(
    0.01,
    frameThickness * FOUNDATION_LAYOUT_RATIOS.dividerThicknessRatio
  );
  const dividerGeometry = useMemo(
    () => new THREE.PlaneGeometry(innerPanelWidth, dividerThickness),
    [dividerThickness, innerPanelWidth]
  );
  const dividerPositions = useMemo(() => {
    if (drawerSlotCount <= 1) return [];
    const values = [];
    const startY = innerHeight / 2 - drawerHeight / 2;
    for (let slotIndex = 0; slotIndex < drawerSlotCount - 1; slotIndex += 1) {
      const centerY = startY - slotIndex * (drawerHeight + drawerSpacing);
      values.push(centerY - drawerHeight / 2 - drawerSpacing / 2);
    }
    return values;
  }, [drawerHeight, drawerSlotCount, drawerSpacing, innerHeight]);
  const interactionPlaneZ = depth / 2 + Math.max(1, drawerSlideDistance);

  return (
    <AnimatedGroup {...props} ref={groupRef} position={spring.position}>
      {/* Back face */}
      <AnimatedMesh
        position={[0, 0, -depth / 2]}
        geometry={backGeometry}
        dispose={null}>
        {createFaceMaterial(backFaceColor, spring.opacity, hasEntered)}
      </AnimatedMesh>

      {/* Left face */}
      <AnimatedMesh
        position={[-width / 2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        geometry={leftGeometry}
        dispose={null}>
        {createFaceMaterial(leftFaceColor, spring.opacity, hasEntered)}
      </AnimatedMesh>

      {/* Right face */}
      <AnimatedMesh
        position={[width / 2, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        geometry={rightGeometry}
        dispose={null}>
        {createFaceMaterial(rightFaceColor, spring.opacity, hasEntered)}
      </AnimatedMesh>

      {/* Top face */}
      <AnimatedMesh
        position={[0, height / 2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={topGeometry}
        dispose={null}>
        {createFaceMaterial(topFaceColor, spring.opacity, hasEntered)}
      </AnimatedMesh>

      {/* Bottom face */}
      <AnimatedMesh
        position={[0, -height / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={bottomGeometry}
        dispose={null}>
        {createFaceMaterial(bottomFaceColor, spring.opacity, hasEntered)}
      </AnimatedMesh>

      {shouldShowOpenFrame ? (
        <>
          {/* Frame - Top bar */}
          <AnimatedMesh
            position={[0, height / 2 - frameThickness / 2, depth / 2]}
            geometry={frameHorizontalGeometry}
            dispose={null}>
            {createFaceMaterial(frontColor, spring.opacity, hasEntered)}
          </AnimatedMesh>

          {/* Frame - Bottom bar */}
          <AnimatedMesh
            position={[0, -height / 2 + frameThickness / 2, depth / 2]}
            geometry={frameHorizontalGeometry}
            dispose={null}>
            {createFaceMaterial(frontColor, spring.opacity, hasEntered)}
          </AnimatedMesh>

          {/* Frame - Left bar */}
          <AnimatedMesh
            position={[-width / 2 + frameThickness / 2, 0, depth / 2]}
            geometry={frameVerticalGeometry}
            dispose={null}>
            {createFaceMaterial(frontColor, spring.opacity, hasEntered)}
          </AnimatedMesh>

          {/* Frame - Right bar */}
          <AnimatedMesh
            position={[width / 2 - frameThickness / 2, 0, depth / 2]}
            geometry={frameVerticalGeometry}
            dispose={null}>
            {createFaceMaterial(frontColor, spring.opacity, hasEntered)}
          </AnimatedMesh>
        </>
      ) : (
        <>
          {/* Closed front panel (empty rack state) */}
          <AnimatedMesh
            position={[0, 0, depth / 2]}
            geometry={frontGeometry}
            dispose={null}>
            {createFaceMaterial(frontColor, spring.opacity, hasEntered)}
          </AnimatedMesh>

          <AnimatedMesh
            position={[
              0,
              0,
              depth / 2 + FOUNDATION_LAYOUT_RATIOS.panelLayerBias,
            ]}
            geometry={panelGeometry}
            dispose={null}>
            {createFaceMaterial(frontPanelColor, spring.opacity, hasEntered)}
          </AnimatedMesh>

          <AnimatedMesh
            position={[
              0,
              0,
              depth / 2 + FOUNDATION_LAYOUT_RATIOS.outlineLayerBias,
            ]}
            geometry={outlineRingGeometry}
            dispose={null}>
            {createFaceMaterial(frontOutlineColor, spring.opacity, hasEntered)}
          </AnimatedMesh>
        </>
      )}

      {/* Background panel with divider lines and outline (stays in place when drawers slide out) */}
      {shouldShowDrawers ? (
        <>
          {/* Dark background panel behind drawers */}
          <AnimatedMesh
            position={[0, 0, interiorBackgroundZ]}
            geometry={panelGeometry}
            dispose={null}
            renderOrder={0}>
            {createFaceMaterial(
              sceneColors.foundationInteriorBackground,
              spring.opacity,
              hasEntered
            )}
          </AnimatedMesh>

          {/* Horizontal divider lines between drawer slots */}
          {dividerPositions.map((dividerY, index) => (
            <AnimatedMesh
              key={`divider-${index}`}
              position={[0, dividerY, interiorBackgroundZ + 0.005]}
              geometry={dividerGeometry}
              dispose={null}
              renderOrder={1}>
              {createFaceMaterial(
                sceneColors.foundationDivider,
                spring.opacity,
                hasEntered
              )}
            </AnimatedMesh>
          ))}

          {/* Outline border around drawer area (matching empty state style) */}
          <AnimatedMesh
            position={[
              0,
              0,
              depth / 2 + FOUNDATION_LAYOUT_RATIOS.outlineLayerBias,
            ]}
            geometry={outlineRingGeometry}
            dispose={null}>
            {createFaceMaterial(frontOutlineColor, spring.opacity, hasEntered)}
          </AnimatedMesh>
        </>
      ) : null}

      {/* Server Drawers */}
      {shouldShowDrawers
        ? drawerPositions.map((pos, index) => (
            <ServerDrawer
              key={index}
              position={pos}
              dimensions={drawerDimensions}
              isHovered={isRackActive}
              isExtended={drawersExtended}
              status={status}
              opacity={1}
              drawerIndex={index}
              drawerTotal={safeDrawerCount}
              slideDistance={drawerSlideDistance}
              enterDelayMs={enterDelayMs}
              rackIndex={rackIndex}
            />
          ))
        : null}
      <AnimatedMesh
        geometry={focusRingGeometry}
        position={[0, 0, depth / 2 + 0.06]}
        dispose={null}
        renderOrder={100}
        raycast={() => null}>
        <AnimatedMaterial
          color={sceneColors.focusRing}
          transparent
          opacity={isFocused ? spring.opacity : 0}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </AnimatedMesh>
      <mesh
        position={[0, 0, interactionPlaneZ]}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={onBlockClick ? handleClick : undefined}>
        <planeGeometry
          args={[width + frameThickness * 2, height + frameThickness * 2]}
        />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </AnimatedGroup>
  );
});

export default FoundationLayer;
