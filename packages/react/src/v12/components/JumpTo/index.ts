/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {
  JumpTo,
  JUMP_TO_PRESETS,
  JumpToPresets,
  JumpToSizes,
} from './components/JumpTo';
export type {
  JumpToPreset,
  JumpToProps,
  JumpToSize,
} from './components/JumpTo';
export { useJumpTo } from './components/useJumpTo';
export type {
  JumpContainer,
  JumpTarget,
  JumpToState,
  UseJumpToOptions,
} from './components/useJumpTo';
export type { JumpBlock, JumpDirection } from './components/engine';

// The names other v12 packages take from this package's files.
export {
  attachJumpTo,
  clearJumpGlide,
  JUMP_GLIDE_ATTR,
  jumpRemaining,
  markJumpGlide,
} from './components/engine';
export type { JumpEngine } from './components/engine';
