/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useMemo, useState } from 'react';

/* ============================================================================
 * useDirtyForm: a form's values against the last saved ones, for the
 * unsaved-changes bar.
 *
 *   changed   the fields whose value differs from the saved one
 *   discard   back to the saved values
 *   commit    the current values become the saved ones
 * ========================================================================== */

export interface DirtyForm<T extends Record<string, unknown>> {
  values: T;
  saved: T;
  /** Sets one field. */
  set: <K extends keyof T>(key: K, value: T[K]) => void;
  /** The fields that differ from the saved values. */
  changed: (keyof T)[];
  dirty: boolean;
  discard: () => void;
  /** The current values (or `next`) become the saved ones. */
  commit: (next?: T) => void;
}

/** One level by value: Dates by time, arrays and plain objects entry by entry. */
const leaf = (a: unknown, b: unknown) =>
  a instanceof Date && b instanceof Date
    ? a.getTime() === b.getTime()
    : Object.is(a, b);
const plain = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
const same = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => leaf(v, b[i]));
  }
  if (plain(a) && plain(b)) {
    const ka = Object.keys(a);
    return (
      ka.length === Object.keys(b).length &&
      ka.every((k) => k in b && leaf(a[k], b[k]))
    );
  }
  return leaf(a, b);
};

export { same as sameFormValue };

export function useDirtyForm<T extends Record<string, unknown>>(
  initial: T
): DirtyForm<T> {
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const set = useCallback(
    <K extends keyof T>(key: K, value: T[K]) =>
      setValues((v) => ({ ...v, [key]: value })),
    []
  );
  const changed = useMemo(
    () =>
      (Object.keys(values) as (keyof T)[]).filter(
        (k) => !same(values[k], saved[k])
      ),
    [values, saved]
  );
  const discard = useCallback(() => setValues(saved), [saved]);
  const commit = useCallback(
    (next?: T) => {
      const to = next ?? values;
      setSaved(to);
      setValues(to);
    },
    [values]
  );
  return {
    values,
    saved,
    set,
    changed,
    dirty: changed.length > 0,
    discard,
    commit,
  };
}
