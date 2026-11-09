/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Link32 from '@carbon/icons/es/link/32.js';
import { carbonArt, HOVER, hoverIcon, type Shapes } from '../../engine';
import type { Pt } from '../../geometry';

/**
 * Link: two loops woven through each other. On hover the loops pull apart,
 * 1px per axis each along their shared diagonal, and the whole link grows a
 * little about its visual centre, each loop's far end reaching 1px further
 * out. The line stays 2px wide throughout: the loops are redrawn larger,
 * never scaled.
 *
 * Each loop has a gap where the other passes through it. The gap travels
 * with the loop passing through it, so the space round each crossing holds
 * as the loops move and grow.
 *
 * Each loop is one filled outline: the 2px band of a capsule (inner radius
 * 4, outer 6 at rest, as Carbon's) from one end of its gap round to the
 * other, closed by square cuts. At rest it is Carbon's Link exactly.
 *
 * Timing: the standard hover.
 */
const f = (n: number) => String(Math.round(n * 1e4) / 1e4);

const R = 5; // centreline radius; the line is 2 wide
export const SIDE = 8 * Math.SQRT2; // straight side between the two arc centres
export const ARC = Math.PI * R;
const LENGTH = 2 * SIDE + 2 * ARC;
const SLIDE = 2 * Math.SQRT2; // gap travel along its side at full hover

export interface Loop {
  /** Arc centres: the cut side runs from c1's end to c2's (in rest position). */
  c1: Pt;
  c2: Pt;
  /** Where the loop sits relative to its rest position: +1 moves (+t, −t), −1 (−t, +t). */
  sign: 1 | -1;
  /** The gap along the cut side, measured from its start (the reference's knockouts). */
  gap: [number, number];
}

export const LINKS: Loop[] = [
  // A (world centre 21,15): cut side from (17,19)'s end to (25,11)'s; gap 1.985–11.303 (knockout-2).
  { c1: [17, 19], c2: [25, 11], sign: 1, gap: [1.985, 11.303] },
  // B (world centre 11,18): cut side from (15,14)'s end to (7,22)'s; gap 3.0345–11.2845 (knockout-1).
  { c1: [15, 14], c2: [7, 22], sign: -1, gap: [3.0345, 11.2845] },
];

const TRAVEL = 1; // px per axis: A moves (+1, −1), B moves (−1, +1)

/** The link's visual centre (the middle of its bounds, x 1–31, y 5–28): the hover grows it about this point. */
export const CENTRE: Pt = [16, 16.5];
/**
 * How far each loop's far end reaches out as the link grows, and the growth
 * that gives: the far arc's centre sits 14.5/√2 from CENTRE along the loop's
 * axis, and its centreline R further, so that distance grows by LINK_REACH.
 */
export const LINK_REACH = 1;
export const LINK_GROW = LINK_REACH / (14.5 / Math.SQRT2 + R);
/** Where the other loop's bend crosses each cut side (its tip: R past its arc centre, 3/√2 along the side), measured as the gap. */
const CROSS = 3 / Math.SQRT2 + R;

/** A rest point grown k about CENTRE. */
const grown = ([x, y]: Pt, k: number): Pt => [
  CENTRE[0] + (x - CENTRE[0]) * k,
  CENTRE[1] + (y - CENTRE[1]) * k,
];

/**
 * A point at arc length `s` round the loop's centreline (from the cut side's
 * start: the cut side, the arc round c2, the far side, the arc round c1),
 * offset `o` outward (+1 outer edge, −1 inner edge), on the loop's
 * centreline grown `k` about CENTRE (arc lengths grow with it; the line's
 * width does not).
 */
function at(l: Loop, s: number, o: number, k: number): Pt {
  const [ux, uy] = [(l.c2[0] - l.c1[0]) / SIDE, (l.c2[1] - l.c1[1]) / SIDE];
  const [nx, ny] = [uy, -ux]; // the cut side's outward normal
  const [c1, c2] = [grown(l.c1, k), grown(l.c2, k)];
  const [side, arc, length, rc] = [SIDE * k, ARC * k, LENGTH * k, R * k];
  const r = rc + o;
  const t = ((s % length) + length) % length;
  if (t <= side) {
    return [c1[0] + ux * t + nx * r, c1[1] + uy * t + ny * r];
  }
  if (t <= side + arc) {
    return arcPt(c2, Math.atan2(ny, nx) + (t - side) / rc, r);
  }
  if (t <= 2 * side + arc) {
    const d = t - side - arc;
    return [c2[0] - ux * d - nx * r, c2[1] - uy * d - ny * r];
  }
  return arcPt(c1, Math.atan2(-ny, -nx) + (t - 2 * side - arc) / rc, r);
}
const arcPt = (c: Pt, a: number, r: number): Pt => [
  c[0] + r * Math.cos(a),
  c[1] + r * Math.sin(a),
];

/**
 * Arc-length breakpoints strictly between a and b, in order (or reverse
 * order): each segment's end, and each arc's midpoint. Arcs are drawn in
 * quarters because a half-circle's centre is ill-conditioned in its
 * endpoints (rounding them to 4 places moved it by 0.02).
 */
function breaks(a: number, b: number, g: number): number[] {
  const out: number[] = [];
  const length = LENGTH * g;
  const ends = [
    SIDE,
    SIDE + ARC / 2,
    SIDE + ARC,
    2 * SIDE + ARC,
    2 * SIDE + 1.5 * ARC,
    LENGTH,
  ].map((e) => e * g);
  for (
    let k = Math.floor(Math.min(a, b) / length) - 1;
    k <= Math.ceil(Math.max(a, b) / length);
    k++
  ) {
    for (const e of ends) {
      const v = k * length + e;
      if (v > Math.min(a, b) + 1e-6 && v < Math.max(a, b) - 1e-6) {
        out.push(v);
      }
    }
  }
  out.sort((x, y) => x - y);
  return a < b ? out : out.reverse();
}

/** Whether arc length s (between breakpoints) lies on one of the arcs of the loop grown k. */
const onArc = (s: number, k: number) => {
  const t = (((s / k) % LENGTH) + LENGTH) % LENGTH;
  return (t > SIDE && t < SIDE + ARC) || t > 2 * SIDE + ARC;
};

/** One edge (offset o) of the loop grown k, from arc length a to b, as path commands after a moveto/lineto at a. */
function edge(
  l: Loop,
  a: number,
  b: number,
  o: number,
  k: number,
  move: (p: Pt) => Pt
): string {
  let d = '';
  let prev = a;
  for (const s of [...breaks(a, b, k), b]) {
    const [x, y] = move(at(l, s, o, k));
    if (onArc((prev + s) / 2, k)) {
      const r = f(R * k + o);
      // Forward round the loop turns clockwise on screen (sweep 1).
      d += `A${r} ${r} 0 0 ${b > a ? 1 : 0} ${f(x)} ${f(y)}`;
    } else {
      d += `L${f(x)} ${f(y)}`;
    }
    prev = s;
  }
  return d;
}

/**
 * The loop's 2px band from arc length `from` to `to` (from < to), its
 * centreline grown `k` about CENTRE, then moved (dx, dy), as one closed
 * outline with square ends.
 */
export function loopPath(
  l: Loop,
  from: number,
  to: number,
  dx: number,
  dy = -dx,
  k = 1
): string {
  const move = ([x, y]: Pt): Pt => [x + dx, y + dy];
  const [ox, oy] = move(at(l, from, 1, k));
  const [ix, iy] = move(at(l, to, -1, k));
  return `M${f(ox)} ${f(oy)}${edge(l, from, to, 1, k, move)}L${f(ix)} ${f(iy)}${edge(l, to, from, -1, k, move)}Z`;
}

/**
 * The link grown `k` about CENTRE and moved `t` px per axis along its drift
 * (Link's hover), with its gap slid `slide` (default: with it, as the hover
 * does). The gap rides the crossing as the link grows, keeping its length,
 * so the space either side of the other loop holds. One closed outline round
 * the loop, from its gap's end back to its start.
 */
export function linkPathAt(l: Loop, t: number, slide = t, k = 1): string {
  const shift = (k - 1) * CROSS - SLIDE * slide;
  return loopPath(
    l,
    l.gap[1] + shift,
    l.gap[0] + shift + LENGTH * k,
    l.sign * t,
    -l.sign * t,
    k
  );
}

/** The link at hover progress h: pulled apart h px per axis and grown LINK_GROW × h. */
export function linkPath(l: Loop, h: number): string {
  return linkPathAt(l, h * TRAVEL, h * TRAVEL, 1 + LINK_GROW * h);
}

/** Both links at hover progress h. */
function linkShapes({ h }: { h: number }): Shapes {
  return { a: { d: linkPath(LINKS[0], h) }, b: { d: linkPath(LINKS[1], h) } };
}

export const LinkSpec = /* @__PURE__ */ hoverIcon('Link', {
  geo: linkShapes,
  hover: HOVER,
  static: /* @__PURE__ */ carbonArt(Link32),
});
