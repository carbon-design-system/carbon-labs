/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createContext, useContext } from 'react';

/* ============================================================================
 * The form state a FormSection hands to every field in it: disabled and
 * read-only.
 *
 *   fields    each kit field reads it with `useFormFieldState`, so a field's
 *             own prop or its section's makes it disabled or read-only
 *   nesting   an inner section adds to an outer one, never clears it
 * ========================================================================== */

export interface FormFieldState {
  disabled: boolean;
  readOnly: boolean;
}

export const FormStateContext = createContext<FormFieldState>({
  disabled: false,
  readOnly: false,
});

/** A field's disabled and read-only: its own, or its section's. */
export function useFormFieldState(
  disabled = false,
  readOnly = false
): FormFieldState {
  const form = useContext(FormStateContext);
  return {
    disabled: disabled || form.disabled,
    readOnly: readOnly || form.readOnly,
  };
}
