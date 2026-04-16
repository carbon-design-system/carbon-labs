import React, { useMemo, useState, useCallback } from 'react';
import { useCursor } from '@react-three/drei';
import {
  BLOCK_DEPTH,
  COLUMN_GAP,
  COLUMN_SPACING,
  ROW_GAP,
  getPrimaryCenterX,
} from '../../constants';
import { getRowHeight } from '../../layout/utils';
import { useCanvasTheme } from '../../themeContext';
import { getCarouselColors } from '../../styles/themeTokens';

const PRIMARY_LAYER_MAX_HEIGHT_REM = 14;
const PRIMARY_LAYER_ARROW_HEIGHT_RATIO = 0.3;
const PRIMARY_LAYER_DOT_MARGIN_REM = 1.75;
const STACK_VERTICAL_PADDING = 4;
const CONTROL_Z = BLOCK_DEPTH / 2 + 0.6;
const ARROW_SEGMENT_LENGTH = 0.68;
const ARROW_SEGMENT_THICKNESS = 0.07;
const ARROW_SEGMENT_ANGLE_RAD = 0.78;
const ARROW_SEGMENT_OFFSET_Y = 0.24;
const ARROW_JOIN_RADIUS = 0.045;
const ARROW_HIT_WIDTH = 1.8;
const ARROW_HIT_HEIGHT = 1.8;
const DOT_SIZE_REM = 0.75;
const DOT_RADIUS = DOT_SIZE_REM / 2;
const DOT_ACTIVE_SCALE = 1.15;
const FOCUS_OUTLINE_REM = 0.125; // ~2px at 16px root font size
const FOCUS_OFFSET_REM = 0.125; // ~2px
const DOT_SPACING = 1.45;
const RIGHT_ARROW_X_GAP = 2.0;
const LEFT_ARROW_X_GAP_BY_COLUMN_COUNT = {
  2: 6.5,
  4: 6.25,
  6: 5.75,
  8: 5,
};

function ArrowGlyph({ color, opacity = 1, scale = 1, z = 0 }) {
  return (
    <group scale={scale} position={[0, 0, z]}>
      <mesh
        position={[0, ARROW_SEGMENT_OFFSET_Y, 0]}
        rotation={[0, 0, ARROW_SEGMENT_ANGLE_RAD]}>
        <boxGeometry
          args={[ARROW_SEGMENT_LENGTH, ARROW_SEGMENT_THICKNESS, 0.03]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <mesh
        position={[0, -ARROW_SEGMENT_OFFSET_Y, 0]}
        rotation={[0, 0, -ARROW_SEGMENT_ANGLE_RAD]}>
        <boxGeometry
          args={[ARROW_SEGMENT_LENGTH, ARROW_SEGMENT_THICKNESS, 0.03]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-0.22, 0, 0.001]}>
        <circleGeometry args={[ARROW_JOIN_RADIUS, 14]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function getPrimaryRowBottomY(rows, rowGap = ROW_GAP) {
  if (!rows || rows.length === 0) return 0;
  const reversedRows = rows
    .map((rowData, index) => ({ rowData, sourceIndex: index }))
    .reverse();
  const rowPositions = [];

  for (const row of reversedRows) {
    const previousY =
      rowPositions.length > 0
        ? rowPositions[rowPositions.length - 1].nextY
        : -STACK_VERTICAL_PADDING;
    const rowHeight = getRowHeight(row.rowData);
    rowPositions.push({
      sourceIndex: row.sourceIndex,
      yPos: previousY,
      nextY: previousY + rowHeight + rowGap,
    });
  }

  const primaryRow = rowPositions.find((row) => row.sourceIndex === 0);
  return primaryRow?.yPos ?? 0;
}

function getLeftArrowGap(columnCount) {
  const safeColumnCount = Math.max(1, Math.min(8, Number(columnCount) || 1));
  return (
    LEFT_ARROW_X_GAP_BY_COLUMN_COUNT[safeColumnCount] ??
    LEFT_ARROW_X_GAP_BY_COLUMN_COUNT[8]
  );
}

function ArrowControl({
  position,
  direction,
  onClick,
  isKeyboardActive = false,
}) {
  const [hovered, setHovered] = useState(false);
  const theme = useCanvasTheme();
  const carouselColors = getCarouselColors(theme);
  useCursor(hovered);
  const isHighlighted = hovered || isKeyboardActive;
  const focusOutlineWidth = ARROW_HIT_WIDTH + FOCUS_OFFSET_REM * 2;
  const focusOutlineHeight = ARROW_HIT_HEIGHT + FOCUS_OFFSET_REM * 2;
  const focusStroke = FOCUS_OUTLINE_REM;

  const handleClick = useCallback(
    (event) => {
      event.stopPropagation();
      onClick();
    },
    [onClick]
  );

  return (
    <group position={position}>
      <mesh
        position={[0, 0, -0.01]}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setHovered(false);
        }}
        onClick={handleClick}>
        <planeGeometry args={[ARROW_HIT_WIDTH, ARROW_HIT_HEIGHT]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      {isKeyboardActive && (
        <group position={[0, 0, 0.015]}>
          <mesh position={[0, focusOutlineHeight / 2, 0]}>
            <planeGeometry
              args={[focusOutlineWidth + focusStroke, focusStroke]}
            />
            <meshBasicMaterial
              color={carouselColors.dotFocus}
              transparent
              opacity={1}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, -focusOutlineHeight / 2, 0]}>
            <planeGeometry
              args={[focusOutlineWidth + focusStroke, focusStroke]}
            />
            <meshBasicMaterial
              color={carouselColors.dotFocus}
              transparent
              opacity={1}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[-focusOutlineWidth / 2, 0, 0]}>
            <planeGeometry
              args={[focusStroke, focusOutlineHeight + focusStroke]}
            />
            <meshBasicMaterial
              color={carouselColors.dotFocus}
              transparent
              opacity={1}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[focusOutlineWidth / 2, 0, 0]}>
            <planeGeometry
              args={[focusStroke, focusOutlineHeight + focusStroke]}
            />
            <meshBasicMaterial
              color={carouselColors.dotFocus}
              transparent
              opacity={1}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
      <group rotation={[0, 0, direction === 'left' ? 0 : Math.PI]}>
        {isHighlighted && (
          <mesh position={[0.025, 0, 0]}>
            <ArrowGlyph
              color={carouselColors.arrowHover}
              scale={1.1}
              z={0.01}
            />
          </mesh>
        )}
        <ArrowGlyph
          color={
            isHighlighted ? carouselColors.arrowHover : carouselColors.arrow
          }
          opacity={isHighlighted ? 1 : 0.95}
          z={0.02}
        />
      </group>
    </group>
  );
}

function PrimaryLayerCarouselSceneControls({
  resolvedRows,
  primaryColumnCount,
  pageCount,
  activePageIndex,
  onPrevious,
  onNext,
  onGoToPage,
  keyboardFocus = null,
}) {
  const [hoveredDotIndex, setHoveredDotIndex] = useState(null);
  const theme = useCanvasTheme();
  const carouselColors = getCarouselColors(theme);
  useCursor(hoveredDotIndex !== null);
  const primaryCenterX = getPrimaryCenterX(primaryColumnCount);
  const primaryWorldWidth =
    Math.max(1, primaryColumnCount) * COLUMN_SPACING - COLUMN_GAP;
  const primaryBottomY = useMemo(
    () => getPrimaryRowBottomY(resolvedRows),
    [resolvedRows]
  );
  const primaryRowHeight = useMemo(
    () =>
      Math.min(
        PRIMARY_LAYER_MAX_HEIGHT_REM,
        getRowHeight(resolvedRows?.[0] ?? [])
      ),
    [resolvedRows]
  );
  const arrowY =
    primaryBottomY +
    PRIMARY_LAYER_MAX_HEIGHT_REM * PRIMARY_LAYER_ARROW_HEIGHT_RATIO;
  const dotsY =
    primaryBottomY + primaryRowHeight + PRIMARY_LAYER_DOT_MARGIN_REM;
  const leftArrowGap = getLeftArrowGap(primaryColumnCount);
  const leftArrowX = primaryCenterX - primaryWorldWidth / 2 - leftArrowGap;
  const rightArrowX =
    primaryCenterX + primaryWorldWidth / 2 + RIGHT_ARROW_X_GAP;
  const dotsStartX = primaryCenterX - ((pageCount - 1) * DOT_SPACING) / 2;

  if (pageCount <= 1) return null;

  return (
    <group>
      <ArrowControl
        position={[leftArrowX, arrowY, CONTROL_Z]}
        direction="left"
        onClick={onPrevious}
        isKeyboardActive={keyboardFocus?.type === 'prev'}
      />
      <ArrowControl
        position={[rightArrowX, arrowY, CONTROL_Z]}
        direction="right"
        onClick={onNext}
        isKeyboardActive={keyboardFocus?.type === 'next'}
      />
      {Array.from({ length: pageCount }, (_, index) => {
        const isActive = index === activePageIndex;
        const isKeyboardActive =
          keyboardFocus?.type === 'dot' && keyboardFocus?.index === index;
        const isHovered = hoveredDotIndex === index;
        const dotRadius = DOT_RADIUS * (isActive ? DOT_ACTIVE_SCALE : 1);
        const focusInnerRadius = dotRadius + FOCUS_OFFSET_REM;
        const focusOuterRadius = focusInnerRadius + FOCUS_OUTLINE_REM;
        const dotColor = isActive
          ? carouselColors.dotActive
          : isHovered
          ? carouselColors.dotHover
          : carouselColors.dotDisabled;
        return (
          <group
            key={`primary-page-dot-${index}`}
            position={[dotsStartX + index * DOT_SPACING, dotsY, CONTROL_Z]}>
            <mesh
              onPointerOver={(event) => {
                event.stopPropagation();
                setHoveredDotIndex(index);
              }}
              onPointerOut={(event) => {
                event.stopPropagation();
                setHoveredDotIndex((prev) => (prev === index ? null : prev));
              }}
              onClick={(event) => {
                event.stopPropagation();
                onGoToPage(index);
              }}>
              <circleGeometry args={[dotRadius, 20]} />
              <meshBasicMaterial
                color={dotColor}
                transparent
                opacity={isActive ? 0.95 : 0.8}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
            {isKeyboardActive && (
              <mesh>
                <ringGeometry args={[focusInnerRadius, focusOuterRadius, 20]} />
                <meshBasicMaterial
                  color={carouselColors.dotFocus}
                  transparent
                  opacity={1}
                  toneMapped={false}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export default PrimaryLayerCarouselSceneControls;
