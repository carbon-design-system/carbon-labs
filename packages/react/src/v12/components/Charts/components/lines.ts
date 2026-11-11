/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The line constants every chart shares: the type stack for plot labels, the
// stroke widths, the solid backing under a line, and the line's shape.

/** The type stack for tooltips and plot labels drawn on the canvas. */
export const CHART_SANS = "'IBM Plex Sans', system-ui, sans-serif";

/** A measured or projected line's stroke, px. */
export const LINE_WIDTH = 2;

/** A reference line's stroke, one under the others so it reads quieter, px. */
export const REFERENCE_LINE_WIDTH = LINE_WIDTH - 1;

/** The solid backing's width over its line's own, px. */
export const SOLID_BACKING = 4;

/** The solid backing's width by the line's chart size, px. */
export const SOLID_BACKING_BY_SIZE = {
  xs: SOLID_BACKING,
  s: SOLID_BACKING + 1,
  m: SOLID_BACKING + 2,
} as const;

/** A line drawn point to point, or through them on a curve. */
export type LineShape = 'straight' | 'curved';

/** The shape every line takes unless a chart says otherwise. */
export const DEFAULT_LINE_SHAPE: LineShape = 'straight';

/** The curve's smoothing. */
export const CURVE_SMOOTH = 0.4;

/**
 * A line shape's smoothing, as the plot takes it.
 *
 * @param shape The shape.
 * @returns 0 for straight, the curve's smoothing for curved.
 */
export function smoothFor(shape: LineShape): number {
  return shape === 'curved' ? CURVE_SMOOTH : 0;
}
