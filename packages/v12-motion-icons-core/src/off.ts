/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Pt } from './geometry';
import { cutPoly, cutSegs, mapSegs, type HalfPlane, type Seg } from './cut';
import { f } from './paint';

/**
 * "Off" icons: a base drawing under a slash.
 *
 * On hover the base shrinks about its visual centre (90%, the set-wide
 * Off rule) at constant 2px line weight, and the slash extends 1px at each
 * end. Carbon cuts a gap through the base on one side of the slash; the gap
 * is a fixed strip parallel to the slash, so the base moves under it and its
 * cut edges stay flush with the strip.
 *
 * The base is its 2px centrelines (`strokes`). Each centreline is cut
 * through the slash and part-way into the gap, outlined at 2px (miter
 * joins, butt ends), and the outline is then cut flush along the gap's
 * edges. Closed centrelines the slash never reaches are drawn as rings.
 */

export const OFF_SHRINK = 0.1;
export const SLASH_REACH = 1;

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const unit = (a: Pt, b: Pt): Pt => {
  const [dx, dy] = sub(b, a);
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
};
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
/** Polygon path data, wound clockwise so overlapping pieces union under nonzero fill. */
const polyD = (pts: readonly Pt[]) => {
  if (pts.length < 3) {
    return '';
  }
  const area = pts.reduce(
    (a, p, i) =>
      a +
      p[0] * pts[(i + 1) % pts.length][1] -
      pts[(i + 1) % pts.length][0] * p[1],
    0
  );
  const cw = area >= 0 ? pts : [...pts].reverse();
  return `M${cw.map(P).join('L')}Z`;
};
/** As polyD, keeping the winding (for evenodd rings). */
const loopD = (pts: readonly Pt[]) =>
  pts.length > 2 ? `M${pts.map(P).join('L')}Z` : '';

/**
 * Centreline segments for a polyline with its corners filleted at radius r
 * (outer r+1 at 2px): one radius for every corner, or one per point (0 for a
 * sharp corner; for an open line the end points' entries are ignored).
 */
/* @__NO_SIDE_EFFECTS__ */
export function filletSegs(
  pts: readonly Pt[],
  radius: number | readonly number[],
  closed = false
): Seg[] {
  const n = pts.length;
  const rOf = (i: number) => (typeof radius === 'number' ? radius : radius[i]);
  const corner = (i: number) => {
    const r = rOf(i);
    const [p0, p1, p2] = [pts[(i + n - 1) % n], pts[i], pts[(i + 1) % n]];
    const [u, v] = [unit(p1, p0), unit(p1, p2)];
    const half =
      Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1]))) / 2;
    const t = r / Math.tan(half);
    const a: Pt = [p1[0] + u[0] * t, p1[1] + u[1] * t];
    const b: Pt = [p1[0] + v[0] * t, p1[1] + v[1] * t];
    // The arc's centre is r along the bisector, past the corner's tangent points.
    const bis = unit([0, 0], [u[0] + v[0], u[1] + v[1]]);
    const d = r / Math.sin(half);
    const c: Pt = [p1[0] + bis[0] * d, p1[1] + bis[1] * d];
    const t0 = Math.atan2(a[1] - c[1], a[0] - c[0]);
    let t1 = Math.atan2(b[1] - c[1], b[0] - c[0]);
    while (t1 - t0 > Math.PI) {
      t1 -= 2 * Math.PI;
    }
    while (t0 - t1 > Math.PI) {
      t1 += 2 * Math.PI;
    }
    return { a, b, arc: { k: 'A', c, r, t0, t1 } as Seg };
  };
  const segs: Seg[] = [];
  const idx = closed
    ? [...Array(n).keys()]
    : [...Array(n - 2).keys()].map((i) => i + 1);
  const corners = idx.map((i) => ({ i, ...corner(i) }));
  let prev: Pt = closed ? corners[corners.length - 1].b : pts[0];
  for (const c of corners) {
    if (rOf(c.i) > 0) {
      segs.push({ k: 'L', a: prev, b: c.a }, c.arc);
      prev = c.b;
    } else {
      segs.push({ k: 'L', a: prev, b: pts[c.i] });
      prev = pts[c.i];
    }
  }
  // A closed loop already ends where it began (the last corner's far side).
  if (!closed) {
    segs.push({ k: 'L', a: prev, b: pts[n - 1] });
  }
  return segs;
}

/** An arc centreline about c, radius r, between angles (degrees, clockwise on screen). */
/* @__NO_SIDE_EFFECTS__ */
export const arcSeg = (c: Pt, r: number, from: number, to: number): Seg => ({
  k: 'A',
  c,
  r,
  t0: (from * Math.PI) / 180,
  t1: (to * Math.PI) / 180,
});

/** Sample a subpath into points (arcs every ~3°). */
function sample(path: readonly Seg[]): Pt[] {
  const out: Pt[] = [];
  const push = (p: Pt) => {
    const q = out[out.length - 1];
    if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-6) {
      out.push(p);
    }
  };
  for (const s of path) {
    if (s.k === 'L') {
      push(s.a);
      push(s.b);
    } else {
      const k = Math.max(2, Math.ceil(Math.abs(s.t1 - s.t0) / (Math.PI / 60)));
      for (let i = 0; i <= k; i++) {
        const a = s.t0 + ((s.t1 - s.t0) * i) / k;
        push([s.c[0] + s.r * Math.cos(a), s.c[1] + s.r * Math.sin(a)]);
      }
    }
  }
  return out;
}

/** One side of a polyline offset by d: miter joins (limited), or round on this side's outer turns if `round`. */
function offsetSide(
  pts: readonly Pt[],
  d: number,
  closed: boolean,
  round = false
): Pt[] {
  const n = pts.length;
  const out: Pt[] = [];
  const normal = (a: Pt, b: Pt): Pt => {
    const [ux, uy] = unit(a, b);
    return [-uy, ux];
  };
  for (let i = 0; i < n; i++) {
    const hasPrev = closed || i > 0;
    const hasNext = closed || i < n - 1;
    const p = pts[i];
    const n0 = hasPrev ? normal(pts[(i + n - 1) % n], p) : null;
    const n1 = hasNext ? normal(p, pts[(i + 1) % n]) : null;
    if (!n0 || !n1) {
      const m = (n0 ?? n1)!;
      out.push([p[0] + m[0] * d, p[1] + m[1] * d]);
      continue;
    }
    const cross = n0[0] * n1[1] - n0[1] * n1[0];
    if (round && d * cross < -1e-9) {
      // This side is the outside of the turn: a round join.
      const a0 = Math.atan2(n0[1] * d, n0[0] * d);
      let a1 = Math.atan2(n1[1] * d, n1[0] * d);
      while (a1 - a0 > Math.PI) {
        a1 -= 2 * Math.PI;
      }
      while (a0 - a1 > Math.PI) {
        a1 += 2 * Math.PI;
      }
      const k = Math.max(1, Math.ceil(Math.abs(a1 - a0) / (Math.PI / 30)));
      for (let j = 0; j <= k; j++) {
        const t = a0 + ((a1 - a0) * j) / k;
        out.push([
          p[0] + Math.abs(d) * Math.cos(t),
          p[1] + Math.abs(d) * Math.sin(t),
        ]);
      }
      continue;
    }
    const m: Pt = [n0[0] + n1[0], n0[1] + n1[1]];
    const ml = Math.hypot(m[0], m[1]);
    // Miter length d / cos(θ/2); past 10d (sharper than ~11°), bevel instead.
    const half = Math.sqrt(
      Math.max(0, (1 + (n0[0] * n1[0] + n0[1] * n1[1])) / 2)
    );
    if (half < 0.1 || ml < 1e-9) {
      out.push(
        [p[0] + n0[0] * d, p[1] + n0[1] * d],
        [p[0] + n1[0] * d, p[1] + n1[1] * d]
      );
    } else {
      out.push([
        p[0] + (m[0] / ml) * (d / half),
        p[1] + (m[1] / ml) * (d / half),
      ]);
    }
  }
  return out;
}

/**
 * A 2px stroke's outline: one polygon for an open centreline, [left, right]
 * loops for a closed one. `round`: which side (+1 left, −1 right) gets round
 * joins at its outer turns (Carbon rounds an outline's outer corners and
 * keeps its inner ones sharp); 2 rounds both, as a stroke's round join does.
 */
/* @__NO_SIDE_EFFECTS__ */
export function strokeOutline(
  path: readonly Seg[],
  w = 2,
  round: 0 | 1 | -1 | 2 = 0
): { open?: Pt[]; loops?: [Pt[], Pt[]] } {
  const pts = sample(path);
  const first = pts[0];
  const last = pts[pts.length - 1];
  const closed = Math.hypot(first[0] - last[0], first[1] - last[1]) < 1e-6;
  const [rl, rr] = [round === 1 || round === 2, round === -1 || round === 2];
  if (closed) {
    const ring = pts.slice(0, -1);
    return {
      loops: [
        offsetSide(ring, w / 2, true, rl),
        offsetSide(ring, -w / 2, true, rr),
      ],
    };
  }
  return {
    open: [
      ...offsetSide(pts, w / 2, false, rl),
      ...offsetSide(pts, -w / 2, false, rr).reverse(),
    ],
  };
}

export interface Slash {
  /** The slash's centreline ends (it's 2px wide, butt ends). */
  a: Pt;
  b: Pt;
  /** Which side of the slash Carbon cuts its gap on (+1 along the slash's left normal, -1 right), and how wide. */
  gapSide: 1 | -1;
  gap: number;
}

/** The slash's frame: unit direction, left normal, and the centreline's offset along the normal. */
function frame(s: Slash) {
  const u = unit(s.a, s.b);
  const n: Pt = [-u[1], u[0]];
  return { u, n, c: n[0] * s.a[0] + n[1] * s.a[1] };
}

/** The slash band, extended `reach` px at each end; drawn from a to `t` of the way to b. */
/* @__NO_SIDE_EFFECTS__ */
export function slashPath(s: Slash, reach: number, t = 1): string {
  const { u, n } = frame(s);
  const a: Pt = [s.a[0] - u[0] * reach, s.a[1] - u[1] * reach];
  const full: Pt = [s.b[0] + u[0] * reach, s.b[1] + u[1] * reach];
  const b: Pt = [a[0] + (full[0] - a[0]) * t, a[1] + (full[1] - a[1]) * t];
  if (t <= 1e-4) {
    return '';
  }
  return polyD([
    [a[0] + n[0], a[1] + n[1]],
    [b[0] + n[0], b[1] + n[1]],
    [b[0] - n[0], b[1] - n[1]],
    [a[0] - n[0], a[1] - n[1]],
  ]);
}

/**
 * A base centreline, optionally `square`: its gap-side ends are square
 * (butt) where it reaches `square` side units (Carbon cuts some walls
 * across themselves rather than along the gap), instead of flush with the
 * gap; optionally `round`: which side of it gets round outer corners (see
 * strokeOutline).
 */
export type OffStroke =
  | Seg[]
  | { path: Seg[]; square?: number; round?: 0 | 1 | -1 | 2 };
type Item = { path: Seg[]; square?: number; round: 0 | 1 | -1 | 2 };
const item = (st: OffStroke): Item =>
  Array.isArray(st)
    ? { path: st, round: 0 }
    : { path: st.path, square: st.square, round: st.round ?? 0 };

/**
 * The base cut by the slash and its gap, as path data: `fill` (cut pieces,
 * nonzero) and `rings` (uncut closed strokes, evenodd). `drawn` (0–1): how
 * far the slash has drawn from a towards b; the cuts stop at its head.
 */
/* @__NO_SIDE_EFFECTS__ */
export function cutBase(
  strokes: readonly OffStroke[],
  slash: Slash,
  drawn = 1,
  reach = 0
): { fill: string; rings: string } {
  const { u, n, c } = frame(slash);
  const s = slash.gapSide;
  // Side units v = s·(n·p − c): the slash is v ∈ [−1, 1], the gap v ∈ [1, 1 + gap].
  const len =
    Math.hypot(slash.b[0] - slash.a[0], slash.b[1] - slash.a[1]) + 2 * reach;
  const head = u[0] * slash.a[0] + u[1] * slash.a[1] - reach + len * drawn;
  const tail = u[0] * slash.a[0] + u[1] * slash.a[1] - reach - 2;
  const hp = (lo: number, hi: number): HalfPlane[] => [
    { n: [s * n[0], s * n[1]], c: s * c + lo }, // v ≥ lo
    { n: [-s * n[0], -s * n[1]], c: -(s * c + hi) }, // v ≤ hi
    { n: [-u[0], -u[1]], c: -head }, // up to the slash's head
    { n: [u[0], u[1]], c: tail },
  ];
  const v = (p: Pt) => s * (n[0] * p[0] + n[1] * p[1] - c);
  const gapEdge = 1 + slash.gap;
  // Centrelines stop inside the slash (so the touching side reaches its far
  // edge) and 1.3px into the gap (so the gap side's outline can be cut flush).
  const pre = hp(0, gapEdge - 1.3);
  const gapRegion = hp(1, gapEdge);
  let fill = '';
  let rings = '';
  const emit = (
    o: { open?: Pt[]; loops?: [Pt[], Pt[]] },
    flush: boolean,
    cutIt: boolean
  ) => {
    if (o.loops && !cutIt) {
      rings += loopD(o.loops[0]) + loopD(o.loops[1]);
    } else {
      for (const poly of o.open ? [o.open] : (o.loops ?? [])) {
        if (!flush) {
          fill += polyD(poly);
        } else {
          for (const piece of cutPoly(poly, gapRegion)) {
            fill += polyD(piece);
          }
        }
      }
    }
  };
  if (drawn <= 1e-4) {
    for (const st of strokes) {
      const { path, round } = item(st);
      emit(strokeOutline(path, 2, round), false, false);
    }
    return { fill, rings };
  }
  for (const st of strokes) {
    const { path, square, round } = item(st);
    const cut = square === undefined ? pre : hp(0, square);
    const pts = sample(path);
    // Does it come near the slash or the gap (a segment can cross between vertices)?
    const vs = pts.map(v);
    const touches = Math.min(...vs) < gapEdge + 1.5 && Math.max(...vs) > -2.5;
    const isClosed =
      Math.hypot(
        pts[0][0] - pts[pts.length - 1][0],
        pts[0][1] - pts[pts.length - 1][1]
      ) < 1e-6;
    if (!touches) {
      emit(strokeOutline(path, 2, round), false, false);
      continue;
    }
    // A closed centreline is opened where the cut crosses it: start it inside
    // the cut, so its pieces don't meet end to end at an arbitrary seam.
    let segs = path;
    if (isClosed) {
      const start = segs.findIndex((sg) => {
        const p = sample([sg])[0];
        return v(p) >= 0 && v(p) <= (square ?? gapEdge - 1.3);
      });
      if (start > 0) {
        segs = [...segs.slice(start), ...segs.slice(0, start)];
      }
    }
    let pieces = cutSegs([segs], cut);
    // A closed centreline cut once wraps round: rejoin its last piece to its first.
    if (isClosed && pieces.length > 1) {
      const [h0, t0] = [
        sample(pieces[0])[0],
        sample(pieces[pieces.length - 1]).slice(-1)[0],
      ];
      if (Math.hypot(h0[0] - t0[0], h0[1] - t0[1]) < 1e-6) {
        pieces = [
          [...pieces[pieces.length - 1], ...pieces[0]],
          ...pieces.slice(1, -1),
        ];
      }
    }
    const uncut =
      isClosed && pieces.length === 1 && pieces[0].length === segs.length;
    for (const piece of pieces) {
      emit(strokeOutline(piece, 2, round), square === undefined, !uncut);
    }
  }
  return { fill, rings };
}

/** The base scaled by k about `centre`, then cut (see cutBase). */
/* @__NO_SIDE_EFFECTS__ */
export function offBase(
  strokes: readonly OffStroke[],
  slash: Slash,
  k: number,
  centre: Pt
): { fill: string; rings: string } {
  const m = { s: k, origin: centre, deg: 0, pivot: centre, tx: 0, ty: 0 };
  return cutBase(
    strokes.map((st) => {
      const it = item(st);
      return {
        path: mapSegs([it.path], m)[0],
        square: it.square,
        round: it.round,
      };
    }),
    slash
  );
}

/**
 * A centreline with convex regions cut away, flush: its 2px outline loses
 * exactly each region (the cut edges land on the region's sides, whatever
 * angle the line crosses at). Each region is a set of half-planes n·p ≥ c.
 * A closed centreline that no region touches stays a ring (`rings`, evenodd).
 * Replaces mask knockouts.
 */
/* @__NO_SIDE_EFFECTS__ */
export function cutAway(
  path: readonly Seg[],
  regions: readonly HalfPlane[][],
  round: 0 | 1 | -1 | 2 = 0
): { fill: string; rings: string } {
  // The centreline is cut 1.3px inside each region, so its ends reach past
  // the region's sides and the outline can be cut flush there.
  const pre = regions.map((hs) => hs.map(({ n, c }) => ({ n, c: c + 1.3 })));
  const inside = (p: Pt, hs: readonly HalfPlane[]) =>
    hs.every(({ n, c }) => n[0] * p[0] + n[1] * p[1] >= c);
  const pts = sample(path);
  const isClosed =
    Math.hypot(
      pts[0][0] - pts[pts.length - 1][0],
      pts[0][1] - pts[pts.length - 1][1]
    ) < 1e-6;
  let segs: Seg[] = [...path];
  if (isClosed) {
    const start = segs.findIndex((sg) =>
      pre.some((hs) => inside(sample([sg])[0], hs))
    );
    if (start > 0) {
      segs = [...segs.slice(start), ...segs.slice(0, start)];
    }
  }
  let pieces: Seg[][] = [segs];
  for (const hs of pre) {
    pieces = cutSegs(pieces, hs);
  }
  if (isClosed && pieces.length > 1) {
    const [h0, t0] = [
      sample(pieces[0])[0],
      sample(pieces[pieces.length - 1]).slice(-1)[0],
    ];
    if (Math.hypot(h0[0] - t0[0], h0[1] - t0[1]) < 1e-6) {
      pieces = [
        [...pieces[pieces.length - 1], ...pieces[0]],
        ...pieces.slice(1, -1),
      ];
    }
  }
  const uncut =
    isClosed && pieces.length === 1 && pieces[0].length === segs.length;
  let fill = '';
  let rings = '';
  for (const piece of pieces) {
    const o = strokeOutline(piece, 2, round);
    if (uncut && o.loops) {
      rings += loopD(o.loops[0]) + loopD(o.loops[1]);
      continue;
    }
    let polys = o.open ? [o.open] : (o.loops ?? []);
    for (const hs of regions) {
      polys = polys.flatMap((q) => (q.length > 2 ? cutPoly(q, hs) : []));
    }
    fill += polys.map(polyD).join('');
  }
  return { fill, rings };
}

/** A centreline drawn as its 2px outline (miter joins, butt ends): exact corners at any size. */
/* @__NO_SIDE_EFFECTS__ */
export function outlineD(path: readonly Seg[], w = 2): string {
  const o = strokeOutline(path, w);
  return o.loops
    ? loopD(o.loops[0]) + loopD(o.loops[1])
    : o.open
      ? polyD(o.open)
      : '';
}
