/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Shared attribute sets and number helpers for frame-engine geometry
 * (`makeHoverIcon` / `makeToggleIcon` shapes).
 */

/** A 2px stroked line (butt caps, miter joins: SVG's defaults). */
export const LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
} as const;
export const MITER = { ...LINE, strokeLinejoin: 'miter' } as const;
export const ROUND = { ...LINE, strokeLinejoin: 'round' } as const;
export const EVENODD = { fillRule: 'evenodd' } as const;

/* @__NO_SIDE_EFFECTS__ */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** A coordinate rounded to 3 decimals, for path strings. */
/* @__NO_SIDE_EFFECTS__ */
export const f = (n: number) => +n.toFixed(3);
