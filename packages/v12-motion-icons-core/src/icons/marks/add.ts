/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import DocumentAdd32 from '@carbon/icons/es/document--add/32.js';
import FolderAdd32 from '@carbon/icons/es/folder--add/32.js';
import TaskAdd32 from '@carbon/icons/es/task--add/32.js';
import MobileAdd32 from '@carbon/icons/es/mobile--add/32.js';
import CalendarAdd32 from '@carbon/icons/es/calendar--add/32.js';
import DataAdd32 from '@carbon/icons/es/data--add/32.js';
import FaceAdd32 from '@carbon/icons/es/face--add/32.js';
import FaceActivatedAdd32 from '@carbon/icons/es/face--activated--add/32.js';
import MusicAdd32 from '@carbon/icons/es/music--add/32.js';
import DeliveryAdd32 from '@carbon/icons/es/delivery--add/32.js';
import TableAdd32 from '@carbon/icons/es/table--add/32.js';
import VideoAdd32 from '@carbon/icons/es/video--add/32.js';
import AlarmAdd32 from '@carbon/icons/es/alarm--add/32.js';
import ShoppingCartPlus32 from '@carbon/icons/es/shopping--cart--plus/32.js';
import PillsAdd32 from '@carbon/icons/es/pills--add/32.js';
import DataEnrichmentAdd32 from '@carbon/icons/es/data-enrichment--add/32.js';
import CalendarAddAlt32 from '@carbon/icons/es/calendar--add--alt/32.js';
import {
  loopD,
  makeStatusMarkIcon,
  PLUS,
  PLUS_ALT,
  type PlusAltPlace,
  type PlusPlace,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import { pathPoints, type Pt } from '../../geometry';
import { inkSides, weightScaleLoops } from '../assorted/peopleMoney';
import { f } from '../../paint';
import { carbonArt, withStatic } from '../../engine';
import {
  calendarCalm,
  cartCalm,
  CLOCK,
  clockAt,
  dataCalm,
  dataDots,
  documentFold,
  faceArc,
  faceCalm,
  faceParts,
  folderCalm,
  mobileCalm,
  tableCalm,
  videoCalm,
} from './bases';

/**
 * The add family: every Carbon `<base>--add` (and `--plus`) whose base is a
 * Carbon icon, built on the status-mark system (utils/statusMark.ts). Carbon
 * has one drawing of each for every size, so one geometry serves 16–32px.
 *
 * The rule: the mark carries the hover, the base holds. The plus takes
 * Add's hover: each arm end reaches 2px (the set's reach), its 2px width
 * holding; a small plus (arms 4px or less) reaches 1px. Where Carbon cuts
 * the base for the plus, the cut's open ends draw back along their walls
 * (round the ring, for the faces) by just enough that the space between
 * each end and the plus holds at its resting width, as Bookmark add's
 * open corner does. Where the plus sits inside the base, it reaches only as
 * far as keeps it 2px clear of the walls around it.
 *
 *  - Document add, Folder add, Task add, Mobile add, Calendar add, Data add:
 *    (Folder add's walls stop 4px from the plus, as Document add's, not
 *    Carbon's 2px: see FOLDER_ADD.)
 *    the plus in the bottom-right corner; the right wall's end draws up and
 *    the bottom wall's end draws left (Data add: its middle rule's end too).
 *    Calendar add's plus is Carbon's large one (arms 7).
 *  - Face add, Face activated add: the plus at the top right; the face's
 *    ring ends draw back round the ring. The right eye sits 2.44px from
 *    the plus's lower arm and holds, so the plus drifts 1px right (away
 *    from it) as it grows, keeping 2.2px; growing in place would bring it
 *    to 1.3px.
 *  - Music add: the plus at the top right; the beam's end draws left and
 *    the right stem's top draws down.
 *  - Delivery add: the plus at the top left; the roof's end draws right and
 *    the back wall's top draws down.
 *  - Table add: the plus at the bottom left; the left wall's end draws up.
 *    The divider beside the plus can't draw back (the plus faces its side),
 *    so the plus reaches 1px: 2px would leave 1px to it.
 *  - Video add: the plus inside the camera's body, 3px from its walls:
 *    reaches 1px, so 2px clear.
 *  - Alarm add: the plus inside the clock face (4px from the ring): 1.93px,
 *    so its arm ends' corners stay 2px inside the ring.
 *  - Shopping cart plus: the plus in the cart's open top: 2px.
 *  - Pills add: the round pill's ring grows 1.1px in radius (its 2px
 *    weight held, the capsule's lower hollow giving way), so the small plus
 *    inside it reaches the set's 2px, its corners 2px inside the ring.
 *  - Data enrichment add: a small plus inside the bulb: 1px.
 *  - Calendar add alt: a circled plus (Add alt's hover, small): the ring
 *    grows 1px in radius and the arms reach 1px, so the 2px inside the ring
 *    holds; the calendar's open ends draw back from the ring.
 *
 * Shipped before this system, and left as they are (see the report):
 * Bookmark add, Add comment, User follow.
 */

type Spec = StatusMarkSpec<PlusPlace>;
const UP: Pt = [0, -1];
const DOWN: Pt = [0, 1];
const LEFT: Pt = [-1, 0];
const RIGHT: Pt = [1, 0];

// ── Corner pluses: Carbon's base, cut at the corner ─────────────────────────

// Document's page as the badge draws it (document--blank's): no text lines.
const DOCUMENT_PAGE =
  'M16 28H8V4H16V10A2.0058 2.0058 0 0 0 18 12H24V16H26V10A0.9092 0.9092 0 0 0 25.7 9.3L18.7 2.3A0.9087 0.9087 0 0 0 18 2H8A2.0058 2.0058 0 0 0 6 4V28A2.0058 2.0058 0 0 0 8 30H16ZM18 4.4L23.6 10H18Z';
export const DOCUMENT_ADD: Spec = {
  base: {
    d: DOCUMENT_PAGE,
    ends: [
      {
        at: [
          [24, 16],
          [26, 16],
        ],
        back: UP,
      },
      {
        at: [
          [16, 28],
          [16, 30],
        ],
        back: LEFT,
      },
    ],
    // The fold folds down 2px (Document's corner, the page holding).
    calm: documentFold,
  },
  baseMotion: 'calm',
  mark: PLUS,
  place: { c: [25, 25], arm: 5 },
};
export const DocumentAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('DocumentAdd', DOCUMENT_ADD),
  /* @__PURE__ */ carbonArt(DocumentAdd32)
);

// Folder add departs from Carbon. Carbon stops its walls 2px from the plus's box (x 18, y 18),
// the tightest of the corner pluses, with neither wall in line with an arm:
// the bottom wall's top edge runs flush with the arm's underside, 2px from
// its end. Here the walls stop 4px from the plus's box, at x 16 and y 16,
// as Document add's and Task add's do (gaps 4.47 / 4.00).
export const FOLDER_ADD: Spec = {
  base: {
    // Folder's hover: every edge 2px out, the tab with it.
    calm: folderCalm,
    d: 'M28 8H16L12.6 4.6C12.2 4.2 11.7 4 11.2 4H4C2.9 4 2 4.9 2 6V26C2 27.1 2.9 28 4 28H16V26H4V6H11.2L14.6 9.4L15.2 10H28V16H30V10C30 8.9 29.1 8 28 8Z',
    ends: [
      {
        at: [
          [28, 16],
          [30, 16],
        ],
        back: UP,
      },
      {
        at: [
          [16, 26],
          [16, 28],
        ],
        back: LEFT,
      },
    ],
  },
  baseMotion: 'calm',
  mark: PLUS,
  place: { c: [25, 25], arm: 5 },
};
export const FolderAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('FolderAdd', FOLDER_ADD),
  /* @__PURE__ */ carbonArt(FolderAdd32)
);

// Task's board without its check (the badge's drawing).
export const TASK_ADD: Spec = {
  base: {
    d: 'M25 5H22V4A2.0058 2.0058 0 0 0 20 2H12A2.0058 2.0058 0 0 0 10 4V5H7A2.0058 2.0058 0 0 0 5 7V28A2.0058 2.0058 0 0 0 7 30H17V28H7V7H10V10H22V7H25V16H27V7A2.0058 2.0058 0 0 0 25 5ZM20 8H12V4H20Z',
    ends: [
      {
        at: [
          [25, 16],
          [27, 16],
        ],
        back: UP,
      },
      {
        at: [
          [17, 28],
          [17, 30],
        ],
        back: LEFT,
      },
    ],
  },
  mark: PLUS,
  place: { c: [26, 25], arm: 5 },
};
export const TaskAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('TaskAdd', TASK_ADD),
  /* @__PURE__ */ carbonArt(TaskAdd32)
);

export const MOBILE_ADD: Spec = {
  base: {
    // Mobile's hover: the case grows 1px a side.
    calm: /* @__PURE__ */ mobileCalm(10, 28),
    d: 'M10 28V10H22V17H24V6A2.0023 2.0023 0 0 0 22 4H10A2.002 2.002 0 0 0 8 6V28A2.0023 2.0023 0 0 0 10 30H16L16 28ZM10 6H22L22 8H10Z',
    ends: [
      {
        at: [
          [22, 17],
          [24, 17],
        ],
        back: UP,
      },
      {
        at: [
          [16, 28],
          [16, 30],
        ],
        back: LEFT,
      },
    ],
  },
  baseMotion: 'calm',
  mark: PLUS,
  place: { c: [23, 25], arm: 5 },
};
export const MobileAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('MobileAdd', MOBILE_ADD),
  /* @__PURE__ */ carbonArt(MobileAdd32)
);

// Calendar's page as the badge draws it: no header rule; Carbon's large plus.
export const CALENDAR_ADD: Spec = {
  base: {
    // Calendar's hover: the page grows 2px a side, its rings 1px further apart.
    calm: calendarCalm,
    d: 'M28 6C28 4.9 27.1 4 26 4H22V2H20V4H12V2H10V4H6C4.9 4 4 4.9 4 6V26C4 27.1 4.9 28 6 28H14V26H6V6H10V8H12V6H20V8H22V6H26V14H28V6Z',
    ends: [
      {
        at: [
          [26, 14],
          [28, 14],
        ],
        back: UP,
      },
      {
        at: [
          [14, 26],
          [14, 28],
        ],
        back: LEFT,
      },
    ],
  },
  baseMotion: 'calm',
  mark: PLUS,
  place: { c: [23, 23], arm: 7 },
};
export const CalendarAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('CalendarAdd', CALENDAR_ADD),
  /* @__PURE__ */ carbonArt(CalendarAdd32)
);

// Data base as the badge draws it: 2px left of Data base, the rows' right
// ends cut for the plus. The dots hold.
export const DATA_ADD: Spec = {
  base: {
    // Data base's hover: the case widens 1px a side, the dots grow.
    calm: /* @__PURE__ */ dataCalm(14),
    partsAt: (h) => ({ dots: dataDots(9, h) }),
    d: 'M15 27H6V21H15V19H6V13H22V16H24V5C24 3.897 23.1025 3 22 3H6C4.897 3 4 3.897 4 5V27C4 28.1025 4.897 29 6 29H15V27ZM6 5H22V11H6V5Z',
    ends: [
      {
        at: [
          [22, 16],
          [24, 16],
        ],
        back: UP,
      },
      {
        at: [
          [15, 19],
          [15, 21],
        ],
        back: LEFT,
      },
      {
        at: [
          [15, 27],
          [15, 29],
        ],
        back: LEFT,
      },
    ],
    parts: {
      dots:
        'M9 9C8.4477 9 8 8.5523 8 8C8 7.4477 8.4477 7 9 7C9.5523 7 10 7.4477 10 8C10 8.5523 9.5523 9 9 9Z' +
        'M10 16C10 15.4477 9.5523 15 9 15C8.4477 15 8 15.4477 8 16C8 16.5523 8.4477 17 9 17C9.5523 17 10 16.5523 10 16Z' +
        'M10 24C10 23.4477 9.5523 23 9 23C8.4477 23 8 23.4477 8 24C8 24.5523 8.4477 25 9 25C9.5523 25 10 24.5523 10 24Z',
    },
  },
  baseMotion: 'calm',
  mark: PLUS,
  place: { c: [23, 24], arm: 5 },
};
export const DataAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('DataAdd', DATA_ADD),
  /* @__PURE__ */ carbonArt(DataAdd32)
);

// ── Faces: the ring's ends draw back round the ring ──────────────────────────

const FACE_C: Pt = [16, 16];
/**
 * The faces' plus grows from its centre and moves up: its arms reach evenly from its centre, 0.6px, as it rises 1.4px, so
 * it stays 2px clear of the right eye as the eye rises (Face satisfied's
 * hover lifts it 1.47px) and its top arm stays inside the 36px hover box
 * (reach + rise ≤ 2). Face activated add's plus does the same.
 */
export const FACE_PLUS: PlusPlace = {
  c: [25, 5],
  arm: 5,
  reach: 0.6,
  drift: [0, -1.4],
};
const EYES =
  'M11.5 11A2.5 2.5 0 1 0 14 13.5A2.48 2.48 0 0 0 11.5 11Z' +
  'M20.5 11A2.5 2.5 0 1 0 23 13.5A2.48 2.48 0 0 0 20.5 11Z';
export const FACE_ADD: Spec = {
  base: {
    // Face satisfied's hover: the ring grows 1px, the smile's ends sweep 2px round, the eyes rise.
    calm: faceCalm,
    calmArc: faceArc,
    partsAt: faceParts,
    d: 'M27.61 13A12.33 12.33 0 0 1 28 16A12 12 0 1 1 16 4V2A14 14 0 1 0 29.67 13Z',
    ends: [
      {
        at: [
          [16, 4],
          [16, 2],
        ],
        back: { c: FACE_C, turn: -1 },
      },
      {
        at: [
          [27.61, 13],
          [29.67, 13],
        ],
        back: { c: FACE_C, turn: 1 },
      },
    ],
    parts: {
      eyes: EYES,
      smile:
        'M16 22A6 6 0 0 1 10.86 19.08L9.15 20.08A8 8 0 0 0 22.85 20.08L21.14 19.08A6 6 0 0 1 16 22Z',
    },
  },
  baseMotion: 'calm',
  mark: PLUS,
  place: FACE_PLUS,
};
export const FaceAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('FaceAdd', FACE_ADD),
  /* @__PURE__ */ carbonArt(FaceAdd32)
);

export const FACE_ACTIVATED_ADD: Spec = {
  base: {
    d: 'M27.82 14A12 12 0 1 1 16 4V2A14 14 0 1 0 30 16A14.71 14.71 0 0 0 29.84 14Z',
    ends: [
      {
        at: [
          [16, 4],
          [16, 2],
        ],
        back: { c: FACE_C, turn: -1 },
      },
      {
        at: [
          [27.82, 14],
          [29.84, 14],
        ],
        back: { c: FACE_C, turn: 1 },
      },
    ],
    parts: { eyes: EYES, smile: 'M9 20A8.13 8.13 0 0 0 23 20Z' },
  },
  mark: PLUS,
  place: FACE_PLUS,
};
export const FaceActivatedAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('FaceActivatedAdd', FACE_ACTIVATED_ADD),
  /* @__PURE__ */ carbonArt(FaceActivatedAdd32)
);

// ── Other corners ────────────────────────────────────────────────────────────

// Music as the badge draws it: two notes, the beam stopping short of the plus.
export const MUSIC_ADD: Spec = {
  base: {
    d:
      'M24 15V22.5562A3.9552 3.9552 0 0 0 22 22A4 4 0 1 0 26 26V15ZM22 28A2 2 0 1 1 24 26A2.0027 2.0027 0 0 1 22 28Z' +
      'M17 6H10A2.002 2.002 0 0 0 8 8V22.5562A3.9557 3.9557 0 0 0 6 22A4 4 0 1 0 10 26V8H17ZM6 28A2 2 0 1 1 8 26A2.0023 2.0023 0 0 1 6 28Z',
    ends: [
      {
        at: [
          [24, 15],
          [26, 15],
        ],
        back: DOWN,
      },
      {
        at: [
          [17, 6],
          [17, 8],
        ],
        back: LEFT,
      },
    ],
  },
  mark: PLUS,
  place: { c: [25, 7], arm: 5 },
};
export const MusicAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('MusicAdd', MUSIC_ADD),
  /* @__PURE__ */ carbonArt(MusicAdd32)
);

// Delivery's truck as the badge draws it: no speed lines; the roof starts
// right of the plus and the back wall below it.
export const DELIVERY_ADD: Spec = {
  base: {
    d:
      'M29.9189 16.6064L26.9189 9.6064A0.9985 0.9985 0 0 0 26 9H23V7A1 1 0 0 0 22 6H15V8H21V20.5562A3.9924 3.9924 0 0 0 19.1421 23H12.8579A3.9806 3.9806 0 0 0 5.1421 23H4V14H2V24A1 1 0 0 0 3 25H5.1421A3.9806 3.9806 0 0 0 12.8579 25H19.1421A3.9806 3.9806 0 0 0 26.8579 25H29A1 1 0 0 0 30 24V17A0.9965 0.9965 0 0 0 29.9189 16.6064Z' +
      'M9 26A2 2 0 1 1 11 24A2.0027 2.0027 0 0 1 9 26ZM23 11H25.3408L27.4839 16H23ZM23 26A2 2 0 1 1 25 24A2.0023 2.0023 0 0 1 23 26ZM28 23H26.8579A3.9954 3.9954 0 0 0 23 20V18H28Z',
    ends: [
      {
        at: [
          [15, 6],
          [15, 8],
        ],
        back: RIGHT,
      },
      {
        at: [
          [4, 14],
          [2, 14],
        ],
        back: DOWN,
      },
    ],
  },
  mark: PLUS,
  place: { c: [7, 7], arm: 5 },
};
export const DeliveryAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('DeliveryAdd', DELIVERY_ADD),
  /* @__PURE__ */ carbonArt(DeliveryAdd32)
);

// Table as the badge draws it: the header and one column of rows at the
// right; the plus at the bottom left, beside the divider.
export const TABLE_ADD: Spec = {
  base: {
    // Table's hover: the side walls move 1px out; the top, the bottom and the rules hold.
    calm: tableCalm,
    d: 'M27 3H5C3.9 3 3 3.9 3 5V17H5V11H15V29H17V11H27V18H17V20H27V27H17V29H27C28.1 29 29 28.1 29 27V5C29 3.9 28.1 3 27 3ZM27 9H5V5H27V9Z',
    ends: [
      {
        at: [
          [3, 17],
          [5, 17],
        ],
        back: UP,
      },
    ],
  },
  baseMotion: 'calm',
  mark: PLUS,
  // The divider (x 15) is 3px from the arm's end and faces its side: 1px keeps 2px clear.
  place: { c: [7, 25], arm: 5, reach: 1 },
};
export const TableAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('TableAdd', TABLE_ADD),
  /* @__PURE__ */ carbonArt(TableAdd32)
);

// ── Pluses inside the base ───────────────────────────────────────────────────

export const VIDEO_ADD: Spec = {
  base: {
    // Video's hover: the lens reaches 2px out and opens 2px.
    calm: videoCalm,
    d:
      'M21 26H4A2.0023 2.0023 0 0 1 2 24V8A2.0023 2.0023 0 0 1 4 6H21A2.0023 2.0023 0 0 1 23 8V12.0566L28.4189 8.1866A0.9995 0.9995 0 0 1 30 9V23A0.9995 0.9995 0 0 1 28.4189 23.8135L23 19.9434V24A2.0023 2.0023 0 0 1 21 26Z' +
      'M4 8V24.001L21 24V18A0.9995 0.9995 0 0 1 22.5811 17.1865L28 21.0566V10.9434L22.5811 14.8134A0.9995 0.9995 0 0 1 21 14V8Z',
  },
  baseMotion: 'calm',
  mark: PLUS,
  // 3px from the body's walls (4px from its left): 1px keeps 2px clear.
  place: { c: [13, 16], arm: 5, reach: 1 },
};
export const VideoAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('VideoAdd', VIDEO_ADD),
  /* @__PURE__ */ carbonArt(VideoAdd32)
);

export const ALARM_ADD: Spec = {
  // The clock grows as Alarm subtract's: its ring 1px in radius, the bells 1px out.
  base: { d: CLOCK, at: clockAt },
  mark: PLUS,
  // 4px inside the ring at rest; the ring grows 1px, so the plus takes the set's 2px with its corners 2px inside it.
  place: { c: [16, 17], arm: 5, reach: 2 },
};
export const AlarmAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('AlarmAdd', ALARM_ADD),
  /* @__PURE__ */ carbonArt(AlarmAdd32)
);

export const SHOPPING_CART_PLUS: Spec = {
  base: {
    // Shopping cart's hover: the basket grows 9% from its lower left.
    calm: cartCalm,
    d: 'M4.9806 2.8039A1 1 0 0 0 4 2H0V4H3.18L7.0194 23.1961A1 1 0 0 0 8 24H26V22H8.82L8.02 18H26A1 1 0 0 0 26.9762 17.217L29.2445 7H27.1971L25.1982 16H7.62Z',
    parts: {
      wheels:
        'M8 28A2 2 0 1 0 12 28A2 2 0 1 0 8 28Z' +
        'M22 28A2 2 0 1 0 26 28A2 2 0 1 0 22 28Z',
    },
  },
  baseMotion: 'calm',
  mark: PLUS,
  // The basket's floor rises 0.54px with Shopping cart's hover: the plus rises 0.6px as it reaches, keeping 2px to it.
  place: { c: [17, 7], arm: 5, drift: [0, -0.6] },
};
export const ShoppingCartPlusSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('ShoppingCartPlus', SHOPPING_CART_PLUS),
  /* @__PURE__ */ carbonArt(ShoppingCartPlus32)
);

// Pills add: the round pill's 2px ring grows PILL_GROW in radius about its
// centre (inside 6 → 7.1, outside 8 → 9.1), so the plus reaches the set's
// 2px (arms 3 → 5) with its arm ends' corners 2px inside the ring (2.84px
// at rest). The ring is also the wall between the round pill and the
// capsule's lower half, so that half's hollow gives way by the same, and
// the outline meets the larger circle where the capsule crosses it.
const PILL_C: Pt = [22, 22];
/** How far the round pill grows in radius: just enough for 2px round the 2px-reach plus. */
export const PILL_GROW = Math.hypot(3 + 2, 1) + 2 - 6;
/** Where circle (c, r) meets circle (q, s): the point with the larger y. */
function meetLow([cx, cy]: Pt, r: number, [qx, qy]: Pt, s: number): Pt {
  const [dx, dy] = [qx - cx, qy - cy];
  const d = Math.hypot(dx, dy);
  const a = (r * r - s * s + d * d) / (2 * d);
  const k = Math.sqrt(r * r - a * a);
  const [mx, my] = [cx + (dx * a) / d, cy + (dy * a) / d];
  const p: Pt = [mx - (dy * k) / d, my + (dx * k) / d];
  const q: Pt = [mx + (dy * k) / d, my - (dx * k) / d];
  return p[1] > q[1] ? p : q;
}
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
/** The pills at hover h: Carbon's drawing, the round pill's ring grown about its centre. */
function pillsAt(h: number): string {
  const [ro, ri] = [8 + PILL_GROW * h, 6 + PILL_GROW * h];
  const [cx, cy] = PILL_C;
  const top: Pt = [cx, cy - ro];
  const side: Pt = [18, cy - Math.sqrt(ro * ro - 16)]; // the capsule's right side meets the circle
  const low = meetLow(PILL_C, ro, [11, 23], 7); // the capsule's bottom arc meets it
  const holeTop: Pt = [cx - Math.sqrt(ro * ro - 25), 17]; // the lower hollow's top edge meets it
  const holeLow = meetLow(PILL_C, ro, [11, 23], 5); // the lower hollow's bottom arc meets it
  return (
    `M${P(top)}A${f(ro)} ${f(ro)} 0 0 0 ${P(side)}V9A7 7 0 0 0 4 9V23A7 7 0 0 0 ${P(low)}A${f(ro)} ${f(ro)} 0 1 0 ${P(top)}Z` +
    'M11 4A5 5 0 0 1 16 9V15H6V9A5 5 0 0 1 11 4Z' +
    `M11 28A5 5 0 0 1 6 23V17H${f(holeTop[0])}A${f(ro)} ${f(ro)} 0 0 0 ${P(holeLow)}A5 5 0 0 1 11 28Z` +
    `M${P([cx, cy + ri])}A${f(ri)} ${f(ri)} 0 1 1 ${P([cx + ri, cy])}A${f(ri)} ${f(ri)} 0 0 1 ${P([cx, cy + ri])}Z`
  );
}
export const PILLS_ADD: Spec = {
  base: {
    d:
      'M22 14A7.94 7.94 0 0 0 18 15.0825V9A7 7 0 0 0 4 9V23A6.9857 6.9857 0 0 0 16.2756 27.5768A7.9966 7.9966 0 1 0 22 14Z' +
      'M11 4A5.0059 5.0059 0 0 1 16 9V15H6V9A5.0059 5.0059 0 0 1 11 4Z' +
      'M11 28A5.0059 5.0059 0 0 1 6 23V17H15.765A7.9564 7.9564 0 0 0 15.0411 25.9319A5.0147 5.0147 0 0 1 11 28Z' +
      'M22 28A6 6 0 1 1 28 22A6.0066 6.0066 0 0 1 22 28Z',
    at: pillsAt,
  },
  mark: PLUS,
  // A small plus (arms 3), given room by the growing ring: the set's 2px.
  place: { c: PILL_C, arm: 3, reach: 2 },
};
export const PillsAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('PillsAdd', PILLS_ADD),
  /* @__PURE__ */ carbonArt(PillsAdd32)
);

// Data enrichment add: the bulb grows 1px out from the plus's centre (16, 14) at constant
// weight (its outside 10 → 11 across the middle), the rays ride 1px out with
// it, and the screw's two lines widen 1px a side. The bulb's neck comes 1px
// lower, so the lines step down 1px with it, keeping their 2px to it.
const BULB =
  'M16 4C10.5 4 6 8.5 6 14C6 18.4 8 20.3 9.5 21.6C10.5 22.5 11 23.1 11 24H13C13 22.2 11.9 21.1 10.8 20.1C9.4 18.9 8 17.5 8 14C8 9.6 11.6 6 16 6C20.4 6 24 9.6 24 14C24 17.5 22.6 18.9 21.2 20.1C20.1 21.1 19 22.1 19 24H21C21 23.1 21.5 22.5 22.5 21.6C24 20.3 26 18.4 26 14C26 8.5 21.5 4 16 4Z';
const BULB_LOOPS = /* @__PURE__ */ [pathPoints(BULB, 0.1)];
const BULB_SIDES = /* @__PURE__ */ inkSides(BULB_LOOPS);
const BULB_C: Pt = [16, 14];
const RAYS: Pt[][] = [
  [
    [28, 13],
    [30, 13],
    [30, 15],
    [28, 15],
  ],
  [
    [23.778, 4.797],
    [25.192, 3.383],
    [26.606, 4.797],
    [25.192, 6.211],
  ],
  [
    [15, 0],
    [17, 0],
    [17, 2],
    [15, 2],
  ],
  [
    [6.808, 6.233],
    [5.393, 4.818],
    [6.808, 3.404],
    [8.222, 4.818],
  ],
  [
    [2, 13],
    [4, 13],
    [4, 15],
    [2, 15],
  ],
];
/** The rays at hover h: each 1px further out from the plus's centre. */
const raysAt = (h: number) =>
  RAYS.map((r) => {
    const [mx, my] = [
      r.reduce((s, p) => s + p[0], 0) / 4 - BULB_C[0],
      r.reduce((s, p) => s + p[1], 0) / 4 - BULB_C[1],
    ];
    const l = Math.hypot(mx, my);
    return loopD(r.map(([x, y]) => [x + (mx / l) * h, y + (my / l) * h] as Pt));
  }).join('');
const linesAt = (h: number) =>
  `M${f(13 - h)} ${f(30 + h)}H${f(19 + h)}V${f(32 + h)}H${f(13 - h)}Z` +
  `M${f(11 - h)} ${f(26 + h)}H${f(21 + h)}V${f(28 + h)}H${f(11 - h)}Z`;
export const DATA_ENRICHMENT_ADD: Spec = {
  base: {
    d: BULB,
    at: (h) =>
      weightScaleLoops(BULB_LOOPS, BULB_SIDES, BULB_C, 1 + 0.1 * h)
        .map(loopD)
        .join(''),
    parts: {
      rays: 'M28 13H30V15H28ZM23.778 4.797L25.192 3.383L26.606 4.797L25.192 6.211ZM15 0H17V2H15ZM6.808 6.233L5.393 4.818L6.808 3.404L8.222 4.818ZM2 13H4V15H2Z',
      lines: 'M13 30H19V32H13ZM11 26H21V28H11Z',
    },
    partsAt: (h) => ({ rays: raysAt(h), lines: linesAt(h) }),
  },
  mark: PLUS,
  // A small plus (arms 4) in the bulb: 1px.
  place: { c: [16, 14], arm: 4 },
};
export const DataEnrichmentAddSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('DataEnrichmentAdd', DATA_ENRICHMENT_ADD),
  /* @__PURE__ */ carbonArt(DataEnrichmentAdd32)
);

// ── Circled plus ─────────────────────────────────────────────────────────────

export const CALENDAR_ADD_ALT: StatusMarkSpec<PlusAltPlace> = {
  base: {
    // Calendar's hover: the page grows 2px a side, its rings 1px further apart.
    calm: calendarCalm,
    d: 'M28 6C28 4.9 27.1 4 26 4H22V2H20V4H12V2H10V4H6C4.9 4 4 4.9 4 6V26C4 27.1 4.9 28 6 28H12V26H6V6H10V8H12V6H20V8H22V6H26V12H28V6Z',
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
          [12, 26],
          [12, 28],
        ],
        back: LEFT,
      },
    ],
  },
  baseMotion: 'calm',
  mark: PLUS_ALT,
  place: { c: [22, 22], R: 8, arm: 4 },
};
export const CalendarAddAltSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('CalendarAddAlt', CALENDAR_ADD_ALT),
  /* @__PURE__ */ carbonArt(CalendarAddAlt32)
);
