/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ArrowDown16 from '@carbon/icons/es/arrow--down/16.js';
import ArrowDown32 from '@carbon/icons/es/arrow--down/32.js';
import ArrowUp16 from '@carbon/icons/es/arrow--up/16.js';
import ArrowUp32 from '@carbon/icons/es/arrow--up/32.js';
import ArrowLeft16 from '@carbon/icons/es/arrow--left/16.js';
import ArrowLeft32 from '@carbon/icons/es/arrow--left/32.js';
import ArrowRight16 from '@carbon/icons/es/arrow--right/16.js';
import ArrowRight20 from '@carbon/icons/es/arrow--right/20.js';
import ArrowRight24 from '@carbon/icons/es/arrow--right/24.js';
import ArrowRight32 from '@carbon/icons/es/arrow--right/32.js';
import ArrowDownLeft32 from '@carbon/icons/es/arrow--down-left/32.js';
import ArrowDownRight32 from '@carbon/icons/es/arrow--down-right/32.js';
import ArrowUpLeft32 from '@carbon/icons/es/arrow--up-left/32.js';
import ArrowUpRight32 from '@carbon/icons/es/arrow--up-right/32.js';
import {
  carbonArt,
  toggleIcon,
  TOGGLE_IN,
  type CarbonIcon,
  type Shapes,
} from '../../engine';
import { polyPath, type Pt } from '../../geometry';
import { foldProgress } from '../../ease';
import { lerp } from '../../paint';

/**
 * Arrow direction toggles: Arrow down ⇄ up, left ⇄ right, down-left ⇄
 * up-right and down-right ⇄ up-left (Carbon's eight arrows, in their four
 * opposite pairs).
 *
 * Toggle: the arrow flips like the Chevron toggles (dirToggles.ts), with
 * its shaft: the whole arrow turns over about the icon's centre, across its
 * own axis. It folds flat by 6/15 of the way on the exit ease (head and shaft
 * close up into one 2px bar across the middle, the Chevron's flat frame),
 * then opens the other way on the entrance ease, 160ms both ways (both
 * states are valid, so neither is an exit). The head lands at the other end
 * of the shaft, and the tail at the other end of the icon. Not an in-plane
 * rotation: every point keeps its place across the axis and only moves along
 * it, as the Chevron's do. Diagonals flip along their own diagonal.
 *
 * Drawn as centrelines at a constant width (the head a mitred polyline, the
 * shaft a line, both with butt ends), so the line never thickens; each end is
 * Carbon's drawing at that size (16 has its own art; Arrow right also its 20
 * and 24), and between them the width eases from one to the other.
 *
 * Hover: each end hovers as its Arrow icon (navArrows.ts) moves, at half the
 * reach, as the Chevron toggles halve theirs: the head reaches 2px the way it points and the shaft lengthens
 * behind it, the tail holding. The reach follows the fold, so mid-flip (flat)
 * nothing moves. It never leaves the 36×36 box (capped there, though 2px
 * always fits).
 */

/** One end: Carbon's arrow as centrelines in the 32 frame, and its widths. */
interface End {
  /** The head's corner (its centreline's apex) and its two arm ends. */
  apex: Pt;
  arms: readonly [Pt, Pt];
  /** The shaft's free end; the shaft runs from the apex. */
  tail: Pt;
  /** Line widths: Carbon's arms are 1.41 × √2, its shafts 2 (other artboards scaled into the frame). */
  head: number;
  shaft: number;
}

const BOX = { lo: -2, hi: 34 };
/** Half the Arrow hover icons' 4px, as the Chevron toggles' 2px slide halves theirs. */
const REACH = 2;
const C = 16;

/** The ends at each size: Carbon's 16 art, and any 20 / 24 art, else the 32 art. */
type Ends = { 32: End; 16?: End; 20?: End; 24?: End };
const endAt = (e: Ends, size?: number): End =>
  (size === 16 || size === 20 || size === 24 ? e[size] : undefined) ?? e[32];

/** Points in the pair's own axes: `a` along the off end's pointing direction, `b` across it (from the centre). */
type AB = readonly [number, number];
interface Axes {
  /** The off end's pointing direction (a unit vector). */
  u: Pt;
}
const toAB = ({ u }: Axes, [x, y]: Pt): AB => [
  (x - C) * u[0] + (y - C) * u[1],
  -(x - C) * u[1] + (y - C) * u[0],
];
const fromAB = ({ u }: Axes, [a, b]: AB): Pt => [
  C + a * u[0] - b * u[1],
  C + a * u[1] + b * u[0],
];

/** How far an end's head may reach (`REACH`, less if its tip would leave the 36×36 box). */
function reachOf(e: End, dir: Pt): number {
  // The tip: the head's outer corner, its miter (w / √2 past the apex, the arms meeting at 90°).
  const tip = e.head / Math.SQRT2;
  const ext = Math.hypot(dir[0], dir[1]);
  const [dx, dy] = [dir[0] / ext, dir[1] / ext];
  let room = REACH;
  for (const [p, d] of [
    [e.apex[0] + dx * tip, dx],
    [e.apex[1] + dy * tip, dy],
  ] as const) {
    if (d > 1e-9) {
      room = Math.min(room, (BOX.hi - p) / d);
    }
    if (d < -1e-9) {
      room = Math.min(room, (BOX.lo - p) / d);
    }
  }
  return room;
}

/** An end's points in a / b, the head moved `reach` the way it points (`sign` = +1 for the off end, −1 for the on end). */
function endAB(
  ax: Axes,
  e: End,
  reach: number,
  sign: 1 | -1
): { apex: AB; arms: [AB, AB]; tail: AB } {
  const move = ([a, b]: AB): AB => [a + sign * reach, b];
  const arms = e.arms.map((p) => toAB(ax, p)).sort((p, q) => p[1] - q[1]) as [
    AB,
    AB,
  ];
  return {
    apex: move(toAB(ax, e.apex)),
    arms: [move(arms[0]), move(arms[1])],
    tail: toAB(ax, e.tail),
  };
}

/**
 * One arrow toggle. `off` and `on` are the two ends (at each size), `u` the
 * off end's pointing direction; the on end points the other way.
 */
function arrowToggle<S extends string>(
  name: string,
  states: readonly [S, S],
  statics: readonly [CarbonIcon, CarbonIcon],
  u: Pt,
  off: Ends,
  on: Ends
) {
  const ax: Axes = { u };
  const back: Pt = [-u[0], -u[1]];
  const geo = ({ h, p }: { h: number; p: number }, size?: number): Shapes => {
    const [e0, e1] = [endAt(off, size), endAt(on, size)];
    const q = foldProgress(p);
    // Each end with its own hover (the reach follows the fold: a flat arrow doesn't reach).
    const A = endAB(ax, e0, h * reachOf(e0, u), 1);
    const B = endAB(ax, e1, h * reachOf(e1, back), -1);
    // Flat: every point on one line across the icon's centre (the axis it turns over), each keeping its place across.
    const restA = endAB(ax, e0, 0, 1);
    const restB = endAB(ax, e1, 0, -1);
    const flat = (p0: AB, p1: AB): AB => [0, (p0[1] + p1[1]) / 2];
    const M = {
      apex: flat(restA.apex, restB.apex),
      arms: [
        flat(restA.arms[0], restB.arms[0]),
        flat(restA.arms[1], restB.arms[1]),
      ] as const,
      tail: flat(restA.tail, restB.tail),
    };
    const [from, to, t] = q <= 0.5 ? [A, M, 2 * q] : [M, B, 2 * q - 1];
    const at = (p0: AB, p1: AB): Pt =>
      fromAB(ax, [lerp(p0[0], p1[0], t), lerp(p0[1], p1[1], t)]);
    const apex = at(from.apex, to.apex);
    return {
      shaft: {
        d: polyPath([apex, at(from.tail, to.tail)]),
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: f3(lerp(e0.shaft, e1.shaft, q)),
      },
      head: {
        d: polyPath([
          at(from.arms[0], to.arms[0]),
          apex,
          at(from.arms[1], to.arms[1]),
        ]),
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: f3(lerp(e0.head, e1.head, q)),
        strokeLinejoin: 'miter',
      },
    };
  };
  return toggleIcon<S>(name, {
    states,
    statics,
    geo,
    // Linear: the geometry applies the fold's two-part easing itself.
    change: (turningOn, _fr, tween) =>
      tween('p', turningOn ? 1 : 0, {
        duration: TOGGLE_IN.duration,
        ease: [0, 0, 1, 1],
      }),
  });
}
const f3 = (n: number) => +n.toFixed(3);

// ── Carbon's arrows as centrelines ───────────────────────────────────────────
//
// Each from its path: the head's centreline runs midway between its outer and
// inner edges (its apex 1.41 inside the tip), the arm ends at the middle of
// each butt end, the shaft's tail at the middle of its end. 16, 20 and 24 art
// scaled into the 32 frame.
const W = 1.41 * Math.SQRT2; // the 32 art's arms (and diagonal shafts)
const W16 = 1.4 * Math.SQRT2; // the 16 art's arms (0.7 × √2 in its 16 frame)

/** An up / down / left / right arrow from its centreline numbers along (`a`) and across (`b`) its axis. */
const axial = (
  vertical: boolean,
  apexA: number,
  armA: number,
  armB: number,
  tailA: number,
  head: number,
  shaft = 2,
  armB2 = 32 - armB,
  armA2 = armA
): End => {
  const p = (a: number, b: number): Pt => (vertical ? [b, a] : [a, b]);
  return {
    apex: p(apexA, C),
    arms: [p(armA, armB), p(armA2, armB2)],
    tail: p(tailA, C),
    head,
    shaft,
  };
};

// Arrow up: tip 4, arms out to 6 / 26 at 14 (32 art); tip 2, arms at 12 (16 art). Arrow down mirrors it.
const UP: Ends = {
  32: axial(true, 5.41, 14.705, 6.705, 28, W),
  16: axial(true, 3.4, 12.7, 6.7, 30, W16),
};
const DOWN: Ends = {
  32: axial(true, 26.59, 17.295, 6.705, 4, W),
  16: axial(true, 28.6, 19.3, 6.7, 2, W16),
};
const LEFT: Ends = {
  32: axial(false, 5.41, 14.705, 6.705, 28, W),
  16: axial(false, 3.4, 12.7, 6.7, 30, W16),
};
// Arrow right's 32 art isn't quite Arrow left's mirror (its butt ends are 16.57 7.393 → 18 6 and 16.57 24.573 → 18 26,
// 1.996 across): its own arm ends, at Arrow left's width so the line holds through the flip.
const RIGHT: Ends = {
  32: axial(false, 26.59, 17.285, 6.6965, 4, W, 2, 25.2865),
  16: axial(false, 28.6, 19.3, 6.7, 2, W16),
  // 20 art (× 1.6): tip 19, butt ends 11.8 2.8 → 10.8 3.8, shaft 9.3–10.7 from 1.
  20: axial(false, 28.8, 18.08, 5.28, 1.6, 1.6 * Math.SQRT2, 2.24),
  // 24 art (× 4/3): tip 22, butt ends 14 4 → 12.9 5.1, shaft 11.2–12.8 from 2.
  24: axial(
    false,
    22 * (4 / 3) - (1.1 * 4) / 3,
    17.9333,
    6.0667,
    8 / 3,
    ((1.1 * 4) / 3) * Math.SQRT2,
    6.4 / 3
  ),
};

// Diagonals (one art at every size): the head an L of 2px arms meeting at the
// corner (its centreline's corner 1 in from Carbon's), the shaft 1.41 × √2 wide.
const diagonal = (apex: Pt, arm0: Pt, arm1: Pt, tail: Pt): Ends => ({
  32: { apex, arms: [arm0, arm1], tail, head: 2, shaft: W },
});
const UP_RIGHT = diagonal([25, 7], [10, 7], [25, 22], [6.705, 25.295]);
const DOWN_LEFT = diagonal([7, 25], [22, 25], [7, 10], [25.295, 6.705]);
const UP_LEFT = diagonal([7, 7], [22, 7], [7, 22], [25.295, 25.295]);
const DOWN_RIGHT = diagonal([25, 25], [10, 25], [25, 10], [6.705, 6.705]);

const R = Math.SQRT1_2;

/** Arrow down ⇄ up: Arrow down (`down`, the start) and Arrow up (`up`, toggled). */
export const ArrowDownToggleSpec = /* @__PURE__ */ arrowToggle(
  'ArrowDownToggle',
  ['down', 'up'] as const,
  [
    /* @__PURE__ */ carbonArt(ArrowDown16, ArrowDown32),
    /* @__PURE__ */ carbonArt(ArrowUp16, ArrowUp32),
  ],
  [0, 1],
  DOWN,
  UP
);
/** Arrow left ⇄ right: Arrow left (`left`, the start) and Arrow right (`right`, toggled). */
export const ArrowLeftToggleSpec = /* @__PURE__ */ arrowToggle(
  'ArrowLeftToggle',
  ['left', 'right'] as const,
  [
    /* @__PURE__ */ carbonArt(ArrowLeft16, ArrowLeft32),
    /* @__PURE__ */ carbonArt(
      ArrowRight16,
      ArrowRight20,
      ArrowRight24,
      ArrowRight32
    ),
  ],
  [-1, 0],
  LEFT,
  RIGHT
);
/** Arrow down-left ⇄ up-right: Arrow down left (`down-left`, the start) and Arrow up right (`up-right`, toggled). */
export const ArrowDownLeftToggleSpec = /* @__PURE__ */ arrowToggle(
  'ArrowDownLeftToggle',
  ['down-left', 'up-right'] as const,
  [
    /* @__PURE__ */ carbonArt(ArrowDownLeft32),
    /* @__PURE__ */ carbonArt(ArrowUpRight32),
  ],
  [-R, R],
  DOWN_LEFT,
  UP_RIGHT
);
/** Arrow down-right ⇄ up-left: Arrow down right (`down-right`, the start) and Arrow up left (`up-left`, toggled). */
export const ArrowDownRightToggleSpec = /* @__PURE__ */ arrowToggle(
  'ArrowDownRightToggle',
  ['down-right', 'up-left'] as const,
  [
    /* @__PURE__ */ carbonArt(ArrowDownRight32),
    /* @__PURE__ */ carbonArt(ArrowUpLeft32),
  ],
  [R, R],
  DOWN_RIGHT,
  UP_LEFT
);
