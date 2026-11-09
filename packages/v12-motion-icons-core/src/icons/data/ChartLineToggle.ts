/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ChartLine32 from '@carbon/icons/es/chart--line/32.js';
import {
  carbonArt,
  hoverIcon,
  specStill,
  toggleIcon,
  type Shapes,
  type ToggleFrame,
  type TweenFn,
} from '../../engine';
import { cubicBezier, ENTRANCE, EXIT } from '../../ease';
import { filletPath, type Pt } from '../../geometry';
import { f, lerp, LINE } from '../../paint';
import { motionTokens } from '../../tokens';
import { CHART_AXIS } from './chartAxis';

const CChartLine = /* @__PURE__ */ carbonArt(ChartLine32);

/**
 * Chart line ⇄ Chart line, projected: Carbon's `chart--line`, and the same
 * chart with its line carrying on as a projection. Made for the
 * chart family's "Show projection" button; `toggled` shows the projection.
 * Carbon has no projected line chart, so that end is ours.
 *
 * The projection is the chart family's forecast vocabulary: round dots in
 * the line's colour, each 1.5× the line's weight (3 units: the family's
 * fill dot + 1px over its 2px line), as far apart as they are wide. The
 * measured line holds A → B → C (the trough, its rounded corner intact) and
 * stops a dot's gap short of the first dot; past it, three dots run on
 * along the last segment's angle, the last one's far edge on x 30, the
 * edge of Carbon's artwork. So the projected end reaches higher than
 * Carbon's line (its end, 26.1, 10.4, sits between the second and third
 * dots).
 *
 * Toggle (linear time; the geometry applies the curves):
 * - On, 220ms (moderate-02: three stages, more than a 160ms fill): a front
 *   runs out from the last reading on the entrance ease. The solid last
 *   segment trims away from its start ahead of it, and each dot grows from
 *   its own centre as the front reaches it, on a strong ease-out (a
 *   draw-in), so the line pinches off into dots in the order of the flow.
 *   Dots are fills, so growing them never touches a stroke.
 * - Off, one token faster (160ms, moderate-01), leaving from the start
 *   rather than rewinding: the solid line draws back in from the last
 *   reading on the exit ease, and each dot shrinks away as the head
 *   reaches it, the first dot first.
 * - An interrupted toggle reverses whatever is in flight (fillThenClear's
 *   two numbers: `p` runs the projection out, `e` draws the line back in).
 *
 * Hover (both states): ChartLine's (the line-chart pattern). The peak and
 * the trough slide 2px along the first segment's angle and the end reaches
 * 4px further along the last segment's. Projected, every point on the last
 * segment rides that same move (the stub's end and each dot keep their
 * place along the segment), so the dots spread a little as the segment
 * lengthens; the dots keep their size. The axis holds.
 *
 * No masks; constant 2px line weight.
 */

/** ChartLine's line (`ChartLine.tsx`): its points at rest and hovered. */
const REST: Pt[] = [
  [3.023, 29],
  [10.7518, 14.3898],
  [20.0079, 22.6188],
  [26.083, 10.4465],
];
const HOVER: Pt[] = [
  [3.023, 29],
  [11.687, 12.6219],
  [20.9431, 20.8509],
  [27.8693, 6.8675],
];

const [, , C0, D0] = REST;
/** The last segment's length at rest, and its direction. */
const SEG = Math.hypot(D0[0] - C0[0], D0[1] - C0[1]);
const UX = (D0[0] - C0[0]) / SEG;

/** The dots' radius, and the clear space between two (one dot's width). */
const R = 1.5;
const GAP = 2 * R;
const PERIOD = 2 * R + GAP;
/** The dots, by distance from the trough along the last segment: the last one's far edge on x 30. */
const T3 = (30 - R - C0[0]) / UX;
const DOTS = [T3 - 2 * PERIOD, T3 - PERIOD, T3];
/** Where the measured line stops when projected: a gap short of the first dot. */
const STUB = DOTS[0] - R - GAP;
/** How far along the segment a dot takes to grow (or shrink) as the front passes: one period. */
const GROW = PERIOD;
/** The front's travel: from the stub's end until the last dot has grown. */
const FRONT_END = T3 - R + GROW;

/** A strong ease-out for the dots' growth (draw-ins take a stronger curve than the entrance token). */
const DRAW = /* @__PURE__ */ cubicBezier(0, 0, 0.3, 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** How far a dot at `t` has grown with the front at `front` (0 none, 1 whole). */
const grown = (t: number, front: number) => clamp01((front - (t - R)) / GROW);

function shapes(h: number, p: number, e: number): Shapes {
  const pts = REST.map(
    (q, i): Pt => [lerp(q[0], HOVER[i][0], h), lerp(q[1], HOVER[i][1], h)]
  );
  const [a, b, c, d] = pts;
  // A place on the last segment, by its distance along it at rest (past
  // the end for the outer dot): hovered, the segment's own move carries it.
  const on = (t: number): Pt => [
    c[0] + ((d[0] - c[0]) * t) / SEG,
    c[1] + ((d[1] - c[1]) * t) / SEG,
  ];
  const line = (end: number) => ({
    d: filletPath([a, b, c, on(end)], 1),
    ...LINE,
  });
  const dot = (t: number, s: number) => {
    const [x, y] = on(t);
    return { tag: 'circle', cx: f(x), cy: f(y), r: f(R * s) };
  };
  const out: Shapes = { axis: { d: CHART_AXIS } };
  if (e > 0) {
    // Off: the line draws back in from the stub; each dot shrinks as the head reaches it.
    const head = STUB + (FRONT_END - STUB) * EXIT(e);
    out.line = line(Math.min(SEG, Math.max(STUB, head)));
    out.tail = { d: '', ...LINE };
    DOTS.forEach((t, i) => (out[`dot${i}`] = dot(t, 1 - EXIT(grown(t, head)))));
  } else if (p <= 0) {
    // Carbon's chart--line.
    out.line = line(SEG);
    out.tail = { d: '', ...LINE };
    DOTS.forEach((t, i) => (out[`dot${i}`] = dot(t, 0)));
  } else {
    // On: the front runs out from the stub, trimming the solid tail from its start; the dots grow behind it.
    const front = STUB + (FRONT_END - STUB) * ENTRANCE(p);
    out.line = line(STUB);
    const [x0, y0] = on(Math.max(front, STUB));
    out.tail = {
      d: front < SEG ? `M${f(x0)} ${f(y0)}L${f(d[0])} ${f(d[1])}` : '',
      ...LINE,
    };
    DOTS.forEach((t, i) => (out[`dot${i}`] = dot(t, DRAW(grown(t, front)))));
  }
  return out;
}

const LINEAR = [0, 0, 1, 1] as [number, number, number, number];
const IN = { duration: motionTokens.duration.moderate02 / 1000, ease: LINEAR };
const OUT = { duration: motionTokens.duration.moderate01 / 1000, ease: LINEAR };

/** fillThenClear on linear time, at this toggle's durations. */
function change(
  turningOn: boolean,
  fr: ToggleFrame,
  tween: TweenFn,
  repaint: () => void
) {
  if (turningOn) {
    return fr.e > 0 ? tween('e', 0, IN) : tween('p', 1, IN);
  }
  if (fr.p < 1) {
    return tween('p', 0, OUT);
  }
  return tween('e', 1, OUT, () => {
    fr.p = 0;
    fr.e = 0;
    repaint();
  });
}

/** The projected chart (ours: Carbon has none), with ChartLine's hover. */
const ChartLineProjected = /* @__PURE__ */ hoverIcon('ChartLineProjected', {
  geo: ({ h }) => shapes(h, 1, 0),
});

/** The projected chart at rest, for when motion is off. */
const ChartLineProjectedStatic = specStill(ChartLineProjected);

/** Chart line ⇄ Chart line, projected. `toggled` shows the projection. */
export const ChartLineToggleSpec = /* @__PURE__ */ toggleIcon<
  'line' | 'projected'
>('ChartLineToggle', {
  states: ['line', 'projected'],
  statics: [CChartLine, ChartLineProjectedStatic],
  geo: ({ h, p, e }) => shapes(h, p, e),
  change,
});
