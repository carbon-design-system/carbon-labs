/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import TagNone32 from '@carbon/icons/es/tag--none/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import { filletPath, polyPath, ringPath, type Pt } from '../../geometry';
import { LINE } from '../../paint';
import { OFF_SHRINK } from '../../off';

/**
 * Timing: moderate01, entrance
 *
 * On hover (the set-wide Off rule; the reference: 87.5%) the tag (outline and hole) shrinks to 90% about
 * (16.25, 16.25) beneath the slash, and the slash extends 1px at each end.
 *
 * Constant line weight: the tag is its 2px centreline fitted to Carbon (a
 * pentagon, every corner filleted r=1: outer r=2, inner sharp), cut where
 * it meets the slash. Carbon leaves a 2px gap on the slash's upper side;
 * the upper piece stops at that gap's edge (x + y = 27.755) and the lower
 * piece runs under the slash. The cuts are fixed lines, so as the tag's
 * points shrink its pieces end on them still — no mask. The hole is a ring
 * whose centre and radius scale at fixed weight. Rest matches Carbon
 * within 0.5%.
 */

const PIVOT: Pt = [16.25, 16.25];

// The tag's centreline corners, clockwise from the top left.
const TOP_LEFT: Pt = [3, 3];
const TOP_RIGHT: Pt = [14.3566, 3];
const RIGHT: Pt = [29.4144, 18.0578];
const BOTTOM: Pt = [18.0582, 29.4139];
const LEFT: Pt = [3, 14.3556];
const HOLE: Pt = [10, 10];

// The cuts, as lines x + y = c: the edge of Carbon's gap above the slash,
// and (for the piece that runs under the slash) inside the slash.
const GAP_EDGE = 27.755;
const UNDER_SLASH = 31;

/** Where the segment a→b crosses x + y = c. */
function cut(a: Pt, b: Pt, c: number): Pt {
  const t = (c - a[0] - a[1]) / (b[0] + b[1] - a[0] - a[1]);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** The slash, a 2px band from (2.7, 29.3) to (29.3, 2.7), `ext` px longer at each end. */
function slash(ext: number): string {
  const k = ext / Math.SQRT2;
  const [a, b]: [Pt, Pt] = [
    [2.7071 - k, 29.2929 + k],
    [29.2929 + k, 2.7071 - k],
  ];
  const n = Math.SQRT1_2;
  return polyPath(
    [
      [a[0] - n, a[1] - n],
      [b[0] - n, b[1] - n],
      [b[0] + n, b[1] + n],
      [a[0] + n, a[1] + n],
    ],
    true
  );
}

export const TagNoneSpec = /* @__PURE__ */ hoverIcon('TagNone', {
  geo: ({ h }) => {
    const s = 1 - OFF_SHRINK * h;
    const S = ([x, y]: Pt): Pt => [
      PIVOT[0] + (x - PIVOT[0]) * s,
      PIVOT[1] + (y - PIVOT[1]) * s,
    ];
    const [tl, tr, r, b, l] = [TOP_LEFT, TOP_RIGHT, RIGHT, BOTTOM, LEFT].map(S);
    return {
      upper: {
        d: filletPath(
          [cut(b, l, GAP_EDGE), l, tl, tr, cut(tr, r, GAP_EDGE)],
          1
        ),
        ...LINE,
      },
      lower: {
        d: filletPath(
          [cut(tr, r, UNDER_SLASH), r, b, cut(b, l, UNDER_SLASH)],
          1
        ),
        ...LINE,
      },
      hole: { d: ringPath(S(HOLE), 3 * s, 2) },
      slash: { d: slash(h) },
    };
  },
  static: /* @__PURE__ */ carbonArt(TagNone32),
});
