/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Main components
export { DatePicker } from './components/DatePicker';
export { DatePickerInput } from './components/DatePickerInput';
export { Calendar } from './components/Calendar';
export { DatePickerSkeleton } from './components/DatePickerSkeleton';

// Hooks
export { useDatePicker } from './hooks/useDatePicker';

// Types
export type { DatePickerProps } from './components/DatePicker';
export type { DatePickerInputProps } from './components/DatePickerInput';
export type { CalendarProps } from './components/Calendar';
export type { DatePickerSkeletonProps } from './components/DatePickerSkeleton';
export type { UseDatePickerConfig, UseDatePickerReturn } from './hooks/useDatePicker';

// Re-export state machine types for convenience
export type {
  DatePickerContext,
  DatePickerMode,
  InputType,
  DateSelectPayload,
  InputFocusPayload,
  KeyboardPayload,
  ValueChangePayload,
  ValidationErrorPayload,
  StateTransition,
} from '@carbon-labs/primitives/date-picker';

export { DatePickerState, DatePickerEvent } from '@carbon-labs/primitives/date-picker';

// Made with Bob
