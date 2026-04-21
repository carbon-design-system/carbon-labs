/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable jsdoc/require-jsdoc, jsdoc/require-param, jsdoc/require-param-type, jsdoc/require-param-description */

import type { BlockColorTheme, ColorToken } from './color-tokens';

export type BlockSize = 'sm' | 'md' | 'lg';
export type CanvasBlockSize = BlockSize | 'framed';
export type FoundationRackVariant = 'empty' | 'closed' | 'open';
export type FoundationRackStatus = 'green' | 'yellow' | 'red';

export const BLOCK_SIZES = Object.freeze({
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  framed: 'framed',
} as const);

export const FOUNDATION_RACK_STATES = Object.freeze({
  empty: 'empty',
  closed: 'closed',
  open: 'open',
} as const);

export const FOUNDATION_RACK_STATUS = Object.freeze({
  green: 'green',
  yellow: 'yellow',
  red: 'red',
} as const);

export interface CanvasBlock extends Partial<BlockColorTheme> {
  id?: string;
  text?: string;
  hoverText?: string;
  size: CanvasBlockSize;
  isLoadingScaffold?: boolean;
  fullWidth?: boolean;
  variant?: FoundationRackVariant;
  status?: FoundationRackStatus;
  drawerCount?: number;
  drawerSlideDistance?: number;
}

export type CanvasColumn = CanvasBlock[];
export type CanvasRow = CanvasColumn[];
export type CanvasRows = CanvasRow[];

export interface PrimaryLayerBlock {
  id: string;
  label: string;
  hoverLabel?: string;
  columnIndex?: number;
  color?: ColorToken;
  textColor?: string;
  size?: BlockSize;
  isLoadingScaffold?: boolean;
}

export interface CoreLayerConfig {
  id: string;
  label: string;
  hoverLabel?: string;
  color?: string;
  textColor?: string;
  size: BlockSize;
}

export interface FoundationRackConfig {
  id: string;
  slots: 0 | 1 | 2 | 3 | 4;
  variant?: FoundationRackVariant;
  status?: FoundationRackStatus;
}

export interface FoundationConfig {
  id: string;
  label: string;
  racks: FoundationRackConfig[];
}

export interface TextBracketConfig {
  title?: string;
  sections?: string[];
}

export interface VisualizationData {
  primaryLayer: PrimaryLayerBlock[];
  coreLayer: CoreLayerConfig[];
  foundationConfig: FoundationConfig;
  textBracket?: TextBracketConfig;
}

export const FOUNDATION_RACK_VARIANTS: FoundationRackVariant[] = [
  FOUNDATION_RACK_STATES.empty,
  FOUNDATION_RACK_STATES.closed,
  FOUNDATION_RACK_STATES.open,
];

export const DEFAULT_FOUNDATION_RACK = Object.freeze({
  size: BLOCK_SIZES.framed,
  status: FOUNDATION_RACK_STATUS.green,
  drawerCount: 4,
  drawerSlideDistance: 3,
} as const);

/**
 *
 * @param size
 * @param text
 * @param theme
 */
export function createPrimaryBlock(
  size: BlockSize,
  text = 'Account',
  theme: Partial<BlockColorTheme> = {},
): CanvasBlock {
  return {
    text,
    size,
    ...theme,
  };
}

/**
 *
 * @param overrides
 */
export function createCoreBlock(
  overrides: Partial<
    CoreLayerConfig & {
      text: string;
      hoverText: string;
    } & BlockColorTheme & { fullWidth: boolean }
  > = {},
): CanvasBlock {
  return {
    id: 'sovereign-core',
    text: 'Sovereign Core',
    size: BLOCK_SIZES.lg,
    fullWidth: true,
    color:
      'linear-gradient(90deg, rgb(216, 227, 246) 0%, rgb(244, 244, 244) 100%)',
    leftColor: 'rgba(224, 224, 224, 1)',
    topColor: '#c6c6c6',
    textColor: '#000000',
    ...overrides,
  };
}

/**
 *
 * @param variant
 * @param overrides
 */
export function createFoundationRackBlock(
  variant: FoundationRackVariant = FOUNDATION_RACK_STATES.closed,
  overrides: Partial<CanvasBlock> = {},
): CanvasBlock {
  return {
    ...DEFAULT_FOUNDATION_RACK,
    variant,
    ...overrides,
  };
}
