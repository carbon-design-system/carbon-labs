/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ArrayTime32 from '@carbon/icons/es/array--time/32.js';
import DeliveryTime32 from '@carbon/icons/es/delivery--time/32.js';
import ServerTime32 from '@carbon/icons/es/server--time/32.js';
import TrainTime32 from '@carbon/icons/es/train--time/32.js';
import {
  loopD,
  makeStatusMarkIcon,
  type MarkType,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import type { Pt } from '../../geometry';
import { carbonCircle } from './bases';
import { circleD } from '../people/people';
import { carbonArt, withStatic, type Shapes } from '../../engine';
import { strokeOutline } from '../../off';

/**
 * The time badges: Carbon's `<base>--time` icons (array, delivery, server,
 * train), on the status-mark system (utils/statusMark.ts).
 *
 * One time motion, Time's own: the clock's ring grows 1px in radius at its
 * 2px weight (a disc, 1px), and its minute hand turns 90° clockwise (a
 * quarter hour) about the centre, the hour hand 7.5° with it (its share),
 * mitred where they meet. The hands keep their width (Carbon's 2px; 2.25px
 * knocked out of train--time's disc). The base plays its own hover where it
 * has one, else holds.
 *
 *  - Array time: the clock inside the array's corner brackets, which move
 *    2px out on each axis (Center square's brackets).
 *  - Delivery time: Carbon's drawing is the clock itself with two speed
 *    dashes inside it, which hold (the minute hand turns away from them).
 *  - Server time: the server plays the servers' hover (Bare metal server's,
 *    Data base's: 1px wider a side at 2px, its light growing 1 → 1.5 in
 *    place). The clock holds its size; its hands still turn.
 *  - Train time: a disc with the hands knocked out; the disc and its hands
 *    grow about the disc's centre, keeping 2px above the train's side. The train holds;
 *    its roof's and roof rule's ends draw back left.
 */

/** Where a clock sits: its centre, its ring's centreline radius (a disc's radius), its hands' lengths and width. */
export interface ClockPlace {
  c: Pt;
  r: number;
  minute: number;
  hour: number;
  /** The hands' width (default 2). */
  w?: number;
  /** A disc with the hands knocked out (train--time), not a ring. */
  filled?: boolean;
  /** The ring holds (Server time); the hands still turn. */
  still?: boolean;
  /** The hands grow with the disc, from its centre (Train time). */
  handsGrow?: boolean;
  /** How far it moves at full hover, where the base needs the room. */
  drift?: Pt;
}
/** How far the ring (or disc) grows in radius at full hover. */
export const CLOCK_RING_GROW = 1;
/** Time's turns: the minute hand 90° (a quarter hour), the hour hand its share, 7.5°. */
export const MINUTE_TURN = 90;
export const HOUR_TURN = 7.5;

const centreAt = (p: ClockPlace, h: number): Pt =>
  p.drift ? [p.c[0] + p.drift[0] * h, p.c[1] + p.drift[1] * h] : p.c;
/** The ring's (disc's) radius at hover h. */
const radiusAt = (p: ClockPlace, h: number) =>
  p.r + (p.still ? 0 : CLOCK_RING_GROW * h);
/** The hands at hover h: one stroke from the minute hand's tip in to the centre and out to the hour hand's, mitred. */
function hands(p: ClockPlace, h: number): string {
  const c = centreAt(p, h);
  const t = (MINUTE_TURN * h * Math.PI) / 180;
  const th = ((135 + HOUR_TURN * h) * Math.PI) / 180;
  const k = p.handsGrow ? radiusAt(p, h) / p.r : 1;
  const minute: Pt = [
    c[0] + k * p.minute * Math.sin(t),
    c[1] - k * p.minute * Math.cos(t),
  ];
  const hour: Pt = [
    c[0] + k * p.hour * Math.sin(th),
    c[1] - k * p.hour * Math.cos(th),
  ];
  return loopD(
    strokeOutline(
      [
        { k: 'L', a: minute, b: c },
        { k: 'L', a: c, b: hour },
      ],
      p.w ?? 2
    ).open!
  );
}

/** The time mark: Time's hover, the ring 1px out at 2px and the hands turning a quarter hour. */
export const CLOCK_MARK: MarkType<ClockPlace> = {
  // A ring's hands are the mark and the ring its own part; a disc's hands are knocked out of it.
  d: (p, h) =>
    p.filled
      ? carbonCircle(centreAt(p, h), radiusAt(p, h)) + hands(p, h)
      : hands(p, h),
  parts: (p, h): Shapes =>
    p.filled
      ? {}
      : {
          ring: {
            d:
              carbonCircle(centreAt(p, h), radiusAt(p, h) + 1) +
              carbonCircle(centreAt(p, h), radiusAt(p, h) - 1, false),
          },
        },
  ink: (p, h) => {
    const [cx, cy] = centreAt(p, h);
    const R = (radiusAt(p, h) + (p.filled ? 0 : 1)) / Math.cos(Math.PI / 72);
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

type Spec = StatusMarkSpec<ClockPlace>;
/** How far each corner bracket moves out on each axis (Center square's CENTER_SQUARE_OPEN). */
const BRACKET_OPEN = 2;
/** How far a server unit widens each side (Bare metal server's UNIT_WIDEN, Data base's). */
const UNIT_WIDEN = 1;
/** Server time's light at hover h: Data base's dots' growth, 1 → 1.5 in place. */
const serverLight = (h: number) => circleD([7, 25], 1 + 0.5 * h);
const LEFT: Pt = [-1, 0];

export const ARRAY_TIME: Spec = {
  base: {
    d:
      'M4 2H8V4H4V8H2V4C2 2.8954 2.8954 2 4 2Z' +
      'M30 4V8H28V4H24V2H28C29.1046 2 30 2.8954 30 4Z' +
      'M8 28V30H4C2.8954 30 2 29.1046 2 28V24H4V28H8Z' +
      'M30 24V28C30 29.1046 29.1046 30 28 30H24V28H28V24H30Z',
    // The corner brackets move out 2px on each axis, as Center square's.
    calm: ([x, y], h) => [
      x + (x < 16 ? -1 : 1) * BRACKET_OPEN * h,
      y + (y < 16 ? -1 : 1) * BRACKET_OPEN * h,
    ],
  },
  baseMotion: 'calm',
  mark: CLOCK_MARK,
  place: { c: [16, 16], r: 9, minute: 6, hour: 4 * Math.SQRT2 },
};
export const ArrayTimeSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('ArrayTime', ARRAY_TIME),
  /* @__PURE__ */ carbonArt(ArrayTime32)
);

export const DELIVERY_TIME: Spec = {
  base: { d: 'M13 17H11V15H13V17Z' + 'M9 17H7V15H9V17Z' },
  mark: CLOCK_MARK,
  place: { c: [16, 16], r: 13, minute: 9, hour: 5 * Math.SQRT2 },
};
export const DeliveryTimeSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('DeliveryTime', DELIVERY_TIME),
  /* @__PURE__ */ carbonArt(DeliveryTime32)
);

export const SERVER_TIME: Spec = {
  base: {
    d: 'M28 30H4A2.0021 2.0021 0 0 1 2 28V22A2.0021 2.0021 0 0 1 4 20H28A2.0021 2.0021 0 0 1 30 22V28A2.0021 2.0021 0 0 1 28 30ZM4 22V28H28V22Z',
    parts: { light: serverLight(0) },
    partsAt: (h) => ({ light: serverLight(h) }),
    // The servers' hover (Bare metal
    // server's, Data base's): the unit widens 1px a side at 2px, its light growing 1 → 1.5 in place.
    calm: ([x, y], h) => [x + (x < 16 ? -UNIT_WIDEN : UNIT_WIDEN) * h, y],
  },
  baseMotion: 'calm',
  mark: CLOCK_MARK,
  // The clock holds its size; its hands still turn.
  place: {
    c: [16, 10],
    r: 7,
    minute: 4,
    hour: 2.293 * Math.SQRT2,
    still: true,
  },
};
export const ServerTimeSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('ServerTime', SERVER_TIME),
  /* @__PURE__ */ carbonArt(ServerTime32)
);

export const TRAIN_TIME: Spec = {
  base: {
    d:
      'M6 16V10H15V8H6.1843A2.9948 2.9948 0 0 1 9 6H15V4H9A5.0057 5.0057 0 0 0 4 9V21A4.99 4.99 0 0 0 7.582 25.77L5.7693 30H7.9451L9.6594 26H18.3406L20.0549 30H22.2307L20.418 25.77A4.99 4.99 0 0 0 24 21V16Z' +
      'M22 20H19V22H21.8157A2.9948 2.9948 0 0 1 19 24H9A2.9948 2.9948 0 0 1 6.1843 22H9V20H6V18H22Z',
    ends: [
      {
        at: [
          [15, 10],
          [15, 8],
        ],
        back: LEFT,
      },
      {
        at: [
          [15, 6],
          [15, 4],
        ],
        back: LEFT,
      },
    ],
  },
  mark: CLOCK_MARK,
  // The disc and its hands grow about the disc's centre,
  // which holds (it keeps 2px above the train's side).
  place: {
    c: [24, 7],
    r: 6,
    minute: 4,
    hour: 2.29 * Math.SQRT2,
    w: 2.25,
    filled: true,
    handsGrow: true,
  },
};
export const TrainTimeSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('TrainTime', TRAIN_TIME),
  /* @__PURE__ */ carbonArt(TrainTime32)
);
