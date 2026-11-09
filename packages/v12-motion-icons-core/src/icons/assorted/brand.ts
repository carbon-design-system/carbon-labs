/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Bee32 from '@carbon/icons/es/bee/32.js';
import Carbon32 from '@carbon/icons/es/carbon/32.js';
import {
  carbonArt,
  defineAction,
  HOVER,
  hoverIcon,
  type Shapes,
} from '../../engine';
import { cubicBezier } from '../../ease';
import {
  clipConvex,
  insetPoly,
  pathPoints,
  polyPath,
  ringPath,
  roundedOutlinePath,
  type Pt,
} from '../../geometry';
import { EVENODD, f } from '../../paint';
import { motionTokens } from '../../tokens';

/**
 * Brand: Carbon (the Carbon logo) and Bee.
 */

// ── Carbon ───────────────────────────────────────────────────────────────────

/**
 * Carbon (`carbon`, Brand): the Carbon Design System logo, for fun.
 *
 * Carbon draws it once (32px, used at every size): two hexagons ("molecules")
 * of the same shape, 2px walls with round outer corners. The front one
 * (lower left, centre (13.5, 20)) is whole; the back one (upper right, centre
 * (18.5, 12), the front moved (5, -8)) shows only its far half: three edges,
 * vertex to vertex, from (10, 7) over the top to (27, 17), its ends cut
 * square. They never overlap: the back half's ends clear the front by 2.5px
 * (left) and 3px (right).
 *
 * Hover: the molecules move in a clockwise arc to sit side by side, as far
 * apart as 36×36 allows. 220ms
 * (moderate-02, as Collaborate's orbit) on the entrance ease, the leave sped
 * up as usual, back along the same arc.
 *  - Each hexagon turns 30° about its own centre, the front clockwise and
 *    the back anticlockwise. Hovered, both are
 *    flat-topped (a hexagon repeats every 60°, so 30° is a new drawing).
 *  - The pair orbits clockwise about its shared centre (16, 16), 58° from
 *    the rest diagonal to level, so the back hexagon swings down to the
 *    right and the front up to the left. The orbit's radius opens at the
 *    same time (one ease for the turns, the orbit and the opening) to where
 *    the two outer corners would reach the 36×36 box, level at (8.86, 16)
 *    and (23.14, 16).
 *  - Blended in with the same ease, the front
 *    finishes 2px right and 2px down of that, at (10.86, 18), and the back
 *    2px left and 2px up, at (21.14, 14): 11.6px apart on a slight
 *    diagonal (9.43 at rest), the walls 2px inside the box's sides.
 *  - Side by side they still overlap (two whole hexagons would be 43px
 *    wide), so the back hexagon stays partly hidden behind the front. What
 *    shows of it is the stretch of its outline, round from its point
 *    farthest from the front, that keeps clear of the front: within its
 *    window (the half beyond the line through its centre and its rest ends,
 *    the line turning with the orbit so it keeps facing away from the front)
 *    by 2.3px of clear ink, and beyond the window by 3px (Carbon's own gap
 *    at the right end). At rest that is exactly Carbon's half. Early on, the
 *    two turns swing the front's top corner up under the back's left end
 *    like closing scissors, and that end draws back along its edge to hold
 *    the gap; as the two separate the back hexagon emerges round its top and
 *    bottom corners, its cut ends holding 3px off the front.
 *  - The window's gap is 2.3px, not Carbon's 2.5px: the back's left edge is
 *    parallel to the front's at rest, sitting exactly at 2.5px, so holding
 *    2.5px snaps that end back 1.3px in the hover's first 0.1%. 2.3px lets
 *    it start drawing back smoothly a little later (h 0.03).
 *  - The turns and the orbit move corners as geometry, painted per frame as
 *    filled 2px walls (no strokes, transforms, masks or clip paths).
 */

const D = Math.PI / 180;
/** Carbon's centreline corners of the front hexagon, clockwise on screen from the top. */
const RISE = 9.8149;
export const CARBON_FRONT: readonly Pt[] = [
  [13.5, 20 - RISE],
  [22, 15],
  [22, 25],
  [13.5, 20 + RISE],
  [5, 25],
  [5, 15],
];
export const CARBON_FRONT_CENTRE: Pt = [13.5, 20];
/** The back hexagon is the front moved (5, -8). */
const OFFSET: Pt = [5, -8];
export const CARBON_BACK: readonly Pt[] = CARBON_FRONT.map(
  ([x, y]) => [x + OFFSET[0], y + OFFSET[1]] as Pt
);
export const CARBON_BACK_CENTRE: Pt = [
  CARBON_FRONT_CENTRE[0] + OFFSET[0],
  CARBON_FRONT_CENTRE[1] + OFFSET[1],
];
/** The pair's shared centre, which they orbit. */
export const CARBON_PAIR_CENTRE: Pt = [
  (CARBON_FRONT_CENTRE[0] + CARBON_BACK_CENTRE[0]) / 2,
  (CARBON_FRONT_CENTRE[1] + CARBON_BACK_CENTRE[1]) / 2,
];

/** How far each hexagon turns hovered (degrees; the front clockwise, the back anticlockwise). */
export const CARBON_TURN = 30;
/** The hover's timing: 220ms (moderate-02), longer than the standard hover for the orbit's travel. */
export const CARBON_HOVER = {
  duration: motionTokens.duration.moderate02 / 1000,
  ease: HOVER.ease,
};
/**
 * Centreline distance from the front that the back hexagon's outline keeps
 * to show: beyond its window's half 5px (3px of clear ink, Carbon's gap at
 * the right end), inside it 4.3px (2.3px of clear ink; Carbon's left-end gap
 * is 2.5px, which held exactly snaps the end back at the hover's start).
 */
export const CARBON_KEEP = 5.01;
export const CARBON_KEEP_WINDOW = 4.3;
/** The 36×36 hover box's edges (the 32px frame plus 2px a side). */
const BOX: readonly [number, number] = [-2, 34];

const turn = (
  pts: readonly Pt[],
  [cx, cy]: Pt,
  deg: number,
  [mx, my]: Pt
): Pt[] => {
  const [s, c] = [Math.sin(deg * D), Math.cos(deg * D)];
  return pts.map(
    ([x, y]) =>
      [
        cx + (x - cx) * c - (y - cy) * s + mx,
        cy + (x - cx) * s + (y - cy) * c + my,
      ] as Pt
  );
};
const rotate = ([x, y]: Pt, a: number): Pt => [
  x * Math.cos(a) - y * Math.sin(a),
  x * Math.sin(a) + y * Math.cos(a),
];

/** The orbit: the back's angle about the pair centre at rest (the diagonal) and hovered (level, to the right; clockwise on screen). */
export const CARBON_ORBIT_FROM = Math.atan2(OFFSET[1], OFFSET[0]);
export const CARBON_ORBIT_TO = 0;
/**
 * Where each hexagon finishes, moved off the
 * orbit's level end, the front by this (2px down, 2px right) and the back
 * by its opposite. Blended in with h, so the path stays one smooth curve.
 */
export const CARBON_SETTLE: Pt = [2, 2];
/** The orbit's radius at rest. */
const ORBIT_R0 = Math.hypot(OFFSET[0], OFFSET[1]) / 2;
/** The orbit's radius hovered: as wide as the 36×36 box allows with both hexagons turned. */
export const CARBON_ORBIT_R = /* @__PURE__ */ (() => {
  const front = turn(
    CARBON_FRONT,
    CARBON_FRONT_CENTRE,
    CARBON_TURN,
    [0, 0]
  ).map(([x]) => x - CARBON_FRONT_CENTRE[0]);
  const back = turn(CARBON_BACK, CARBON_BACK_CENTRE, -CARBON_TURN, [0, 0]).map(
    ([x]) => x - CARBON_BACK_CENTRE[0]
  );
  // The walls reach 1px past the centreline corners (their round corners).
  const left = CARBON_PAIR_CENTRE[0] - (BOX[0] + 1 - Math.min(...front));
  const right = BOX[1] - 1 - Math.max(...back) - CARBON_PAIR_CENTRE[0];
  return Math.min(left, right);
})();

/**
 * The back hexagon's window at rest: the side of the line through its centre
 * and its rest ends, (10, 7) and (27, 17), away from the front. A unit normal.
 */
const WINDOW: Pt = (() => {
  const [dx, dy] = [27 - 10, 17 - 7];
  const l = Math.hypot(dx, dy);
  return [dy / l, -dx / l];
})();

const EPS = 1e-9;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Distance from p to a convex polygon's filled region (0 inside). */
function regionDist(p: Pt, poly: readonly Pt[]): number {
  let [sign, m, inside] = [0, Infinity, true];
  for (let i = 0; i < poly.length; i++) {
    const [a, b] = [poly[i], poly[(i + 1) % poly.length]];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const c = Math.sign(dx * (p[1] - a[1]) - dy * (p[0] - a[0]));
    if (c && sign && c !== sign) {
      inside = false;
    }
    sign ||= c;
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)
      )
    );
    m = Math.min(m, Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy));
  }
  return inside ? 0 : m;
}

/**
 * What shows of the back hexagon `pts` (centre `c`, window normal `n`) with
 * `front` standing before it: the outline round from its point farthest
 * from the front, in both directions, until it comes within its keep-out of
 * the front: CARBON_KEEP_WINDOW inside the window's half (2.3px of clear
 * ink), CARBON_KEEP beyond it (Carbon's 3px right-end gap). An open
 * run, or the whole hexagon (`closed`) when nothing is hidden.
 */
function backRun(
  pts: readonly Pt[],
  c: Pt,
  n: Pt,
  front: readonly Pt[]
): { run: Pt[]; closed: boolean } {
  const N = pts.length;
  const lens = pts.map((p, i) => dist(p, pts[(i + 1) % N]));
  const P = lens.reduce((s, l) => s + l, 0);
  /** The outline's point at arc length s (any real s, wrapping), and its edge. */
  const at = (s: number): { p: Pt; edge: number; t: number } => {
    let u = ((s % P) + P) % P;
    for (let i = 0; i < N; i++) {
      if (u <= lens[i] || i === N - 1) {
        return {
          p: lerpPt(pts[i], pts[(i + 1) % N], Math.min(1, u / lens[i])),
          edge: i,
          t: u,
        };
      }
      u -= lens[i];
    }
    return { p: pts[0], edge: 0, t: 0 };
  };
  const hidden = (s: number) => {
    const { p } = at(s);
    const inWindow = (p[0] - c[0]) * n[0] + (p[1] - c[1]) * n[1] >= -EPS;
    return regionDist(p, front) < (inWindow ? CARBON_KEEP_WINDOW : CARBON_KEEP);
  };
  const samples = Math.ceil(P / 0.05);
  const step = P / samples;
  // Start from the point farthest from the front.
  let [anchor, far] = [0, -1];
  for (let k = 0; k < samples; k++) {
    const d = regionDist(at(k * step).p, front);
    if (d > far) {
      [anchor, far] = [k * step, d];
    }
  }
  /** Walk from the anchor (dir ±1) to the first hidden point, refined by bisection; null if none. */
  const walk = (dir: 1 | -1): number | null => {
    for (let k = 1; k <= samples; k++) {
      if (!hidden(anchor + dir * k * step)) {
        continue;
      }
      let [lo, hi] = [anchor + dir * (k - 1) * step, anchor + dir * k * step];
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (hidden(mid)) {
          hi = mid;
        } else {
          lo = mid;
        }
      }
      return lo;
    }
    return null;
  };
  const [ahead, behind] = [walk(1), walk(-1)];
  if (ahead === null || behind === null) {
    return { run: [...pts], closed: true };
  }
  // From the end behind the anchor forward to the end ahead of it, through the corners between.
  const run: Pt[] = [at(behind).p];
  let s = behind;
  for (;;) {
    const { edge, t } = at(s);
    const next = s + lens[edge] - t;
    if (next >= ahead - EPS) {
      break;
    }
    run.push(pts[(edge + 1) % N]);
    s = next + EPS * 10;
  }
  run.push(at(ahead).p);
  return {
    run: run.filter((p, i) => i === 0 || dist(p, run[i - 1]) > 1e-6),
    closed: false,
  };
}

/**
 * Both hexagons at hover progress h: the front's centreline corners, and
 * what shows of the back (its centreline run; `backClosed` when all of it).
 */
export function carbonLogo(h: number): {
  front: Pt[];
  back: Pt[];
  backClosed: boolean;
  centres: [Pt, Pt];
} {
  const a = CARBON_ORBIT_FROM + (CARBON_ORBIT_TO - CARBON_ORBIT_FROM) * h;
  const r = ORBIT_R0 + (CARBON_ORBIT_R - ORBIT_R0) * h;
  const [cx, cy] = CARBON_PAIR_CENTRE;
  const [sx, sy] = [CARBON_SETTLE[0] * h, CARBON_SETTLE[1] * h];
  const backAt: Pt = [cx + r * Math.cos(a) - sx, cy + r * Math.sin(a) - sy];
  const frontAt: Pt = [cx - r * Math.cos(a) + sx, cy - r * Math.sin(a) + sy];
  const front = turn(CARBON_FRONT, CARBON_FRONT_CENTRE, CARBON_TURN * h, [
    frontAt[0] - CARBON_FRONT_CENTRE[0],
    frontAt[1] - CARBON_FRONT_CENTRE[1],
  ]);
  const backHex = turn(CARBON_BACK, CARBON_BACK_CENTRE, -CARBON_TURN * h, [
    backAt[0] - CARBON_BACK_CENTRE[0],
    backAt[1] - CARBON_BACK_CENTRE[1],
  ]);
  const { run, closed } = backRun(
    backHex,
    backAt,
    rotate(WINDOW, a - CARBON_ORBIT_FROM),
    front
  );
  return { front, back: run, backClosed: closed, centres: [frontAt, backAt] };
}

/**
 * An open run's 2px wall with square-cut ends and round outer corners, as
 * filled outline (what a round-joined, butt-capped stroke covers): a
 * rectangle per edge and a disc at each inner corner, all clockwise on
 * screen, so they union under nonzero fill. Filled, not stroked, so it
 * rasterises as Carbon's filled outline does (a stroke antialiased
 * differently at 16px).
 */
function runWall(run: readonly Pt[]): string {
  let d = '';
  for (let i = 0; i < run.length - 1; i++) {
    const [a, b] = [run[i], run[i + 1]];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [nx, ny] = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
    // a + n → b + n → b − n → a − n is clockwise on screen for this normal.
    d += polyPath(
      [
        [a[0] - nx, a[1] - ny],
        [b[0] - nx, b[1] - ny],
        [b[0] + nx, b[1] + ny],
        [a[0] + nx, a[1] + ny],
      ],
      true
    );
  }
  for (const [x, y] of run.slice(1, -1)) {
    d += `M${f(x + 1)} ${f(y)}A1 1 0 0 1 ${f(x - 1)} ${f(y)}A1 1 0 0 1 ${f(x + 1)} ${f(y)}Z`;
  }
  return d;
}

/** Carbon's own construction of a whole hexagon: the outline rounded 1px out, the hole 1px in (anticlockwise, so nonzero leaves it empty). */
const ring = (pts: readonly Pt[]) =>
  roundedOutlinePath(pts, 1) + polyPath(insetPoly(pts, 1).reverse(), true);

export function carbonShapes(h: number): Shapes {
  const { front, back, backClosed } = carbonLogo(h);
  return {
    front: { d: ring(front) },
    back: { d: backClosed ? ring(back) : runWall(back) },
  };
}

export const CarbonSpec = /* @__PURE__ */ hoverIcon('Carbon', {
  hover: CARBON_HOVER,
  geo: ({ h }) => carbonShapes(h),
  static: /* @__PURE__ */ carbonArt(Carbon32),
});

// ── Bee ──────────────────────────────────────────────────────────────────────

/**
 * Bee (`bee`, Carbon's Brand / IBM set), for fun. Carbon draws it once
 * (32px, used at every size), in 1.75px walls: a capsule body (x 10–22,
 * y 10–30, round ends r 6 about (16, 16) and (16, 24)) crossed by two
 * stripes (y 16.12–17.87 and 22.12–23.87), two teardrop wings (pointed root
 * at (24, 13), lobe r 4 about (28, 22.1); the left one mirrored) and two
 * ring eyes (r 1.75–3.5 about (11.5, 5.5) and (20.5, 5.5)).
 *
 * The action's reference animation (768 units square, 60fps) is Carbon's
 * bee exactly, drawn at 16 units a px with its
 * body centre at (384, 448) = (16, 20). What its layers do, frames 60–129
 * (1.15s; the reference runs on to 181, a 0.87s hold so it loops):
 *  - wings (wing_l / wing_r, rotation about their roots (8, 13) / (24, 13),
 *    mirrored): five beats, both together, each from rest out and back:
 *    31° (60→73→81), 28° (→86→90), 25° (→94→98), 25° (→102→108) and 22°
 *    (→117→128), quicker in the middle (4 frames a half beat);
 *  - body (rotation about the top cap's centre (16, 16)): sways −12.9°
 *    (75.5), +12.7° (86.9), −10.3° (98.1), +5° (110), rest by 124;
 *  - body path: the abdomen (the lower half, its round end and its tangents)
 *    bends about the body's centre (16, 20), lagging the sway: −17.4° (80),
 *    +14.7° (92), −17.4° (103), +14.7° (115), rest by 129; the sides curve
 *    between the fixed thorax and the turned abdomen;
 *  - stripes (body_line_01 about its own centre (16, 17); body_line_02 about
 *    (16, 16)) tilt on their own: −7.6°, +6.8°, −9.1°, +5.4° and −15.9°,
 *    +15.7°, −16.6°, +13° (77, 89, 100, 112), rest by 126;
 *  - eyes: still.
 * Every key eases (0.48, ·, 0.52, ·): the reference's ease in and out, the y handles
 * the reference's own (a few hundredths over 0 and 1 on the wings).
 *
 * Hover: the bee grows and opens its wings, on the standard
 * hover (160ms entrance in, 120ms exit out): the bee grows 1/16 about (16, 16)
 * at constant weight (the body's and eyes' centrelines scale, their walls
 * stay 1.75; the top cap's centre is the fixed point, so the bee grows down
 * and out from its thorax) and the wings, riding out with it (0.5px), open
 * 12° (BEE_HOVER_OPEN) about their hinges, their lobes reaching x 33.68 (the
 * most at that growth would be 15.7°). The wings keep Carbon's own outline
 * (they move rigidly; at 1/16 a wing would only grow 0.5px).
 *
 * The hinge: each wing turns about the point on its inner edge level with
 * the body's pivot, (24, 16) / (8, 16), 3px below its root. Turned about
 * its root, as the reference's are, a wing's lobe swings out sideways
 * (31° reaches x 36.1, 2.1px past the box), and the most it could open is
 * 13.4°; about the hinge the lobe swings up as much as out, so it opens to
 * 22.1° inside the box (its root dipping 1.1px toward the body's shoulder,
 * still 1.4px clear of it).
 *
 * Action (trigger()): the reference's motion, frame for frame, 1.25× as
 * fast: 920ms (its 1.15s of motion; the hold after it is the comp's loop,
 * not the bee's). Faster than that its quickest wing beats (4 frames a half)
 * fall under 3 frames at 60Hz and strobe. The body sways, the abdomen bends
 * after it and the stripes tilt as the reference's do; the wings beat its
 * five beats, scaled so its widest (31°) opens as far as the box allows
 * (22.1° at rest; less while a hover's growth is still easing out), the rest
 * in proportion. A shut wing the abdomen swings toward gives way (below).
 * Every part is drawn at 1.75 every frame: the body from its
 * bent centreline (arcs, and its sides offset as curves), the stripes cut
 * to the body's centreline so they always meet its walls. It doesn't loop:
 * `loop` and `until` play one pass.
 */

const W = 1.75; // Carbon's bee weight
const HW = W / 2;
/**
 * Carbon's paths, point for point (its relative commands written absolute,
 * so the geometry helpers can read them): body (with its stripes), right
 * wing, left wing, left eye, right eye.
 */
const ART = [
  'M16 10A6 6 0 0 0 10 16V24A6 6 0 0 0 22 24V16A6 6 0 0 0 16 10ZM11.75 17.87H20.25V22.12H11.75Z' +
    'M16 28.25A4.27 4.27 0 0 1 11.75 24V23.87H20.25V24A4.27 4.27 0 0 1 16 28.25ZM20.25 16.12H11.75V16A4.25 4.25 0 0 1 20.25 16Z',
  'M30.66 19.21L24 13V22.1A4 4 0 0 0 32 22.1A3.83 3.83 0 0 0 30.66 19.21Z' +
    'M28 24.35A2.25 2.25 0 0 1 25.75 22.1V17L29.47 20.47A2.05 2.05 0 0 1 30.2 22A2.25 2.25 0 0 1 28 24.35Z',
  'M0 22.1A4 4 0 0 0 8 22.1V13L1.34 19.21A3.88 3.88 0 0 0 0 22.1Z' +
    'M2.48 20.54L6.25 17V22.1A2.25 2.25 0 0 1 1.75 22.1A2.05 2.05 0 0 1 2.48 20.54Z',
  'M15 5.5A3.5 3.5 0 1 0 11.5 9A3.5 3.5 0 0 0 15 5.5ZM9.75 5.5A1.75 1.75 0 1 1 11.5 7.25A1.77 1.77 0 0 1 9.75 5.5Z',
  'M20.5 2A3.5 3.5 0 1 0 24 5.5A3.5 3.5 0 0 0 20.5 2ZM20.5 7.25A1.75 1.75 0 1 1 22.25 5.5A1.77 1.77 0 0 1 20.5 7.25Z',
] as const;

/** The hover's growth (1/16: the wings' lobes 0.5px out, the body 0.32px a side) and the wings' opening on hover (degrees). */
export const BEE_GROW = 1 / 16;
export const BEE_HOVER_OPEN = 12;
/** The fixed point of the hover's growth: the top cap's centre, the body's pivot. */
const O: Pt = [16, 16];
/** The right wing's hinge (the left is mirrored in x = 16) and its lobe (centre and outer radius). */
export const BEE_HINGE: Pt = [24, 16];
const LOBE: Pt = [28, 22.1];
const LOBE_R = 4;
const BOX_EDGE = 34; // the 36×36 box's right side

/**
 * How far a wing may open (degrees) with its hinge `tx` px out: the lobe's
 * outer edge reaches the 36×36 box's side (x 34). The lobe's centre sits at
 * (4, 6.1) from the hinge; turned θ, its x is 4 cos θ + 6.1 sin θ.
 */
export function beeOpenMax(tx: number): number {
  const [dx, dy] = [LOBE[0] - BEE_HINGE[0], LOBE[1] - BEE_HINGE[1]];
  const A = Math.hypot(dx, dy);
  const reach = BOX_EDGE - LOBE_R - BEE_HINGE[0] - tx;
  return (
    ((Math.atan2(dy, dx) - Math.acos(Math.min(1, reach / A))) * 180) / Math.PI
  );
}

// ── The reference's tracks ───────────────────────────────────────────────────

/** A track: [frame, value, out y, in y] keys (the eases' x handles are 0.48 and 0.52 throughout). */
type Key = readonly [number, number, number, number];
/* @__NO_SIDE_EFFECTS__ */
function track(keys: readonly Key[]): (frame: number) => number {
  const eases = keys
    .slice(0, -1)
    .map(([, , o, i]) => cubicBezier(0.48, o, 0.52, i));
  return (t) => {
    if (t <= keys[0][0]) {
      return keys[0][1];
    }
    for (let k = 0; k < keys.length - 1; k++) {
      const [[t0, v0], [t1, v1]] = [keys[k], keys[k + 1]];
      if (t < t1) {
        return v0 + (v1 - v0) * eases[k]((t - t0) / (t1 - t0));
      }
    }
    return keys[keys.length - 1][1];
  };
}
/** wing_l's rotation (wing_r's is its mirror): the wings' beats, degrees. */
const WING = /* @__PURE__ */ track([
  [60, 0, -0.036, 1.028],
  [73, 31, -0.058, 1.075],
  [81, 0, -0.041, 1.032],
  [86, 28, -0.026, 1.033],
  [90, 0, -0.037, 1.029],
  [94, 25, -0.029, 1.037],
  [98, 0, -0.037, 1.029],
  [102, 25, -0.043, 1.056],
  [108, 0, -0.047, 1.037],
  [117, 22, -0.014, 1.018],
  [128.117, 0, 0, 1],
]);
/** The reference's widest beat. */
const WING_PEAK = 31;
/** body's rotation about (16, 16). */
const SWAY = /* @__PURE__ */ track([
  [62.883, 0, 0.029, 0.971],
  [75.488, -12.858, 0.044, 0.956],
  [86.906, 12.713, 0.04, 0.96],
  [98.094, -10.287, 0.032, 0.968],
  [110, 5, 0.045, 0.955],
  [124.232, 0, 0, 1],
]);
/** The body path's keys, as the abdomen's turn about the body's centre. */
const BEND = /* @__PURE__ */ track([
  [67.65, 0, 0.04, 0.96],
  [80, -17.376, 0.04, 0.96],
  [92, 14.74, 0.04, 0.96],
  [103, -17.375, 0.04, 0.96],
  [115, 14.74, 0.04, 0.96],
  [129, 0, 0, 1],
]);
/** body_line_01's rotation about its own centre, and body_line_02's about (16, 16). */
const STRIPE_1 = /* @__PURE__ */ track([
  [64.768, 0, 0.028, 0.972],
  [77, -7.639, 0.044, 0.956],
  [89, 6.827, 0.04, 0.96],
  [100, -9.084, 0.03, 0.97],
  [112, 5.414, 0.035, 0.965],
  [126.117, 0, 0, 1],
]);
const STRIPE_2 = /* @__PURE__ */ track([
  [64.768, 0, 0.028, 0.972],
  [77, -15.858, 0.044, 0.956],
  [89, 15.713, 0.04, 0.96],
  [100, -16.594, 0.03, 0.97],
  [112, 13, 0.035, 0.965],
  [126.117, 0, 0, 1],
]);
/** The reference's motion: frames 60 → 129. */
const FROM = 60;
const FRAMES = 69;
/** The action's pass: the reference 1.25× as fast. */
export const BEE_ACTION_MS = 920;

/** The bee's motion at action time a (0 → 1): every angle in degrees, `beat` the wings' opening as a share of the widest. */
export function beeMotion(a: number): {
  beat: number;
  sway: number;
  bend: number;
  stripe1: number;
  stripe2: number;
} {
  if (a <= 0 || a >= 1) {
    return { beat: 0, sway: 0, bend: 0, stripe1: 0, stripe2: 0 };
  }
  const t = FROM + FRAMES * a;
  return {
    beat: Math.min(1, Math.max(0, WING(t) / WING_PEAK)),
    sway: SWAY(t),
    bend: BEND(t),
    stripe1: STRIPE_1(t),
    stripe2: STRIPE_2(t),
  };
}

// ── Geometry ─────────────────────────────────────────────────────────────────

const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
const turnAbout = (deg: number, [cx, cy]: Pt) => {
  const [c, s] = [Math.cos(deg * D), Math.sin(deg * D)];
  return ([x, y]: Pt): Pt => [
    cx + (x - cx) * c - (y - cy) * s,
    cy + (x - cx) * s + (y - cy) * c,
  ];
};
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];

/** Where two lines (point and direction) meet; null when they're parallel. */
function meet(p: Pt, u: Pt, q: Pt, v: Pt): Pt | null {
  const det = u[0] * v[1] - u[1] * v[0];
  if (Math.abs(det) < 1e-6) {
    return null;
  }
  const t = ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / det;
  return [p[0] + u[0] * t, p[1] + u[1] * t];
}
/**
 * A cubic offset by d to its right (screen, y down: (−dy, dx) of travel):
 * its control polygon's edges offset and met again (Tiller–Hanson), within
 * a few thousandths of a px for the gentle curve of a bent side.
 */
function offsetCubic([p0, p1, p2, p3]: Pt[], d: number): Pt[] {
  const n = (a: Pt, b: Pt): Pt => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [(-(b[1] - a[1]) / l) * d, ((b[0] - a[0]) / l) * d];
  };
  const [n0, n1, n2] = [n(p0, p1), n(p1, p2), n(p2, p3)];
  const dir = (a: Pt, b: Pt): Pt => [b[0] - a[0], b[1] - a[1]];
  const c1 =
    meet(add(p0, n0), dir(p0, p1), add(p1, n1), dir(p1, p2)) ?? add(p1, n1);
  const c2 =
    meet(add(p1, n1), dir(p1, p2), add(p2, n2), dir(p2, p3)) ?? add(p2, n2);
  return [add(p0, n0), c1, c2, add(p3, n2)];
}

/** The body's centreline: grown s, the abdomen bent `bend`°, all swayed `sway`° about (16, 16). Its two sides as cubics (top to bottom), and its caps. */
function bodyLine(s: number, bend: number, sway: number) {
  const r = 5.125 * s;
  const L = 8 * s; // the straight sides' length
  const C: Pt = [16, 16 + 4 * s]; // the body's centre (the bend's pivot)
  const bent = turnAbout(bend, C);
  const sw = turnAbout(sway, O);
  const bentDir = turnAbout(bend, [0, 0]);
  const k = 0.345 * L; // the reference's side handles (44–44.5 of its 128)
  const side = (x: number): Pt[] => {
    const top: Pt = [16 + x, 16];
    const bot = bent([16 + x, 16 + L]);
    return [top, [top[0], top[1] + k], add(bot, bentDir([0, -k])), bot];
  };
  return {
    r,
    sw,
    top: O,
    bottom: bent([16, 16 + L]),
    right: side(r),
    left: side(-r),
  };
}

/** The body's wall (1.75) as an even-odd outline: outside and inside, each two arcs and two offset sides. */
function bodyD(s: number, bend: number, sway: number): string {
  const { r, sw, top, bottom, right, left } = bodyLine(s, bend, sway);
  const down = turnAbout(bend, [0, 0])([0, 1]);
  // One loop d out from the centreline (d < 0: in), clockwise on screen: over the top cap, down the right
  // side, round the bottom cap, up the left side. Offsetting a side to the right of its travel moves it
  // inward (down the right side, up the left), so the sides go out by −d. Each cap is two quarter arcs
  // through its apex: a half circle's ends, rounded, could otherwise pick a centre off the true one.
  const loop = (d: number) => {
    const R = r + d;
    const rs = offsetCubic(right, -d);
    const ls = offsetCubic([...left].reverse(), -d);
    const pts = (q: Pt[]) => q.map((p) => P(sw(p))).join(' ');
    const arc = `A${f(R)} ${f(R)} 0 0 1`;
    const topApex: Pt = [top[0], top[1] - R];
    const bottomApex = add(bottom, mul(down, R));
    return (
      `M${P(sw([top[0] - R, top[1]]))}${arc} ${P(sw(topApex))}${arc} ${P(sw(rs[0]))}C${pts(rs.slice(1))}` +
      `${arc} ${P(sw(bottomApex))}${arc} ${P(sw(ls[0]))}C${pts(ls.slice(1))}Z`
    );
  };
  return loop(HW) + loop(-HW);
}

/** A stripe: a 1.75 band across the body about `c`, turned `deg`, cut to the body's centreline (so its ends meet the wall's middle). */
function stripePts(c: Pt, deg: number, region: Pt[]): Pt[] {
  const t = turnAbout(deg, c);
  const corners: Pt[] = [
    [c[0] - 12, c[1] - HW],
    [c[0] + 12, c[1] - HW],
    [c[0] + 12, c[1] + HW],
    [c[0] - 12, c[1] + HW],
  ];
  const band = corners.map(t);
  return clipConvex(region, band);
}

/** The body's centreline as a polygon (for cutting the stripes). */
function bodyRegion(s: number, bend: number, sway: number): Pt[] {
  const { r, sw, top, bottom, right, left } = bodyLine(s, bend, sway);
  const out: Pt[] = [];
  const arc = (c: Pt, a0: number, a1: number) => {
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const a = (a0 + ((a1 - a0) * i) / n) * D;
      out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
    }
  };
  const cubic = ([p0, p1, p2, p3]: Pt[]) => {
    for (let i = 1; i < 16; i++) {
      const t = i / 16;
      const u = 1 - t;
      out.push(
        add(
          add(mul(p0, u * u * u), mul(p1, 3 * u * u * t)),
          add(mul(p2, 3 * u * t * t), mul(p3, t * t * t))
        )
      );
    }
  };
  arc(top, 180, 360);
  cubic(right);
  arc(bottom, bendOf(right), bendOf(right) + 180);
  cubic([...left].reverse());
  return out.map(sw);
}
/** The bottom cap's start angle: the right side's end, perpendicular to its tangent. */
function bendOf(side: Pt[]): number {
  const [p2, p3] = [side[2], side[3]];
  return (Math.atan2(p3[1] - p2[1], p3[0] - p2[0]) * 180) / Math.PI - 90;
}

/** A wing (Carbon's outline, rigid): hinged at (24 ± tx, 16), open `deg` (outward). */
function wing(i: 1 | 2, tx: number, deg: number) {
  const right = i === 1;
  const hx = right ? BEE_HINGE[0] : 32 - BEE_HINGE[0];
  return {
    d: ART[i],
    transform: `translate(${f(right ? tx : -tx)} 0) rotate(${f(right ? -deg : deg)} ${hx} ${BEE_HINGE[1]})`,
  };
}

// ── The wings give way ───────────────────────────────────────────────────────
//
// The reference's abdomen swings into a wing while it is shut (frames 80, 90
// and 98: 0.1px from touching). Here a wing it comes near opens just enough
// to keep BEE_GAP of clear space, as if brushed aside, and closes again as
// the abdomen swings back; the beats open past that as they would.

/** The least space kept between the body and a wing in the action (px): the space the hinge leaves at the top at the widest beat. */
export const BEE_GAP = 1.4;
let wingPts: Pt[] | undefined;
/** The right wing's outline (Carbon's), sampled. */
const wingOutline = () => (wingPts ??= pathPoints(ART[1].split('Z')[0], 0.25));

/** The body's outer edge on the right, as points (its side and its bottom cap, outside its 1.75 wall); mirrored for the left. */
function bodyEdge(
  s: number,
  bend: number,
  sway: number,
  leftSide: boolean
): Pt[] {
  const { r, sw, right, left, bottom } = bodyLine(s, bend, sway);
  const R = r + HW;
  const side = leftSide
    ? offsetCubic([...left].reverse(), -HW)
    : offsetCubic(right, -HW);
  const out: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const u = 1 - t;
    out.push(
      add(
        add(mul(side[0], u * u * u), mul(side[1], 3 * u * u * t)),
        add(mul(side[2], 3 * u * t * t), mul(side[3], t * t * t))
      )
    );
  }
  const a0 = bendOf(right);
  for (let i = 0; i <= 18; i++) {
    const a = (a0 + (leftSide ? 180 - i * 5 : i * 5)) * D;
    out.push([bottom[0] + R * Math.cos(a), bottom[1] + R * Math.sin(a)]);
  }
  return out.map(sw).map(([x, y]) => (leftSide ? [32 - x, y] : [x, y]) as Pt);
}

/** The space between body points and the right wing hinged tx out, open deg. */
function wingGap(edge: Pt[], tx: number, deg: number): number {
  const t = turnAbout(-deg, BEE_HINGE);
  const w = wingOutline().map((p) => add(t(p), [tx, 0]));
  let m = Infinity;
  for (const p of edge) {
    for (let i = 0; i < w.length; i++) {
      const [a, b] = [w[i], w[(i + 1) % w.length]];
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
      const l = dx * dx + dy * dy;
      const u = l
        ? Math.max(
            0,
            Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)
          )
        : 0;
      m = Math.min(m, Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy));
    }
  }
  return m;
}

/** A wing's opening: at least `deg`, and wider if the body comes within BEE_GAP of it (up to `max`, the box's limit). */
function giveWay(edge: Pt[], tx: number, deg: number, max: number): number {
  if (wingGap(edge, tx, deg) >= BEE_GAP) {
    return deg;
  }
  if (wingGap(edge, tx, max) < BEE_GAP) {
    return max;
  }
  let [lo, hi] = [deg, max];
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    if (wingGap(edge, tx, mid) >= BEE_GAP) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return hi;
}

export interface BeePose {
  /** Growth (0 → 1: BEE_GROW). */
  g: number;
  /** The wings' openings, degrees (outward). */
  openLeft: number;
  openRight: number;
  sway: number;
  bend: number;
  stripe1: number;
  stripe2: number;
}

/** The hover at h: grown, the wings open. */
const hoverPose = (h: number): BeePose => ({
  g: h,
  openLeft: BEE_HOVER_OPEN * h,
  openRight: BEE_HOVER_OPEN * h,
  sway: 0,
  bend: 0,
  stripe1: 0,
  stripe2: 0,
});

/** The action at hover h and action time a: the reference's motion, the beats scaled to the box, the wings giving way. */
export function beeActionPose(h: number, a: number): BeePose {
  const m = beeMotion(a);
  if (!m.beat && !m.sway && !m.bend && !m.stripe1 && !m.stripe2) {
    return hoverPose(h);
  }
  const tx = 8 * BEE_GROW * h;
  const max = beeOpenMax(tx);
  // The hover's opening gives way to the beats: a wing opens to whichever share of the box's widest the beat asks for.
  const open = BEE_HOVER_OPEN * h * (1 - m.beat) + max * m.beat;
  const s = 1 + BEE_GROW * h;
  return {
    g: h,
    openRight: giveWay(bodyEdge(s, m.bend, m.sway, false), tx, open, max),
    openLeft: giveWay(bodyEdge(s, m.bend, m.sway, true), tx, open, max),
    sway: m.sway,
    bend: m.bend,
    stripe1: m.stripe1,
    stripe2: m.stripe2,
  };
}

/** The bee in a pose: at rest, Carbon's paths exactly. */
export function beeShapes(p: BeePose): Shapes {
  const s = 1 + BEE_GROW * p.g;
  const tx = 8 * BEE_GROW * p.g;
  const still = !p.g && !p.sway && !p.bend && !p.stripe1 && !p.stripe2;
  const eye = (c: Pt, i: 3 | 4) => ({
    d: p.g
      ? ringPath(add(O, mul([c[0] - O[0], c[1] - O[1]], s)), 2.625 * s, W)
      : ART[i],
  });
  let body = ART[0];
  let stripes = '';
  if (!still) {
    body = bodyD(s, p.bend, p.sway);
    const region = bodyRegion(s, p.bend, p.sway);
    // Stripe 1 turns about its own centre; stripe 2 about the body's pivot (as the reference's lines do).
    const c1: Pt = [16, 16 + s];
    const c2 = turnAbout(p.stripe2, O)([16, 16 + 7 * s]);
    stripes = [
      stripePts(c1, p.stripe1, region),
      stripePts(c2, p.stripe2, region),
    ]
      .filter((q) => q.length > 2)
      .map((q) => `M${q.map(P).join('L')}Z`)
      .join('');
  }
  return {
    body: { d: body, ...EVENODD },
    stripes: { d: stripes },
    wingRight: wing(1, tx, p.openRight),
    wingLeft: wing(2, tx, p.openLeft),
    eyeLeft: eye([11.5, 5.5], 3),
    eyeRight: eye([20.5, 5.5], 4),
  };
}

export const BeeSpec = /* @__PURE__ */ hoverIcon('Bee', {
  geo: ({ h }) => beeShapes(hoverPose(h)),
  static: /* @__PURE__ */ carbonArt(Bee32),
  action: /* @__PURE__ */ defineAction({
    description:
      "Buzzes: the wings beat five times as the body sways, then the bee settles. It doesn't loop: `loop` and `until` play one pass.",
    duration: BEE_ACTION_MS / 1000,
    loops: false,
    geo: ({ h, a }) => beeShapes(beeActionPose(h, a)),
  }),
});
