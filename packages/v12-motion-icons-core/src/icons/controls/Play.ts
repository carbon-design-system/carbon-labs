/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Play16 from '@carbon/icons/es/play/16.js';
import Play32 from '@carbon/icons/es/play/32.js';
import { carbonArt, HOVER, hoverIcon, type Shapes } from '../../engine';
import { centroid, polyPath, scalePts, type Pt } from '../../geometry';

/**
 * Carbon `play`, rebuilt as a stroked triangle (no reference animation).
 *
 * Hover: the triangle grows 10% about its centroid. The outline is a
 * centreline stroke with round joins, which reproduces Carbon's filled
 * outline exactly (outer corners r=1, inner corners sharp). Growing the
 * geometry rather than CSS-scaling the path keeps the line weight constant.
 *
 * Carbon ships separate 16px artwork (1px line); size 16 uses it, like
 * `@carbon/icons-react` does, drawn in its 16 grid and scaled 2× into the
 * 32 one.
 *
 * Timing: the entrance ease both ways (160ms in, 120ms out).
 */
const GROW = 1.1;

const ART = {
  32: {
    stroke: 2,
    tri: [
      [7, 5],
      [7, 27],
      [27, 16],
    ] as Pt[],
  },
  16: {
    stroke: 1,
    tri: [
      [3.5, 2.5026],
      [3.5, 13.5816],
      [13.0682, 8.0421],
    ] as Pt[],
  },
};

/** The triangle at hover progress h. */
function playShapes({ h }: { h: number }, size?: number): Shapes {
  const a = size === 16 ? ART[16] : ART[32];
  return {
    tri: {
      d: polyPath(scalePts(a.tri, centroid(a.tri), 1 + (GROW - 1) * h), true),
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: a.stroke,
      strokeLinejoin: 'round',
      ...(size === 16 ? { transform: 'scale(2)' } : {}),
    },
  };
}

export const PlaySpec = /* @__PURE__ */ hoverIcon('Play', {
  geo: playShapes,
  hover: HOVER,
  static: /* @__PURE__ */ carbonArt(Play16, Play32),
});
