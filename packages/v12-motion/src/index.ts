/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The one place v12 components get motion from. Components import this
// package, never `@carbon-labs/motion-*`, `@carbon/motion` or
// `@carbon/styles/scss/motion` directly. Each line names its source.
//
// The list grows with each import: the full set is the union of the motion
// the carried components reach.

// Tokens
export { motionTokens, DURATION_FLOOR_MS } from '@carbon-labs/motion-core';
export type {
  DurationToken,
  EasingToken,
  CubicBezier,
} from '@carbon-labs/motion-core';

// Reduced motion
export {
  usePrefersReducedMotion,
  reducedClock,
} from '@carbon-labs/motion-react';

// Primitives
export {
  attachRollover,
  playContentSwap,
  staggerSteps,
  staggerMsForSize,
  durationStepForDistance,
} from '@carbon-labs/motion-core';

// What the chat components need
export {
  CONTENT_SWAP,
  SKELETON_WAVE,
  LOADING_MOTION,
  animateLayout,
  stepDown,
  toEasing,
} from '@carbon-labs/motion-core';

// The motion layer
export { FeedbackMotion } from '@carbon-labs/motion-react/motion';
export * as placement from '@carbon-labs/motion-react/motion/placement';
export * as shadow from '@carbon-labs/motion-react/motion/shadow';
export * as selection from '@carbon-labs/motion-react/motion/selection';

// What the workbench needs (tools/v12-workbench): the provider that forces a
// motion level, the draft layer its clock scales the durations with, and the
// token registry its Motion panel reads.
export { MotionProvider } from '@carbon-labs/motion-react';
export type { MotionLevel } from '@carbon-labs/motion-react';
export { tokens, applyDraft, getDraft } from '@carbon-labs/motion-core';
export type { Draft } from '@carbon-labs/motion-core';

// What the imported kit components need, one block per carbon-motion module
// (each public in its package's status.json). Flat names: the import tool
// maps every motion import to this package's root.

// core primitives/axial
export { axialPlan, withAxial } from '@carbon-labs/motion-core';

// core primitives/stack
export { attachStack, STACK_MOTION } from '@carbon-labs/motion-core';
export type {
  Stack,
  StackOptions,
  StackSource,
  StackSwap,
  StackSwipe,
} from '@carbon-labs/motion-core';

// core primitives/bento-reflow
export { createReflow, playSoftEdge } from '@carbon-labs/motion-core';
export type { ReflowEntry, ReflowPiece } from '@carbon-labs/motion-core';

// core primitives/cast-shadow
export {
  attachCastShadow,
  centerCastShadow,
  contrastRatio,
  deriveCastShadowColor,
  registerCastShadow,
} from '@carbon-labs/motion-core';
export type { CastElevation } from '@carbon-labs/motion-core';

// core primitives/cast-shadow-floating
export { attachFloatingCastShadow } from '@carbon-labs/motion-core';
export type { FloatingCastShadow } from '@carbon-labs/motion-core';

// core primitives/content-swap
export { contentSwapClocks } from '@carbon-labs/motion-core';
export type { ContentSwap } from '@carbon-labs/motion-core';

// core primitives/cue
export { playCue } from '@carbon-labs/motion-core';
export type { CueSeverity } from '@carbon-labs/motion-core';

// core primitives/loading
export {
  SKELETON_WAVE_ATTR,
  attachSkeletonFallback,
  attachSkeletonWaveRoot,
  createArrivalGroup,
  playSkeletonHandoff,
  screenfulCount,
} from '@carbon-labs/motion-core';
export type {
  ArrivalGroup,
  ScreenfulOptions,
  SkeletonHandoff,
} from '@carbon-labs/motion-core';

// core primitives/pane-move
export { paneMove, playPaneContent } from '@carbon-labs/motion-core';

// core primitives/pointer-geometry
export { clamp01 } from '@carbon-labs/motion-core';

// core primitives/pointer-origin
export { originCause } from '@carbon-labs/motion-core';

// core primitives/reduced-motion
export { REDUCED_MOTION } from '@carbon-labs/motion-core';

// core primitives/reflow-timing
export {
  CONTENT_SLIDE_PX,
  RELAYOUT,
  reflowFadeTiming,
  reflowTiming,
} from '@carbon-labs/motion-core';
export type { ReflowTiming } from '@carbon-labs/motion-core';

// core primitives/rollover
export {
  BACKDROP,
  LIGHTNESS_STEPS,
  deriveLightnessColors,
  lightnessColors,
  lightnessStep,
  parseColor,
} from '@carbon-labs/motion-core';
export type { LightnessSteps, RGBA } from '@carbon-labs/motion-core';

// core primitives/scroller
export { attachScroller } from '@carbon-labs/motion-core';
export type {
  Scroller,
  ScrollerOptions,
  ScrollerTrackInfo,
} from '@carbon-labs/motion-core';

// core primitives/selection
export {
  SELECTION_ARRIVAL,
  SELECTION_LANDED_PX,
  arrivalRect,
  attachSelection,
  bezierEase,
  selectionDuration,
} from '@carbon-labs/motion-core';
export type {
  Selection,
  SelectionMoveInfo,
  SelectionRect,
} from '@carbon-labs/motion-core';

// core primitives/skeleton
export type {
  SkeletonContrast,
  SkeletonWaveOptions,
} from '@carbon-labs/motion-core';

// core primitives/snap
export {
  SNAP,
  SNAP_EXIT_FADE_ATTR,
  SNAP_FADE_SHORT,
  SNAP_FRAME,
  SNAP_PIN,
  SNAP_PROPOSED_EASE,
  SNAP_SLIVER_PX,
  snapAnimations,
  snapAxisClock,
  snapClocks,
  snapCollapseAxis,
  snapDurationMs,
  snapEaseAt,
  snapEaseBezier,
  snapEaseCss,
  snapFadeFor,
  snapFades,
  snapIn,
  snapProfileOn,
  snapSliverTimes,
  snapSliverWindow,
} from '@carbon-labs/motion-core';
export type {
  SnapEase,
  SnapLive,
  SnapOrigin,
  SnapProfile,
} from '@carbon-labs/motion-core';

// core primitives/snap-tuning
export {
  SNAP_COMPONENTS,
  snapFloating,
  snapProfileFor,
} from '@carbon-labs/motion-core';

// core primitives/stagger
export { STAGGER, easedStaggerAt } from '@carbon-labs/motion-core';

// core primitives/stillness
export { createStillness } from '@carbon-labs/motion-core';
export type { StillnessMember } from '@carbon-labs/motion-core';

// core primitives/tonal
export { watchTonal } from '@carbon-labs/motion-core';

// core primitives/transaction
export {
  afterLayout,
  beginLayout,
  followLayout,
  holdLayout,
  inLayout,
  onLayout,
} from '@carbon-labs/motion-core';
export type { LayoutTransaction } from '@carbon-labs/motion-core';

// core registry
export {
  cubicBezier,
  easingCss,
  evaluateCurve,
} from '@carbon-labs/motion-core';

// core tokens/tokens
export {
  DEPTH,
  contentAfterMs,
  distanceTokens,
  reduceTokens,
  softEdgeToken,
} from '@carbon-labs/motion-core';

// react primitives/snap-surface
export { useSnapSurface } from '@carbon-labs/motion-react';
export type { SnapSurface } from '@carbon-labs/motion-react';

// react primitives/useLayoutTransaction
export { useLayoutTransaction } from '@carbon-labs/motion-react';

// react primitives/useStagger
export { useStagger } from '@carbon-labs/motion-react';

// react motion/FeedbackMotion
export { useFeedbackMotion } from '@carbon-labs/motion-react/motion/FeedbackMotion';

// react motion/dotField
export {
  DOT_BEHAVIORS,
  DOT_PHYSICS,
  createDotField,
} from '@carbon-labs/motion-react/motion/dotField';
export type {
  DotBehaviors,
  DotField,
  DotFieldOptions,
  DotPhysics,
} from '@carbon-labs/motion-react/motion/dotField';

// react motion/fieldStatus
export {
  FIELD_TIMING,
  counterAnnouncement,
  fieldAria,
  hasText,
  normalizeFieldProps,
  useLateStatus,
} from '@carbon-labs/motion-react/motion/fieldStatus';
export type {
  FieldStatus,
  LateStatusOptions,
  NormalizedFieldProps,
} from '@carbon-labs/motion-react/motion/fieldStatus';

// react motion/menuTrigger
export { useMenuTrigger } from '@carbon-labs/motion-react/motion/menuTrigger';

// react motion/placement
export {
  EDGE,
  GAP,
  anchorInset,
  placeAtPoint,
  placeBesideRow,
  placeOnAnchor,
  range,
  themeOf,
} from '@carbon-labs/motion-react/motion/placement';
export type {
  Placement,
  Range,
  SurfaceAlignment,
} from '@carbon-labs/motion-react/motion/placement';

// react motion/selection/hooks
export {
  recentArrowDirection,
  setSelectionFont,
  useLatest,
  useSelectionEngine,
} from '@carbon-labs/motion-react/motion/selection';

// react motion/selection/lengthMotion
export {
  pitchAt,
  reachForLength,
  stretchForLength,
} from '@carbon-labs/motion-react/motion/selection';

// react motion/selection/style
export { resolveSelectionStyle } from '@carbon-labs/motion-react/motion/selection';
export type {
  ResolvedSelectionStyle,
  SelectionMotion,
  SelectionStyleProps,
} from '@carbon-labs/motion-react/motion/selection';

// react motion/selection/twins
export { registerTwin } from '@carbon-labs/motion-react/motion/selection';

// react motion/shadow
export type { SurfaceShadowOption } from '@carbon-labs/motion-react/motion/shadow';

// react motion/sideNavLeads
export { createLeads } from '@carbon-labs/motion-react/motion/sideNavLeads';
export type { Leads } from '@carbon-labs/motion-react/motion/sideNavLeads';

// react motion/toggleGesture
export { useStepGesture } from '@carbon-labs/motion-react/motion/toggleGesture';

// react motion/useTooltipTrigger
export {
  TooltipGroupContext,
  TooltipMotion,
  TooltipMotionContext,
  chain,
  mergeRefs,
  useTooltipReduced,
  useTooltipSurface,
  useTooltipTrigger,
} from '@carbon-labs/motion-react/motion/useTooltipTrigger';
export type {
  TooltipGroupValue,
  TooltipMotionValue,
  TooltipTriggerOptions,
  TooltipTriggerProps,
} from '@carbon-labs/motion-react/motion/useTooltipTrigger';
