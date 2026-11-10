/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The side panel — Carbon for IBM Products' SidePanel.
 */
export {
  SidePanel,
  fadeSidePanelOverlay,
  SIDE_PANEL_FRAMES,
  SIDE_PANEL_MOTION,
  sidePanelFloatingProfile,
  sidePanelProfile,
  sidePanelDefaultExit,
  sidePanelSnapProfile,
} from './components/SidePanel';
export { snapEntranceContentMs } from './components/snap-content';
export type {
  SidePanelAction,
  SidePanelExit,
  SidePanelFrame,
  SidePanelPlacement,
  SidePanelScope,
  SidePanelProps,
  SidePanelSize,
  SidePanelToolbarButton,
} from './components/SidePanel';
