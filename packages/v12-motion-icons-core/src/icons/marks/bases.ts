/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Pt } from '../../geometry';
import { f } from '../../paint';
import { loopD } from '../../utils/statusMark';
import { circleD } from '../people/people';
import { faceEyeLift, faceSmile, smilePath } from '../assorted/peopleMoney';

/**
 * The bases' own hovers, for the status-mark badges. Each is the hover of the base icon in the
 * package, as a point mapping of the badge's own drawing (`MarkBase.calm`),
 * so Carbon's cut moves with the base and its open ends then draw back to
 * keep their resting space to the mark (utils/statusMark.ts). Each wall keeps
 * its 2px: a wall's two edges move together.
 */

export type Calm = (p: Pt, h: number) => Pt;

/** Mobile's hover (MobileSpec): the case grows 1px on every side; `top` is the lowest y of the top band (it rises with the top). */
export const mobileCalm =
  (top: number, bottom: number): Calm =>
  ([x, y], h) => [
    x < 16 ? x - h : x + h,
    y <= top ? y - h : y >= bottom ? y + h : y,
  ];

/**
 * Document's hover (DocumentSpec): the page grows 2px on every side and its
 * folded corner comes 4px further in (the points on its fold lines move 4px
 * left, or down). Kept for reference; the badges fold only (`documentFold`).
 */
export const documentCalm: Calm = ([x, y], h) => {
  const [g, k] = [2 * h, 4 * h];
  const foldLeft = x > 12 && x < 19.5 && y < 13;
  const foldDown = x > 15 && y > 8 && y < 13;
  return [
    x + (x > 12 ? g : -g) - (foldLeft ? k : 0),
    y + (y < 16 ? -g : g) + (foldDown ? k : 0),
  ];
};

/** Calendar's hover (CalendarSpec): the page grows 2px on every side, its two rings 1px further apart, riding up with the top. */
export const calendarCalm: Calm = ([x, y], h) => {
  const g = 2 * h;
  const ring =
    y <= 8.01
      ? x > 9.99 && x < 12.01
        ? -h
        : x > 19.99 && x < 22.01
          ? h
          : 0
      : 0;
  return [
    x + (x <= 6.01 ? -g : x >= 25.99 ? g : ring),
    y + (y <= 8.01 ? -g : y >= 25.99 ? g : 0),
  ];
};

/** Data base's hover (DataBaseSpec): the case widens 1px each side about its middle `cx` (the dots grow: `dataDots`). */
export const dataCalm =
  (cx: number): Calm =>
  ([x, y], h) => [x + (x < cx ? -h : h), y];
/** Data base's dots at hover h: radius 1 → 1.5, in place. */
export const dataDots = (x: number, h: number) =>
  [8, 16, 24].map((y) => circleD([x, y], 1 + 0.5 * h)).join('');

/**
 * Table's hover (TableSpec): a pure horizontal widening, the side walls 1px
 * out (TABLE_WIDEN); the top, the bottom and the rules hold their y, the
 * rules lengthen with the walls, and the divider (x 15–17, on the centre
 * line, so holding and moving proportionally are the same) holds.
 */
export const tableCalm: Calm = ([x, y], h) => [
  x + (x <= 5.01 ? -h : x >= 26.99 ? h : 0),
  y,
];

/**
 * Folder's hover (FolderSpec): every edge 2px out at constant weight, the
 * tab's diagonal 2px out along its normal (so its corners slide 2(√2 − 1)
 * right as they rise 2).
 */
export const folderCalm: Calm = ([x, y], h) => {
  const g = 2 * h;
  if (x > 10.9 && x < 16.1 && y < 10.1 && !(y > 7.9 && x > 15.9)) {
    return [x + g * (Math.SQRT2 - 1), y - g];
  }
  return [
    x + (x <= 4.01 ? -g : x >= 27.99 ? g : 0),
    y + (y <= 10.01 ? -g : y >= 25.99 ? g : 0),
  ];
};

/**
 * Video's hover (VideoSpec): the lens reaches out and opens: its mouth 2px
 * right, its top arm 1px up and its bottom arm 1px down (where they leave the
 * body too, so the body's opening widens with them); the body holds.
 */
export const videoCalm: Calm = ([x, y], h) => {
  if (x < 20.9 || (x < 22.9 && (y < 12 || y > 20))) {
    return [x, y];
  }
  return [x + (x >= 27.9 ? 2 * h : 0), y + (y < 16 ? -h : h)];
};

/**
 * Asset's hover (AssetSpec): every radius grows 1px (the wheel and its hub
 * about (12, 20), the pulley about (26, 6)), and the belt's runs, tangent to
 * both, move 1px out along their normals. A point on a run moves with it; any
 * other point moves out from its circle's centre. Every arc's radius grows by
 * the same (`assetArc`).
 */
const WHEEL: Pt = [12, 20];
const PULLEY: Pt = [26, 6];
const RUNS: { n: Pt; o: number }[] = /* @__PURE__ */ (() => {
  const [R, r] = [10, 4];
  const [dx, dy] = [PULLEY[0] - WHEEL[0], PULLEY[1] - WHEEL[1]];
  const D = Math.hypot(dx, dy);
  const u: Pt = [dx / D, dy / D];
  const w: Pt = [-u[1], u[0]];
  const a = (r - R) / D;
  const b = Math.sqrt(1 - a * a);
  // Each run: its outward normal and the outside edge's offset along it (the inside edge is 2px in).
  return [1, -1].map((sg) => {
    const n: Pt = [-(a * u[0] + sg * b * w[0]), -(a * u[1] + sg * b * w[1])];
    return { n, o: n[0] * WHEEL[0] + n[1] * WHEEL[1] + R };
  });
})();
export const assetCalm: Calm = ([x, y], h) => {
  for (const { n, o } of RUNS) {
    const s = n[0] * x + n[1] * y;
    if (Math.abs(s - o) < 0.06 || Math.abs(s - (o - 2)) < 0.06) {
      // On the run (between its tangent points): out along its normal.
      const along = (x - WHEEL[0]) * -n[1] + (y - WHEEL[1]) * n[0];
      const end =
        (PULLEY[0] - WHEEL[0]) * -n[1] + (PULLEY[1] - WHEEL[1]) * n[0];
      if (
        along * Math.sign(end) > 0.5 &&
        along * Math.sign(end) < Math.abs(end) - 0.5
      ) {
        return [x + n[0] * h, y + n[1] * h];
      }
    }
  }
  const [dw, dp] = [
    Math.hypot(x - WHEEL[0], y - WHEEL[1]),
    Math.hypot(x - PULLEY[0], y - PULLEY[1]),
  ];
  const [c, d] = dp < 6 ? [PULLEY, dp] : [WHEEL, dw];
  return d < 1e-9
    ? [x, y]
    : [x + ((x - c[0]) / d) * h, y + ((y - c[1]) / d) * h];
};
export const assetArc = (r: number, h: number) => r + h;

/**
 * Face satisfied's hover (FaceSatisfiedSpec): the ring grows 1px in radius
 * about (16, 16); the smile's ends sweep 2px further round and the eyes rise
 * with them (`faceParts`). The ring's points move out from the centre; its
 * arcs grow (`faceArc`).
 */
export const faceCalm: Calm = ([x, y], h) => {
  const d = Math.hypot(x - 16, y - 16);
  return d > 11 ? [x + ((x - 16) / d) * h, y + ((y - 16) / d) * h] : [x, y];
};
export const faceArc = (r: number, h: number) => (r > 11 ? r + h : r);
/** The face's eyes and smile at hover h, as Face satisfied draws them. */
export const faceParts = (h: number) => {
  const lift = faceEyeLift(h);
  return {
    eyes: circleD([11.5, 13.5 - lift], 2.5) + circleD([20.5, 13.5 - lift], 2.5),
    smile: smilePath(faceSmile(h)),
  };
};

// ── The alarm clock (Alarm add, Alarm subtract) ───────────────────────────────
// No Alarm icon in the package has a hover; Alarm subtract's and Alarm add's
// clocks share their own: the clock circle grows.
const CLOCK_C: Pt = [16, 17];
/** Carbon's clock and bells (Alarm add and subtract draw the same). */
export const CLOCK =
  'M16 28A11 11 0 1 1 27 17A11 11 0 0 1 16 28ZM16 8A9 9 0 1 0 25 17A9 9 0 0 0 16 8Z' +
  'M4.0007 7.5921L7.582 4.0033L8.9977 5.416L5.4164 9.0048Z' +
  'M22.9994 5.4079L24.4151 3.9951L27.9964 7.5839L26.5807 8.9966Z';
/** How far the clock's ring grows in radius at full hover (and the bells ride out). */
export const CLOCK_GROW = 1;
const BELLS: Pt[][] = [
  [
    [4.0007, 7.5921],
    [7.582, 4.0033],
    [8.9977, 5.416],
    [5.4164, 9.0048],
  ],
  [
    [22.9994, 5.4079],
    [24.4151, 3.9951],
    [27.9964, 7.5839],
    [26.5807, 8.9966],
  ],
];
/** The clock at hover h: the ring grown g about its centre, each bell moved g straight out from it. */
export function clockAt(h: number): string {
  const g = CLOCK_GROW * h;
  const [cx, cy] = CLOCK_C;
  const [R, r] = [11 + g, 9 + g];
  const F = (x: number, y: number) => `${f(x)} ${f(y)}`;
  const ring =
    `M${F(cx, cy + R)}A${f(R)} ${f(R)} 0 1 1 ${F(cx + R, cy)}A${f(R)} ${f(R)} 0 0 1 ${F(cx, cy + R)}Z` +
    `M${F(cx, cy - r)}A${f(r)} ${f(r)} 0 1 0 ${F(cx + r, cy)}A${f(r)} ${f(r)} 0 0 0 ${F(cx, cy - r)}Z`;
  const bells = BELLS.map((pts) => {
    const [mx, my] = [
      pts.reduce((a, p) => a + p[0], 0) / 4 - cx,
      pts.reduce((a, p) => a + p[1], 0) / 4 - cy,
    ];
    const l = Math.hypot(mx, my);
    return loopD(
      pts.map(([x, y]) => [x + (mx / l) * g, y + (my / l) * g] as Pt)
    );
  });
  return ring + bells.join('');
}

/**
 * Shopping cart's hover (ShoppingCartSpec): the cart grows 9% out from its
 * lower left (7.99, 23) at constant weight: its right wall 1.62px right, its
 * floor 0.54px up and its handle 1.8px up (sliding up the upright), each
 * lengthening to meet the next; the upright, the axle bar and the wheels hold.
 */
const CART_S = 0.09;
export const cartCalm: Calm = ([x, y], h) => {
  const k = CART_S * h;
  // The handle: it rises with the basket's top, its centreline (y 3)
  // 1.8px up, both edges together; where it meets the upright, it slides up the upright (dx/dy 0.199).
  if (y < 4.1) {
    return [x > 2.5 ? x - 0.199 * (23 - 3) * k : x, y - (23 - 3) * k];
  }
  const floor = y > 15.9 && y < 18.3;
  if (x >= 24.9 && y < 18.3) {
    return [
      x + (25.97 - 7.99) * k,
      floor ? y + (17 - 23) * k : 23 + (y - 23) * (1 + k),
    ];
  }
  if (floor && x > 7.5) {
    return [7.99 + (x - 7.99) * (1 + k), y + (17 - 23) * k];
  }
  return [x, y];
};

/**
 * The documents with a mark (no base scale, only the fold): Document's folded corner comes in 2px, as
 * it does in Document's hover (where the page also grows 2px and the fold 4px
 * further in, the corner comes 2px in all told), and the page holds. The
 * points on the fold's vertical line move 2px left, those on its horizontal
 * line 2px down; the diagonal stays parallel, so every wall keeps its 2px.
 */
export const documentFold: Calm = ([x, y], h) => {
  const k = 2 * h;
  const foldLeft = x > 12 && x < 19.5 && y < 13;
  const foldDown = x > 15 && y > 8 && y < 13;
  return [x - (foldLeft ? k : 0), y + (foldDown ? k : 0)];
};
/** Document's fold (`documentFold`) on a page drawn `dx` right of Document's (document--security's page sits 2px left: −2). */
export const documentFoldAt =
  (dx: number): Calm =>
  ([x, y], h) => {
    const [fx, fy] = documentFold([x - dx, y], h);
    return [fx + dx, fy];
  };

/**
 * A circle in Carbon's own form: four cubics whose handles are 0.5514 of the
 * radius (Carbon's small rings and discs: array--time, battery--error), so a
 * badge's ring rests on Carbon's drawing pixel for pixel (true arcs differ by
 * single anti-aliased pixels). `cw`: clockwise on screen (a ring's inside
 * goes the other way, so it is knocked out under the non-zero rule).
 */
export function carbonCircle([cx, cy]: Pt, r: number, cw = true): string {
  const k = 0.5514 * r;
  const P = (x: number, y: number) => `${f(x)} ${f(y)}`;
  return cw
    ? `M${P(cx, cy - r)}C${P(cx + k, cy - r)} ${P(cx + r, cy - k)} ${P(cx + r, cy)}C${P(cx + r, cy + k)} ${P(cx + k, cy + r)} ${P(cx, cy + r)}` +
        `C${P(cx - k, cy + r)} ${P(cx - r, cy + k)} ${P(cx - r, cy)}C${P(cx - r, cy - k)} ${P(cx - k, cy - r)} ${P(cx, cy - r)}Z`
    : `M${P(cx, cy - r)}C${P(cx - k, cy - r)} ${P(cx - r, cy - k)} ${P(cx - r, cy)}C${P(cx - r, cy + k)} ${P(cx - k, cy + r)} ${P(cx, cy + r)}` +
        `C${P(cx + k, cy + r)} ${P(cx + r, cy + k)} ${P(cx + r, cy)}C${P(cx + r, cy - k)} ${P(cx + k, cy - r)} ${P(cx, cy - r)}Z`;
}

// ── Growth at constant weight ─────────────────────────────────────────────────

/**
 * A 2px-walled shape's centreline, for growing it at constant weight
 * (`weightGrow`): its runs as polylines (arcs sampled), and its sharp
 * corners, whose points (a rounded outer corner, a mitred inner one) move
 * with the corner.
 */
export interface Centreline {
  lines: readonly (readonly Pt[])[];
  corners: readonly Pt[];
  /** How near a corner a point must be to move with it (past the inner miter: 1/sin of half the corner's angle). */
  snap: number;
}
/** Points along the arc about c of radius r from angle a0 to a1 (radians, y down). */
export const arcPts = (
  [cx, cy]: Pt,
  r: number,
  a0: number,
  a1: number,
  n = 48
): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
  });
/** The nearest point to p on a polyline. */
function footOn(line: readonly Pt[], [px, py]: Pt): { q: Pt; d: number } {
  let best = { q: line[0] as Pt, d: Infinity };
  for (let i = 0; i + 1 < line.length; i++) {
    const [a, b] = [line[i], line[i + 1]];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const l2 = dx * dx + dy * dy;
    const t = l2
      ? Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l2))
      : 0;
    const q: Pt = [a[0] + t * dx, a[1] + t * dy];
    const d = Math.hypot(px - q[0], py - q[1]);
    if (d < best.d) {
      best = { q, d };
    }
  }
  return best;
}
/**
 * Growing a walled shape by s about c at constant weight, as a point
 * mapping: the centreline scales about c, and each of the outline's points
 * keeps its offset from the centreline point it sits on (its corner's, near
 * a corner). So both edges of a wall move together and every wall keeps its
 * weight; rounded outer corners keep their radius. (An outline arc about a
 * centreline arc of radius ρ grows by (s − 1)ρ: `weightArc`.)
 */
export function weightGrow(cl: Centreline, c: Pt, s: number): (p: Pt) => Pt {
  return (p) => {
    let q: Pt | null = null;
    let best = cl.snap;
    for (const v of cl.corners) {
      const d = Math.hypot(p[0] - v[0], p[1] - v[1]);
      if (d < best) {
        [q, best] = [v, d];
      }
    }
    if (!q) {
      let d = Infinity;
      for (const line of cl.lines) {
        const f = footOn(line, p);
        if (f.d < d) {
          [q, d] = [f.q, f.d];
        }
      }
    }
    const [qx, qy] = q!;
    return [p[0] + (s - 1) * (qx - c[0]), p[1] + (s - 1) * (qy - c[1])];
  };
}
/** An outline arc's radius when its centreline arc (radius ρ, within 1.2 of r) grows by s; other arcs (rounded corners) hold. */
export const weightArc = (rho: number, s: number) => (r: number) =>
  Math.abs(r - rho) < 1.2 ? r + (s - 1) * rho : r;
