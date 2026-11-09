/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import WarningAlt16 from '@carbon/icons/es/warning--alt/16.js';
import WarningAlt32 from '@carbon/icons/es/warning--alt/32.js';
import { carbonArt, HOVER, hoverIcon, type Shapes } from '../../engine';
import { centroid, polyPath, scalePts, type Pt } from '../../geometry';
import { f } from '../../paint';
import { glyphScale, warningAlt16Ring } from './alerts';

/**
 * Carbon `warning--alt`, rebuilt as a stroked triangle (no reference animation).
 *
 * Hover: the triangle grows 14% about its centroid at constant line weight
 * (geometry, not a CSS scale). The "!" grows with it (GLYPH_GROW in
 * alerts.ts): its positions scale about its visual centre, so
 * the bar lengthens at constant width and the dot moves down at constant size.
 *
 * Size 16 uses Carbon's own 16px artwork (1px line), as icons-react does,
 * drawn in its 16 grid and scaled 2× into the 32 one. Its line isn't uniform
 * (0.92–1.0px) and its corners are its own curves, so there the triangle is
 * Carbon's outline less its inner triangle (one even-odd path), and the 14%
 * growth moves each corner rigidly with the best-fit centreline's vertex: the
 * same growth, at Carbon's own weights.
 *
 * Timing: the entrance ease both ways (160ms in, 120ms out).
 */
const GROW = 1.14;

const ART = {
  32: {
    stroke: 2,
    tri: [
      [16, 4],
      [3, 29],
      [29, 29],
    ] as Pt[],
    bar: { x: 15, y: 12, width: 2, height: 9 },
    dot: { cx: 16, cy: 24.5, r: 1.5 },
  },
  16: {
    // Carbon's 16px lines aren't uniform (0.92–1.0); the triangle is drawn
    // as Carbon's outline (warningAlt16Ring), `tri` is only its best-fit
    // centreline, which the hover growth follows.
    stroke: 0,
    tri: [
      [7.9781, 1.5712],
      [1.5167, 13.5],
      [14.4396, 13.5],
    ] as Pt[],
    bar: { x: 7.5, y: 6, width: 1, height: 3.5 },
    dot: { cx: 8, cy: 11.6, r: 0.8 },
  },
};

/** The triangle, bar and dot at hover progress h (the 16px drawing in its own 16 grid, scaled 2× into the 32 one). */
function warningAltPlainShapes({ h }: { h: number }, size?: number): Shapes {
  const a = size === 16 ? ART[16] : ART[32];
  const grow = 1 + (GROW - 1) * h;
  const k = glyphScale(h);
  // The "!"'s visual centre: the middle of bar top to dot bottom.
  const c = (a.bar.y + a.dot.cy + a.dot.r) / 2;
  const s = (y: number) => c + (y - c) * k;
  const at16: Record<string, string> =
    size === 16 ? { transform: 'scale(2)' } : {};
  return {
    tri: a.stroke
      ? {
          d: polyPath(scalePts(a.tri, centroid(a.tri), grow), true),
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: a.stroke,
          strokeLinejoin: 'round',
        }
      : { d: warningAlt16Ring(1, grow), fillRule: 'evenodd', ...at16 },
    bar: {
      tag: 'rect',
      ...a.bar,
      y: f(s(a.bar.y)),
      height: f(a.bar.height * k),
      ...at16,
    },
    dot: { tag: 'circle', ...a.dot, cy: f(s(a.dot.cy)), ...at16 },
  };
}

export const WarningAltSpec = /* @__PURE__ */ hoverIcon('WarningAlt', {
  geo: warningAltPlainShapes,
  hover: HOVER,
  static: /* @__PURE__ */ carbonArt(WarningAlt16, WarningAlt32),
});
