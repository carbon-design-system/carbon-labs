/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Forum32 from '@carbon/icons/es/forum/32.js';
import Wikis32 from '@carbon/icons/es/wikis/32.js';
import Chip32 from '@carbon/icons/es/chip/32.js';
import Headset32 from '@carbon/icons/es/headset/32.js';
import Model32 from '@carbon/icons/es/model/32.js';
import ContainerRegistry32 from '@carbon/icons/es/container-registry/32.js';
import Building32 from '@carbon/icons/es/building/32.js';
import Enterprise32 from '@carbon/icons/es/enterprise/32.js';
import Tree32 from '@carbon/icons/es/tree/32.js';
import Package32 from '@carbon/icons/es/package/32.js';
import Replicate32 from '@carbon/icons/es/replicate/32.js';
import Identification32 from '@carbon/icons/es/identification/32.js';
import Education32 from '@carbon/icons/es/education/32.js';
import { hoverIcon, carbonArt } from '../../engine';
import {
  framePath,
  mapPath,
  pathPoints,
  polyPath,
  rectPath,
  ringPath,
  type Pt,
} from '../../geometry';
import { EVENODD, f } from '../../paint';
import { bandPath, grown, personShapes, type Person } from '../people/people';

/**
 * Tech, enterprise and people-adjacent objects on the frame engine: Forum,
 * Wikis, Chip, Headset, Model, Container registry, Building, Enterprise,
 * Tree, Package, Replicate, Identification and Education. Carbon has one
 * (32px) drawing of each, so one geometry serves every size, and each rests
 * on Carbon's outline. On hover the parts move as geometry at a constant 2px
 * wall: points move, nothing is transform-scaled, no masks, clip paths or
 * opacity. Standard hover (160ms entrance ease in, 120ms exit out) unless
 * noted.
 *
 *  - Forum: Chat's bubble motion on both bubbles. The front bubble grows 2px
 *    on every side, its tail's tip holding (as Chat's); the bubble behind
 *    grows 2px out at its corner (up and left) with its arms' ends holding,
 *    so the 2px between the two holds.
 *  - Wikis: the globe spins one meridian spacing about its axis: the
 *    meridians slide across at full length, their curves changing as they
 *    go, one peeling out of the ring on the left as the right one merges
 *    into it; ring and equator hold. Lands on Carbon's drawing.
 *  - Chip: grows 1px on every side (it fills the frame with its pins): the
 *    package's walls step 1px out with their pins riding on them, and the
 *    die grows 1px a side too, so the 3px between them holds.
 *  - Headset: the band flexes open: each ear cup (and its side of the band)
 *    steps 1px out and the arch grows 1px in radius about its centre, so its
 *    top lifts 1px. The mic holds its place and grows 1px in diameter; its
 *    boom rides out with the right side and is re-cut where it meets the mic.
 *  - Model: the two top nodes slide 4px in toward the middle and their links
 *    swing with them; the bottom nodes hold.
 *  - Container registry: every square grows 1px; the stack grows up and out
 *    from its fixed bottom, the loose square steps 1.5px further out (its
 *    gaps to the stack 2 → 3.5), and
 *    the rack's lid stubs draw back 1px to keep their space to the stack.
 *  - Building: the low wing's roof rises 2px and the door grows 2px taller;
 *    the tower and its windows hold.
 *  - Enterprise: the tower rises 2px and widens 1px a side, covering 1px of
 *    the low wing, which holds; its windows stay centred (up 1px).
 *  - Tree: grows 2px taller, and the canopy grows 1px on every side; the
 *    branch inside it keeps its size and rides up; the roots reach 2px
 *    further along the ground, left and right.
 *  - Package: as Download: the arrow reaches 2px down into the box (its head
 *    moves, the shaft lengthens behind it) and the box widens 2px on each
 *    side (walls and lid stubs step out); the slot reaches 1px at each end.
 *  - Replicate: the boxes part 1px each (the copy up-right, the front box
 *    down-left) and each grows 1px a side, the dashed copy as Select
 *    window's selection box does.
 *  - Identification: the People family motion: the shoulders 2px wider, the
 *    head 1px larger in diameter (its bottom held). The card fills the frame,
 *    so it grows 1px a side, keeping the person's 2px space to its right
 *    wall; the text lines ride 1px left with it and 1px up, and lengthen 1px.
 *  - Education: the People family motion: shoulders 2px wider, the head
 *    (under the cap) 1px larger in diameter with the chin held, so the cap
 *    and its tassel ride up 1px; the board widens 2px at each end and the
 *    tassel lengthens 2px.
 */

const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
/** A polygon wound clockwise on screen, so overlapping pieces union under nonzero fill. */
function cw(pts: readonly Pt[]): string {
  const area = pts.reduce(
    (s, p, i) =>
      s +
      p[0] * pts[(i + 1) % pts.length][1] -
      pts[(i + 1) % pts.length][0] * p[1],
    0
  );
  return polyPath(area >= 0 ? pts : [...pts].reverse(), true);
}

// ── Forum ────────────────────────────────────────────────────────────────────
//
// The front bubble: outer box 6–30 × 6–24 (Carbon's cubic r2 corners), inner
// square-cornered 8–28 × 8–22, its bottom wall open from x 16 to the tail,
// whose tip (16, 28.8)/(17.6, 30) holds while the bottom wall moves down, so
// the tail's sides meet it further along their own lines (as Chat's tail).
// The bubble behind: an L (2–18 × 2–18, outer corner r3, inner r1) whose arm
// ends (x 18, y 18) hold while its corner moves 2px up and left.

/** How far each bubble grows (Chat's 2px). */
export const FORUM_GROW = 2;
/** The tail's sides, as dx per dy from the tip. */
const TAIL_IN = 4.8 / 6.8;
const TAIL_OUT = 4.2 / 6;

function forumFront(g: number): string {
  const [l, t, r, b] = [6 - g, 6 - g, 30 + g, 24 + g];
  const xi = 16 + (28.8 - (b - 2)) * TAIL_IN;
  const xo = 17.6 + (30 - b) * TAIL_OUT;
  return (
    `M${f(r - 2)} ${f(t)}H${f(l + 2)}C${f(l + 0.8)} ${f(t)} ${f(l)} ${f(t + 0.8)} ${f(l)} ${f(t + 2)}V${f(b - 2)}` +
    `C${f(l)} ${f(b - 0.8)} ${f(l + 0.8)} ${f(b)} ${f(l + 2)} ${f(b)}H16V${f(b - 2)}H${f(l + 2)}V${f(t + 2)}H${f(r - 2)}V${f(b - 2)}` +
    `H${f(xi)}L16 28.8L17.6 30L${f(xo)} ${f(b)}H${f(r - 2)}C${f(r - 0.8)} ${f(b)} ${f(r)} ${f(b - 0.8)} ${f(r)} ${f(b - 2)}` +
    `V${f(t + 2)}C${f(r)} ${f(t + 0.8)} ${f(r - 0.8)} ${f(t)} ${f(r - 2)} ${f(t)}Z`
  );
}
function forumBack(g: number): string {
  const k = (v: number) => f(v - g);
  return (
    `M${k(4)} 18H${k(2)}V${k(5)}C${k(2)} ${k(3.3)} ${k(3.3)} ${k(2)} ${k(5)} ${k(2)}H18V${k(4)}H${k(5)}` +
    `C${k(4.4)} ${k(4)} ${k(4)} ${k(4.4)} ${k(4)} ${k(5)}V18Z`
  );
}

export const ForumSpec = /* @__PURE__ */ hoverIcon('Forum', {
  geo: ({ h }) => ({
    back: { d: forumBack(FORUM_GROW * h) },
    front: { d: forumFront(FORUM_GROW * h) },
  }),
  static: /* @__PURE__ */ carbonArt(Forum32),
});

// ── Wikis ────────────────────────────────────────────────────────────────────
//
// The globe spins about its axis. The ring and the equator hold; the meridians slide across.
//
// A meridian is a 2px band about a circular centreline, as Carbon draws
// them, in two halves that meet under the equator: each half's centreline
// runs through its equator point (16 + s, 16 ∓ lift) and meets the ring's
// centreline circle (r 13) at x = 16 + 0.255·s, so it reaches the ring at an
// angle and ends square there, inside the ring's wall. Within 5px of the
// axis the lift is 0.42 (fitted to Carbon's arcs: within 0.013px); further
// out it eases to 0 at the limb. Carbon's two meridians are s = ±5.
//
// The spin turns the globe one meridian spacing and lands back on Carbon's
// drawing (no trimming, no snapping). Every meridian always
// runs its full length. The middle one crosses from s = −5 to 5 (longitude
// −22.6° → 22.6°, s = 13·sin λ); the right one runs out from 5 to the limb
// and a new one comes in from the limb to −5. At the limb (s = ±13) a
// meridian's centreline is the ring's own centreline (the circle through
// (29, 16) and a point of the ring, centred on the equator, is the ring), so
// its ink converges into the ring's and becomes it: the outgoing meridian
// merges into the ring and the incoming one peels out of it, continuously.
// On their way they pass quickly (h 0.45–0.55) through 9–11px from the axis,
// where the crescent between a meridian and the ring narrows from 2px to
// nothing; beyond 11px their ink overlaps the ring's. Standard hover timing.

const GLOBE_C: Pt = [16, 16];
const GLOBE_R = 13; // the ring's centreline
/** Carbon's meridians' longitude (they sit 5px either side of the axis at the equator). */
const MERIDIAN_LON = Math.asin(5 / GLOBE_R);
/** Where a meridian's centreline meets the ring, as a share of its equator offset, and how far each half's equator point sits off the equator near the axis. */
const POLE_LEAN = 0.255;
const HALF_LIFT = 0.42;
/**
 * The outgoing meridian's equator offset through the spin, as knots [h, s]
 * joined by a monotone cubic: through the narrow-crescent band (9–11px) in a
 * tenth of the hover's progress; the incoming meridian mirrors it.
 */
export const LIMB_PATH: Array<[h: number, s: number]> = [
  [0, 5],
  [0.45, 9],
  [0.55, 11],
  [1, 13],
];

/** A monotone cubic (Fritsch–Carlson) through knots, at x. */
function monotone(
  knots: ReadonlyArray<readonly [number, number]>,
  x: number
): number {
  const n = knots.length;
  const d = knots
    .slice(1)
    .map(([x1, y1], i) => (y1 - knots[i][1]) / (x1 - knots[i][0]));
  const m = knots.map((_, i) =>
    i === 0
      ? d[0]
      : i === n - 1
        ? d[n - 2]
        : d[i - 1] * d[i] <= 0
          ? 0
          : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i])
  );
  const i = Math.max(
    0,
    Math.min(
      n - 2,
      knots.findIndex((_, j) => j < n - 1 && x <= knots[j + 1][0])
    )
  );
  const [[x0, y0], [x1, y1]] = [knots[i], knots[i + 1]];
  const w = x1 - x0;
  const t = Math.max(0, Math.min(1, (x - x0) / w));
  const [t2, t3] = [t * t, t * t * t];
  return (
    (2 * t3 - 3 * t2 + 1) * y0 +
    (t3 - 2 * t2 + t) * w * m[i] +
    (-2 * t3 + 3 * t2) * y1 +
    (t3 - t2) * w * m[i + 1]
  );
}

/** Half the meridian at equator offset s (dir −1 the upper half, 1 the lower): from under the equator bar to the ring, its end square. */
function meridianHalf(s: number, dir: -1 | 1): string {
  const a = Math.abs(s);
  const k = Math.max(0, Math.min(1, (a - 5) / (GLOBE_R - 5)));
  const lift = HALF_LIFT * (1 - k * k * (3 - 2 * k));
  const q = POLE_LEAN * s;
  const [ex, ey, qx, qy] = [
    16 + s,
    16 + dir * lift,
    16 + q,
    16 + dir * Math.sqrt(GLOBE_R * GLOBE_R - q * q),
  ];
  const cx = (qx * qx + (ey - qy) ** 2 - ex * ex) / (2 * (qx - ex)); // the centreline's centre, level with its equator point
  const rho = Math.abs(cx - ex);
  const yCut = 16 - dir * 0.5;
  const side = Math.sign(ex - cx);
  const tEnd = Math.atan2(qy - ey, qx - cx);
  const tCut = Math.atan2(
    yCut - ey,
    side * Math.sqrt(rho * rho - (yCut - ey) ** 2)
  );
  let turn = tCut - tEnd;
  while (turn > Math.PI) {
    turn -= 2 * Math.PI;
  }
  while (turn <= -Math.PI) {
    turn += 2 * Math.PI;
  }
  const sweep = turn > 0 ? 1 : 0;
  const at = (r: number, t: number): Pt => [
    cx + r * Math.cos(t),
    ey + r * Math.sin(t),
  ];
  const [ro, ri] = [rho + 1, rho - 1];
  return `M${P(at(ro, tEnd))}A${f(ro)} ${f(ro)} 0 0 ${sweep} ${P(at(ro, tCut))}L${P(at(ri, tCut))}A${f(ri)} ${f(ri)} 0 0 ${1 - sweep} ${P(at(ri, tEnd))}Z`;
}

/** The meridian at equator offset s; at the limb it is the ring itself, so it draws nothing more. */
function meridian(s: number): string {
  if (Math.abs(s) >= GLOBE_R - 1e-3) {
    return '';
  }
  if (Math.abs(s) < 0.01) {
    return rectPath(16 + s - 1, 16 - GLOBE_R, 16 + s + 1, 16 + GLOBE_R);
  }
  return meridianHalf(s, -1) + meridianHalf(s, 1);
}

/** The three meridians' equator offsets at hover h: incoming, middle, outgoing. */
export function wikisMeridians(h: number): [number, number, number] {
  return [
    -monotone(LIMB_PATH, 1 - h),
    GLOBE_R * Math.sin(MERIDIAN_LON * (2 * h - 1)),
    monotone(LIMB_PATH, h),
  ];
}

// At rest the globe is Carbon's own drawing (the ring, and a disc hidden in
// its wall less Carbon's six holes between the lines), which rasterises
// exactly as Carbon's; from the first frame of the spin it is the model
// (within 0.013px of it, so nothing jumps).
const GLOBE_HOLES =
  'M28 15H22A24.26 24.26 0 0 0 19.21 4.45A12 12 0 0 1 28 15Z' +
  'M16 28A5 5 0 0 1 15.33 28A21.85 21.85 0 0 1 12 17H20A21.85 21.85 0 0 1 16.7 28A5 5 0 0 1 16 28Z' +
  'M12 15A21.85 21.85 0 0 1 15.3 4A6 6 0 0 1 16.64 4A21.85 21.85 0 0 1 20 15Z' +
  'M12.76 4.45A24.26 24.26 0 0 0 10 15H4A12 12 0 0 1 12.79 4.45Z' +
  'M4.05 17H10.05A24.26 24.26 0 0 0 12.8 27.55A12 12 0 0 1 4.05 17Z' +
  'M19.21 27.55A24.26 24.26 0 0 0 22 17H28A12 12 0 0 1 19.21 27.55Z';
const GLOBE_REST = 'M3 16A13 13 0 1 0 29 16A13 13 0 1 0 3 16Z' + GLOBE_HOLES;

export const WikisSpec = /* @__PURE__ */ hoverIcon('Wikis', {
  geo: ({ h }) => {
    const ring = { d: ringPath(GLOBE_C, GLOBE_R, 2), ...EVENODD };
    if (!h) {
      return {
        ring,
        rest: { d: GLOBE_REST, ...EVENODD },
        equator: { d: '' },
        m0: { d: '' },
        m1: { d: '' },
        m2: { d: '' },
      };
    }
    const [m0, m1, m2] = wikisMeridians(h).map(meridian);
    return {
      ring,
      rest: { d: '', ...EVENODD },
      equator: { d: rectPath(3.5, 15, 28.5, 17) },
      m0: { d: m0 },
      m1: { d: m1 },
      m2: { d: m2 },
    };
  },
  static: /* @__PURE__ */ carbonArt(Wikis32),
});

// ── Chip ─────────────────────────────────────────────────────────────────────
//
// The package: a frame 6–26 square (outer corners r2, inside square) with
// two 2px pins on each side (4px long, at 11–13 and 19–21); the die: a
// square-cornered frame 11–21 inside it, 3px clear.

/** How far the chip grows on each side. */
export const CHIP_GROW = 1;

function chipBody(g: number): string {
  const [lo, hi, a, b] = [6 - g, 26 + g, 2 - g, 30 + g]; // walls' outer edges, pins' ends
  const n = (v: number) => f(v);
  return (
    `M${n(b)} 13V11H${n(hi)}V${n(lo + 2)}A2 2 0 0 0 ${n(hi - 2)} ${n(lo)}H21V${n(a)}H19V${n(lo)}H13V${n(a)}H11V${n(lo)}H${n(lo + 2)}` +
    `A2 2 0 0 0 ${n(lo)} ${n(lo + 2)}V11H${n(a)}V13H${n(lo)}V19H${n(a)}V21H${n(lo)}V${n(hi - 2)}A2 2 0 0 0 ${n(lo + 2)} ${n(hi)}` +
    `H11V${n(b)}H13V${n(hi)}H19V${n(b)}H21V${n(hi)}H${n(hi - 2)}A2 2 0 0 0 ${n(hi)} ${n(hi - 2)}V21H${n(b)}V19H${n(hi)}V13Z` +
    `M${n(hi - 2)} ${n(hi - 2)}H${n(lo + 2)}V${n(lo + 2)}H${n(hi - 2)}Z`
  );
}
const chipDie = (g: number) =>
  `M${f(11 - g)} ${f(11 - g)}V${f(21 + g)}H${f(21 + g)}V${f(11 - g)}Z` +
  `M${f(19 + g)} ${f(19 + g)}H${f(13 - g)}V${f(13 - g)}H${f(19 + g)}Z`;

export const ChipSpec = /* @__PURE__ */ hoverIcon('Chip', {
  geo: ({ h }) => ({
    body: { d: chipBody(CHIP_GROW * h) },
    die: { d: chipDie(CHIP_GROW * h) },
  }),
  static: /* @__PURE__ */ carbonArt(Chip32),
});

// ── Headset ──────────────────────────────────────────────────────────────────
//
// One outline: the arch (centreline r 8 about (16, 11)) down two legs (x 7–9
// and 23–25), each an ear cup's flat side (a D, r 5, with a D hole r 3); the
// right leg runs on into the boom, a 2px arc (r 4–6 about (19, 21)) that
// meets the mic, a ring r 2–4 about (16, 26), at the mic's outer circle.

/** How far each side of the band steps out (and the arch's radius grows). */
export const HEADSET_FLEX = 1;
/** How much the mic's diameter grows. */
export const MIC_GROW = 1;
const MIC: Pt = [16, 26];

/** Where circles (a, ra) and (b, rb) cross, the crossing with the larger x. */
function crossRight(a: Pt, ra: number, b: Pt, rb: number): Pt {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const d = Math.hypot(dx, dy);
  const t = (ra * ra - rb * rb + d * d) / (2 * d);
  const hh = Math.sqrt(Math.max(0, ra * ra - t * t));
  const [mx, my] = [a[0] + (dx * t) / d, a[1] + (dy * t) / d];
  const [p, q]: Pt[] = [
    [mx + (dy * hh) / d, my - (dx * hh) / d],
    [mx - (dy * hh) / d, my + (dx * hh) / d],
  ];
  return p[0] > q[0] ? p : q;
}

function headsetD(g: number, m: number): string {
  const xa = Math.sqrt((9 + g) ** 2 - 1); // the arch's outside meets the cups' tops (y 10)
  const boom: Pt = [19 + g, 21];
  const [mo, mi] = [4 + m / 2, 2 + m / 2]; // the mic ring's outer and inner radii
  const pin = crossRight(boom, 4, MIC, mo);
  const pout = crossRight(boom, 6, MIC, mo);
  const [L, R] = [(v: number) => f(v - g), (v: number) => f(v + g)];
  return (
    `M${R(25)} 10H${f(16 + xa)}A${f(9 + g)} ${f(9 + g)} 0 0 0 ${f(16 - xa)} 10H${L(7)}A5 5 0 0 0 ${L(7)} 20H${L(9)}V11` +
    `A${f(7 + g)} ${f(7 + g)} 0 0 1 ${R(23)} 11V21A4 4 0 0 1 ${P(pin)}A${f(mo)} ${f(mo)} 0 1 0 ${P(pout)}A6 6 0 0 0 ${R(25)} 21V20A5 5 0 0 0 ${R(25)} 10Z` +
    `M${L(4)} 15A3 3 0 0 1 ${L(7)} 12V18A3 3 0 0 1 ${L(4)} 15Z` +
    `M16 ${f(26 + mi)}A${f(mi)} ${f(mi)} 0 1 1 ${f(16 + mi)} 26A${f(mi)} ${f(mi)} 0 0 1 16 ${f(26 + mi)}Z` +
    `M${R(25)} 18V12A3 3 0 0 1 ${R(25)} 18Z`
  );
}

export const HeadsetSpec = /* @__PURE__ */ hoverIcon('Headset', {
  geo: ({ h }) => ({
    headset: { d: headsetD(HEADSET_FLEX * h, MIC_GROW * h) },
  }),
  static: /* @__PURE__ */ carbonArt(Headset32),
});

// ── Model ────────────────────────────────────────────────────────────────────
//
// Five nodes (rings r 1–3) and six 2px links. Every link's centreline runs
// from a top node's centre through a point by its bottom node, as Carbon
// draws them: down to the node below, across to the far bottom corner (1px
// above its centre) and to the bottom middle (0.57px beside its centre).
// Each link ends square where its centreline meets the nodes' centreline
// circles (r 2), inside the ring walls, so it stays joined and never
// reaches a hole.
//
// Hover: the two top
// nodes slide 4px toward the middle (x 4 → 8 and 28 → 24) and their links swing with them, rebuilt each frame from
// the moving node through the same bottom point. The bottom nodes hold. The
// nodes don't grow: one motion reads cleaner.

const TOP: Pt[] = [
  [4, 5],
  [28, 5],
];
const BOTTOM: Pt[] = [
  [4, 27],
  [16, 27],
  [28, 27],
];
/** Each link: its top node, the point its centreline runs through by the bottom, and its bottom node. */
const LINKS: Array<[top: number, through: Pt, bottom: number]> = [
  [0, [4, 27], 0],
  [1, [28, 27], 2],
  [0, [28, 26], 2],
  [1, [4, 26], 0],
  [0, [4 + (22 * 4) / 7, 27], 1],
  [1, [28 - (22 * 4) / 7, 27], 1],
];
/** The nodes' centreline radius. */
const NODE_R = 2;
/** How far each top node slides in. */
export const MODEL_SLIDE = 4;

function linkBand(a: Pt, through: Pt, c: Pt): string {
  const l = Math.hypot(through[0] - a[0], through[1] - a[1]);
  const u: Pt = [(through[0] - a[0]) / l, (through[1] - a[1]) / l];
  const n: Pt = [-u[1], u[0]];
  // The near crossing of the centreline with the bottom node's circle.
  const b = u[0] * (a[0] - c[0]) + u[1] * (a[1] - c[1]);
  const t1 =
    -b -
    Math.sqrt(
      b * b - ((a[0] - c[0]) ** 2 + (a[1] - c[1]) ** 2 - NODE_R * NODE_R)
    );
  const at = (t: number, s: number): Pt => [
    a[0] + u[0] * t + n[0] * s,
    a[1] + u[1] * t + n[1] * s,
  ];
  return cw([at(NODE_R, 1), at(t1, 1), at(t1, -1), at(NODE_R, -1)]);
}

/** The top nodes' centres at hover h. */
export const modelTop = (h: number): Pt[] =>
  TOP.map(([x, y], i) => [x + (i ? -1 : 1) * MODEL_SLIDE * h, y]);

export const ModelSpec = /* @__PURE__ */ hoverIcon('Model', {
  geo: ({ h }) => {
    const top = modelTop(h);
    return {
      links: {
        d: LINKS.map(([t, through, b]) =>
          linkBand(top[t], through, BOTTOM[b])
        ).join(''),
      },
      top: { d: top.map((c) => ringPath(c, NODE_R, 2)).join(''), ...EVENODD },
      bottom: {
        d: BOTTOM.map((c) => ringPath(c, NODE_R, 2)).join(''),
        ...EVENODD,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Model32),
});

// ── Container registry ───────────────────────────────────────────────────────
//
// Carbon's stack: three connected squares (9px, 2px walls shared: 8–17 and
// 15–24 across, 6–15 and 13–22 down; the top right one missing), the loose
// square (19–28 × 2–11) 2px clear of the stack's top-left square and of its
// bottom-right one, and the rack: a tray (2–30 × 20–30, outer corners r2,
// open between lid stubs 4–6 and 26–28) with a dot (r1 at (7, 25)).
//
// Hover: every square grows 1px (9 → 10, its hole 5 → 6). The stack's bottom holds
// at y 22 and it grows up and out, 1px each side (8–24 → 7–25, top 6 → 4).
// The loose square keeps its 2px gaps (Carbon's; it is 2px, not 1): its left
// edge holds at 19 and its bottom rises 1px with the stack's bottom-right
// square's top, so it grows right and up (19–29 × 0–10); and it also steps 1.5px out,
// right and up, so it ends at 20.5–30.5 × −1.5–8.5 and its gaps to the stack
// open from 2 to 3.5. The rack's lid stubs draw back 1px as the stack widens,
// so their 2px space to it holds.

/** How much each square's side grows. */
export const REGISTRY_GROW = 1;
/** How far the loose square steps out (right and up) beyond holding its gaps. */
export const REGISTRY_STEP = 1.5;
function registryStack(k: number): string {
  const [x0, c] = [8 - k, 9 + k]; // the stack's left edge, a square's outer size
  const n = (v: number) => f(v);
  return (
    `M${n(x0 + c)} ${n(22 - c)}V${n(24 - 2 * c)}H${n(x0)}V22H${n(x0 + 2 * c - 2)}V${n(22 - c)}Z` +
    `M${n(x0 + 2)} ${n(26 - 2 * c)}H${n(x0 + c - 2)}V${n(22 - c)}H${n(x0 + 2)}Z` +
    `M${n(x0 + 2)} ${n(24 - c)}H${n(x0 + c - 2)}V20H${n(x0 + 2)}Z` +
    `M${n(x0 + 2 * c - 4)} 20H${n(x0 + c)}V${n(24 - c)}H${n(x0 + 2 * c - 4)}Z`
  );
}
const registryBox = (k: number, o: number) =>
  `M${f(28 + k + o)} ${f(11 - k - o)}H${f(19 + o)}V${f(2 - 2 * k - o)}H${f(28 + k + o)}Z` +
  `M${f(21 + o)} ${f(9 - k - o)}H${f(26 + k + o)}V${f(4 - 2 * k - o)}H${f(21 + o)}Z`;
const registryRack = (k: number) =>
  `M28 20H${f(26 + k)}V22H28V28H4V22H${f(6 - k)}V20H4A2 2 0 0 0 2 22V28A2 2 0 0 0 4 30H28A2 2 0 0 0 30 28V22A2 2 0 0 0 28 20Z` +
  'M6 25A1 1 0 1 0 8 25A1 1 0 1 0 6 25Z';

export const ContainerRegistrySpec = /* @__PURE__ */ hoverIcon(
  'ContainerRegistry',
  {
    geo: ({ h }) => {
      const k = REGISTRY_GROW * h;
      return {
        stack: { d: registryStack(k) },
        box: { d: registryBox(k, REGISTRY_STEP * h) },
        rack: { d: registryRack(k) },
      };
    },
    static: /* @__PURE__ */ carbonArt(ContainerRegistry32),
  }
);

// ── Building, Enterprise ─────────────────────────────────────────────────────

// Building: the low wing's roof rises 2px (y 14 → 12), its walls
// lengthening, and the door grows 2px taller (its top 19 → 17) so its 3px
// space under the wing's roof holds. The tower, its windows, the base and
// the door's foot hold.
export const BUILDING_WING_RISE = 2;
const BUILDING_WINDOWS =
  /* @__PURE__ */ rectPath(18, 8, 20, 10) +
  /* @__PURE__ */ rectPath(24, 8, 26, 10) +
  /* @__PURE__ */ rectPath(18, 14, 20, 16) +
  /* @__PURE__ */ rectPath(24, 14, 26, 16) +
  /* @__PURE__ */ rectPath(18, 20, 20, 22) +
  /* @__PURE__ */ rectPath(24, 20, 26, 22);
const buildingD = (w: number) =>
  `M28 2H16A2 2 0 0 0 14 4V${f(14 - w)}H4A2 2 0 0 0 2 ${f(16 - w)}V30H30V4A2 2 0 0 0 28 2Z` +
  `M9 28V${f(21 - w)}H13V28Z` +
  `M28 28H15V${f(20 - w)}A1 1 0 0 0 14 ${f(19 - w)}H8A1 1 0 0 0 7 ${f(20 - w)}V28H4V${f(16 - w)}H16V4H28Z`;

export const BuildingSpec = /* @__PURE__ */ hoverIcon('Building', {
  geo: ({ h }) => ({
    building: { d: buildingD(BUILDING_WING_RISE * h) },
    windows: { d: BUILDING_WINDOWS },
  }),
  static: /* @__PURE__ */ carbonArt(Building32),
});

// Enterprise: the
// tower's roof rises 2px (y 2 → 0) and it widens 1px on each side (2–22 →
// 1–23). The low wing holds: the tower's right wall, growing over its left
// end, covers 1px of it (its inside 22–28 → 23–28), the shared wall staying
// one 2px wall. The two dashed lines of windows stay centred in the tower:
// across they already are (it grows evenly about x 12), and down they ride
// up 1px, half the roof's rise.
export const ENTERPRISE_RISE = 2;
export const ENTERPRISE_WIDEN = 1;
const ENTERPRISE_WINDOWS: Pt[] = [
  [8, 8],
  [14, 8],
  [8, 14],
  [14, 14],
  [8, 20],
  [14, 20],
];
const enterpriseD = (r: number, g: number) =>
  `M30 14A2 2 0 0 0 28 12H${f(22 + g)}V${f(4 - r)}A2 2 0 0 0 ${f(20 + g)} ${f(2 - r)}` +
  `H${f(4 - g)}A2 2 0 0 0 ${f(2 - g)} ${f(4 - r)}V30H30Z` +
  `M${f(4 - g)} ${f(4 - r)}H${f(20 + g)}V28H${f(4 - g)}Z` +
  `M${f(22 + g)} 28V14H28V28Z`;

export const EnterpriseSpec = /* @__PURE__ */ hoverIcon('Enterprise', {
  geo: ({ h }) => {
    const r = ENTERPRISE_RISE * h;
    return {
      building: { d: enterpriseD(r, ENTERPRISE_WIDEN * h) },
      windows: {
        d: ENTERPRISE_WINDOWS.map(([x, y]) =>
          rectPath(x, y - r / 2, x + 2, y + 4 - r / 2)
        ).join(''),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Enterprise32),
});

// ── Tree ─────────────────────────────────────────────────────────────────────
//
// Two pieces: the branch's trunk (x 12–14, its root running left along the
// ground) bending up-left into the canopy, and the canopy, whose right side
// runs down into the main trunk (x 17–19, its root running right).
//
// Hover: the tree grows 2px taller (everything above
// the roots rises 2px; both trunks lengthen) and the canopy grows 1px on
// every side: both edges of its wall move 1px outward, each along its own
// normal (true offsets of Carbon's outline, so the wall stays 2px and its
// notches stay sharp), and its bottom edge comes 1px down, so the main trunk
// lengthens 1px. The branch keeps its size and rides up 2px; the canopy
// growing away from it opens its space to the canopy's inside by 1px. The
// roots reach 2px further along the ground, the branch's left and the main
// trunk's right.

/** How far the tree rises, how far the canopy grows on each side, and how far each root reaches along the ground. */
export const TREE_RISE = 2;
export const CANOPY_GROW = 1;
export const ROOT_REACH = 2;
/** The branch, its root reaching w further left. */
const treeBranch = (w: number) =>
  `M12 30H${f(9 - w)}V28H12V15.5664L8.4854 13.4575L9.5146 11.7427L13.0293 13.8511A2.0115 2.0115 0 0 1 14 15.5664V28A2.0023 2.0023 0 0 1 12 30Z`;
const TREE_CANOPY =
  'M22 30H19A2.0024 2.0024 0 0 1 17 28V17H23A4.0008 4.0008 0 0 0 26.981 12.604A4.1489 4.1489 0 0 0 22.7853 9H21.2016' +
  'L21.025 8.221C20.452 5.6961 18.0308 4 15 4A6.02 6.02 0 0 0 9.5585 7.4859L9.25 8.1531L8.387 8.0388A2.771 2.771 0 0 0 8 8' +
  'A4 4 0 1 0 8 16V18A6 6 0 1 1 8 6C8.0264 6 8.0525 6 8.0786 6.001A8.0271 8.0271 0 0 1 15 2C18.6788 2 21.6923 3.9776 22.7516 7' +
  'H22.7853A6.1641 6.1641 0 0 1 28.9725 12.4141A6.0011 6.0011 0 0 1 23 19L19 19V28H22Z';
// The canopy's wall as its two edges: the inside (from the main trunk's top, round to the canopy's open end at the left) and the outside (back again).
const CANOPY_INSIDE = TREE_CANOPY.slice(
  TREE_CANOPY.indexOf('V17') + 1,
  TREE_CANOPY.indexOf('V18')
).replace(/^17/, 'M17 17');
const CANOPY_OUTSIDE = `M8 18${TREE_CANOPY.slice(TREE_CANOPY.indexOf('A6 6'), TREE_CANOPY.indexOf('V28H22Z'))}`;

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const cross = (a: Pt, b: Pt) => a[0] * b[1] - a[1] * b[0];
/** Where segments p0–p1 and q0–q1 cross, if they do. */
function segCross(p0: Pt, p1: Pt, q0: Pt, q1: Pt): Pt | null {
  const [r, s] = [sub(p1, p0), sub(q1, q0)];
  const den = cross(r, s);
  if (Math.abs(den) < 1e-12) {
    return null;
  }
  const t = cross(sub(q0, p0), s) / den;
  const u = cross(sub(q0, p0), r) / den;
  return t > 0 && t < 1 && u > 0 && u < 1
    ? [p0[0] + r[0] * t, p0[1] + r[1] * t]
    : null;
}
/**
 * A polyline moved d to the right of its travel (on screen), every vertex on
 * the miter of its two segments' offsets, so straight runs and arcs move
 * exactly d. Where the offset folds back on itself (inside a notch), the
 * loop is cut out at the crossing, leaving the notch sharp.
 */
export function offsetLine(src: readonly Pt[], d: number): Pt[] {
  const pts = src.filter(
    (p, i) =>
      i === 0 || Math.hypot(p[0] - src[i - 1][0], p[1] - src[i - 1][1]) > 1e-6
  );
  const nrm = (a: Pt, b: Pt): Pt => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
  };
  const q = pts.map((p, i): Pt => {
    const ni = i > 0 ? nrm(pts[i - 1], p) : null;
    const no = i < pts.length - 1 ? nrm(p, pts[i + 1]) : null;
    if (!ni || !no) {
      const m = (ni ?? no)!;
      return [p[0] + m[0] * d, p[1] + m[1] * d];
    }
    const k = Math.max(0.2, 1 + ni[0] * no[0] + ni[1] * no[1]);
    return [p[0] + ((ni[0] + no[0]) / k) * d, p[1] + ((ni[1] + no[1]) / k) * d];
  });
  const out: Pt[] = [];
  const WINDOW = 40;
  for (let i = 0; i < q.length - 1; ) {
    out.push(q[i]);
    let next = i + 1;
    for (let j = Math.min(q.length - 2, i + WINDOW); j >= i + 2; j--) {
      const x = segCross(q[i], q[i + 1], q[j], q[j + 1]);
      if (x) {
        out.push(x);
        next = j + 1;
        break;
      }
    }
    i = next;
  }
  out.push(q[q.length - 1]);
  return out;
}

const INSIDE_PTS = [
  [17, 17] as Pt,
  .../* @__PURE__ */ pathPoints(CANOPY_INSIDE, 0.25),
];
const OUTSIDE_PTS = [
  [8, 18] as Pt,
  .../* @__PURE__ */ pathPoints(CANOPY_OUTSIDE, 0.25),
];
const lift =
  (r: number) =>
  (p: Pt): Pt => [p[0], p[1] - r];

/** The canopy and its trunk, the canopy grown g, everything above the root risen r, and the root reaching w further right. */
function canopyD(g: number, r: number, w: number): string {
  if (!g && !r && !w) {
    return TREE_CANOPY;
  }
  // The inside runs with the canopy on its left, so its outward is right of travel; the outside the reverse.
  const inside = offsetLine(INSIDE_PTS, g).map(lift(r));
  const outside = offsetLine(OUTSIDE_PTS, -g).map(lift(r));
  return `M${f(22 + w)} 30H19A2.0024 2.0024 0 0 1 17 28${[...inside, ...outside].map((p) => `L${P(p)}`).join('')}L19 28H${f(22 + w)}Z`;
}
const rise = (d: string, by: number) =>
  by ? mapPath(d, ([x, y]) => [x, y < 27 ? y - by : y]) : d;

export const TreeSpec = /* @__PURE__ */ hoverIcon('Tree', {
  geo: ({ h }) => ({
    branch: { d: rise(treeBranch(ROOT_REACH * h), TREE_RISE * h) },
    canopy: { d: canopyD(CANOPY_GROW * h, TREE_RISE * h, ROOT_REACH * h) },
  }),
  static: /* @__PURE__ */ carbonArt(Tree32),
});

// ── Package ──────────────────────────────────────────────────────────────────
//
// The box: walls 4–28 (outer corners r2) from y 14 to 30, its top open
// between 3px lid stubs (x 6–9 and 23–26); a 2px slot (13–19 × 20–22); and
// Carbon's down arrow (shaft from y 2, tip at (16, 16)).

/** How far the arrow reaches, the box widens on each side (Download's), and the slot reaches at each end. */
export const PACKAGE_REACH = 2;
export const PACKAGE_WIDEN = 2;
export const SLOT_REACH = 1;
const PACKAGE_ARROW: Pt[] = [
  [20.59, 8.59],
  [17, 12.17],
  [17, 2],
  [15, 2],
  [15, 12.17],
  [11.41, 8.59],
  [10, 10],
  [16, 16],
  [22, 10],
];
const packageBox = (g: number) => {
  const [l, r] = [4 - g, 28 + g];
  return (
    `M${f(r - 2)} 30H${f(l + 2)}A2 2 0 0 1 ${f(l)} 28V16A2 2 0 0 1 ${f(l + 2)} 14H${f(l + 5)}V16H${f(l + 2)}V28H${f(r - 2)}` +
    `V16H${f(r - 5)}V14H${f(r - 2)}A2 2 0 0 1 ${f(r)} 16V28A2 2 0 0 1 ${f(r - 2)} 30Z`
  );
};

export const PackageSpec = /* @__PURE__ */ hoverIcon('Package', {
  geo: ({ h }) => ({
    box: { d: packageBox(PACKAGE_WIDEN * h) },
    slot: { d: rectPath(13 - SLOT_REACH * h, 20, 19 + SLOT_REACH * h, 22) },
    arrow: {
      d: polyPath(
        PACKAGE_ARROW.map(
          ([x, y]) => [x, y === 2 ? y : y + PACKAGE_REACH * h] as Pt
        ),
        true
      ),
    },
  }),
  static: /* @__PURE__ */ carbonArt(Package32),
});

// ── Replicate ────────────────────────────────────────────────────────────────
//
// The front box (2–24 × 8–30, outer corners r2) and, behind it, a dashed copy
// (8–30 × 2–24): its top-left and bottom-right corners run into the front
// box's walls (here carried on into them, so they overlap rather than abut),
// and a corner, a top dash and a right dash stand free.
//
// Hover: the two boxes part, the copy 1px up and
// right, the front box 1px down and left,
// and each grows 1px on every side. The copy grows as the dashed selection
// box of Select window and Zoom area does: its corners step 1px out
// diagonally, rigid, and its edge dashes step 1px out and lengthen 1px at
// each end, so the 3px gaps between dashes hold. Its two corners joined to
// the front box stretch to stay joined.

/** How far each box slides (the copy up-right, the front down-left), and grows on each side. */
export const REPLICATE_PART = 1;
export const REPLICATE_GROW = 1;

function replicateCopy(s: number, g: number) {
  // A copy coordinate: its own side's step out (±g), then the slide (+s across, −s down).
  const [x, y] = [
    (v: number, side: number) => f(v + side * g + s),
    (v: number, side: number) => f(v + side * g - s),
  ];
  const front = { top: 10 - g + s, right: 22 + g - s }; // the front box's top and right walls' inner edges
  return {
    joinedTop: `M${x(10, -1)} ${f(front.top)}V${y(4, -1)}H${x(14, -1)}V${y(2, -1)}H${x(10, -1)}A2 2 0 0 0 ${x(8, -1)} ${y(4, -1)}V${f(front.top)}Z`,
    joinedRight: `M${f(front.right)} ${y(22, 1)}H${x(28, 1)}V${y(18, 1)}H${x(30, 1)}V${y(22, 1)}A2 2 0 0 1 ${x(28, 1)} ${y(24, 1)}H${f(front.right)}Z`,
    corner: `M${x(28, 1)} ${y(8, -1)}H${x(30, 1)}V${y(4, -1)}A2 2 0 0 0 ${x(28, 1)} ${y(2, -1)}H${x(24, 1)}V${y(4, -1)}H${x(28, 1)}Z`,
    dashes:
      rectPath(17 - g + s, 2 - g - s, 21 + g + s, 4 - g - s) +
      rectPath(28 + g + s, 11 - g - s, 30 + g + s, 15 + g - s),
  };
}

export const ReplicateSpec = /* @__PURE__ */ hoverIcon('Replicate', {
  geo: ({ h }) => {
    const [s, g] = [REPLICATE_PART * h, REPLICATE_GROW * h];
    const c = replicateCopy(s, g);
    return {
      front: { d: framePath(2 - g - s, 8 - g + s, 24 + g - s, 30 + g + s) },
      joined: { d: c.joinedTop + c.joinedRight },
      corner: { d: c.corner },
      dashes: { d: c.dashes },
    };
  },
  static: /* @__PURE__ */ carbonArt(Replicate32),
});

// ── Identification ───────────────────────────────────────────────────────────

/** The person: head ring r 2–4 about (20, 13); shoulders legs at x 15 and 25 from y 23 up to 19, corners r 1–3. */
const ID_PERSON: Person = {
  head: [20, 13],
  hr: 3,
  body: [
    [15, 23],
    [15, 19],
    [25, 19],
    [25, 23],
  ],
  r: 2,
};
/** How far the card grows on each side (it fills the frame). */
export const ID_CARD_GROW = 1;
/**
 * The text lines ride left with the card's wall (keeping their 2px space to
 * it) and lengthen 1px to the right of that, so their right ends hold and
 * keep 2.5px from the grown head; and they ride up 1px, as the head's top
 * and the card's top do.
 */
export const ID_LINE_REACH = 1;
export const ID_LINE_RISE = 1;

export const IdentificationSpec = /* @__PURE__ */ hoverIcon('Identification', {
  geo: ({ h }) => {
    const g = ID_CARD_GROW * h;
    const [reach, up] = [ID_LINE_REACH * h, ID_LINE_RISE * h];
    return {
      card: { d: framePath(2 - g, 4 - g, 30 + g, 28 + g) },
      lines: {
        d:
          rectPath(6 - g, 10 - up, 13 - g + reach, 12 - up) +
          rectPath(6 - g, 14 - up, 10 - g + reach, 16 - up),
      },
      ...personShapes('person', grown(ID_PERSON, h)),
    };
  },
  static: /* @__PURE__ */ carbonArt(Identification32),
});

// ── Education ────────────────────────────────────────────────────────────────
//
// The head: a cup (walls x 9–11 and 21–23 down to y 11, then a half ring
// r 5–7 about (16, 11)) under the cap: the board (4–28 × 2–4) and the band
// (y 7–9). The tassel hangs 2px under the board's left end. The shoulders: a
// U (legs at x 7 and 25 from y 30 up to 21), corners r 5–7.
//
// The family motion: the head's diameter grows 1px with its chin held (the
// half ring's centreline r 6 → 6.5, its centre 0.5px up), so the cap and the
// tassel ride up 1px; the shoulders step 1px out on each side. And
// the board widens 2px at each end (4–28 → 2–30), the tassel riding out with
// its left end, and the tassel lengthens 2px (10 → 12, its bottom 16 → 17).

const EDU_BODY: Person = {
  head: [16, 11],
  hr: 6,
  body: [
    [7, 30],
    [7, 21],
    [25, 21],
    [25, 30],
  ],
  r: 6,
};
/** How far the board reaches at each end, and the tassel lengthens. */
export const BOARD_REACH = 2;
export const TASSEL_GROW = 2;

function eduHead(k: number, w: number): string {
  const [cy, R, Ri, xl, xr] = [
    11 - k / 2,
    7 + k / 2,
    5 + k / 2,
    9 - k / 2,
    23 + k / 2,
  ];
  const y = (v: number) => f(v - k);
  return (
    `M${f(4 - w)} ${y(2)}V${y(4)}H${f(xl)}V${f(cy)}A${f(R)} ${f(R)} 0 0 0 ${f(xr)} ${f(cy)}V${y(4)}H${f(28 + w)}V${y(2)}Z` +
    `M${f(xl + 2)} ${y(4)}H${f(xr - 2)}V${y(7)}H${f(xl + 2)}Z` +
    `M16 ${f(cy + Ri)}A${f(Ri)} ${f(Ri)} 0 0 1 ${f(xl + 2)} ${f(cy)}V${y(9)}H${f(xr - 2)}V${f(cy)}A${f(Ri)} ${f(Ri)} 0 0 1 16 ${f(cy + Ri)}Z`
  );
}
const eduTassel = (k: number, w: number, l: number) =>
  `M${f(5 - w)} ${f(6 - k)}A1 1 0 0 0 ${f(4 - w)} ${f(7 - k)}V${f(16 - k + l)}H${f(6 - w)}V${f(7 - k)}A1 1 0 0 0 ${f(5 - w)} ${f(6 - k)}Z`;

export const EducationSpec = /* @__PURE__ */ hoverIcon('Education', {
  geo: ({ h }) => ({
    head: { d: eduHead(h, BOARD_REACH * h), ...EVENODD },
    tassel: { d: eduTassel(h, BOARD_REACH * h, TASSEL_GROW * h) },
    body: { d: bandPath(grown(EDU_BODY, h).body, EDU_BODY.r) },
  }),
  static: /* @__PURE__ */ carbonArt(Education32),
});
