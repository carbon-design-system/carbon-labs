/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Pt } from './geometry';

/**
 * Cutting geometry instead of masking it.
 *
 * A centreline is a list of subpaths of segments (lines and circular arcs).
 * `cutSegs` removes the parts that fall inside a convex region (an
 * intersection of half-planes), so a stroke stops where a gap begins — the
 * stroke's butt end sits on the cut. `cutPoly` does the same to a filled
 * polygon, keeping its outline exact along the cut. Both work in screen
 * space, so the gap stays put while the artwork moves under it.
 */

export type Seg =
  | { k: 'L'; a: Pt; b: Pt }
  /** Arc about c, radius r, from angle t0 to t1 (radians; increasing = clockwise on screen). */
  | { k: 'A'; c: Pt; r: number; t0: number; t1: number };

/** The half-plane n·p ≥ c. */
export type HalfPlane = { n: Pt; c: number };

const inside = (p: Pt, hs: readonly HalfPlane[]) =>
  hs.every(({ n, c }) => n[0] * p[0] + n[1] * p[1] >= c);

/* @__NO_SIDE_EFFECTS__ */
export function at(s: Seg, t: number): Pt {
  if (s.k === 'L') {
    return [s.a[0] + (s.b[0] - s.a[0]) * t, s.a[1] + (s.b[1] - s.a[1]) * t];
  }
  const a = s.t0 + (s.t1 - s.t0) * t;
  return [s.c[0] + s.r * Math.cos(a), s.c[1] + s.r * Math.sin(a)];
}

/** The part of a segment between parameters t0 and t1. */
function sub(s: Seg, t0: number, t1: number): Seg {
  if (s.k === 'L') {
    return { k: 'L', a: at(s, t0), b: at(s, t1) };
  }
  return { ...s, t0: s.t0 + (s.t1 - s.t0) * t0, t1: s.t0 + (s.t1 - s.t0) * t1 };
}

/** Parameter intervals of `s` that lie outside the region. */
function outsideRuns(
  s: Seg,
  hs: readonly HalfPlane[]
): Array<[number, number]> {
  const N = s.k === 'L' ? 1 : 48;
  const isIn = (t: number) => inside(at(s, t), hs);
  // Find where inside-ness flips, sampling then refining by bisection.
  const flips: number[] = [];
  let prev = isIn(0);
  const samples = s.k === 'L' ? lineFlips(s, hs) : null;
  if (samples) {
    flips.push(...samples);
  } else {
    for (let i = 1; i <= N; i++) {
      const t = i / N;
      const cur = isIn(t);
      if (cur !== prev) {
        let [lo, hi] = [(i - 1) / N, t];
        for (let j = 0; j < 30; j++) {
          const mid = (lo + hi) / 2;
          if (isIn(mid) === prev) {
            lo = mid;
          } else {
            hi = mid;
          }
        }
        flips.push((lo + hi) / 2);
      }
      prev = cur;
    }
  }
  const edges = [0, ...flips, 1];
  const runs: Array<[number, number]> = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const [a, b] = [edges[i], edges[i + 1]];
    if (b - a > 1e-9 && !isIn((a + b) / 2)) {
      runs.push([a, b]);
    }
  }
  return runs;
}

/** Exact flips for a line segment: where it enters and leaves the convex region. */
function lineFlips(s: { a: Pt; b: Pt }, hs: readonly HalfPlane[]): number[] {
  let [lo, hi] = [0, 1];
  const [dx, dy] = [s.b[0] - s.a[0], s.b[1] - s.a[1]];
  for (const { n, c } of hs) {
    const v0 = n[0] * s.a[0] + n[1] * s.a[1] - c;
    const dv = n[0] * dx + n[1] * dy;
    if (Math.abs(dv) < 1e-12) {
      if (v0 < 0) {
        return [];
      } // parallel and outside: never inside
      continue;
    }
    const t = -v0 / dv;
    if (dv > 0) {
      lo = Math.max(lo, t);
    } else {
      hi = Math.min(hi, t);
    }
  }
  if (hi - lo <= 1e-9) {
    return [];
  }
  return [lo, hi].filter((t) => t > 1e-9 && t < 1 - 1e-9);
}

/** The centreline with everything inside the convex region removed. */
/* @__NO_SIDE_EFFECTS__ */
export function cutSegs(
  paths: readonly Seg[][],
  hs: readonly HalfPlane[]
): Seg[][] {
  const out: Seg[][] = [];
  for (const path of paths) {
    let cur: Seg[] = [];
    for (const s of path) {
      const runs = outsideRuns(s, hs);
      runs.forEach(([a, b], i) => {
        // A run that doesn't start at the segment's start begins a new subpath.
        if ((a > 1e-9 || i > 0) && cur.length) {
          out.push(cur);
          cur = [];
        }
        cur.push(sub(s, a, b));
      });
      // Ending inside the region breaks the subpath too.
      if (!runs.length || runs[runs.length - 1][1] < 1 - 1e-9) {
        if (cur.length) {
          out.push(cur);
        }
        cur = [];
      }
    }
    if (cur.length) {
      out.push(cur);
    }
  }
  return out;
}

const f = (n: number) => +n.toFixed(4);
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;

/** SVG path data for the subpaths (arcs stay true arcs). */
/* @__NO_SIDE_EFFECTS__ */
export function segsPath(paths: readonly Seg[][]): string {
  let d = '';
  for (const path of paths) {
    if (!path.length) {
      continue;
    }
    d += `M${P(at(path[0], 0))}`;
    for (const s of path) {
      if (s.k === 'L') {
        d += `L${P(s.b)}`;
      } else {
        const sweep = s.t1 > s.t0 ? 1 : 0;
        const large = Math.abs(s.t1 - s.t0) > Math.PI ? 1 : 0;
        d += `A${f(s.r)} ${f(s.r)} 0 ${large} ${sweep} ${P(at(s, 1))}`;
      }
    }
  }
  return d;
}

/** A similarity transform: scale s about `origin`, then rotate `deg` about `pivot`, then move by (tx, ty). */
export type Similarity = {
  s: number;
  origin: Pt;
  deg: number;
  pivot: Pt;
  tx: number;
  ty: number;
};

/* @__NO_SIDE_EFFECTS__ */
export function mapPt(p: Pt, m: Similarity): Pt {
  const [x, y] = [
    m.origin[0] + (p[0] - m.origin[0]) * m.s,
    m.origin[1] + (p[1] - m.origin[1]) * m.s,
  ];
  const a = (m.deg * Math.PI) / 180;
  const [u, v] = [x - m.pivot[0], y - m.pivot[1]];
  return [
    m.pivot[0] + u * Math.cos(a) - v * Math.sin(a) + m.tx,
    m.pivot[1] + u * Math.sin(a) + v * Math.cos(a) + m.ty,
  ];
}

/* @__NO_SIDE_EFFECTS__ */
export function mapSegs(paths: readonly Seg[][], m: Similarity): Seg[][] {
  const da = (m.deg * Math.PI) / 180;
  return paths.map((path) =>
    path.map(
      (s): Seg =>
        s.k === 'L'
          ? { k: 'L', a: mapPt(s.a, m), b: mapPt(s.b, m) }
          : {
              k: 'A',
              c: mapPt(s.c, m),
              r: s.r * m.s,
              t0: s.t0 + da,
              t1: s.t1 + da,
            }
    )
  );
}

/** One half-plane clip of a polygon (Sutherland–Hodgman step). */
function clipHalf(poly: readonly Pt[], { n, c }: HalfPlane): Pt[] {
  const v = (p: Pt) => n[0] * p[0] + n[1] * p[1] - c;
  const out: Pt[] = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const [vp, vq] = [v(p), v(q)];
    if (vp >= 0) {
      out.push(p);
    }
    if (vp >= 0 !== vq >= 0) {
      const t = vp / (vp - vq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  });
  return out;
}

const flip = ({ n, c }: HalfPlane): HalfPlane => ({ n: [-n[0], -n[1]], c: -c });

/**
 * A filled polygon minus the convex region, as pieces (one per half-plane:
 * outside it, but inside the ones before it, so they don't overlap).
 */
/* @__NO_SIDE_EFFECTS__ */
export function cutPoly(poly: readonly Pt[], hs: readonly HalfPlane[]): Pt[][] {
  const pieces: Pt[][] = [];
  hs.forEach((h, i) => {
    let piece: Pt[] = clipHalf(poly, flip(h));
    for (let j = 0; j < i && piece.length > 2; j++) {
      piece = clipHalf(piece, hs[j]);
    }
    if (piece.length > 2) {
      pieces.push(piece);
    }
  });
  return pieces;
}

/**
 * The outline of a closed polygon stroked `d` wide on each side with round
 * joins, filled — i.e. the polygon grown by `d`: edges offset outward, convex
 * corners rounded (sampled every `step` radians), reflex corners sharp.
 */
/* @__NO_SIDE_EFFECTS__ */
export function growPoly(
  pts: readonly Pt[],
  d: number,
  step = Math.PI / 90
): Pt[] {
  const n = pts.length;
  const area = pts.reduce(
    (s, p, i) => s + p[0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * p[1],
    0
  );
  const sign = area > 0 ? 1 : -1; // > 0: clockwise on screen
  const normal = (a: Pt, b: Pt): Pt => {
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const l = Math.hypot(dx, dy);
    return [(sign * dy) / l, (sign * -dx) / l]; // outward
  };
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2] = [pts[(i + n - 1) % n], pts[i], pts[(i + 1) % n]];
    const [n1, n2] = [normal(p0, p1), normal(p1, p2)];
    const turn = n1[0] * n2[1] - n1[1] * n2[0];
    if (turn * sign >= 0) {
      // Convex: round the corner from n1 to n2.
      const [a1, a2] = [Math.atan2(n1[1], n1[0]), Math.atan2(n2[1], n2[0])];
      let da = a2 - a1;
      if (sign > 0 && da < 0) {
        da += 2 * Math.PI;
      }
      if (sign < 0 && da > 0) {
        da -= 2 * Math.PI;
      }
      const k = Math.max(1, Math.ceil(Math.abs(da) / step));
      for (let j = 0; j <= k; j++) {
        const a = a1 + (da * j) / k;
        out.push([p1[0] + d * Math.cos(a), p1[1] + d * Math.sin(a)]);
      }
    } else {
      // Reflex: where the two offset edges meet.
      const [q1, q2]: [Pt, Pt] = [
        [p1[0] + n1[0] * d, p1[1] + n1[1] * d],
        [p1[0] + n2[0] * d, p1[1] + n2[1] * d],
      ];
      const [u, v]: [Pt, Pt] = [
        [p1[0] - p0[0], p1[1] - p0[1]],
        [p2[0] - p1[0], p2[1] - p1[1]],
      ];
      const t =
        ((q2[0] - q1[0]) * v[1] - (q2[1] - q1[1]) * v[0]) /
        (u[0] * v[1] - u[1] * v[0]);
      out.push([q1[0] + u[0] * t, q1[1] + u[1] * t]);
    }
  }
  return out;
}
