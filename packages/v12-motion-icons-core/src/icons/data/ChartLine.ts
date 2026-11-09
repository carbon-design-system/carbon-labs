/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ChartLine32 from '@carbon/icons/es/chart--line/32.js';
import { carbonArt, HOVER, hoverIcon, type Shapes } from '../../engine';
import { filletPath, type Pt } from '../../geometry';
import { LINE, lerp } from '../../paint';
import { CHART_AXIS } from './chartAxis';

/**
 * Carbon `chart--line` (no reference animation).
 *
 * Hover: the first peak and the trough both slide 2px up and to the right
 * along the first segment's angle (so the first segment just lengthens),
 * and the end extends 4px along the last segment's resting angle. The axis
 * stays still.
 *
 * Carbon's filled line is redrawn as its 2px centreline with each bend
 * rounded to r=1, which reproduces Carbon's outline (outer edge r=2 around a
 * sharp inner corner). The start is buried in the axis corner. Both states
 * keep each bend turning the same way, so the rounded corners morph
 * cleanly.
 *
 * Timing: the entrance ease both ways (160ms in, 120ms out).
 */
const REST: Pt[] = [
  [3.023, 29],
  [10.7518, 14.3898],
  [20.0079, 22.6188],
  [26.083, 10.4465],
];
const HOVER_PTS: Pt[] = [
  [3.023, 29],
  [11.687, 12.6219],
  [20.9431, 20.8509],
  [27.8693, 6.8675],
];

/** The axis and the line at hover progress h. */
function chartLineShapes({ h }: { h: number }): Shapes {
  const pts = REST.map(
    ([x, y], i): Pt => [
      lerp(x, HOVER_PTS[i][0], h),
      lerp(y, HOVER_PTS[i][1], h),
    ]
  );
  return {
    axis: { d: CHART_AXIS },
    line: { d: filletPath(pts, 1), ...LINE },
  };
}

export const ChartLineSpec = /* @__PURE__ */ hoverIcon('ChartLine', {
  geo: chartLineShapes,
  hover: HOVER,
  static: /* @__PURE__ */ carbonArt(ChartLine32),
});
