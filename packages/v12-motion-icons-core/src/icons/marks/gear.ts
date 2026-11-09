/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { knockout, type Region } from '../../status';
import type { Shapes } from '../../engine';
import {
  clipConvex,
  insetPoly,
  mapPath,
  pathPoints,
  type Pt,
} from '../../geometry';
import { f } from '../../paint';
import { gapBetween } from '../../utils/statusMark';
import { SETTINGS_HOVER } from '../controls/Settings';

/**
 * Settings' gear in a badge (Settings view, Settings edit): the gear turns as Settings' does (30°,
 * half its six-tooth pitch, on Settings' own 220ms (moderate-02) mechanical curve) under a
 * cut that stays with the mark. The cut is a window: the whole gear minus
 * fixed convex regions, drawn so that at rest they cut exactly where Carbon
 * cuts the badge's gear. As the gear turns, its walls pass under the
 * window's edges, which cut them (a wall crossing an edge at a slant ends on
 * that slant). The regions slide with the mark (the pencil) or grow with it
 * (the eye's opening). The hub doesn't turn (it looks the same at any
 * angle); its ends draw back round it, as everywhere in the system.
 */

/**
 * The badges' gear, whole. Carbon draws Settings view's and Settings edit's
 * gear (a newer drawing than settings/32's) only cut; it has six-fold
 * symmetry, so the whole gear is one 60° sector of Settings view's outline
 * (its outside and its inside, sampled every 0.1px), turned six times.
 */
const VIEW_GEAR =
  'M29.3047 11.0439L26.9441 6.9561A1.9977 1.9977 0 0 0 24.5713 6.0615L22.1372 6.8848A11.0419 11.0419 0 0 0 20.8252 6.1265L20.3215 3.6079A2 2 0 0 0 18.36 2H13.64A2 2 0 0 0 11.6789 3.6079L11.1752 6.1265A10.9666 10.9666 0 0 0 9.8481 6.88L7.4287 6.0615A1.9977 1.9977 0 0 0 5.0559 6.9561L2.6953 11.0439A2.0006 2.0006 0 0 0 3.1072 13.5464L5.0381 15.2432C5.021 15.4946 5 15.7446 5 16C5 16.2578 5.01 16.5127 5.0278 16.7656L3.1072 18.4536A2.0006 2.0006 0 0 0 2.6953 20.9561L5.0559 25.0439A1.9977 1.9977 0 0 0 7.4287 25.9385L9.8628 25.1152A10.9736 10.9736 0 0 0 11.1748 25.8735L11.6785 28.3921A2 2 0 0 0 13.64 30H15V28H13.64L12.93 24.4492A9.0953 9.0953 0 0 1 10.2352 22.8779L6.7884 24.0439L4.4284 19.9561L7.1528 17.561A8.9263 8.9263 0 0 1 7.1458 14.4331L4.4275 12.0439L6.7886 7.9561L10.2153 9.1152A9.0305 9.0305 0 0 1 12.9294 7.5508L13.64 4H18.36L19.07 7.5508A9.0978 9.0978 0 0 1 21.7648 9.1221L25.2116 7.9561L27.5716 12.0439L24.7738 14.4961L26.0923 16L28.8923 13.5464A2.0006 2.0006 0 0 0 29.3047 11.0439Z';
const C: Pt = [16, 16];
const ang = ([x, y]: Pt) => Math.atan2(y - C[1], x - C[0]);
const turn = ([x, y]: Pt, a: number): Pt => [
  C[0] + (x - C[0]) * Math.cos(a) - (y - C[1]) * Math.sin(a),
  C[1] + (x - C[0]) * Math.sin(a) + (y - C[1]) * Math.cos(a),
];
/** One loop of the whole gear from the samples of a side (outside or inside) in the sector [-150°, -90°). */
function wholeLoop(side: Pt[]): Pt[] {
  const [a0, a1] = [(-150 * Math.PI) / 180, (-90 * Math.PI) / 180];
  const sector = side
    .filter((p) => ang(p) >= a0 && ang(p) < a1)
    .sort((p, q) => ang(p) - ang(q));
  return Array.from({ length: 6 }, (_, k) =>
    sector.map((p) => turn(p, (k * Math.PI) / 3))
  ).flat();
}
/** The whole gear: its outside, then its inside (opposite winding), as path data. */
export const GEAR = /* @__PURE__ */ (() => {
  const pts = pathPoints(VIEW_GEAR, 0.1);
  // The outline runs round the outside to the cut at the bottom ((15, 30) down to (15, 28)), then back round the inside.
  const cut = pts.findIndex(
    (p) => Math.abs(p[0] - 15) < 1e-6 && Math.abs(p[1] - 28) < 1e-6
  );
  const outer = wholeLoop(pts.slice(0, cut));
  const inner = wholeLoop(pts.slice(cut)).reverse();
  const loop = (q: Pt[]) =>
    `M${q.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
  return loop(outer) + loop(inner);
})();
/** How far the gear turns at full hover (Settings'). */
export const GEAR_TURN = 30;
/** The gear turned by its hover h (clockwise on screen). */
export function gearAt(h: number): string {
  if (h <= 0) {
    return GEAR;
  }
  const a = (GEAR_TURN * h * Math.PI) / 180;
  return mapPath(GEAR, (p) => turn(p, a));
}
/** The gear at hover h minus the cut (convex regions), as path data and its fill rule. */
export function gearCut(
  h: number,
  zones: readonly Region[]
): { d: string; evenodd: boolean } {
  let shapes: Shapes = { gear: { d: gearAt(h) } };
  for (const z of zones) {
    shapes = knockout(shapes, z);
  }
  return {
    d: String(shapes.gear?.d ?? ''),
    evenodd: shapes.gear?.fillRule === 'evenodd',
  };
}
/** Settings' hover timing, for the badges whose gear turns. */
export const GEAR_TIMING = { hover: SETTINGS_HOVER, leave: SETTINGS_HOVER };

/** The least x in [0, hi] with gapAt(x) ≥ want (the gap grows with x). */
export function least(
  gapAt: (x: number) => number,
  want: number,
  hi: number
): number {
  if (gapAt(0) >= want - 1e-9) {
    return 0;
  }
  let lo = 0;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (gapAt(mid) >= want) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return hi;
}

// ── The hub: a 2px ring (outer r 6) about the gear's centre, cut open as a C ──

const polar = (r: number, a: number): Pt => [
  C[0] + r * Math.cos(a),
  C[1] + r * Math.sin(a),
];
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
/** The hub from angle a0 clockwise (on screen) to a1, as path data (a whole ring when the span is 2π). */
export function hubD(a0: number, a1: number): string {
  if (a1 - a0 >= 2 * Math.PI - 1e-6) {
    return 'M16 10A6 6 0 1 1 16 22A6 6 0 1 1 16 10ZM16 12A4 4 0 1 0 16 20A4 4 0 1 0 16 12Z';
  }
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${P(polar(6, a0))}A6 6 0 ${large} 1 ${P(polar(6, a1))}L${P(polar(4, a1))}A4 4 0 ${large} 0 ${P(polar(4, a0))}Z`;
}
/** The hub between a0 and a1 as an annulus sector polygon (for measuring). */
export function hubPoly(a0: number, a1: number): Pt[] {
  const n = Math.max(2, Math.ceil(((a1 - a0) * 72) / (2 * Math.PI)));
  const arc = (r: number) =>
    Array.from({ length: n + 1 }, (_, i) => polar(r, a0 + ((a1 - a0) * i) / n));
  return [...arc(6), ...arc(4).reverse()];
}
/** 3px of ring (at its middle radius) behind an end, in radians. */
const STUB = 3 / 5;

/** The gear's cut regions, grown e and moved by (dx, dy). */
export const zonesAt = (
  zones: readonly Region[],
  dx: number,
  dy: number,
  e: number
): Region[] =>
  zones.map((z) =>
    (e > 0 ? insetPoly(z, -e) : z).map(([x, y]) => [x + dx, y + dy] as Pt)
  );

/** Settings view's cut regions: the bottom wall at x 15, the lower right tooth's end at Carbon's (24.77, 14.50)–(26.09, 16). */
export const VIEW_ZONES: Region[] = [
  [
    [15, 40],
    [15, 25.5],
    [23.6, 13.4],
    [24.7738, 14.4961],
    [40.99, 33.0],
    [41, 40],
  ],
  [
    [26.0923, 16],
    [41, 26],
    [41, 33.5],
  ],
  // Beside the eye's tip (15, 24), only the bottom tooth's hollow at rest: keeps the turning teeth 2px from it.
  [
    [13, 20],
    [15, 20],
    [15, 27.9],
    [13, 27.9],
  ],
];
/** Settings view's hub: Carbon's C, from 126.87° clockwise round to 0°. */
const VIEW_HUB: [number, number] = [Math.atan2(4.8, -3.6011), 2 * Math.PI];
/**
 * Settings view's base at hover h: the gear turned under the window (its
 * regions grown by the eye's opening), and the hub with each end drawn back
 * round it as far as keeps its resting space to the eye.
 */
export function settingsViewBase(
  h: number,
  eyeInk: Pt[][],
  restInk: Pt[][],
  open: number
): string {
  const [a0, a1] = VIEW_HUB;
  const rest0 = gapBetween(restInk, [hubPoly(a0, a0 + STUB)]);
  const rest1 = gapBetween(restInk, [hubPoly(a1 - STUB, a1)]);
  const t0 = least(
    (t) => gapBetween(eyeInk, [hubPoly(a0 + t, a0 + t + STUB)]),
    rest0,
    1.5
  );
  const t1 = least(
    (t) => gapBetween(eyeInk, [hubPoly(a1 - t - STUB, a1 - t)]),
    rest1,
    1.5
  );
  // Left of the eye its tip holds, so the cut there doesn't grow with the opening (so the knockout
  // stays small): the tip's region holds, and the main region's left edge draws back only as far as keeps the bottom
  // wall's end at its resting space to the eye's lower arc (at rest Carbon's, its top at y 28).
  const tb = least(
    (t) => gapBetween(eyeInk, [wallEnd(VIEW_LEFT - t)]),
    gapBetween(restInk, [wallEnd(VIEW_LEFT, 28)]),
    1
  );
  const [main, tooth] = zonesAt(VIEW_ZONES.slice(0, 2), 0, 0, open);
  const x = VIEW_LEFT - tb;
  return (
    gearCut(h, [
      clipConvex(main, [
        [x, -9],
        [41, -9],
        [41, 41],
        [x, 41],
      ]),
      tooth,
      VIEW_ZONES[2],
    ]).d + hubD(a0 + t0, a1 - t1)
  );
}
/** Settings view's main cut region's left edge (x 15, the bottom wall's end at rest). */
const VIEW_LEFT = 15;
/** The bottom wall's end at x: the ink left of the cut, from `top` (the turning rim reaches the tip's region, y 27.9) down to the wall's bottom (30). */
const wallEnd = (x: number, top = 27.9): Pt[] => [
  [x - 1, top],
  [x, top],
  [x, 30],
  [x - 1, 30],
];

/** Settings edit's cut regions: the bottom wall at x 16, the upper right tooth's end at Carbon's (27.55, 12.00)–(29.28, 11.00). */
export const EDIT_ZONES: Region[] = [
  // The chord past the hub, in two convex pieces: 2px or more from the pencil's long side, and 4px or
  // more from its top end (Carbon's 4.02px between the gear and the pencil's top holds as the gear turns).
  [
    [16, 40],
    [16, 24.5],
    [21, 19.5],
    [40, 40],
  ],
  [
    [21, 19.5],
    [23.2, 12.8],
    [27.5474, 12.0005],
    [40, 40],
  ],
  [
    [27.5474, 12.0005],
    [39.67, 5.0005],
    [40, 40],
  ],
];
/**
 * Settings edit's base at hover h: the gear turned under the window (its
 * regions moving with the pencil, along its axis), and the hub, whole at rest, its cut
 * opening square across it where it faces the pencil (45°) just wide enough
 * to keep its resting space to it, and closing as it leaves.
 */
export function settingsEditBase(
  h: number,
  pencilInk: Pt[][],
  restInk: Pt[][],
  dx: number,
  dy: number
): { d: string; hub: number } {
  const face = Math.PI / 4;
  const rest = gapBetween(restInk, [hubPoly(face, face + 2 * Math.PI)]);
  const hub = least(
    (t) => gapBetween(pencilInk, [hubPoly(face + t, face + 2 * Math.PI - t)]),
    rest,
    Math.PI / 2
  );
  return {
    d:
      gearCut(h, zonesAt(EDIT_ZONES, dx, dy, 0)).d +
      hubD(face + hub, face + 2 * Math.PI - hub),
    hub,
  };
}
