/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ChartBar32 from '@carbon/icons/es/chart--bar/32.js';
import ChartBarFloating32 from '@carbon/icons/es/chart--bar-floating/32.js';
import ChartBarStacked32 from '@carbon/icons/es/chart--bar-stacked/32.js';
import ChartBarTarget32 from '@carbon/icons/es/chart--bar-target/32.js';
import ChartBullet32 from '@carbon/icons/es/chart--bullet/32.js';
import ChartClusterBar32 from '@carbon/icons/es/chart--cluster-bar/32.js';
import ChartColumnFloating32 from '@carbon/icons/es/chart--column-floating/32.js';
import ChartColumnTarget32 from '@carbon/icons/es/chart--column-target/32.js';
import ChartStacked32 from '@carbon/icons/es/chart--stacked/32.js';
import ChartErrorBar32 from '@carbon/icons/es/chart--error-bar/32.js';
import ChartLollipop32 from '@carbon/icons/es/chart--lollipop/32.js';
import ChartWaterfall32 from '@carbon/icons/es/chart--waterfall/32.js';
import ChartBubble32 from '@carbon/icons/es/chart--bubble/32.js';
import ChartScatter32 from '@carbon/icons/es/chart--scatter/32.js';
import ChartVennDiagram32 from '@carbon/icons/es/chart--venn-diagram/32.js';
import ChartPie32 from '@carbon/icons/es/chart--pie/32.js';
import ChartDonut32 from '@carbon/icons/es/chart--donut/32.js';
import ChartRing32 from '@carbon/icons/es/chart--ring/32.js';
import ChartTreemap32 from '@carbon/icons/es/chart--treemap/32.js';
import DoubleAxisChartBar32 from '@carbon/icons/es/double-axis-chart--bar/32.js';
import DoubleAxisChartColumn32 from '@carbon/icons/es/double-axis-chart--column/32.js';
import Report32 from '@carbon/icons/es/report/32.js';
import ReportChart32 from '@carbon/icons/es/report--chart/32.js';
import ReportData32 from '@carbon/icons/es/report--data/32.js';
import ChartCustom32 from '@carbon/icons/es/chart--custom/32.js';
import ReportGrowth32 from '@carbon/icons/es/report--growth/32.js';
import {
  filletPath,
  framePath,
  polyPath,
  rectPath,
  ringPath,
  type Pt,
} from '../../geometry';
import { hoverIcon, type Shapes, carbonArt, withStatic } from '../../engine';
import { CHART_AXIS, CUSTOM_PENCIL_REACH, customPencil } from './chartAxis';
import { EVENODD, f, lerp, MITER } from '../../paint';

/**
 * Carbon's bar, column, dot, ring and report charts (no reference animations). Hover is a data update, as in
 * ChartColumn and ChartLine: the marks take new values, the axes
 * stay still, and everything moves together (no stagger).
 *
 * Outlined bars and columns are 2px centreline strokes with miter joins,
 * their open ends buried 1px in the axis, so a new value moves an edge and
 * never scales a stroke. Solid pieces are rects; rings are `ringPath`;
 * pie/donut dividers are radial bars that sweep round the centre.
 */

const BUTT = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 } as const;
const axis = { d: CHART_AXIS };

/** A horizontal outlined bar from the axis (x=3, under it) to `end`, between `y0` and `y1` (centrelines). */
const hBar = (y0: number, y1: number, end: number) =>
  polyPath([
    [3, y0],
    [end, y0],
    [end, y1],
    [3, y1],
  ]);
/** A vertical outlined column from under the axis (y=29) up to `top`, between `x0` and `x1`. */
const vCol = (x0: number, x1: number, top: number) =>
  polyPath([
    [x0, 29],
    [x0, top],
    [x1, top],
    [x1, 29],
  ]);
/** A closed outlined rect (centreline). */
const box = (x0: number, y0: number, x1: number, y1: number) =>
  polyPath(
    [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ],
    true
  );
/** A disc of radius r, with an optional hole (even-odd). */
const disc = ([cx, cy]: Pt, r: number, hole = 0) => {
  const c = (rr: number) =>
    `M${cx - rr} ${cy}A${rr} ${rr} 0 1 0 ${cx + rr} ${cy}A${rr} ${rr} 0 1 0 ${cx - rr} ${cy}Z`;
  return c(r) + (hole > 0.01 ? c(hole) : '');
};
/** A 2px radial bar from radius r0 to r1 at `deg` (0 = right, 90 = down). */
function radial([cx, cy]: Pt, r0: number, r1: number, deg: number): string {
  const a = (deg * Math.PI) / 180;
  const [ux, uy, nx, ny] = [
    Math.cos(a),
    Math.sin(a),
    -Math.sin(a),
    Math.cos(a),
  ];
  const p = (r: number, s: number): Pt => [
    cx + ux * r + nx * s,
    cy + uy * r + ny * s,
  ];
  return polyPath([p(r0, -1), p(r1, -1), p(r1, 1), p(r0, 1)], true);
}
/* @__NO_SIDE_EFFECTS__ */
const hover = (name: string, geo: (h: number) => Shapes) =>
  hoverIcon(name, { geo: ({ h }) => geo(h) });

// ── Bars ─────────────────────────────────────────────────────────────────────

export const ChartBarSpec = /* @__PURE__ */ withStatic(
  hover('ChartBar', (h) => ({
    axis,
    a: { d: hBar(6, 12, lerp(17, 23, h)), ...MITER },
    b: { d: hBar(18, 24, lerp(25, 19, h)), ...MITER },
  })),
  /* @__PURE__ */ carbonArt(ChartBar32)
);

// Floating: the lower bar slides left until it starts where the upper one
// does, and the upper bar slides right until its end is flush with the
// end of the x-axis.
export const ChartBarFloatingSpec = /* @__PURE__ */ withStatic(
  hover('ChartBarFloating', (h) => ({
    axis,
    a: { d: box(15 - 6 * h, 17, 27 - 6 * h, 23), ...MITER },
    b: { d: box(9 + 4 * h, 5, 25 + 4 * h, 11), ...MITER },
  })),
  /* @__PURE__ */ carbonArt(ChartBarFloating32)
);

// Stacked: the solid segment fills the bar's inside (1px into its walls)
// from the axis to the segment boundary. On hover the shorter bar grows
// 6px and fills completely; the longer bar shrinks 6px and its fill 2px.
export const ChartBarStackedSpec = /* @__PURE__ */ withStatic(
  hover('ChartBarStacked', (h) => {
    const end = lerp(17, 23, h);
    return {
      axis,
      a: { d: hBar(6, 12, end), ...MITER },
      b: { d: hBar(18, 24, lerp(25, 19, h)), ...MITER },
      aFill: { d: rectPath(3, 6, lerp(10, end, h), 12) },
      bFill: { d: rectPath(3, 18, lerp(14, 12, h), 24) },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartBarStacked32)
);

// Target: the bars trade lengths and each target line rides with its bar
// (2px clear of the bar's end).
export const ChartBarTargetSpec = /* @__PURE__ */ withStatic(
  hover('ChartBarTarget', (h) => {
    const [ea, eb] = [lerp(17, 25, h), lerp(25, 17, h)];
    return {
      axis,
      a: { d: hBar(6, 12, ea), ...MITER },
      b: { d: hBar(18, 24, eb), ...MITER },
      ta: { d: rectPath(ea + 3, 5, ea + 5, 13) },
      tb: { d: rectPath(eb + 3, 17, eb + 5, 25) },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartBarTarget32)
);

// Bullet: three ranges (outlined rows) whose measure ticks take new values.
const BULLET = [
  { y0: 4, y1: 10, t: 8, to: 14 },
  { y0: 13, y1: 19, t: 22, to: 16 },
  { y0: 22, y1: 28, t: 14, to: 20 },
];
export const ChartBulletSpec = /* @__PURE__ */ withStatic(
  hover('ChartBullet', (h) => {
    const s: Shapes = {};
    BULLET.forEach(({ y0, y1, t, to }, i) => {
      s[`row${i}`] = { d: box(3, y0 + 1, 29, y1 - 1), ...MITER };
      const x = lerp(t, to, h);
      s[`tick${i}`] = { d: rectPath(x, y0 - 1, x + 2, y1 + 1) };
    });
    return s;
  }),
  /* @__PURE__ */ carbonArt(ChartBullet32)
);

// ── Columns ──────────────────────────────────────────────────────────────────

const CLUSTER: Array<[number, number, number]> = [
  [7, 22, 18],
  [10, 16, 20],
  [15, 12, 16],
  [18, 18, 12],
  [23, 14, 10],
  [26, 8, 14],
];
export const ChartClusterBarSpec = /* @__PURE__ */ withStatic(
  hover('ChartClusterBar', (h) => {
    const s: Shapes = { axis };
    CLUSTER.forEach(([x, top, to], i) => {
      s[`bar${i}`] = { d: rectPath(x, lerp(top, to, h), x + 2, 26) };
    });
    return s;
  }),
  /* @__PURE__ */ carbonArt(ChartClusterBar32)
);

// Floating: the higher column drops until its base lines up with the
// other's, and the other rises until its top is flush with the y-axis.
export const ChartColumnFloatingSpec = /* @__PURE__ */ withStatic(
  hover('ChartColumnFloating', (h) => ({
    axis,
    a: { d: box(21, 5 + 2 * h, 27, 21 + 2 * h), ...MITER },
    b: { d: box(9, 11 - 8 * h, 15, 23 - 8 * h), ...MITER },
  })),
  /* @__PURE__ */ carbonArt(ChartColumnFloating32)
);

// As ChartBarTarget: the columns trade heights and their targets ride along.
export const ChartColumnTargetSpec = /* @__PURE__ */ withStatic(
  hover('ChartColumnTarget', (h) => {
    const [ta, tb] = [lerp(15, 7, h), lerp(7, 15, h)];
    return {
      axis,
      a: { d: vCol(8, 14, ta), ...MITER },
      b: { d: vCol(20, 26, tb), ...MITER },
      ta: { d: rectPath(7, ta - 5, 15, ta - 3) },
      tb: { d: rectPath(19, tb - 5, 27, tb - 3) },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartColumnTarget32)
);

// As ChartBarStacked: the shorter column grows 6px and fills completely;
// the taller one shrinks 6px and its fill 2px.
export const ChartStackedSpec = /* @__PURE__ */ withStatic(
  hover('ChartStacked', (h) => {
    const top = lerp(15, 9, h);
    return {
      axis,
      a: { d: vCol(9, 15, top), ...MITER },
      b: { d: vCol(21, 27, lerp(7, 13, h)), ...MITER },
      aFill: { d: rectPath(9, lerp(22, top, h), 15, 29) },
      bFill: { d: rectPath(21, lerp(18, 20, h), 27, 29) },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartStacked32)
);

// Error bar: the column rises 2px and the error bar (the "I") rides with
// it, shrinking 2px (1px at each end).
export const ChartErrorBarSpec = /* @__PURE__ */ withStatic(
  hover('ChartErrorBar', (h) => {
    const dy = -2 * h;
    const [top, low] = [6 + dy + h, 18 + dy - h];
    return {
      axis,
      col: { d: vCol(13, 21, 13 + dy), ...MITER },
      cap: { d: rectPath(14, top, 20, top + 2) },
      stem: { d: rectPath(16, top + 1, 18, low + 1) },
      low: { d: rectPath(14, low, 20, low + 2) },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartErrorBar32)
);

// Lollipops: each head (a ring) and its stick take a new value together.
// Left rises 4px, middle rises 2px, right drops 2px.
const LOLLIPOPS: Array<[number, number, number]> = [
  [10, 18, 14],
  [17, 7, 5],
  [24, 15, 17],
];
export const ChartLollipopSpec = /* @__PURE__ */ withStatic(
  hover('ChartLollipop', (h) => {
    const s: Shapes = { axis };
    LOLLIPOPS.forEach(([x, y, to], i) => {
      const cy = lerp(y, to, h);
      s[`stick${i}`] = { d: rectPath(x - 1, cy + 2, x + 1, 29) };
      s[`head${i}`] = { d: ringPath([x, cy], 3, 2) };
    });
    return s;
  }),
  /* @__PURE__ */ carbonArt(ChartLollipop32)
);

// The first, third and last bars lift clear of the axis (they become
// floating steps); the second drops to the axis.
const WATERFALL: Array<[number, number, number, number, number]> = [
  // x, top, bottom, hover top, hover bottom
  [8, 14, 29, 6, 21],
  [14, 4, 18, 17, 29],
  [20, 4, 29, 3, 25],
  [26, 18, 29, 6, 21],
];
export const ChartWaterfallSpec = /* @__PURE__ */ withStatic(
  hover('ChartWaterfall', (h) => {
    const s: Shapes = { axis };
    WATERFALL.forEach(([x, t, b, ht, hb], i) => {
      s[`bar${i}`] = { d: rectPath(x, lerp(t, ht, h), x + 2, lerp(b, hb, h)) };
    });
    return s;
  }),
  /* @__PURE__ */ carbonArt(ChartWaterfall32)
);

// ── Dots and rings ───────────────────────────────────────────────────────────

// The small bubbles grow 1px and rise 4px; the large top one shrinks 3px
// and rises 2px. (It can't grow: grown and risen, it would run into both
// small bubbles.)
const BUBBLES: Array<[Pt, number, number, number]> = [
  [[10, 18], 3, 4, 4],
  [[21, 10], 5, 2, 2],
  [[24.5, 22.5], 2.5, 3.5, 4],
];
export const ChartBubbleSpec = /* @__PURE__ */ withStatic(
  hover('ChartBubble', (h) => {
    const s: Shapes = { axis };
    BUBBLES.forEach(([[x, y], r, to, rise], i) => {
      s[`b${i}`] = { d: ringPath([x, y - rise * h], lerp(r, to, h), 2) };
    });
    return s;
  }),
  /* @__PURE__ */ carbonArt(ChartBubble32)
);

// Dots move only up or down (new values, same categories).
const SCATTER: Array<[Pt, Pt]> = [
  [
    [10, 22],
    [10, 16],
  ],
  [
    [14, 15],
    [14, 21],
  ],
  [
    [22, 15],
    [22, 9],
  ],
  [
    [26, 6],
    [26, 16],
  ],
  [
    [14, 8],
    [14, 6],
  ],
];
export const ChartScatterSpec = /* @__PURE__ */ withStatic(
  hover('ChartScatter', (h) => {
    const s: Shapes = { axis };
    SCATTER.forEach(([a, b], i) => {
      s[`d${i}`] = { d: disc([lerp(a[0], b[0], h), lerp(a[1], b[1], h)], 2) };
    });
    return s;
  }),
  /* @__PURE__ */ carbonArt(ChartScatter32)
);

// Venn diagram: the rings (r 9, 2px walls, centres 8 apart) slide
// through each other and swap sides, ending VENN_APART apart (6): 4px between
// their crossing walls, 2 device px at 16px, so they read as two circles.
/** How far apart the swapped rings' centres end (they rest 8 apart). */
export const VENN_APART = 6;
/** How far each ring travels: half the rest separation plus half the end one. */
export const VENN_TRAVEL = (8 + VENN_APART) / 2;
export const ChartVennDiagramSpec = /* @__PURE__ */ withStatic(
  hover('ChartVennDiagram', (h) => ({
    a: { d: ringPath([12 + VENN_TRAVEL * h, 16], 9, 2) },
    b: { d: ringPath([20 - VENN_TRAVEL * h, 16], 9, 2) },
  })),
  /* @__PURE__ */ carbonArt(ChartVennDiagram32)
);

// Pie: the slice's lower edge sweeps 30° further round (the slice grows),
// and, as ChartRing's, the circle grows 1px in radius: the outer edge and
// Carbon's inner edge both move 1px out (the wall holds 2px) and the
// divider reaches out with them.
const PIE_C: Pt = [16, 16];
const pieL = (c: Pt, rEnd: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return filletPath(
    [
      [c[0], c[1] - rEnd],
      c,
      [c[0] + rEnd * Math.cos(a), c[1] + rEnd * Math.sin(a)],
    ],
    1
  );
};
// Carbon's pie ring isn't quite concentric: its inner arcs (r=10) have
// slightly different centres. Its own inner edge is used verbatim at rest
// (pushed out about the centre as the ring grows); the short straight
// joins sit under the divider.
function pieRing(g: number): string {
  const k = (10 + g) / 10;
  const q = (x: number, y: number) =>
    `${f(16 + (x - 16) * k)} ${f(16 + (y - 16) * k)}`;
  const [R, r] = [f(12 + g), f(10 * k)];
  return (
    `M16 ${f(16 - 12 - g)}A${R} ${R} 0 1 0 ${f(28 + g)} 16A${R} ${R} 0 0 0 16 ${f(4 - g)}Z` +
    `M${q(15.42, 26)}A${r} ${r} 0 0 1 ${q(15, 6.05)}L${q(17, 6.05)}A${r} ${r} 0 0 1 ${q(26, 15)}L${q(26, 17)}A${r} ${r} 0 0 1 ${q(15.42, 26)}Z`
  );
}
export const ChartPieSpec = /* @__PURE__ */ withStatic(
  hover('ChartPie', (h) => ({
    ring: { d: pieRing(h), ...EVENODD },
    divider: { d: pieL(PIE_C, 11.5 + h, 30 * h), ...BUTT },
  })),
  /* @__PURE__ */ carbonArt(ChartPie32)
);

// Donut and ring charts: one divider sweeps 30°, re-sizing its segments.
const DONUT_C: Pt = [16, 16.0194];
// Donut: the top divider turns 45° clockwise and the lower-left one 45°
// anticlockwise; the outer ring grows 1px in radius and the dividers reach
// out with it.
export const ChartDonutSpec = /* @__PURE__ */ withStatic(
  hover('ChartDonut', (h) => {
    const r = 11 + h;
    return {
      outer: { d: ringPath(DONUT_C, r, 2) },
      inner: { d: ringPath(DONUT_C, 6, 2) },
      d0: { d: radial(DONUT_C, 6, r, -90 + 45 * h) },
      d1: { d: radial(DONUT_C, 6, r, 135 - 45 * h) },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartDonut32)
);

const RING_C: Pt = [16, 16];
// Ring: the top-left divider turns to north, the right one 10° and the
// bottom one 15° clockwise.
// The outer ring grows 1px in radius and the dividers reach out with it.
export const ChartRingSpec = /* @__PURE__ */ withStatic(
  hover('ChartRing', (h) => {
    const r = 13 + h;
    return {
      outer: { d: ringPath(RING_C, r, 2) },
      inner: { d: ringPath(RING_C, 5, 2) },
      d0: { d: radial(RING_C, 5, r, 10 * h) },
      d1: { d: radial(RING_C, 5, r, 90 + 15 * h) },
      d2: { d: radial(RING_C, 5, r, -135 + 45 * h) },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartRing32)
);

// Treemap: the dividers shift and the cells re-proportion; each divider
// stays attached to the one it meets.
export const ChartTreemapSpec = /* @__PURE__ */ withStatic(
  hover('ChartTreemap', (h) => {
    const v1 = lerp(14, 12, h);
    const h1 = lerp(20, 14, h); // finishes 6px higher
    const h2 = lerp(14, 19, h);
    const v2 = lerp(21, 20, h); // even spaces either side (14…20 | 22…28)
    return {
      frame: { d: framePath(2, 2, 30, 30) },
      v1: { d: rectPath(v1, 3, v1 + 2, 29) },
      h1: { d: rectPath(3, h1, v1 + 1, h1 + 2) },
      h2: { d: rectPath(v1 + 1, h2, 29, h2 + 2) },
      v2: { d: rectPath(v2, 3, v2 + 2, h2 + 1) },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartTreemap32)
);

// ── Double-axis charts ───────────────────────────────────────────────────────

const AXIS_C = 'M30,4V2H4A2,2,0,0,0,2,4V28a2,2,0,0,0,2,2H30V28H4V4Z';
const AXIS_U = 'M28,2V28H4V2H2V28a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V2Z';

export const DoubleAxisChartBarSpec = /* @__PURE__ */ withStatic(
  hover('DoubleAxisChartBar', (h) => ({
    axis: { d: AXIS_C },
    a: { d: hBar(8, 13, lerp(17, 23, h)), ...MITER },
    b: { d: hBar(19, 24, lerp(25, 19, h)), ...MITER },
  })),
  /* @__PURE__ */ carbonArt(DoubleAxisChartBar32)
);

export const DoubleAxisChartColumnSpec = /* @__PURE__ */ withStatic(
  hover('DoubleAxisChartColumn', (h) => ({
    axis: { d: AXIS_U },
    a: { d: vCol(8, 13, lerp(15, 9, h)), ...MITER },
    b: { d: vCol(19, 24, lerp(7, 13, h)), ...MITER },
  })),
  /* @__PURE__ */ carbonArt(DoubleAxisChartColumn32)
);

// ── Reports ──────────────────────────────────────────────────────────────────

const CLIPBOARD =
  'M25,5H22V4a2,2,0,0,0-2-2H12a2,2,0,0,0-2,2V5H7A2,2,0,0,0,5,7V28a2,2,0,0,0,2,2H25a2,2,0,0,0,2-2V7A2,2,0,0,0,25,5ZM12,4h8V8H12ZM25,28H7V7h3v3H22V7h3Z';
const clipboard = { d: CLIPBOARD };

export const ReportSpec = /* @__PURE__ */ withStatic(
  hover('Report', (h) => ({
    clipboard,
    l0: { d: rectPath(10, 13, lerp(22, 17, h), 15) },
    l1: { d: rectPath(10, 18, lerp(18, 21, h), 20) },
    l2: { d: rectPath(10, 23, lerp(15, 19, h), 25) },
  })),
  /* @__PURE__ */ carbonArt(Report32)
);

const REPORT_PIE: Pt = [16, 19];
// The slice edge sweeps round until it points down-left (135°).
export const ReportChartSpec = /* @__PURE__ */ withStatic(
  hover('ReportChart', (h) => ({
    clipboard,
    ring: { d: ringPath(REPORT_PIE, 6, 2) },
    divider: { d: pieL(REPORT_PIE, 6.5, 135 * h), ...BUTT },
  })),
  /* @__PURE__ */ carbonArt(ReportChart32)
);

export const ReportDataSpec = /* @__PURE__ */ withStatic(
  hover('ReportData', (h) => ({
    clipboard,
    b0: { d: rectPath(10, lerp(14, 18, h), 12, 24) },
    b1: { d: rectPath(15, lerp(20, 15, h), 17, 24) },
    b2: { d: rectPath(20, lerp(18, 20, h), 22, 24) },
  })),
  /* @__PURE__ */ carbonArt(ReportData32)
);

// Chart custom: a page of three solid bars (x 10, 14, 18; tops 8, 12, 14 on
// y 18) and the custom pencil. Report data's update (the nearest motion: a
// page of solid bars), its moves as they are: the left bar drops 4px, the
// middle rises 5, the right drops 2. The page holds; the pencil pushes 2px
// towards its tip (the edit marks' pencil) and the page's open bottom wall
// draws back as far, keeping its 4px to it.
export const ChartCustomSpec = /* @__PURE__ */ withStatic(
  hover('ChartCustom', (h) => {
    const k = CUSTOM_PENCIL_REACH * h;
    return {
      page: {
        d: `M${f(12 - k * Math.SQRT1_2)} 30H6A2 2 0 0 1 4 28V4A2 2 0 0 1 6 2H22A2 2 0 0 1 24 4V14H22V4H6V28H${f(12 - k * Math.SQRT1_2)}Z`,
      },
      b0: { d: rectPath(10, lerp(8, 12, h), 12, 18) },
      b1: { d: rectPath(14, lerp(12, 7, h), 16, 18) },
      b2: { d: rectPath(18, lerp(14, 16, h), 20, 18) },
      pencil: { d: customPencil(k) },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartCustom32)
);

// Growth: the arrowhead (a corner bracket) moves 2px up-right (an arrow on
// a glyph: the set-wide 2px reach) while the tail stays put, so
// the shaft lengthens (as shrink-screen's arrow does).
const NUDGE = 2 / Math.SQRT2;
export const ReportGrowthSpec = /* @__PURE__ */ withStatic(
  hover('ReportGrowth', (h) => {
    const n = NUDGE * h;
    return {
      clipboard,
      shaft: {
        d: polyPath([
          [12, 23],
          [19.5 + n, 15.5 - n],
        ]),
        ...BUTT,
      },
      head: {
        d: polyPath([
          [13 + n, 15 - n],
          [20 + n, 15 - n],
          [20 + n, 22 - n],
        ]),
        ...MITER,
      },
    };
  }),
  /* @__PURE__ */ carbonArt(ReportGrowth32)
);
