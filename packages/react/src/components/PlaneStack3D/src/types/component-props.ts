/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ReactNode } from 'react';
import type {
  CanvasRows,
  CoreLayerConfig,
  FoundationConfig,
  PrimaryLayerBlock,
  TextBracketConfig,
} from './visualization-config';
import type { CanvasHoveredItem } from '../interactionContext';
import type { ResponsiveColumnBreakpoints } from '../hooks/useResponsiveDimensions';
import type { Theme } from './color-tokens';

export interface SceneBounds {
  center: [number, number, number];
  size: [number, number, number];
}

/**
 * Props for the top-level Plane Stack 3D.
 * Supply the data for each rendered layer, optional controlled interaction state,
 * layout behavior flags, and accessibility copy overrides.
 */
export interface PlaneStack3DProps {
  /** Primary blocks rendered in the top layer of the visualization. */
  primaryLayer?: PrimaryLayerBlock[];
  /** Core service blocks rendered beneath the primary layer. */
  coreLayer?: CoreLayerConfig[];
  /** Rack and drawer configuration for the foundation layer. */
  foundationConfig?: FoundationConfig;
  /** Optional title and supporting copy rendered beside the scene. */
  textBracket?: TextBracketConfig;

  /** Controlled focused item id used by keyboard navigation and focus styling. */
  focusedId?: string | null;
  /** Called when the focused item changes through canvas interaction or a11y navigation. */
  onFocusedIdChange?: (id: string | null) => void;
  /** Controlled hovered item state shared with the canvas interaction context. */
  hoveredItem?: CanvasHoveredItem | null;
  /** Called when pointer or keyboard hover state changes inside the canvas. */
  onHoveredItemChange?: (item: CanvasHoveredItem | null) => void;

  /** Called when a clickable block in any layer is activated. */
  onBlockClick?: (id?: string) => void;
  /** Called when the camera/view state changes. */
  onViewChange?: (info: unknown) => void;

  /** Intentionally remounts the React Three Fiber canvas when changed. */
  canvasKey?: string | number;
  /** Enables paged carousel behavior for the primary layer when it overflows. */
  enablePrimaryLayerCarousel?: boolean;
  /** Keeps `primaryColumnCount` fixed instead of automatically using the responsive 2/4/6/8 column count. */
  lockColumnCount?: boolean;
  /** Explicit number of primary columns to render when column locking is enabled. Defaults to 8. */
  primaryColumnCount?: number;
  /** Shows loading scaffolds in the primary layer when data has not loaded yet. */
  skeletonLoader?: boolean;
  /** Optional responsive width thresholds for switching between 2, 4, 6, and 8 columns. */
  responsiveColumnBreakpoints?: ResponsiveColumnBreakpoints;
  /** Optional notification when the responsive primary column count changes. */
  onResponsiveColumnCountChange?: (count: number) => void;

  /** Theme mode for the visualization (dark or light). */
  theme?: Theme;

  /** Enables accessibility helpers, focus management, and off-canvas controls. */
  enableA11y?: boolean;
  /** Optional accessibility and UI copy overrides. */
  i18n?: {
    /** Accessible label applied to the canvas region wrapper. */
    canvasRegionLabel?: string;
    /** Instructional text announced to assistive technology users. */
    canvasInstructions?: string;
    /** Label for the primary layer button group in the a11y controls. */
    primaryLayerGroupLabel?: string;
    /** Label for the core layer button group in the a11y controls. */
    coreLayerGroupLabel?: string;
    /** Label for the foundation layer button group in the a11y controls. */
    foundationLayerGroupLabel?: string;
    /** Label for the primary layer carousel controls group. */
    primaryCarouselGroupLabel?: string;
    /** Accessible label for the previous primary carousel page control. */
    primaryCarouselPreviousLabel?: string;
    /** Accessible label for the next primary carousel page control. */
    primaryCarouselNextLabel?: string;
    /** Accessible label or label builder for each primary carousel page button. */
    primaryCarouselPageLabel?:
      | string
      | ((params: {
          index: number;
          position: number;
          total: number;
        }) => string);
    /** Accessible label or label builder for each primary layer item. */
    primaryItemLabel?:
      | string
      | ((params: {
          label: string;
          index: number;
          position: number;
          total: number;
          layer: string;
        }) => string);
    /** Accessible label or label builder for each core layer item. */
    coreItemLabel?:
      | string
      | ((params: {
          label: string;
          index: number;
          position: number;
          total: number;
          layer: string;
        }) => string);
    /** Accessible label or label builder for each foundation layer item. */
    foundationItemLabel?:
      | string
      | ((params: {
          label: string;
          index: number;
          position: number;
          total: number;
          layer: string;
        }) => string);
  };
}

export interface ControlsProps {
  enableMouseTracking?: boolean;
  isPointerInside?: boolean;
  onChange?: (info: unknown) => void;
  onIntroAnimationComplete?: () => void;
  playIntroAnimation?: boolean;
  primaryColumnCount?: number;
  sceneBounds?: SceneBounds | null;
}

export interface AlignedGroupProps {
  children?: ReactNode;
  onBoundsChange?: (bounds: SceneBounds | null) => void;
  onReady?: () => void;
  pivotX?: number;
  tiltDeg?: {
    x?: number;
    y?: number;
    z?: number;
  };
}

export interface SceneProps {
  activePrimaryLayerPage: number;
  carouselKeyboardFocus: unknown;
  enablePrimaryLayerCarousel: boolean;
  focusedGroupLayerForRender: unknown;
  focusedIdForRender: string | null;
  goToPage: (pageIndex: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  isPlayingIntroAnimation: boolean;
  isPointerInside: boolean;
  onBlockClick?: (id?: string) => void;
  onInitialSceneReady: () => void;
  onIntroAnimationComplete: () => void;
  onSceneBoundsChange?: (bounds: SceneBounds | null) => void;
  onViewChange?: (info: unknown) => void;
  primaryCenterX: number;
  primaryColumnCount: number;
  skeletonLoader: boolean;
  skipPrimaryEnterAnimation?: boolean;
  primaryLayerPageCount: number;
  resolvedRows: CanvasRows;
  sceneBoundsRows?: CanvasRows;
  textBracket?: TextBracketConfig;
  theme?: Theme;
}
