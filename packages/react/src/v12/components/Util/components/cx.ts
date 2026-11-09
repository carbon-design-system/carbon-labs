/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** Class names joined, the falsy ones left out. */
export const cx = (...c: (string | false | null | undefined)[]): string =>
  c.filter(Boolean).join(' ');
