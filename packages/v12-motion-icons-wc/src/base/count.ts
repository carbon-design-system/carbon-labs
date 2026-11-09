/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A count's cap (`max`), for the status elements and the server output: its own module, so icons without a count
 * don't carry it.
 */
import { DEV, warnOnce } from '@carbon-labs/motion-icons-core/dev';

/**
 * A count's cap: 9 or 99 (what the pill draws). Anything else is clamped: 9 and below cap at 9, above at 99, with a
 * warning once per value in development builds (the clamp holds in production). Absent: undefined (the default for
 * the size).
 */
export function countMax(v: unknown): 9 | 99 | undefined {
  if (v === undefined || v === null || v === '') {
    return undefined;
  }
  const n = Number(v);
  if (n === 9 || n === 99) {
    return n;
  }
  if (Number.isNaN(n)) {
    return undefined;
  }
  const to = n <= 9 ? 9 : 99;
  if (DEV) {
    warnOnce(
      `max|${String(v)}`,
      `[motion-icons] max="${String(v)}": a count caps at 9 or 99; using ${to}.`
    );
  }
  return to;
}
