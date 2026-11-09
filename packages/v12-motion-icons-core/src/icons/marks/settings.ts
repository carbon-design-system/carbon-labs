/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CalendarSettings32 from '@carbon/icons/es/calendar--settings/32.js';
import PhoneSettings32 from '@carbon/icons/es/phone--settings/32.js';
import TaskSettings32 from '@carbon/icons/es/task--settings/32.js';
import UserSettings32 from '@carbon/icons/es/user--settings/32.js';
import {
  loopD,
  makeStatusMarkIcon,
  type MarkType,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import { mapPath, pathPoints, type Pt } from '../../geometry';
import { f } from '../../paint';
import { carbonArt, withStatic } from '../../engine';
import { calendarCalm } from './bases';
import { inkSides, weightScaleLoops } from '../assorted/peopleMoney';
import { grown, personShapes, type Person } from '../people/people';
import { SETTINGS_HOVER } from '../controls/Settings';

/**
 * The settings family: Carbon's `<base>--settings` badges on the status-mark
 * system (utils/statusMark.ts), as the add family. Carbon has one drawing of
 * each for every size.
 *
 * The mark is Carbon's small cog (eight teeth about a ring). Its hover is
 * Settings', made more apparent for the mark: the cog turns a full tooth pitch
 * clockwise (45°: eight teeth, 45° apart), on Settings' own mechanical curve
 * ([0.8, 0, 0.2, 1], 220ms (moderate-02), leaving on the same curve), so it spins up like a
 * motor and stops dead a tooth on, and it grows 0.5px in radius as it turns.
 * The growth is per part, not a scale: the window grows 0.5px in radius, the
 * ring's outside 0.5px with it (its 2px wall held), and each tooth slides
 * 0.5px out along its own axis (its 2px width held). The turn is rigid (each
 * point rotated, no transform). The window turns with nothing: it's a
 * circle and looks the same at any angle.
 *
 * The base holds; its open ends draw back just enough that the space
 * between each end and the turning teeth holds at its resting width (a
 * tooth's corner swings at most 0.07px further out than its face).
 */

/**
 * Where a cog sits: its centre (it turns about it, and never moves), Carbon's drawing (the toothed outline, then the window), the
 * radii of its window and its ring's outside, and, where the base leaves it
 * less room, how far it grows (default COG_GROW).
 */
export interface CogPlace {
  c: Pt;
  d: string;
  window: number;
  ring: number;
  grow?: number;
}
/** How far the cog turns at full hover: a full tooth pitch, clockwise on screen. */
export const COG_TURN = 45;
/** How far the cog grows in radius at full hover (window, ring and teeth alike). */
export const COG_GROW = 0.5;
const STEP = Math.PI / 4;
/** The cog's centre at hover h: it turns in place. */
export const cogCentre = (p: CogPlace, h: number): Pt => (void h, p.c);
/** How far a cog grows at full hover. */
export const cogGrow = (p: CogPlace) => p.grow ?? COG_GROW;
const turned = (p: CogPlace, h: number): [string, string] => {
  const [outline, window] = p.d.split(/(?=M)/);
  if (h <= 0) {
    return [outline, window];
  }
  const a = (COG_TURN * h * Math.PI) / 180;
  const g = cogGrow(p) * h;
  const [cos, sin] = [Math.cos(a), Math.sin(a)];
  const [cx, cy] = p.c;
  const [nx, ny] = cogCentre(p, h);
  const move = ([x, y]: Pt): Pt => {
    // Out along the axis of the tooth the point belongs to (every point sits within 22.5° of one), then turned.
    const axis = Math.round(Math.atan2(y - cy, x - cx) / STEP) * STEP;
    const [dx, dy] = [x - cx + g * Math.cos(axis), y - cy + g * Math.sin(axis)];
    return [nx + dx * cos - dy * sin, ny + dx * sin + dy * cos];
  };
  const r = p.window + g;
  const P = (x: number, y: number) => `${f(x)} ${f(y)}`;
  return [
    mapPath(outline, move, (p.ring + g) / p.ring),
    `M${P(nx, ny + r)}A${f(r)} ${f(r)} 0 1 1 ${P(nx + r, ny)}A${f(r)} ${f(r)} 0 0 1 ${P(nx, ny + r)}Z`,
  ];
};

/** The settings mark: Settings' turn, a full tooth pitch on its mechanical curve, the cog growing 0.5px. */
export const COG: MarkType<CogPlace> = {
  d: (p, h) => turned(p, h).join(''),
  ink: (p, h) => [pathPoints(turned(p, h)[0], 0.25)],
  timing: { hover: SETTINGS_HOVER, leave: SETTINGS_HOVER },
};

type Spec = StatusMarkSpec<CogPlace>;
const UP: Pt = [0, -1];
const LEFT: Pt = [-1, 0];

// Carbon's small cog (task, phone and user settings): eight 2px teeth on a ring, its window r 3.
const smallCog = ([cx, cy]: Pt, grow?: number): CogPlace => ({
  c: [cx, cy],
  window: 3,
  ring: 4.9678,
  ...(grow !== undefined && { grow }),
  d: /* @__PURE__ */ mapPath(
    'M30 24V22H27.8989A4.9678 4.9678 0 0 0 27.167 20.2471L28.657 18.7571L27.243 17.3431L25.753 18.8331A4.9678 4.9678 0 0 0 24 18.1011V16H22V18.1011A4.9678 4.9678 0 0 0 20.2471 18.833L18.7571 17.343L17.3431 18.757L18.8331 20.247A4.9678 4.9678 0 0 0 18.1011 22H16V24H18.1011A4.9678 4.9678 0 0 0 18.833 25.7529L17.343 27.2429L18.757 28.6569L20.247 27.1669A4.9678 4.9678 0 0 0 22 27.8989V30H24V27.8989A4.9678 4.9678 0 0 0 25.7529 27.167L27.2429 28.657L28.6569 27.243L27.1669 25.753A4.9678 4.9678 0 0 0 27.8989 24Z' +
      'M23 26A3 3 0 1 1 26 23A3.0033 3.0033 0 0 1 23 26Z',
    ([x, y]) => [x + cx - 23, y + cy - 23]
  ),
});

// Calendar's page as the badge draws it; Carbon's larger cog (its rays reach 8, its window r 4).
export const CALENDAR_SETTINGS: Spec = {
  base: {
    d: 'M28 6A2 2 0 0 0 26 4H22V2H20V4H12V2H10V4H6A2 2 0 0 0 4 6V26A2 2 0 0 0 6 28H10V26H6V6H10V8H12V6H20V8H22V6H26V12H28Z',
    ends: [
      {
        at: [
          [26, 12],
          [28, 12],
        ],
        back: UP,
      },
      {
        at: [
          [10, 28],
          [10, 26],
        ],
        back: LEFT,
      },
    ],
    // Calendar's hover: the page grows 2px a side, its rings 1px further apart.
    calm: calendarCalm,
  },
  baseMotion: 'calm',
  mark: COG,
  place: {
    c: [22, 22],
    window: 4,
    ring: 5.9592,
    d:
      'M30 23V21H27.91A5.9592 5.9592 0 0 0 26.8856 18.5293L28.364 17.05L26.95 15.6362L25.4712 17.1147A5.9584 5.9584 0 0 0 23 16.09V14H21V16.09A5.9584 5.9584 0 0 0 18.5291 17.1144L17.05 15.6362L15.636 17.05L17.1147 18.529A5.9618 5.9618 0 0 0 16.09 21H14V23H16.09A5.9618 5.9618 0 0 0 17.1144 25.4707L15.636 26.95L17.05 28.3638L18.5288 26.8853A5.9584 5.9584 0 0 0 21 27.91V30H23V27.91A5.9584 5.9584 0 0 0 25.4709 26.8856L26.95 28.3638L28.364 26.95L26.8853 25.471A5.9592 5.9592 0 0 0 27.91 23Z' +
      'M22 26A4 4 0 1 1 26 22A4.0045 4.0045 0 0 1 22 26Z',
  },
};
export const CalendarSettingsSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('CalendarSettings', CALENDAR_SETTINGS),
  /* @__PURE__ */ carbonArt(CalendarSettings32)
);

// The phone whole: Carbon doesn't cut it for the cog, and nothing ever
// does. Phone's hover: the handset grows 1px out on every side at constant
// weight (26 → 28 across, about its middle (15, 17)), as Phone's does.
const PHONE_D =
  'M25 30H24.83C5.18 28.87 2.39 12.29 2 7.23A3 3 0 0 1 4.7611 4.0088Q4.88 4 5 4H10.27A2 2 0 0 1 12.13 5.26L13.65 9A2 2 0 0 1 13.21 11.16L11.08 13.31A9.36 9.36 0 0 0 18.66 20.91L20.83 18.76A2 2 0 0 1 23 18.35L26.77 19.86A2 2 0 0 1 28 21.72V27A3 3 0 0 1 25 30Z' +
  'M5 6A1 1 0 0 0 3.9968 6.9968C3.9968 7.0246 3.9978 7.0523 4 7.08C4.46 13 7.41 27 24.94 28A1 1 0 0 0 25.9981 27.0618Q26 27.0309 26 27V21.72L22.23 20.21L19.36 23.06L18.88 23C10.18 21.91 9 13.21 9 13.12L8.94 12.64L11.78 9.77L10.28 6Z';
// Sampled (its two quadratic corners as the cubics they are: pathPoints reads no Q).
const PHONE_LOOPS = /* @__PURE__ */ PHONE_D.replace(
  'Q4.88 4 5 4',
  'C4.9204 4.0029 4.92 4 5 4'
)
  .replace('Q26 27.0309 26 27', 'C25.9994 27.0412 26 27.0206 26 27')
  .split(/(?=M)/)
  .map((sub) => pathPoints(sub, 0.1));
const PHONE_LOOP_SIDES = /* @__PURE__ */ inkSides(PHONE_LOOPS);
/** The handset at hover h. */
function phoneAt(h: number): string {
  return weightScaleLoops(
    PHONE_LOOPS,
    PHONE_LOOP_SIDES,
    [15, 17],
    1 + (2 / 26) * h
  )
    .map(loopD)
    .join('');
}
/**
 * How far Phone settings' cog grows: as far as keeps 2px to the growing
 * handset (0.3px: 2.02px at the closest; the set's 0.5px would close it to
 * 1.84px, and no growth leaves 2.17px).
 */
export const PHONE_COG_GROW = 0.3;
export const PHONE_SETTINGS: Spec = {
  base: { d: PHONE_D, evenodd: true, at: phoneAt },
  mark: COG,
  place: /* @__PURE__ */ smallCog([23, 9], PHONE_COG_GROW),
};
export const PhoneSettingsSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('PhoneSettings', PHONE_SETTINGS),
  /* @__PURE__ */ carbonArt(PhoneSettings32)
);

export const TASK_SETTINGS: Spec = {
  base: {
    d: 'M25 5H22V4A2.0058 2.0058 0 0 0 20 2H12A2.0058 2.0058 0 0 0 10 4V5H7A2.0058 2.0058 0 0 0 5 7V28A2.0058 2.0058 0 0 0 7 30H14V28H7V7H10V10H22V7H25V13H27V7A2.0058 2.0058 0 0 0 25 5ZM20 8H12V4H20Z',
    ends: [
      {
        at: [
          [25, 13],
          [27, 13],
        ],
        back: UP,
      },
      {
        at: [
          [14, 30],
          [14, 28],
        ],
        back: LEFT,
      },
    ],
  },
  mark: COG,
  place: /* @__PURE__ */ smallCog([23, 23]),
};
export const TaskSettingsSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('TaskSettings', TASK_SETTINGS),
  /* @__PURE__ */ carbonArt(TaskSettings32)
);

// User as the badge draws it: the person to the left, the cog clear of
// them. A person beside a mark does what User follow's does (the people
// family): the shoulders 2px wider, the head 1px larger, and the whole person
// 1px left, so the space to the mark holds.
const USER_PERSON: Person = {
  head: [9, 13],
  hr: 4,
  body: [
    [3, 30],
    [3, 21],
    [15, 21],
    [15, 30],
  ],
  r: 4,
};
/** The person at hover h. */
function userAt(h: number): string {
  const s = personShapes('p', grown(USER_PERSON, h, [-h, 0]));
  return String(s.pHead.d) + String(s.pBody.d);
}
/** How far User settings' cog grows: the set's 0.5px (2.35px to the person at the closest). */
export const USER_COG_GROW = 0.5;
export const USER_SETTINGS: Spec = {
  base: {
    d:
      'M9 10A3 3 0 1 1 6 13A3 3 0 0 1 9 10M9 8A5 5 0 1 0 14 13A5 5 0 0 0 9 8Z' +
      'M16 30H14V25A3.0033 3.0033 0 0 0 11 22H7A3.0033 3.0033 0 0 0 4 25V30H2V25A5.0059 5.0059 0 0 1 7 20H11A5.0059 5.0059 0 0 1 16 25Z',
    evenodd: true,
    at: userAt,
  },
  mark: COG,
  place: /* @__PURE__ */ smallCog([23, 9], USER_COG_GROW),
};
export const UserSettingsSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('UserSettings', USER_SETTINGS),
  /* @__PURE__ */ carbonArt(UserSettings32)
);
