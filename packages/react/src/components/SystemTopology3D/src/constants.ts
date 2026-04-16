/// <reference path="./global.d.ts" />
import type { CanvasBlockSize } from './types';

export const ANIM_DURATION = 0.2;
export const ENTER_ANIM_DURATION = 0.44;
export const ENTER_STAGGER = 0.04;
// Package SCSS enters from translateY(-6rem); scene units map 1:1 with rem-based design sizing.
export const ENTER_OFFSET = 6;

// Package-canvas-inspired entrance timing (translated to R3F springs).
// Sequence: foundation -> core -> primary, with layer-specific stagger.
// Foundation racks animate with 160ms stagger per rack
// CoreBase is calculated dynamically based on number of racks (starts when 50% complete)
export const LOAD_TIMINGS_MS = {
  foundationBase: 200,
  foundationRowStep: 120,
  foundationItemStep: 80,
  foundationRackStagger: 160, // Stagger between each rack
  coreBase: 400, // Base value, adjusted dynamically per row based on rack count
  coreRowStep: 140,
  primaryBase: 850, // Adjusted to start after typical core timing
  primaryRowGroupStep: 200,
  primaryColumnStep: 160,
  primaryItemStep: 80,
} as const;

export const LABEL_PADDING = 0.2;
export const LABEL_FONT_SIZE = 0.95;
// Font URL for 3D text rendering
export const LABEL_FONT_URL = '/fonts/IBMPlexSans-SemiBold.woff';

// Base dimensions (used as defaults and for responsive scaling)
export const BASE_COLUMN_WIDTH = 8;
export const BASE_COLUMN_GAP = 0.5;
export const BASE_BLOCK_DEPTH = 12;
export const BASE_BLOCK_GAP = 0.2;
export const BASE_ROW_GAP = 0.3;

export const BASE_BLOCK_HEIGHTS = {
  sm: 1.5,
  md: 3,
  lg: 4.5,
  framed: 5.125,
} as const;

// Default exports for backward compatibility
export const COLUMN_WIDTH = BASE_COLUMN_WIDTH;
export const COLUMN_GAP = BASE_COLUMN_GAP;
export const COLUMN_SPACING = COLUMN_WIDTH + COLUMN_GAP;
export const BLOCK_DEPTH = BASE_BLOCK_DEPTH;
export const BLOCK_GAP = BASE_BLOCK_GAP;
export const ROW_GAP = BASE_ROW_GAP;

export const BLOCK_HEIGHTS = BASE_BLOCK_HEIGHTS;

export const BLOCK_DIMENSIONS = {
  sm: { width: COLUMN_WIDTH, height: BLOCK_HEIGHTS.sm, depth: BLOCK_DEPTH },
  md: { width: COLUMN_WIDTH, height: BLOCK_HEIGHTS.md, depth: BLOCK_DEPTH },
  lg: { width: COLUMN_WIDTH, height: BLOCK_HEIGHTS.lg, depth: BLOCK_DEPTH },
} as const;

export function getPrimaryCenterX(columnCount: number): number {
  const safeColumnCount = Math.max(1, Number(columnCount) || 1);
  return ((safeColumnCount - 1) * COLUMN_SPACING) / 2;
}

// Helper function to create responsive dimensions object
export function createResponsiveDimensions(scaleFactor = 1.0) {
  const COLUMN_WIDTH = BASE_COLUMN_WIDTH * scaleFactor;
  const COLUMN_GAP = BASE_COLUMN_GAP * scaleFactor;
  const BLOCK_DEPTH = BASE_BLOCK_DEPTH * scaleFactor;
  const BLOCK_GAP = BASE_BLOCK_GAP * scaleFactor;
  const ROW_GAP = BASE_ROW_GAP * scaleFactor;

  const BLOCK_HEIGHTS: Record<CanvasBlockSize, number> = {
    sm: BASE_BLOCK_HEIGHTS.sm * scaleFactor,
    md: BASE_BLOCK_HEIGHTS.md * scaleFactor,
    lg: BASE_BLOCK_HEIGHTS.lg * scaleFactor,
    framed: BASE_BLOCK_HEIGHTS.framed * scaleFactor,
  };

  const COLUMN_SPACING = COLUMN_WIDTH + COLUMN_GAP;

  const BLOCK_DIMENSIONS = {
    sm: { width: COLUMN_WIDTH, height: BLOCK_HEIGHTS.sm, depth: BLOCK_DEPTH },
    md: { width: COLUMN_WIDTH, height: BLOCK_HEIGHTS.md, depth: BLOCK_DEPTH },
    lg: { width: COLUMN_WIDTH, height: BLOCK_HEIGHTS.lg, depth: BLOCK_DEPTH },
  };

  return {
    COLUMN_WIDTH,
    COLUMN_GAP,
    COLUMN_SPACING,
    BLOCK_DEPTH,
    BLOCK_GAP,
    ROW_GAP,
    BLOCK_HEIGHTS,
    BLOCK_DIMENSIONS,
  };
}
