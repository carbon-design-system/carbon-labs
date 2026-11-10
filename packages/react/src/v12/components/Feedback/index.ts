/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*
 * The feedback family's shared pieces: the status mark (one mark per
 * status, its icon a motion-icon), the count pill, the kit's one spinner,
 * the stack host (the bridge from React to carbon-motion's `attachStack`).
 * Notifications and loaders build on them; skeletons are in `./skeleton`.
 */

export {
  KIND_ICON,
  NEUTRAL_ICON,
  StatusMark,
  severityOf,
} from './components/StatusMark';
export {
  STATUS_HANDOFF,
  handoffSteps,
  playHandoffIn,
  playHandoffOut,
} from './components/statusHandoff';
export type { HandoffIn, HandoffMotion } from './components/statusHandoff';
export type {
  ActionIcon,
  FeedbackKind,
  NeutralStatusKind,
  StatusMarkKind,
  StatusMarkProps,
} from './components/StatusMark';
export { CountPill } from './components/CountPill';
export { SwapSlot } from './components/SwapSlot';
export type { SwapSlotProps } from './components/SwapSlot';
export type { CountPillProps } from './components/CountPill';
export {
  FEEDBACK_SNAP,
  StackHost,
  stackOf,
  useStackItem,
} from './components/StackHost';
export type {
  StackHostProps,
  StackItem,
  StackItemOptions,
} from './components/StackHost';
export {
  LOADER_BOX,
  LOADER_EDGE,
  loaderDrawing,
  loaderGap,
  loaderStroke,
  playSpinnerEnter,
  resetSpinnerMotion,
  resolveSpinnerMotion,
  setSpinnerMotion,
  Spinner,
  SPINNER_MOTION,
  SPINNER_SHIPPED,
  SPINNER_SIZES,
  SPINNER_TUNING_KEYS,
  spinnerEnterStep,
  spinnerTuning,
  subscribeSpinnerMotion,
  useSpinnerMotion,
} from './components/Spinner';
export type {
  LoaderDrawing,
  SpinnerGapStyle,
  SpinnerProps,
  SpinnerSize,
  SpinnerMotion,
  SpinnerVariant,
} from './components/Spinner';

// The names other v12 packages take from this package's files.
export { AITextAtRest } from './components/skeleton/AITextReveal';
export {
  AITextReveal,
  SkeletonLines,
  SkeletonOf,
  SkeletonPlaceholder,
  SkeletonReveal,
  SkeletonRun,
  SkeletonText,
  structureSlot,
  structureTiming,
  useSkeletonBlocks,
  useSkeletonReveal,
  useStructureReveal,
} from './components/skeleton/index';
export type { CountClock } from './components/CountPill';
export type { RevealPhase } from './components/skeleton/SkeletonReveal';
export { SkeletonBar } from './components/skeleton/Skeleton';
export type { StructureEntry } from './components/skeleton/StructureReveal';
export {
  loaderRevealStep,
  playSpinnerExit,
  spinnerMs,
} from './components/Spinner';
export { usePreviousCommit } from './components/usePreviousCommit';
