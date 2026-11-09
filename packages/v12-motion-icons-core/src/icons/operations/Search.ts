/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Search16 from '@carbon/icons/es/search/16.js';
import Search32 from '@carbon/icons/es/search/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import { polyPath, ringPath, type Pt } from '../../geometry';
import { magnifierAt } from '../../magnifier';

/**
 * Search: on hover the lens stays in place and grows 1px in diameter, and
 * the handle turns 15° clockwise about the lens centre (staying on the
 * lens, its length unchanged). 160ms entrance ease.
 *
 * Constant line weight: the lens is a ring (Carbon's annulus form) whose
 * radius grows at a fixed weight; the handle is a band of fixed width along
 * its centreline. Carbon's 16px drawing has its own lens weight and a 1px
 * longer handle. Rest matches Carbon within 0.5%.
 */

type Art = { c: number; r: number; weight: number; handle: [number, number] };
const ART_32: Art = {
  c: 12.99,
  r: 10.0089,
  weight: 2.0377,
  handle: [19.74, 28.293],
};
const ART_16: Art = { c: 13, r: 9.9625, weight: 1.95, handle: [19.74, 29.3] };

/** A 2px band from a to b (square ends). */
function band(a: Pt, b: Pt): string {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(dx, dy);
  const [nx, ny] = [-dy / l, dx / l];
  return polyPath(
    [
      [a[0] + nx, a[1] + ny],
      [b[0] + nx, b[1] + ny],
      [b[0] - nx, b[1] - ny],
      [a[0] - nx, a[1] - ny],
    ],
    true
  );
}

export const SearchSpec = /* @__PURE__ */ hoverIcon('Search', {
  geo: ({ h }, size) => {
    const art = size === 16 ? ART_16 : ART_32;
    const along = (x: number) => (x - art.c) * Math.SQRT2;
    const m = magnifierAt(
      {
        c: [art.c, art.c],
        r: art.r,
        w: art.weight,
        handle: [along(art.handle[0]), along(art.handle[1])],
      },
      h
    );
    return {
      lens: { d: ringPath(m.c, m.r, art.weight) },
      handle: { d: band(m.a, m.b) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Search16, Search32),
});
