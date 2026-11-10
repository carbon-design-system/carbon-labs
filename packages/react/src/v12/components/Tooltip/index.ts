/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The tooltip family — Tooltip, IconButton, DefinitionTooltip and
 * TooltipGroup, on the selection kit's `createTooltip`.
 */
export { Tooltip } from './components/Tooltip';
export type { TooltipProps } from './components/Tooltip';
export { IconButton } from './components/IconButton';
export type {
  IconButtonProps,
  IconButtonKind,
  IconButtonSize,
} from './components/IconButton';
export { DefinitionTooltip } from './components/DefinitionTooltip';
export type { DefinitionTooltipProps } from './components/DefinitionTooltip';
// useTooltipTrigger: the kit's, whose `open` is right inside a TooltipGroup (TooltipGroup.tsx).
export { TooltipGroup, useTooltipTrigger } from './components/TooltipGroup';
export { TooltipHoldContext, createTooltipHold } from './components/hold';
export type { TooltipHold, TooltipHoldControl } from './components/hold';
export { useStillTrigger } from './components/still';
export { useDisabledReason } from './components/DisabledReason';
export type {
  DisabledReasonOptions,
  DisabledReasonState,
} from './components/DisabledReason';
export type { TooltipGroupProps } from './components/TooltipGroup';
export {
  TooltipMotion,
  useTooltipReduced,
  mergeRefs,
} from '@carbon-labs/v12-motion';
export type {
  TooltipTriggerOptions,
  TooltipTriggerProps,
  TooltipMotionValue,
} from '@carbon-labs/v12-motion';
export type { TooltipAlign } from '@carbon-labs/react-selection-kit';
export {
  TOOLTIP_LEAVE_LABEL_MS,
  TOOLTIP_LEAVE_TEXT_MS,
} from './components/delays';

// The names other v12 packages take from this package's files.
export { joinHandlers } from './components/DisabledReason';
