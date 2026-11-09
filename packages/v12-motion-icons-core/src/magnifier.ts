/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Pt } from './geometry';

/**
 * The shared magnifier hover (Search, Zoom reset): the lens stays in place
 * and grows 1px in diameter (0.5px radius), and the handle turns 15°
 * clockwise about the lens centre, staying on the lens with its length
 * unchanged.
 */
export interface Magnifier {
  /** Lens centre at rest, the lens's centreline radius and line weight. */
  c: Pt;
  r: number;
  w: number;
  /** The handle's centreline ends, as distances from the lens centre along 45°. */
  handle: [number, number];
}

export const LENS_GROW = 0.5;
export const HANDLE_TURN = 15;

const dir = (deg: number): Pt => [
  Math.cos((deg * Math.PI) / 180),
  Math.sin((deg * Math.PI) / 180),
];

/** The magnifier at hover progress h: lens centre and radius, handle ends, and the lens's scale. */
/* @__NO_SIDE_EFFECTS__ */
export function magnifierAt(m: Magnifier, h: number) {
  const r = m.r + LENS_GROW * h;
  const u = dir(45 + HANDLE_TURN * h);
  const [d0, d1] = [m.handle[0] + LENS_GROW * h, m.handle[1] + LENS_GROW * h];
  const a: Pt = [m.c[0] + u[0] * d0, m.c[1] + u[1] * d0];
  const b: Pt = [m.c[0] + u[0] * d1, m.c[1] + u[1] * d1];
  return { c: m.c, r, a, b, scale: r / m.r };
}
