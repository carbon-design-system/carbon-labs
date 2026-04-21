/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Suspense, useMemo } from 'react';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import type { SceneBounds, SceneProps } from './types/component-props';
import AdaptivePixelRatio from './AdaptivePixelRatio';
import Controls from './Controls';
import AlignedGroup from './AlignedGroup';
import MultiRowStack from './layout/MultiRowStack';
import PrimaryLayerCarouselSceneControls from './subcomponents/PrimaryLayer/PrimaryLayerCarouselSceneControls';
import { DIAGRAM_ROTATION_DEG } from './config/cameraConfig';
import { BLOCK_DEPTH, COLUMN_GAP, COLUMN_SPACING, ROW_GAP } from './constants';
import { getRowHeight } from './layout/utils';
import { CanvasThemeProvider } from './themeContext';

const BRACKET_OFFSET_Y = 0.44;
const BRACKET_BOTTOM_PADDING = 2.25;

/**
 * Determines if a row contains primary layer blocks
 */
function isPrimaryLayerRow(rowData: any): boolean {
  if (!rowData || rowData.length === 0) {
    return false;
  }
  // Primary layer rows are not long blocks (core) and not framed (foundation)
  const isLongBlock =
    rowData.length === 1 &&
    rowData[0].length === 1 &&
    rowData[0][0]?.fullWidth === true;
  const isFramed = rowData.every(
    (column: any) =>
      Array.isArray(column) &&
      column.length === 1 &&
      column[0].size === 'framed'
  );
  return !isLongBlock && !isFramed;
}

/**
 * Determines if a row contains core layer blocks (long blocks)
 */
function isCoreLayerRow(rowData: any): boolean {
  if (!rowData || rowData.length === 0) {
    return false;
  }
  return (
    rowData.length === 1 &&
    rowData[0].length === 1 &&
    rowData[0][0]?.fullWidth === true
  );
}

/**
 * Determines if a row contains foundation layer blocks (framed)
 */
function isFoundationLayerRow(rowData: any): boolean {
  if (!rowData || rowData.length === 0) {
    return false;
  }
  return rowData.every(
    (column: any) =>
      Array.isArray(column) &&
      column.length === 1 &&
      column[0].size === 'framed'
  );
}

function buildLogicalSceneBounds(
  resolvedRows,
  primaryColumnCount,
  hasTextBracket: boolean
): SceneBounds | null {
  if (!resolvedRows || resolvedRows.length === 0) {
    return null;
  }

  const primaryWorldWidth =
    Math.max(1, primaryColumnCount) * COLUMN_SPACING - COLUMN_GAP;
  const primaryCenterX =
    ((Math.max(1, primaryColumnCount) - 1) * COLUMN_SPACING) / 2;
  const reversedRows = resolvedRows
    .map((rowData, index) => ({ rowData, sourceIndex: index }))
    .reverse();

  // Detect which layers are present
  const hasPrimaryLayer = resolvedRows.some((rowData) =>
    isPrimaryLayerRow(rowData)
  );
  const hasCoreLayer = resolvedRows.some((rowData) => isCoreLayerRow(rowData));
  const hasFoundationLayer = resolvedRows.some((rowData) =>
    isFoundationLayerRow(rowData)
  );

  // Dynamic top padding based on topmost layer:
  // - Primary layer: 4 units (needs more space for visual hierarchy)
  // - Core layer only: 0.5 units (minimal spacing)
  // - Foundation layer only: 0.5 units (minimal spacing)
  let STACK_VERTICAL_PADDING = 0.5;
  if (hasPrimaryLayer) {
    STACK_VERTICAL_PADDING = 4;
  } else if (hasCoreLayer || hasFoundationLayer) {
    STACK_VERTICAL_PADDING = 0.5;
  }

  let minY = Infinity;
  let maxY = -Infinity;
  let nextBottomY = -STACK_VERTICAL_PADDING;

  for (const row of reversedRows) {
    const rowHeight = getRowHeight(row.rowData);
    const rowBottomY = nextBottomY;
    const rowTopY = rowBottomY + rowHeight;
    minY = Math.min(minY, rowBottomY);
    maxY = Math.max(maxY, rowTopY);
    nextBottomY = rowTopY + ROW_GAP;
  }

  const bottomRowBottomY =
    reversedRows.length > 0 ? -STACK_VERTICAL_PADDING : 0;

  // Only add bracket padding if textBracket is present
  if (hasTextBracket) {
    minY = Math.min(
      minY,
      bottomRowBottomY - BRACKET_OFFSET_Y - BRACKET_BOTTOM_PADDING
    );
  } else {
    // Without text bracket, use minimal bottom padding
    minY = Math.min(minY, bottomRowBottomY - 0.3);
  }

  const centerY = (minY + maxY) / 2;
  const sizeY = maxY - minY;

  return {
    center: [primaryCenterX, centerY, BLOCK_DEPTH / 2],
    size: [primaryWorldWidth, sizeY, BLOCK_DEPTH],
  };
}

/**
 * Scene Component
 * Contains all 3D scene content including effects, controls, and visualization layers
 * Separated from SystemTopology3D for better organization
 */
function Scene({
  resolvedRows,
  textBracket,
  focusedIdForRender,
  focusedGroupLayerForRender,
  primaryColumnCount,
  skeletonLoader,
  onBlockClick,
  enablePrimaryLayerCarousel,
  primaryLayerPageCount,
  activePrimaryLayerPage,
  goToPreviousPage,
  goToNextPage,
  goToPage,
  sceneBoundsRows,
  carouselKeyboardFocus,
  onInitialSceneReady,
  primaryCenterX,
  isPlayingIntroAnimation,
  isPointerInside,
  onIntroAnimationComplete,
  onViewChange,
  theme = 'dark',
  skipPrimaryEnterAnimation = false,
}: SceneProps) {
  const hasTextBracket = useMemo(() => {
    return !!(textBracket?.title || textBracket?.sections?.length);
  }, [textBracket]);

  const sceneBounds = useMemo(
    () =>
      buildLogicalSceneBounds(
        sceneBoundsRows ?? resolvedRows,
        primaryColumnCount,
        hasTextBracket
      ),
    [primaryColumnCount, resolvedRows, sceneBoundsRows, hasTextBracket]
  );

  return (
    <CanvasThemeProvider theme={theme}>
      <Suspense fallback={null}>
        {/* @ts-expect-error postprocessing prop exists at runtime but is missing from installed types */}
        <EffectComposer disableNormalPass>
          <Bloom mipmapBlur luminanceThreshold={1} levels={3} intensity={0.1} />
        </EffectComposer>

        {/* Adaptive DPR keeps clarity while limiting pixel cost */}
        <AdaptivePixelRatio maxDpr={1.5} />

        {/* Orbit controls drive camera updates and HUD reporting */}
        <Controls
          primaryColumnCount={primaryColumnCount}
          enableMouseTracking={!isPlayingIntroAnimation}
          isPointerInside={isPointerInside}
          playIntroAnimation={isPlayingIntroAnimation}
          onIntroAnimationComplete={onIntroAnimationComplete}
          onChange={onViewChange}
          sceneBounds={sceneBounds}
        />

        <AlignedGroup
          onReady={onInitialSceneReady}
          pivotX={primaryCenterX}
          tiltDeg={DIAGRAM_ROTATION_DEG}>
          <MultiRowStack
            rows={resolvedRows}
            textBracket={textBracket}
            focusedId={focusedIdForRender}
            focusedGroupLayer={focusedGroupLayerForRender as any}
            primaryColumnCount={primaryColumnCount}
            skeletonLoader={skeletonLoader}
            skipPrimaryEnterAnimation={skipPrimaryEnterAnimation}
            onBlockClick={onBlockClick}
          />
          {enablePrimaryLayerCarousel && (
            <PrimaryLayerCarouselSceneControls
              resolvedRows={resolvedRows}
              primaryColumnCount={primaryColumnCount}
              pageCount={primaryLayerPageCount}
              activePageIndex={activePrimaryLayerPage}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
              onGoToPage={goToPage}
              keyboardFocus={carouselKeyboardFocus as any}
            />
          )}
        </AlignedGroup>
      </Suspense>
    </CanvasThemeProvider>
  );
}

export default Scene;
