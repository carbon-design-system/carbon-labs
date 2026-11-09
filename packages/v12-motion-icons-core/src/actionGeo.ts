/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Geometry helpers for actions (engine/action.ts): phases of action time,
 * the out-and-back pass, rigid moves, and the cut at the 36×36 box.
 *
 * The box: an icon's ink may reach 2px past its 32 frame on every side
 * (−2 to 34), as hover may. A part flying out of the frame is cut there as
 * geometry: each of its outlines is clipped against the box, so what's left
 * keeps its 2px walls and simply ends at the edge. No masks, no clip paths.
 */
import { ENTRANCE, EXIT } from './ease';
import { mapPath, pathPoints, polyPath, type Pt } from './geometry';
import { motionTokens } from './tokens';

/** The 36×36 box an icon's ink stays inside (the 32 frame, 2px either side). */
export const BOX = { min: -2, max: 34 } as const;

/** Progress (0 → 1) through the phase [from, to] of action time `a`. */
/* @__NO_SIDE_EFFECTS__ */
export function phase(a: number, from: number, to: number): number {
  return Math.min(1, Math.max(0, (a - from) / (to - from)));
}

/**
 * The out-and-back pass: out in Carbon's fast-01 (80ms) on the exit easing,
 * back in moderate-01 (160ms) on the entrance easing, Carbon's productive
 * curves. OUT_BACK is the pass in seconds, OUT_SPLIT where it turns.
 */
const OUT_MS = motionTokens.duration.fast01;
const BACK_MS = motionTokens.duration.moderate01;
export const OUT_BACK = (OUT_MS + BACK_MS) / 1000;
export const OUT_SPLIT = OUT_MS / (OUT_MS + BACK_MS);

/**
 * Out and back over a pass (0 → 1 → 0): out until `split` on the productive
 * exit (it speeds up as it leaves rest), back on the productive entrance (it
 * lands), no bounce.
 */
/* @__NO_SIDE_EFFECTS__ */
export function outAndBack(a: number, split: number = OUT_SPLIT): number {
  return a < split
    ? EXIT(phase(a, 0, split))
    : 1 - ENTRANCE(phase(a, split, 1));
}

/** A path moved by (dx, dy) (rigid: arcs and weights unchanged). */
/* @__NO_SIDE_EFFECTS__ */
export function movePathBy(d: string, dx: number, dy: number): string {
  if (!dx && !dy) {
    return d;
  }
  return mapPath(d, ([x, y]) => [x + dx, y + dy]);
}

/** An axis-aligned clip rectangle. */
type Rect = { x0: number; y0: number; x1: number; y1: number };
const BOX_RECT: Rect = { x0: BOX.min, y0: BOX.min, x1: BOX.max, y1: BOX.max };
/** The 36×36 box with some of its edges moved in (a part cut at its own edge as well as the box's). */
/* @__NO_SIDE_EFFECTS__ */
export const boxWith = (r: Partial<Rect>): Rect => ({ ...BOX_RECT, ...r });

/** A closed polygon clipped to a rectangle (Sutherland–Hodgman, one edge at a time). */
function clipPoly(pts: Pt[], r: Rect = BOX_RECT): Pt[] {
  const edges: [(p: Pt) => boolean, (a: Pt, b: Pt) => Pt][] = [
    [(p) => p[0] >= r.x0, (a, b) => at(a, b, (r.x0 - a[0]) / (b[0] - a[0]))],
    [(p) => p[0] <= r.x1, (a, b) => at(a, b, (r.x1 - a[0]) / (b[0] - a[0]))],
    [(p) => p[1] >= r.y0, (a, b) => at(a, b, (r.y0 - a[1]) / (b[1] - a[1]))],
    [(p) => p[1] <= r.y1, (a, b) => at(a, b, (r.y1 - a[1]) / (b[1] - a[1]))],
  ];
  let out = pts;
  for (const [inside, cross] of edges) {
    const src = out;
    out = [];
    for (let i = 0; i < src.length; i++) {
      const [p, q] = [src[i], src[(i + 1) % src.length]];
      if (inside(q)) {
        if (!inside(p)) {
          out.push(cross(p, q));
        }
        out.push(q);
      } else if (inside(p)) {
        out.push(cross(p, q));
      }
    }
    if (!out.length) {
      return out;
    }
  }
  return out;
}
const at = (a: Pt, b: Pt, t: number): Pt => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

/** An axis-aligned window a part is cut to (`cutTo`): the box, or a part's own edge (a tray's floor, a feed line). */
export type CutRect = Rect;

/**
 * A filled path cut to the rectangle `r`, as geometry. Inside it the path is
 * returned as it is (arcs and all); crossing an edge, each subpath (an
 * outline, or a hole) is flattened and clipped, keeping its winding, so walls
 * end square at the edge; wholly outside, it draws nothing.
 */
/* @__NO_SIDE_EFFECTS__ */
export function cutTo(d: string, r: Rect): string {
  if (!d) {
    return d;
  }
  const subs = d.split(/(?=M)/).filter((s) => s.trim());
  const polys = subs.map((s) => pathPoints(s, 0.25));
  const all = polys.flat();
  const inside = all.every(
    ([x, y]) =>
      x >= r.x0 - 1e-6 &&
      x <= r.x1 + 1e-6 &&
      y >= r.y0 - 1e-6 &&
      y <= r.y1 + 1e-6
  );
  if (inside) {
    return d;
  }
  return polys
    .map((p) => clipPoly(p, r))
    .filter((p) => p.length > 2)
    .map((p) => polyPath(p, true))
    .join('');
}

/**
 * A filled path cut at the 36×36 box. Inside the box it is returned as it
 * is (arcs and all); crossing an edge, each subpath (an outline, or a hole)
 * is flattened and clipped, keeping its winding, so walls end square at the
 * edge; wholly outside, it draws nothing.
 */
/* @__NO_SIDE_EFFECTS__ */
export function cutToBox(d: string): string {
  return cutTo(d, BOX_RECT);
}
