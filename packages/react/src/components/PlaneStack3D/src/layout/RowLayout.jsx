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
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import * as THREE from 'three';
import CoreLayer from '../subcomponents/CoreLayer';
import FoundationLayer from '../subcomponents/FoundationLayer';
import { BLOCK_SIZES } from '../types';
import {
  BLOCK_DEPTH,
  BLOCK_GAP,
  COLUMN_GAP,
  COLUMN_SPACING,
  COLUMN_WIDTH,
  LOAD_TIMINGS_MS,
  ENTER_ANIM_DURATION,
} from '../constants';
import {
  getBlockHeight,
  getRowHeight,
  isLongBlockRow,
  isFramedRow,
} from './utils';
import StackedColumn from './StackedColumn';
import { isGradient } from '../utils/gradientParser';
import { getFocusRingGeometry } from '../subcomponents/shared/focusRingGeometry';

// Renders one row: either a single long block or stacked columns.
function RowLayout({
  rowData,
  yPosition = 0,
  totalColumns = 6,
  rowIndex = 0,
  rowStartIndex = 0,
  focusedId,
  focusedGroupLayer = null,
  rowTypeOrdinal = 0,
  skeletonLoader = false,
  skipPrimaryEnterAnimation = false,
  onBlockClick,
}) {
  const [loadingCycleKey, setLoadingCycleKey] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState('in'); // "in" or "out"
  const timeoutRef = useRef(null);
  const longBlock = isLongBlockRow(rowData) ? rowData[0][0] : null;
  const longBlockColor = longBlock?.color;
  const longFaceColors = useMemo(() => {
    if (!longBlock) return null;

    // If it's a gradient, only apply to front face, use solid colors for others
    if (isGradient(longBlockColor)) {
      const leftColor = longBlock.leftColor || '#313131';
      const topColor = longBlock.topColor || '#222222';
      return [
        leftColor, // left
        leftColor, // right
        topColor, // top
        topColor, // bottom
        longBlockColor, // front - gradient here
        leftColor, // back
      ];
    }

    // For solid colors, create darker/lighter variations
    const baseColor = new THREE.Color(longBlockColor || 'gray');
    return [
      baseColor.clone().multiplyScalar(0.7),
      baseColor.clone().multiplyScalar(0.7),
      baseColor.clone().multiplyScalar(0.5),
      baseColor.clone().multiplyScalar(0.5),
      baseColor.clone(),
      baseColor.clone().multiplyScalar(0.8),
    ];
  }, [longBlock, longBlockColor]);

  const columnStartIndices = useMemo(() => {
    const indices = [];
    let running = 0;
    for (const column of rowData) {
      indices.push(running);
      running += column.length;
    }
    return indices;
  }, [rowData]);

  // Seeded random helper - matches StackedColumn logic
  const seededRandom = useCallback((seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }, []);

  // Handle loading cycle reset with phase transitions
  useEffect(() => {
    if (skeletonLoader && rowData.length > 0) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Calculate when the last block will finish
      // Find the last column and use same seeded random as StackedColumn
      const lastColumnIndex = rowData.length - 1;
      const lastColumnSeed = loadingCycleKey * 1000 + lastColumnIndex;
      const blocksInLastColumn =
        Math.floor(seededRandom(lastColumnSeed) * 3) + 1;
      const lastBlockIndexInColumn = blocksInLastColumn - 1;

      // Calculate delay using same formula as StackedColumn
      const lastBlockDelay =
        LOAD_TIMINGS_MS.primaryBase +
        rowTypeOrdinal * LOAD_TIMINGS_MS.primaryRowGroupStep +
        lastColumnIndex * LOAD_TIMINGS_MS.primaryColumnStep +
        lastBlockIndexInColumn * LOAD_TIMINGS_MS.primaryItemStep;

      const animDuration = 0.44 * 1000; // ENTER_ANIM_DURATION

      if (loadingPhase === 'in') {
        // After "in" phase completes, switch to "out" phase
        // Wait for last block to finish animating in (staggered)
        const totalInTime = lastBlockDelay + animDuration;
        timeoutRef.current = setTimeout(() => {
          setLoadingPhase('out');
        }, totalInTime);
      } else {
        // After "out" phase completes, restart with "in" phase
        // Blocks stagger out same as they stagger in, so wait for last block to finish
        const totalOutTime = lastBlockDelay + animDuration;
        timeoutRef.current = setTimeout(() => {
          setLoadingPhase('in');
          setLoadingCycleKey((prev) => prev + 1);
        }, totalOutTime);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    skeletonLoader,
    loadingCycleKey,
    loadingPhase,
    rowData.length,
    rowTypeOrdinal,
    seededRandom,
  ]);

  const primaryLayerBaseMs = LOAD_TIMINGS_MS.primaryBase;
  const rowLayerType = useMemo(() => {
    if (longBlock) return 'core';
    if (isFramedRow(rowData)) return 'foundation';
    return 'primary';
  }, [longBlock, rowData]);
  const shouldShowGroupFocusRing = focusedGroupLayer === rowLayerType;
  const groupRingHeight = useMemo(() => getRowHeight(rowData), [rowData]);
  const groupRingColumns = Math.max(1, totalColumns);
  const groupRingWidth = groupRingColumns * COLUMN_SPACING - COLUMN_GAP;
  const groupRingCenterX = ((groupRingColumns - 1) * COLUMN_SPACING) / 2;
  const groupFocusRingGeometry = useMemo(
    () =>
      getFocusRingGeometry(groupRingWidth, groupRingHeight, {
        thickness: 0.16,
        padding: 0.12,
      }),
    [groupRingHeight, groupRingWidth]
  );
  const renderGroupFocusRing = (yOffset = 0) => {
    if (!shouldShowGroupFocusRing) return null;
    return (
      <mesh
        geometry={groupFocusRingGeometry}
        position={[
          groupRingCenterX,
          yOffset + groupRingHeight / 2,
          BLOCK_DEPTH / 2 + 0.08,
        ]}
        renderOrder={100}
        raycast={() => null}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.95}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    );
  };

  if (longBlock) {
    const block = longBlock;
    const height = getBlockHeight(block.size);
    const columns = Math.max(1, totalColumns);
    // Long blocks span the full grid width, centered over all columns.
    const width = columns * COLUMN_SPACING - COLUMN_GAP;
    const depth = BLOCK_DEPTH;
    const centerX = ((columns - 1) * COLUMN_SPACING) / 2;
    const longBlockId = block.id || `row-${rowIndex}-long`;

    // Calculate dynamic core timing based on foundation racks in previous row
    // Assumes foundation row has same column count, calculates when 50% of racks complete
    const columnsPerRack = 2;
    const numRacks = Math.floor(columns / columnsPerRack);
    const halfwayRackIndex = Math.max(0, Math.floor(numRacks / 2) - 1); // 50% point (0-indexed)
    // Time when halfway rack completes: foundationBase + halfwayRackIndex * stagger + animation duration
    const foundationHalfwayComplete =
      LOAD_TIMINGS_MS.foundationBase +
      halfwayRackIndex * LOAD_TIMINGS_MS.foundationRackStagger +
      ENTER_ANIM_DURATION * 1000;

    const coreEnterDelay =
      foundationHalfwayComplete + rowTypeOrdinal * LOAD_TIMINGS_MS.coreRowStep;

    return (
      <group>
        {renderGroupFocusRing(yPosition)}
        <CoreLayer
          position={[centerX, yPosition + height / 2, 0]}
          dimensions={{ width, height, depth }}
          faceColors={longFaceColors}
          text={block.text}
          hoverText={block.hoverText}
          textColor={block.textColor}
          enterIndex={rowStartIndex}
          enterDelayMs={coreEnterDelay}
          isFocused={focusedId === longBlockId}
          onBlockClick={onBlockClick}
          blockId={longBlockId}
        />
      </group>
    );
  }

  // Handle framed row (boxes with open front faces)
  if (isFramedRow(rowData)) {
    const height = getBlockHeight(BLOCK_SIZES.framed);
    const depth = BLOCK_DEPTH;
    const columns = Math.max(1, totalColumns);

    // Each server rack should span exactly 2 primary layer blocks
    // Width = 2 column widths + 1 gap between them
    // Example: 8 + 8 + 0.5 = 16.5
    const columnsPerRack = 2;
    const numRacksToRender = Math.floor(columns / columnsPerRack);
    const rackWidth = columnsPerRack * COLUMN_WIDTH + COLUMN_GAP;

    return (
      <group position={[0, yPosition, 0]}>
        {renderGroupFocusRing()}
        {Array.from({ length: numRacksToRender }).map((_, rackIndex) => {
          // Use the block data if available, cycling through available blocks
          const block =
            rowData[rackIndex % rowData.length]?.[0] || rowData[0][0];
          const rackBlockId = block.id || `row-${rowIndex}-rack-${rackIndex}`;

          // Position each rack centered over its 2 columns
          // Rack 0: centered between cols 0-1 (at x = 0.5 * COLUMN_SPACING)
          // Rack 1: centered between cols 2-3 (at x = 2.5 * COLUMN_SPACING)
          const xPos =
            (rackIndex * columnsPerRack + (columnsPerRack - 1) / 2) *
            COLUMN_SPACING;
          const enterIdx = rowStartIndex + rackIndex;

          // Calculate enterDelayMs using the same sequencing pattern as PrimaryLayer blocks
          // This creates left-to-right staggered animation across racks
          const enterDelayMs =
            LOAD_TIMINGS_MS.foundationBase +
            rowTypeOrdinal * LOAD_TIMINGS_MS.foundationRowStep +
            rackIndex * LOAD_TIMINGS_MS.foundationRackStagger;

          return (
            <FoundationLayer
              key={
                block.id
                  ? `${block.id}-${rackIndex}`
                  : `framed-${rowIndex}-${rackIndex}`
              }
              position={[xPos, height / 2, 0]}
              dimensions={{ width: rackWidth, height, depth }}
              variant={block.variant}
              status={block.status}
              drawerCount={block.drawerCount}
              drawerSlideDistance={block.drawerSlideDistance}
              enterIndex={enterIdx}
              enterDelayMs={enterDelayMs}
              rackIndex={rackIndex}
              isFocused={focusedId === rackBlockId}
              onBlockClick={onBlockClick}
              blockId={rackBlockId}
            />
          );
        })}
      </group>
    );
  }

  return (
    <group position={[0, yPosition, 0]}>
      {renderGroupFocusRing()}
      {rowData.map((columnBlocks, colIndex) => {
        // Use first block's ID as column key if available, otherwise use index
        const columnKey = columnBlocks[0]?.id
          ? `col-${columnBlocks[0].id}`
          : colIndex;

        return (
          <StackedColumn
            key={columnKey}
            blocks={columnBlocks}
            gap={BLOCK_GAP}
            xPosition={colIndex * COLUMN_SPACING}
            zPosition={0}
            columnIndex={colIndex}
            rowIndex={rowIndex}
            rowStartIndex={rowStartIndex}
            columnStartIndex={columnStartIndices[colIndex] ?? 0}
            focusedId={focusedId}
            primaryEnterBaseMs={
              primaryLayerBaseMs +
              rowTypeOrdinal * LOAD_TIMINGS_MS.primaryRowGroupStep
            }
            primaryColumnStepMs={LOAD_TIMINGS_MS.primaryColumnStep}
            primaryItemStepMs={LOAD_TIMINGS_MS.primaryItemStep}
            skeletonLoader={skeletonLoader}
            loadingCycleKey={loadingCycleKey}
            loadingPhase={loadingPhase}
            skipEnterAnimation={skipPrimaryEnterAnimation}
            onBlockClick={onBlockClick}
          />
        );
      })}
    </group>
  );
}

function areRowLayoutPropsEqual(prev, next) {
  if (prev.rowData !== next.rowData) return false;
  if (prev.yPosition !== next.yPosition) return false;
  if (prev.totalColumns !== next.totalColumns) return false;
  if (prev.rowIndex !== next.rowIndex) return false;
  if (prev.rowStartIndex !== next.rowStartIndex) return false;
  if (prev.rowTypeOrdinal !== next.rowTypeOrdinal) return false;
  if (prev.skeletonLoader !== next.skeletonLoader) return false;
  if (prev.skipPrimaryEnterAnimation !== next.skipPrimaryEnterAnimation) {
    return false;
  }
  if (prev.focusedGroupLayer !== next.focusedGroupLayer) return false;
  if (prev.focusedId === next.focusedId) return true;

  // Check if this row contains the focused block
  const hasMatchingBlock = (focusedId) => {
    if (!focusedId) return false;
    // Check for long block (core layer) - match by block.id or fallback generated id
    if (isLongBlockRow(next.rowData)) {
      const longBlockId = next.rowData[0][0].id || `row-${next.rowIndex}-long`;
      if (focusedId === longBlockId) return true;
    }
    // Check all blocks in all columns
    return next.rowData.some((column) =>
      column.some((block) => block.id === focusedId)
    );
  };

  const prevRelevant = hasMatchingBlock(prev.focusedId);
  const nextRelevant = hasMatchingBlock(next.focusedId);
  return !prevRelevant && !nextRelevant;
}

export default memo(RowLayout, areRowLayoutPropsEqual);
