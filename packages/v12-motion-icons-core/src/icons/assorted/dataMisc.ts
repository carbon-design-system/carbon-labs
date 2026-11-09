/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ChartParallel32 from '@carbon/icons/es/chart--parallel/32.js';
import HeatMap32 from '@carbon/icons/es/heat-map/32.js';
import ProgressBarRound32 from '@carbon/icons/es/progress-bar--round/32.js';
import DataStructured32 from '@carbon/icons/es/data--structured/32.js';
import Category32 from '@carbon/icons/es/category/32.js';
import ParentChild32 from '@carbon/icons/es/parent-child/32.js';
import TreeViewAlt32 from '@carbon/icons/es/tree-view--alt/32.js';
import QueryQueue32 from '@carbon/icons/es/query-queue/32.js';
import Ordinal16 from '@carbon/icons/es/ordinal/16.js';
import Ordinal32 from '@carbon/icons/es/ordinal/32.js';
import Types32 from '@carbon/icons/es/types/32.js';
import Categories32 from '@carbon/icons/es/categories/32.js';
import TableOfContents32 from '@carbon/icons/es/table-of-contents/32.js';
import Policy32 from '@carbon/icons/es/policy/32.js';
import License32 from '@carbon/icons/es/license/32.js';
import JoinRight32 from '@carbon/icons/es/join--right/32.js';
import PackageNode32 from '@carbon/icons/es/package-node/32.js';
import TextLink32 from '@carbon/icons/es/text-link/32.js';
import MigrateAlt32 from '@carbon/icons/es/migrate--alt/32.js';
import Area32 from '@carbon/icons/es/area/32.js';
import Overlay32 from '@carbon/icons/es/overlay/32.js';
import Insert32 from '@carbon/icons/es/insert/32.js';
import UpdateNow32 from '@carbon/icons/es/update-now/32.js';
import CenterSquare32 from '@carbon/icons/es/center--square/32.js';
import Queued32 from '@carbon/icons/es/queued/32.js';
import CarouselHorizontal32 from '@carbon/icons/es/carousel--horizontal/32.js';
import { hoverIcon, type Shapes, carbonArt } from '../../engine';
import {
  clipConvex,
  framePath,
  polyPath,
  rectPath,
  ringPath,
  roundedOutlinePath,
  type Pt,
} from '../../geometry';
import { strokeOutline } from '../../off';
import { cutPoly, type HalfPlane } from '../../cut';
import { together } from '../../ease';
import { motionTokens, toEasing } from '../../tokens';
import { EVENODD, f } from '../../paint';
import { CHAT_HOVER, chatHover } from '../operations/opsLast';

/**
 * Data and miscellaneous icons on the frame engine: Chart parallel, Heat
 * map, Progress bar round, Data structured, Parent child, Tree view alt,
 * Query queue, Ordinal, Types, Categories, Category, Table of contents,
 * Policy, License, Join right, Package node, Text link, Migrate alt, Area,
 * Overlay, Insert, Update now, Center square, Queued and Carousel
 * horizontal. Carbon has one (32px) drawing of each, used at every size,
 * except Ordinal, which has its own 16px drawing (returned, doubled into the
 * 32 grid, at size 16). Each rests on Carbon's outline. On hover the parts
 * move as geometry at a constant 2px wall: points move, nothing is
 * transform-scaled, no masks or clip paths. Standard hover (160ms entrance
 * in, 120ms exit out) unless noted.
 *
 *  - Chart parallel: a data update (the charts' rule): the three series take
 *    new values, each point sliding 2px along its axis (the categories hold):
 *    top 10,5,9,6 → 8,7,7,4; middle 20,13,19,13 → 18,15,17,15; bottom
 *    27,23,26,21 → 25,21,28,23. The four axes hold. Every segment is rebuilt
 *    between the axes' walls at a 2px perpendicular weight; the series never
 *    come closer than 6px centre to centre at an axis.
 *  - Heat map: a checker across the diagonals. The
 *    pairs' big tiles grow 2px (10 → 12) from the corner each shares with
 *    its small tile; the lone top-left and bottom-right tiles shrink 1px a
 *    side about their centres (8 → 6); the bottom-left small tile shrinks
 *    2px into its shared corner (8 → 6). The top-right small tile and the
 *    dots hold. Tiles stay square; every gap stays 2px or more.
 *  - Progress bar round: the whole arc turns 45° clockwise, its start included,
 *    and grows 60° (228° → 288°), so it travels as it grows; its ends keep
 *    their radial cuts (72° open between them at full hover) and both rings
 *    hold, 2px gaps.
 *  - Category (Flow's: the root and the nodes it feeds together, 160ms,
 *    no stagger): the root box grows 1px a side; the child
 *    nodes grow 1px (rings in radius) and the outer children step 2px out,
 *    their legs riding with them as the bar lengthens 2px at each end, so
 *    the 2px gaps between children hold (the People family's rule for
 *    groups). Links hold otherwise, their ends tucked into the node walls.
 *  - Data structured: Category's
 *    children motion only (the square box grows 1px a side, the rings 1px
 *    in radius and step 2px out; 2px gaps held); the root and its dot hold.
 *    Standard hover.
 *  - Parent child: Decision tree's motion: the root box grows 1px a side,
 *    and the children grow 1px a side and step 1px apart (4px gap held;
 *    legs ride, the bar lengthens 1px each end).
 *  - Tree view alt: the root grows 1px a side, then
 *    the three right boxes widen 2px to the right, all together
 *    (their left edges, tops and bottoms hold, so the 3px gaps and every
 *    link hold).
 *  - Query queue: Playlist's hover (Chat's 190ms): the queue advances a row.
 *    The top line rises and blinks out in one step (no fade),
 *    where Chat's fade would be half done (risen 3.3px); the others rise 6px: the short
 *    line by the play marker widens 13 → 18px over the second half of its
 *    rise (once clear of the marker) and the bottom line shortens 18 → 13px
 *    over the first half of its rise (before it reaches the marker); a new
 *    full line comes in from 4.47px below, fading in and widening 14 →
 *    18px. The marker grows 20% about its centroid. It lands on Carbon's
 *    drawing, one item on.
 *  - Ordinal: Skill level's rise: each column rises 2px, together
 *    (no stagger); the baseline holds.
 *  - Types: Code's motion: the chevrons step 2px apart; the diamond grows
 *    1px out along each edge (Flow connection's diamond).
 *  - Categories: each folder grows 1px on every edge (its tab with it) and
 *    the four step 1px apart, out to their corners, so the 4px and 2px gaps
 *    between them hold.
 *  - Table of contents: List's motion, row by row, one frame (16ms) apart:
 *    each line reaches 1px left (away from its page number) and the page
 *    number grows 1px (2 → 3px square, 0.5px a side).
 *  - Policy: Recommend's medal motion, scaled to this medal: the ring grows
 *    1px in radius, the legs hold and the tails drop 2px. The page's open
 *    right wall draws back 1px and the short line's end 1.03px, so their
 *    4px and 2.25px spaces to the ring hold. The page holds.
 *  - License: Document's page motion: the page grows 2px on each side (20×28
 *    → 24×32); the text lines reach 1px at each end, the top three riding
 *    up 2px with the top wall and the signature line down 2px with the
 *    bottom wall, so their 2px margins to those walls hold.
 *  - Join right: the circles slide 1px each toward each other (centres 8 →
 *    6px apart); the overlap and the right circle's crescent are rebuilt
 *    from the circles each frame, so the 2px knockout of the left ring holds.
 *  - Package node: Folder's motion: every edge steps 2px out (the container
 *    rule; 28 → 32 wide), the tab with it; walls hold 2px.
 *  - Text link: Link's motion, rigid: the halves pull
 *    apart 1px per axis each, and both sides of each crossing are re-cut
 *    every frame. Each far end runs on along its open side (2.83px, the
 *    other half's travel), so the space from its cut to the other half
 *    holds at 2.41px; each near end is cut straight across the axis just
 *    far enough (2.04px behind its centre at full hover) that the space to
 *    the other half's arc holds at 2.26px. The one space that can't hold
 *    with it, from that near cut to the other half's side, opens 2.26 →
 *    2.41px. The text lines reach 2px right.
 *  - Migrate alt: an arrow inside a glyph: its head reaches 2px right, the
 *    shaft lengthening from the wall, and the divider moves 2px
 *    right with it. The frame holds (Launch).
 *  - Area: the area grows: each corner node steps 1px out on both axes and
 *    grows 1px in diameter, its wall 2px; the edges lengthen to
 *    follow (2px longer), their ends still inside the node walls.
 *  - Overlay: the windows slide 1px toward each other on both axes, so the
 *    overlap grows 2px each way; its hatch holds in place, the corner
 *    knockouts widening with the overlap.
 *  - Insert: the list opens where the arrow points: the top box steps 1px
 *    up and the two below step 1px down (the gap 3 → 5px) while the arrow's
 *    head reaches 2px left into it, the shaft lengthening; the tail holds.
 *  - Update now: the arrow turns anticlockwise (Renew's and Recently
 *    viewed's standard), 36° rather than their 45° (at 45° the arrowhead's
 *    corner would pass the 36×36 box). Both arc ends by the clock hold
 *    their 1.94px space to its ring throughout, as if the arc ran on behind
 *    the clock: the upper arc's end stays by the clock (5.4° back as the
 *    ring grows) while its head turns, so it lengthens 138° → 169°; the
 *    lower arc's leading end is cut at the clock's clearance, so it shortens
 *    90° → 49°. The clock keeps Event schedule's motion, turning with the
 *    arrow: the ring grows 1px in radius, the minute hand turns 90° and the
 *    hour hand 7.5°, anticlockwise.
 *  - Center square: the corner brackets move 2px out on
 *    each axis and each tick of the centre cross reaches 1px at its outer
 *    end (its inner end holds).
 *  - Queued: the dashed ring grows 2px in radius (Circle dash's)
 *    and turns one dash period (40°) clockwise, landing on its own pattern;
 *    a dash passing the queue is cut, as geometry, where it comes within
 *    4px of it (its rest gap: x ≥ 14, y ≥ 16), so it slides behind that
 *    line and the next comes out from it. The queue takes List's motion:
 *    row by row, one frame (16ms) apart, each line reaches 1px right (its
 *    bullet holds: the rows are only 2px apart).
 *  - Carousel horizontal: the carousel scrolls one card left (18px, 220ms),
 *    cut at the frame's edges as Carbon cuts the side cards: the centre card
 *    shrinks to a side card's height as it leaves, the right card grows as
 *    it comes in, and a new card enters on the right, so it lands on
 *    Carbon's drawing (Data 2's scroll).
 *
 * Not built: none skipped. None of these is a badge icon (base + inset
 * status mark): Policy's seal and Update now's clock are objects (as
 * Certificate's seal and Event schedule's clock), and none is a text-only
 * glyph.
 */

const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
const DEG = Math.PI / 180;
const circleD = ([cx, cy]: Pt, r: number) =>
  `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;
/** A circle as four cubics (clockwise on screen, or anticlockwise), as systems.ts draws its nodes. */
const KAPPA = 0.5523;
function cubicCircle([cx, cy]: Pt, r: number, ccw = false): string {
  const [k, s] = [r * KAPPA, ccw ? -1 : 1];
  const q = (a: Pt, b: Pt, c: Pt) => `C${P(a)} ${P(b)} ${P(c)}`;
  return (
    `M${f(cx - r)} ${f(cy)}` +
    q([cx - r, cy - s * k], [cx - k, cy - s * r], [cx, cy - s * r]) +
    q([cx + k, cy - s * r], [cx + r, cy - s * k], [cx + r, cy]) +
    q([cx + r, cy + s * k], [cx + k, cy + s * r], [cx, cy + s * r]) +
    q([cx - k, cy + s * r], [cx - r, cy + s * k], [cx - r, cy]) +
    'Z'
  );
}
/** A square-cornered box with 2px walls (even-odd). */
const squareBox = (x0: number, y0: number, x1: number, y1: number) =>
  rectPath(x0, y0, x1, y1) + rectPath(x0 + 2, y0 + 2, x1 - 2, y1 - 2);
/** The node family's timing: the source and the nodes it feeds, together (no stagger). */
const flow = /* @__PURE__ */ together();
/** How much a node grows (1px: a box a side, a ring in radius). */
export const NODE_GROW = 1;
/** Line ends sit this far from a ring node's centre (Flow's tuck): inside its wall at rest (r 2–4) and grown (r 3–5). */
const TUCK = 3.2;

// ── Chart parallel ───────────────────────────────────────────────────────────
//
// Four axes (x 2–4, 10–12, 20–22, 28–30; y 2–30) and three series, each a
// 2px line through one point on every axis (at the axis's centre x 3, 11,
// 21, 29). Carbon draws each segment only between the axes' walls; here it
// runs 0.5px into each axis (hidden by the axis), so no seam shows.

const AXIS_X = [3, 11, 21, 29];
const SERIES_REST = [
  [10, 5, 9, 6],
  [20, 13, 19, 13],
  [27, 23, 26, 21],
];
/** Each series' new values on hover (every point moves 2px along its axis). */
export const SERIES_HOVER = [
  [8, 7, 7, 4],
  [18, 15, 17, 15],
  [25, 21, 28, 23],
];
function seriesPath(ys: number[]): string {
  return ys
    .slice(1)
    .map((y1, i) => {
      const [x0, x1, y0] = [AXIS_X[i], AXIS_X[i + 1], ys[i]];
      const m = (y1 - y0) / (x1 - x0);
      const hv = Math.sqrt(1 + m * m); // half the vertical thickness of a 2px line of slope m
      const [xa, xb] = [x0 + 0.5, x1 - 0.5];
      const [ya, yb] = [y0 + m * 0.5, y1 - m * 0.5];
      return polyPath(
        [
          [xa, ya - hv],
          [xb, yb - hv],
          [xb, yb + hv],
          [xa, ya + hv],
        ],
        true
      );
    })
    .join('');
}
const PARALLEL_AXES = /* @__PURE__ */ (() =>
  AXIS_X.map((x) => rectPath(x - 1, 2, x + 1, 30)).join(''))();

export const ChartParallelSpec = /* @__PURE__ */ hoverIcon('ChartParallel', {
  geo: ({ h }) => {
    const s: Shapes = { axes: { d: PARALLEL_AXES } };
    SERIES_REST.forEach((ys, i) => {
      s[`series${i}`] = {
        d: seriesPath(ys.map((y, j) => y + (SERIES_HOVER[i][j] - y) * h)),
      };
    });
    return s;
  },
  static: /* @__PURE__ */ carbonArt(ChartParallel32),
});

// ── Heat map ─────────────────────────────────────────────────────────────────
//
// Square tiles with 2px walls (outer corners r2, square inside): one at the
// top left (2–10) and one at the bottom right (22–30); two pairs of
// overlapping tiles (top right: 20–30 × 2–12 with 16–22 × 10–16; bottom
// left: 2–12 × 14–24 with 10–18 × 22–30), each pair one shape; and three
// 2px dots. The pairs are drawn nonzero, so their shared corner is one wall.

//
// Hover: a checker across the diagonals. The two big tiles
// of the pairs grow 2px (10 → 12) from the corner they share with their
// small tile (top right: up and right; bottom left: up and left), so each
// pair's joint holds; the two lone tiles (top left, bottom right) shrink
// 1px a side about their centres (8 → 6); and the bottom-left pair's small
// tile shrinks 2px into its shared corner (8 → 6). The top-right small tile
// (6, its inside only 2) and the dots hold. Every tile stays square and
// every gap stays 2px or more (the tightest, 2px, are held at rest values).

/** How much the pairs' big tiles grow, and the other tiles shrink (each tile's side). */
export const HEAT_GROW = 2;
export const HEAT_SHRINK = 2;
const HEAT_DOTS =
  /* @__PURE__ */ rectPath(14, 6, 16, 8) +
  /* @__PURE__ */ rectPath(20, 18, 22, 20) +
  /* @__PURE__ */ rectPath(28, 16, 30, 18);

export const HeatMapSpec = /* @__PURE__ */ hoverIcon('HeatMap', {
  geo: ({ h }) => {
    const [g, k] = [HEAT_GROW * h, HEAT_SHRINK * h];
    return {
      topLeft: { d: framePath(2 + k / 2, 2 + k / 2, 10 - k / 2, 10 - k / 2) },
      topRight: {
        d: framePath(20, 2 - g, 30 + g, 12) + framePath(16, 10, 22, 16),
      },
      bottomLeft: {
        d: framePath(2 - g, 14 - g, 12, 24) + framePath(10, 22, 18 - k, 30 - k),
      },
      bottomRight: {
        d: framePath(22 + k / 2, 22 + k / 2, 30 - k / 2, 30 - k / 2),
      },
      dots: { d: HEAT_DOTS },
    };
  },
  static: /* @__PURE__ */ carbonArt(HeatMap32),
});

// ── Progress bar round ───────────────────────────────────────────────────────
//
// Two rings about (16, 16): r 12–14 and r 4–6; between them the progress
// arc (r 8–10) from 12 o'clock clockwise to 138.18°, its ends cut radially.

const PB_C: Pt = [16, 16];
const onCircle = ([cx, cy]: Pt, r: number, deg: number): Pt => [
  cx + r * Math.cos(deg * DEG),
  cy + r * Math.sin(deg * DEG),
];
const PB_END = (Math.atan2(22.6675 - 16, 8.5469 - 16) * 180) / Math.PI;
/** How far the arc grows, and the whole arc turns clockwise. */
export const PROGRESS_ADVANCE = 60;
export const PROGRESS_TURN = 45;
function progressArc(start: number, end: number): string {
  const large = end - start > 180 ? 1 : 0;
  return `M${P(onCircle(PB_C, 10, start))}A10 10 0 ${large} 1 ${P(onCircle(PB_C, 10, end))}L${P(onCircle(PB_C, 8, end))}A8 8 0 ${large} 0 ${P(onCircle(PB_C, 8, start))}Z`;
}

export const ProgressBarRoundSpec = /* @__PURE__ */ hoverIcon(
  'ProgressBarRound',
  {
    geo: ({ h }) => ({
      outer: { d: ringPath(PB_C, 13, 2), ...EVENODD },
      arc: {
        d: progressArc(
          -90 + PROGRESS_TURN * h,
          PB_END + (PROGRESS_TURN + PROGRESS_ADVANCE) * h
        ),
      },
      inner: { d: ringPath(PB_C, 5, 2), ...EVENODD },
    }),
    static: /* @__PURE__ */ carbonArt(ProgressBarRound32),
  }
);

// ── Data structured, Category, Parent child, Tree view alt ───────────────────
//
// Trees of nodes joined by 2px links: a stem down from the root to a bar
// (y 16–18, outer corners r2) whose legs drop to the children. Link ends sit
// 0.5px past the outer face of a box wall (inside it at rest and grown 1px),
// or TUCK from a ring's centre.

/** How far the outer children step out (Data structured, Category), so the 2px gaps hold as they grow. */
export const CHILD_PART = 2;
/** A bar from x0 to x1 (the legs' outer edges) with its legs down to y: one clockwise outline. */
const legBar = (x0: number, x1: number, y: number) =>
  `M${f(x0)} ${f(y)}V18A2 2 0 0 1 ${f(x0 + 2)} 16H${f(x1 - 2)}A2 2 0 0 1 ${f(x1)} 18V${f(y)}H${f(x1 - 2)}V18H${f(x0 + 2)}V${f(y)}Z`;

// Data structured: the root and
// its dot hold; only the children move, on the standard hover.
export const DataStructuredSpec = /* @__PURE__ */ hoverIcon('DataStructured', {
  geo: ({ h }) => {
    const [g, p] = [NODE_GROW * h, CHILD_PART * h];
    return {
      links: {
        d:
          rectPath(15, 11.5, 17, 16) +
          legBar(5 - p, 27 + p, 26 - TUCK) +
          rectPath(15, 17, 17, 22.5),
      },
      root: { d: framePath(4, 2, 28, 12), ...EVENODD },
      dot: { d: circleD([9, 7], 1) },
      box: { d: squareBox(12 - g, 22 - g, 20 + g, 30 + g), ...EVENODD },
      left: { d: ringPath([6 - p, 26], 3 + g, 2), ...EVENODD },
      right: { d: ringPath([26 + p, 26], 3 + g, 2), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(DataStructured32),
});

export const CategorySpec = /* @__PURE__ */ hoverIcon('Category', {
  hover: flow.hover,
  geo: ({ h }) => {
    const [r, c] = [NODE_GROW * flow.at(h, 0), flow.at(h, 1)];
    const [g, p] = [NODE_GROW * c, CHILD_PART * c];
    return {
      links: {
        d: rectPath(15, 11.5, 17, 26 - TUCK) + legBar(5 - p, 27 + p, 26 - TUCK),
      },
      root: { d: framePath(11 - r, 2 - r, 21 + r, 12 + r), ...EVENODD },
      left: { d: ringPath([6 - p, 26], 3 + g, 2), ...EVENODD },
      middle: { d: ringPath([16, 26], 3 + g, 2), ...EVENODD },
      right: { d: ringPath([26 + p, 26], 3 + g, 2), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(Category32),
});

/** How far Parent child's two boxes part (each), so their 4px gap holds as they grow. */
export const PARENT_CHILD_PART = 1;
export const ParentChildSpec = /* @__PURE__ */ hoverIcon('ParentChild', {
  hover: flow.hover,
  geo: ({ h }) => {
    const [r, c] = [NODE_GROW * flow.at(h, 0), flow.at(h, 1)];
    const [g, p] = [NODE_GROW * c, PARENT_CHILD_PART * c];
    return {
      links: { d: rectPath(15, 11.5, 17, 16) + legBar(7 - p, 25 + p, 22.5) },
      root: { d: framePath(2 - r, 2 - r, 30 + r, 12 + r), ...EVENODD },
      left: { d: framePath(2 - g - p, 22 - g, 14 + g - p, 30 + g), ...EVENODD },
      right: {
        d: framePath(18 - g + p, 22 - g, 30 + g + p, 30 + g),
        ...EVENODD,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(ParentChild32),
});

/** How far Tree view alt's three right boxes widen to the right. */
export const TREE_ALT_WIDEN = 2;
const TREE_ALT_LINKS =
  /* @__PURE__ */ rectPath(10.5, 4, 21.5, 6) +
  'M17 5V15H21.5V17H17V26H21.5V28H17A2 2 0 0 1 15 26V5Z';
export const TreeViewAltSpec = /* @__PURE__ */ hoverIcon('TreeViewAlt', {
  hover: flow.hover,
  geo: ({ h }) => {
    const [r, w] = [NODE_GROW * flow.at(h, 0), TREE_ALT_WIDEN * flow.at(h, 1)];
    return {
      links: { d: TREE_ALT_LINKS },
      root: { d: framePath(1 - r, 1 - r, 11 + r, 9 + r), ...EVENODD },
      top: { d: framePath(21, 1, 31 + w, 9), ...EVENODD },
      middle: { d: framePath(21, 12, 31 + w, 20), ...EVENODD },
      bottom: { d: framePath(21, 23, 31 + w, 31), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(TreeViewAlt32),
});

// ── Query queue ──────────────────────────────────────────────────────────────
//
// Four lines (right-aligned at x 28; rows y 6, 12, 18 and 24), the third
// short (from x 15) beside the play marker (4,14 · 11,19 · 4,24), which
// points at it. Playlist's hover on Chat's timing and slices.

const QQ_PLAY: Pt[] = [
  [4, 14],
  [11, 19],
  [4, 24],
];
const QQ_CENTRE: Pt = [19 / 3, 19];
/** How much the marker grows about its centroid (Playlist's). */
export const QUEUE_PLAY_GROW = 0.2;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const QueryQueueSpec = /* @__PURE__ */ hoverIcon('QueryQueue', {
  hover: CHAT_HOVER,
  geo: ({ h }) => {
    const { g, line1, line2, line3 } = chatHover(h);
    const k2 = (16 - line2.y0) / 6;
    const k3 = (20.469 - line3.y0) / 4.469;
    const up = 6 * k2;
    const rise = 10 - line1.y0;
    const y4 = 24 + 4.469 * (1 - k3);
    const s = 1 + QUEUE_PLAY_GROW * (g / 2);
    return {
      // No fade: the top line is gone in one step where a fade would be half done.
      lineA: {
        d: line1.opacity <= 0.5 ? '' : rectPath(10, 6 - rise, 28, 8 - rise),
      },
      lineB: { d: rectPath(10, 12 - up, 28, 14 - up) },
      // The short line widens over the second half of its rise, clear of the marker.
      lineC: {
        d: rectPath(15 - 5 * clamp01((up - 3) / 3), 18 - up, 28, 20 - up),
      },
      // The bottom line shortens over the first half of its rise, before it reaches the marker.
      lineD: { d: rectPath(10 + 5 * clamp01(up / 3), 24 - up, 28, 26 - up) },
      lineE: {
        d: line3.hidden ? '' : rectPath(14 - 4 * k3, y4, 28, y4 + 2),
        opacity: f(line3.opacity),
      },
      play: {
        d: polyPath(
          QQ_PLAY.map(
            ([x, y]) =>
              [
                QQ_CENTRE[0] + (x - QQ_CENTRE[0]) * s,
                QQ_CENTRE[1] + (y - QQ_CENTRE[1]) * s,
              ] as Pt
          ),
          true
        ),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(QueryQueue32),
});

// ── Ordinal ──────────────────────────────────────────────────────────────────
//
// A staircase of three columns (2px walls, shared between neighbours) on a
// baseline. 32px: columns 6–12, 12–18, 18–26 with tops 16, 10, 4 on a
// baseline 26–28 (x 2–30). 16px (doubled): tops 18, 12, 6, baseline 24–26.

/** How far each column rises; the columns rise together (no stagger). */
export const ORDINAL_RISE = 2;
const steps = /* @__PURE__ */ together();
function ordinal(tops: number[], base: number): string {
  const [t1, t2, t3] = tops;
  return (
    `M26 ${base}V${f(t3)}H18V${f(t2)}H12V${f(t1)}H6V${base}H2V${base + 2}H30V${base}Z` +
    `M8 ${base}V${f(t1 + 2)}H12V${base}Z` +
    `M14 ${base}V${f(t2 + 2)}H18V${base}Z` +
    `M20 ${base}V${f(t3 + 2)}H24V${base}Z`
  );
}

export const OrdinalSpec = /* @__PURE__ */ hoverIcon('Ordinal', {
  hover: steps.hover,
  geo: ({ h }, size) => {
    const [tops, base] = size === 16 ? [[18, 12, 6], 24] : [[16, 10, 4], 26];
    return {
      stairs: {
        d: ordinal(
          tops.map((t, i) => t - ORDINAL_RISE * steps.at(h, i)),
          base
        ),
        ...EVENODD,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Ordinal16, Ordinal32),
});

// ── Types ────────────────────────────────────────────────────────────────────
//
// Code's chevrons (< >) either side of a diamond: a 2px wall on the
// centreline square of half-diagonal 5 about (16, 16), outer corners r1.

const CHEVRON: Pt[] = [
  [2, 16],
  [10, 8],
  [11.414, 9.414],
  [4.828, 16],
  [11.414, 22.586],
  [10, 24],
];
/** How far each chevron steps out (Code's), and the diamond grows out along each edge. */
export const TYPES_STEP = 2;
export const TYPES_GROW = 1;
function diamond(r: number): string {
  const v = (k: number): Pt[] => [
    [16 - k, 16],
    [16, 16 - k],
    [16 + k, 16],
    [16, 16 + k],
  ];
  return roundedOutlinePath(v(r), 1) + polyPath(v(r - Math.SQRT2), true);
}

export const TypesSpec = /* @__PURE__ */ hoverIcon('Types', {
  geo: ({ h }) => {
    const s = TYPES_STEP * h;
    return {
      left: {
        d: polyPath(
          CHEVRON.map(([x, y]) => [x - s, y] as Pt),
          true
        ),
      },
      diamond: { d: diamond(5 + Math.SQRT2 * TYPES_GROW * h), ...EVENODD },
      right: {
        d: polyPath(
          CHEVRON.map(([x, y]) => [32 - x + s, y] as Pt),
          true
        ),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Types32),
});

// ── Categories ───────────────────────────────────────────────────────────────
//
// Four of Carbon's small folders (2–14 × 4–15 at the top left, outer corners
// r1, its tab stepping down a steep diagonal to the body's top at y 6), at
// offsets (0, 0), (16, 0), (0, 13) and (16, 13): 4px apart across, 2px down.
// Growing g: every edge steps g out; the diagonal moves g along its normal,
// which carries its ends 0.62g right (the tab's rounded corner with them).

/** How far each folder grows on every edge, and steps out to its corner. */
export const FOLDER_GROW = 1;
export const FOLDER_PART = 1;
/** The diagonal's ends' slide per unit of growth: its normal is (1.45, −0.72)/|·|. */
const DIAG_SLIDE =
  (1 - 0.72 / Math.hypot(1.45, 0.72)) / (1.45 / Math.hypot(1.45, 0.72));
function folder(ox: number, oy: number, g: number): string {
  const s = DIAG_SLIDE * g;
  const X = (x: number) => f(x + ox);
  const Y = (y: number) => f(y + oy);
  const [L, R, T, Tb, B] = [2 - g, 14 + g, 4 - g, 6 - g, 15 + g];
  return (
    `M${X(7.38 + s)} ${Y(T)}H${X(L + 1)}A1 1 0 0 0 ${X(L)} ${Y(T + 1)}V${Y(B - 1)}A1 1 0 0 0 ${X(L + 1)} ${Y(B)}H${X(R - 1)}` +
    `A1 1 0 0 0 ${X(R)} ${Y(B - 1)}V${Y(Tb + 1)}A1 1 0 0 0 ${X(R - 1)} ${Y(Tb)}H${X(9 + s)}L${X(8.28 + s)} ${Y(4.55 - g)}A1 1 0 0 0 ${X(7.38 + s)} ${Y(T)}Z` +
    `M${X(6.76 + s)} ${Y(6 - g)}L${X(7.76 + s)} ${Y(8 - g)}H${X(12 + g)}V${Y(13 + g)}H${X(4 - g)}V${Y(6 - g)}Z`
  );
}

export const CategoriesSpec = /* @__PURE__ */ hoverIcon('Categories', {
  geo: ({ h }) => {
    const [g, p] = [FOLDER_GROW * h, FOLDER_PART * h];
    return {
      topLeft: { d: folder(-p, -p, g), ...EVENODD },
      topRight: { d: folder(16 + p, -p, g), ...EVENODD },
      bottomLeft: { d: folder(-p, 13 + p, g), ...EVENODD },
      bottomRight: { d: folder(16 + p, 13 + p, g), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(Categories32),
});

// ── Table of contents ────────────────────────────────────────────────────────
//
// Four rows (y 6, 12, 18, 24): a line (x 4–22) and its page number, a 2px
// square at x 26–28.

const TOC_ROWS = [6, 12, 18, 24];
const tocRows = /* @__PURE__ */ together();
/** How far each line reaches left, and each page number grows on each side. */
export const TOC_REACH = 1;
export const TOC_NUMBER_GROW = 0.5;

export const TableOfContentsSpec = /* @__PURE__ */ hoverIcon(
  'TableOfContents',
  {
    hover: tocRows.hover,
    geo: ({ h }) => {
      const s: Shapes = {};
      TOC_ROWS.forEach((y, i) => {
        const k = tocRows.at(h, i);
        const b = TOC_NUMBER_GROW * k;
        s[`line${i}`] = { d: rectPath(4 - TOC_REACH * k, y, 22, y + 2) };
        s[`number${i}`] = { d: rectPath(26 - b, y - b, 28 + b, y + 2 + b) };
      });
      return s;
    },
    static: /* @__PURE__ */ carbonArt(TableOfContents32),
  }
);

// ── Policy ───────────────────────────────────────────────────────────────────
//
// A page (4–24 × 2–30, outer corners r2) open at its lower right: its right
// wall stops at y 8, its bottom wall at x 16. Two text lines, and a medal:
// a ring (r 4–6 about (24, 18)) with a ribbon below it: legs (x 20–22 and
// 26–28) down to a notched tail (its notch 1.89px deep), one path.

const SEAL_C: Pt = [24, 18];
/** How far the ring grows in radius and the tails drop (Recommend's medal motion, scaled to this medal). */
export const POLICY_RING_GROW = 1;
export const POLICY_TAIL_DROP = 2;
/** The short line's end's space to the ring at rest, which it holds. */
const LINE_GAP = Math.hypot(8, 2) - 6;
function medal(g: number, d: number): string {
  const R = 6 + g;
  const yo = SEAL_C[1] + Math.sqrt(R * R - 16); // where the outer edge crosses x 20 and 28
  const yi = SEAL_C[1] + Math.sqrt(R * R - 4); // and x 22 and 26
  return (
    `M28 ${f(yo)}A${f(R)} ${f(R)} 0 1 0 20 ${f(yo)}V${f(30 + d)}L24 ${f(28.1074 + d)}L28 ${f(30 + d)}Z` +
    circleD(SEAL_C, 4 + g) +
    `M26 ${f(26.84 + d)}L24 ${f(25.8933 + d)}L22 ${f(26.84 + d)}V${f(yi)}A${f(R)} ${f(R)} 0 0 0 26 ${f(yi)}Z`
  );
}

export const PolicySpec = /* @__PURE__ */ hoverIcon('Policy', {
  geo: ({ h }) => {
    const g = POLICY_RING_GROW * h;
    // The short line's end draws back so its corner (y 16) keeps LINE_GAP to the grown ring.
    const e = Math.sqrt((6 + g + LINE_GAP) ** 2 - 4) - 8;
    return {
      page: {
        d: `M6 30A2 2 0 0 1 4 28V4A2 2 0 0 1 6 2H22A2 2 0 0 1 24 4V${f(8 - g)}H22V4H6V28H16V30Z`,
      },
      lines: { d: rectPath(9, 8, 19, 10) + rectPath(9, 14, 16 - e, 16) },
      medal: { d: medal(g, POLICY_TAIL_DROP * h), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(Policy32),
});

// ── License ──────────────────────────────────────────────────────────────────
//
// A page (6–26 × 2–30, outer corners r2) with four text lines: two full
// (10–22) and a short one at the top, and a short signature line at y 24.

/** How far the page grows on each side (Document's), and the lines reach at each end. */
export const LICENSE_GROW = 2;
export const LICENSE_REACH = 1;

export const LicenseSpec = /* @__PURE__ */ hoverIcon('License', {
  geo: ({ h }) => {
    const [g, e] = [LICENSE_GROW * h, LICENSE_REACH * h];
    return {
      page: { d: framePath(6 - g, 2 - g, 26 + g, 30 + g), ...EVENODD },
      lines: {
        d:
          rectPath(10 - e, 6 - g, 22 + e, 8 - g) +
          rectPath(10 - e, 10 - g, 22 + e, 12 - g) +
          rectPath(10 - e, 14 - g, 16 + e, 16 - g) +
          rectPath(10 - e, 24 + g, 16 + e, 26 + g),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(License32),
});

// ── Join right ───────────────────────────────────────────────────────────────
//
// Two circles of r 10: the left an outline (r 8–10 about (12, 16)), the
// right solid (about (20, 16)). Where they overlap, the right circle is
// filled except for the left ring's own 2px, which shows as a knockout: the
// lens (the right disc inside the left ring's hole) and the crescent (the
// right disc outside the left circle), with the left ring outside the right
// disc.

/** How far each circle slides toward the other. */
export const JOIN_SLIDE = 1;
/** The two crossings of circle (a, ra) and circle (b, rb): [upper, lower]. */
function crossings(a: Pt, ra: number, b: Pt, rb: number): [Pt, Pt] {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const t = (ra * ra - rb * rb + d * d) / (2 * d);
  const k = Math.sqrt(ra * ra - t * t);
  const [ux, uy] = [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
  const m: Pt = [a[0] + ux * t, a[1] + uy * t];
  return [
    [m[0] + uy * k, m[1] - ux * k],
    [m[0] - uy * k, m[1] + ux * k],
  ];
}

export const JoinRightSpec = /* @__PURE__ */ hoverIcon('JoinRight', {
  geo: ({ h }) => {
    const s = JOIN_SLIDE * h;
    const [L, R]: [Pt, Pt] = [
      [12 + s, 16],
      [20 - s, 16],
    ];
    const [iT, iB] = crossings(L, 8, R, 10);
    const [oT, oB] = crossings(L, 10, R, 10);
    return {
      crescent: { d: `M${P(oT)}A10 10 0 0 1 ${P(oB)}A10 10 0 1 0 ${P(oT)}Z` },
      lens: { d: `M${P(iT)}A10 10 0 0 0 ${P(iB)}A8 8 0 0 0 ${P(iT)}Z` },
      ring: {
        d: `M${P(iB)}A8 8 0 1 1 ${P(iT)}A10 10 0 0 1 ${P(oT)}A10 10 0 1 0 ${P(oB)}A10 10 0 0 1 ${P(iB)}Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(JoinRight32),
});

// ── Package node ─────────────────────────────────────────────────────────────
//
// A box (2–30 × 10–28) with a tab on its top left (2–16 × 4–12), outer
// corners r2 (the step at (16, 10) sharp); the tab's inside (4–14 × 6–10)
// and the box's (4–28 × 12–26) are separated by a 2px wall.

/** How far every edge steps out (Folder's container rule). */
export const PACKAGE_NODE_GROW = 2;

export const PackageNodeSpec = /* @__PURE__ */ hoverIcon('PackageNode', {
  geo: ({ h }) => {
    const g = PACKAGE_NODE_GROW * h;
    const [l, r, t, tb, b, tr] = [2 - g, 30 + g, 4 - g, 10 - g, 28 + g, 16 + g];
    return {
      node: {
        d:
          `M${f(l + 2)} ${f(t)}H${f(tr - 2)}A2 2 0 0 1 ${f(tr)} ${f(t + 2)}V${f(tb)}H${f(r - 2)}A2 2 0 0 1 ${f(r)} ${f(tb + 2)}V${f(b - 2)}` +
          `A2 2 0 0 1 ${f(r - 2)} ${f(b)}H${f(l + 2)}A2 2 0 0 1 ${f(l)} ${f(b - 2)}V${f(t + 2)}A2 2 0 0 1 ${f(l + 2)} ${f(t)}Z` +
          rectPath(l + 2, t + 2, tr - 2, tb) +
          rectPath(l + 2, tb + 2, r - 2, b - 2),
        ...EVENODD,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(PackageNode32),
});

// ── Text link ────────────────────────────────────────────────────────────────
//
// Three text lines at the top left and Carbon's link at the lower right: two
// hooks along the 45° diagonal (2px walls: inner r 3.264, outer r 5.2645
// about each end's centre). Each is a capsule with one long side missing,
// so it is open where the other passes through it: from the far end's cut,
// round the far end, along the side, round the near end to the near end's
// cut.
//
// Hover: Link's motion, rigid: the halves pull apart 1px per axis
// each. Each half's arc passes through the other's open side between that
// half's two cuts, so both cuts are re-cut every frame (as Link's and Copy
// link's gaps slide): the far end runs on along its open side by the other
// half's travel, holding its 2.41px; the near end is cut straight across
// the axis just far enough to hold its 2.26px. The halves are a half turn
// of each other, so one cut serves both.

type Hook = { n: Pt; f: Pt; side: Pt; move: Pt };
const HOOK_RI = 3.264;
const HOOK_RO = 5.2645;
const D45 = Math.SQRT1_2;
const HOOK_UPPER: Hook = {
  n: [18.706, 22.324],
  f: [24.736, 16.294],
  side: [D45, D45],
  move: [1, -1],
};
const HOOK_LOWER: Hook = {
  n: [16.294, 18.706],
  f: [10.264, 24.736],
  side: [-D45, -D45],
  move: [-1, 1],
};
/** How far each half pulls away on each axis (Link's), and the text lines reach right. */
export const TEXT_LINK_PULL = 1;
export const TEXT_LINE_REACH = 2;
const add = (p: Pt, d: Pt, k: number): Pt => [p[0] + d[0] * k, p[1] + d[1] * k];
/** The distance from p to the segment ab. */
function segDist(p: Pt, a: Pt, b: Pt): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const t = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))
  );
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
const cross = (a: Pt, b: Pt) => a[0] * b[1] - a[1] * b[0];
/** A hook's frame, moved by k along its pull: a point at (t along the axis from the near centre toward the far, w along the side normal). */
function hookFrame(hk: Hook, k: number) {
  const n = add(hk.n, hk.move, k);
  const lc = Math.hypot(hk.f[0] - hk.n[0], hk.f[1] - hk.n[1]);
  const u: Pt = [(hk.f[0] - hk.n[0]) / lc, (hk.f[1] - hk.n[1]) / lc];
  const s = hk.side;
  const at = (t: number, w: number): Pt => [
    n[0] + u[0] * t + s[0] * w,
    n[1] + u[1] * t + s[1] * w,
  ];
  return { n, u, s, lc, at };
}
/** The near end's cut (a straight cut across the axis, cn behind the near centre) on circle r: the end's w. */
const cutW = (r: number, cn: number) =>
  -Math.sqrt(Math.max(0, r * r - cn * cn));
/**
 * A hook: far arc, side, near arc. Its near end is cut straight across the
 * axis cn behind the near centre (0 at rest: Carbon's radial cut), and its
 * far end runs on cf along its open side (a straight stub; 0 at rest).
 */
function hookPath(hk: Hook, k: number, cn: number, cf: number): string {
  const { u, s, lc, at } = hookFrame(hk, k);
  const sweepFar = cross([-s[0], -s[1]], u) > 0 ? 1 : 0;
  const sweepNear = cross(s, [-u[0], -u[1]]) > 0 ? 1 : 0;
  const [R, r] = [HOOK_RO, HOOK_RI];
  const [O, I] = [f(R), f(r)];
  const stub =
    cf > 1e-4 ? `M${P(at(lc - cf, -R))}L${P(at(lc, -R))}` : `M${P(at(lc, -R))}`;
  const stubBack = cf > 1e-4 ? `L${P(at(lc - cf, -r))}` : '';
  return (
    `${stub}A${O} ${O} 0 0 ${sweepFar} ${P(at(lc, R))}L${P(at(0, R))}` +
    `A${O} ${O} 0 0 ${sweepNear} ${P(at(-cn, cutW(R, cn)))}L${P(at(-cn, cutW(r, cn)))}` +
    `A${I} ${I} 0 0 ${1 - sweepNear} ${P(at(0, r))}L${P(at(lc, r))}A${I} ${I} 0 0 ${1 - sweepFar} ${P(at(lc, -r))}${stubBack}Z`
  );
}
/** The distance from p to a hook's band (its arcs, side and stub; its near end taken as cut at the outer edge's cut angle, a hair generous). */
function hookDist(p: Pt, hk: Hook, k: number, cn: number, cf: number): number {
  const { n, u, s, lc, at } = hookFrame(hk, k);
  const d: Pt = [p[0] - n[0], p[1] - n[1]];
  const [t, w] = [d[0] * u[0] + d[1] * u[1], d[0] * s[0] + d[1] * s[1]];
  const rc = (HOOK_RI + HOOK_RO) / 2;
  const band = (v: number) => Math.max(0, Math.abs(v - rc) - 1);
  const ends = (a: Pt, b: Pt) => segDist(p, a, b);
  // Side: t 0..lc at w rc±1. Stub: t lc−cf..lc at w −rc±1.
  const side =
    t >= 0 && t <= lc
      ? band(w)
      : Math.min(
          ends(at(0, HOOK_RI), at(0, HOOK_RO)),
          ends(at(lc, HOOK_RI), at(lc, HOOK_RO))
        );
  const stub = cf > 0 && t >= lc - cf && t <= lc ? band(-w) : Infinity;
  // Far arc: t ≥ lc (a half circle about the far centre).
  const far =
    t >= lc
      ? band(Math.hypot(t - lc, w))
      : Math.min(
          ends(at(lc, -HOOK_RI), at(lc, -HOOK_RO)),
          ends(at(lc, HOOK_RI), at(lc, HOOK_RO))
        );
  // Near arc: t ≤ 0, and on the open half (w < 0) only behind the cut.
  const cutT = -cn;
  const onNear = t <= 0 && (w >= 0 || t <= cutT);
  const near = onNear
    ? band(Math.hypot(t, w))
    : Math.min(
        ends(at(-cn, cutW(HOOK_RI, cn)), at(-cn, cutW(HOOK_RO, cn))),
        ends(at(0, HOOK_RI), at(0, HOOK_RO))
      );
  return Math.min(side, stub, far, near);
}
/** The space from the upper half's near end (the band behind its cut) to the lower half, both cut by cn and run on by cf. */
function hookSpace(k: number, cn: number, cf: number): number {
  const { at } = hookFrame(HOOK_UPPER, k);
  let m = Infinity;
  for (let i = 0; i <= 24; i++) {
    for (const r of [HOOK_RI, (HOOK_RI + HOOK_RO) / 2, HOOK_RO]) {
      // Back from the cut round the arc, 45° of it.
      const a0 = Math.asin(Math.min(1, cn / r));
      const a = a0 + ((Math.PI / 4) * i) / 24;
      m = Math.min(
        m,
        hookDist(at(-r * Math.sin(a), -r * Math.cos(a)), HOOK_LOWER, k, cn, cf)
      );
    }
  }
  return m;
}
/** How far each far end runs on along its open side: the other half has moved that far along the axis, so the space across that crossing holds. */
export const hookRunOn = (k: number) => 2 * Math.SQRT2 * k;
const HOOK_GAP = /* @__PURE__ */ hookSpace(0, 0, 0);
/** How far behind its near centre each near end is cut (straight across the axis) when the halves are pulled k apart, so the space across that crossing holds. */
export function hookCut(k: number): number {
  const cf = hookRunOn(k);
  if (k <= 0 || hookSpace(k, 0, cf) >= HOOK_GAP) {
    return 0;
  }
  let [lo, hi] = [0, HOOK_RI];
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (hookSpace(k, mid, cf) >= HOOK_GAP) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return hi;
}

export const TextLinkSpec = /* @__PURE__ */ hoverIcon('TextLink', {
  geo: ({ h }) => {
    const [k, e] = [TEXT_LINK_PULL * h, TEXT_LINE_REACH * h];
    const [cn, cf] = [hookCut(k), hookRunOn(k)];
    return {
      text: {
        d:
          rectPath(2, 10, 10 + e, 12) +
          rectPath(2, 6, 14 + e, 8) +
          rectPath(2, 2, 14 + e, 4),
      },
      upper: { d: hookPath(HOOK_UPPER, k, cn, cf) },
      lower: { d: hookPath(HOOK_LOWER, k, cn, cf) },
    };
  },
  static: /* @__PURE__ */ carbonArt(TextLink32),
});

// ── Migrate alt ──────────────────────────────────────────────────────────────
//
// A window (2–30 × 4–28, outer corners r2) split by a divider (x 10–12)
// that breaks around the arrow, which runs from the left wall to its tip at
// (24, 16).

/** How far the arrow's head reaches right, and the divider moves right with it. */
export const MIGRATE_ALT_REACH = 2;

export const MigrateAltSpec = /* @__PURE__ */ hoverIcon('MigrateAlt', {
  geo: ({ h }) => {
    const a = MIGRATE_ALT_REACH * h;
    const X = (x: number) => f(x + a);
    return {
      window: {
        d:
          'M28 4H4A2 2 0 0 0 2 6V26A2 2 0 0 0 4 28H28A2 2 0 0 0 30 26V6A2 2 0 0 0 28 4Z' +
          `M28 26H${X(12)}V20H${X(10)}V26H4V17H${X(20.1719)}L${X(16.5859)} 20.5859L${X(18)} 22L${X(24)} 16L${X(18)} 10L${X(16.5859)} 11.4141L${X(20.1719)} 15H4V6H${X(10)}V12H${X(12)}V6H28Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(MigrateAlt32),
});

// ── Area ─────────────────────────────────────────────────────────────────────
//
// Four ring nodes (r 2–4) at the corners of a square ((6, 6) to (26, 26)),
// joined by 2px edges whose ends sit TUCK from each node's centre.

/** How far each corner node steps out on each axis (the area 2px wider and taller), and grows in diameter. */
export const AREA_GROW = 1;
export const AREA_NODE_GROW = 1;

export const AreaSpec = /* @__PURE__ */ hoverIcon('Area', {
  geo: ({ h }) => {
    const [e, n] = [AREA_GROW * h, (AREA_NODE_GROW / 2) * h];
    const [a, b] = [6 - e, 26 + e];
    return {
      edges: {
        d:
          rectPath(a - 1, a + TUCK, a + 1, b - TUCK) +
          rectPath(b - 1, a + TUCK, b + 1, b - TUCK) +
          rectPath(a + TUCK, a - 1, b - TUCK, a + 1) +
          rectPath(a + TUCK, b - 1, b - TUCK, b + 1),
      },
      nodes: {
        d: (
          [
            [a, a],
            [b, a],
            [a, b],
            [b, b],
          ] as Pt[]
        )
          .map((c) => cubicCircle(c, 4 + n) + cubicCircle(c, 2 + n, true))
          .join(''),
        ...EVENODD,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Area32),
});

// ── Overlay ──────────────────────────────────────────────────────────────────
//
// Two windows (22px square, outer corners r2, square inside): the back one
// at 2–24, the front at 8–30. Inside their overlap (10–22) two 2px hatch
// stripes run at 45° (centred on x − y = ±4).

/** How far each window slides toward the other on each axis. */
export const OVERLAY_SLIDE = 1;
const HATCH_U = [
  [-4 - Math.SQRT2, -4 + Math.SQRT2],
  [4 - Math.SQRT2, 4 + Math.SQRT2],
];

export const OverlaySpec = /* @__PURE__ */ hoverIcon('Overlay', {
  geo: ({ h }) => {
    const s = OVERLAY_SLIDE * h;
    const [a, b] = [10 - s, 22 + s]; // the overlap's inside
    const square: Pt[] = [
      [a, a],
      [b, a],
      [b, b],
      [a, b],
    ];
    const hatch = HATCH_U.map(([u0, u1]) =>
      polyPath(
        clipConvex(
          [
            [u0 - 10, -10],
            [u0 + 42, 42],
            [u1 + 42, 42],
            [u1 - 10, -10],
          ],
          square
        ),
        true
      )
    ).join('');
    return {
      back: { d: framePath(2 + s, 2 + s, 24 + s, 24 + s) },
      front: { d: framePath(8 - s, 8 - s, 30 - s, 30 - s) },
      hatch: { d: hatch },
    };
  },
  static: /* @__PURE__ */ carbonArt(Overlay32),
});

// ── Insert ───────────────────────────────────────────────────────────────────
//
// Three boxes (2–11, 7px tall, 2px walls, square corners) down the left, and
// an arrow that comes up round the right (outer corners r3, inner r1) and
// points left, its tip at (14, 10), between the first two boxes.

/** How far the boxes part (the top one up, the others down), and the arrow's head reaches left. */
export const INSERT_PART = 1;
export const INSERT_REACH = 2;

export const InsertSpec = /* @__PURE__ */ hoverIcon('Insert', {
  geo: ({ h }) => {
    const [p, a] = [INSERT_PART * h, INSERT_REACH * h];
    const X = (x: number) => f(x - a);
    return {
      top: { d: squareBox(2, 2 - p, 11, 9 - p), ...EVENODD },
      middle: { d: squareBox(2, 12 + p, 11, 19 + p), ...EVENODD },
      bottom: { d: squareBox(2, 22 + p, 11, 29 + p), ...EVENODD },
      arrow: {
        d: `M27 9H${X(18)}L${X(21.41)} 5.41L${X(20)} 4L${X(14)} 10L${X(20)} 16L${X(21.41)} 14.59L${X(18)} 11H27A1 1 0 0 1 28 12V24A1 1 0 0 1 27 25H15V27H27A3 3 0 0 0 30 24V12A3 3 0 0 0 27 9Z`,
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Insert32),
});

// ── Update now ───────────────────────────────────────────────────────────────
//
// Two arcs (r 12–14 about (16, 16); drawn with Carbon's arc radii, which
// rasterise as Carbon's do): the upper from its arrowhead (a corner
// bracket at the top left) clockwise to 3 o'clock, the lower from 6 o'clock
// to 9 o'clock; and a clock in the open quarter: a ring (r 5–7 about
// (24, 24)) and its hands, one mitred 2px stroke (minute 3 long, straight
// up; hour 3.24 long, at 135°).

const UN_C: Pt = [16, 16];
const CLOCK: Pt = [24, 24];
/** Time's hover, turning with the arrow (anticlockwise, as Recently viewed's hand): the ring grows 1px in radius, the minute hand turns 90°, the hour hand 7.5°. */
export const UPDATE_RING_GROW = 1;
export const UPDATE_MINUTE_TURN = 90;
export const UPDATE_HOUR_TURN = 7.5;
const MINUTE_LEN = 3;
const HOUR_LEN = 2.293 * Math.SQRT2;
/** The arcs' ends' space to the clock's ring at rest (their inner corners, 8.94 from its centre). */
const UN_GAP = Math.sqrt(80) - 7;
/** How far (degrees) an arc's end by the clock must stay back from 6 o'clock (or 3 o'clock) so its space to the ring (outer r R) holds. */
export function updateDrawBack(R: number): number {
  const D = R + UN_GAP;
  // The inner corner at angle φ about (16, 16) sits √(272 − 192(cos φ + sin φ)) from the clock's centre.
  const k = Math.min(Math.SQRT2, (272 - D * D) / 192);
  return -(Math.asin(k / Math.SQRT2) / DEG - 45);
}

/**
 * The rotating-arrow standard (Renew, Recently viewed: the arrow's arcs turn
 * anticlockwise as one), at 36° rather than 45°: the arrowhead's outer
 * corner sits 18.4 from the centre, and 45° would carry it 0.4px past the
 * 36×36 hover box; 36° is the most that fits.
 */
export const UPDATE_ARROW_TURN = 36;
/** p turned deg (screen degrees; negative = anticlockwise) about (16, 16). */
const turnUN = ([x, y]: Pt, deg: number): Pt => {
  const [c, sn] = [Math.cos(deg * DEG), Math.sin(deg * DEG)];
  return [
    UN_C[0] + (x - UN_C[0]) * c - (y - UN_C[1]) * sn,
    UN_C[1] + (x - UN_C[0]) * sn + (y - UN_C[1]) * c,
  ];
};

export const UpdateNowSpec = /* @__PURE__ */ hoverIcon('UpdateNow', {
  geo: ({ h }) => {
    const g = UPDATE_RING_GROW * h;
    const turn = UPDATE_ARROW_TURN * h;
    // The lower arc's leading end runs into the clock's clearance: it is cut there (at the angle that holds its 1.94px space to the grown ring), as if the arc ran on behind it.
    const back = updateDrawBack(7 + g);
    const low = 90 + back;
    const tail = 180 - turn;
    // The upper arc's head turns; its end by the clock holds its 1.94px to the grown ring.
    const T = (x: number, y: number) => P(turnUN([x, y], -turn));
    const [tm, th] = [
      -UPDATE_MINUTE_TURN * h * DEG,
      (135 - UPDATE_HOUR_TURN * h) * DEG,
    ]; // anticlockwise, with the arrow
    const minute: Pt = [
      CLOCK[0] + MINUTE_LEN * Math.sin(tm),
      CLOCK[1] - MINUTE_LEN * Math.cos(tm),
    ];
    const hour: Pt = [
      CLOCK[0] + HOUR_LEN * Math.sin(th),
      CLOCK[1] - HOUR_LEN * Math.cos(th),
    ];
    const hands = strokeOutline(
      [
        { k: 'L', a: minute, b: CLOCK },
        { k: 'L', a: CLOCK, b: hour },
      ],
      2
    ).open!;
    return {
      upper: {
        d: `M${T(12, 8)}L${T(7.0784, 8)}A11.9843 11.9843 0 0 1 ${P(onCircle(UN_C, 12, -back))}L${P(onCircle(UN_C, 14, -back))}A13.9778 13.9778 0 0 0 ${T(6, 6.2344)}L${T(6, 2)}L${T(4, 2)}L${T(4, 10)}L${T(12, 10)}Z`,
      },
      lower: {
        d: `M${P(onCircle(UN_C, 12, low))}A12.0134 12.0134 0 0 1 ${P(onCircle(UN_C, 12, tail))}L${P(onCircle(UN_C, 14, tail))}A14.0158 14.0158 0 0 0 ${P(onCircle(UN_C, 14, low))}Z`,
      },
      ring: { d: ringPath(CLOCK, 6 + g, 2), ...EVENODD },
      hands: { d: polyPath(hands, true) },
    };
  },
  static: /* @__PURE__ */ carbonArt(UpdateNow32),
});

// ── Center square ────────────────────────────────────────────────────────────
//
// Four corner brackets (2px, arms 8 long, 4–28) and four ticks round the
// centre (2×4 bars, their inner ends 2px from it).

const BRACKET: Pt[] = [
  [6, 12],
  [4, 12],
  [4, 4],
  [12, 4],
  [12, 6],
  [6, 6],
];
/** How far each bracket moves out on each axis, and each tick reaches at its outer end. */
export const CENTER_SQUARE_OPEN = 2;
export const CENTER_TICK_REACH = 1;

export const CenterSquareSpec = /* @__PURE__ */ hoverIcon('CenterSquare', {
  geo: ({ h }) => {
    const [o, t] = [CENTER_SQUARE_OPEN * h, CENTER_TICK_REACH * h];
    const corner = (sx: number, sy: number) =>
      polyPath(
        BRACKET.map(
          ([x, y]) => [16 + sx * (x - 16 - o), 16 + sy * (y - 16 - o)] as Pt
        ),
        true
      );
    return {
      brackets: {
        d: corner(1, 1) + corner(-1, 1) + corner(1, -1) + corner(-1, -1),
      },
      ticks: {
        d:
          rectPath(15, 10 - t, 17, 14) +
          rectPath(10 - t, 15, 14, 17) +
          rectPath(18, 15, 22 + t, 17) +
          rectPath(15, 18, 17, 22 + t),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(CenterSquare32),
});

// ── Queued ───────────────────────────────────────────────────────────────────
//
// A dashed ring (r 12–14 about (16, 16)): dashes 20° long with radial ends,
// one every 40° (screen angles, clockwise), and the queue in its lower
// right: three rows (y 20, 24, 28) of a 2px bullet (x 18–20) and a line
// (x 22–30). Carbon leaves out the two dashes that would run into the
// queue; here the ring is whole (nine dashes) and its dashes are cut away
// where they come within 4px of the queue (its rest gap): inside x ≥ 14,
// y ≥ 16. At rest that hides exactly Carbon's two missing dashes.

const DASH_STARTS = [-180, -140, -100, -60, -20, 20, 60, 100, 140];
/** The queue's clearance: the dashes are cut where x ≥ 14 and y ≥ 16 (4px from the queue's left and top). */
const QUEUE_CLEAR: HalfPlane[] = [
  { n: [1, 0], c: 14 },
  { n: [0, 1], c: 16 },
];
const inClear = ([x, y]: Pt) => x > 14 + 1e-6 && y > 16 + 1e-6;
const QUEUE_ROWS = [20, 24, 28];
const queueRows = /* @__PURE__ */ together();
/** How far the dashed ring grows in radius (Circle dash's), turns (one dash period, clockwise), and each queue line reaches right (List's). */
export const QUEUED_GROW = 2;
export const QUEUED_TURN = 40;
export const QUEUED_REACH = 1;
/** One dash (from angle a, 20° clockwise; radii ri–ro), cut clear of the queue. */
function queuedDash(a: number, ri: number, ro: number): string {
  const arc = (r: number, a0: number, a1: number) =>
    Array.from({ length: 21 }, (_, i) =>
      onCircle(UN_C, r, a0 + ((a1 - a0) * i) / 20)
    );
  const poly = [...arc(ri, a, a + 20), ...arc(ro, a + 20, a)];
  if (!poly.some(inClear)) {
    return `M${P(onCircle(UN_C, ri, a))}A${f(ri)} ${f(ri)} 0 0 1 ${P(onCircle(UN_C, ri, a + 20))}L${P(onCircle(UN_C, ro, a + 20))}A${f(ro)} ${f(ro)} 0 0 0 ${P(onCircle(UN_C, ro, a))}Z`;
  }
  return cutPoly(poly, QUEUE_CLEAR)
    .map((q) => polyPath(q, true))
    .join('');
}

export const QueuedSpec = /* @__PURE__ */ hoverIcon('Queued', {
  hover: queueRows.hover,
  geo: ({ h }) => {
    const k = queueRows.at(h, 0);
    const [ri, ro, t] = [
      12 + QUEUED_GROW * k,
      14 + QUEUED_GROW * k,
      QUEUED_TURN * k,
    ];
    const s: Shapes = {
      dashes: { d: DASH_STARTS.map((a) => queuedDash(a + t, ri, ro)).join('') },
      bullets: {
        d: QUEUE_ROWS.map((y) => rectPath(18, y, 20, y + 2)).join(''),
      },
    };
    QUEUE_ROWS.forEach((y, i) => {
      s[`line${i}`] = {
        d: rectPath(22, y, 30 + QUEUED_REACH * queueRows.at(h, i), y + 2),
      };
    });
    return s;
  },
  static: /* @__PURE__ */ carbonArt(Queued32),
});

// ── Carousel horizontal ──────────────────────────────────────────────────────
//
// Cards 16 wide with 2px walls (outer corners r2), 2px apart (an 18px
// pitch), cut at the frame's edges (x 0 and 32): the centre card (8–24 ×
// 6–26) and the inner ends of its neighbours (16px tall, 8–24). A card's
// height eases from 20 (centred) to 16 (a pitch away).

const CAROUSEL_HOVER = {
  duration: motionTokens.duration.moderate02 / 1000,
  ease: /* @__PURE__ */ toEasing(motionTokens.easing.entrance),
};
/** One card's pitch: the carousel scrolls this far left. */
export const CAROUSEL_PITCH = 18;
const STRIP: Pt[] = [
  [0, -10],
  [32, -10],
  [32, 42],
  [0, 42],
];
/** A rounded rect's outline as points (corners r, 12 steps each), clockwise on screen. */
function roundedRectPts(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number
): Pt[] {
  const out: Pt[] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 12; i++) {
      out.push([
        cx + r * Math.cos((a0 + (90 * i) / 12) * DEG),
        cy + r * Math.sin((a0 + (90 * i) / 12) * DEG),
      ]);
    }
  };
  corner(x1 - r, y0 + r, -90);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, 90);
  corner(x0 + r, y0 + r, 180);
  return out;
}
function card(x0: number): string {
  const t = Math.min(1, Math.abs(x0 + 8 - 16) / CAROUSEL_PITCH);
  const half = 10 - 2 * t;
  const [y0, y1] = [16 - half, 16 + half];
  const outer = clipConvex(roundedRectPts(x0, y0, x0 + 16, y1, 2), STRIP);
  if (outer.length < 3) {
    return '';
  }
  const inner = clipConvex(
    [
      [x0 + 2, y0 + 2],
      [x0 + 14, y0 + 2],
      [x0 + 14, y1 - 2],
      [x0 + 2, y1 - 2],
    ],
    STRIP
  );
  return (
    polyPath(outer, true) + (inner.length > 2 ? polyPath(inner, true) : '')
  );
}

export const CarouselHorizontalSpec = /* @__PURE__ */ hoverIcon(
  'CarouselHorizontal',
  {
    hover: CAROUSEL_HOVER,
    geo: ({ h }) => {
      const s = CAROUSEL_PITCH * h;
      return {
        left: { d: card(-10 - s), ...EVENODD },
        centre: { d: card(8 - s), ...EVENODD },
        right: { d: card(26 - s), ...EVENODD },
        next: { d: card(44 - s), ...EVENODD },
      };
    },
    static: /* @__PURE__ */ carbonArt(CarouselHorizontal32),
  }
);

/** Every icon here, by name (for tests and review sheets). */
export const DATA_MISC_ICONS = {
  ChartParallel: ChartParallelSpec,
  HeatMap: HeatMapSpec,
  ProgressBarRound: ProgressBarRoundSpec,
  DataStructured: DataStructuredSpec,
  ParentChild: ParentChildSpec,
  TreeViewAlt: TreeViewAltSpec,
  QueryQueue: QueryQueueSpec,
  Ordinal: OrdinalSpec,
  Types: TypesSpec,
  Categories: CategoriesSpec,
  Category: CategorySpec,
  TableOfContents: TableOfContentsSpec,
  Policy: PolicySpec,
  License: LicenseSpec,
  JoinRight: JoinRightSpec,
  PackageNode: PackageNodeSpec,
  TextLink: TextLinkSpec,
  MigrateAlt: MigrateAltSpec,
  Area: AreaSpec,
  Overlay: OverlaySpec,
  Insert: InsertSpec,
  UpdateNow: UpdateNowSpec,
  CenterSquare: CenterSquareSpec,
  Queued: QueuedSpec,
  CarouselHorizontal: CarouselHorizontalSpec,
} as const;
