/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Table32 from '@carbon/icons/es/table/32.js';
import TableSplit32 from '@carbon/icons/es/table--split/32.js';
import Column32 from '@carbon/icons/es/column/32.js';
import Split32 from '@carbon/icons/es/split/32.js';
import Compare32 from '@carbon/icons/es/compare/32.js';
import Fade16 from '@carbon/icons/es/fade/16.js';
import Fade32 from '@carbon/icons/es/fade/32.js';
import Popup32 from '@carbon/icons/es/popup/32.js';
import Query32 from '@carbon/icons/es/query/32.js';
import Grid32 from '@carbon/icons/es/grid/32.js';
import List32 from '@carbon/icons/es/list/32.js';
import { carbonArt, hoverIcon, toggleIcon, type Shapes } from '../../engine';
import {
  framePath,
  polyPath,
  rectPath,
  roundedRectPath,
  type Pt,
} from '../../geometry';
import { magnifierAt } from '../../magnifier';
import { ENTRANCE, EXIT, together } from '../../ease';
import { EVENODD, f, lerp } from '../../paint';

const CGrid = /* @__PURE__ */ carbonArt(Grid32);
const CList = /* @__PURE__ */ carbonArt(List32);

/**
 * View and layout switches on the frame engine: List, Grid, Table, Column,
 * Split, Table split, Compare, Fade, Popup and Query, plus the List ⇄ Grid
 * toggle. Every shape is Carbon's own outline at rest (Carbon draws these at
 * 32px only, except Fade, which has a 16px drawing). On hover the parts move
 * as geometry at a constant 2px line weight: nothing is scaled, stroked
 * thicker or masked. 160ms entrance ease in, 120ms exit out, unless noted.
 *
 *  - List: row by row, top to bottom, one frame (16ms) apart (as Arrange's
 *    and Menu's lines), each line reaches 1px right (the list icons' rule:
 *    List bulleted, List boxes) and its bullet grows 1px (2 → 3px square,
 *    0.5px a side) about its own centre.
 *  - Grid: each tile grows 1px a side in place (10 → 12px; the gaps 4 →
 *    2px).
 *  - Table: a pure horizontal widening (scaling reads poorly at 16px). The left and right walls move 1px out
 *    (TABLE_WIDEN); the top, the bottom and every rule hold their y, and the
 *    rules lengthen 1px at each end with the walls. Weight 2px throughout.
 *    Table add's base (marks/bases.ts, tableCalm) widens the same way.
 *  - Table split: its own hover: the frame grows 1px a side and
 *    every rule holds (the header's and the split's cross); the outer cells
 *    grow with it.
 *  - Column: the column box grows 1px on every side (8×24 → 10×26), and the
 *    rules either side step 1px out with it and lengthen 1px at each end,
 *    so the 4px gaps hold and they stay level with the box.
 *  - Split: the ring parts along its dashed line: each half moves 3px
 *    straight out, rigid, opening a 3px gap to the line on each side. The
 *    line's ends, where it ran through the ring, are whole 4px dashes, so it
 *    reads as one dashed line (4 on, 2 off, y 2–30), and it scrolls one
 *    period (6px) up over the hover, cut to y 2–30 as geometry, so it ends
 *    where it began: an offset.
 *  - Compare: the pages keep their size and move 1.5px toward each other,
 *    horizontally (3px closer in all; no growth). The right arrow moves 1.5px back, away from the
 *    middle: its tail runs on into the right page's outer wall, so its
 *    visible shaft drops from 3.59 to 0.59px, and its tip stays against the
 *    left page's wall. The left arrow doesn't contract: it rides
 *    with its page, rigid, so its shaft keeps its 3.59px and its tip its 2px
 *    gap to the page's right wall. (Held still instead, its tail would sink
 *    1.5px into the moving wall, shortening it.) 1.5px is the most that
 *    fits: the right page's opening (10px at rest) narrows by the full 3px
 *    of travel, and its arrowhead is 6.41px wide, so 2px each would drive
 *    the head into its own page's wall.
 *  - Fade: Incomplete's motion. The solid half ring grows 2px in radius
 *    (its flat ends hold on the centre line), and the dashes ride out 2px
 *    and turn one pitch (40°) clockwise as if a full dashed ring ran on
 *    behind the solid half: the top dash slides in behind it as a new one
 *    comes out at the bottom, ending on four whole, even dashes.
 *  - Popup: the front window grows 2px up and 2px right, out of the window
 *    behind it (its lower-left corner, the side that overlaps, holds), so
 *    the cut ends of the window behind keep their 2px gaps.
 *  - Query: Search's magnifier (utils/magnifier): the lens stays in place
 *    and grows 1px in diameter, its open ends holding their angles, and the
 *    handle turns 15° clockwise about the lens centre. The question mark
 *    holds.
 *
 * List ⇄ Grid (290ms both ways: both are views, neither is "off") keeps
 * Play ⇄ Pause's match cut: the outgoing view shrinks to 60% about the
 * icon centre (positions and lengths scale; every bar, dot and wall keeps
 * its 2px weight), then the incoming view appears at 60% and grows to full.
 * List → grid: the rows shrink out and slide 4px down,
 * bottom row first, 30ms apart (a visible stagger), 80ms each on the exit
 * ease; cut at 140ms; the tiles appear 6px above their places and drop in
 * as they grow, the bottom two first and the top two 30ms later, 120ms each
 * on the entrance ease. Grid → list plays it backwards.
 */

const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
const DEG = Math.PI / 180;
const C: Pt = [16, 16];
/** How far containers grow on hover (the set-wide rule). */
const GROW = 2;

// ── List ─────────────────────────────────────────────────────────────────────

const ROW_Y = [6, 15, 24]; // each row's top edge (lines and bullets are 2px tall)
const LINE_REACH = 1;
const BULLET_GROW = 0.5; // a side
/** List's hover: three rows together (no stagger; they went a frame apart). */
export const LIST_HOVER = /* @__PURE__ */ together();
/** Scales a point about the icon centre (the match cut), not the weight. */
const about = (v: number, s: number) => 16 + (v - 16) * s;
/** A part's place in the match cut: its scale about the icon centre and how far it has slid down. */
type Cut = { s: number; dy: number };
const WHOLE: Cut = { s: 1, dy: 0 };

/**
 * List at hover h (the rows' progress is taken from h). For
 * the match cut, `row(i)` shrinks each row to its scale about the icon
 * centre and slides it down: positions and line lengths scale; the lines
 * stay 2px tall and the bullets keep their size.
 */
function listShapes(h: number, row: (i: number) => Cut = () => WHOLE): Shapes {
  const out: Shapes = {};
  ROW_Y.forEach((y, i) => {
    const k = LIST_HOVER.at(h, i);
    const { s, dy } = row(i);
    const yc = about(y + 1, s) + dy;
    const b = 1 + BULLET_GROW * k;
    const [bx, x0, x1] = [
      about(5, s),
      about(10, s),
      about(28 + LINE_REACH * k, s),
    ];
    out[`bullet${i}`] = { d: rectPath(bx - b, yc - b, bx + b, yc + b) };
    out[`line${i}`] = { d: rectPath(x0, yc - 1, x1, yc + 1) };
  });
  return out;
}

export const ListSpec = /* @__PURE__ */ hoverIcon('List', {
  hover: LIST_HOVER.hover,
  geo: ({ h }) => listShapes(h),
  static: /* @__PURE__ */ carbonArt(List32),
});

// ── Grid ─────────────────────────────────────────────────────────────────────

const TILES: Pt[] = [
  [9, 9],
  [23, 9],
  [9, 23],
  [23, 23],
]; // centres; tiles are 10px with 2px walls
const TILE_GROW = 0.5; // a side, in place (gaps 4 → 3)

/** Grid at hover h; `tile(i)` shrinks a tile for the match cut and slides it (walls hold 2px). */
function gridShapes(h: number, tile: (i: number) => Cut = () => WHOLE): Shapes {
  const out: Shapes = {};
  TILES.forEach(([cx, cy], i) => {
    const { s, dy } = tile(i);
    const [x, y] = [about(cx, s), about(cy, s) + dy];
    const r = (5 + TILE_GROW * h) * s;
    out[`tile${i}`] = { d: framePath(x - r, y - r, x + r, y + r), ...EVENODD };
  });
  return out;
}

export const GridSpec = /* @__PURE__ */ hoverIcon('Grid', {
  geo: ({ h }) => gridShapes(h),
  static: /* @__PURE__ */ carbonArt(Grid32),
});

// ── List ⇄ Grid ──────────────────────────────────────────────────────────────

// The timeline, in ms (p runs linear over it). Out: each row shrinks to 60%
// about the icon centre and slides 4px down on the exit ease, 80ms each,
// bottom row first, 30ms apart (an apparent stagger).
// Cut at 140ms. In: the tiles appear at 60%, 6px above their places, and
// grow and drop into place on the entrance ease, 120ms each, the bottom two
// first, the top two 30ms later. 290ms in all.
const CUT_SCALE = 0.6;
const ROW_DROP = 4;
const TILE_DROP = 6;
const [OUT_MS, IN_MS, GAP_MS] = [80, 120, 30];
const CUT_MS = OUT_MS + 2 * GAP_MS;
export const LIST_GRID_MS = CUT_MS + GAP_MS + IN_MS;
/** Where the cut falls in p. */
export const LIST_GRID_CUT = CUT_MS / LIST_GRID_MS;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** Row i on its way out (row 2, the bottom, goes first). */
const rowOut = (t: number, i: number): Cut => {
  const q = EXIT(clamp01((t - (2 - i) * GAP_MS) / OUT_MS));
  return { s: lerp(1, CUT_SCALE, q), dy: ROW_DROP * q };
};
/** Tile i on its way in (tiles 2 and 3, the bottom two, first). */
const tileIn = (t: number, i: number): Cut => {
  const q = ENTRANCE(clamp01((t - CUT_MS - (i < 2 ? GAP_MS : 0)) / IN_MS));
  return { s: lerp(CUT_SCALE, 1, q), dy: -TILE_DROP * (1 - q) };
};
const blank = (shapes: Shapes): Shapes =>
  Object.fromEntries(
    Object.entries(shapes).map(([k, a]) => [k, { ...a, d: '' }])
  );

/**
 * List ⇄ Grid geometry. `list` is List's own hover number (its rows run on
 * a staggered timing); outside the engine it defaults to `h`.
 */
export function listGridShapes({
  h,
  p,
  list,
}: {
  h: number;
  p: number;
  list?: number;
}): Shapes {
  const t = p * LIST_GRID_MS;
  const showGrid = t > CUT_MS;
  const l = listShapes(list ?? h, (i) => rowOut(t, i));
  const g = gridShapes(h, (i) => tileIn(t, i));
  return { ...(showGrid ? blank(l) : l), ...(showGrid ? g : blank(g)) };
}

/** List ⇄ Grid. `toggled` shows Grid. */
export const ListToggleSpec = /* @__PURE__ */ toggleIcon<'list' | 'grid'>(
  'ListToggle',
  {
    states: ['list', 'grid'],
    statics: [CList, CGrid],
    geo: ({ h, p, list }) => listGridShapes({ h, p, list }),
    // List's rows hover on their own staggered timing; Grid's tiles on the standard one (h).
    hovers: { list: { hover: LIST_HOVER.hover } },
    // Linear progress: each part applies its own ease on its slice. 290ms both ways.
    change: (on, _f, tween) =>
      tween('p', on ? 1 : 0, {
        duration: LIST_GRID_MS / 1000,
        ease: [0, 0, 1, 1],
      }),
  }
);

// ── Table ────────────────────────────────────────────────────────────────────

/** A 2px-walled table frame, x0–x1 × y0–y1 (outer corners r2), with its cells' insides as holes. */
const tableFrame = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  cells: string
) => ({ d: roundedRectPath(x0, y0, x1, y1) + cells, ...EVENODD });
/** Table split and Column grow 1px a side (2px reads as too much). */
const TABLE_GROW = 1;
/** How far Table's side walls move out on hover, each (it widens, it doesn't scale). */
export const TABLE_WIDEN = 1;

export const TableSpec = /* @__PURE__ */ hoverIcon('Table', {
  geo: ({ h }) => {
    const w = TABLE_WIDEN * h;
    const [x0, x1] = [3 - w, 29 + w];
    const [l, r] = [x0 + 2, x1 - 2];
    // Only the side walls move: the top, the bottom and the rules (y 9, 15, 21) hold, and the rules lengthen with the walls.
    const cells =
      rectPath(l, 5, r, 9) +
      rectPath(l, 11, r, 15) +
      rectPath(l, 17, r, 21) +
      rectPath(l, 23, r, 27);
    return { table: tableFrame(x0, 3, x1, 29, cells) };
  },
  static: /* @__PURE__ */ carbonArt(Table32),
});

// ── Table split ──────────────────────────────────────────────────────────────

export const TableSplitSpec = /* @__PURE__ */ hoverIcon('TableSplit', {
  geo: ({ h }) => {
    const g = TABLE_GROW * h;
    const [lo, hi] = [3 - g, 29 + g];
    const [l, r, t, b] = [lo + 2, hi - 2, lo + 2, hi - 2]; // the inside
    // Every rule holds (the header's at y 9, the cross at y 18 and x 15); the outer cells grow with the edges.
    const cells =
      rectPath(l, t, r, 9) +
      rectPath(l, 11, 15, 18) +
      rectPath(17, 11, r, 18) +
      rectPath(l, 20, 15, b) +
      rectPath(17, 20, r, b);
    return { table: tableFrame(lo, lo, hi, hi, cells) };
  },
  static: /* @__PURE__ */ carbonArt(TableSplit32),
});

// ── Column ───────────────────────────────────────────────────────────────────

export const ColumnSpec = /* @__PURE__ */ hoverIcon('Column', {
  geo: ({ h }) => {
    const g = TABLE_GROW * h;
    const [y0, y1] = [4 - g, 28 + g];
    return {
      column: { d: framePath(12 - g, y0, 20 + g, y1), ...EVENODD },
      rules: {
        d: rectPath(6 - g, y0, 8 - g, y1) + rectPath(24 + g, y0, 26 + g, y1),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Column32),
});

// ── Split ────────────────────────────────────────────────────────────────────

// Carbon's split: a ring (r 10–12 about the centre) with a 2px dashed line
// down x 15–17 through it. Where the line runs through the ring, its ends
// (y 2–6 and 26–30: the stub and the wall under it) are whole 4px dashes,
// like the three inside, so the line is dashes 4 on, 2 off from 2 to 30.
// The halves are the ring cut at the line's edges (x 15 and 17).
const SPLIT_PART = 3;
const SPLIT_PERIOD = 6; // a dash and its gap
/** The dashed line scrolled `up` px, cut to y 2–30 (a piece under 0.3px at an end is dropped). */
function splitLine(up: number): string {
  let d = '';
  for (let k = 0; k <= 5; k++) {
    const [y0, y1] = [
      Math.max(2, 2 + SPLIT_PERIOD * k - up),
      Math.min(30, 6 + SPLIT_PERIOD * k - up),
    ];
    if (y1 - y0 >= 0.3) {
      d += rectPath(15, y0, 17, y1);
    }
  }
  return d;
}
/** The ring's half on side `dir` (−1 left, 1 right), cut at x = 16 ± 1, moved `dx` out. */
function ringHalf(dir: -1 | 1, dx: number): string {
  const [R, r] = [12, 10];
  const x = 16 + dir + dir * dx;
  const [yo, yi] = [Math.sqrt(R * R - 1), Math.sqrt(r * r - 1)];
  const sweep = dir < 0 ? 0 : 1; // top → bottom, round the outside
  return `M${P([x, 16 - yo])}A${R} ${R} 0 0 ${sweep} ${P([x, 16 + yo])}L${P([x, 16 + yi])}A${r} ${r} 0 0 ${1 - sweep} ${P([x, 16 - yi])}Z`;
}
export const SplitSpec = /* @__PURE__ */ hoverIcon('Split', {
  geo: ({ h }) => ({
    left: { d: ringHalf(-1, SPLIT_PART * h) },
    right: { d: ringHalf(1, SPLIT_PART * h) },
    line: { d: splitLine(SPLIT_PERIOD * h) },
  }),
  static: /* @__PURE__ */ carbonArt(Split32),
});

// ── Compare ──────────────────────────────────────────────────────────────────

// Carbon's compare, rebuilt from its points: the left page (2–18 × 2–26) in
// front of the right page (14–30 × 6–30), 2px walls; each arrow's tail is
// in its page's outer wall, and its head sits by the left page's right wall
// (the left head 2px short of it, the right head's tip against it). On
// hover both pages move toward each other (`d`, horizontally); the right
// arrow moves back (`a`, away from the middle), its tail running on into the
// wall so its shaft shortens, and the left arrow rides with its page. (`g`, each page growing away from the
// other, is 0.)
const L_HEAD: Pt[] = [
  [10.17, 15],
  [7.59, 17.59],
  [9, 19],
  [14, 14],
  [9, 9],
  [7.59, 10.41],
  [10.17, 13],
];
const R_HEAD: Pt[] = [
  [21.83, 17],
  [24.41, 14.41],
  [23, 13],
  [18, 18],
  [23, 23],
  [24.41, 21.59],
  [21.83, 19],
];
const COMPARE_PUSH = 1.5; // the most the right arrowhead allows (see the doc above)
function compare(g: number, d: number, a: number): string {
  const [lx0, ly0, lx1] = [2 - g + d, 2 - g, 18 + d]; // the left page; its bottom holds at 26
  const [rx0, rx1, ry1] = [14 - d, 30 + g - d, 30 + g]; // the right page; its top holds at 6
  const head = (pts: Pt[], dx: number) =>
    pts.map(([x, y]) => `L${P([x + dx, y])}`).join('');
  const outer =
    `M${P([rx1 - 2, 6])}H${f(lx1)}V${f(ly0 + 2)}A2 2 0 0 0 ${P([lx1 - 2, ly0])}H${f(lx0 + 2)}A2 2 0 0 0 ${P([lx0, ly0 + 2])}` +
    `V24A2 2 0 0 0 ${P([lx0 + 2, 26])}H${f(rx0)}V${f(ry1 - 2)}A2 2 0 0 0 ${P([rx0 + 2, ry1])}H${f(rx1 - 2)}A2 2 0 0 0 ${P([rx1, ry1 - 2])}V8A2 2 0 0 0 ${P([rx1 - 2, 6])}Z`;
  const left = `M${P([lx0 + 2, 15])}${head(L_HEAD, d)}L${P([lx0 + 2, 13])}V${f(ly0 + 2)}H${f(lx1 - 2)}V24H${f(lx0 + 2)}Z`;
  const right = `M${P([rx0 + 2, ry1 - 2])}V26H${f(lx1 - 2)}A2 2 0 0 0 ${P([lx1, 24])}V8H${f(rx1 - 2)}V17${head(R_HEAD, a)}L${P([rx1 - 2, 19])}V${f(ry1 - 2)}Z`;
  return outer + left + right;
}
export const CompareSpec = /* @__PURE__ */ hoverIcon('Compare', {
  geo: ({ h }) => ({
    pages: { d: compare(0, COMPARE_PUSH * h, COMPARE_PUSH * h) },
  }),
  static: /* @__PURE__ */ carbonArt(Compare32),
});

// ── Fade ─────────────────────────────────────────────────────────────────────

// Carbon's fade: the right half of a ring (r 12–14) and four dashes on the
// left half, on the same band: 20° on, 20° off, from 110° to 250°
// (clockwise from 3 o'clock). Hover (Incomplete's): the band rides out
// 2px, and the dashes turn one 40° pitch clockwise as if a full ring of
// dashes ran on behind the solid half, each cut where it meets the half's
// flat ends (±90°): the one waiting behind (70–90°) comes out at the bottom.
// Carbon's dashes, as measured from its corners (within 0.3° of the 20/40
// pattern); the slots before and after them are on the pattern, wholly
// behind the solid half. Each dash runs on to the next slot, so the hover
// lands on Carbon's own four dashes, one slot round.
const FADE_SLOTS: [number, number][] = [
  [70, 90],
  [110.19, 130.24],
  [150.03, 170.25],
  [189.95, 209.97],
  [229.76, 249.61],
  [270, 290],
];
/** A dash on the band r0–r1 from angle a0 to a1 (radial ends), cut to the left half; '' if none is left. */
function fadeDash(r0: number, r1: number, a0: number, a1: number): string {
  const [lo, hi] = [Math.max(a0, 90), Math.min(a1, 270)];
  if (hi - lo < 1e-6) {
    return '';
  }
  const at = (r: number, a: number) =>
    P([C[0] + r * Math.cos(a * DEG), C[1] + r * Math.sin(a * DEG)]);
  return `M${at(r1, lo)}A${f(r1)} ${f(r1)} 0 0 1 ${at(r1, hi)}L${at(r0, hi)}A${f(r0)} ${f(r0)} 0 0 0 ${at(r0, lo)}Z`;
}
export const FadeSpec = /* @__PURE__ */ hoverIcon('Fade', {
  geo: ({ h }) => {
    const g = GROW * h;
    const [r0, r1] = [12 + g, 14 + g];
    return {
      half: {
        d: `M16 ${f(16 - r1)}A${f(r1)} ${f(r1)} 0 0 1 16 ${f(16 + r1)}V${f(16 + r0)}A${f(r0)} ${f(r0)} 0 0 0 16 ${f(16 - r0)}Z`,
      },
      dashes: {
        d: FADE_SLOTS.slice(0, -1)
          .map(([a0, a1], i) =>
            fadeDash(
              r0,
              r1,
              lerp(a0, FADE_SLOTS[i + 1][0], h),
              lerp(a1, FADE_SLOTS[i + 1][1], h)
            )
          )
          .join(''),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Fade16, Fade32),
});

// ── Popup ────────────────────────────────────────────────────────────────────

// Carbon's popup: the front window (8–30 × 4–22, 2px walls) and the window
// behind it, cut 2px short of the front one (its top edge to x 6, its right
// edge from y 24).
const POPUP_BACK =
  'M18,26H4V16H6V14H4a2.0059,2.0059,0,0,0-2,2V26a2.0059,2.0059,0,0,0,2,2H18a2.0059,2.0059,0,0,0,2-2V24H18Z';
export const PopupSpec = /* @__PURE__ */ hoverIcon('Popup', {
  geo: ({ h }) => {
    const g = GROW * h;
    return {
      front: { d: framePath(8, 4 - g, 30 + g, 22), ...EVENODD },
      back: { d: POPUP_BACK },
    };
  },
  static: /* @__PURE__ */ carbonArt(Popup32),
});

// ── Query ────────────────────────────────────────────────────────────────────

// Carbon's query: a lens (r 9–11 about (14, 14)) open at the top left from
// 180° round to −57.4°, where the question mark sits, and a 2px handle
// along 45° to (29.29, 29.29). The lens's top end is cut along Carbon's
// line (not quite radial): its outer and inner corners' angles are kept.
const Q_C: Pt = [14, 14];
const Q_ENDS = {
  outer: Math.atan2(4.7446 - 14, 19.9211 - 14) / DEG,
  inner: Math.atan2(6.4746 - 14, 18.9221 - 14) / DEG,
};
const Q_MARK =
  'M12,12H10V8h2a2,2,0,0,0,0-4H10A2.0023,2.0023,0,0,0,8,6v.5H6V6a4.0045,4.0045,0,0,1,4-4h2a4,4,0,0,1,0,8Z';
const Q_HANDLE: [number, number] = [10, 15.2929 * Math.SQRT2];
/** A 2px band from a to b (square ends). */
function band(a: Pt, b: Pt): string {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(dx, dy);
  const [nx, ny] = [-dy / l, dx / l];
  return polyPath(
    [
      [a[0] + nx, a[1] + ny],
      [b[0] + nx, b[1] + ny],
      [b[0] - nx, b[1] - ny],
      [a[0] - nx, a[1] - ny],
    ],
    true
  );
}
export const QuerySpec = /* @__PURE__ */ hoverIcon('Query', {
  geo: ({ h }) => {
    const m = magnifierAt({ c: Q_C, r: 10, w: 2, handle: Q_HANDLE }, h);
    const [ro, ri] = [m.r + 1, m.r - 1];
    const at = (r: number, a: number) =>
      P([Q_C[0] + r * Math.cos(a * DEG), Q_C[1] + r * Math.sin(a * DEG)]);
    // Clockwise from the top end round to 9 o'clock (237°: the large arc), back inside.
    const lens = `M${at(ro, Q_ENDS.outer)}A${f(ro)} ${f(ro)} 0 1 1 ${at(ro, 180)}L${at(ri, 180)}A${f(ri)} ${f(ri)} 0 1 0 ${at(ri, Q_ENDS.inner)}Z`;
    return {
      lens: { d: lens },
      handle: { d: band(m.a, m.b) },
      mark: { d: Q_MARK },
      dot: { tag: 'circle', cx: 11, cy: 15.5, r: 1.5 },
    };
  },
  static: /* @__PURE__ */ carbonArt(Query32),
});
