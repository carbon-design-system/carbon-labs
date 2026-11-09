/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { movePath } from '../../geometry';
import { f } from '../../paint';

/** The L-shaped axis shared by Carbon's `chart--*` icons (filled, verbatim). */
export const CHART_AXIS = 'M30,28H4V2H2V28a2,2,0,0,0,2,2H30Z';

/**
 * Carbon's corner badges on the chart and data icons' variants: the
 * `--reference` arrow (bottom left, pointing up-right), as Carbon draws it.
 */
export const REFERENCE_ARROW =
  'M4 20 4 22 8.586 22 2 28.586 3.414 30 10 23.414 10 28 12 28 12 20 4 20z';
/** The reference arrow's corners; the 4th and 5th are its tail's end. */
const REFERENCE_PTS: ReadonlyArray<readonly [number, number]> = [
  [4, 20],
  [4, 22],
  [8.586, 22],
  [2, 28.586],
  [3.414, 30],
  [10, 23.414],
  [10, 28],
  [12, 28],
  [12, 20],
];
/**
 * The reference arrow with its head reaching `m` px right and `m` px up, the
 * tail held so the shaft lengthens (as Chat launch's arrow, the same glyph).
 */
export const referenceArrow = (m: number) =>
  `M${REFERENCE_PTS.map(([x, y], i) => (i !== 3 && i !== 4 ? `${f(x + m)} ${f(y - m)}` : `${x} ${y}`)).join('L')}Z`;

/** How far the `--custom` pencil pushes on hover, along its axis towards its tip (the edit marks' PENCIL_REACH). */
export const CUSTOM_PENCIL_REACH = 2;
/**
 * The `--custom` pencil (bottom right, its tip at the lower left), Carbon's
 * drawing made absolute, pushed `k` px along its axis towards its tip: the
 * edit marks' pencil motion (marks/edit.ts).
 */
export const customPencil = (k: number) =>
  movePath(
    'M29.707 19.293L26.707 16.293A0.9994 0.9994 0 0 0 25.293 16.293L16 25.5859V30H20.4141L29.707 20.707A0.9994 0.9994 0 0 0 29.707 19.293Z' +
      'M19.5859 28H18V26.4141L23 21.4141L24.5859 23ZM26 21.5859L24.4141 20L26 18.4141L27.5859 20Z',
    -k * Math.SQRT1_2,
    k * Math.SQRT1_2
  );

/**
 * A frame with 2px walls (outer corners r2) given by its outer edge, cut as
 * Carbon cuts it for the reference arrow: the left wall stops at y 16 and the
 * bottom wall at x 16. `top` is the inside's top edge (under a header's rule).
 */
export const referenceFrame = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  top: number
) =>
  `M${f(x1 - 2)} ${f(y0)}H${f(x0 + 2)}A2 2 0 0 0 ${f(x0)} ${f(y0 + 2)}V16H${f(x0 + 2)}V${f(top)}H${f(x1 - 2)}V${f(y1 - 2)}H16V${f(y1)}H${f(x1 - 2)}` +
  `A2 2 0 0 0 ${f(x1)} ${f(y1 - 2)}V${f(y0 + 2)}A2 2 0 0 0 ${f(x1 - 2)} ${f(y0)}Z`;
