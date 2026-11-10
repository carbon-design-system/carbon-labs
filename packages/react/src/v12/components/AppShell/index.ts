/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export { AppShell } from './components/AppShell';
export type {
  AppShellProps,
  AppShellNavRenderProps,
} from './components/AppShell';
export { NavOverlay } from './components/NavOverlay';
export type { NavOverlayProps } from './components/NavOverlay';
export { Header } from './components/Header';
export {
  HEADER_FRAMES,
  HEADER_FRAME_AT,
  HEADER_THEME,
} from './components/Header';
export type {
  HeaderProps,
  HeaderTheme,
  HeaderFrame,
} from './components/Header';
export {
  Region,
  REGION_PADDING,
  REGION_CORNERS,
  REGION_RADIUS,
  REGION_FRAME,
  REGION_OUTLINE,
} from './components/Region';
export type {
  RegionProps,
  RegionSurface,
  RegionCorners,
  RegionPadding,
  RegionScroll,
  RegionTheme,
} from './components/Region';
export {
  useAppShell,
  APP_HEADER_HEIGHT,
  APP_SHELL_LAYOUT,
} from './components/context';
export type {
  AppShellState,
  AppShellNavMode,
  AppShellPanelMode,
  AppShellScope,
  AppShellFrame,
  AppShellHeaderPlacement,
  AppShellFoldPlacement,
  AppShellLayout,
  AppShellOpenNavOptions,
} from './components/context';
export {
  useSizeClass,
  sizeClassOf,
  SIZE_CLASS_EDGES,
  SIZE_CLASSES,
} from './components/useSizeClass';
export type { SizeClass } from './components/useSizeClass';

// The names other v12 packages take from this package's files.
export {
  AppShellFoldToggleContext,
  AppShellWorkspaceContext,
} from './components/context';
