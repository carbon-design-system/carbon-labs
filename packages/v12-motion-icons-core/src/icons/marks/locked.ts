/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import RuleLocked32 from '@carbon/icons/es/rule--locked/32.js';
import {
  makeStatusMarkIcon,
  type MarkType,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import type { Pt } from '../../geometry';
import { f } from '../../paint';
import { carbonArt, withStatic } from '../../engine';
import { SHIELD_GROW } from '../assorted/objectsA';
import { BAR_REACH } from '../assorted/files';
import { weightGrow, type Centreline } from './bases';

/**
 * The locked badge: Carbon's `rule--locked`, on the status-mark system
 * (utils/statusMark.ts).
 *
 * The locked motion, Locked's: the shackle presses home. Its arch drops
 * 1px and its legs retract 2px as the body grows 1px on every side (the
 * container's growth; walls 2px, corners r2), the lock growing about its
 * own middle.
 *
 * The rule plays Rule's hover: the shield grows 24/22 about its middle at
 * constant weight (1px out each side) and its bars reach 1px at each end.
 * Carbon's cut moves with the shield, and its two open ends (the right
 * side's, above the lock, and the point's, left of it) draw back to keep
 * their resting space.
 */

/** Where a lock sits: Carbon's small lock (rule--locked's), its body x 18–30, y 22–31, its shackle about (24, 19). */
export interface LockPlace {
  /** The body's outer box (x0, y0, x1, y1) and the shackle's centre. */
  body: readonly [number, number, number, number];
  arch: Pt;
}
/** The body's growth (each side) and the arch's drop at full hover. */
export const LOCK_GROW = 1;
export const LOCK_DROP = 1;

function lockAt(p: LockPlace, h: number) {
  const g = LOCK_GROW * h;
  const [x0, y0, x1, y1] = [
    p.body[0] - g,
    p.body[1] - g,
    p.body[2] + g,
    p.body[3] + g,
  ];
  const [ax, ay] = [p.arch[0], p.arch[1] + LOCK_DROP * h];
  // The legs run down into the body's top wall (1px in), so the two shapes overlap there, never abut.
  const legs = y0 + 1;
  const P = (x: number, y: number) => `${f(x)} ${f(y)}`;
  const body =
    `M${P(x0 + 2, y0)}H${f(x1 - 2)}A2 2 0 0 1 ${P(x1, y0 + 2)}V${f(y1 - 2)}A2 2 0 0 1 ${P(x1 - 2, y1)}H${f(x0 + 2)}A2 2 0 0 1 ${P(x0, y1 - 2)}V${f(y0 + 2)}A2 2 0 0 1 ${P(x0 + 2, y0)}Z` +
    `M${P(x0 + 2, y0 + 2)}V${f(y1 - 2)}H${f(x1 - 2)}V${f(y0 + 2)}Z`;
  const shackle = `M${P(ax - 4, legs)}V${f(ay)}A4 4 0 0 1 ${P(ax + 4, ay)}V${f(legs)}H${f(ax + 2)}V${f(ay)}A2 2 0 0 0 ${P(ax - 2, ay)}V${f(legs)}Z`;
  return {
    d: body + shackle,
    box: [x0, y0, x1, y1] as const,
    arch: [ax, ay] as Pt,
  };
}

/** The locked mark: the body 1px out on every side, the shackle's arch 1px down. */
export const LOCK: MarkType<LockPlace> = {
  d: (p, h) => lockAt(p, h).d,
  ink: (p, h) => {
    const {
      box: [x0, y0, x1, y1],
      arch: [ax, ay],
    } = lockAt(p, h);
    const arch = Array.from({ length: 25 }, (_, i) => {
      const a = Math.PI + (Math.PI * i) / 24;
      return [ax + 4.01 * Math.cos(a), ay + 4.01 * Math.sin(a)] as Pt;
    });
    return [
      [
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ],
      [[ax - 4, y0], ...arch, [ax + 4, y0]],
    ];
  },
};

// Rule's shield as rule--locked draws it: 2px walls about a centreline from its top corners (3, 3) and (25, 3)
// down its sides, round its lower left curve to its point's straight run, cut at x 13 (left of the lock) and
// at y 12 on the right (above it).
const cubic = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * a[0] +
      3 * u * u * t * b[0] +
      3 * u * t * t * c[0] +
      t * t * t * d[0],
    u * u * u * a[1] +
      3 * u * u * t * b[1] +
      3 * u * t * t * c[1] +
      t * t * t * d[1],
  ];
};
const CURVE: Pt[] = /* @__PURE__ */ Array.from({ length: 33 }, (_, i) => {
  const t = i / 32;
  const [o, n] = [
    cubic([2, 17], [2, 21.1], [4.2, 24.8], [7.8, 26.7], t),
    cubic([4, 17], [4, 20.3], [5.8, 23.4], [8.8, 24.9], t),
  ];
  return [(o[0] + n[0]) / 2, (o[1] + n[1]) / 2];
});
const RULE_CL: Centreline = {
  lines: [
    [
      [25, 12],
      [25, 3],
      [3, 3],
      [3, 17],
    ],
    [...CURVE, [13, 28.35]],
  ],
  corners: [
    [3, 3],
    [25, 3],
  ],
  snap: 1.6,
};
/** The shield's middle: Rule's hover grows it about here. */
const RULE_C: Pt = [14, 16];
const ruleCalm = (q: Pt, h: number) =>
  weightGrow(RULE_CL, RULE_C, 1 + (SHIELD_GROW - 1) * h)(q);
/** Rule's bars at hover h: each reaching 1px at both ends. */
const ruleBars = (h: number) => {
  const r = BAR_REACH * h;
  return (
    `M${f(8 - r)} 16H${f(14 + r)}V18H${f(8 - r)}Z` +
    `M${f(8 - r)} 10H${f(20 + r)}V12H${f(8 - r)}Z`
  );
};
/** The point's straight run, from its curve down to its cut (the open end draws back up it). */
const UP_POINT: Pt = /* @__PURE__ */ (() => {
  const [dx, dy] = [7.8 - 13, 26.7 - 29.5];
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
})();

export const RULE_LOCKED: StatusMarkSpec<LockPlace> = {
  base: {
    d: 'M26 4C26 2.9 25.1 2 24 2H4C2.9 2 2 2.9 2 4V17C2 21.1 4.2 24.8 7.8 26.7L13 29.5V27.2L8.8 24.9C5.8 23.4 4 20.3 4 17V4H24V12H26V4Z',
    ends: [
      {
        at: [
          [24, 12],
          [26, 12],
        ],
        back: [0, -1],
      },
      {
        at: [
          [13, 29.5],
          [13, 27.2],
        ],
        back: UP_POINT,
      },
    ],
    parts: { bars: /* @__PURE__ */ ruleBars(0) },
    partsAt: (h) => ({ bars: ruleBars(h) }),
    calm: ruleCalm,
  },
  baseMotion: 'calm',
  mark: LOCK,
  place: { body: [18, 22, 30, 31], arch: [24, 19] },
};
export const RuleLockedSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('RuleLocked', RULE_LOCKED),
  /* @__PURE__ */ carbonArt(RuleLocked32)
);
