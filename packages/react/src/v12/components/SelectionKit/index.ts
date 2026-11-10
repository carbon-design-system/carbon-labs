/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The selection kit — the shared look, motion and behavior of the selection
 * family: the content switcher, the select list, vertical tabs, menus and
 * toolbars. Import the styles once per
 * component: `import '../selection-kit/selection-kit.scss'`. The motion is in
 * `@carbon-labs/motion-react/motion/selection`; it's re-exported here.
 */
import { setSelectionFont } from '@carbon-labs/v12-motion';
import { loadPlexVar } from './components/plexVar';

setSelectionFont(loadPlexVar);

export * from '@carbon-labs/v12-motion/selection';
// The engine re-places on a direction change itself.
export { useSelectionEngine } from '@carbon-labs/v12-motion';
export { useDirection } from './components/direction';
// The kit's own resolver and types, with `hero`: they shadow carbon-motion's.
export { resolveSelectionStyle } from './components/style';
export type {
  ResolvedSelectionStyle,
  SelectionStyleProps,
  SelectionVariant,
} from './components/style';
export {
  ghostSteps,
  GHOST_DARK_STEP,
  GHOST_LIGHT_STEP,
} from './components/ghost';
// What a component stands on (its `frame`), and its default from a Region.
export type { Frame } from '@carbon-labs/react-props';
export { useDefaultFrame } from '@carbon-labs/react-kit-defaults';
export { SelectionFaces, SelectionMarker } from './components/SelectionFaces';
// A memoized row's check that its face would render the same.
export { sameNode, sameProps } from './components/sameNode';
export { SelectionPanels } from './components/SelectionPanels';
export type { SelectionPanelsProps } from './components/SelectionPanels';
export { loadPlexVar, PLEX_VAR } from './components/plexVar';
// The jump: out, then in, where a glide would mislead (the side nav between groups, the tree between levels).
export {
  createSelectionJump,
  useSelectionJump,
  useLandingHold,
  jumpClock,
  JUMP_IN_SHRINK,
  JUMP_OUT_SHARE,
  JUMP_OUT_SHRINK,
} from './components/jump';
export type {
  LandingHold,
  LandingHoldOptions,
  SelectionJump,
  SelectionJumpOptions,
} from './components/jump';
// A selector that is only a line: only the move's two ends restyle (`.sel--ends`; vertical line tabs).
export { useSelectionEnds } from './components/ends';
// The same jump on boxes with no selector (the page header's buttons folding into one menu button).
export { jumpBoxes, jumpBoxesClock } from './components/jump-boxes';
export type { JumpBoxes, JumpBoxesOptions } from './components/jump-boxes';
export {
  useSelectionLoading,
  skeletonRowProps,
  rowStructureProps,
  SELECTION_SKELETON_LEAD,
  SelectionSkeletonFace,
  SelectionSkeletonIcon,
  SelectionSkeletonText,
  SelectionTakenFace,
  SELECTION_SKELETON_LABELS,
} from './components/loading';
export type {
  SelectionLoadingProps,
  SelectionLoadingResize,
  SelectionLoadingState,
  SelectionSkeletonFaceProps,
} from './components/loading';
// The mixed rule: a parent checkbox's state from its children's (the tree, the data table's and MultiSelect's select-all).
export { mixedCheckbox, mixedState, mixedToggleTo } from './components/mixed';
export type { MixedState } from './components/mixed';

// The names other v12 packages take from this package's files.
export { isRtl } from './components/direction';
