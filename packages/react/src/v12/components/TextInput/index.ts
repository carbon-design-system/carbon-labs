/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The kit's text field — TextInput and PasswordInput — and the pieces
 * every kit field shares (validation builds on them):
 * `FieldMessage` (the one message line), `FieldStatusMark`, and
 * `field-status` (v11's normalization, the late-arrival timing, the ARIA).
 */
import {
  TextInput as TextInputBase,
  type TextInputProps,
} from './components/TextInput';
import { PasswordInput } from './components/PasswordInput';

/** v10's `TextInput.PasswordInput`, kept as a static (v11 exports PasswordInput on its own; so does this). */
export const TextInput = Object.assign(TextInputBase, { PasswordInput });
export type { TextInputProps };
export type {
  TextInputSize,
  TextInputSkeletonProps,
} from './components/TextInput';
export { TextInputSkeleton } from './components/TextInput';
export { PasswordInput };
export { MultiFieldInput } from './components/MultiFieldInput';
export type {
  MultiFieldInputProps,
  MultiFieldSegment,
} from './components/MultiFieldInput';
export type { PasswordInputProps } from './components/PasswordInput';
export type {
  FieldAiState,
  FieldAiText,
  FieldAiProps,
} from './components/aiFill';
export { FieldMessage } from './components/FieldMessage';
export type { FieldMessageProps } from './components/FieldMessage';
export { FieldStatusMark } from './components/FieldStatusMark';
export type { FieldStatusMarkProps } from './components/FieldStatusMark';
export {
  normalizeFieldProps,
  useLateStatus,
  fieldAria,
  counterAnnouncement,
  hasText,
  FIELD_TIMING,
} from '@carbon-labs/v12-motion';
export type {
  FieldStatus,
  NormalizedFieldProps,
  LateStatusOptions,
} from '@carbon-labs/v12-motion';

// The names other v12 packages take from this package's files.
export { FieldCore } from './components/TextInput';
export { filledish, useAiFill } from './components/aiFill';
