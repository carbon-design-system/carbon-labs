/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Exit32 from '@carbon/icons/es/exit/32.js';
import Move32 from '@carbon/icons/es/move/32.js';
import ArrowShiftDown32 from '@carbon/icons/es/arrow-shift-down/32.js';
import Reply32 from '@carbon/icons/es/reply/32.js';
import Upgrade32 from '@carbon/icons/es/upgrade/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import { EVENODD, f } from '../../paint';

/**
 * Arrow icons on the set-wide arrow reach: a standalone arrow reaches 4px,
 * an arrow on a glyph (a wall, a tray) or one of a set reaches 2px. The
 * head moves rigidly and the straight shaft behind it lengthens, so the
 * line weight never changes. Carbon's own outlines, rest matches Carbon.
 * 160ms entrance ease.
 *
 *  - Exit: the arrow reaches 2px further left; the wall
 *    shortens 2px at each end (its reference animation), as geometry rather than a scale.
 *  - Move: each of the four heads reaches 2px further out.
 *  - Arrow shift down: the head reaches 4px further down; the
 *    stem's top holds and its sides lengthen.
 *  - Reply: the head reaches 3px further left (the most that fits the 36px
 *    overflow box), and the tail stretches out to it smoothly (see below).
 *  - Upgrade: the roof and shaft rise 2px; the box's sides
 *    lengthen and the tray holds.
 */

const P = (x: number, y: number) => `${f(x)} ${f(y)}`;

export const ExitSpec = /* @__PURE__ */ hoverIcon('Exit', {
  geo: ({ h }) => {
    const d = 2 * h;
    const x = (v: number) => v - d;
    return {
      wall: { d: `M26 ${f(4 + d)}H28V${f(28 - d)}H26Z` },
      arrow: {
        d: `M${P(x(11.414), 20.586)}L${P(x(7.828), 17)}L22 17L22 15L${P(x(7.828), 15)}L${P(x(11.414), 11.414)}L${P(x(10), 10)}L${P(x(4), 16)}L${P(x(10), 22)}Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Exit32),
});

export const MoveSpec = /* @__PURE__ */ hoverIcon('Move', {
  geo: ({ h }) => {
    const d = 2 * h;
    // Carbon's outline; each point belongs to the head it sits in (or the centre).
    const pts = [
      [25, 11],
      [23.59, 12.41],
      [26.17, 15],
      [17, 15],
      [17, 5.83],
      [19.59, 8.41],
      [21, 7],
      [16, 2],
      [11, 7],
      [12.41, 8.41],
      [15, 5.83],
      [15, 15],
      [5.83, 15],
      [8.41, 12.41],
      [7, 11],
      [2, 16],
      [7, 21],
      [8.41, 19.59],
      [5.83, 17],
      [15, 17],
      [15, 26.17],
      [12.41, 23.59],
      [11, 25],
      [16, 30],
      [21, 25],
      [19.59, 23.59],
      [17, 26.17],
      [17, 17],
      [26.17, 17],
      [23.59, 19.59],
      [25, 21],
      [30, 16],
    ];
    const moved = pts.map(([x, y]) => [
      x < 10 ? x - d : x > 22 ? x + d : x,
      y < 10 ? y - d : y > 22 ? y + d : y,
    ]);
    return { arrows: { d: `M${moved.map(([x, y]) => P(x, y)).join('L')}Z` } };
  },
  static: /* @__PURE__ */ carbonArt(Move32),
});

export const ArrowShiftDownSpec = /* @__PURE__ */ hoverIcon('ArrowShiftDown', {
  geo: ({ h }) => {
    const d = 4 * h;
    const y = (v: number) => v + d;
    return {
      arrow: {
        d:
          `M23 6V${f(y(16))}H28A1 1 0 0 1 ${P(28.707, y(17.707))}L${P(16.707, y(29.707))}A.9994 .9994 0 0 1 ${P(15.293, y(29.707))}` +
          `L${P(3.293, y(17.707))}A1 1 0 0 1 ${P(4, y(16))}H9V6A2 2 0 0 1 11 4H21A2 2 0 0 1 23 6Z` +
          `M${P(16, y(27.5859))}L${P(25.5859, y(18))}H21V6H11V${f(y(18))}H6.4141Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(ArrowShiftDown32),
});

// Reply: Carbon's outline as the reference's bezier vertices, offset into
// the 32px frame. The head moves 3px; the tail stretches out to it
// smoothly: every point of it takes a share of the move that eases from all
// of it at the head to none at the tail's tip, so the curve stays smooth
// end to end. Each row: vertex, in-handle, out-handle (relative).
const REPLY_OUTER = [
  [12.503, 12.999, 0.089, 0.154, -1.332, -2.269],
  [6.994, 7.531, 2.279, 1.315, -2.279, -1.315],
  [-0.497, 5.499, 2.631, 0.017, 0, 0],
  [-0.497, 11.499, 0, 0, -0.001, 0.197],
  [-0.668, 12.053, 0.11, -0.164, -0.11, 0.164],
  [-1.117, 12.419, 0.183, -0.075, -0.182, 0.077],
  [-1.694, 12.479, 0.194, 0.037, -0.194, -0.037],
  [-2.207, 12.209, 0.141, 0.139, 0, 0],
  [-14.207, 0.209, 0, 0, -0.094, -0.093],
  [-14.426, -0.116, 0.051, 0.122, -0.051, -0.122],
  [-14.503, -0.501, 0, 0.132, 0, -0.132],
  [-14.426, -0.886, -0.051, 0.122, 0.051, -0.122],
  [-14.207, -1.211, -0.094, 0.093, 0, 0],
  [-2.207, -13.211, 0, 0, 0.141, -0.139],
  [-1.694, -13.481, -0.194, 0.037, 0.194, -0.037],
  [-1.117, -13.421, -0.182, -0.077, 0.183, 0.075],
  [-0.668, -13.055, -0.11, -0.164, 0.11, 0.164],
  [-0.497, -12.501, -0.001, -0.197, 0, 0],
  [-0.497, -6.391, 0, 0, 4.137, 0.531],
  [10.203, -0.714, -2.76, -3.128, 2.76, 3.128],
  [14.503, 10.609, -0.012, -4.171, -0.002, 0.669],
  [14.373, 12.609, 0.084, -0.663, -0.025, 0.208],
  [14.116, 13.166, 0.142, -0.154, -0.142, 0.154],
  [13.583, 13.469, 0.205, -0.043, 0, 0],
  [13.383, 13.499, 0, 0, -0.178, 0.002],
  [12.875, 13.369, 0.155, 0.088, -0.155, -0.088],
];
const REPLY_INNER = [
  [12.503, 9.499, -1.682, -1.918, -0.301, -3.628],
  [8.036, -0.096, 2.582, 2.566, -2.582, -2.566],
  [-1.587, -4.501, 3.629, 0.278, -0.249, -0.023],
  [-2.237, -4.824, 0.168, 0.185, -0.168, -0.185],
  [-2.497, -5.501, -0.001, 0.25, 0, 0],
  [-2.497, -10.091, 0, 0, 0, 0],
  [-12.087, -0.501, 0, 0, 0, 0],
  [-2.497, 9.089, 0, 0, 0, 0],
  [-2.497, 4.499, 0, 0, 0, -0.265],
  [-2.204, 3.792, -0.188, 0.188, 0.188, -0.188],
  [-1.497, 3.499, -0.265, 0, 0, 0],
  [-0.957, 3.499, 0, 0, 0, 0],
  [-0.997, 3.499, 0, 0, 2.55, -0.037],
  [6.412, 5.016, -2.331, -1.036, 2.331, 1.036],
];
// The reference animation sits 1px right of Carbon's drawing: x + 15.5, y + 16.5.
const REPLY_ORIGIN: [number, number] = [15.5, 16.5];
/** How much of the head's move a point at x takes: all of it at the head (x ≤ 15), easing to none at the tail's tip. */
const replyShare = (x: number) =>
  x <= 15 ? 1 : x >= 30 ? 0 : 0.5 * (1 + Math.cos((Math.PI * (x - 15)) / 15));
/**
 * A closed bezier loop, sampled finely, every point moved dx by its share:
 * the move eases smoothly along the tail, so the curve stays smooth, and the
 * head (all of it at x ≤ 15) moves rigidly, corners and all.
 */
function replyLoop(vs: number[][], dx: number): string {
  const v = vs.map(([x, y, ix, iy, ox, oy]) => {
    const [px, py] = [x + REPLY_ORIGIN[0], y + REPLY_ORIGIN[1]];
    return { p: [px, py], i: [px + ix, py + iy], o: [px + ox, py + oy] };
  });
  const pts: string[] = [];
  const N = 12;
  v.forEach((a, k) => {
    const b = v[(k + 1) % v.length];
    const straight =
      a.o[0] === a.p[0] &&
      a.o[1] === a.p[1] &&
      b.i[0] === b.p[0] &&
      b.i[1] === b.p[1];
    for (let n = 0; n < (straight ? 1 : N); n++) {
      const t = n / N;
      const u = 1 - t;
      const x =
        u * u * u * a.p[0] +
        3 * u * u * t * a.o[0] +
        3 * u * t * t * b.i[0] +
        t * t * t * b.p[0];
      const y =
        u * u * u * a.p[1] +
        3 * u * u * t * a.o[1] +
        3 * u * t * t * b.i[1] +
        t * t * t * b.p[1];
      pts.push(P(x + dx * replyShare(x), y));
    }
  });
  return `M${pts.join('L')}Z`;
}

// 3px, not the 4px standalone reach: Reply's tip rests at x = 1, so 3px is
// as far as it can go and stay inside the 36px overflow box.
export const ReplySpec = /* @__PURE__ */ hoverIcon('Reply', {
  geo: ({ h }) => ({
    arrow: {
      ...EVENODD,
      d: replyLoop(REPLY_OUTER, -3 * h) + replyLoop(REPLY_INNER, -3 * h),
    },
  }),
  static: /* @__PURE__ */ carbonArt(Reply32),
});

export const UpgradeSpec = /* @__PURE__ */ hoverIcon('Upgrade', {
  geo: ({ h }) => {
    const d = 2 * h;
    const y = (v: number) => v - d;
    return {
      tray: {
        d: 'M21,24H11a2,2,0,0,0-2,2v2a2,2,0,0,0,2,2H21a2,2,0,0,0,2-2V26A2,2,0,0,0,21,24Zm0,4H11V26H21Z',
      },
      arrow: {
        d:
          `M${P(28.707, y(14.293))}L${P(16.707, y(2.293))}A.9994 .9994 0 0 0 ${P(15.293, y(2.293))}L${P(3.293, y(14.293))}A1 1 0 0 0 ${P(4, y(16))}H9V20A2 2 0 0 0 11 22H21A2 2 0 0 0 23 20V${f(y(16))}H28A1 1 0 0 0 ${P(28.707, y(14.293))}Z` +
          `M21 ${f(y(14))}V20H11V${f(y(14))}H6.4141L${P(16, y(4.4141))}L${P(25.5859, y(14))}Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Upgrade32),
});
