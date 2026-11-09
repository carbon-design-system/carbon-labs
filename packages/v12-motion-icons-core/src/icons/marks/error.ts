/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import BatteryError32 from '@carbon/icons/es/battery--error/32.js';
import ShoppingCartError32 from '@carbon/icons/es/shopping--cart--error/32.js';
import ContentNavigatorSyncError32 from '@carbon/icons/es/content-navigator-sync--error/32.js';
import {
  makeStatusMarkIcon,
  type MarkType,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import type { Pt } from '../../geometry';
import { f } from '../../paint';
import { carbonArt, withStatic } from '../../engine';
import { carbonCircle, cartCalm } from './bases';
import { batteryBadge, batteryEnds, SYNC_BADGE, SYNC_ENDS } from './warning';

/**
 * The error badges: Carbon's `<base>--error` icons whose error is a badge
 * on a base (battery, shopping cart, content navigator sync), on the
 * status-mark system (utils/statusMark.ts).
 *
 * One error motion for all of them, the error states' own (Error, Error
 * outline and filled, and the status layer's error, which is Carbon's
 * corner ring and slash): the ring grows 1px in radius at its 2px weight
 * (a disc, 1px), and the slash, 2px wide across it, extends with it. Carbon
 * draws the badge both ways: a ring with its slash (battery, shopping
 * cart), and a disc with the slash knocked out (content navigator sync).
 * The base plays its own hover where it has one, else holds; its open ends
 * draw back to keep their resting space to the badge.
 *
 *  - Battery error: the battery holds; its top wall's end draws right and
 *    its left wall's end down.
 *  - Shopping cart error: the cart plays Shopping cart's hover (it grows 9%
 *    from its lower left at 2px: the basket's floor rises 0.54px and its
 *    right wall moves 1.62px right). The ring sits 2px above the floor, so
 *    it rises 1.5px as it grows, keeping 2px; the right wall's end draws
 *    back down the wall.
 *  - Content navigator sync error: the sync arrows hold; their arc ends
 *    draw back round the ring.
 */

/** Where an error sits: its centre, its outer radius, and whether Carbon fills it (the slash knocked out). */
export interface ErrorPlace {
  /** Carbon's drawing of it (absolute commands), which it rests on. */
  d?: string;
  c: Pt;
  r: number;
  filled?: boolean;
  /** The slash runs bottom left to top right (Carbon's on shopping--cart--error), not top left to bottom right. */
  flip?: boolean;
  /** How far it moves at full hover, where the base needs the room. */
  drift?: Pt;
}
/** How far the ring (or disc) grows in radius at full hover. */
export const ERROR_GROW = 1;
/** The slash's half-width (2px across, along the top-left to bottom-right diagonal). */
const SLASH = 1;

const centreAt = (p: ErrorPlace, h: number): Pt =>
  p.drift ? [p.c[0] + p.drift[0] * h, p.c[1] + p.drift[1] * h] : p.c;
/**
 * The part of the disc of radius r about c on one side of the slash
 * (`side` +1: up and right of it, −1: down and left; flipped, down and
 * right, up and left), cut along the slash's edge, as a closed path.
 */
function halfDisc([cx, cy]: Pt, r: number, side: 1 | -1, flip = false): string {
  // Across the slash: u along (1, −1)/√2; along it: v along (1, 1)/√2 (flipped, mirrored top to bottom). The edge is u = side · SLASH.
  const S = Math.SQRT1_2;
  const L = Math.sqrt(Math.max(0, r * r - SLASH * SLASH));
  const k = flip ? -1 : 1;
  const at = (u: number, v: number): Pt => [
    cx + S * (u + v),
    cy + k * S * (-u + v),
  ];
  const a = at(side * SLASH, -L);
  const b = at(side * SLASH, L);
  const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
  // Along the edge from a to b, then round the far side back to a (the larger arc when the edge is past the centre).
  return `M${P(a)}L${P(b)}A${f(r)} ${f(r)} 0 0 ${(side > 0 ? 0 : 1) ^ (flip ? 1 : 0)} ${P(a)}Z`;
}

/** The error mark: a 2px ring and its slash (or a disc less the slash), growing 1px in radius, the slash with it. */
export const ERROR: MarkType<ErrorPlace> = {
  d: (p, h) => {
    if (h <= 0 && p.d) {
      return p.d;
    }
    const c = centreAt(p, h);
    const r = p.r + ERROR_GROW * h;
    // Even-odd: the ring is the disc less the inside (two halves either side of the slash, which stays painted);
    // filled, the two halves alone.
    const half = (rr: number, side: 1 | -1) => halfDisc(c, rr, side, p.flip);
    return p.filled
      ? half(r, 1) + half(r, -1)
      : carbonCircle(c, r) + half(r - 2, 1) + half(r - 2, -1);
  },
  ink: (p, h) => {
    const [cx, cy] = centreAt(p, h);
    const R = (p.r + ERROR_GROW * h) / Math.cos(Math.PI / 72);
    return [
      Array.from(
        { length: 72 },
        (_, i) =>
          [
            cx + R * Math.cos((i * Math.PI) / 36),
            cy + R * Math.sin((i * Math.PI) / 36),
          ] as Pt
      ),
    ];
  },
  evenodd: true,
};

type Spec = StatusMarkSpec<ErrorPlace>;
const DOWN_WALL: Pt = /* @__PURE__ */ (() => {
  // The basket's right wall, from its top (29.2445, 7) down to the floor (26.9762, 17.217).
  const [dx, dy] = [26.9762 - 29.2445, 17.217 - 7];
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
})();

export const BATTERY_ERROR: Spec = {
  base: {
    d: /* @__PURE__ */ batteryBadge(17),
    ends: /* @__PURE__ */ batteryEnds(17),
  },
  mark: ERROR,
  place: {
    d:
      'M9 15C12.31 15 15 12.31 15 9S12.31 3 9 3S3 5.69 3 9S5.69 15 9 15Z' +
      'M9 5C11.21 5 13 6.79 13 9C13 9.71 12.8 10.41 12.43 11.02L6.98 5.57C7.59 5.2 8.29 5.01 9 5Z' +
      'M5.57 6.98L11.02 12.43C10.41 12.8 9.71 12.99 9 13C6.79 13 5 11.21 5 9C5 8.29 5.2 7.59 5.57 6.98Z',
    c: [9, 9],
    r: 6,
  },
};
export const BatteryErrorSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('BatteryError', BATTERY_ERROR),
  /* @__PURE__ */ carbonArt(BatteryError32)
);

export const SHOPPING_CART_ERROR: Spec = {
  base: {
    // Shopping cart's hover: the basket grows 9% from its lower left.
    calm: cartCalm,
    d: 'M4.9806 2.8039A1 1 0 0 0 4 2H0V4H3.18L7.0194 23.1961A1 1 0 0 0 8 24H26V22H8.82L8.02 18H26A1 1 0 0 0 26.9762 17.217L29.2445 7H27.1971L25.1982 16H7.62Z',
    ends: [
      {
        at: [
          [29.2445, 7],
          [27.1971, 7],
        ],
        back: DOWN_WALL,
      },
    ],
    parts: {
      wheels:
        'M8 28A2 2 0 1 0 12 28A2 2 0 1 0 8 28Z' +
        'M22 28A2 2 0 1 0 26 28A2 2 0 1 0 22 28Z',
    },
  },
  baseMotion: 'calm',
  mark: ERROR,
  // The floor rises 0.54px as the ring grows 1px towards it: the ring rises 1.54px, keeping its 2px.
  place: {
    d:
      'M17 2A6 6 0 1 0 23 8A6.0066 6.0066 0 0 0 17 2Z' +
      'M17 4A3.9521 3.9521 0 0 1 19.019 4.5669L13.5669 10.019A3.9529 3.9529 0 0 1 13 8A4.0045 4.0045 0 0 1 17 4Z' +
      'M17 12A3.9521 3.9521 0 0 1 14.981 11.4331L20.4331 5.981A3.9529 3.9529 0 0 1 21 8A4.0045 4.0045 0 0 1 17 12Z',
    c: [17, 8],
    r: 6,
    flip: true,
    drift: [0, -1.54],
  },
};
export const ShoppingCartErrorSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('ShoppingCartError', SHOPPING_CART_ERROR),
  /* @__PURE__ */ carbonArt(ShoppingCartError32)
);

export const CONTENT_NAVIGATOR_SYNC_ERROR: Spec = {
  base: { d: SYNC_BADGE, ends: SYNC_ENDS },
  mark: ERROR,
  // The document holds 2.2px from the disc, which grows 1px towards it: the disc moves 0.8px away from it.
  place: {
    d:
      'M29.47 30.89C28.49 31.59 27.29 32 26 32C22.69 32 20 29.31 20 26C20 24.71 20.41 23.51 21.11 22.53L29.47 30.89Z' +
      'M26 20C24.71 20 23.51 20.41 22.53 21.11L30.89 29.47C31.59 28.49 32 27.29 32 26C32 22.69 29.31 20 26 20Z',
    c: [26, 26],
    r: 6,
    filled: true,
    drift: [0.62, 0.51],
  },
};
export const ContentNavigatorSyncErrorSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('ContentNavigatorSyncError', CONTENT_NAVIGATOR_SYNC_ERROR),
  /* @__PURE__ */ carbonArt(ContentNavigatorSyncError32)
);
