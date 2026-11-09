/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Recycle32 from '@carbon/icons/es/recycle/32.js';
import { carbonArt, HOVER, hoverIcon, type Shapes } from '../../engine';
import { polyPath, type Pt } from '../../geometry';
import { LINE, MITER } from '../../paint';

/**
 * Carbon `recycle` (no reference animation).
 *
 * Hover: all three arrows travel 3px forward around the loop. Each head
 * slides 3px in the direction it faces; its shaft slides along its own
 * curve by the same 3px (a dash window moving along the path), so the tail
 * trims exactly as much as the head advances and every gap between one
 * arrow's head and the next arrow's tail keeps its size. Each head faces
 * straight down the next shaft's line, which is what keeps those gaps true.
 *
 * Carbon's filled outlines are redrawn as 2px centreline strokes (miter
 * heads, butt shaft ends). Each shaft reaches 0.59px short of its head's
 * centreline tip, filling the notch inside the head as Carbon's outline
 * does, and its path runs 3px further on; a dash of the resting length
 * shows only the resting part.
 *
 * Timing: the entrance ease both ways (160ms in, 120ms out).
 */
const TRAVEL = 3;

const ARROWS: Array<{ shaft: string; length: number; head: Pt[]; dir: Pt }> = [
  {
    shaft:
      'M26.5558 19L28.6339 22.7407C29.1325 23.6382 29.1193 24.702 28.5986 25.5872C28.0779 26.472 27.1542 27 26.1276 27L14 27',
    length: 19.3686,
    head: [
      [20.7052, 22.7051],
      [16.4142, 27],
      [20.7052, 31.2949],
    ],
    dir: [-1, 0],
  },
  {
    shaft:
      'M12 27L5.8727 27C4.8461 27 3.9224 26.472 3.4018 25.5872C2.881 24.7019 2.8678 23.6382 3.3664 22.7407L9.801 11.1324',
    length: 22.3616,
    head: [
      [2.8068, 14.9644],
      [8.6286, 13.2428],
      [10.3557, 19.063],
    ],
    dir: [0.4856, -0.8742],
  },
  {
    shaft:
      'M10.4444 10.0001L13.524 4.4568C14.0306 3.5447 14.9563 3 16 3C17.0437 3 17.9694 3.5447 18.4761 4.4568L25.9116 17.8676',
    length: 24.7076,
    head: [
      [18.9172, 14.0357],
      [24.7392, 15.7572],
      [26.4661, 9.937],
    ],
    dir: [0.4856, 0.8742],
  },
];

const r4 = (n: number) => Math.round(n * 1e4) / 1e4 || 0;

/** The three arrows at hover progress h: each shaft's dash window and head moved `TRAVEL · h` forward. */
function recycleShapes({ h }: { h: number }): Shapes {
  const out: Shapes = {};
  ARROWS.forEach((a, i) => {
    const d = TRAVEL * h;
    out[`shaft${i}`] = {
      d: a.shaft,
      ...LINE,
      strokeDasharray: `${a.length} 100`,
      strokeDashoffset: r4(-d),
    };
    out[`head${i}`] = {
      d: polyPath(
        a.head.map(([x, y]) => [x + a.dir[0] * d, y + a.dir[1] * d] as const)
      ),
      ...MITER,
    };
  });
  return out;
}

export const RecycleSpec = /* @__PURE__ */ hoverIcon('Recycle', {
  geo: recycleShapes,
  hover: HOVER,
  static: /* @__PURE__ */ carbonArt(Recycle32),
});
