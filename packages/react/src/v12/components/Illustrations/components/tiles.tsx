/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { clamp01 } from '@carbon-labs/v12-motion';

/* The line illustrations' shared construction: the isometric projection, boxes and
 * hidden lines. No fills: each layer's `hides` outline removes the lines behind it. */

/** A tile top's half width to half height: 44 to 25, about 30°. */
export const TILE_RATIO = 25 / 44;

export type Pt = [number, number];

/**
 * The isometric projection about a ground point (cx, cy): `a` runs toward the
 * front-right, `b` toward the back-right, `z` straight up, in the drawing's
 * units. A vertical edge falls at x = cx + a + b.
 */
export type Iso = (a: number, b: number, z?: number) => Pt;
export const isoAt =
  (cx: number, cy: number): Iso =>
  (a, b, z = 0) => [cx + a + b, cy + (a - b) * TILE_RATIO - z];

/** One layer: its lines (open polylines), its class, and the outline that hides what's behind it. */
export interface Layer {
  lines: Pt[][];
  className?: string;
  /** Rings, even-odd: a lens's ring is its two circles. */
  hides?: Pt[][];
}

/** Points along f(t) from `from` to `to`, in n steps. */
export const ring = (
  n: number,
  f: (t: number) => Pt,
  from = 0,
  to = Math.PI * 2
): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => f(from + ((to - from) * i) / n));

/** A closed polyline: its first point again at its end. */
export const closed = (p: Pt[]): Pt[] => [...p, p[0]!];

/** A keyhole on a face: a round head over a tapered slot, one outline. `at(u, v)` maps the face's plane. */
export function keyhole(
  at: (u: number, v: number) => Pt,
  v: number,
  r: number,
  depth: number,
  top: number,
  foot: number
): Pt[] {
  const join = Math.asin(top / r); // where the slot meets the head
  const head = ring(
    24,
    (t) => at(r * Math.sin(t), v + r * Math.cos(t)),
    Math.PI - join,
    -Math.PI + join
  );
  return closed([...head, at(-foot, v - depth), at(foot, v - depth)]);
}

/** A box's visible lines (its silhouette and the three edges at its near top corner), hiding what's behind it. */
export function box(
  iso: Iso,
  [a0, a1]: [number, number],
  [b0, b1]: [number, number],
  [z0, z1]: [number, number],
  className?: string
): Layer {
  const outline = [
    iso(a0, b0, z1),
    iso(a0, b1, z1),
    iso(a1, b1, z1),
    iso(a1, b1, z0),
    iso(a1, b0, z0),
    iso(a0, b0, z0),
  ];
  const near = iso(a1, b0, z1);
  return {
    lines: [
      closed(outline),
      [iso(a0, b0, z1), near, iso(a1, b1, z1)],
      [near, iso(a1, b0, z0)],
    ],
    className,
    hides: [outline],
  };
}

/** A prism on a flat outline (a, b) from z0 to z1: its sides, then its top, which hides its back edges. */
export function prism(
  iso: Iso,
  shape: Pt[],
  [z0, z1]: [number, number],
  className?: string,
  topClassName = className
): Layer[] {
  const bottom = shape.map(([a, b]) => iso(a, b, z0));
  const top = shape.map(([a, b]) => iso(a, b, z1));
  return [
    {
      lines: [closed(bottom), ...shape.map((_, i) => [bottom[i]!, top[i]!])],
      className,
      hides: [hull([...bottom, ...top])],
    },
    { lines: [closed(top)], className: topClassName, hides: [top] },
  ];
}

/** The convex hull of a set of points. */
export function hull(p: Pt[]): Pt[] {
  const s = [...p].sort((u, v) => u[0] - v[0] || u[1] - v[1]);
  const cross = (o: Pt, u: Pt, v: Pt) =>
    (u[0] - o[0]) * (v[1] - o[1]) - (u[1] - o[1]) * (v[0] - o[0]);
  const half = (list: Pt[]) => {
    const h: Pt[] = [];
    for (const q of list) {
      while (h.length >= 2 && cross(h[h.length - 2]!, h[h.length - 1]!, q) <= 0)
        h.pop();
      h.push(q);
    }
    return h.slice(0, -1);
  };
  return [...half(s), ...half([...s].reverse())];
}

/** Inside the rings (even-odd) and not within `eps` of an edge: a line on an outline stays. */
function covered(p: Pt, rings: Pt[][], eps: number): boolean {
  let inside = false;
  for (const r of rings) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i]!;
      const [xj, yj] = r[j]!;
      const dx = xj - xi;
      const dy = yj - yi;
      const t = Math.max(
        0,
        Math.min(
          1,
          ((p[0] - xi) * dx + (p[1] - yi) * dy) / (dx * dx + dy * dy || 1)
        )
      );
      if (Math.hypot(p[0] - xi - t * dx, p[1] - yi - t * dy) < eps)
        return false;
      if (yi > p[1] !== yj > p[1] && p[0] < (dx * (p[1] - yi)) / dy + xi)
        inside = !inside;
    }
  }
  return inside;
}

const lerp = (p: Pt, q: Pt, t: number): Pt => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
];

/** A layer's lines less the parts later layers hide, as path data. */
function visible(
  lines: Pt[][],
  occluders: Pt[][][],
  step: number,
  eps: number
): string {
  const hidden = (p: Pt) => occluders.some((o) => covered(p, o, eps));
  const runs: Pt[][] = [];
  for (const line of lines) {
    let run: Pt[] | null = null;
    for (let i = 0; i < line.length - 1; i++) {
      const p = line[i]!;
      const q = line[i + 1]!;
      const n = Math.max(
        1,
        Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / step)
      );
      // The boundary between a shown and a hidden sample, by halving.
      const edge = (shown: number, gone: number) => {
        let [s, g] = [clamp01(shown), clamp01(gone)];
        for (let j = 0; j < 12; j++) {
          const mid = (s + g) / 2;
          if (hidden(lerp(p, q, mid))) g = mid;
          else s = mid;
        }
        return lerp(p, q, s);
      };
      for (let k = 0; k < n; k++) {
        const at = (k + 0.5) / n;
        const show = !hidden(lerp(p, q, at));
        if (show && !run) {
          run = [edge(at, (k - 0.5) / n)];
          runs.push(run);
        } else if (!show && run) {
          run.push(edge((k - 0.5) / n, at));
          run = null;
        }
      }
      if (run) run.push(q);
    }
  }
  const f = (v: number) => +v.toFixed(2);
  return runs
    .filter((r) => r.length > 1)
    .map((r) =>
      r.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('')
    )
    .join('');
}

/** One drawn path: a layer's class and its visible lines. */
interface Drawn {
  className?: string;
  d: string;
}

/** Each drawing's paths, per kind: worked out on its first render and kept, since a kind's drawing never changes. */
const drawn = new WeakMap<(kind: never) => Layer[], Map<string, Drawn[]>>();

function paths<K extends string>(
  draw: (kind: K) => Layer[],
  kind: K,
  step: number,
  eps: number
): Drawn[] {
  let byKind = drawn.get(draw);
  if (!byKind) drawn.set(draw, (byKind = new Map()));
  const key = `${kind} ${step} ${eps}`;
  let out = byKind.get(key);
  if (!out) {
    const layers = draw(kind);
    out = layers.flatMap((layer, i) => {
      const occluders = layers
        .slice(i + 1)
        .flatMap((l) => (l.hides ? [l.hides] : []));
      const d = visible(layer.lines, occluders, step, eps);
      return d ? [{ className: layer.className, d }] : [];
    });
    byKind.set(key, out);
  }
  return out;
}

/** `draw(kind)`'s layers, back to front, as paths less what later layers hide; once per kind,
 *  so `draw` is a fixed function, never one made per render. */
export function HiddenLines<K extends string>({
  draw,
  kind,
  step = 0.25,
  eps = 0.3,
}: {
  draw: (kind: K) => Layer[];
  kind: K;
  step?: number;
  eps?: number;
}) {
  return (
    <>
      {paths(draw, kind, step, eps).map((p, i) => (
        <path key={i} className={p.className} d={p.d} />
      ))}
    </>
  );
}
