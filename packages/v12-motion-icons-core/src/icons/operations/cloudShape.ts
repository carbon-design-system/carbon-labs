/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Carbon's cloud as geometry, shared by Cloud upload / download (transfer.ts)
 * and their status fixes (statusFixes.ts). A leaf: it imports only what it
 * draws with, so a fix that needs the cloud doesn't bring the transfer icons.
 */
import type { Pt } from '../../geometry';
import { f } from '../../paint';

const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;

// Carbon's cloud: three 2px walls (the left lobe, the top, the right lobe),
// each between two circles, ending in short butt stubs at x = 9 and 23 either
// side of the opening. The circles' centres and radii, from Carbon's arcs.
// Scaling it moves the circles' centres and scales their centrelines, so
// every wall keeps its weight. The lobes are then cut at x = 9 and 23 again:
// a lobe whose bottom stays outside the cut runs on along its base to it (as
// Carbon's stub does); one whose bottom passes the cut is cut through its
// curve there.
type Circle = { c: Pt; r: number };
/** The centre of the arc from a to b of radius r (SVG's rule: r grows if the chord needs it). */
function arcCircle(
  a: Pt,
  b: Pt,
  r: number,
  large: 0 | 1,
  sweep: 0 | 1
): Circle {
  const [mx, my] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const half = Math.hypot(dx, dy) / 2;
  const R = Math.max(r, half);
  const off =
    Math.sqrt(Math.max(0, R * R - half * half)) * (large === sweep ? -1 : 1);
  return {
    c: [mx - (dy / (2 * half)) * off, my + (dx / (2 * half)) * off],
    r: R,
  };
}
const C_TOP_OUT = arcCircle([7.2, 9.14], [24.8, 9.14], 9, 0, 1);
const C_TOP_IN = arcCircle([22.9, 10.18], [9.02, 10.18], 7, 0, 0);
const C_LEFT_OUT = arcCircle([8.5, 22], [7.2, 9.14], 6.5, 0, 1);
const C_LEFT_IN = arcCircle([8.14, 11], [8.5, 20], 4.5, 0, 0);
const C_RIGHT_OUT = arcCircle([24.8, 9.14], [23.5, 22], 6.5, 0, 1);
const C_RIGHT_IN = arcCircle([23.5, 20], [23.86, 11], 4.5, 0, 0);
/** Where two circles cross, the upper of the two points. */
function cross(p: Circle, q: Circle): Pt {
  const [dx, dy] = [q.c[0] - p.c[0], q.c[1] - p.c[1]];
  const d = Math.hypot(dx, dy);
  const a = (p.r * p.r - q.r * q.r + d * d) / (2 * d);
  const hh = Math.sqrt(Math.max(0, p.r * p.r - a * a));
  const [mx, my] = [p.c[0] + (dx * a) / d, p.c[1] + (dy * a) / d];
  const [s, t]: Pt[] = [
    [mx + (dy * hh) / d, my - (dx * hh) / d],
    [mx - (dy * hh) / d, my + (dx * hh) / d],
  ];
  return s[1] < t[1] ? s : t;
}
/** The arc on circle k from a to b, turning clockwise on screen (sweep 1) or anticlockwise. */
function arcTo(k: Circle, a: Pt, b: Pt, sweep: 0 | 1): string {
  const ang = (p: Pt) => Math.atan2(p[1] - k.c[1], p[0] - k.c[0]);
  const turn =
    (((sweep ? ang(b) - ang(a) : ang(a) - ang(b)) % (2 * Math.PI)) +
      2 * Math.PI) %
    (2 * Math.PI);
  return `A${f(k.r)} ${f(k.r)} 0 ${turn > Math.PI ? 1 : 0} ${sweep} ${P(b)}`;
}
/**
 * Where a lobe's edge (circle k) ends at the cut x: along the circle to its
 * bottom and on straight to the cut, or, if its bottom is past the cut,
 * where the circle crosses it. `out` is +1 for the right lobe, −1 the left.
 */
function lobeEnd(k: Circle, x: number, out: 1 | -1): { arc: Pt; end: Pt } {
  if ((k.c[0] - x) * out >= 0) {
    const bottom: Pt = [k.c[0], k.c[1] + k.r];
    return { arc: bottom, end: [x, bottom[1]] };
  }
  const p: Pt = [
    x,
    k.c[1] + Math.sqrt(Math.max(0, k.r * k.r - (x - k.c[0]) ** 2)),
  ];
  return { arc: p, end: p };
}
/**
 * The cloud's centreline scaled by k about CLOUD_C: centres and centreline
 * radii scale, each wall stays 2px. `close` (0–1, for the status layer)
 * runs the base's two stubs in across the opening, each from its own side,
 * at constant 2px with square ends; at 1 they meet and the base runs
 * through, as Carbon's cloud.
 */
export function cloud(k: number, close = 0): string {
  const sc = ({ c, r }: Circle, side: 1 | -1): Circle => ({
    c: [
      CLOUD_C[0] + k * (c[0] - CLOUD_C[0]),
      CLOUD_C[1] + k * (c[1] - CLOUD_C[1]),
    ],
    r: k * (r - side) + side,
  });
  const [to, ti, lo, li, ro, ri] = [
    sc(C_TOP_OUT, 1),
    sc(C_TOP_IN, -1),
    sc(C_LEFT_OUT, 1),
    sc(C_LEFT_IN, -1),
    sc(C_RIGHT_OUT, 1),
    sc(C_RIGHT_IN, -1),
  ];
  const mid = (CUT_L + CUT_R) / 2;
  const [cutL, cutR] =
    close > 0
      ? [
          CUT_L + (mid - CUT_L) * Math.min(1, close),
          CUT_R - (CUT_R - mid) * Math.min(1, close),
        ]
      : [CUT_L, CUT_R];
  const [rO, rI, lO, lI] = [
    lobeEnd(ro, cutR, 1),
    lobeEnd(ri, cutR, 1),
    lobeEnd(lo, cutL, -1),
    lobeEnd(li, cutL, -1),
  ];
  const [rJin, lJin, lJout, rJout] = [
    cross(ri, ti),
    cross(li, ti),
    cross(lo, to),
    cross(ro, to),
  ];
  if (close >= 1 - 1e-6) {
    // Closed: the outline and, wound against it, the inside, each with the base running straight through.
    return (
      `M${P(lO.arc)}${arcTo(lo, lO.arc, lJout, 1)}${arcTo(to, lJout, rJout, 1)}${arcTo(ro, rJout, rO.arc, 1)}L${P(lO.arc)}Z` +
      `M${P(rI.arc)}${arcTo(ri, rI.arc, rJin, 0)}${arcTo(ti, rJin, lJin, 0)}${arcTo(li, lJin, lI.arc, 0)}L${P(rI.arc)}Z`
    );
  }
  return (
    `M${P(rO.arc)}L${P(rO.end)}L${P(rI.end)}L${P(rI.arc)}${arcTo(ri, rI.arc, rJin, 0)}${arcTo(ti, rJin, lJin, 0)}${arcTo(li, lJin, lI.arc, 0)}` +
    `L${P(lI.end)}L${P(lO.end)}L${P(lO.arc)}${arcTo(lo, lO.arc, lJout, 1)}${arcTo(to, lJout, rJout, 1)}${arcTo(ro, rJout, rO.arc, 1)}Z`
  );
}
/** The middle of the cloud's base (its lobes' bottom centreline): the scale holds it. */
const CLOUD_C: Pt = [16, 21];
/** The cuts either side of the opening (Carbon's), held at every frame. */
const [CUT_L, CUT_R] = [9, 23];
/** The scale that moves the cloud's sides 1px (their centrelines sit 13 from the middle). */
export const CLOUD_K = 1 / 13;
