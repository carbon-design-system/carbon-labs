/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Pt } from '../../geometry';
import type { Seg } from '../../cut';
import { lerp } from '../../paint';

/**
 * The notification bell's 2px centreline, shared by the Notification
 * toggles, in the 32-unit grid.
 *
 * The body: shoulders at x = sx from y1 flaring out to x = bx at y2, down to
 * the rim bar at y = yb; the dome an arc of r = 16 − sx about (16, 13). The
 * knocker hangs from the rim (an r=4 arc about (16, 25)); its legs start at
 * knockTop, hidden in the rim. Carbon's 16px drawing is its own (the lower
 * body 1px lower), so it gets its own fit; Carbon has no 16px filled bell,
 * so filled bells use the 32px one at every size.
 *
 * `open` is where the body ends when it opens for the "off" slash: the left
 * side folds away and the line ends at open[1] (open[0] is a point on the
 * way, on the same line, so the end stays straight).
 */
export type BellArt = {
  y1: number;
  y2: number;
  yb: number;
  sx: number;
  bx: number;
  knockTop: number;
  open: [Pt, Pt];
};

export const BELL_32: BellArt = {
  y1: 17,
  y2: 20,
  yb: 23,
  sx: 7,
  bx: 4,
  knockTop: 22,
  open: [
    [3.8535, 20.1465],
    [3.707, 20.293],
  ],
};
export const BELL_16: BellArt = {
  y1: 17.9,
  y2: 21,
  yb: 24.1,
  sx: 6.95,
  bx: 4,
  knockTop: 24,
  open: [
    [4, 22],
    [4, 23],
  ],
};

const lerpPt = (a: Pt, b: Pt, t: number): Pt => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
];

/** The outline bell's art at a size, easing to the filled (32px) art as `fill` goes 0 → 1. */
export function bellArt(size: number | undefined, fill = 0): BellArt {
  if (size !== 16) {
    return BELL_32;
  }
  const [a, b] = [BELL_16, BELL_32];
  return {
    y1: lerp(a.y1, b.y1, fill),
    y2: lerp(a.y2, b.y2, fill),
    yb: lerp(a.yb, b.yb, fill),
    sx: lerp(a.sx, b.sx, fill),
    bx: lerp(a.bx, b.bx, fill),
    knockTop: lerp(a.knockTop, b.knockTop, fill),
    open: [
      lerpPt(a.open[0], b.open[0], fill),
      lerpPt(a.open[1], b.open[1], fill),
    ],
  };
}

const f = (n: number) => +n.toFixed(4);
/** The dome from the right shoulder over to the left one (two quarter-circle cubics). */
function dome({ sx }: BellArt): string {
  const r = 16 - sx;
  const k = r * 0.5523;
  return `C${f(32 - sx)} ${f(13 - k)} ${f(16 + k)} ${f(13 - r)} 16 ${f(13 - r)}C${f(16 - k)} ${f(13 - r)} ${f(sx)} ${f(13 - k)} ${f(sx)} 13`;
}

/** The closed bell body. */
export function bellPath(a: BellArt): string {
  return `M${f(a.sx)} ${f(a.y1)}L${f(a.bx)} ${f(a.y2)}L${f(a.bx)} ${f(a.yb)}L${f(32 - a.bx)} ${f(a.yb)}L${f(32 - a.bx)} ${f(a.y2)}L${f(32 - a.sx)} ${f(a.y1)}L${f(32 - a.sx)} 13${dome(a)}Z`;
}

/** The bell body opening for the slash (m 0 → 1): the rim's left end and left side fold away. */
export function openBellPath(a: BellArt, m: number): string {
  const p9 = lerpPt([a.bx, a.yb], a.open[0], m);
  const p10 = lerpPt([8, a.yb], a.open[1], m);
  return (
    `M8 ${f(a.yb)}L${f(32 - a.bx)} ${f(a.yb)}L${f(32 - a.bx)} ${f(a.y2)}L${f(32 - a.sx)} ${f(a.y1)}L${f(32 - a.sx)} 13${dome(a)}` +
    `L${f(a.sx)} ${f(a.y1)}L${f(a.bx)} ${f(a.y2)}L${f(p9[0])} ${f(p9[1])}L${f(p10[0])} ${f(p10[1])}`
  );
}

/** The knocker, hanging from the rim. */
export function knockerPath(a: BellArt): string {
  return `M12 ${f(a.knockTop)}L12 25C12 27.209 13.791 29 16 29C18.209 29 20 27.209 20 25L20 ${f(a.knockTop)}`;
}

export const ANTENNA_PATH = 'M16 4L16 1';

// ── As segments, for cutting (utils/cut.ts) ──────────────────────────────────

/** The bell body opening for the slash, as segments (same shape as openBellPath). */
export function openBellSegs(a: BellArt, m: number): Seg[][] {
  const p9 = lerpPt([a.bx, a.yb], a.open[0], m);
  const p10 = lerpPt([8, a.yb], a.open[1], m);
  const pts: Pt[] = [
    [8, a.yb],
    [32 - a.bx, a.yb],
    [32 - a.bx, a.y2],
    [32 - a.sx, a.y1],
    [32 - a.sx, 13],
  ];
  const tail: Pt[] = [[a.sx, 13], [a.sx, a.y1], [a.bx, a.y2], p9, p10];
  const lines = (ps: Pt[]) =>
    ps.slice(1).map((b, i): Seg => ({ k: 'L', a: ps[i], b }));
  return [
    [
      ...lines(pts),
      { k: 'A', c: [16, 13], r: 16 - a.sx, t0: 0, t1: -Math.PI },
      ...lines(tail),
    ],
  ];
}

/** The knocker as segments, its legs reaching up to y = top (cut them at the rim). */
export function knockerSegs(top: number): Seg[][] {
  return [
    [
      { k: 'L', a: [12, top], b: [12, 25] },
      { k: 'A', c: [16, 25], r: 4, t0: Math.PI, t1: 0 },
      { k: 'L', a: [20, 25], b: [20, top] },
    ],
  ];
}

export const ANTENNA_SEGS: Seg[][] = [[{ k: 'L', a: [16, 4], b: [16, 1] }]];

/** The closed bell's centreline as a polygon (the dome sampled every 2°). */
export function bellPoly(a: BellArt): Pt[] {
  const r = 16 - a.sx;
  const dome: Pt[] = Array.from({ length: 91 }, (_, i) => {
    const t = (-Math.PI * i) / 90;
    return [16 + r * Math.cos(t), 13 + r * Math.sin(t)];
  });
  return [
    [a.bx, a.yb],
    [32 - a.bx, a.yb],
    [32 - a.bx, a.y2],
    [32 - a.sx, a.y1],
    ...dome,
    [a.sx, a.y1],
    [a.bx, a.y2],
  ];
}
