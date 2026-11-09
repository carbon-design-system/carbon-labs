/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ChartMultiLine32 from '@carbon/icons/es/chart--multi-line/32.js';
import ChartLineData32 from '@carbon/icons/es/chart--line--data/32.js';
import ChartLineSmooth32 from '@carbon/icons/es/chart--line-smooth/32.js';
import Analytics32 from '@carbon/icons/es/analytics/32.js';
import AnalyticsCustom32 from '@carbon/icons/es/analytics--custom/32.js';
import AnalyticsReference32 from '@carbon/icons/es/analytics--reference/32.js';
import ChartPerformance32 from '@carbon/icons/es/chart--performance/32.js';
import ChartCombo32 from '@carbon/icons/es/chart--combo/32.js';
import ChartDualYAxis32 from '@carbon/icons/es/chart--dual-y-axis/32.js';
import ChartHistogram32 from '@carbon/icons/es/chart--histogram/32.js';
import ChartArea32 from '@carbon/icons/es/chart--area/32.js';
import ChartAreaSmooth32 from '@carbon/icons/es/chart--area-smooth/32.js';
import ChartNetwork32 from '@carbon/icons/es/chart--network/32.js';
import ChartRadar32 from '@carbon/icons/es/chart--radar/32.js';
import {
  filletPath,
  polyPath,
  rectPath,
  ringPath,
  roundedRectPath,
  insetPoly,
  type Pt,
} from '../../geometry';
import { hoverIcon, type Shapes, carbonArt, withStatic } from '../../engine';
import { together } from '../../ease';
import {
  CHART_AXIS,
  CUSTOM_PENCIL_REACH,
  customPencil,
  referenceArrow,
} from './chartAxis';
import { f, lerp, LINE, MITER, ROUND } from '../../paint';

/**
 * Carbon's line, area, network and radar charts (no reference animations). As in charts.ts, hover is a data update:
 * the series take new values, the axes stay still, and everything moves
 * together.
 *
 * Every series is its 2px centreline, fitted to Carbon's outline so it
 * rasterises within 0.5% of the original. Bent lines are `filletPath` r=1
 * (Carbon's outer edge r=2 round a sharp inner corner) or round joins
 * where Carbon's outer edge is r=1. Smooth lines are cubic Béziers whose
 * control points ride with their end points. Starts are buried in the
 * axis; a new value keeps each bend turning the same way, so the rounded
 * corners morph cleanly.
 */

const lp = (a: Pt, b: Pt, t: number): Pt => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
];
const lpAll = (a: readonly Pt[], b: readonly Pt[], t: number): Pt[] =>
  a.map((p, i) => lp(p, b[i], t));
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
const axis = { d: CHART_AXIS };
/* @__NO_SIDE_EFFECTS__ */
const hover = (name: string, geo: (h: number) => Shapes) =>
  hoverIcon(name, { geo: ({ h }) => geo(h) });

const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
/** The vector of length d pointing from a towards b. */
function along(a: Pt, b: Pt, d: number): Pt {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [((b[0] - a[0]) * d) / l, ((b[1] - a[1]) * d) / l];
}
/** A solid 2px bar from x to x+2, from `top` down into the axis. */
const bar = (x: number, top: number) => rectPath(x, top, x + 2, 29);
/** A straight 2px segment from a to b, trimmed by d0 and d1 at its ends. */
function seg(a: Pt, b: Pt, d0 = 0, d1 = 0): string {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(dx, dy);
  const [ux, uy] = [dx / l, dy / l];
  return `M${P([a[0] + ux * d0, a[1] + uy * d0])}L${P([b[0] - ux * d1, b[1] - uy * d1])}`;
}
/**
 * Maps a rest control point onto a moved segment: each axis is scaled so the
 * segment's rest ends land on its new ends. Keeps tangents horizontal where
 * they were.
 */
function remap(c: Pt, a0: Pt, b0: Pt, a1: Pt, b1: Pt): Pt {
  const k = (i: 0 | 1) =>
    b0[i] === a0[i] ? 1 : (b1[i] - a1[i]) / (b0[i] - a0[i]);
  return [a1[0] + (c[0] - a0[0]) * k(0), a1[1] + (c[1] - a0[1]) * k(1)];
}
/**
 * Carbon's area charts end at a 2px wall, x 28–30, under the top series.
 * The wall's top follows the top series' upper edge (the last segment from
 * `a` to `b`, offset 1px), so it meets the line flush as the line moves.
 */
function wall(a: Pt, b: Pt): string {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(dx, dy);
  const [ox, oy] = [a[0] + dy / l, a[1] - dx / l];
  const y = (x: number) => oy + ((x - ox) * dy) / dx;
  return polyPath(
    [
      [28, y(28)],
      [30, y(30)],
      [30, 29],
      [28, 29],
    ],
    true
  );
}

// ── Lines ────────────────────────────────────────────────────────────────────

// Three series, each on ChartLine's pattern: the peak and dip slide along
// the first segment's angle (so it only lengthens) and the end extends
// along the last segment's angle; the start holds. The top series reaches
// furthest and the bottom least: [mid slide, end reach] per series.
const MULTI_REACH: Array<[number, number]> = [
  [2.5, 3],
  [2, 2],
  [1.5, 1],
];
export const ChartMultiLineSpec = /* @__PURE__ */ withStatic(
  hover('ChartMultiLine', (h) => {
    const s: Shapes = { axis };
    [0, 8, 16].forEach((y, k) => {
      const [p0, p1, p2, p3]: Pt[] = [
        [3, 12.05 + y],
        [11.41, 4.93 + y],
        [20.33, 7.05 + y],
        [27.577, 3.68 + y],
      ];
      const [mid, end] = MULTI_REACH[k];
      const v = along(p0, p1, mid * h);
      s[`l${k}`] = {
        d: filletPath(
          [p0, add(p1, v), add(p2, v), add(p3, along(p2, p3, end * h))],
          1
        ),
        ...LINE,
      };
    });
    return s;
  }),
  /* @__PURE__ */ carbonArt(ChartMultiLine32)
);

// The middle point and the one after it slide 2px along the first
// segment's angle (so the first segment just lengthens), and the last
// point reaches 4px further along the last segment: ChartLine's pattern.
const DATA_POINTS: Pt[] = [
  [11, 14],
  [20, 22],
  [26, 10],
];
const DATA_ANCHOR: Pt = [3.25, 28.5];
export const ChartLineDataSpec = /* @__PURE__ */ withStatic(
  hover('ChartLineData', (h) => {
    const v = along(DATA_ANCHOR, DATA_POINTS[0], 2 * h);
    const [a, b, c] = DATA_POINTS;
    const R: Pt[] = [add(a, v), add(b, v), add(c, along(b, c, 4 * h))];
    return {
      axis,
      r0: { d: ringPath(R[0], 3, 2) },
      r1: { d: ringPath(R[1], 3, 2) },
      r2: { d: ringPath(R[2], 3, 2) },
      s0: { d: seg(R[0], DATA_ANCHOR, 3), ...LINE },
      s1: { d: seg(R[0], R[1], 3, 3), ...LINE },
      s2: { d: seg(R[1], R[2], 3, 3), ...LINE },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartLineData32)
);

// As ChartLine: the middle of the curve (peak to trough) slides 2px along
// the rise into the peak, and the end reaches 4px further along its own
// tangent. The control points ride with their ends.
const SM = {
  s0: [3.9, 28.3] as Pt,
  e0: [4.52, 26.38] as Pt,
  peak: [13.14, 13.9] as Pt,
  mid: [17.5, 17.5] as Pt,
  trough: [22, 21.1] as Pt,
  end: [29.016, 9.82] as Pt,
};
export const ChartLineSmoothSpec = /* @__PURE__ */ withStatic(
  hover('ChartLineSmooth', (h) => {
    const v = along(SM.s0, SM.peak, 2 * h);
    const [pk, mid, tr] = [add(SM.peak, v), add(SM.mid, v), add(SM.trough, v)];
    const end = add(SM.end, along([28.77, 11.65], SM.end, 4 * h));
    const c1 = remap([6.055, 21.58], SM.e0, SM.peak, SM.e0, pk);
    const c2 = remap([9.389, 13.9], SM.e0, SM.peak, SM.e0, pk);
    const c3 = remap([26.43, 21.1], SM.trough, SM.end, tr, end);
    const c4 = remap([28.77, 11.65], SM.trough, SM.end, tr, end);
    const [a1, m1, b1] = [
      add([14.64, 13.95], v),
      add([16.55, 15.95], v),
      add([20.35, 21.1], v),
    ];
    return {
      axis,
      line: {
        d: `M${P(SM.s0)}L${P(SM.e0)}C${P(c1)} ${P(c2)} ${P(pk)}C${P(a1)} ${P(m1)} ${P(mid)}S${P(b1)} ${P(tr)}C${P(c3)} ${P(c4)} ${P(end)}`,
        ...LINE,
      },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartLineSmooth32)
);

/**
 * ChartLine's pattern for a trend line with an arrowhead: the two middle
 * points slide `d` along the first segment's angle, and the end, with the
 * head, reaches `dEnd` (default `d`) further along the last segment's angle. `pts` is
 * [start, peak, trough, end]; returns the moved points and the head offset.
 */
function trend(
  pts: readonly Pt[],
  d: number,
  dEnd = d
): { line: Pt[]; head: Pt } {
  const v = along(pts[0], pts[1], d);
  const head = along(pts[2], pts[3], dEnd);
  return {
    line: [pts[0], add(pts[1], v), add(pts[2], v), add(pts[3], head)],
    head,
  };
}

// Trend line: ChartLine's pattern, the arrowhead riding the end, which
// extends 4px.
const ANALYTICS: Pt[] = [
  [6.705, 22.295],
  [14, 15],
  [19, 20],
  [29, 10],
];
export const AnalyticsSpec = /* @__PURE__ */ withStatic(
  hover('Analytics', (h) => {
    const { line, head } = trend(ANALYTICS, 2 * h, 4 * h);
    return {
      axis,
      line: { d: polyPath(line), ...ROUND },
      head: {
        d: polyPath(
          (
            [
              [23, 10],
              [29, 10],
              [29, 16],
            ] as Pt[]
          ).map((p) => add(p, head))
        ),
        ...MITER,
      },
    };
  }),
  /* @__PURE__ */ carbonArt(Analytics32)
);

// Analytics' --custom and --reference variants: the trend line as Carbon
// draws it there, 5px higher (the reference's start 2px further along it), on
// Analytics' hover. The axis is Carbon's, cut for the badge. The custom
// pencil pushes 2px towards its tip (the edit marks' pencil), and the axis's
// open end draws back as far, keeping its 4px to it; the reference arrow
// reaches (below).
const analyticsVariant = (start: Pt, h: number): Shapes => {
  const { line, head } = trend(
    [start, [14, 10], [19, 15], [29, 5]],
    2 * h,
    4 * h
  );
  return {
    line: { d: polyPath(line), ...ROUND },
    head: {
      d: polyPath(
        (
          [
            [23, 5],
            [29, 5],
            [29, 11],
          ] as Pt[]
        ).map((p) => add(p, head))
      ),
      ...MITER,
    },
  };
};
export const AnalyticsCustomSpec = /* @__PURE__ */ withStatic(
  hover('AnalyticsCustom', (h) => {
    const k = CUSTOM_PENCIL_REACH * h;
    return {
      axis: { d: `M4 2H2V28A2 2 0 0 0 4 30H${f(12 - k * Math.SQRT1_2)}V28H4Z` },
      ...analyticsVariant([6.705, 17.295], h),
      pencil: { d: customPencil(k) },
    };
  }),
  /* @__PURE__ */ carbonArt(AnalyticsCustom32)
);
// The reference:
// the arrow's head reaches 2px up and 2px right, its tail held, as Chat
// launch's arrow (the same glyph) does. The ends it comes towards draw back
// along their walls just enough to keep their 4px to it: the axis's two ends
// (corner to corner) and the line's start (2px up and right, along the line).
export const REFERENCE_REACH = 2;
export const AnalyticsReferenceSpec = /* @__PURE__ */ withStatic(
  hover('AnalyticsReference', (h) => {
    const m = REFERENCE_REACH * h;
    const back = Math.sqrt(16 - m * m); // the other axis's share of a 4px corner-to-corner gap
    return {
      axis: {
        d:
          rectPath(2, 2, 4, 20 - m - back) +
          rectPath(12 + m + back, 28, 30, 30),
      },
      ...analyticsVariant([8.705 + m, 15.295 - m], h),
      badge: { d: referenceArrow(m) },
    };
  }),
  /* @__PURE__ */ carbonArt(AnalyticsReference32)
);

// The bars step up more steeply; the trend line follows ChartLine's
// pattern, the arrowhead riding the end.
const PERF: Array<[number, number, number]> = [
  [8, 21, 22],
  [14, 19, 19],
  [20, 17, 16],
  [26, 15, 13],
];
const PERF_LINE: Pt[] = [
  [7, 15],
  [12, 10],
  [17, 15],
  [27, 5],
];
export const ChartPerformanceSpec = /* @__PURE__ */ withStatic(
  hover('ChartPerformance', (h) => {
    const s: Shapes = { axis };
    PERF.forEach(([x, t, ht], i) => {
      s[`b${i}`] = { d: bar(x, lerp(t, ht, h)) };
    });
    const { line, head } = trend(PERF_LINE, 2 * h);
    s.line = { d: polyPath(line), ...ROUND };
    s.head = {
      d: polyPath(
        (
          [
            [21, 5],
            [27, 5],
            [27, 11],
          ] as Pt[]
        ).map((p) => add(p, head))
      ),
      ...MITER,
    };
    return s;
  }),
  /* @__PURE__ */ carbonArt(ChartPerformance32)
);

// ── Combined and dual charts ─────────────────────────────────────────────────

// The columns trade heights and the line tracks them: over the column that
// falls, the line falls; over the one that rises, it rises. Its ends move
// too, so each bend keeps turning the same way.
export const ChartComboSpec = /* @__PURE__ */ withStatic(
  hover('ChartCombo', (h) => ({
    axis,
    a: {
      d: polyPath([
        [8, 29],
        [8, lerp(13, 16, h)],
        [14, lerp(13, 16, h)],
        [14, 29],
      ]),
      ...MITER,
    },
    b: {
      d: polyPath([
        [20, 29],
        [20, lerp(17, 12, h)],
        [26, lerp(17, 12, h)],
        [26, 29],
      ]),
      ...MITER,
    },
    line: {
      d: filletPath(
        [
          [7.4397, lerp(9.4033, 12.4, h)],
          [11, lerp(4.6, 9.6, h)],
          [23, lerp(13.4, 7.4, h)],
          [27.197, lerp(7.735, 3.2, h)],
        ],
        1
      ),
      ...LINE,
    },
  })),
  /* @__PURE__ */ carbonArt(ChartCombo32)
);

// Two series against two y-axes, both moving in ChartLine's pattern. The
// lower line's middle points slide 2px along its first segment and its end
// holds. The upper line's second segment slides 4px the same way, still
// cut off at the right axis.
const DUAL_FRAME = 'M2,2V28a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V2H28V28H4V2Z';
const DUAL_A: Pt[] = [
  [3, 13.6],
  [11.1, 6.65],
  [29, 24.6],
];
const DUAL_B: Pt[] = [
  [3, 22.55],
  [11, 15.6],
  [15.75, 20.4],
  [29, 8.1],
];
export const ChartDualYAxisSpec = /* @__PURE__ */ withStatic(
  hover('ChartDualYAxis', (h) => {
    const va = along(DUAL_A[0], DUAL_A[1], 4 * h);
    const peak = add(DUAL_A[1], va);
    const [dx, dy] = [DUAL_A[2][0] - DUAL_A[1][0], DUAL_A[2][1] - DUAL_A[1][1]];
    const end: Pt = [29, peak[1] + ((29 - peak[0]) * dy) / dx];
    const vb = along(DUAL_B[0], DUAL_B[1], 2 * h);
    return {
      frame: { d: DUAL_FRAME },
      a: { d: filletPath([DUAL_A[0], peak, end], 1), ...LINE },
      b: {
        d: filletPath(
          [DUAL_B[0], add(DUAL_B[1], vb), add(DUAL_B[2], vb), DUAL_B[3]],
          1
        ),
        ...LINE,
      },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartDualYAxis32)
);

// The curve re-fits: its peak rises 2px and its tails drop 2px. Each bar
// keeps its resting gap to the curve above it, so the bars follow.
const HIST_BARS: Array<[number, number]> = [
  [8, 20],
  [14, 16],
  [20, 20],
  [26, 22],
];
/** The bell curve as cubic segments, with baseline `b` and peak `py`. Left half fitted to Carbon; the right mirrors it about x=16. */
function bell(b: number, py: number): Pt[][] {
  const k = (b - py) / 8;
  const y = (v: number) => b - (15 - v) * k;
  const [m1, m, k1, k2] = [
    [9.1, y(13.9)] as Pt,
    [10.47, y(11.27)] as Pt,
    1.9,
    2.75,
  ];
  const mir = ([x, yy]: Pt): Pt => [32 - x, yy];
  const m2: Pt = [2 * m[0] - m1[0], 2 * m[1] - m1[1]];
  return [
    [[6, b], [6 + k1, b], m1, m],
    [m, m2, [16 - k2, py], [16, py]],
    [[16, py], [16 + k2, py], mir(m2), mir(m)],
    [mir(m), mir(m1), [26 - k1, b], [26, b]],
  ];
}
/** The curve's height at x (flat beyond x 6–26). */
function bellY(segs: Pt[][], x: number): number {
  if (x <= 6 || x >= 26) {
    return segs[0][0][1];
  }
  for (const [p0, p1, p2, p3] of segs) {
    if (x < p0[0] || x > p3[0]) {
      continue;
    }
    let [lo, hi] = [0, 1];
    const at = (t: number, i: 0 | 1) =>
      (1 - t) ** 3 * p0[i] +
      3 * (1 - t) ** 2 * t * p1[i] +
      3 * (1 - t) * t ** 2 * p2[i] +
      t ** 3 * p3[i];
    for (let n = 0; n < 30; n++) {
      const t = (lo + hi) / 2;
      if (at(t, 0) < x) {
        lo = t;
      } else {
        hi = t;
      }
    }
    return at((lo + hi) / 2, 1);
  }
  return segs[0][0][1];
}
const BELL_REST = bell(15, 7);
export const ChartHistogramSpec = /* @__PURE__ */ withStatic(
  hover('ChartHistogram', (h) => {
    const segs = bell(lerp(15, 17, h), lerp(7, 5, h));
    const s: Shapes = { axis };
    HIST_BARS.forEach(([x, t], i) => {
      s[`b${i}`] = {
        d: bar(x, t + bellY(segs, x + 1) - bellY(BELL_REST, x + 1)),
      };
    });
    const b = segs[0][0][1];
    s.curve = {
      d:
        `M3 ${f(b)}H6` +
        segs.map(([, p1, p2, p3]) => `C${P(p1)} ${P(p2)} ${P(p3)}`).join('') +
        'H30',
      ...LINE,
    };
    return s;
  }),
  /* @__PURE__ */ carbonArt(ChartHistogram32)
);

// ── Areas ────────────────────────────────────────────────────────────────────

// The three series take new values; the wall follows the top series' end.
const AREA_REST: Pt[][] = [
  [
    [3.2, 11.8],
    [12.43, 4.8],
    [20.2, 9],
    [29, 7.03],
  ],
  [
    [3.4, 20.6],
    [12.3, 10.6],
    [20.45, 17.2],
    [29, 13.05],
  ],
  [
    [3.05, 27.95],
    [12.45, 19.83],
    [20.25, 23.05],
    [29, 21],
  ],
];
const AREA_HOVER: Pt[][] = [
  [
    [3.2, 11.8],
    [12.43, 6.8],
    [20.2, 10],
    [29, 4.5],
  ],
  [
    [3.4, 20.6],
    [12.3, 13.6],
    [20.45, 17.2],
    [29, 11.05],
  ],
  [
    [3.05, 27.95],
    [12.45, 21.83],
    [20.25, 22.05],
    [29, 18],
  ],
];
export const ChartAreaSpec = /* @__PURE__ */ withStatic(
  hover('ChartArea', (h) => {
    const L = AREA_REST.map((r, i) => lpAll(r, AREA_HOVER[i], h));
    return {
      axis,
      wall: { d: wall(L[0][2], L[0][3]) },
      l0: { d: filletPath(L[0], 1), ...LINE },
      l1: { d: filletPath(L[1], 1), ...LINE },
      l2: { d: filletPath(L[2], 1), ...LINE },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartArea32)
);

// Smooth areas move like ChartArea: each crest, trough and end takes the
// same new value as its counterpart there. Starts hold; the control points
// ride with their ends.
type Wave = {
  s: Pt;
  c1: Pt;
  k1: number;
  a: Pt;
  c2: Pt;
  c3: Pt;
  b: Pt;
  k4: number;
  c4: Pt;
  e: Pt;
  dy: [number, number, number];
};
const WAVES: Wave[] = [
  {
    s: [3.2, 9.9],
    c1: [5.13, 7.586],
    k1: 3.01,
    a: [12.25, 4.95],
    c2: [15.45, 5],
    c3: [19.5, 9],
    b: [22.75, 9],
    k4: 1.25,
    c4: [27, 8.6],
    e: [29.25, 7.95],
    dy: [2, 1, -2.53],
  },
  {
    s: [2.9, 20.25],
    c1: [5.65, 15.5],
    k1: 2.6,
    a: [12.15, 12],
    c2: [15.5, 11.95],
    c3: [18.4, 16.85],
    b: [21.5, 17],
    k4: 3.25,
    c4: [26.5, 15.5],
    e: [28.9, 13.3],
    dy: [3, 0, -2],
  },
  {
    s: [2.95, 28.2],
    c1: [6, 23.5],
    k1: 2,
    a: [12, 21],
    c2: [15.6, 21],
    c3: [18.4, 23],
    b: [22, 23],
    k4: 2,
    c4: [26, 22.3],
    e: [29, 21.5],
    dy: [2, -1, -3],
  },
];
function wave(w: Wave, h: number): { d: string; tail: [Pt, Pt] } {
  const mv = ([x, y]: Pt, dy: number): Pt => [x, y + dy * h];
  const [a, b, e] = [mv(w.a, w.dy[0]), mv(w.b, w.dy[1]), mv(w.e, w.dy[2])];
  const c1 = remap(w.c1, w.s, w.a, w.s, a);
  const c2 = remap(w.c2, w.a, w.b, a, b);
  const c3 = remap(w.c3, w.a, w.b, a, b);
  const bk: Pt = [b[0] + w.k4, b[1]];
  const c4 = remap(w.c4, w.b, w.e, b, e);
  return {
    d: `M${P(w.s)}C${P(c1)} ${P([a[0] - w.k1, a[1]])} ${P(a)}C${P(c2)} ${P(c3)} ${P(b)}C${P(bk)} ${P(c4)} ${P(e)}`,
    tail: [c4, e],
  };
}
export const ChartAreaSmoothSpec = /* @__PURE__ */ withStatic(
  hover('ChartAreaSmooth', (h) => {
    const [w0, w1, w2] = WAVES.map((w) => wave(w, h));
    return {
      axis,
      wall: { d: wall(...w0.tail) },
      l0: { d: w0.d, ...LINE },
      l1: { d: w1.d, ...LINE },
      l2: { d: w2.d, ...LINE },
    };
  }),
  /* @__PURE__ */ carbonArt(ChartAreaSmooth32)
);

// ── Network and radar ────────────────────────────────────────────────────────

// Every node grows 1px in place, all together (no stagger; they
// went round the chain 30ms apart); the edges shorten to stay attached.
// The standard 160ms entrance ease.
const node = ([x, y]: Pt, g: number) =>
  `${roundedRectPath(x - 5 - g, y - 5 - g, x + 5 + g, y + 5 + g)}${rectPath(x - 3 - g, y - 3 - g, x + 3 + g, y + 3 + g)}`;
const netTiming = /* @__PURE__ */ together();
export const ChartNetworkSpec = /* @__PURE__ */ hoverIcon('ChartNetwork', {
  hover: netTiming.hover,
  geo: ({ h }) => {
    // Chain order: top-right square, bottom-right circle, bottom-left square, top-left circle.
    const g = (i: number) => 0.5 * netTiming.at(h, i);
    const [tr, br, bl, tl] = [g(0), g(1), g(2), g(3)];
    const [lo, hi] = [9, 23];
    return {
      c0: { d: ringPath([lo, lo], 4 + tl, 2) },
      c1: { d: ringPath([hi, hi], 4 + br, 2) },
      n0: { d: node([lo, hi], bl), fillRule: 'evenodd' },
      n1: { d: node([hi, lo], tr), fillRule: 'evenodd' },
      e0: { d: rectPath(lo - 1, lo + 3.5 + tl, lo + 1, hi - 4.5 - bl) },
      e1: { d: rectPath(lo + 4.5 + bl, hi - 1, hi - 4.5 - br, hi + 1) },
      e2: { d: rectPath(hi - 1, lo + 4.5 + tr, hi + 1, hi - 4.5 - br) },
    };
  },
  static: /* @__PURE__ */ carbonArt(ChartNetwork32),
});

// The web's outer edge grows 2px (it overflows the frame; IconSvg allows
// it) and the spokes reach out with it. The data polygon takes new
// values: each vertex slides along its spoke.
const RADAR_OUT: Pt[] = [
  [16, 2],
  [30, 13],
  [24, 30],
  [8, 30],
  [2, 13],
];
const RADAR_WEB = /* @__PURE__ */ insetPoly(RADAR_OUT, 1);
const RADAR_DATA: Pt[] = [
  [16.021, 9.34],
  [22.762, 14.371],
  [19.241, 22.202],
  [11.878, 23.787],
  [10.057, 14.485],
];
const RADAR_SPOKE: Pt[] = [
  [16, 3.272],
  [29.068, 13.093],
  [23.042, 28.9],
  [8.858, 29.15],
  [3.932, 13.343],
];
const RADAR_MOVE = [2.5, -2, 2, -2, 2]; // px along each spoke, outward
export const ChartRadarSpec = /* @__PURE__ */ withStatic(
  hover('ChartRadar', (h) => {
    const web = insetPoly(RADAR_OUT, 1 - 2 * h);
    const V = RADAR_DATA.map((v, i) =>
      add(v, along(v, RADAR_SPOKE[i], RADAR_MOVE[i] * h))
    );
    const s: Shapes = {
      web: { d: polyPath(web, true), ...MITER },
      data: { d: polyPath(V, true), ...MITER },
    };
    V.forEach((v, i) => {
      const e = RADAR_SPOKE[i];
      s[`s${i}`] = {
        d: seg(v, [
          e[0] + web[i][0] - RADAR_WEB[i][0],
          e[1] + web[i][1] - RADAR_WEB[i][1],
        ]),
        ...LINE,
      };
    });
    return s;
  }),
  /* @__PURE__ */ carbonArt(ChartRadar32)
);
