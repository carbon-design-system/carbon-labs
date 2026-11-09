/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import NotSent32 from '@carbon/icons/es/not-sent/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import { polyPath, type Pt } from '../../geometry';
import { LINE } from '../../paint';
import { OFF_SHRINK, SLASH_REACH } from '../../off';

/**
 * Timing: moderate01, entrance
 *
 * On hover (the set-wide Off rule) the strike extends 1px at each end and the paper plane
 * shrinks to 90% about (14.007, 18). (reference: strike 107.5%, plane 90.9%.)
 *
 * Constant line weight, no masks. The plane is its 2px centreline (a
 * quadrilateral with round tips, and the nib from its inner corner to the
 * strike), its points scaled; the strike is a 2px line whose ends move.
 * Carbon leaves a gap between the strike and the part of the plane above
 * it, so that part is Carbon's own outline form built from the centreline
 * — each edge offset 1px either side, a round outer tip, both ends cut
 * along the gap's edge (a fixed line parallel to the strike). Below the
 * strike the plane runs under it, so its ends are simply cut inside the
 * strike. Rest matches Carbon within 0.5%.
 */

export type Line = readonly [Pt, Pt]; // a point and a direction

// The plane's centreline corners: left tip, inner corner (where the nib
// starts), bottom tip, right tip. Its centroid is inside it.
export const PLANE = {
  left: [3.014, 15] as Pt,
  inner: [13, 19] as Pt,
  bottom: [17, 29] as Pt,
  right: [25, 7] as Pt,
};
const CENTRE: Pt = [14.5, 17.5];
export const PLANE_PIVOT: Pt = [14.007, 18];

/** The line y − x = c (parallel to the strike). */
export const alongStrike = (c: number): Line => [
  [0, c],
  [1, 1],
];
/** The line x + y = c (across the strike). */
export const acrossStrike = (c: number): Line => [
  [c, 0],
  [-1, 1],
];

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const unit = (from: Pt, to: Pt): Pt => {
  const [dx, dy] = sub(to, from);
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
};
/** Where the line through p along u meets the line through q along v. */
const meet = (p: Pt, u: Pt, q: Pt, v: Pt): Pt => {
  const t =
    ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / (u[0] * v[1] - u[1] * v[0]);
  return [p[0] + u[0] * t, p[1] + u[1] * t];
};
const f = (n: number) => +n.toFixed(4);
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
/** The plane's point on edge a→b where it crosses y − x = c. */
const crossing = (a: Pt, b: Pt, c: number): Pt => {
  const [dx, dy] = sub(b, a);
  const t = (c - (a[1] - a[0])) / (dy - dx);
  return [a[0] + dx * t, a[1] + dy * t];
};

/**
 * One tip of the plane in Carbon's outline form: the two edges from tip T
 * toward a and b, each a 2px band (its outside edge 1px out from the
 * centreline), joined round at T, and cut by `cut1` and `cut2`. Outlined,
 * the bands' inside edges meet sharp; solid, the piece is filled to where
 * the cuts meet.
 */
export function tipPiece(
  T: Pt,
  a: Pt,
  b: Pt,
  cut1: Line,
  cut2: Line,
  solid: boolean
): string {
  const [u1, u2] = [unit(T, a), unit(T, b)];
  const out = ([ux, uy]: Pt): Pt => {
    const n: Pt = [-uy, ux];
    const q = sub(CENTRE, T);
    return n[0] * q[0] + n[1] * q[1] > 0 ? [uy, -ux] : n;
  };
  const [n1, n2] = [out(u1), out(u2)];
  const [o1, o2] = [add(T, n1), add(T, n2)];
  const sweep = n1[0] * n2[1] - n1[1] * n2[0] > 0 ? 1 : 0;
  const ends = `L${P(o1)}A1 1 0 0 ${sweep} ${P(o2)}L${P(meet(o2, u2, ...cut2))}`;
  if (solid) {
    const [[p1, d1], [p2, d2]] = [cut1, cut2];
    const parallel = Math.abs(d1[0] * d2[1] - d1[1] * d2[0]) < 1e-9;
    return `M${P(meet(o1, u1, ...cut1))}${ends}${parallel ? '' : `L${P(meet(p1, d1, p2, d2))}`}Z`;
  }
  const [i1, i2] = [sub(T, n1), sub(T, n2)];
  return `M${P(meet(o1, u1, ...cut1))}${ends}L${P(meet(i2, u2, ...cut2))}L${P(meet(i1, u1, i2, u2))}L${P(meet(i1, u1, ...cut1))}Z`;
}

/** The plane's corners at hover progress h (scaled 100% → 90%, the set-wide Off rule). */
export function planeAt(h: number) {
  const s = 1 - OFF_SHRINK * h;
  const S = ([x, y]: Pt): Pt => [
    PLANE_PIVOT[0] + (x - PLANE_PIVOT[0]) * s,
    PLANE_PIVOT[1] + (y - PLANE_PIVOT[1]) * s,
  ];
  return {
    left: S(PLANE.left),
    inner: S(PLANE.inner),
    bottom: S(PLANE.bottom),
    right: S(PLANE.right),
    S,
    s,
  };
}

/** The strike, a 2px line from (2.7, 2.7) to (29.3, 29.3), extended 1px at each end. */
export function strikeAt(h: number) {
  const k = (SLASH_REACH * h) / Math.SQRT2;
  const [a, b] = [2.701 - k, 29.297 + k];
  return { d: `M${f(a)} ${f(a)}L${f(b)} ${f(b)}`, ...LINE };
}

// The edge of Carbon's gap above the strike (the strike's own edge is
// y − x = −1.414), and a cut inside the strike for the part beneath it.
const GAP_EDGE = -4.24;
const UNDER = 0;

export const NotSentSpec = /* @__PURE__ */ hoverIcon('NotSent', {
  geo: ({ h }) => {
    const { left, inner, bottom, right, S } = planeAt(h);
    const nibEnd = S([16, 16]); // on the strike
    const below = polyPath([
      crossing(right, bottom, UNDER),
      bottom,
      inner,
      left,
      crossing(left, right, UNDER),
    ]);
    return {
      above: {
        d: tipPiece(
          right,
          left,
          bottom,
          alongStrike(GAP_EDGE),
          alongStrike(GAP_EDGE),
          false
        ),
      },
      below: {
        d: `${below}M${P(inner)}L${P(nibEnd)}`,
        ...LINE,
        strokeLinejoin: 'round',
      },
      strike: strikeAt(h),
    };
  },
  static: /* @__PURE__ */ carbonArt(NotSent32),
});
