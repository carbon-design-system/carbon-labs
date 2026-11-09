/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ChartColumn32 from '@carbon/icons/es/chart--column/32.js';
import { carbonArt, HOVER, hoverIcon, type Shapes } from '../../engine';
import { polyPath, type Pt } from '../../geometry';
import { LINE, lerp } from '../../paint';
import { CHART_AXIS } from './chartAxis';

/**
 * Carbon `chart--column` (no reference animation).
 *
 * Hover: a data update. The short column grows and the tall one shrinks,
 * together (two elements: no stagger). The axis stays still.
 *
 * Columns are redrawn as 2px centreline strokes (miter joins, butt ends run
 * 1px under the axis so no seam shows), so their height changes by moving
 * the top edge, never by scaling the stroke.
 *
 * Timing: the entrance ease both ways (160ms in, 120ms out).
 */
const column = (left: number, top: number): string =>
  polyPath([
    [left, 29],
    [left, top],
    [left + 6, top],
    [left + 6, 29],
  ] as Pt[]);

const COLUMNS = [
  { left: 8, rest: 15, hover: 9 },
  { left: 20, rest: 7, hover: 13 },
];

/** The axis and both columns at hover progress h. */
function chartColumnShapes({ h }: { h: number }): Shapes {
  const out: Shapes = { axis: { d: CHART_AXIS } };
  COLUMNS.forEach((c, i) => {
    out[`column${i}`] = {
      d: column(c.left, lerp(c.rest, c.hover, h)),
      ...LINE,
    };
  });
  return out;
}

export const ChartColumnSpec = /* @__PURE__ */ hoverIcon('ChartColumn', {
  geo: chartColumnShapes,
  hover: HOVER,
  static: /* @__PURE__ */ carbonArt(ChartColumn32),
});
