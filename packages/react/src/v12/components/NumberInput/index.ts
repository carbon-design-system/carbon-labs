/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** NumberInput on the kit's text field, its value rolling with the kit's RollText as it steps. */
export { NumberInput } from './components/NumberInput';
export type {
  NumberInputProps,
  NumberInputSize,
  NumberInputState,
  NumberInputTranslationKey,
} from './components/NumberInput';
/** v11's separator check, for `validate` (it is v11's own function). */
export { validateNumberSeparators } from '@carbon/react';
export { NumberInputSkeleton } from './components/NumberInputSkeleton';
export type { NumberInputSkeletonProps } from './components/NumberInputSkeleton';
