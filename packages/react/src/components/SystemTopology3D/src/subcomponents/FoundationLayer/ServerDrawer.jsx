import React, { memo, useMemo, useState } from 'react';
import { animated, useSpring } from '@react-spring/three';
import * as THREE from 'three';
import { ENTER_ANIM_DURATION, ENTER_STAGGER } from '../../constants';
import { useCanvasTheme } from '../../themeContext';
import { getFoundationTokens } from '../../styles/themeTokens';

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const AnimatedGroup = animated.group;
const AnimatedMesh = animated.mesh;
const AnimatedMaterial = animated.meshBasicMaterial;
const AnimatedStatusLightMaterial = animated.meshStandardMaterial;

// SVG viewbox proportions for drawer front details
// These are ratios relative to drawer width, not absolute pixels
const DRAWER_DETAIL_PROPORTIONS = Object.freeze({
  leftSquaresX: [7 / 216, 16 / 216], // positions as fraction of width
  rightLinesX: [27 / 216, 23 / 216, 19 / 216], // distances from right edge
  statusX: 7 / 216, // distance from right edge
});

// Layout constants - all derived from drawer dimensions for consistency
const DRAWER_LAYOUT_RATIOS = Object.freeze({
  // Bezel (outline) thickness as ratio of smallest drawer dimension
  bezelRatio: 0.012,
  minBezel: 0.012,

  // Z-positioning to prevent z-fighting
  frontBiasRatio: 0.0005, // bias = depth * ratio
  frontBiasMax: 0.004,
  overlayBiasStep: 0.001,
  polygonOffsetUnits: -2,
});

// Server drawer component representing a single server unit
const ServerDrawer = memo(function ServerDrawer({
  position,
  dimensions,
  isHovered,
  isExtended,
  status = 'green',
  drawerIndex = 0,
  drawerTotal = 4,
  slideDistance = 3,
  enterDelayMs = 0,
  rackIndex = 0,
  ...props
}) {
  const { width, height, depth } = dimensions;
  const [hasEntered, setHasEntered] = useState(false);
  const theme = useCanvasTheme();
  const foundationTokens = getFoundationTokens(theme);

  // Colors for the server drawer - matching Figma design
  const topColor = foundationTokens.foundationWorkerNodeTop;
  const bottomColor = foundationTokens.foundationWorkerNodeBottom;
  const leftColor = foundationTokens.foundationWorkerNodeSide;
  const rightColor = foundationTokens.foundationWorkerNodeSide;
  const frontColor = foundationTokens.foundationWorkerNodeFront;
  const backColor = foundationTokens.foundationWorkerNodeBack;
  const statusLightColor =
    foundationTokens[
      `foundationWorkerNodeStatus${
        status.charAt(0).toUpperCase() + status.slice(1)
      }`
    ] ?? foundationTokens.foundationWorkerNodeStatusGreen;
  const detailColor = foundationTokens.foundationWorkerNodeButtons;

  const isOpen = isExtended ?? isHovered ?? false;
  const slideOffset = isOpen ? slideDistance : 0; // 0 = closed state, slideDistance = open state

  // Hover stagger: bottom drawer (index 3) animates first, top drawer (index 0) last
  // 30ms delay per drawer for smoother animation
  const hoverStaggerDelay = Math.max(0, drawerTotal - 1 - drawerIndex) * 30;

  // Initial load animation: bottom-to-top within rack, left-to-right across racks
  // Similar to PrimaryLayer: use enterIndex-based sequencing with ENTER_STAGGER
  // Bottom drawer = 0, top drawer = drawerTotal-1 (reverse of drawerIndex)
  const rowIndex = drawerTotal - 1 - drawerIndex; // Reverse: bottom = 0, top = drawerTotal-1
  const slotOrder = rowIndex + rackIndex * drawerTotal; // Left-to-right racks, bottom-to-top within

  // Use ENTER_STAGGER constant (40ms) for consistent timing with PrimaryLayer blocks
  const loadStaggerDelay = slotOrder * ENTER_STAGGER * 1000;
  // Drawers start animating AFTER the rack chassis has fully entered
  // Add the rack's enter animation duration (ENTER_ANIM_DURATION) to ensure chassis lands first
  const totalLoadDelay =
    enterDelayMs + ENTER_ANIM_DURATION * 1000 + loadStaggerDelay;

  // Slide in from outside along Z-axis during load (start at Z + 6, half the rack depth)
  const enterZOffset = 6;
  const enterFromPosition = [
    position[0],
    position[1],
    position[2] + enterZOffset,
  ];
  const targetPosition = [position[0], position[1], position[2] + slideOffset];

  const spring = useSpring({
    from: {
      position: enterFromPosition,
      opacity: 0,
    },
    to: {
      position: targetPosition,
      opacity: 1,
    },
    delay: hasEntered ? (isOpen ? hoverStaggerDelay : 0) : totalLoadDelay,
    config: hasEntered
      ? {
          tension: 300,
          friction: 30,
        }
      : {
          duration: ENTER_ANIM_DURATION * 1000,
          easing: easeInOutCubic,
        },
    onRest: () => {
      if (!hasEntered) {
        setHasEntered(true);
      }
    },
  });

  const statusLightSpring = useSpring({
    emissiveIntensity: isOpen ? 4 : 1,
    scale: isOpen ? 1.15 : 1,
    config: {
      tension: 320,
      friction: 22,
    },
  });

  // No bezel/outline - drawer fills its full dimensions
  // Gaps between drawers are created by spacing in FoundationLayer
  const frontFaceWidth = width;
  const frontFaceHeight = height;

  // Keep front geometrically aligned to the drawer body; use tiny bias + polygonOffset
  // to beat the darker interior face without perspective drift.
  const frontBiasZ = Math.min(
    DRAWER_LAYOUT_RATIOS.frontBiasMax,
    depth * DRAWER_LAYOUT_RATIOS.frontBiasRatio
  );
  const frontFaceZ = depth / 2 + frontBiasZ;
  const frontDetailZ = frontFaceZ + DRAWER_LAYOUT_RATIOS.overlayBiasStep;

  // Create geometries for the drawer faces
  const frontGeometry = useMemo(
    () => new THREE.PlaneGeometry(frontFaceWidth, frontFaceHeight),
    [frontFaceHeight, frontFaceWidth]
  );
  const backGeometry = useMemo(
    () => new THREE.PlaneGeometry(width, height),
    [width, height]
  );
  const sideGeometry = useMemo(
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

  // Front panel details - sized proportionally to drawer dimensions
  // All sizes are ratios of drawer width/height for consistent scaling
  const statusLightSize = width * 0.014; // ~3/216 of width
  const rectangleWidth = width * 0.028; // ~6/216 of width
  const rectangleHeight = height * 0.35; // ~7/20 of height (assuming ~20 unit height)
  const lineWidth = width * 0.009; // ~2/216 of width (width of each vertical line)
  const lineHeight = height * 0.45; // ~45% of drawer height for vertical pill lines

  // Convert proportion (0-1) to x position on drawer front
  const toFrontX = (proportion) => -width / 2 + proportion * width;

  const statusLightGeometry = useMemo(
    () => new THREE.CircleGeometry(statusLightSize, 8),
    [statusLightSize]
  );
  const rectangleGeometry = useMemo(
    () => new THREE.PlaneGeometry(rectangleWidth, rectangleHeight),
    [rectangleWidth, rectangleHeight]
  );
  // Create rounded line geometry (capsule shape)
  const lineGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = lineWidth / 2;
    const halfHeight = lineHeight / 2 - radius;

    // Create a rounded rectangle (capsule) shape
    shape.moveTo(-radius, -halfHeight);
    shape.lineTo(-radius, halfHeight);
    shape.absarc(0, halfHeight, radius, Math.PI, 0, true);
    shape.lineTo(radius, -halfHeight);
    shape.absarc(0, -halfHeight, radius, 0, Math.PI, true);

    return new THREE.ShapeGeometry(shape);
  }, [lineWidth, lineHeight]);

  return (
    <AnimatedGroup {...props} position={spring.position}>
      {/* Front face */}
      <AnimatedMesh
        position={[0, 0, frontFaceZ]}
        geometry={frontGeometry}
        dispose={null}
        renderOrder={100}>
        <AnimatedMaterial
          color={frontColor}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent
          opacity={spring.opacity}
          depthTest={false}
          depthWrite={false}
        />
      </AnimatedMesh>

      {/* Back face */}
      <AnimatedMesh
        position={[0, 0, -depth / 2]}
        geometry={backGeometry}
        dispose={null}>
        <AnimatedMaterial
          color={backColor}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent
          opacity={spring.opacity}
          depthWrite={hasEntered}
          depthTest={true}
        />
      </AnimatedMesh>

      {/* Left face */}
      <AnimatedMesh
        position={[-width / 2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        geometry={sideGeometry}
        dispose={null}>
        <AnimatedMaterial
          color={leftColor}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent
          opacity={spring.opacity}
          depthWrite={hasEntered}
          depthTest={true}
        />
      </AnimatedMesh>

      {/* Right face */}
      <AnimatedMesh
        position={[width / 2, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        geometry={sideGeometry}
        dispose={null}>
        <AnimatedMaterial
          color={rightColor}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent
          opacity={spring.opacity}
          depthWrite={hasEntered}
          depthTest={true}
        />
      </AnimatedMesh>

      {/* Top face */}
      <AnimatedMesh
        position={[0, height / 2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={topGeometry}
        dispose={null}>
        <AnimatedMaterial
          color={topColor}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent
          opacity={spring.opacity}
          depthWrite={hasEntered}
          depthTest={true}
        />
      </AnimatedMesh>

      {/* Bottom face */}
      <AnimatedMesh
        position={[0, -height / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={bottomGeometry}
        dispose={null}>
        <AnimatedMaterial
          color={bottomColor}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent
          opacity={spring.opacity}
          depthWrite={hasEntered}
          depthTest={true}
        />
      </AnimatedMesh>

      {/* Front panel details - positioned directly as children of main AnimatedGroup */}
      {/* Rectangles on left side - positioned like SVG (x: 4-10 and 13-19) */}
      <AnimatedMesh
        position={[
          toFrontX(DRAWER_DETAIL_PROPORTIONS.leftSquaresX[0]),
          0,
          frontDetailZ,
        ]}
        geometry={rectangleGeometry}
        dispose={null}
        renderOrder={101}>
        <AnimatedMaterial
          color={detailColor}
          toneMapped={false}
          transparent
          opacity={spring.opacity}
          depthTest={false}
        />
      </AnimatedMesh>

      <AnimatedMesh
        position={[
          toFrontX(DRAWER_DETAIL_PROPORTIONS.leftSquaresX[1]),
          0,
          frontDetailZ,
        ]}
        geometry={rectangleGeometry}
        dispose={null}
        renderOrder={101}>
        <AnimatedMaterial
          color={detailColor}
          toneMapped={false}
          transparent
          opacity={spring.opacity}
          depthTest={false}
        />
      </AnimatedMesh>

      {/* Vertical lines on right side - positioned like SVG (x: 187-189, 191-193, 195-197) */}
      <AnimatedMesh
        position={[
          width / 2 - DRAWER_DETAIL_PROPORTIONS.rightLinesX[0] * width,
          0,
          frontDetailZ,
        ]}
        geometry={lineGeometry}
        dispose={null}
        renderOrder={101}>
        <AnimatedMaterial
          color={detailColor}
          toneMapped={false}
          transparent
          opacity={spring.opacity}
          depthTest={false}
        />
      </AnimatedMesh>

      <AnimatedMesh
        position={[
          width / 2 - DRAWER_DETAIL_PROPORTIONS.rightLinesX[1] * width,
          0,
          frontDetailZ,
        ]}
        geometry={lineGeometry}
        dispose={null}
        renderOrder={101}>
        <AnimatedMaterial
          color={detailColor}
          toneMapped={false}
          transparent
          opacity={spring.opacity}
          depthTest={false}
        />
      </AnimatedMesh>

      <AnimatedMesh
        position={[
          width / 2 - DRAWER_DETAIL_PROPORTIONS.rightLinesX[2] * width,
          0,
          frontDetailZ,
        ]}
        geometry={lineGeometry}
        dispose={null}
        renderOrder={101}>
        <AnimatedMaterial
          color={detailColor}
          toneMapped={false}
          transparent
          opacity={spring.opacity}
          depthTest={false}
        />
      </AnimatedMesh>

      {/* Status light indicator at x: 209 */}
      <AnimatedMesh
        position={[
          width / 2 - DRAWER_DETAIL_PROPORTIONS.statusX * width,
          0,
          frontDetailZ,
        ]}
        scale={statusLightSpring.scale}
        geometry={statusLightGeometry}
        dispose={null}
        renderOrder={101}>
        <AnimatedStatusLightMaterial
          color={statusLightColor}
          emissive={statusLightColor}
          emissiveIntensity={statusLightSpring.emissiveIntensity}
          transparent
          opacity={spring.opacity}
          depthTest={false}
        />
      </AnimatedMesh>
    </AnimatedGroup>
  );
});

export default ServerDrawer;

// Made with Bob
