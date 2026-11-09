/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Earth32 from '@carbon/icons/es/earth/32.js';
import EarthFilled32 from '@carbon/icons/es/earth--filled/32.js';
import Location32 from '@carbon/icons/es/location/32.js';
import LocationFilled32 from '@carbon/icons/es/location--filled/32.js';
import Star16 from '@carbon/icons/es/star/16.js';
import Star32 from '@carbon/icons/es/star/32.js';
import StarFilled16 from '@carbon/icons/es/star--filled/16.js';
import StarFilled32 from '@carbon/icons/es/star--filled/32.js';
import ThumbsDown32 from '@carbon/icons/es/thumbs-down/32.js';
import ThumbsDownFilled32 from '@carbon/icons/es/thumbs-down--filled/32.js';
import ThumbsUp32 from '@carbon/icons/es/thumbs-up/32.js';
import ThumbsUpFilled32 from '@carbon/icons/es/thumbs-up--filled/32.js';
import Time20 from '@carbon/icons/es/time/20.js';
import Time32 from '@carbon/icons/es/time/32.js';
import TimeFilled32 from '@carbon/icons/es/time--filled/32.js';
import Trophy32 from '@carbon/icons/es/trophy/32.js';
import TrophyFilled32 from '@carbon/icons/es/trophy--filled/32.js';
import {
  carbonArt,
  defineAction,
  fillThenClear,
  hoverIcon,
  toggleIcon,
  TOGGLE_OUT,
  type ActionInput,
  type CarbonIcon,
  type Shapes,
  type ToggleFrame,
  type TweenFn,
  withStatic,
} from '../../engine';
import {
  circlePts,
  clipConvex,
  pathPoints,
  polyPath,
  ringPath,
  type Pt,
} from '../../geometry';
import { filletSegs, strokeOutline } from '../../off';
import { cubicBezier, ENTRANCE, EXIT } from '../../ease';
import { EVENODD, f, lerp } from '../../paint';
import { motionTokens, toEasing } from '../../tokens';
import { cutX, globeStrip, SPHERE, toDisc, type GlobeFace } from './earthGlobe';

const CEarth = /* @__PURE__ */ carbonArt(Earth32);
const CEarthFilled = /* @__PURE__ */ carbonArt(EarthFilled32);
const CLocation = /* @__PURE__ */ carbonArt(Location32);
const CLocationFilled = /* @__PURE__ */ carbonArt(LocationFilled32);
const CStar = /* @__PURE__ */ carbonArt(Star16, Star32);
const CStarFilled = /* @__PURE__ */ carbonArt(StarFilled16, StarFilled32);
const CThumbsDown = /* @__PURE__ */ carbonArt(ThumbsDown32);
const CThumbsDownFilled = /* @__PURE__ */ carbonArt(ThumbsDownFilled32);
const CThumbsUp = /* @__PURE__ */ carbonArt(ThumbsUp32);
const CThumbsUpFilled = /* @__PURE__ */ carbonArt(ThumbsUpFilled32);
const CTime = /* @__PURE__ */ carbonArt(Time20, Time32);
const CTimeFilled = /* @__PURE__ */ carbonArt(TimeFilled32);
const CTrophy = /* @__PURE__ */ carbonArt(Trophy32);
const CTrophyFilled = /* @__PURE__ */ carbonArt(TrophyFilled32);

/**
 * Outline ⇄ filled toggles for state icons: Star, Thumbs up / down, Trophy,
 * Time, Location and Earth, with a hover icon for each end.
 *
 * Toggle (all): the house disc fill (§7.7) via `fillThenClear` (the thumbs
 * on linear time, see their section). One disc grows from one centre, the
 * area centroid of everything it fills, clipped to the inside, in 160ms on the entrance ease; to empty, a hole grows from the
 * same centre in 120ms on the exit ease. The fill shares one even-odd (or,
 * for the thumbs, nonzero) path with the outline it fills, so the two meet
 * with no seam, and anything Carbon's filled drawing knocks out (the clock's
 * hands, the pin's eye, the globe's seas) is in that path too and turns into
 * the knockout as the fill passes it. No masks or clip paths; nothing is
 * transform-scaled.
 *
 * Hover: each end's own hover, built from the same geometry, so a toggle at
 * p = 0 is its outline hover icon and at p = 1 its filled hover icon, at
 * every h. Line weight holds throughout: walls are rebuilt as offsets, rigid
 * parts move whole.
 *
 *  - Star: grows 12.5% about its centre (16, 17.48). The tips reach 1.94px
 *    out; every edge moves 0.86px out, inner and outer alike, so the wall
 *    stays 2px.
 *  - Thumbs up / down: the hand lifts 2px in its pointing direction (up /
 *    down); the cuff holds. Their toggle also plays Thumbs up's rock
 *    (see their section), and their fill is one disc for both parts.
 *  - Trophy: the cup and handles grow 1/7 at constant weight about the
 *    stem's top, so they stay seated on the stem (the cup 2px wider, the rim
 *    2.43px higher, the handles 1.57px further out); the base widens 1px each
 *    side, as the Microphone's base does.
 *  - Time: the ring grows 1px in radius (a ring filling the frame grows 1px);
 *    the minute hand turns 90° clockwise (15 minutes) and the hour hand 7.5°
 *    with it, joined at the centre.
 *  - Location: the pin's head lifts 2px and grows 1px in diameter, and the
 *    eye grows 1px in diameter with it; the point stays, so the sides
 *    lengthen along their tangents at constant weight.
 *  - Earth: the land pans 5px right inside the globe, as the globe turns
 *    (ImageSearch's hills pan). Coasts that meet the rim are extended past
 *    it along their own lines, so land and sea slide in from behind the rim
 *    and nothing detaches from it; no new coast is drawn.
 *
 * Action: Earth and Earth filled turn the globe once: see "Earth's
 * action" below.
 */

// ── Shared ───────────────────────────────────────────────────────────────────

const C: Pt = [16, 16];
type FillShapes = (h: number, p: number, e: number, size?: number) => Shapes;
/** The fill: a disc about `c` of radius `rp`, less a hole of radius `re`. */
type Disc = { c: Pt; rp: number; re: number };

const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
const polyD = (pts: readonly Pt[]) =>
  pts.length > 2 ? polyPath(pts, true) : '';
const circleD = ([cx, cy]: Pt, r: number) =>
  r > 1e-4
    ? `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 1 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 1 ${f(cx - r)} ${f(cy)}Z`
    : '';
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const unit = ([x, y]: Pt): Pt => {
  const l = Math.hypot(x, y);
  return [x / l, y / l];
};

/** The signed area of a polygon (positive: clockwise on screen). */
const area = (pts: readonly Pt[]) =>
  pts.reduce((s, [x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length];
    return s + x0 * y1 - x1 * y0;
  }, 0) / 2;

/** The area centroid of a simple polygon. */
export function areaCentroid(pts: readonly Pt[]): Pt {
  let [a, cx, cy] = [0, 0, 0];
  pts.forEach(([x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length];
    const k = x0 * y1 - x1 * y0;
    [a, cx, cy] = [a + k, cx + (x0 + x1) * k, cy + (y0 + y1) * k];
  });
  return [cx / (3 * a), cy / (3 * a)];
}

/** How far the fill must reach from c to cover `pts`. */
const reachOf = (pts: readonly Pt[], [cx, cy]: Pt) =>
  Math.max(...pts.map(([x, y]) => Math.hypot(x - cx, y - cy))) + 0.5;

const covers = (pts: readonly Pt[], [cx, cy]: Pt, r: number) =>
  pts.every(([x, y]) => Math.hypot(x - cx, y - cy) <= r);

/** `pts` inside the disc of radius r about c: `whole` when it covers them, '' when there is none. */
function clipIn(pts: readonly Pt[], whole: string, c: Pt, r: number): string {
  if (r <= 1e-4 || pts.length < 3) {
    return '';
  }
  if (covers(pts, c, r)) {
    return whole;
  }
  return polyD(clipConvex(pts, circlePts(c, r, 128)));
}

/** The region `pts` (drawn exactly as `whole`) inside the fill (Dp less De), as even-odd subpaths. */
function inFill(
  pts: readonly Pt[],
  whole: string,
  { c, rp, re }: Disc
): string {
  const [a, b] = [clipIn(pts, whole, c, rp), clipIn(pts, whole, c, re)];
  return a === b ? '' : a + b;
}

/** The region outside the fill: `whole` with `inFill` toggled off (a full cover drops the subpath). */
function outsideFill(pts: readonly Pt[], whole: string, disc: Disc): string {
  const k = inFill(pts, whole, disc);
  if (k === '') {
    return whole;
  }
  if (k === whole) {
    return '';
  }
  return k.startsWith(whole) ? k.slice(whole.length) : whole + k;
}

/** The fill disc for a region: from its area centroid, out to its farthest point. */
function discFor(pts: readonly Pt[], p: number, e: number): Disc {
  const c = areaCentroid(pts);
  const r = reachOf(pts, c);
  return { c, rp: r * p, re: r * e };
}

/** The toggle, plus its outline and filled ends as hover icons (as fillToggles' `build`). */
function build(
  name: string,
  statics: readonly [CarbonIcon, CarbonIcon],
  shapes: FillShapes
) {
  return {
    toggle: toggleIcon<'off' | 'on'>(`${name}Toggle`, {
      states: ['off', 'on'],
      statics,
      geo: ({ h, p, e }, size) => shapes(h, p, e, size),
      change: fillThenClear,
    }),
    outline: hoverIcon(name, { geo: ({ h }, size) => shapes(h, 0, 0, size) }),
    filled: hoverIcon(`${name}Filled`, {
      geo: ({ h }, size) => shapes(h, 1, 0, size),
    }),
  };
}

// ── Star ─────────────────────────────────────────────────────────────────────
//
// Carbon's star is regular about (16, 17.479): all ten outer edges sit 6.85
// from it, so moving every edge out by the same distance is the star scaled
// about its centre. Hover: every edge, outer and inner, moves 0.86px out
// (12.5%), so the 2px wall holds; the tips reach 1.94px (the side tips to
// x −0.56 / 32.56, the top to y 0.07).
// The fill grows from the inside's centroid (the same centre).
//
// Carbon draws its own 16px star (points within 0.2 of the 32px one); at
// 16px both ends are that drawing, scaled into the grid.

const STAR_OUT: Pt[] = [
  [16, 2],
  [11.45, 11.22],
  [1.28, 12.69],
  [8.64, 19.87],
  [6.9, 30],
  [16, 25.22],
  [25.1, 30],
  [23.36, 19.87],
  [30.72, 12.7],
  [20.55, 11.22],
];
const STAR_IN: Pt[] = [
  [16, 6.52],
  [18.76, 12.1],
  [19.22, 13.1],
  [20.22, 13.25],
  [26.38, 14.14],
  [22, 18.44],
  [21.25, 19.17],
  [21.43, 20.17],
  [22.48, 26.3],
  [16.97, 23.41],
  [16, 23],
  [15.07, 23.49],
  [9.56, 26.34],
  [10.56, 20.21],
  [10.74, 19.21],
  [10, 18.44],
  [5.58, 14.09],
  [11.74, 13.2],
  [12.74, 13.05],
  [13.2, 12.05],
];
const x2 = (pts: readonly Pt[]): Pt[] => pts.map(([x, y]) => [x * 2, y * 2]);
const STAR_OUT_16 = /* @__PURE__ */ x2([
  [8, 1],
  [5.7, 5.6],
  [0.6, 6.3],
  [4.3, 9.9],
  [3.5, 15],
  [8, 12.6],
  [12.6, 15],
  [11.7, 9.9],
  [15.4, 6.3],
  [10.3, 5.6],
]);
const STAR_IN_16 = /* @__PURE__ */ x2([
  [8, 3.3],
  [9.4, 6.1],
  [9.6, 6.6],
  [10.1, 6.7],
  [13.2, 7.1],
  [11, 9.2],
  [10.6, 9.6],
  [10.7, 10.1],
  [11.2, 13.2],
  [8.4, 11.8],
  [8, 11.5],
  [7.5, 11.7],
  [4.7, 13.1],
  [5.2, 10],
  [5.3, 9.5],
  [5, 9.2],
  [2.8, 7],
  [5.9, 6.6],
  [6.4, 6.5],
  [6.6, 6],
]);
export const STAR_CENTRE: Pt = [16, 17.479];
/** The outer edges' distance from the centre: the hover's 7.5% of it is how far every edge moves. */
const STAR_APOTHEM = 6.85;
export const STAR_GROW = 0.125;

/** A polygon with every edge moved out by d (miter corners): its outline grows at constant weight. */
export function offsetPoly(pts: readonly Pt[], d: number): Pt[] {
  const n = pts.length;
  const s = area(pts) > 0 ? 1 : -1; // clockwise on screen: the outward normal is (dy, −dx)
  const lines = pts.map((a, i) => {
    const b = pts[(i + 1) % n];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nn: Pt = [(s * (b[1] - a[1])) / l, (-s * (b[0] - a[0])) / l];
    return [
      [a[0] + nn[0] * d, a[1] + nn[1] * d],
      [b[0] + nn[0] * d, b[1] + nn[1] * d],
    ] as const;
  });
  return pts.map((_, i) => {
    const [[x1, y1], [x2_, y2_]] = lines[(i + n - 1) % n];
    const [[x3, y3], [x4, y4]] = lines[i];
    const den = (x1 - x2_) * (y3 - y4) - (y1 - y2_) * (x3 - x4);
    if (Math.abs(den) < 1e-9) {
      return [x2_, y2_] as Pt;
    }
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    return [x1 + t * (x2_ - x1), y1 + t * (y2_ - y1)] as Pt;
  });
}

/** The star's outer edge and inside at hover h. */
export function starArt(h: number, size?: number) {
  const d = STAR_GROW * STAR_APOTHEM * h;
  const [out, inn] =
    size === 16 ? [STAR_OUT_16, STAR_IN_16] : [STAR_OUT, STAR_IN];
  return { outer: offsetPoly(out, d), inner: offsetPoly(inn, d) };
}

function starShapes(h: number, p: number, e: number, size?: number): Shapes {
  const { outer, inner } = starArt(h, size);
  return {
    star: {
      d: polyD(outer) + outsideFill(inner, polyD(inner), discFor(inner, p, e)),
      ...EVENODD,
    },
  };
}

const star = build('Star', [CStar, CStarFilled], starShapes);
export const StarSpec = /* @__PURE__ */ withStatic(
  star.outline,
  /* @__PURE__ */ carbonArt(Star16, Star32)
);
export const StarFilledSpec = /* @__PURE__ */ withStatic(
  star.filled,
  /* @__PURE__ */ carbonArt(StarFilled16, StarFilled32)
);
export const StarToggleSpec = star.toggle;

// ── Thumbs up / down ─────────────────────────────────────────────────────────
//
// The reference animation (36×36 comp at 100fps; its art sits 1px in
// from the comp's corner: comp − (1, 1) is Carbon's centrelines exactly) is
// the toggle into filled: two layers, `cuff` (the shared wall, x 9 from y 17
// to 29, static) and `hand` (one closed 2px centreline round the hand and the
// cuff's other three sides). The hand's path keyframes rest → a rocked pose
// at 110ms → rest at 240ms, each leg on cubic-bezier(0.4, 0.14, 0.3, 1): the
// hand rocks back about the wrist and returns. Its foot corners on the cuff
// ((9, 17) and (9, 29)) and the cuff hold; everything else tilts
// anticlockwise and sinks a little, more toward the thumb tip: the fingers'
// right side 6–9°, the thumb tip about 11° (its top corner moves 5px left and
// 0.6px down), the palm's foot 1.5px up. The corners keep their radii. The
// reference doesn't fill.
//
// Here: the hand is that centreline, its straight runs moved between the
// rest and the rocked pose as the reference moves the path's points, its corners
// re-solved where the runs meet and filleted at Carbon's radii (r 1 / 2 / 3 /
// 6 on the centreline), and the whole stroked at 2px (mitred), so the line
// weight holds at every point of the rock. Timing: into filled
// runs 300ms, the hand coming up to the rocked pose in 150ms and bouncing
// back in 150ms, each leg on the reference's own curve; the fill runs over
// the first 150ms on the entrance ease (the standard fill), so it lands as
// the bounce back begins. Back to outline is the same, reversed and
// compressed into 120ms (fast-02): the rock plays backwards while the emptying runs on
// the exit ease. Toggle progress p (and e, emptying) are linear time; the
// geometry applies the curves.
//
// The fill (the house disc, one disc from one centre for both parts: the
// area centroid of the cuff's and the hand's insides together) and Carbon's
// filled drawing, which isn't the outline filled in: its cuff is a 5px bar
// (x 2–7), the hand starts at x 9, and the thumb is 2px narrower. So as the
// fill comes in (by how filled it is, k), the shared wall parts: the cuff's
// right wall moves 3px left and the hand's left wall 1px right, both still
// 2px, opening the 2px gap; the thumb's right wall moves 2px left. Emptying,
// they close again.
//
// Hover (both states): the whole thumb, hand and cuff together, lifts 2px
// in its pointing direction. Thumbs down is all of it mirrored top to bottom (y → 32 − y).
// One nonzero path, so the overlapping walls at the outline end draw no
// doubled edge.

/** The reference's hand path vertices (comp − (1, 1)): at rest, and the rocked pose at 110ms. */
const ROCK_REST: Pt[] = [
  [17, 4],
  [15, 4],
  [14.88, 4.001],
  [13.876, 4.861],
  [13, 11],
  [9, 17],
  [3, 17],
  [3, 29],
  [9, 29],
  [22.999, 29],
  [27.24, 27.24],
  [29, 23],
  [29, 16.001],
  [25.999, 13],
  [19, 13],
  [19, 6],
];
const ROCK_POSE: Pt[] = [
  [11.945, 3.411],
  [10.086, 4.047],
  [9.975, 4.086],
  [9.314, 5.205],
  [10.359, 11.289],
  [8.994, 17.012],
  [3, 17],
  [3, 29],
  [9, 29],
  [22.806, 27.533],
  [26.753, 25.185],
  [27.972, 20.987],
  [27.968, 13.988],
  [23.491, 10.407],
  [16.574, 12.41],
  [14.441, 4.635],
];
/** The reference's two legs, each on cubic-bezier(0.4, 0.14, 0.3, 1): up to the rocked pose in 150ms, back in 150ms. */
const ROCK_EASE = /* @__PURE__ */ cubicBezier(0.4, 0.14, 0.3, 1);
export const THUMB_IN_MS = 300;
export const ROCK_PEAK = 150 / THUMB_IN_MS;
/** The fill's share of the toggle-in: its first 150ms. */
const FILL_SHARE = 150 / THUMB_IN_MS;
/** How far the hand has rocked (0 rest, 1 the rocked pose) at linear time t of the toggle. */
export const thumbRock = (t: number) =>
  t <= ROCK_PEAK
    ? ROCK_EASE(t / ROCK_PEAK)
    : 1 - ROCK_EASE((t - ROCK_PEAK) / (1 - ROCK_PEAK));
export const THUMB_LIFT = 2;

type Line = { p: Pt; u: Pt };
const through = (a: Pt, b: Pt): Line => ({
  p: a,
  u: unit([b[0] - a[0], b[1] - a[1]]),
});
/** Where two lines cross. */
function meet(a: Line, b: Line): Pt {
  const den = a.u[0] * b.u[1] - a.u[1] * b.u[0];
  const t = ((b.p[0] - a.p[0]) * b.u[1] - (b.p[1] - a.p[1]) * b.u[0]) / den;
  return [a.p[0] + a.u[0] * t, a.p[1] + a.u[1] * t];
}

/**
 * The thumbs' centrelines at hover h, fill k and rock r: the hand (its
 * corners and their fillet radii) and the cuff, unmirrored.
 */
export function thumbParts(h: number, k: number, r = 0) {
  const V = ROCK_REST.map(
    (v, i): Pt => [
      lerp(v[0], ROCK_POSE[i][0], r),
      lerp(v[1], ROCK_POSE[i][1], r) - THUMB_LIFT * h,
    ]
  );
  const tr = through(V[15], V[14]);
  const lines = {
    left: { p: [9 + k, 0] as Pt, u: [0, 1] as Pt },
    diag: through(V[5], V[4]),
    thumb: through(V[4], V[3]),
    top: through(V[2], V[0]),
    // The thumb's right side, moved 2k toward the thumb's inside (its left normal).
    right: {
      p: [tr.p[0] - tr.u[1] * 2 * k, tr.p[1] + tr.u[0] * 2 * k] as Pt,
      u: tr.u,
    },
    fingers: through(V[14], V[13]),
    side: through(V[12], V[11]),
    foot: through(V[9], V[8]),
  };
  const L = lines;
  const hand = [
    meet(L.left, L.diag),
    meet(L.diag, L.thumb),
    meet(L.thumb, L.top),
    meet(L.top, L.right),
    meet(L.right, L.fingers),
    meet(L.fingers, L.side),
    meet(L.side, L.foot),
    meet(L.foot, L.left),
  ];
  const xc = 9 - 3 * k;
  const cy = THUMB_LIFT * h;
  return {
    hand,
    radii: [0, 0, 1, 2, 0, 3, 6, 0],
    cuff: [
      [3, 17 - cy],
      [xc, 17 - cy],
      [xc, 29 - cy],
      [3, 29 - cy],
    ] as Pt[],
    xl: 8 + k,
    xc: xc + 1,
  };
}

/** A closed centreline stroked 2px: [outer edge, inner edge] polygons, the inner wound the other way. */
function wall(pts: readonly Pt[], radii: readonly number[]): [Pt[], Pt[]] {
  const [a, b] = strokeOutline(filletSegs(pts, radii, true), 2).loops!;
  const [o, i] = Math.abs(area(a)) > Math.abs(area(b)) ? [a, b] : [b, a];
  return [o, area(i) > 0 === area(o) > 0 ? [...i].reverse() : i];
}

/** The thumbs' [cuff, hand] walls (unmirrored) at hover h, fill k and rock r: each [outer edge, inner edge]. */
export function thumbWalls(h: number, k: number, r = 0): [Pt[], Pt[]][] {
  const { hand, radii, cuff } = thumbParts(h, k, r);
  return [wall(cuff, [0, 0, 0, 0]), wall(hand, radii)];
}

const THUMB_IN = {
  duration: THUMB_IN_MS / 1000,
  ease: [0, 0, 1, 1] as [number, number, number, number],
};
const THUMB_OUT = {
  duration: TOGGLE_OUT.duration,
  ease: [0, 0, 1, 1] as [number, number, number, number],
};
/** fillThenClear on linear time (the geometry applies the eases and the rock). */
const thumbChange = (
  turningOn: boolean,
  fr: ToggleFrame,
  tween: TweenFn,
  repaint: () => void
) => {
  if (turningOn) {
    return fr.e > 0 ? tween('e', 0, THUMB_IN) : tween('p', 1, THUMB_IN);
  }
  if (fr.p < 1) {
    return tween('p', 0, THUMB_OUT);
  }
  return tween('e', 1, THUMB_OUT, () => {
    fr.p = 0;
    fr.e = 0;
    repaint();
  });
};

function thumbShapes(flip: boolean): FillShapes {
  const at = ([x, y]: Pt): Pt => [x, flip ? 32 - y : y];
  return (h, p, e) => {
    const [fp, fe] = [ENTRANCE(Math.min(1, p / FILL_SHARE)), EXIT(e)];
    const k = fp * (1 - fe);
    // Back to outline the hand holds still: only the emptying plays.
    const rock = e > 0 ? 0 : thumbRock(p);
    const parts = thumbWalls(h, k, rock).map(([o, i]) => [
      o.map(at),
      i.map(at),
    ]);
    // One disc, from the area centroid of both insides together, out to the farthest point of either.
    const holes = parts.map(([, i]) => i);
    const areas = holes.map((q) => Math.abs(area(q)));
    const cs = holes.map(areaCentroid);
    const c: Pt = [
      (cs[0][0] * areas[0] + cs[1][0] * areas[1]) / (areas[0] + areas[1]),
      (cs[0][1] * areas[0] + cs[1][1] * areas[1]) / (areas[0] + areas[1]),
    ];
    const reach = Math.max(...holes.map((q) => reachOf(q, c)));
    const [rp, re] = [reach * fp, reach * fe];
    let d = '';
    for (const [o, hole] of parts) {
      const outerWay = area(o) > 0;
      const part = (r: number, asOuter: boolean) => {
        if (r <= 1e-4) {
          return '';
        }
        if (covers(hole, c, r)) {
          return 'whole';
        }
        const q = clipConvex(hole, circlePts(c, r, 128));
        return polyD(
          area(q) > 0 === (asOuter === outerWay) ? q : [...q].reverse()
        );
      };
      const [fa, fb] = [part(rp, true), part(re, false)];
      // The hole (wound against the outer edge), the fill in it (with it), the emptying hole in the fill (against).
      const holeD = polyD(hole);
      const inside =
        fa === ''
          ? holeD
          : fa === 'whole'
            ? fb === 'whole'
              ? holeD
              : fb
            : holeD + fa + fb;
      d += polyD(o) + inside;
    }
    return { thumb: { d } };
  };
}

function thumbs(
  name: string,
  flip: boolean,
  statics: readonly [CarbonIcon, CarbonIcon]
) {
  const shapes = thumbShapes(flip);
  return {
    toggle: toggleIcon<'off' | 'on'>(`${name}Toggle`, {
      states: ['off', 'on'],
      statics,
      geo: ({ h, p, e }) => shapes(h, p, e),
      change: thumbChange,
    }),
    outline: hoverIcon(name, { geo: ({ h }) => shapes(h, 0, 0) }),
    filled: hoverIcon(`${name}Filled`, { geo: ({ h }) => shapes(h, 1, 0) }),
  };
}

const thumbsUp = thumbs('ThumbsUp', false, [CThumbsUp, CThumbsUpFilled]);
export const ThumbsUpSpec = /* @__PURE__ */ withStatic(
  thumbsUp.outline,
  /* @__PURE__ */ carbonArt(ThumbsUp32)
);
export const ThumbsUpFilledSpec = /* @__PURE__ */ withStatic(
  thumbsUp.filled,
  /* @__PURE__ */ carbonArt(ThumbsUpFilled32)
);
export const ThumbsUpToggleSpec = thumbsUp.toggle;
const thumbsDown = thumbs('ThumbsDown', true, [CThumbsDown, CThumbsDownFilled]);
export const ThumbsDownSpec = /* @__PURE__ */ withStatic(
  thumbsDown.outline,
  /* @__PURE__ */ carbonArt(ThumbsDown32)
);
export const ThumbsDownFilledSpec = /* @__PURE__ */ withStatic(
  thumbsDown.filled,
  /* @__PURE__ */ carbonArt(ThumbsDownFilled32)
);
export const ThumbsDownToggleSpec = thumbsDown.toggle;

// ── Trophy ───────────────────────────────────────────────────────────────────
//
// trophy--filled is the outline with the cup's inside filled (the handles
// stay open).
//
// Hover: the cup and handles grow 1/7 (14.3%) about the stem's top (16, 22)
// at constant weight (`weightScale`: every point scales, then every edge
// moves back into its wall by the growth, so walls stay 2px and corners stay
// sharp), so the cup stays seated on the stem: 2px wider, the rim 2.43px
// higher, the handles 1.57px further out. The stem keeps its 2px and its
// foot; the base widens 1px each side, as the Microphone's base does. The
// fill grows from the cup inside's centroid.

const TROPHY_OUTER =
  'M26 7L24 7L24 6A2.0023 2.0023 0 0 0 22 4L10 4A2.0023 2.0023 0 0 0 8 6L8 7L6 7A2.0023 2.0023 0 0 0 4 9L4 12A4.0045 4.0045 0 0 0 8 16L8.322 16A8.1689 8.1689 0 0 0 15 21.9341L15 26L10 26L10 28L22 28L22 26L17 26L17 21.9311A7.9661 7.9661 0 0 0 23.74 16L24 16A4.0045 4.0045 0 0 0 28 12L28 9A2.0023 2.0023 0 0 0 26 7Z';
const TROPHY_HANDLES =
  'M8 14A2.0023 2.0023 0 0 1 6 12L6 9L8 9ZM26 12A2.0023 2.0023 0 0 1 24 14L24 9L26 9Z';
const TROPHY_CUP =
  'M22 14A6 6 0 0 1 15.8145 19.9971A6.1991 6.1991 0 0 1 10 13.7065L10 6L22 6Z';
/** The cup's centreline grows by 1/7: its outside (16 wide) grows 2px. */
export const TROPHY_GROW = 1 / 7;
export const TROPHY_BASE = 1;
const TROPHY_PIVOT: Pt = [16, 22];

type Sub = {
  start: Pt;
  segs: { cmd: 'L' | 'A'; to: Pt; r?: number; flags?: [number, number] }[];
};
/** Absolute subpaths of M, L and circular A commands. */
function subs(d: string): Sub[] {
  const tok = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  const out: Sub[] = [];
  let i = 0;
  const num = () => Number(tok[i++]);
  while (i < tok.length) {
    const c = tok[i++];
    if (c === 'M') {
      out.push({ start: [num(), num()], segs: [] });
    } else if (c === 'L') {
      out[out.length - 1].segs.push({ cmd: 'L', to: [num(), num()] });
    } else if (c === 'A') {
      const [r, , , large, sweep] = [num(), num(), num(), num(), num()];
      out[out.length - 1].segs.push({
        cmd: 'A',
        r,
        flags: [large, sweep],
        to: [num(), num()],
      });
    } else if (c !== 'Z') {
      throw new Error(`subs: "${c}"`);
    }
  }
  return out;
}

/** Whether p is inked by the even-odd path made of `polys`. */
const inked = (polys: readonly Pt[][], [x, y]: Pt) =>
  polys.reduce((odd, pts) => {
    let k = odd;
    pts.forEach(([x0, y0], i) => {
      const [x1, y1] = pts[(i + 1) % pts.length];
      if (y0 <= y !== y1 <= y && x < x0 + ((y - y0) * (x1 - x0)) / (y1 - y0)) {
        k = !k;
      }
    });
    return k;
  }, false);

/** An arc's centre from its ends, radius and flags. */
function arcCentre(
  a: Pt,
  b: Pt,
  r: number,
  [large, sweep]: [number, number]
): Pt {
  const [mx, my, dx, dy] = [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
    b[0] - a[0],
    b[1] - a[1],
  ];
  const q = Math.hypot(dx, dy);
  const h =
    Math.sqrt(Math.max(0, r * r - (q * q) / 4)) * (large === sweep ? -1 : 1);
  return [mx - (dy / q) * h, my + (dx / q) * h];
}

/**
 * A drawing of 2px walls scaled by s about O at constant weight: every point
 * scales, then every edge moves back into its wall by (s − 1) (a line along
 * its normal, an arc by changing its radius), corners where the edges meet
 * again. Points `hold` returns a place for stay there (the stem and base).
 */
export function weightScale(
  d: string,
  O: Pt,
  s: number,
  hold: (p: Pt) => Pt | null = () => null
): string {
  const all = subs(d);
  const polys = all.map((sp) =>
    pathPoints(
      `M${P(sp.start)}${sp.segs.map((g) => (g.cmd === 'L' ? `L${P(g.to)}` : `A${g.r} ${g.r} 0 ${g.flags![0]} ${g.flags![1]} ${P(g.to)}`)).join('')}Z`,
      0.25
    )
  );
  const k = s - 1;
  return all
    .map((sp) => {
      // Segments as [from, to, segment] (closing with a line where it doesn't end at the start).
      const segs = sp.segs.map((g, i) => ({
        ...g,
        from: i ? sp.segs[i - 1].to : sp.start,
      }));
      const last = segs[segs.length - 1];
      if (
        Math.hypot(last.to[0] - sp.start[0], last.to[1] - sp.start[1]) > 1e-6
      ) {
        segs.push({ cmd: 'L', to: sp.start, from: last.to });
      }
      // Each segment's normal into the ink at either end, and for arcs whether the ink lies toward the centre.
      const info = segs.map((g) => {
        const c =
          g.cmd === 'A' ? arcCentre(g.from, g.to, g.r!, g.flags!) : null;
        const nAt = (p: Pt): Pt => {
          if (c) {
            const l = Math.hypot(p[0] - c[0], p[1] - c[1]);
            return [(c[0] - p[0]) / l, (c[1] - p[1]) / l];
          }
          const l = Math.hypot(g.to[0] - g.from[0], g.to[1] - g.from[1]);
          return [-(g.to[1] - g.from[1]) / l, (g.to[0] - g.from[0]) / l];
        };
        const mid: Pt = c
          ? ((q) => q[Math.floor(q.length / 2)])(
              pathPoints(
                `M${P(g.from)}A${g.r} ${g.r} 0 ${g.flags![0]} ${g.flags![1]} ${P(g.to)}`,
                0.05
              )
            )
          : [(g.from[0] + g.to[0]) / 2, (g.from[1] + g.to[1]) / 2];
        const nm = nAt(mid);
        const sign = inked(polys, [mid[0] + nm[0] * 0.3, mid[1] + nm[1] * 0.3])
          ? 1
          : -1;
        return {
          c,
          sign,
          n0: nAt(g.from).map((v) => v * sign) as unknown as Pt,
          n1: nAt(g.to).map((v) => v * sign) as unknown as Pt,
        };
      });
      const move = (p: Pt, nIn: Pt, nOut: Pt): Pt => {
        const held = hold(p);
        if (held) {
          return held;
        }
        const dot = nIn[0] * nOut[0] + nIn[1] * nOut[1];
        const m: Pt = [
          (nIn[0] + nOut[0]) / (1 + dot),
          (nIn[1] + nOut[1]) / (1 + dot),
        ];
        return [
          O[0] + (p[0] - O[0]) * s + k * m[0],
          O[1] + (p[1] - O[1]) * s + k * m[1],
        ];
      };
      const n = segs.length;
      const pts = segs.map((g, i) =>
        move(g.from, info[(i + n - 1) % n].n1, info[i].n0)
      );
      let out = `M${P(pts[0])}`;
      segs.forEach((g, i) => {
        const to = pts[(i + 1) % n];
        if (g.cmd === 'L') {
          out += `L${P(to)}`;
        } else {
          // Ink toward the centre (sign 1): the edge's radius shrinks back by k; ink outside: it grows.
          const r = g.r! * s - k * info[i].sign;
          out += `A${f(r)} ${f(r)} 0 ${g.flags![0]} ${g.flags![1]} ${P(to)}`;
        }
      });
      return `${out}Z`;
    })
    .join('');
}

/** The trophy at hover h: the outline (outer edge and handle holes) and the cup's inside. */
export function trophyArt(h: number) {
  const s = 1 + TROPHY_GROW * h;
  const w = TROPHY_BASE * h;
  // The stem's foot and the base hold (the base's ends move out w).
  const hold = ([x, y]: Pt): Pt | null =>
    y < 25 ? null : [x <= 10 + 1e-6 ? x - w : x >= 22 - 1e-6 ? x + w : x, y];
  const art = weightScale(
    TROPHY_OUTER + TROPHY_HANDLES + TROPHY_CUP,
    TROPHY_PIVOT,
    s,
    hold
  ).split(/(?=M)/);
  return { outer: art.slice(0, 3).join(''), cup: art[3] };
}

function trophyShapes(h: number, p: number, e: number): Shapes {
  const { outer, cup } = trophyArt(h);
  const pts = pathPoints(cup, 0.25);
  return {
    trophy: {
      d: outer + outsideFill(pts, cup, discFor(pts, p, e)),
      ...EVENODD,
    },
  };
}

const trophy = build('Trophy', [CTrophy, CTrophyFilled], trophyShapes);
export const TrophySpec = /* @__PURE__ */ withStatic(
  trophy.outline,
  /* @__PURE__ */ carbonArt(Trophy32)
);
export const TrophyFilledSpec = /* @__PURE__ */ withStatic(
  trophy.filled,
  /* @__PURE__ */ carbonArt(TrophyFilled32)
);
export const TrophyToggleSpec = trophy.toggle;

// ── Time ─────────────────────────────────────────────────────────────────────
//
// The ring (r 13, 2px) and the hands as one 2px stroke, mitred at the
// centre (Carbon's hands are exactly that). Hover: the ring grows 1px in
// radius; the minute hand turns 90° clockwise about the centre (15 minutes)
// and the hour hand 7.5° (its share of them), and the mitre at the centre
// follows the angle between them. Filled (as the
// circled signs): a disc out to the ring's outer edge with the hands
// knocked out of it; fully filled, the ring is hidden under the disc. The
// disc is drawn in time--filled's own (slightly flatter) form.
//
// Carbon's 20px outline clock is its own drawing (ring r 13.36, 2.08 wide;
// minute hand to 6.4, hour hand to 21.52); there's no 20px filled clock, so
// at 20px the art eases onto the 32px one as the fill comes in.

const MINUTE_TURN = 90;
const HOUR_TURN = 7.5;
/**
 * A disc in time--filled's own form: four cubics with handles 7.6/14 of the
 * radius (a true circle's are 0.5523), up to 0.07px inside a circle on the
 * diagonals, as subtract--filled draws it. As exact arcs it misses parity.
 */
const CARBON_HANDLE = 7.6 / 14;
function carbonDisc([cx, cy]: Pt, r: number): string {
  if (r <= 1e-4) {
    return '';
  }
  const k = r * CARBON_HANDLE;
  const [t, b, l, rr] = [f(cy - r), f(cy + r), f(cx - r), f(cx + r)];
  return (
    `M${f(cx)} ${t}C${f(cx - k)} ${t} ${l} ${f(cy - k)} ${l} ${f(cy)}C${l} ${f(cy + k)} ${f(cx - k)} ${b} ${f(cx)} ${b}` +
    `C${f(cx + k)} ${b} ${rr} ${f(cy + k)} ${rr} ${f(cy)}C${rr} ${f(cy - k)} ${f(cx + k)} ${t} ${f(cx)} ${t}Z`
  );
}
/** The clock's art: `k20` of the way to the 20px drawing. */
export function timeArt(h: number, k20: number) {
  const r = lerp(13, 13.36, k20) + h;
  const w = lerp(2, 2.08, k20);
  const len = lerp(9, 9.6, k20);
  const t = (MINUTE_TURN * h * Math.PI) / 180;
  const hour = lerp(5.295, 5.52, k20) * Math.SQRT2;
  const th = ((135 + HOUR_TURN * h) * Math.PI) / 180;
  const minuteTip: Pt = [16 + len * Math.sin(t), 16 - len * Math.cos(t)];
  const hourTip: Pt = [16 + hour * Math.sin(th), 16 - hour * Math.cos(th)];
  const hands = strokeOutline(
    [
      { k: 'L', a: minuteTip, b: C },
      { k: 'L', a: C, b: hourTip },
    ],
    2
  ).open!;
  return { r, w, hands };
}

function timeShapes(h: number, p: number, e: number, size?: number): Shapes {
  const { r, w, hands } = timeArt(h, size === 20 ? 1 - p * (1 - e) : 0);
  const R = r + w / 2;
  const disc: Disc = { c: C, rp: R * p, re: R * e };
  const handsD = polyD(hands);
  return {
    ring: { d: ringPath(C, r, w), opacity: p >= 1 && e <= 0 ? 0 : 1 },
    hands: { d: outsideFill(hands, handsD, disc), ...EVENODD },
    fill: {
      d:
        carbonDisc(C, R * p) +
        carbonDisc(C, R * e) +
        inFill(hands, handsD, disc),
      ...EVENODD,
    },
  };
}

const time = build('Time', [CTime, CTimeFilled], timeShapes);
export const TimeSpec = /* @__PURE__ */ withStatic(
  time.outline,
  /* @__PURE__ */ carbonArt(Time20, Time32)
);
export const TimeFilledSpec = /* @__PURE__ */ withStatic(
  time.filled,
  /* @__PURE__ */ carbonArt(TimeFilled32)
);
export const TimeToggleSpec = time.toggle;

// ── Location ─────────────────────────────────────────────────────────────────
//
// The pin is a teardrop: the head's circle (outer r 11 about (16, 13))
// with straight sides tangent to it from the point (16, 30); its inside is
// the same 2px in (r 9, its point 3.09 higher). The eye is a 2px ring
// (r 3–5). Hover: the head and eye lift 2px and both grow 1px in diameter
// (the head r 11 → 11.5 outside, 9 → 9.5 inside; the eye r 3–5 → 3.5–5.5);
// the point stays, so the sides lengthen along their tangents, and the
// inside's point is re-solved so the wall stays 2px. The head's top reaches
// y −0.5.
//
// Filled, Carbon knocks out a plain r 4 hole for the eye (4.5 on hover). The fill grows
// from the inside's centroid round the eye (the eye's own disc is never
// filled, so the disc starts at the eye's edge); once it has closed round
// the eye, the eye's hole opens 3 → 4 to meet it. Emptying, the hole closes
// back to 3 in the first 15% as the emptying disc starts round the eye.

const PIN_TIP: Pt = [16, 30];
export const PIN_LIFT = 2;
/** How much the head's and eye's radii grow on hover (1px in diameter). */
export const PIN_GROW = 0.5;

/** A teardrop: a circle (centre c, radius r) and the sides tangent to it from `tip`. */
function teardropD(c: Pt, r: number, tip: Pt): string {
  const dist = Math.hypot(tip[0] - c[0], tip[1] - c[1]);
  const b = Math.acos(r / dist); // angle at the centre between "down" and the tangent point
  const [L, R] = [
    [c[0] - r * Math.sin(b), c[1] + r * Math.cos(b)],
    [c[0] + r * Math.sin(b), c[1] + r * Math.cos(b)],
  ] as Pt[];
  return `M${P(tip)}L${P(L)}A${f(r)} ${f(r)} 0 1 1 ${P(R)}Z`;
}

/** The pin's parts at hover h. */
export function pinArt(h: number) {
  const head: Pt = [16, 13 - PIN_LIFT * h];
  const g = PIN_GROW * h;
  const dist = PIN_TIP[1] - head[1];
  const innerTip: Pt = [16, PIN_TIP[1] - (2 * dist) / (11 + g)];
  return {
    head,
    eye: 5 + g,
    outer: teardropD(head, 11 + g, PIN_TIP),
    inner: teardropD(head, 9 + g, innerTip),
  };
}

function locationShapes(h: number, p: number, e: number): Shapes {
  const { head, eye, outer, inner } = pinArt(h);
  const pts = pathPoints(inner, 0.25);
  const c = areaCentroid(pts);
  const reach = reachOf(pts, c);
  const dc = Math.hypot(c[0] - head[0], c[1] - head[1]);
  // The eye's own disc is never filled, so the fill starts where it first
  // shows, at the eye's edge (r0 from the centre), rather than spending the
  // start of the toggle hidden behind the eye.
  const r0 = eye - dc;
  const [rp, re] = [
    p > 0 ? lerp(r0, reach, p) : 0,
    e > 0 ? lerp(r0, reach, e) : 0,
  ];
  // The eye's hole opens 1px (3 → 4 at rest) once the fill has closed round
  // the eye, and closes again in the first 15% of the emptying, before the
  // hole has uncovered much of the eye's edge.
  const closed = (dc + eye - r0) / (reach - r0);
  const opened = clamp01((p - closed) / (1 - closed)) * (1 - clamp01(e / 0.15));
  const disc: Disc = { c, rp, re };
  return {
    pin: {
      d:
        outer +
        outsideFill(pts, inner, disc) +
        outsideFill(circlePts(head, eye, 128), circleD(head, eye), disc) +
        circleD(head, eye - 2 + opened),
      ...EVENODD,
    },
  };
}

const location = build(
  'Location',
  [CLocation, CLocationFilled],
  locationShapes
);
export const LocationSpec = /* @__PURE__ */ withStatic(
  location.outline,
  /* @__PURE__ */ carbonArt(Location32)
);
export const LocationFilledSpec = /* @__PURE__ */ withStatic(
  location.filled,
  /* @__PURE__ */ carbonArt(LocationFilled32)
);
export const LocationToggleSpec = location.toggle;

// ── Earth ────────────────────────────────────────────────────────────────────
//
// The globe: a 2px rim round a circle of diameter 26 about (16, 16), growing to 27 on hover (r 13 → 13.5), and
// the land inside it, the world map (earthGlobe.ts) wrapped round a sphere under the rim: its coasts stroked
// 2px (mitred), cut to the rim's centreline circle as geometry (flush in the middle of the rim, so no cut edge
// shows), drawn with the rim in one nonzero path. Filled, the land inside its coasts is filled in.
//
// At rest the globe shows the map centred on the Atlantic (EARTH_FACE): the Americas on the left, Europe and
// Africa on the right, the Arctic running up under the rim. The hover and the action turn it (see "Earth's hover
// and action" below); the rest is the turn at 0.
//
// The toggle is the house fill: one disc from one centre, the area centroid of all the land's insides, fills them;
// emptying, a hole from the same centre.

/** The rim's centreline (and the map's clip): r 13, 13.5 on hover. */
export const EARTH_RIM = 13;
export const EARTH_RIM_GROW = 0.5;
const MITER_LIMIT = 4;

/** Points on the circle about C of radius R from angle a0 going `dir` (±1) to a1. */
function arcBetween(
  C: Pt,
  R: number,
  a0: number,
  a1: number,
  dir: number
): Pt[] {
  let span = (a1 - a0) * dir;
  while (span < 0) {
    span += 2 * Math.PI;
  }
  const n = Math.max(1, Math.ceil(span / (Math.PI / 90)));
  return Array.from({ length: n - 1 }, (_, k) => {
    const a = a0 + (dir * span * (k + 1)) / n;
    return [C[0] + R * Math.cos(a), C[1] + R * Math.sin(a)] as Pt;
  });
}

/**
 * A simple polygon cut to the disc of radius R about C, exactly: its runs
 * inside the circle, joined along the circle. Gives every separate piece
 * (Sutherland–Hodgman would bridge them). Keeps the polygon's winding.
 */
export function clipToDisc(
  poly: readonly Pt[],
  R: number,
  C: Pt = [16, 16]
): Pt[][] {
  const n = poly.length;
  if (n < 3) {
    return [];
  }
  const inside = (p: Pt) => Math.hypot(p[0] - C[0], p[1] - C[1]) <= R;
  // The polygon walked as vertices and crossings, in order.
  type Item = { p: Pt; cross?: 'in' | 'out'; ang?: number };
  const ring: Item[] = [];
  for (let k = 0; k < n; k++) {
    const [a, b] = [poly[k], poly[(k + 1) % n]];
    ring.push({ p: a });
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const [fx, fy] = [a[0] - C[0], a[1] - C[1]];
    const A = dx * dx + dy * dy,
      B = 2 * (fx * dx + fy * dy),
      Cc = fx * fx + fy * fy - R * R;
    const disc = B * B - 4 * A * Cc;
    if (disc <= 0 || A < 1e-12) {
      continue;
    }
    const sq = Math.sqrt(disc);
    for (const t of [(-B - sq) / (2 * A), (-B + sq) / (2 * A)]) {
      if (t <= 1e-9 || t >= 1 - 1e-9) {
        continue;
      }
      const p: Pt = [a[0] + dx * t, a[1] + dy * t];
      const ahead: Pt = [a[0] + dx * (t + 1e-6), a[1] + dy * (t + 1e-6)];
      ring.push({
        p,
        cross: inside(ahead) ? 'in' : 'out',
        ang: Math.atan2(p[1] - C[1], p[0] - C[0]),
      });
    }
  }
  const entries = ring
    .map((it, k) => (it.cross === 'in' ? k : -1))
    .filter((k) => k >= 0);
  if (!entries.length) {
    if (inside(poly[0])) {
      return [[...poly]];
    }
    // Wholly outside, or wrapped round the disc: then the whole circle, in the polygon's winding.
    let odd = false;
    poly.forEach(([x0, y0], k) => {
      const [x1, y1] = poly[(k + 1) % n];
      if (
        y0 <= C[1] !== y1 <= C[1] &&
        C[0] < x0 + ((C[1] - y0) * (x1 - x0)) / (y1 - y0)
      ) {
        odd = !odd;
      }
    });
    if (!odd) {
      return [];
    }
    const circle = circlePts(C, R, 256);
    return [
      area(poly) > 0 === area(circle) > 0 ? circle : [...circle].reverse(),
    ];
  }
  const dir = area(poly) > 0 ? 1 : -1;
  const used = new Set<number>();
  const out: Pt[][] = [];
  for (const start of entries) {
    if (used.has(start)) {
      continue;
    }
    const piece: Pt[] = [];
    let k = start;
    for (let guard = 0; guard < ring.length + entries.length + 2; guard++) {
      used.add(k);
      piece.push(ring[k].p);
      // Along the polygon to the next exit.
      let j = (k + 1) % ring.length;
      while (ring[j].cross !== 'out') {
        piece.push(ring[j].p);
        j = (j + 1) % ring.length;
      }
      piece.push(ring[j].p);
      // Round the circle, the polygon's way, to the nearest entry.
      const a0 = ring[j].ang!;
      // (A line drawn out and back across the circle leaves and comes back in at one point: no way round.)
      const sweep = (e: number) => {
        const s =
          ((((ring[e].ang! - a0) * dir) % (2 * Math.PI)) + 2 * Math.PI) %
          (2 * Math.PI);
        return s > 2 * Math.PI - 1e-9 ? 0 : s;
      };
      const next = entries.reduce(
        (best, e) => (sweep(e) < sweep(best) ? e : best),
        entries[0]
      );
      if (sweep(next) > 0) {
        piece.push(...arcBetween(C, R, a0, ring[next].ang!, dir));
      }
      if (next === start) {
        break;
      }
      k = next;
    }
    out.push(piece);
  }
  return out;
}

/** Wound positive (way 1) or negative (−1). */
const wound = (pts: Pt[], way: 1 | -1) =>
  (area(pts) > 0 ? 1 : -1) === way ? pts : [...pts].reverse();
/** Distance from the globe's centre. */
const fromC = ([x, y]: Pt) => Math.hypot(x - C[0], y - C[1]);
/** The point of the segment a–b nearest p. */
function nearestTo(p: Pt, a: Pt, b: Pt): Pt {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = dx * dx + dy * dy;
  const u = l
    ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l))
    : 0;
  return [a[0] + u * dx, a[1] + u * dy];
}

/**
 * A closed line's 2px stroke (mitred joins, bevelled past the miter limit)
 * as convex pieces, each wound positive: a quad per run and a wedge per
 * join on the outside of the turn. Together (nonzero) they're the stroke,
 * and each piece clips to a circle cleanly. With `near` (the turning globe,
 * whose lines run far past the disc), only what can reach inside the circle
 * of that radius about (16, 16): runs within a half-width of it, and joins
 * at corners within a mitre's reach of it.
 */
function strokePieces(line: readonly Pt[], w = 2, near = Infinity): Pt[][] {
  const pts = area(line) > 0 ? [...line] : [...line].reverse();
  const n = pts.length;
  const h = w / 2;
  const nrm = (a: Pt, b: Pt): Pt => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [(b[1] - a[1]) / l, -(b[0] - a[0]) / l];
  };
  const out: Pt[][] = [];
  for (let k = 0; k < n; k++) {
    const [a, b] = [pts[k], pts[(k + 1) % n]];
    const m = nrm(a, b);
    if (fromC(nearestTo(C, a, b)) < near + h) {
      out.push(
        wound(
          [
            [a[0] + m[0] * h, a[1] + m[1] * h],
            [b[0] + m[0] * h, b[1] + m[1] * h],
            [b[0] - m[0] * h, b[1] - m[1] * h],
            [a[0] - m[0] * h, a[1] - m[1] * h],
          ],
          1
        )
      );
    }
    // The join at b, on the outside of the turn.
    const c = pts[(k + 2) % n];
    const m2 = nrm(b, c);
    const turn = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    // (In line, on or back along itself, there's no join: a line drawn out and back ends square.)
    if (
      Math.abs(turn) <
        1e-9 *
          Math.hypot(b[0] - a[0], b[1] - a[1]) *
          Math.hypot(c[0] - b[0], c[1] - b[1]) ||
      fromC(b) >= near + MITER_LIMIT * h
    ) {
      continue;
    }
    const s = turn > 0 ? 1 : -1; // a convex turn opens on the outward side (+normal), a reflex one inward
    const [p0, p1]: Pt[] = [
      [b[0] + s * m[0] * h, b[1] + s * m[1] * h],
      [b[0] + s * m2[0] * h, b[1] + s * m2[1] * h],
    ];
    const cosT = m[0] * m2[0] + m[1] * m2[1];
    const half = Math.sqrt(Math.max(0, (1 + cosT) / 2)); // cos of half the angle between the normals
    if (half > 1e-6 && 1 / half <= MITER_LIMIT) {
      const bis = unit([s * (m[0] + m2[0]), s * (m[1] + m2[1])]);
      const tip: Pt = [b[0] + bis[0] * (h / half), b[1] + bis[1] * (h / half)];
      out.push(wound([b, p0, tip, p1], 1));
    } else {
      // Past the limit the mitre is cut square MITER_LIMIT half-widths out (SVG's miter-clip), so as a turning
      // corner sharpens its join never jumps to a bevel. (The map has no corner this sharp at rest.)
      const [u, v] = [
        unit([b[0] - a[0], b[1] - a[1]]),
        unit([c[0] - b[0], c[1] - b[1]]),
      ];
      const out2 = unit([u[0] - v[0], u[1] - v[1]]);
      const cut = (p: Pt, d: Pt): Pt => {
        const t =
          (MITER_LIMIT * h -
            ((p[0] - b[0]) * out2[0] + (p[1] - b[1]) * out2[1])) /
          (d[0] * out2[0] + d[1] * out2[1]);
        return [p[0] + d[0] * t, p[1] + d[1] * t];
      };
      out.push(wound([b, p0, cut(p0, u), cut(p1, [-v[0], -v[1]]), p1], 1));
    }
  }
  return out;
}

/** The globe at hover h: turned EARTH_HOVER_TURN·h (see "Earth's hover and action"). */
const earthShapes = (h: number, p: number, e: number): Shapes =>
  drawEarth(earthTurnArt(EARTH_HOVER_TURN * h, h), p, e);

/** The globe drawn: the rim, the land's stroke, and (filled, p) its inside, less the emptying hole (e). */
function drawEarth(
  { R, stroke, inside }: ReturnType<typeof earthTurnArt>,
  p: number,
  e: number
): Shapes {
  const rim =
    polyD(wound(circlePts(C, R + 1, 256), 1)) +
    polyD(wound(circlePts(C, R - 1, 256), -1));
  // One disc for every inside, from their area centroid together.
  const areas = inside.map((q) => Math.abs(area(q)));
  const total = areas.reduce((a, b) => a + b, 0) || 1;
  const cs = inside.map(areaCentroid);
  const c: Pt = [
    cs.reduce((s, q, k) => s + q[0] * areas[k], 0) / total,
    cs.reduce((s, q, k) => s + q[1] * areas[k], 0) / total,
  ];
  const reach = Math.max(0, ...inside.map((q) => reachOf(q, c)));
  const part = (q: Pt[], r: number, way: 1 | -1) =>
    r <= 1e-4
      ? ''
      : covers(q, c, r)
        ? polyD(wound(q, way))
        : clipToDisc(q, r, c)
            .map((x) => polyD(wound(x, way)))
            .join('');
  let d = rim + stroke.map(polyD).join('');
  // The fill (with the stroke), less the emptying hole (against it): nonzero, so the stroke stays inked over both.
  if (p > 0 && !(e >= 1)) {
    for (const q of inside) {
      d += part(q, reach * p, 1) + part(q, reach * e, -1);
    }
  }
  return { earth: { d } };
}

// ── Earth's hover and action: the globe turns ────────────────────────────────
//
// The action turns the globe a full turn, with natural warping of geometry
// round the globe (an SVG approximation, not true 3D); the hover borrows the
// globe curve. The land is the world map, wrapped round the sphere (earthGlobe.ts).
//
// The globe is a strip map (earthGlobe.ts, globeStrip): every point of the map
// a longitude λ from the face's centre and its row on screen. Turned by θ, a
// strip point is drawn at x = 16 + ρ·sin(λ + θ): land narrows towards the limb
// and goes behind it. The globe turns east, as the Earth does, so new land
// comes in from the left.
//
// Each frame, every strip line (and its copies a turn either side) is cut to
// within 133° of the view's centre, drawn onto the disc and eased under the
// rim near it (underRim); nothing in it is chosen per frame (no simplifying,
// a sharp corner's mitre is clipped rather than switched to a bevel, a join
// near the rim is kept while its mitre could reach in), so the land changes
// smoothly with θ. Its outline is stroked 2px on every frame (strokePieces),
// so walls never thin as the land narrows, and stroke and inside are cut to
// the rim's circle as geometry.
//
// Near the rim, while it turns, the drawn globe is eased out under the rim
// (underRim): one smooth, increasing remap of the radius, so land within
// EARTH_SLIVER of the rim's centreline is under the rim's ink and the 2 units
// inside that open out to it. Slivers too thin to read at 16px stay under the
// rim, and land only ever slides in and out from under it: no piece appears
// or goes in a frame. It eases in over the first 30° of a turn and out over
// the last, so the rest is untouched.
//
// Hover: the globe turns EARTH_HOVER_TURN east (asin(4/14), 16.6°: the
// centre of the face moves 4px) and the rim grows 0.5px;
// the hover out turns it back. Action: one full turn on from wherever the
// hover has it, 360° in 1000ms on Carbon's standard productive easing; it
// lands on the rest drawing.

/** While the globe turns, land less than this far in from the rim's centreline is under the rim (underRim). */
export const EARTH_SLIVER = 2.5;
/** The turn, in seconds. */
export const EARTH_TURN = 1;
/** The hover's turn (radians): the face's centre moves 4px, as the old pan did. */
export const EARTH_HOVER_TURN = Math.asin(4 / SPHERE);

/**
 * Earth's face: the map centred on the Atlantic, the Americas on the left, Europe and Africa on the right,
 * 1.8 map px (7.4°) west of 54.5, so the sea between South America and the rim is a whole pixel at 16px.
 */
export const EARTH_FACE: GlobeFace = { centre: 52.7 };
let strip: Pt[][] | undefined;
const earthStrip = () => (strip ??= globeStrip(EARTH_FACE));

/**
 * The drawn globe eased out under the rim near its edge, by k (0 at rest, 1 turning): a point less than
 * EARTH_SLIVER + 2 in from the rim's centreline moves out along its ray, smoothly (a smoothstep over those 2 units),
 * so that EARTH_SLIVER in lands on the centreline, under the rim's ink, and anything shallower goes past it. It is
 * one smooth, increasing remap of the radius: lines keep their order and land slides in and out under the rim.
 */
function underRim([x, y]: Pt, R: number, k: number): Pt {
  const r = Math.hypot(x - C[0], y - C[1]);
  const u = Math.min(1, Math.max(0, (r - (R - EARTH_SLIVER - 2)) / 2));
  if (!u || !k) {
    return [x, y];
  }
  const s = (r + k * EARTH_SLIVER * u * u * (3 - 2 * u)) / r;
  return [C[0] + (x - C[0]) * s, C[1] + (y - C[1]) * s];
}

/**
 * The globe turned by θ (radians east; 0 and 2π are the rest) at hover h:
 * the rim's radius and the land's stroke (convex pieces) and inside, cut to
 * the rim's circle.
 */
export function earthTurnArt(theta: number, h: number) {
  const R = EARTH_RIM + EARTH_RIM_GROW * h;
  // Whole turns draw the same globe: the turn within one, and how far it is from the rest.
  const t = theta - 2 * Math.PI * Math.floor(theta / (2 * Math.PI));
  const k = Math.min(1, Math.min(t, 2 * Math.PI - t) / (Math.PI / 6)) ** 2;
  const reach = Math.PI / 2 + 0.75;
  const lines: Pt[][] = [];
  for (const shape of earthStrip()) {
    for (const turn of [-2 * Math.PI, 0, 2 * Math.PI]) {
      const band = cutX(
        shape.map(([l, y]) => [l + t + turn, y] as Pt),
        -reach,
        reach
      );
      if (band.length < 3) {
        continue;
      }
      // (No simplifying here: which points a simplification keeps flips from frame to frame, a small jump each time.)
      const line = band.map(toDisc).map((p) => underRim(p, R, k));
      if (Math.abs(area(line)) > 1e-6) {
        lines.push(wound(line, 1));
      }
    }
  }
  const clip = circlePts(C, R, 256);
  const stroke = lines
    .flatMap((q) => strokePieces(q, 2, R))
    .map((q) => (q.every((p) => fromC(p) <= R) ? q : clipConvex(q, clip)))
    .filter((q) => q.length > 2);
  // (Pieces with no area, where a line just touches the circle, would have no centre for the fill.)
  const inside = lines.flatMap((q) =>
    clipToDisc(q, R)
      .filter((r) => Math.abs(area(r)) > 1e-6)
      .map((r) => wound(r, 1))
  );
  return { R, stroke, inside };
}

/** Earth's action (the outline, p 0, or the filled, p 1): the globe turns once, east. */
function turnAction(p: 0 | 1): ActionInput {
  return {
    description:
      "The globe turns once to the east: the land slides around it until the map comes back to where it started. It doesn't loop: `loop` and `until` play one pass.",
    duration: EARTH_TURN,
    ease: toEasing(motionTokens.easing.standard),
    loops: false,
    geo: ({ h, a }) =>
      a <= 0 || a >= 1
        ? earthShapes(h, p, 0)
        : drawEarth(
            earthTurnArt(EARTH_HOVER_TURN * h + 2 * Math.PI * a, h),
            p,
            0
          ),
  };
}

// Earth and Earth filled are the toggle's two ends as hover icons (as `build` makes them), with the action.
export const EarthSpec = /* @__PURE__ */ hoverIcon('Earth', {
  geo: ({ h }) => earthShapes(h, 0, 0),
  static: /* @__PURE__ */ carbonArt(Earth32),
  action: /* @__PURE__ */ defineAction(/* @__PURE__ */ turnAction(0)),
});
export const EarthFilledSpec = /* @__PURE__ */ hoverIcon('EarthFilled', {
  geo: ({ h }) => earthShapes(h, 1, 0),
  static: /* @__PURE__ */ carbonArt(EarthFilled32),
  action: /* @__PURE__ */ defineAction(/* @__PURE__ */ turnAction(1)),
});
export const EarthToggleSpec = build(
  'Earth',
  [CEarth, CEarthFilled],
  earthShapes
).toggle;
