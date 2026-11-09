/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Review32 from '@carbon/icons/es/review/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import { polyPath, scalePts, type Pt } from '../../geometry';

/**
 * Timing: moderate01, entrance
 *
 * On hover the speech bubble grows 1px out along every edge (its tail tip
 * holds, so the tail shortens along its own line) and the star grows to
 * 118.5% about (16, 13.5).
 *
 * Constant line weight: the bubble is Carbon's own outline form rebuilt
 * each frame from its 2px centreline (a rounded rect, corner r=3, open at
 * the bottom left, with a tail): inner corners r=2, outer r=4, the tail a
 * 2px band. The star is a solid fill, so its points scale. Nothing is
 * scaled with a transform. Rest matches Carbon exactly.
 */

const f = (n: number) => +n.toFixed(4);
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;

/**
 * The bubble around the centreline rect (x0, y0)–(x1, y1): its bottom edge
 * runs from x=gx on the left (a butt end) to the tail at x=tx, and the
 * tail runs from there to its tip `tip` (square end).
 */
function bubble(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  gx: number,
  tx: number,
  tip: Pt
): string {
  const l = Math.hypot(tip[0] - tx, tip[1] - y1);
  const [dx, dy] = [(tip[0] - tx) / l, (tip[1] - y1) / l];
  const [nx, ny] = [-dy, dx]; // across the tail, toward its left (inner) edge
  // Where each edge of the tail meets the bubble's inner (y1 − 1) and outer (y1 + 1) edge.
  const atY = (px: number, py: number, y: number): Pt => [
    px + ((y - py) * dx) / dy,
    y,
  ];
  const inner = atY(tx + nx, y1 + ny, y1 - 1);
  const outer = atY(tx - nx, y1 - ny, y1 + 1);
  return (
    `M${P([tip[0] - nx, tip[1] - ny])}L${P([tip[0] + nx, tip[1] + ny])}L${P(inner)}` +
    `H${f(x1 - 3)}A2 2 0 0 0 ${f(x1 - 1)} ${f(y1 - 3)}V${f(y0 + 3)}A2 2 0 0 0 ${f(x1 - 3)} ${f(y0 + 1)}` +
    `H${f(x0 + 3)}A2 2 0 0 0 ${f(x0 + 1)} ${f(y0 + 3)}V${f(y1 - 3)}A2 2 0 0 0 ${f(x0 + 3)} ${f(y1 - 1)}` +
    `H${f(gx)}V${f(y1 + 1)}H${f(x0 + 3)}A4 4 0 0 1 ${f(x0 - 1)} ${f(y1 - 3)}V${f(y0 + 3)}A4 4 0 0 1 ${f(x0 + 3)} ${f(y0 - 1)}` +
    `H${f(x1 - 3)}A4 4 0 0 1 ${f(x1 + 1)} ${f(y0 + 3)}V${f(y1 - 3)}A4 4 0 0 1 ${f(x1 - 3)} ${f(y1 + 1)}H${f(outer[0])}Z`
  );
}

// The tail's centreline, from where it leaves the bubble (at y=23) to its tip.
const TAIL: [Pt, Pt] = [
  [20.579, 23],
  [16.868, 29.5],
];
/** The tail's x where it crosses y. */
const tailX = (y: number) =>
  TAIL[0][0] +
  ((y - TAIL[0][1]) * (TAIL[1][0] - TAIL[0][0])) / (TAIL[1][1] - TAIL[0][1]);

const STAR: Pt[] = [
  [16, 8],
  [17.912, 11.703],
  [22, 12.297],
  [19, 15],
  [20, 19],
  [16, 16.75],
  [12, 19],
  [13, 15],
  [10, 12.297],
  [14.2, 11.703],
];

export const ReviewSpec = /* @__PURE__ */ hoverIcon('Review', {
  geo: ({ h }) => {
    const y1 = 23 + h;
    return {
      bubble: {
        d: bubble(3 - h, 5 - h, 29 + h, y1, 15 - h, tailX(y1), TAIL[1]),
      },
      star: { d: polyPath(scalePts(STAR, [16, 13.5], 1 + 0.185 * h), true) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Review32),
});
