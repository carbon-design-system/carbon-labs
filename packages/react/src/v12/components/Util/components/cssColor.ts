/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { parseColor } from '@carbon-labs/v12-motion';

type RGBA = NonNullable<ReturnType<typeof parseColor>>;

/** A colour as CSS writes it, to RGBA: what `parseColor` reads, and hex (a custom property keeps it as written). */
export function parseCssColor(s: string): RGBA | null {
  const t = s.trim();
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(t)?.[1];
  if (!hex) {
    return parseColor(t);
  }
  const full = hex.length <= 4 ? [...hex].map((c) => c + c).join('') : hex;
  const n = (i: number) => parseInt(full.slice(i, i + 2), 16);
  return [n(0), n(2), n(4), full.length === 8 ? n(6) / 255 : 1];
}
