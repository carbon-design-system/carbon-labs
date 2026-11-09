/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Data_132 from '@carbon/icons/es/data--1/32.js';
import Data_232 from '@carbon/icons/es/data--2/32.js';
import DataViewAlt32 from '@carbon/icons/es/data--view--alt/32.js';
import ChartWinLoss32 from '@carbon/icons/es/chart--win-loss/32.js';
import MergeNode32 from '@carbon/icons/es/merge-node/32.js';
import ParentNode32 from '@carbon/icons/es/parent-node/32.js';
import AppConnectivity32 from '@carbon/icons/es/app-connectivity/32.js';
import Integration32 from '@carbon/icons/es/integration/32.js';
import DecisionTree32 from '@carbon/icons/es/decision-tree/32.js';
import TreeView32 from '@carbon/icons/es/tree-view/32.js';
import VirtualMachine32 from '@carbon/icons/es/virtual-machine/32.js';
import Branch32 from '@carbon/icons/es/branch/32.js';
import Migrate32 from '@carbon/icons/es/migrate/32.js';
import Deploy32 from '@carbon/icons/es/deploy/32.js';
import Run32 from '@carbon/icons/es/run/32.js';
import Debug32 from '@carbon/icons/es/debug/32.js';
import WebServicesCluster32 from '@carbon/icons/es/web-services--cluster/32.js';
import SoftwareResourceCluster32 from '@carbon/icons/es/software-resource--cluster/32.js';
import { hoverIcon, type Shapes, carbonArt } from '../../engine';
import {
  centroid,
  framePath,
  insetPoly,
  polyPath,
  rectPath,
  ringPath,
  roundedOutlinePath,
  roundedRectPath,
  scalePts,
  type Pt,
} from '../../geometry';
import { stagger, together } from '../../ease';
import { motionTokens } from '../../tokens';
import { EVENODD, f } from '../../paint';
import {
  CLOUD,
  CLOUD_GROW,
  cloudLoops,
  type Circle,
  type CloudArt,
  type Run as CloudRun,
} from './objectsA';

/**
 * Systems and data: Data 1, Data 2, Data view alt, Chart win loss, Merge node,
 * Parent node, App connectivity, Integration, Decision tree, Tree view,
 * Virtual machine, Branch, Migrate, Deploy, Run and Debug, and the two
 * clusters (Web services cluster, Software resource cluster). Carbon has one
 * (32px) drawing of each, used at every size, so one geometry serves 16, 20,
 * 24 and 32, and each rests on Carbon's outline. On hover the parts move as
 * geometry at a constant 2px wall: points move, nothing is transform-scaled,
 * no masks, clip paths or opacity. Standard hover (160ms entrance ease in,
 * 120ms exit out) unless noted.
 *
 * The node-and-link icons reuse Flow's and Share's motion: nodes grow in
 * place, staged by the flow (the source first, then the nodes it feeds
 * together, 30ms later), and the links hold, their ends tucked inside the
 * node walls at rest and grown, so they stay joined and never reach a hole.
 *
 *  - Data 2 (data moving through): each row's fields scroll right through
 *    the row, clipped at its ends (x 4 and 28), by one period of the row's
 *    own repeat, so they land back on Carbon's drawing: 14px (top), 10px
 *    (second) and 20px (bottom), so the rows travel at different speeds;
 *    they start 16ms apart in the order second, bottom, top. The full-width
 *    third row has no gaps to move and holds. 220ms (moderate-02) per row.
 *  - Data 1 (as Data 2): each
 *    row scrolls right through its clip until it has swapped round, and
 *    holds: top and bottom, the ring ends on the right with its line behind
 *    it; middle, the ring comes round from the far left and the line ends on
 *    the right. Rings shrink at the clip's ends (2px wall) and blink off
 *    below 2px. Data 2's timing.
 *  - Data view alt: Content view's eye: it opens 1px top and bottom, the
 *    iris 1px in radius (the lids hold 2px) and the pupil 0.5px. The page,
 *    its lines and the eye's place hold; the page's two cut ends draw back
 *    as the eye opens (the right wall 1px, the bottom wall 0.2px), so their
 *    gaps to it hold (3px and 3.58px).
 *  - Chart win loss: the win bar rises
 *    4px and the loss bar shortens 4px; the axis holds.
 *  - Merge node: the arrow reaches 2px down (its head moves, the shaft
 *    lengthens, the tail holds) and the diamond shrinks about its centre so
 *    its apex stays on the tip: 1.41px in along each edge (its half-diagonal
 *    9 → 7). The branches' runs lengthen 2px to stay joined to its corners.
 *  - Parent node: Flow's: the parent (a solid disc) grows 1px in radius,
 *    and the child ring with it (no stagger); the link holds.
 *  - App connectivity: Grid's and Share's: the hub window (left) grows 1px
 *    a side, and both windows it links to with it (no stagger) (gaps 4 →
 *    2px, as Grid's tiles). Title rules and links hold.
 *  - Integration: the hexagon grows 2px out along each edge
 *    and turns clockwise half a wedge about its centre, spokes and holes
 *    with it. Carbon's hexagon isn't regular (wedges 57.5° and 65°, corners
 *    13 and 13.04 out), so each corner travels clockwise about the centre
 *    halfway to the next corner's place (28.75° or 32.5°, its radius easing
 *    between): hovered, the corners sit at ±28.75°, ±90° and ±151.25°, an
 *    even, mirror-symmetric pointy-top hexagon (a rigid 30° turn would be
 *    lopsided). The walls are rebuilt from the corners each frame at 2px.
 *  - Decision tree: the root box grows 1px a side, then both leaves
 *    together, 30ms later; the links hold.
 *  - Tree view: the same, and the two child boxes (2px apart) also part 1px
 *    each (up, down) as they grow, so their gap holds; their branches ride
 *    with them along the trunk, which lengthens 1px at the bottom.
 *  - Virtual machine: the cloud grows as
 *    Cloud's does (its centrelines scale 1/15 about the middle of its base;
 *    sides out 1px, top up 1.4px, walls 2px); the server widens 1px a side
 *    and still rises 2px; the cloud's cut ends draw back 1px a side, so their
 *    2px gap to the server holds.
 *  - Branch: Branch flow's: the base node (bottom) grows 1px in radius,
 *    then both tips together, 30ms later; the lines hold.
 *  - Migrate: the two units part 1px each (the source up, the target down)
 *    and the arrow stretches 2px between them: its tail rides up with the
 *    source and its head reaches 1px down, so its 2px gap to the target
 *    holds. And the target widens 1px a
 *    side (its divider holds).
 *  - Deploy (no other scaling): the arrow reaches 2px up (its head
 *    moves, the shaft lengthens) and the package's top rises 2px with it,
 *    its bottom holding, so the square becomes an 8×10 rectangle (its walls
 *    2px). The container holds, and so do the package's 4px margins to it.
 *  - Run: the window grows 1px a side
 *    (its title bar's rule holds); the play button rides its corner 1px
 *    down and right, the ring growing 1px in radius and the triangle 10%
 *    about its centroid, so the ring's 2px gap under the bar holds exactly;
 *    the bottom wall's stub draws back 0.06px to hold its 3.7px gap.
 *  - Debug: the bug still grows 1px on every side (walls step out, legs
 *    and antennae ride with them); the antennae also lengthen 1px; and each
 *    pair of legs swings 20° down
 *    about its roots and back, top pair first,
 *    30ms apart (210ms in all). The swing plays on the way in only.
 *  - Web services cluster (used at 16px in tool rails): the open
 *    hexagon grows 2px out along every edge at its 2px weight. The hexagon is Carbon's 2px run with
 *    round outer corners, so it is drawn from its centreline: each edge
 *    moves out 1px, the corners keep their shape, and the two open ends
 *    ride out with their walls. So the spacing stays consistent, each diamond's
 *    outer tip moves 1px out, and the diamond grows 0.5px (half-diagonal
 *    4 → 4.5) as its centre moves 0.5px out, so the 2.24px between diamonds
 *    holds; with the hexagon's 2px, the space to the wall opens 1.24 →
 *    2.24px.
 *  - Software resource cluster: each diamond's outer
 *    tip moves 2px out (a whole screen pixel at 16) and the diamond grows
 *    1px (half-diagonal 5 → 6) as its centre moves 1px out, so the 4.24px
 *    between diamonds holds: consistent spacing reads as the cluster
 *    growing, where an opening one read as it coming apart.
 *  Both diamonds grow at their 2px wall: every point moves out along the
 *  axis of the tip it belongs to, so each rounded tip keeps its shape and
 *  each straight edge, outer and hollow, moves out the same.
 */

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
/** A square-cornered box with 2px walls (Carbon's decision and tree boxes), as an even-odd pair. */
const squareBox = (x0: number, y0: number, x1: number, y1: number) =>
  rectPath(x0, y0, x1, y1) + rectPath(x0 + 2, y0 + 2, x1 - 2, y1 - 2);
/** The node family's timing: the source and the nodes it feeds, together (no stagger). */
const flow = /* @__PURE__ */ together();
/**
 * A circle as four cubics (clockwise on screen, or anticlockwise), as Carbon
 * draws its nodes: Chrome rasterises these within the parity gate where an
 * arc-built circle beside a link lands a few edge pixels heavier.
 */
const KAPPA = 0.5523;
function cubicCircle([cx, cy]: Pt, r: number, ccw = false): string {
  const [k, s] = [r * KAPPA, ccw ? -1 : 1];
  const q = (a: Pt, b: Pt, c: Pt) =>
    `C${f(a[0])} ${f(a[1])} ${f(b[0])} ${f(b[1])} ${f(c[0])} ${f(c[1])}`;
  return (
    `M${f(cx - r)} ${f(cy)}` +
    q([cx - r, cy - s * k], [cx - k, cy - s * r], [cx, cy - s * r]) +
    q([cx + k, cy - s * r], [cx + r, cy - s * k], [cx + r, cy]) +
    q([cx + r, cy + s * k], [cx + k, cy + s * r], [cx, cy + s * r]) +
    q([cx - k, cy + s * r], [cx - r, cy + s * k], [cx - r, cy]) +
    'Z'
  );
}
/** A node ring: its centreline r, a 2px wall (the hole wound the other way). */
const cubicRing = (c: Pt, r: number) =>
  cubicCircle(c, r + 1) + cubicCircle(c, r - 1, true);

// ── Data 2 ───────────────────────────────────────────────────────────────────
//
// Four rows of 2px fields, x 4–28, 3px gaps between fields. On hover each
// row is a tape that scrolls right under a window (x 4–28): the tape repeats
// the row's last `period` px, which is the shortest shift that maps the row
// onto itself where the two overlap, so a scroll of one period lands back
// on Carbon's drawing. Fields are cut at the window's ends.

const DATA2_ROWS: Array<
  [y: number, fields: Array<[number, number]>, period: number, slot: number]
> = [
  [
    6,
    [
      [4, 15],
      [18, 28],
    ],
    14,
    2,
  ],
  [
    12,
    [
      [4, 8],
      [11, 18],
      [21, 28],
    ],
    10,
    0,
  ],
  [18, [[4, 28]], 0, 0], // one field, no gaps: nothing to scroll
  [
    24,
    [
      [4, 21],
      [24, 28],
    ],
    20,
    1,
  ],
];
// (Not a small-part stagger, so it stays: whole rows scrolling, each through its own clip, 16ms apart.)
const rows = /* @__PURE__ */ stagger(3, motionTokens.duration.moderate02, 16);
/** A row's fields scrolled `s` right (0 ≤ s ≤ its period), cut to x 4–28. */
function scrolled(
  fields: Array<[number, number]>,
  period: number,
  s: number
): Array<[number, number]> {
  if (!period || !s) {
    return fields;
  }
  const tile = fields
    .map(([a, b]) => [Math.max(a, 28 - period), b] as [number, number])
    .filter(([a, b]) => b > a);
  const runs: Array<[number, number]> = [];
  for (let k = -Math.ceil(28 / period) - 1; k <= 1; k++) {
    for (const [a, b] of tile) {
      const [x0, x1] = [a + k * period + s, b + k * period + s];
      const last = runs[runs.length - 1];
      if (last && x0 <= last[1] + 1e-9) {
        last[1] = Math.max(last[1], x1);
      } else {
        runs.push([x0, x1]);
      }
    }
  }
  return runs
    .map(([a, b]) => [Math.max(4, a), Math.min(28, b)] as [number, number])
    .filter(([a, b]) => b - a > 0.01);
}

export const Data_2Spec = /* @__PURE__ */ hoverIcon('Data_2', {
  hover: rows.hover,
  geo: ({ h }) => {
    const s: Shapes = {};
    DATA2_ROWS.forEach(([y, fields, period, slot], i) => {
      const k = period * rows.at(h, slot);
      s[`row${i}`] = {
        d: scrolled(fields, period, k)
          .map(([x0, x1]) => rectPath(x0, y, x1, y + 2))
          .join(''),
      };
    });
    return s;
  },
  static: /* @__PURE__ */ carbonArt(Data_232),
});

// ── Data 1 ───────────────────────────────────────────────────────────────────
//
// Data 2's hover, as a rearrangement.
// Each row (a ring and a 2px line) is a tape scrolling right through the
// row's clip (its ink's ends, 25px), repeating every 29px (the row and the
// 4px ring-to-line gap), and it stops where the row has swapped round:
//  - top and bottom (17px): the ring ends at the right (centre 24) and its
//    line, coming in behind it from the left, at x 3-16, 4px before it;
//  - middle (12px): the line ends at x 16-29 and the ring, round from the
//    far left, at centre 8, 4px before it.
// A line is cut square at the clip's ends, as Data 2's fields are. A ring
// never crosses them: its outer radius is the space left to the clip's end
// (4px at most), its wall staying 2px, and below 2px (where it would close
// into a dot) it blinks off. Hover-out plays it back. Data 2's timing: 220ms
// (moderate-02) a row, the rows 16ms apart, top to bottom; out, its leave.

/** The space between a Data 1 row's end and the next pass of its tape (the ring-to-line gap). */
export const DATA1_GAP = 4;
/** The smallest outer radius a scrolling Data 1 ring shows (below it, it blinks off). */
export const DATA1_RING_MIN = 2;
/** Each row: its clip [lo, hi], its line [a, b], its ring's centre x, its line's top y (the ring's centre is 1 below), and how far it scrolls. */
const DATA1_ROWS: Array<
  [
    lo: number,
    hi: number,
    a: number,
    b: number,
    ring: number,
    y: number,
    travel: number,
  ]
> = [
  [3, 28, 15, 28, 7, 6, 17],
  [4, 29, 4, 17, 25, 15, 12],
  [3, 28, 15, 28, 7, 24, 17],
];
/** How far each Data 1 row scrolls at full hover (top, middle, bottom). */
export const DATA1_TRAVEL = DATA1_ROWS.map((r) => r[6]);
/** A row scrolled `s` right: its line's runs, and its rings' centres and outer radii. */
export function data1Row(
  lo: number,
  hi: number,
  a: number,
  b: number,
  ring: number,
  s: number
) {
  const period = hi - lo + DATA1_GAP;
  const runs: Array<[number, number]> = [];
  const rings: Array<[number, number]> = [];
  for (const k of [-1, 0]) {
    const [x0, x1] = [
      Math.max(lo, a + s + k * period),
      Math.min(hi, b + s + k * period),
    ];
    if (x1 - x0 > 0.01) {
      runs.push([x0, x1]);
    }
    const c = ring + s + k * period;
    const r = Math.min(4, c - lo, hi - c);
    if (r >= DATA1_RING_MIN) {
      rings.push([c, r]);
    }
  }
  return { runs, rings };
}

export const Data_1Spec = /* @__PURE__ */ hoverIcon('Data_1', {
  hover: rows.hover,
  geo: ({ h }) => {
    const s: Shapes = {};
    DATA1_ROWS.forEach(([lo, hi, a, b, ring, y, travel], i) => {
      const row = data1Row(lo, hi, a, b, ring, travel * rows.at(h, i));
      s[`line${i}`] = {
        d: row.runs.map(([x0, x1]) => rectPath(x0, y, x1, y + 2)).join(''),
      };
      s[`ring${i}`] = {
        d: row.rings.map(([c, r]) => ringPath([c, y + 1], r - 1, 2)).join(''),
      };
    });
    return s;
  },
  static: /* @__PURE__ */ carbonArt(Data_132),
});

// ── Data view alt ────────────────────────────────────────────────────────────
//
// A page (2–24 × 2–30, outer corners r2) whose right wall stops at y 15 and
// bottom wall at x 12, clear of the eye; three text lines; and Content
// view's eye about (22, 24): a solid lens (r 8.64 arcs meeting at short
// flats at x 14 and 30) with the iris knocked out (r 4) round a pupil (r 2).

const DVA_C: Pt = [22, 24];
/** How far the eye opens at its top and bottom (and the iris grows in radius), and the pupil grows. */
export const DVA_EYE_OPEN = 1;
export const DVA_PUPIL_GROW = 0.5;
/** How far the page's right and bottom cut ends draw back as the eye opens, holding their 3px and 3.58px gaps. */
export const DVA_RIGHT_BACK = 1;
export const DVA_BOTTOM_BACK = 0.2;

const circleD = ([cx, cy]: Pt, r: number) =>
  `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;
/** The lens stretched vertically by k about its middle: its arcs become ellipses of the same width. */
function dvaLens(k: number): string {
  const y = (d: number) => f(DVA_C[1] + d * k);
  const r = `8.64 ${f(8.64 * k)} 0 0 0`;
  return `M29.7769 ${y(-0.5215)}A${r} 22 ${y(-6)}A${r} 14.2231 ${y(-0.5215)}L14 24L14.2231 ${y(0.5215)}A${r} 22 ${y(6)}A${r} 29.7769 ${y(0.5215)}L30 24Z`;
}
const dvaPage = (r: number, b: number) =>
  `M22 2H4A2 2 0 0 0 2 4V28A2 2 0 0 0 4 30H${f(12 - b)}V28H4V4H22V${f(15 - r)}H24V4A2 2 0 0 0 22 2Z`;
const DVA_LINES =
  /* @__PURE__ */ rectPath(7, 7, 19, 9) +
  /* @__PURE__ */ rectPath(7, 12, 19, 14) +
  /* @__PURE__ */ rectPath(7, 17, 12, 19);

export const DataViewAltSpec = /* @__PURE__ */ hoverIcon('DataViewAlt', {
  geo: ({ h }) => {
    const open = DVA_EYE_OPEN * h;
    return {
      page: { d: dvaPage(DVA_RIGHT_BACK * h, DVA_BOTTOM_BACK * h) },
      lines: { d: DVA_LINES },
      eye: {
        d: dvaLens((6 + open) / 6) + circleD(DVA_C, 4 + open),
        ...EVENODD,
      },
      pupil: { d: circleD(DVA_C, 2 + DVA_PUPIL_GROW * h) },
    };
  },
  static: /* @__PURE__ */ carbonArt(DataViewAlt32),
});

// ── Chart win loss ───────────────────────────────────────────────────────────
//
// The axis (2–30 × 15–17), the win bar above it (4–16, top 4, outer top
// corners r2, 2px walls) and the loss bar below it (16–28, bottom 28,
// outer bottom corners r2). Each bar's open end runs 1px into the axis.

/** How far the win bar rises and the loss bar shortens. */
export const WIN_RISE = 4;
export const LOSS_DROP = 4;
const winBar = (t: number) =>
  `M4 16V${f(t + 2)}A2 2 0 0 1 6 ${f(t)}H14A2 2 0 0 1 16 ${f(t + 2)}V16H14V${f(t + 2)}H6V16Z`;
const lossBar = (b: number) =>
  `M16 16V${f(b - 2)}A2 2 0 0 0 18 ${f(b)}H26A2 2 0 0 0 28 ${f(b - 2)}V16H26V${f(b - 2)}H18V16Z`;

export const ChartWinLossSpec = /* @__PURE__ */ hoverIcon('ChartWinLoss', {
  geo: ({ h }) => ({
    axis: { d: rectPath(2, 15, 30, 17) },
    win: { d: winBar(4 - WIN_RISE * h) },
    loss: { d: lossBar(28 - LOSS_DROP * h) },
  }),
  static: /* @__PURE__ */ carbonArt(ChartWinLoss32),
});

// ── Merge node ───────────────────────────────────────────────────────────────
//
// One outline: the node, a diamond about (16, 21) (outer half-diagonal 9,
// 2px walls, its hole's 6.17), whose side corners are cut by the two
// branches: 2px runs (y 20–22) out to legs (x 2–4 and 28–30, outer corners
// r2) down to the frame's foot. The arrow comes down onto the node, its tip
// on the diamond's apex (16, 12).

/** How far the arrow reaches down; the node's apex comes down as far, so its half-diagonal shrinks by it. */
export const MERGE_PUSH = 2;
const MERGE_ARROW: Pt[] = [
  [11, 7],
  [16, 12],
  [21, 7],
  [19.5859, 5.5859],
  [17, 8.1719],
  [17, 2],
  [15, 2],
  [15, 8.1719],
  [12.4141, 5.5859],
];
function mergeNode(push: number): string {
  const D = 9 - push; // outer half-diagonal
  const d = D - 2 * Math.SQRT2; // the hole's
  const [c, e] = [21, D - 1]; // the outer edges cross the runs (y 20 and 22) e from the centre line
  return (
    `M28 20H${f(16 + e)}L16 ${f(c - D)}L${f(16 - e)} 20H4A2 2 0 0 0 2 22V30H4V22H${f(16 - e)}L16 ${f(c + D)}L${f(16 + e)} 22H28V30H30V22A2 2 0 0 0 28 20Z` +
    `M16 ${f(c + d)}L${f(16 - d)} ${c}L16 ${f(c - d)}L${f(16 + d)} ${c}Z`
  );
}

export const MergeNodeSpec = /* @__PURE__ */ hoverIcon('MergeNode', {
  geo: ({ h }) => {
    const push = MERGE_PUSH * h;
    return {
      node: { d: mergeNode(push), ...EVENODD },
      arrow: {
        d: polyPath(
          MERGE_ARROW.map(([x, y]) => [x, y === 2 ? y : y + push] as Pt),
          true
        ),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(MergeNode32),
});

// ── Parent node ──────────────────────────────────────────────────────────────
//
// The parent, a solid disc (r 5 about (9, 7)); the child, a ring (Carbon's
// r5 / r3: centreline r4, about (23, 25)); and the link: down from the
// parent (x 8–10), round a corner (r 4–6 about (14, 20)) and across (y 24–26)
// to the child. Its ends sit 4.4 from each centre (Share's tuck): inside the
// disc, and inside the ring's wall at rest (r 3–5) and grown (r 4–6).

const PARENT: Pt = [9, 7];
const CHILD: Pt = [23, 25];
const RING_TUCK = 4.4;
const PARENT_LINK = /* @__PURE__ */ (() =>
  `M8 ${f(PARENT[1] + RING_TUCK)}V20A6 6 0 0 0 14 26H${f(CHILD[0] - RING_TUCK)}V24H14A4 4 0 0 1 10 20V${f(PARENT[1] + RING_TUCK)}Z`)();
/** How much each ring grows in radius (Flow's and Share's nodes). */
export const NODE_GROW = 1;

export const ParentNodeSpec = /* @__PURE__ */ hoverIcon('ParentNode', {
  hover: flow.hover,
  geo: ({ h }) => ({
    link: { d: PARENT_LINK },
    parent: { d: cubicCircle(PARENT, 5 + NODE_GROW * flow.at(h, 0)) },
    child: { d: cubicRing(CHILD, 4 + NODE_GROW * flow.at(h, 1)), ...EVENODD },
  }),
  static: /* @__PURE__ */ carbonArt(ParentNode32),
});

// ── App connectivity ─────────────────────────────────────────────────────────
//
// Three windows (12px square, outer corners r2, 2px walls, a title rule
// 2px under the top wall): the hub on the left (2–14 × 10–22) and two on
// the right (18–30 × 2–14 and 18–30 × 18–30), each 4px clear of it, joined
// to it by two L-shaped links (outer corners r2). Each link ends 0.5px past
// the middle of the wall it meets, inside the wall at rest and grown.

/** How far each window grows on each side. */
export const APP_GROW = 1;
type Win = [x0: number, y0: number, x1: number, y1: number];
const APP_HUB: Win = [2, 10, 14, 22];
const APP_TOP: Win = [18, 2, 30, 14];
const APP_BOTTOM: Win = [18, 18, 30, 30];
const appWindow = ([x0, y0, x1, y1]: Win, k: number) =>
  framePath(x0 - k, y0 - k, x1 + k, y1 + k) +
  rectPath(x0 - k + 1, y0 + 4, x1 + k - 1, y0 + 6);
const APP_LINKS =
  'M18.5 4H9A2 2 0 0 0 7 6V10.5H9V6H18.5Z' +
  'M6 21.5V26A2 2 0 0 0 8 28H18.5V26H8V21.5Z';

export const AppConnectivitySpec = /* @__PURE__ */ hoverIcon(
  'AppConnectivity',
  {
    hover: flow.hover,
    geo: ({ h }) => {
      const [hub, out] = [APP_GROW * flow.at(h, 0), APP_GROW * flow.at(h, 1)];
      return {
        links: { d: APP_LINKS },
        hub: { d: appWindow(APP_HUB, hub) },
        top: { d: appWindow(APP_TOP, out) },
        bottom: { d: appWindow(APP_BOTTOM, out) },
      };
    },
    static: /* @__PURE__ */ carbonArt(AppConnectivity32),
  }
);

// ── Integration ──────────────────────────────────────────────────────────────
//
// A hexagon of 2px walls about its centreline (3, 16), (9, 5), (23, 5),
// (29, 16), (23, 27), (9, 27), its outer corners r1 (a round join), and six
// 2px spokes from its centre (16, 16) to each corner: the six triangles
// between them are the holes, each its sector inset 1px.

const HEX: Pt[] = [
  [29, 16],
  [23, 5],
  [9, 5],
  [3, 16],
  [9, 27],
  [23, 27],
]; // anticlockwise on screen
const HUB: Pt = [16, 16];
/** How far the hexagon grows out along each edge, and how much of a wedge it turns. */
export const HEX_GROW = 2;
export const HEX_TURN = 0.5;
const polar = ([x, y]: Pt) => ({
  a: Math.atan2(y - HUB[1], x - HUB[0]),
  r: Math.hypot(x - HUB[0], y - HUB[1]),
});
/** The corners turned t of one wedge clockwise: each travels about the hub to the next corner's place (clockwise is the previous in HEX). */
export function hexTurned(t: number): Pt[] {
  if (!t) {
    return HEX;
  }
  return HEX.map((v, i) => {
    const [p, q] = [polar(v), polar(HEX[(i + 5) % 6])];
    let d = q.a - p.a;
    while (d <= 0) {
      d += 2 * Math.PI;
    }
    const [a, r] = [p.a + d * t, p.r + (q.r - p.r) * t];
    return [HUB[0] + r * Math.cos(a), HUB[1] + r * Math.sin(a)] as Pt;
  });
}
/** The hexagon from its centreline corners, grown g out along each edge. */
export function integration(corners: readonly Pt[], g: number): string {
  const hex = g ? insetPoly(corners, -g) : corners;
  const holes = hex.map((v, i) =>
    polyPath(insetPoly([HUB, v, hex[(i + 1) % hex.length]], 1), true)
  );
  return roundedOutlinePath(hex, 1) + holes.join('');
}

export const IntegrationSpec = /* @__PURE__ */ hoverIcon('Integration', {
  // Nonzero: the outline runs clockwise and every hole anticlockwise (as HEX), so a hair's overlap where an arc meets an edge never knocks a pinhole out.
  geo: ({ h }) => ({
    hexagon: { d: integration(hexTurned(HEX_TURN * h), HEX_GROW * h) },
  }),
  static: /* @__PURE__ */ carbonArt(Integration32),
});

// ── Decision tree, Tree view ─────────────────────────────────────────────────
//
// Square-cornered boxes (8px, 2px walls) joined by 2px links: a trunk with
// outer corners r2 where it turns. Each link ends 0.5px past the middle of
// the box wall it meets, so it is inside that wall at rest and grown.

/** How far each box grows on each side. */
export const TREE_BOX_GROW = 1;
const DT_LINKS =
  'M22.5 7H18A2 2 0 0 0 16 9V15H9.5V17H16V23A2 2 0 0 0 18 25H22.5V23H18V9H22.5Z';

export const DecisionTreeSpec = /* @__PURE__ */ hoverIcon('DecisionTree', {
  hover: flow.hover,
  geo: ({ h }) => {
    const [r, l] = [
      TREE_BOX_GROW * flow.at(h, 0),
      TREE_BOX_GROW * flow.at(h, 1),
    ];
    return {
      links: { d: DT_LINKS },
      root: { d: squareBox(2 - r, 12 - r, 10 + r, 20 + r), ...EVENODD },
      upper: { d: squareBox(22 - l, 4 - l, 30 + l, 12 + l), ...EVENODD },
      lower: { d: squareBox(22 - l, 20 - l, 30 + l, 28 + l), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(DecisionTree32),
});

/** How far Tree view's two child boxes part (each), so their 2px gap holds as they grow. */
export const TREE_VIEW_PART = 1;
const treeViewLinks = (p: number) =>
  `M9.5 5H15A2 2 0 0 1 17 7V${f(15 - p)}H22.5V${f(17 - p)}H17V${f(25 + p)}H22.5V${f(27 + p)}H17A2 2 0 0 1 15 ${f(25 + p)}V7H9.5Z`;

export const TreeViewSpec = /* @__PURE__ */ hoverIcon('TreeView', {
  hover: flow.hover,
  geo: ({ h }) => {
    const [r, c] = [flow.at(h, 0), flow.at(h, 1)];
    const [g, l, p] = [
      TREE_BOX_GROW * r,
      TREE_BOX_GROW * c,
      TREE_VIEW_PART * c,
    ];
    return {
      links: { d: treeViewLinks(p) },
      root: { d: squareBox(2 - g, 2 - g, 10 + g, 10 + g), ...EVENODD },
      middle: {
        d: squareBox(22 - l, 12 - l - p, 30 + l, 20 + l - p),
        ...EVENODD,
      },
      last: {
        d: squareBox(22 - l, 22 - l + p, 30 + l, 30 + l + p),
        ...EVENODD,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(TreeView32),
});

// ── Virtual machine ──────────────────────────────────────────────────────────
//
// The cloud is Carbon's Cloud drawing 3px higher with its base left open: the
// lobes end in short stubs at x 8 and 24, 2px clear of the server (10–22 ×
// 13–30, outer corners r2, three bays). It is built as Cloud's is
// (objectsA's cloudLoops: three circles' 2px walls) and grows as Cloud's
// does: its centrelines scale 1/15 about the middle of its base (16, 24).

/** How far the server rises, and widens on each side (the cloud's cut ends draw back as far). */
export const VM_RISE = 2;
export const VM_WIDEN = 1;
const VM_ART: CloudArt = (() => {
  const up = ({ c, r }: Circle): Circle => ({ c: [c[0], c[1] - 3], r });
  return {
    left: up(CLOUD.left),
    top: up(CLOUD.top),
    right: up(CLOUD.right),
    base: CLOUD.base - 3,
  };
})();
const VM_BASE: Pt = [16, VM_ART.base];
const at = ({ c, r }: Circle, t: number): Pt => [
  c[0] + r * Math.cos(t),
  c[1] + r * Math.sin(t),
];
const spanOf = (t0: number, t1: number) => {
  let b = t1;
  while (b <= t0) {
    b += 2 * Math.PI;
  }
  return b - t0;
};
/** A run as path data, clockwise (forward) or anticlockwise (back), from where the pen is. */
function runD(r: CloudRun, back: boolean): string {
  if (!('k' in r)) {
    return `L${f(r[0])} ${f(r[1])}`;
  }
  const span = spanOf(r.t0, r.t1);
  const [a, b] = [at(r.k, r.t0), at(r.k, r.t0 + span)];
  const [from, to] = back ? [b, a] : [a, b];
  return `L${f(from[0])} ${f(from[1])}A${f(r.k.r)} ${f(r.k.r)} 0 ${span > Math.PI ? 1 : 0} ${back ? 0 : 1} ${f(to[0])} ${f(to[1])}`;
}
function vmCloud(k: number, w: number): string {
  const g = ({ c, r }: Circle): Circle => ({
    c: [
      VM_BASE[0] + (c[0] - VM_BASE[0]) * k,
      VM_BASE[1] + (c[1] - VM_BASE[1]) * k,
    ],
    r: r * k,
  });
  const [outside, inside] = cloudLoops({
    left: g(VM_ART.left),
    top: g(VM_ART.top),
    right: g(VM_ART.right),
    base: VM_ART.base,
  });
  const [xl, xr, yo] = [8 - w, 24 + w, VM_ART.base + 1]; // the cuts, and the lobes' outer bottom (the scale holds the base)
  return (
    `M${f(xl)} ${f(yo)}${outside.map((r) => runD(r, false)).join('')}L${f(xr)} ${f(yo)}L${f(xr)} ${f(yo - 2)}` +
    `${[...inside]
      .reverse()
      .map((r) => runD(r, true))
      .join('')}L${f(xl)} ${f(yo - 2)}Z`
  );
}
const vmServer = (u: number, w: number) => {
  const y = (v: number) => v - u;
  return (
    roundedRectPath(10 - w, y(13), 22 + w, y(30)) +
    rectPath(12 - w, y(15), 20 + w, y(18)) +
    rectPath(12 - w, y(20), 20 + w, y(23)) +
    rectPath(12 - w, y(25), 20 + w, y(28))
  );
};

export const VirtualMachineSpec = /* @__PURE__ */ hoverIcon('VirtualMachine', {
  geo: ({ h }) => ({
    cloud: { d: vmCloud(1 + CLOUD_GROW * h, VM_WIDEN * h) },
    server: { d: vmServer(VM_RISE * h, VM_WIDEN * h), ...EVENODD },
  }),
  static: /* @__PURE__ */ carbonArt(VirtualMachine32),
});

// ── Branch ───────────────────────────────────────────────────────────────────
//
// Three rings (Carbon's r4 / r2: centreline r3) about (8, 6), (24, 6) and
// (8, 26); the trunk (x 7–9) between the left two, and the branch: down
// from the right tip (x 23–25), round a corner (r 3–5 about (20, 14)),
// across (y 17–19) and round into the trunk (r 3–5 about (12, 22)). Line
// ends sit 3.2 from a ring's centre (Flow's tuck), inside its wall at rest
// (r 2–4) and grown (r 3–5).

const BR_TIP_L: Pt = [8, 6];
const BR_TIP_R: Pt = [24, 6];
const BR_BASE: Pt = [8, 26];
const FLOW_TUCK = 3.2;
const BRANCH_LINES = /* @__PURE__ */ (() =>
  rectPath(7, 6 + FLOW_TUCK, 9, 26 - FLOW_TUCK) +
  `M25 ${f(6 + FLOW_TUCK)}V14A5 5 0 0 1 20 19H12A3 3 0 0 0 9 22H7A5 5 0 0 1 12 17H20A3 3 0 0 0 23 14V${f(6 + FLOW_TUCK)}Z`)();

export const BranchSpec = /* @__PURE__ */ hoverIcon('Branch', {
  hover: flow.hover,
  geo: ({ h }) => {
    const [base, tips] = [
      3 + NODE_GROW * flow.at(h, 0),
      3 + NODE_GROW * flow.at(h, 1),
    ];
    return {
      lines: { d: BRANCH_LINES },
      base: { d: cubicRing(BR_BASE, base), ...EVENODD },
      tips: {
        d: cubicRing(BR_TIP_L, tips) + cubicRing(BR_TIP_R, tips),
        ...EVENODD,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Branch32),
});

// ── Migrate ──────────────────────────────────────────────────────────────────
//
// Two units (4–28, 8px tall, outer corners r2, 2px walls, a 2px divider):
// the source (y 2–10, divider x 10–12) and the target (y 22–30, divider
// x 20–22); and the arrow down from the source (its tail 0.5px into the
// source's bottom wall, its tip at y 20, 2px above the target).

/** How far each unit steps out (the source up, the target down), and the arrow's head reaches down. */
export const MIGRATE_PART = 1;
const MIGRATE_HEAD: Pt[] = [
  [17, 16.17],
  [19.59, 13.59],
  [21, 15],
  [16, 20],
  [11, 15],
  [12.41, 13.59],
  [15, 16.17],
];
/** How far the target widens on each side (its divider holds). */
export const MIGRATE_WIDEN = 1;
const unit = (y0: number, divider: number, w = 0) =>
  roundedRectPath(4 - w, y0, 28 + w, y0 + 8) +
  rectPath(6 - w, y0 + 2, divider, y0 + 6) +
  rectPath(divider + 2, y0 + 2, 26 + w, y0 + 6);

export const MigrateSpec = /* @__PURE__ */ hoverIcon('Migrate', {
  geo: ({ h }) => {
    const t = MIGRATE_PART * h;
    return {
      source: { d: unit(2 - t, 10), ...EVENODD },
      arrow: {
        d: polyPath(
          [
            [15, 9.5 - t],
            [17, 9.5 - t],
            ...MIGRATE_HEAD.map(([x, y]) => [x, y + t] as Pt),
          ],
          true
        ),
      },
      target: { d: unit(22 + t, 20, MIGRATE_WIDEN * h), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(Migrate32),
});

// ── Deploy ───────────────────────────────────────────────────────────────────
//
// One outline: the container (its left wall up to y 12, open at the top)
// whose right wall (x 22–24) runs on up as the arrow's shaft to the head
// (tip (23, 2)); and the package inside (10–18 × 16–24, outer corners r2),
// 4px clear of the container's walls.

/** How far the arrow reaches up (its head moves, the shaft lengthens), and the package's top rises with it (its bottom holds). */
export const DEPLOY_REACH = 2;
export const DEPLOY_EXTEND = 2;
const deployD = (d: number) => {
  const y = (v: number) => f(v - d);
  return `M23 ${y(2)}L17 ${y(8)}L18.4146 ${y(9.4023)}L22 ${y(5.8184)}V28H6V12H4V28A2 2 0 0 0 6 30H22A2 2 0 0 0 24 28V${y(5.8154)}L27.5859 ${y(9.4023)}L29 ${y(8)}Z`;
};
const deployBox = (e: number) =>
  roundedRectPath(10, 16 - e, 18, 24) + rectPath(12, 18 - e, 16, 22);

export const DeploySpec = /* @__PURE__ */ hoverIcon('Deploy', {
  geo: ({ h }) => ({
    container: { d: deployD(DEPLOY_REACH * h) },
    box: { d: deployBox(DEPLOY_EXTEND * h), ...EVENODD },
  }),
  static: /* @__PURE__ */ carbonArt(Deploy32),
});

// ── Run ──────────────────────────────────────────────────────────────────────
//
// A window (4–28 × 4–28: a title bar, a left wall down to y 26 and a stub
// of its bottom wall to x 10) and a play button: a ring (r 6–8 about
// (21, 22)) 2px under the bar, round a solid triangle.

/** How far the window grows on each side (the button rides its corner as far, and the ring grows as far in radius); the triangle's growth about its centroid. */
export const RUN_GROW = 1;
export const RUN_PLAY_GROW = 0.1;
const RUN_C: Pt = [21, 22];
const RUN_PLAY: Pt[] = [
  [19, 19],
  [19, 25],
  [24, 22],
];
/** The bottom stub's gap to the ring at rest (its end's top corner (10, 26) to the ring's outside), which the stub holds. */
const RUN_STUB_GAP = Math.hypot(11, 4) - 8;
function runWindow(g: number): string {
  // The stub's end, drawn back so its top corner stays RUN_STUB_GAP from the ring (4 above its centre, as at rest).
  const xe = RUN_C[0] + g - Math.sqrt((RUN_STUB_GAP + 8 + g) ** 2 - 16);
  return (
    `M${f(26 + g)} ${f(4 - g)}H${f(6 - g)}A2 2 0 0 0 ${f(4 - g)} ${f(6 - g)}V${f(26 + g)}A2 2 0 0 0 ${f(6 - g)} ${f(28 + g)}H${f(xe)}V${f(26 + g)}H${f(6 - g)}V12H${f(28 + g)}V${f(6 - g)}A2 2 0 0 0 ${f(26 + g)} ${f(4 - g)}Z` +
    `M${f(6 - g)} 10V${f(6 - g)}H${f(26 + g)}V10Z`
  );
}

export const RunSpec = /* @__PURE__ */ hoverIcon('Run', {
  geo: ({ h }) => {
    const g = RUN_GROW * h;
    const play = scalePts(
      RUN_PLAY,
      centroid(RUN_PLAY),
      1 + RUN_PLAY_GROW * h
    ).map(([x, y]) => [x + g, y + g] as Pt);
    return {
      window: { d: runWindow(g) },
      ring: { d: ringPath([RUN_C[0] + g, RUN_C[1] + g], 7 + g, 2), ...EVENODD },
      play: { d: polyPath(play, true) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Run32),
});

// ── Debug ────────────────────────────────────────────────────────────────────
//
// The body: a capsule (x 7–25; its top an r9 arc about (16, 13), its bottom
// one about (16, 19)) with 2px walls; a neck rule (y 11–13) and a centre
// seam (x 15–17) split its inside into the head (a dome, r7 about (16, 13))
// and two wings (their bottoms r7 about (16, 19)). Six legs and two
// antennae: 2px bands on Carbon's edges, carried into the body's wall to
// its middle (r 8 about the capsule's spine), so they stay joined and never
// reach a hole.

/** How far the bug grows on each side (its legs and antennae ride out with the wall), and the antennae lengthen. */
export const BUG_GROW = 1;
export const ANTENNA_GROW = 1;
/** How far each leg swings down (and back), about its roots, and the pairs' stagger. */
export const LEG_SWING_DEG = 20;
// The legs wave down and back, top row first, staggering to the bottom.
/** Each pair's swing: the hover's moderate-01, the next pair LEG_GAP ms behind. */
const LEG_MOVE = motionTokens.duration.moderate01;
const LEG_GAP = 30;
const legs = /* @__PURE__ */ stagger(3, LEG_MOVE, LEG_GAP);
const SPINE: [Pt, Pt] = [
  [16, 13],
  [16, 19],
];
/** A point's nearest point on the capsule's spine. */
const onSpine = ([, y]: Pt): Pt => [
  16,
  Math.max(SPINE[0][1], Math.min(SPINE[1][1], y)),
];
/** Where the line from `tip` through `root` reaches radius r of the spine. */
function reachWall(tip: Pt, root: Pt, r: number): Pt {
  const [dx, dy] = [root[0] - tip[0], root[1] - tip[1]];
  const l = Math.hypot(dx, dy);
  let p: Pt = root;
  for (let s = 0; s < 6; s += 0.002) {
    p = [root[0] + (dx / l) * s, root[1] + (dy / l) * s];
    const c = onSpine(p);
    if (Math.hypot(p[0] - c[0], p[1] - c[1]) <= r) {
      break;
    }
  }
  return p;
}
/** Carbon's legs: each as [tip of one edge, its root], [tip of the other edge, its root]. */
const LEG_EDGES: Array<[[Pt, Pt], [Pt, Pt]]> = [
  [
    [
      [2.46, 9.48],
      [7.29, 10.82],
    ],
    [
      [2, 11.41],
      [7, 12.77],
    ],
  ],
  [
    [
      [29.55, 9.48],
      [24.72, 10.77],
    ],
    [
      [30.06, 11.41],
      [25, 12.77],
    ],
  ],
  [
    [
      [1.84, 18],
      [7, 17.15],
    ],
    [
      [2.16, 20],
      [7, 19.18],
    ],
  ],
  [
    [
      [30.17, 18],
      [25, 17.15],
    ],
    [
      [29.83, 20],
      [25, 19.18],
    ],
  ],
  [
    [
      [3.29, 27.29],
      [7.82, 22.75],
    ],
    [
      [4.71, 28.71],
      [8.9, 24.51],
    ],
  ],
  [
    [
      [28.71, 27.29],
      [24.17, 22.75],
    ],
    [
      [27.29, 28.71],
      [23.1, 24.51],
    ],
  ],
];
/** Each leg's band at rest, and the outward normal of the wall at its root (the way it rides). */
const LEGS = LEG_EDGES.map(([[a, ar], [b, br]]) => {
  const pts: Pt[] = [a, reachWall(a, ar, 8), reachWall(b, br, 8), b];
  const root: Pt = [(ar[0] + br[0]) / 2, (ar[1] + br[1]) / 2];
  const c = onSpine(root);
  const l = Math.hypot(root[0] - c[0], root[1] - c[1]);
  return { pts, root, out: [(root[0] - c[0]) / l, (root[1] - c[1]) / l] as Pt };
});
/** Pair i's swing (0 → 1 → 0) at hover h: its own LEG_MOVE of the whole (LEG_MOVE + 2 × LEG_GAP), a smooth rise and fall. */
export function legSwing(h: number, i: number): number {
  const t = Math.min(
    1,
    Math.max(0, (h * (LEG_MOVE + 2 * LEG_GAP) - i * LEG_GAP) / LEG_MOVE)
  );
  return Math.sin(Math.PI * t * t * (3 - 2 * t));
}
/** p turned by a (radians, clockwise on screen) about c. */
const turn = ([x, y]: Pt, [cx, cy]: Pt, a: number): Pt => [
  cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a),
  cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a),
];
/** The antennae (x 12–14 and 18–20 from y 2), carried down into the head's wall (y 5.5: past r8 at its outer side, short of the dome); `u` rides them up, `a` lengthens them. */
const ANTENNAE = (u: number, a: number) =>
  rectPath(12, 2 - u - a, 14, 5.5 - u) + rectPath(18, 2 - u - a, 20, 5.5 - u);
function bugBody(g: number): string {
  const [R, r] = [9 + g, 7 + g];
  const w = Math.sqrt(r * r - 4); // the dome's half-width on the neck rule (2 above its centre)
  const s = Math.sqrt(r * r - 1); // the wings' depth at the seam (1 beside the centre)
  const [l, rt] = [7 - g, 25 + g];
  return (
    `M${f(l)} 13A${f(R)} ${f(R)} 0 0 1 ${f(rt)} 13V19A${f(R)} ${f(R)} 0 0 1 ${f(l)} 19Z` +
    `M${f(16 - w)} 11A${f(r)} ${f(r)} 0 0 1 ${f(16 + w)} 11Z` +
    `M15 13H${f(9 - g)}V19A${f(r)} ${f(r)} 0 0 0 15 ${f(19 + s)}Z` +
    `M17 13V${f(19 + s)}A${f(r)} ${f(r)} 0 0 0 ${f(23 + g)} 19V13Z`
  );
}

export const DebugSpec = /* @__PURE__ */ hoverIcon('Debug', {
  hover: legs.hover,
  geo: ({ h, entering = 1 }) => {
    const k = legs.at(h, 0); // the grow, on the first LEG_MOVE
    const g = BUG_GROW * k;
    return {
      body: { d: bugBody(g), ...EVENODD },
      legs: {
        d: LEGS.map(({ pts, root, out }, i) => {
          // Left legs (even) turn anticlockwise to swing their tips down, right legs clockwise.
          const a = entering
            ? (i % 2 ? 1 : -1) *
              ((LEG_SWING_DEG * Math.PI) / 180) *
              legSwing(h, i >> 1)
            : 0;
          return cw(
            pts
              .map((p) => turn(p, root, a))
              .map(([x, y]) => [x + out[0] * g, y + out[1] * g] as Pt)
          );
        }).join(''),
      },
      antennae: { d: ANTENNAE(g, ANTENNA_GROW * k) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Debug32),
});

// ── Web services cluster, Software resource cluster ──────────────────────────

/** How far Web services cluster's diamonds' outer tips move out, and its hexagon grows out along every edge. */
export const WEB_CLUSTER_SPREAD = 1;
export const WEB_HEXAGON_GROW = 2;
/** How far Software resource cluster's diamonds' outer tips move out. */
export const RESOURCE_CLUSTER_SPREAD = 2;
/** Each cluster's diamonds grow by half their tips' move (half-diagonal), their centres moving the other half, so their spacing holds. */
export const CLUSTER_DIAMOND_GROW = 0.5;
/** The four diamonds' directions out from the centre: down, right, up, left. */
const OUT: Pt[] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

/**
 * A diamond (points relative to its centre, each pair "x y") at c, grown g:
 * every point moves g out along the axis of the tip it belongs to, so the
 * rounded tips keep their shape and every straight edge, outer and hollow,
 * moves out g/√2 (the wall holds).
 */
function diamond(rel: string, [cx, cy]: Pt, g: number): string {
  const n = (v: number) => +v.toFixed(4);
  return rel.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_, xs: string, ys: string) => {
    const [x, y] = [+xs, +ys];
    const [dx, dy] =
      Math.abs(x) > Math.abs(y) ? [Math.sign(x) * g, 0] : [0, Math.sign(y) * g];
    return `${n(cx + x + dx)} ${n(cy + y + dy)}`;
  });
}
/** Carbon's small diamond (web-services--cluster's: half-diagonal 4, hollow 1.59), about its centre. */
const WEB_DIAMOND =
  'M0 4C-0.2559 4,-0.512 3.9023,-0.707 3.7072L-3.707 0.7072C-3.9023 0.5119,-4 0.256,-4 0.0001C-4 -0.2558,-3.9023 -0.5117,-3.707 -0.7071' +
  'L-0.707 -3.7071C-0.5119 -3.9023,-0.256 -3.9999,0 -3.9999C0.256 -3.9999,0.512 -3.9022,0.707 -3.7071L3.707 -0.7071C3.9023 -0.5118,4 -0.2559,4 0' +
  'C4 0.2559,3.9023 0.5118,3.707 0.7072L0.707 3.7072C0.5119 3.9024,0.2558 4,0 4ZM-1.5857 0L0 1.5858L1.5857 0L0 -1.5858Z';
/**
 * The open hexagon's centreline (clockwise on screen, from the lower right
 * edge's end round to the right wall's): Carbon's run is this, 2px wide,
 * round outer corners (r 1), mitred inner ones, square ends.
 */
const WEB_HEX: Pt[] = [
  [27, 23.5834],
  [16, 30],
  [4, 23],
  [4, 9],
  [16, 2],
  [28, 9],
  [28, 17],
];
/** The open hexagon with every edge moved g out, at its 2px weight. */
function openHexagon(g: number): string {
  // Each edge's outward normal.
  const n = WEB_HEX.slice(1).map(([x, y], i): Pt => {
    const [px, py] = WEB_HEX[i];
    const l = Math.hypot(x - px, y - py);
    return [(y - py) / l, -(x - px) / l];
  });
  const at = (p: Pt, v: Pt, k: number): Pt => [
    p[0] + v[0] * k,
    p[1] + v[1] * k,
  ];
  // A corner's miter: where its two edges' lines, each moved one unit out, meet.
  const miter = (a: Pt, b: Pt): Pt => {
    const d = 1 + a[0] * b[0] + a[1] * b[1];
    return [(a[0] + b[0]) / d, (a[1] + b[1]) / d];
  };
  const last = n.length - 1;
  const [start, end] = [
    at(WEB_HEX[0], n[0], g),
    at(WEB_HEX[last + 1], n[last], g),
  ];
  const corners = n.slice(1).map((b, i) => ({
    v: at(WEB_HEX[i + 1], miter(n[i], b), g),
    a: n[i],
    b,
    m: miter(n[i], b),
  }));
  const P = (p: Pt) => `${f(p[0])} ${f(p[1])}`;
  // Out along the outer side (round corners), across the far end, back along the inner side (mitred corners).
  let d = `M${P(at(start, n[0], 1))}`;
  for (const { v, a, b } of corners) {
    d += `L${P(at(v, a, 1))}A1 1 0 0 1 ${P(at(v, b, 1))}`;
  }
  d += `L${P(at(end, n[last], 1))}L${P(at(end, n[last], -1))}`;
  for (const { v, m } of [...corners].reverse()) {
    d += `L${P(at(v, m, -1))}`;
  }
  return `${d}L${P(at(start, n[0], -1))}Z`;
}
export const WebServicesClusterSpec = /* @__PURE__ */ hoverIcon(
  'WebServicesCluster',
  {
    geo: ({ h }) => {
      const g = WEB_CLUSTER_SPREAD * h;
      return {
        hexagon: { d: openHexagon(WEB_HEXAGON_GROW * h) },
        // Each tip moves g out: the centre half of it, the growth the other half.
        diamonds: {
          d: OUT.map(([x, y]) =>
            diamond(
              WEB_DIAMOND,
              [16 + x * (6 + g / 2), 16 + y * (6 + g / 2)],
              CLUSTER_DIAMOND_GROW * g
            )
          ).join(''),
        },
      };
    },
    static: /* @__PURE__ */ carbonArt(WebServicesCluster32),
  }
);

/** Carbon's diamond (software-resource--cluster's: half-diagonal 5, hollow 3), about its centre. */
const RESOURCE_DIAMOND =
  'M0 5C-0.5 5,-1 4.8,-1.4 4.4L-4.4 1.4C-4.8 1,-5 0.5,-5 0C-5 -0.5,-4.8 -1,-4.4 -1.4L-1.4 -4.4C-1 -4.8,-0.5 -5,0 -5' +
  'C0.5 -5,1 -4.8,1.4 -4.4L4.4 -1.4C4.8 -1,5 -0.5,5 0C5 0.5,4.8 1,4.4 1.4L1.4 4.4C1 4.8,0.5 5,0 5ZM0 -3L-3 0L0 3L3 0Z';
export const SoftwareResourceClusterSpec = /* @__PURE__ */ hoverIcon(
  'SoftwareResourceCluster',
  {
    geo: ({ h }) => {
      const t = RESOURCE_CLUSTER_SPREAD * h;
      // Each tip moves t out: the centre half of it, the growth the other half.
      return {
        diamonds: {
          d: OUT.map(([x, y]) =>
            diamond(
              RESOURCE_DIAMOND,
              [16 + x * (8 + t / 2), 16 + y * (8 + t / 2)],
              CLUSTER_DIAMOND_GROW * t
            )
          ).join(''),
        },
      };
    },
    static: /* @__PURE__ */ carbonArt(SoftwareResourceCluster32),
  }
);

/** Every icon here, by name (for tests and review sheets). */
export const SYSTEMS_ICONS = {
  Data_1: Data_1Spec,
  Data_2: Data_2Spec,
  DataViewAlt: DataViewAltSpec,
  ChartWinLoss: ChartWinLossSpec,
  MergeNode: MergeNodeSpec,
  ParentNode: ParentNodeSpec,
  AppConnectivity: AppConnectivitySpec,
  Integration: IntegrationSpec,
  DecisionTree: DecisionTreeSpec,
  TreeView: TreeViewSpec,
  VirtualMachine: VirtualMachineSpec,
  Branch: BranchSpec,
  Migrate: MigrateSpec,
  Deploy: DeploySpec,
  Run: RunSpec,
  Debug: DebugSpec,
  WebServicesCluster: WebServicesClusterSpec,
  SoftwareResourceCluster: SoftwareResourceClusterSpec,
} as const;
