/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** Popover — v11's Popover and PopoverContent on the family's floating surface. */
export { Popover, PopoverContent, POPOVER_CONTENT } from './components/Popover';
export type {
  PopoverAlignment,
  PopoverAlignmentDeprecated,
  PopoverBoundary,
  PopoverContentProps,
  PopoverProps,
} from './components/Popover';

// The names other v12 packages take from this package's files.
export {
  useFloatingMount,
  useFloatingPresence,
  useKeptTheme,
} from './components/useFloatingPresence';
export { useMergedRef } from './components/Popover';
