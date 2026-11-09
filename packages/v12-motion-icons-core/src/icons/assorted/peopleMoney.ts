/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Partnership32 from '@carbon/icons/es/partnership/32.js';
import UserRole32 from '@carbon/icons/es/user--role/32.js';
import Accessibility32 from '@carbon/icons/es/accessibility/32.js';
import ChatBot32 from '@carbon/icons/es/chat-bot/32.js';
import Money32 from '@carbon/icons/es/money/32.js';
import Wallet32 from '@carbon/icons/es/wallet/32.js';
import Account32 from '@carbon/icons/es/account/32.js';
import Chemistry32 from '@carbon/icons/es/chemistry/32.js';
import Compass32 from '@carbon/icons/es/compass/32.js';
import Hourglass32 from '@carbon/icons/es/hourglass/32.js';
import Lightning32 from '@carbon/icons/es/lightning/32.js';
import ChevronSortUp16 from '@carbon/icons/es/chevron--sort--up/16.js';
import ChevronSortUp32 from '@carbon/icons/es/chevron--sort--up/32.js';
import ConnectionSignal32 from '@carbon/icons/es/connection-signal/32.js';
import ConnectionSignalOff32 from '@carbon/icons/es/connection-signal--off/32.js';
import FaceSatisfied32 from '@carbon/icons/es/face--satisfied/32.js';
import FaceSatisfiedFilled32 from '@carbon/icons/es/face--satisfied--filled/32.js';
import Phone32 from '@carbon/icons/es/phone/32.js';
import PhoneOff32 from '@carbon/icons/es/phone--off/32.js';
import PreviousFilled32 from '@carbon/icons/es/previous--filled/32.js';
import PreviousOutline32 from '@carbon/icons/es/previous--outline/32.js';
import {
  carbonArt,
  fillThenClear,
  hoverIcon,
  toggleIcon,
  type CarbonIcon,
  type Shapes,
  type ToggleFrame,
  type ToggleFrameIn,
  withStatic,
} from '../../engine';
import {
  clipConvex,
  framePath,
  mapPath,
  pathPoints,
  polyPath,
  rectPath,
  ringPath,
  roundedRectPath,
  scalePts,
  type Pt,
} from '../../geometry';
import type { Seg } from '../../cut';
import { OFF_SHRINK, strokeOutline, type Slash } from '../../off';
import {
  makeOffIcon,
  slashChange,
  slashShapes,
  type SlashToggleSpec,
} from '../../utils/slashToggle';
import { ENTRANCE, EXIT } from '../../ease';
import { EVENODD, f } from '../../paint';
import { motionTokens, toEasing } from '../../tokens';
import { grown, personShapes, type Person } from '../people/people';
import { nextArrow } from './statesTime';
import { FlashSpec } from '../toggle/fillToggles';
import { BLINK_MS } from './objectsA';
import { weightScale } from '../toggle/stateFillToggles';

const CConnectionSignal = /* @__PURE__ */ carbonArt(ConnectionSignal32);
const CConnectionSignalOff = /* @__PURE__ */ carbonArt(ConnectionSignalOff32);
const CFaceSatisfied = /* @__PURE__ */ carbonArt(FaceSatisfied32);
const CFaceSatisfiedFilled = /* @__PURE__ */ carbonArt(FaceSatisfiedFilled32);
const CPhone = /* @__PURE__ */ carbonArt(Phone32);
const CPhoneOff = /* @__PURE__ */ carbonArt(PhoneOff32);
const CPreviousFilled = /* @__PURE__ */ carbonArt(PreviousFilled32);
const CPreviousOutline = /* @__PURE__ */ carbonArt(PreviousOutline32);

/**
 * People, money and toggles on the frame engine: Face satisfied (outline,
 * filled and the toggle), Partnership, User role, Accessibility, Chat bot,
 * Money, Wallet, Account, Chemistry, Compass, Hourglass, Lightning, Phone
 * (and Phone off, with the toggle), Connection signal (and off, with the
 * toggle), Previous (outline, filled and the toggle) and Chevron sort up.
 * Carbon has one (32px) drawing of each, except Chevron sort up, whose 16px
 * drawing is the 32px one halved, so one geometry serves every size. Each
 * rests on Carbon's drawing. On hover the parts move as geometry at a
 * constant 2px wall: points move, nothing is transform-scaled, no masks or
 * clip paths. Standard hover (160ms entrance in, 120ms exit out) unless noted.
 *
 *  - Face satisfied (and filled): the face grows 1px in radius (a ring that
 *    fills the frame, as Circle outline's) and the smile widens: each end
 *    sweeps 2px further round its centreline (16.4°), so the corners lift.
 *    The eyes hold.
 *  - Partnership: the People family motion. Each person's shoulders widen
 *    and the pair step apart, each 1px: the outer side of each person (arm,
 *    shoulder corner, outer leg) moves 2px out while the inner side (the
 *    linked arms' V and the inner legs) holds, so the space between them
 *    holds; each head grows 1px in diameter (its bottom held) and moves 1px
 *    out with its person.
 *  - User role: as User follow / User admin: the person grows (the family
 *    motion) and steps 1px left; the chevron grows 32.8% about its visual
 *    centre at constant weight, so its ends reach 2px (as Admin's check);
 *    the space between its tip and the head holds (4.66 → 4.64).
 *  - Accessibility: the push. The arm reaches 2px forward (its end moves,
 *    it lengthens behind) and the head leans 1px forward with it; the
 *    chair holds.
 *  - Chat bot: Chat's bubble motion (2px on every side, the tail's tip
 *    holding) and Bot's one-shot blink: the eyes go off for 70ms, 40–110ms
 *    into the entrance, only on the way in. The mouth holds.
 *  - Money: the stack fans: the note (with its coin and dots) lifts 2px and
 *    the first bill line 1px, so the two gaps under the note open 2 → 3px
 *    evenly; the bottom line holds.
 *  - Wallet: the wallet opens: the back panel's top edge rises 2px (the left
 *    wall lengthening with it); the front, the clasp and its button hold.
 *  - Account: as Identification's card: it grows 1px a side (it fills the
 *    frame); the header bar rides up with the top, so the header keeps its
 *    height; the two lines ride 1px left with the wall and reach 1px right.
 *  - Chemistry: the liquid rises 2px: its surface (a 2px wall) slides up the
 *    flask's walls, shortening along their lines.
 *  - Compass: Explore's motion: the ring grows 1px in radius (150ms) while
 *    the needle swings 15° anticlockwise (toward north) and settles back on
 *    its bearing (100ms), only on the way in. 250ms, as Explore.
 *  - Hourglass: the sand falls: both grains drop 2px together.
 *  - Lightning: Carbon's lightning is its Flash drawing, so it is Flash's
 *    hover exactly (Flash's morph).
 *  - Phone: the handset tilts 10° anticlockwise about its centre, as if
 *    lifted (rigid; Carbon's own outline).
 *  - Phone off, Connection signal off: the standard slash and the Off rule
 *    (see below).
 *  - Connection signal: the waves spread: the inner arcs grow 1px in radius
 *    and the outer arcs 2px, each about its own centre at its own angles,
 *    so the mast-to-wave and wave-to-wave gaps each open 1px evenly.
 *  - Previous outline / filled: Next mirrored: the ring (or the disc) grows
 *    1px in radius and the arrow reaches 2px left, its tail holding.
 *  - Chevron sort up: Chevron sort down mirrored: the chevron slides 2px up.
 *
 * Toggles
 *  - Face satisfied ⇄ filled, Previous outline ⇄ filled: the house disc
 *    fill (`fillThenClear`): one disc from the centre, 160ms in on the
 *    entrance ease; emptying, a hole from the same centre, 120ms on the exit
 *    ease. The features (eyes and smile, the arrow) share the fill's even-odd
 *    path, so they turn into the knockout as the disc passes them.
 *  - Phone ⇄ Phone off, Connection signal ⇄ off (`makeSlashToggle`): on →
 *    off the slash draws in (160ms entrance) with Carbon's 2px gap opening
 *    behind its head, the base kicking 2px toward the gap and back; off →
 *    on the slash retracts (120ms exit) and the base recoils half as far.
 *    Off hover: the base shrinks to 90% about its visual centre at constant
 *    weight and the slash reaches 1px further at each end.
 *
 * Each toggle's ends are its hover icons' geometry, so they're equal at
 * every h by construction.
 */

const C: Pt = [16, 16];
const LINEAR = [0, 0, 1, 1] as [number, number, number, number];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
const rad = (deg: number) => (deg * Math.PI) / 180;
/** The entrance ease on the slice [start, start + dur] of a linear timeline (ms). */
const slice = (ms: number, start: number, dur: number) =>
  ENTRANCE(clamp01((ms - start) / dur));
/** p turned by `deg` (clockwise on screen) about c. */
const turn = (c: Pt, deg: number) => {
  const [cos, sin] = [Math.cos(rad(deg)), Math.sin(rad(deg))];
  return ([x, y]: Pt): Pt => [
    c[0] + (x - c[0]) * cos - (y - c[1]) * sin,
    c[1] + (x - c[0]) * sin + (y - c[1]) * cos,
  ];
};

/** A full circle as four quarter arcs ('' when it has no size), as statesTime draws its discs. */
export function circleD([cx, cy]: Pt, r: number): string {
  if (r <= 1e-4) {
    return '';
  }
  const R = `A${f(r)} ${f(r)} 0 0 1`;
  return `M${f(cx - r)} ${f(cy)}${R} ${f(cx)} ${f(cy - r)}${R} ${f(cx + r)} ${f(cy)}${R} ${f(cx)} ${f(cy + r)}${R} ${f(cx - r)} ${f(cy)}Z`;
}

type FillShapes = (h: number, p: number, e: number) => Shapes;

/** The outline ⇄ filled toggle and its two ends as hover icons (as statesTime's fillSet). */
/* @__NO_SIDE_EFFECTS__ */
function fillSet(
  outline: string,
  filled: string,
  toggle: string,
  statics: readonly [CarbonIcon, CarbonIcon],
  shapes: FillShapes
) {
  return {
    outline: hoverIcon(outline, { geo: ({ h }) => shapes(h, 0, 0) }),
    filled: hoverIcon(filled, { geo: ({ h }) => shapes(h, 1, 0) }),
    toggle: toggleIcon<'outline' | 'filled'>(toggle, {
      states: ['outline', 'filled'],
      statics,
      geo: ({ h, p, e }) => shapes(h, p, e),
      change: fillThenClear,
    }),
  };
}

// ── Smiles and eyes (Face satisfied, Chat bot) ───────────────────────────────
//
// A smile is a 2px band about a centreline arc below its centre, its ends cut
// on (nearly) radial lines: Carbon's outer and inner ends sit at slightly
// different angles below the horizontal, so each is kept. The bigger smile
// sweeps each end 2px further round the centreline, so the
// corners lift; the eyes rise with them, by just enough that the space from
// each eye to the nearer end of the smile holds at its resting width.

/** A smile: centre, centreline radius, and its outer and inner ends' angles below the horizontal (radians). */
export type Smile = { c: Pt; r: number; ao: number; ai: number };
/** How far each end of a smile sweeps round its centreline on hover (both icons). */
export const SMILE_REACH = 2;

/** The smile at hover h: each end swept SMILE_REACH·h round the centreline. */
const swept = (sm: Smile, h: number): Smile => ({
  ...sm,
  ao: sm.ao - (SMILE_REACH * h) / sm.r,
  ai: sm.ai - (SMILE_REACH * h) / sm.r,
});
/** A point at radius r, `a` below the horizontal, on the smile's right (side 1) or left (−1). */
const smileAt = (sm: Smile, r: number, a: number, side: 1 | -1): Pt => [
  sm.c[0] + side * r * Math.cos(a),
  sm.c[1] + r * Math.sin(a),
];

export function smilePath(sm: Smile): string {
  const [ro, ri] = [sm.r + 1, sm.r - 1];
  return (
    `M${P(smileAt(sm, ro, sm.ao, -1))}A${f(ro)} ${f(ro)} 0 0 0 ${P(smileAt(sm, ro, sm.ao, 1))}` +
    `L${P(smileAt(sm, ri, sm.ai, 1))}A${f(ri)} ${f(ri)} 0 0 1 ${P(smileAt(sm, ri, sm.ai, -1))}Z`
  );
}

/** The distance from p to the segment ab. */
function segDist(p: Pt, a: Pt, b: Pt): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const t = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))
  );
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
/** The space between an eye (a disc above the smile) and the smile: to the nearer end's cut. */
export function eyeGap(eye: Pt, re: number, sm: Smile): number {
  const side = eye[0] >= sm.c[0] ? 1 : -1;
  return (
    segDist(
      eye,
      smileAt(sm, sm.r - 1, sm.ai, side),
      smileAt(sm, sm.r + 1, sm.ao, side)
    ) - re
  );
}
/** How far an eye must rise to keep `want` from the smile (bisection; the gap grows as it rises). */
export function eyeLift(eye: Pt, re: number, sm: Smile, want: number): number {
  const gapAt = (d: number) => eyeGap([eye[0], eye[1] - d], re, sm);
  if (gapAt(0) >= want) {
    return 0;
  }
  let [lo, hi] = [0, 6];
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (gapAt(mid) >= want) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return hi;
}

// ── Face satisfied ───────────────────────────────────────────────────────────
//
// Carbon's face: the ring (r 12–14), two eyes (discs r 2.5 about (11.5, 13.5)
// and (20.5, 13.5)) and the smile, a band r 6–8 about the centre, its outer
// ends 30.97° below the horizontal, its inner ends 31.18°.
// face--satisfied--filled is a disc of r 14 with the eyes and smile knocked out.
//
// Hover: the ring (or disc) grows 1px in radius; the smile's ends
// sweep 2px further round its r 7 centreline (16.37°), so the corners lift, and
// the eyes rise with them (1.47px at full hover), so each eye keeps its resting
// 3.15px from the smile's end.

export const FACE_GROW = 1;
const FACE_SMILE: Smile = {
  c: [16, 16],
  r: 7,
  ao: Math.atan2(4.11, 6.85),
  ai: Math.atan2(3.11, 5.14),
};
const EYES: Pt[] = [
  [11.5, 13.5],
  [20.5, 13.5],
];
const EYE_R = 2.5;
/** The resting space from each eye to the smile's end. */
export const FACE_EYE_GAP = eyeGap(EYES[1], EYE_R, FACE_SMILE);

/** The smile at hover h. */
export const faceSmile = (h: number): Smile => swept(FACE_SMILE, h);
/** How far the eyes have risen at hover h. */
export const faceEyeLift = (h: number) =>
  h ? eyeLift(EYES[1], EYE_R, faceSmile(h), FACE_EYE_GAP) : 0;

export function faceShapes(h: number, p: number, e: number): Shapes {
  const r = 13 + FACE_GROW * h;
  const lift = faceEyeLift(h);
  return {
    ring: { d: ringPath(C, r, 2) },
    glyph: {
      d:
        circleD(C, r * p) +
        circleD(C, r * e) +
        EYES.map(([x, y]) => circleD([x, y - lift], EYE_R)).join('') +
        smilePath(faceSmile(h)),
      ...EVENODD,
    },
  };
}

const face = /* @__PURE__ */ fillSet(
  'FaceSatisfied',
  'FaceSatisfiedFilled',
  'FaceSatisfiedToggle',
  [CFaceSatisfied, CFaceSatisfiedFilled],
  faceShapes
);
export const FaceSatisfiedSpec = /* @__PURE__ */ withStatic(
  face.outline,
  /* @__PURE__ */ carbonArt(FaceSatisfied32)
);
export const FaceSatisfiedFilledSpec = /* @__PURE__ */ withStatic(
  face.filled,
  /* @__PURE__ */ carbonArt(FaceSatisfiedFilled32)
);
export const FaceSatisfiedToggleSpec = face.toggle;

// ── Partnership ──────────────────────────────────────────────────────────────
//
// Carbon's two people: heads (rings r 2–4 about (8, 5) and (24, 5)) and one
// outline for both bodies: each person's arm and shoulder corner (outer
// wall x 2–4, r 3 corner), a jog in to the legs (a U, walls x 4–6 and
// 10–12), and the linked arms between them, a 2px V down to x 16.
//
// Hover, with the People family growth:
// each person's shoulders widen 1px a side and the people step 1px toward
// each other, so each person's outer side holds and its inner side moves 2px
// in. Every point of the outline between a head's centre line and the middle
// (8 < x < 16, 16 < x < 24) moves 2px in: the walls there translate, and the
// walls that cross from the outer side (the shoulders' tops, the legs'
// bottoms) are horizontal, so they lengthen. The V's arms move in with the
// shoulders at their own angles, so its point rises: the outer point
// 16 → 12.49, the inner 20 → 16.51 (a smaller V, same angles, 2px arms). Each
// head grows 1px in diameter, its bottom held (the 1px gap to the shoulders
// holds), and moves 1px in with its person.

const PARTNER_D =
  'M26 30L22 30A2 2 0 0 1 20 28L20 21L22 21L22 28L26 28L26 19L28 19L28 13A1 1 0 0 0 27 12L20.58 12L16 20L11.42 12L5 12' +
  'A1 1 0 0 0 4 13L4 19L6 19L6 28L10 28L10 21L12 21L12 28A2 2 0 0 1 10 30L6 30A2 2 0 0 1 4 28L4 21A2 2 0 0 1 2 19L2 13A3 3 0 0 1 5 10' +
  'L12.58 10L16 16L19.42 10L27 10A3 3 0 0 1 30 13L30 19A2 2 0 0 1 28 21L28 28A2 2 0 0 1 26 30Z';
/** How far each person's inner side moves in (1px wider, 1px together). */
export const PARTNER_IN = 2;
/** How far each head moves in with its person. */
export const PARTNER_STEP = 1;
/** The V's points at hover h (outer at y 16, inner at y 20 at rest), its arms moving in at their own angles. */
export function partnerV(h: number): { outer: number; inner: number } {
  const d = PARTNER_IN * h;
  return {
    outer: 10 + ((16 - 12.58 - d) * 6) / (16 - 12.58),
    inner: 12 + ((16 - 11.42 - d) * 8) / (16 - 11.42),
  };
}

export const PartnershipSpec = /* @__PURE__ */ hoverIcon('Partnership', {
  geo: ({ h }) => {
    const d = PARTNER_IN * h;
    const v = partnerV(h);
    const head = (cx: number, side: -1 | 1) =>
      ringPath([cx + side * PARTNER_STEP * h, 5 - h / 2], 3 + h / 2, 2);
    const move = ([x, y]: Pt): Pt => {
      if (x === 16) {
        return [x, y === 16 ? v.outer : v.inner];
      }
      return [x > 8 && x < 16 ? x + d : x > 16 && x < 24 ? x - d : x, y];
    };
    return {
      left: { d: head(8, 1), ...EVENODD },
      right: { d: head(24, -1), ...EVENODD },
      bodies: { d: h ? mapPath(PARTNER_D, move) : PARTNER_D },
    };
  },
  static: /* @__PURE__ */ carbonArt(Partnership32),
});

// ── User role ────────────────────────────────────────────────────────────────
//
// The person is User follow's (user--multiple's front person): it grows (the
// family motion) and steps 1px left. The mark is a 2px "<" (tip (22, 15)
// outer, (24.86, 15) inner; arms to x 29.5), its centreline from the tip
// (23.43, 15) to (28.785, 9.705) and (28.785, 20.295), mitred at the tip. It
// grows about its visual centre (25.75, 15) at constant weight, by enough
// that its ends reach 2px, as User admin's check does.

const ROLE_PERSON: Person = {
  head: [12, 9],
  hr: 6,
  body: [
    [3, 30],
    [3, 19],
    [21, 19],
    [21, 30],
  ],
  r: 6,
};
const ROLE_CHEVRON: Pt[] = [
  [28.785, 9.705],
  [23.43, 15],
  [28.785, 20.295],
];
export const ROLE_CHEVRON_C: Pt = [25.75, 15];
const ROLE_REACH = 2;
/** The chevron's growth: its ends (6.10 from the centre) reach 2px. */
export const ROLE_CHEVRON_GROW =
  ROLE_REACH /
  Math.hypot(
    ROLE_CHEVRON[0][0] - ROLE_CHEVRON_C[0],
    ROLE_CHEVRON[0][1] - ROLE_CHEVRON_C[1]
  );
const L = (a: Pt, b: Pt): Seg => ({ k: 'L', a, b });

export function roleChevron(h: number): Pt[] {
  const [a, tip, b] = scalePts(
    ROLE_CHEVRON,
    ROLE_CHEVRON_C,
    1 + ROLE_CHEVRON_GROW * h
  );
  return strokeOutline([L(a, tip), L(tip, b)], 2).open!;
}

export const UserRoleSpec = /* @__PURE__ */ hoverIcon('UserRole', {
  geo: ({ h }) => ({
    ...personShapes('person', grown(ROLE_PERSON, h, [-h, 0])),
    chevron: { d: polyPath(roleChevron(h), true) },
  }),
  static: /* @__PURE__ */ carbonArt(UserRole32),
});

// ── Accessibility ────────────────────────────────────────────────────────────
//
// Carbon's figure: the head (a ring r 1.5–3.5 about (15.5, 4.5)) and one
// outline for the rest, drawn here as three overlapping pieces whose union is
// Carbon's: the upper body (the torso's left wall x 11–13 down to the hip at
// y 19, its cap r 2–4 about (15, 13), its right wall and the arm reaching
// forward, y 15–17, to x 24); the chair (the hip's corner, r 2–4 about
// (15, 19), the seat and the leg down to the foot); and the wheel (r 7–9 about
// (11, 23)), whose top end runs on 1px into the torso's wall.
//
// Hover: the upper body leans
// forward 12° about the hip's centre (15, 19), as one rigid piece, and the arm
// reaches 1px forward within it (its end tips 2.2px down, 2.4px clear of
// the leg). The head stays upright on the torso: it rides with the top of the
// torso (its cap's centre) at its resting offset, so it moves 1.25px forward
// and 0.13px down and the 1px neck gap holds exactly. The hip's corner runs on
// into the torso's wall 2° past the lean, so the wall's foot always lands
// inside it and the joint stays whole; the wheel's end runs on to x 12.5,
// inside the wall at every lean. The chair and wheel hold.

export const ARM_REACH = 1;
export const LEAN_DEG = 12;
export const HIP: Pt = [15, 19];
const UPPER_D =
  'M11 19L11 13A4 4 0 0 1 19 13L19 15L24 15L24 17L17 17L17 13A2 2 0 0 0 13 13L13 19Z';
/** The chair, its hip corner running on into the wall `deg` (2° past the lean, so the wall's foot lands inside it: no seam). */
const chairD = (deg: number) => {
  const a = rad(deg + 2);
  return (
    `M${P([15 - 4 * Math.cos(a), 19 - 4 * Math.sin(a)])}A4 4 0 0 0 15 23L22.34 23L25.5 30.37L30.45 27.89L29.55 26.11L26.5 27.63L23.66 21L15 21` +
    `A2 2 0 0 1 ${P([15 - 2 * Math.cos(a), 19 - 2 * Math.sin(a)])}Z`
  );
};
const WHEEL_END = 12.5;
const WHEEL_D = /* @__PURE__ */ (() =>
  `M${WHEEL_END} ${f(23 - Math.sqrt(81 - (WHEEL_END - 11) ** 2))}A9 9 0 1 0 19.77 25L17.71 25A7 7 0 1 1 ${WHEEL_END} ${f(23 - Math.sqrt(49 - (WHEEL_END - 11) ** 2))}Z`)();

/** The head's centre at hover h: upright, at its resting offset (0.5, −8.5) from the leaning cap's centre (15, 13). */
export function accessHead(h: number): Pt {
  const [x, y] = turn(HIP, LEAN_DEG * h)([15, 13]);
  return [x + 0.5, y - 8.5];
}

export const AccessibilitySpec = /* @__PURE__ */ hoverIcon('Accessibility', {
  geo: ({ h }) => {
    const lean = turn(HIP, LEAN_DEG * h);
    return {
      head: { d: ringPath(accessHead(h), 2.5, 2), ...EVENODD },
      upper: {
        d: h
          ? mapPath(UPPER_D, ([x, y]) =>
              lean([x === 24 ? x + ARM_REACH * h : x, y])
            )
          : UPPER_D,
      },
      chair: { d: chairD(LEAN_DEG * h) },
      wheel: { d: WHEEL_D },
    };
  },
  static: /* @__PURE__ */ carbonArt(Accessibility32),
});

// ── Chat bot ─────────────────────────────────────────────────────────────────
//
// The bubble is Chat's (outer r 4 corners, inner r 2), its top 2px higher
// (y 2; Chat's is at 4): it grows 2px on every side, the tail's tip holding
// and its sides meeting the lower wall further along their own lines (as
// Chat's bubble; drawn here from its numbers).
//
// The face (with Face satisfied's bigger smile): eyes are discs r 2 about
// (12, 10) and (20, 10); the smile a band r 5–7 about (16, 12), its ends
// 33.57° below the horizontal. On hover the face grows 1px a side: its layout
// scales 7/6 about (16, 13.5) (the eyes move 0.67px out and 0.58px up, the
// smile's centreline 6 → 7 at a 2px wall); the smile's ends sweep 2px further
// round, and the eyes rise with them (FACE rule) so each keeps its resting
// 2.77px from the smile's end. Both eyes blink once on the way in, as Bot's
// do:
// off for 70ms, 40–110ms into the 160ms entrance.

export const BOT_BUBBLE_GROW = 2;
const TAIL_RUN = 4 / 7; // the tail's dx per dy
function botBubble(g: number): string {
  const [l0, l1, t0, t1] = [2 - g, 30 + g, 2 - g, 24 + g];
  return (
    `M17.7358 30L16 29L${f(20 - g * TAIL_RUN)} ${f(t1 - 2)}L${f(l1 - 4)} ${f(t1 - 2)}A2 2 0 0 0 ${f(l1 - 2)} ${f(t1 - 4)}L${f(l1 - 2)} ${f(t0 + 4)}` +
    `A2 2 0 0 0 ${f(l1 - 4)} ${f(t0 + 2)}L${f(l0 + 4)} ${f(t0 + 2)}A2 2 0 0 0 ${f(l0 + 2)} ${f(t0 + 4)}L${f(l0 + 2)} ${f(t1 - 4)}` +
    `A2 2 0 0 0 ${f(l0 + 4)} ${f(t1 - 2)}L15 ${f(t1 - 2)}L15 ${f(t1)}L${f(l0 + 4)} ${f(t1)}A4 4 0 0 1 ${f(l0)} ${f(t1 - 4)}` +
    `L${f(l0)} ${f(t0 + 4)}A4 4 0 0 1 ${f(l0 + 4)} ${f(t0)}L${f(l1 - 4)} ${f(t0)}A4 4 0 0 1 ${f(l1)} ${f(t0 + 4)}` +
    `L${f(l1)} ${f(t1 - 4)}A4 4 0 0 1 ${f(l1 - 4)} ${f(t1)}L${f(21.1646 - g * TAIL_RUN)} ${f(t1)}Z`
  );
}
const BOT_FACE_C: Pt = [16, 13.5];
/** The face's growth: 1px a side on its 12px width. */
export const BOT_FACE_GROW = 1 / 6;
const BOT_EYES: Pt[] = [
  [12, 10],
  [20, 10],
];
const BOT_SMILE: Smile = {
  c: [16, 12],
  r: 6,
  ao: Math.atan2(3.8713, 5.833),
  ai: Math.atan2(2.7639, 4.167),
};
export const BOT_EYE_GAP = eyeGap(BOT_EYES[1], 2, BOT_SMILE);
/** The blink as hover progress (the entrance eases h, so its ms map through the ease). */
export const CHAT_BOT_BLINK_H = /* @__PURE__ */ BLINK_MS.map((ms) =>
  ENTRANCE(ms / motionTokens.duration.moderate01)
) as [number, number];

/** Chat bot's face at hover h: eye centres and the smile. */
export function botFace(h: number): { eyes: Pt[]; smile: Smile } {
  const s = 1 + BOT_FACE_GROW * h;
  const at = ([x, y]: Pt): Pt => [
    BOT_FACE_C[0] + (x - BOT_FACE_C[0]) * s,
    BOT_FACE_C[1] + (y - BOT_FACE_C[1]) * s,
  ];
  const smile = swept(
    { ...BOT_SMILE, c: at(BOT_SMILE.c), r: BOT_SMILE.r * s },
    h
  );
  const eyes = BOT_EYES.map(at);
  const lift = h ? eyeLift(eyes[1], 2, smile, BOT_EYE_GAP) : 0;
  return { eyes: eyes.map(([x, y]) => [x, y - lift] as Pt), smile };
}

export const ChatBotSpec = /* @__PURE__ */ hoverIcon('ChatBot', {
  geo: ({ h, entering = 1 }) => {
    const { eyes, smile } = botFace(h);
    const blink =
      entering > 0 && h > CHAT_BOT_BLINK_H[0] && h < CHAT_BOT_BLINK_H[1];
    return {
      bubble: { d: botBubble(BOT_BUBBLE_GROW * h) },
      eyes: { d: blink ? '' : eyes.map((c) => circleD(c, 2)).join('') },
      mouth: { d: smilePath(smile) },
    };
  },
  static: /* @__PURE__ */ carbonArt(ChatBot32),
});

// ── Money ────────────────────────────────────────────────────────────────────
//
// The note (a frame 2–30 × 4–20), its coin (a ring r 2–4 about (16, 12)) and
// dots (r 2 about (8, 12) and (24, 12)), over two bill lines (y 22–24 and
// 26–28), each gap 2px. Hover: the note lifts 2px and widens 2px (1px a side), its dots riding out 1px with its sides so they keep their 2px
// to the frame; the coin stays centred. The first line lifts 1px, so both gaps
// under the note open to 3px; the bottom line holds.

export const NOTE_LIFT = 2;
export const NOTE_WIDEN = 1;
export const BILL_LIFT = 1;
const NOTE =
  /* @__PURE__ */ framePath(2, 4, 30, 20) +
  /* @__PURE__ */ ringPath([16, 12], 3, 2) +
  /* @__PURE__ */ circleD([8, 12], 2) +
  /* @__PURE__ */ circleD([24, 12], 2);

export function noteD(h: number): string {
  if (!h) {
    return NOTE;
  }
  const [w, y] = [NOTE_WIDEN * h, 12 - NOTE_LIFT * h];
  return (
    framePath(2 - w, 4 - NOTE_LIFT * h, 30 + w, 20 - NOTE_LIFT * h) +
    ringPath([16, y], 3, 2) +
    circleD([8 - w, y], 2) +
    circleD([24 + w, y], 2)
  );
}

export const MoneySpec = /* @__PURE__ */ hoverIcon('Money', {
  geo: ({ h }) => ({
    note: { d: noteD(h), ...EVENODD },
    bill: { d: rectPath(2, 22 - BILL_LIFT * h, 30, 24 - BILL_LIFT * h) },
    base: { d: rectPath(2, 26, 30, 28) },
  }),
  static: /* @__PURE__ */ carbonArt(Money32),
});

// ── Wallet ───────────────────────────────────────────────────────────────────
//
// The front (2–30 × 8–28, r 2 outer corners) with its clasp (18–30 × 13–23,
// open 20–28 × 15–21) and button (22–24 × 17–19); the back panel's top edge
// (y 3–5, x 4–26) runs from the left wall, which carries on up to it.
//
// Hover: every wall steps 1px out (the front 0–32 × 7–29 at full hover, the
// back's edge 1px up and 1px longer, keeping its 4px from the right side);
// the clasp rides on the right wall and widens 2px to the left (its left side
// 18 → 16, the opening 20 → 18), and the button stays where it sat in the
// opening (0.5px left of its middle). The back panel rides up 1px with the
// growth.

export const WALLET_GROW = 1;
export const CLASP_WIDEN = 2;

export function walletD(h: number): string {
  const [g, c] = [WALLET_GROW * h, CLASP_WIDEN * h];
  const X = (x: number) => f(x);
  return (
    `M${X(28 + g)} ${X(8 - g)}L${X(4 - g)} ${X(8 - g)}L${X(4 - g)} ${X(5 - g)}L${X(26 + g)} ${X(5 - g)}L${X(26 + g)} ${X(3 - g)}L${X(4 - g)} ${X(3 - g)}` +
    `A2 2 0 0 0 ${X(2 - g)} ${X(5 - g)}L${X(2 - g)} ${X(26 + g)}A2 2 0 0 0 ${X(4 - g)} ${X(28 + g)}L${X(28 + g)} ${X(28 + g)}` +
    `A2 2 0 0 0 ${X(30 + g)} ${X(26 + g)}L${X(30 + g)} ${X(10 - g)}A2 2 0 0 0 ${X(28 + g)} ${X(8 - g)}Z` +
    `M${X(4 - g)} ${X(26 + g)}L${X(4 - g)} ${X(10 - g)}L${X(28 + g)} ${X(10 - g)}L${X(28 + g)} 13L${X(20 - c)} 13A2 2 0 0 0 ${X(18 - c)} 15` +
    `L${X(18 - c)} 21A2 2 0 0 0 ${X(20 - c)} 23L${X(28 + g)} 23L${X(28 + g)} ${X(26 + g)}Z` +
    `M${X(28 + g)} 15L${X(28 + g)} 21L${X(20 - c)} 21L${X(20 - c)} 15Z`
  );
}

export const WalletSpec = /* @__PURE__ */ hoverIcon('Wallet', {
  geo: ({ h }) => {
    const shift = ((WALLET_GROW - CLASP_WIDEN) * h) / 2;
    return {
      wallet: { d: walletD(h), ...EVENODD },
      button: { d: rectPath(22 + shift, 17, 24 + shift, 19) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Wallet32),
});

// ── Account ──────────────────────────────────────────────────────────────────
//
// The window (2–30 × 4–28, r 2 outer corners) with its header (open 4–28 ×
// 6–8) over the body (open 4–28 × 10–26), and two lines (x 8–19, y 14–16;
// x 8–21, y 19–21). Hover (Identification's card): the window grows 1px a
// side; the header bar rides up 1px with the top (the header keeps its 2px);
// the lines ride 1px left with the wall and reach 1px right (2px longer).

export const ACCOUNT_GROW = 1;
export const ACCOUNT_LINE_REACH = 1;

export const AccountSpec = /* @__PURE__ */ hoverIcon('Account', {
  geo: ({ h }) => {
    const g = ACCOUNT_GROW * h;
    const r = ACCOUNT_LINE_REACH * h;
    return {
      card: {
        d:
          roundedRectPath(2 - g, 4 - g, 30 + g, 28 + g) +
          rectPath(4 - g, 6 - g, 28 + g, 8 - g) +
          rectPath(4 - g, 10 - g, 28 + g, 26 + g),
        ...EVENODD,
      },
      lines: {
        d: rectPath(8 - g, 14, 19 + r, 16) + rectPath(8 - g, 19, 21 + r, 21),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Account32),
});

// ── Chemistry ────────────────────────────────────────────────────────────────
//
// The flask: its outside, and its cavity (the neck, x 14–18, and the cone,
// whose inside walls run straight from the neck's foot (14, 14.33) down to the
// base's round corners). Across the cavity, the liquid's surface is a 2px wall
// (y 18–20), cut along the cone's walls.
//
// Hover, on the standard
// hover (160ms entrance in, 120ms exit out): the flask grows 1px at its caps
// (scaled 14/13 about (16, 16) at constant weight, `weightScale`) and tilts 12°
// clockwise about the same centre. The liquid's surface (turning about its
// middle, (16, 19) in the flask) stays level throughout: it turns back as far
// as the flask turns, so its ends ride along the tilting walls.

export const FLASK_TILT = 12;
/** The flask's scale on hover (at constant weight its caps move 13·(s − 1) = 1px out). */
export const FLASK_GROW = 1 / 13;
const FLASK_OUT =
  'M27.2314 23.6182L20 13.6748L20 4L22 4L22 2L10 2L10 4L12 4L12 13.6748L4.7686 23.6182A4.0183 4.0183 0 0 0 8.0186 30' +
  'L23.9814 30A4.0183 4.0183 0 0 0 27.2314 23.6182Z';
const CAVITY =
  'M14 4L18 4L18 14.3252L25.6143 24.7939A2.0192 2.0192 0 0 1 23.9814 28L8.0186 28A2.0192 2.0192 0 0 1 6.3857 24.7939L14 14.3252Z';
/** The neck and cone as a polygon (its bottom edge is not a wall; the surface never reaches it). */
const CONE: Pt[] = [
  [14, 4],
  [18, 4],
  [18, 14.3252],
  [25.6143, 24.7939],
  [6.3857, 24.7939],
  [14, 14.3252],
];
/** The cone is a hole: the glass lies outside it. */
const CONE_SIDE = /* @__PURE__ */ (() => -inkSides([CONE])[0] as 1 | -1)();
/** The surface's middle, in the flask. */
const SURFACE_MID: Pt = [16, 19];

/** The flask at hover h: its growth (0–1), its tilt and the surface's angle in the flask (degrees, clockwise): level in the world. */
export function flaskAt(h: number): {
  grow: number;
  tilt: number;
  surface: number;
} {
  return { grow: h, tilt: FLASK_TILT * h, surface: -FLASK_TILT * h };
}

/** The flask's drawing at growth g, the surface at `surface` degrees in the flask, before the tilt. */
export function flaskD(g: number, surface: number): string {
  const s = 1 + FLASK_GROW * g;
  // The grown cone: its walls (a hole's edges) moved out of the cavity into the glass, as weightScale moves them.
  const cone = g ? weightScaleLoops([CONE], [CONE_SIDE], C, s)[0] : CONE;
  const clip = [cone[5], cone[2], cone[3], cone[4]];
  // The surface: a 2px band about a line through its middle, cut to the cone.
  const a = rad(surface);
  const [u, n]: Pt[] = [
    [Math.cos(a), Math.sin(a)],
    [-Math.sin(a), Math.cos(a)],
  ];
  const at = (t: number, w: number): Pt => [
    SURFACE_MID[0] + u[0] * t + n[0] * w,
    SURFACE_MID[1] + u[1] * t + n[1] * w,
  ];
  const band = clipConvex(
    [at(-14, -1), at(14, -1), at(14, 1), at(-14, 1)],
    clip
  );
  const glass = g ? weightScale(FLASK_OUT + CAVITY, C, s) : FLASK_OUT + CAVITY;
  return glass + polyPath(band, true);
}

export const ChemistrySpec = /* @__PURE__ */ hoverIcon('Chemistry', {
  geo: ({ h }) => {
    const { grow, tilt, surface } = flaskAt(h);
    const d = flaskD(grow, surface);
    return { flask: { d: tilt ? mapPath(d, turn(C, tilt)) : d, ...EVENODD } };
  },
  static: /* @__PURE__ */ carbonArt(Chemistry32),
});

// ── Compass ──────────────────────────────────────────────────────────────────
//
// The ring (r 12–14), the needle (a 2px bar from (9.7, 22.3) to (22.3, 9.7)
// through a hub ring r 1–3) and the north dot (r 1.5 about (16, 7.5)).
//
// Hover: Explore's motion exactly. The engine runs 250ms
// linear; the ring grows 1px in radius over 0–150ms on the entrance ease while
// the needle swings to −61° (anticlockwise), then settles to −45° (150–250ms),
// so it ends pointing north. Leaving, both go straight back on the exit ease.
// The north dot
// doubles with the ring's growth, r 1.5 → 3, and rises to sit centred on the
// ring's (grown) centreline at the top, (16, 2): it straddles the ring as one
// shape with it. It's cut off at the ring's outer edge, as geometry (the dot's arc
// inside the ring, closed by the ring's outer arc), so nothing passes the
// ring's outside. Rest is Carbon's drawing.
// Wherever the needle comes near the dot it is cut back along a circle 2px out
// from the dot (a knockout gap, as geometry), so the two always read apart;
// pointing north, the needle's full length is 2.1px clear of the risen dot.
//
// The needle is drawn as its hub (a ring, which needn't turn) and its two bars
// (from inside the hub's wall out to Carbon's ends, 8.9 from the centre),
// which turn about the centre.

const COMPASS_MS = 250;
export const NEEDLE_TURN = -45;
const NEEDLE_PEAK = -61;
export const NORTH_GAP = 2;
const NEEDLE_LEN = Math.hypot(6.295, 6.295);

/** The compass's ring growth (0–1) and needle turn (degrees, clockwise) at hover h: Explore's. */
export function compassAt(
  h: number,
  entering = 1
): { ring: number; deg: number } {
  if (!entering) {
    const back = 1 - EXIT(1 - h);
    return { ring: back, deg: NEEDLE_TURN * back };
  }
  const ms = h * COMPASS_MS;
  const [swing, settle] = [slice(ms, 0, 150), slice(ms, 150, 100)];
  return {
    ring: swing,
    deg: NEEDLE_PEAK * swing + (NEEDLE_TURN - NEEDLE_PEAK) * settle,
  };
}

/** The north dot at ring growth g: r 1.5 → 3, its centre rising from (16, 7.5) onto the ring's centreline (y 3 − g). */
export const northDot = (g: number): { c: Pt; r: number } => ({
  c: [16, 7.5 + (3 - g - 7.5) * g],
  r: 1.5 + 1.5 * g,
});

/** A convex polygon less a disc (about D, radius R): its outline with the part inside the disc replaced by the disc's arc. */
export function minusDisc(poly: readonly Pt[], D: Pt, R: number): Pt[] {
  const pts: Pt[] = [];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const m = Math.max(
      1,
      Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.1)
    );
    for (let k = 0; k < m; k++) {
      pts.push([
        a[0] + ((b[0] - a[0]) * k) / m,
        a[1] + ((b[1] - a[1]) * k) / m,
      ]);
    }
  });
  const inside = (p: Pt) => Math.hypot(p[0] - D[0], p[1] - D[1]) < R;
  const s0 = pts.findIndex((p) => !inside(p));
  if (s0 < 0) {
    return [];
  }
  if (pts.every((p) => !inside(p))) {
    return [...poly];
  }
  const q = [...pts.slice(s0), ...pts.slice(0, s0)];
  /** Where the edge from a (outside) to b (inside) crosses the circle. */
  const cross = (a: Pt, b: Pt): Pt => {
    let [lo, hi] = [0, 1];
    for (let i = 0; i < 40; i++) {
      const t = (lo + hi) / 2;
      if (inside([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])) {
        hi = t;
      } else {
        lo = t;
      }
    }
    return [a[0] + (b[0] - a[0]) * lo, a[1] + (b[1] - a[1]) * lo];
  };
  const out: Pt[] = [];
  for (let i = 0; i < q.length; ) {
    if (!inside(q[i])) {
      out.push(q[i++]);
      continue;
    }
    let j = i;
    while (j < q.length && inside(q[j])) {
      j++;
    }
    const [enter, exit] = [
      cross(q[i - 1], q[i]),
      cross(q[j % q.length], q[j - 1]),
    ];
    const [a0, a1] = [
      Math.atan2(enter[1] - D[1], enter[0] - D[0]),
      Math.atan2(exit[1] - D[1], exit[0] - D[0]),
    ];
    let da = a1 - a0;
    while (da > Math.PI) {
      da -= 2 * Math.PI;
    }
    while (da < -Math.PI) {
      da += 2 * Math.PI;
    }
    // Of the two arcs between the cuts, the one that runs through the polygon.
    const mid = (d: number): Pt => [
      D[0] + R * Math.cos(a0 + d / 2),
      D[1] + R * Math.sin(a0 + d / 2),
    ];
    if (!inked([[...poly]], mid(da))) {
      da -= Math.sign(da) * 2 * Math.PI;
    }
    const n = Math.max(2, Math.ceil(Math.abs(da) / (Math.PI / 60)));
    for (let k = 0; k <= n; k++) {
      out.push([
        D[0] + R * Math.cos(a0 + (da * k) / n),
        D[1] + R * Math.sin(a0 + (da * k) / n),
      ]);
    }
    i = j;
  }
  return out;
}

/** The needle's two bars at a turn of `deg`, each cut back from the north dot. */
export function needleBars(deg: number, dot: { c: Pt; r: number }): string {
  const a = rad(-45 + deg);
  const u: Pt = [Math.cos(a), Math.sin(a)];
  const bar = (s: 1 | -1): Pt[] => {
    const [ux, uy, nx, ny] = [s * u[0], s * u[1], -s * u[1], s * u[0]];
    const at = (t: number, w: number): Pt => [
      16 + ux * t + nx * w,
      16 + uy * t + ny * w,
    ];
    return [at(2, -1), at(NEEDLE_LEN, -1), at(NEEDLE_LEN, 1), at(2, 1)];
  };
  return ([1, -1] as const)
    .map((s) => {
      const cut = minusDisc(bar(s), dot.c, dot.r + NORTH_GAP);
      return cut.length > 2 ? polyPath(cut, true) : '';
    })
    .join('');
}

/** The dot (about c, radius r) cut off at the circle of radius R about the centre: exact arcs, or the whole dot inside it. */
export function dotInRing({ c, r }: { c: Pt; r: number }, R: number): string {
  const d = Math.hypot(c[0] - C[0], c[1] - C[1]);
  if (d + r <= R) {
    return circleD(c, r);
  }
  // The two circles meet on the line y = yi (the dot is straight above the centre), at x = 16 ± w.
  const cy = c[1];
  const yi = (R * R - r * r - C[1] * C[1] + cy * cy) / (2 * (cy - C[1]));
  const w = Math.sqrt(Math.max(0, r * r - (yi - cy) ** 2));
  const [a, b]: Pt[] = [
    [16 - w, yi],
    [16 + w, yi],
  ];
  // Over the top along the ring's edge; back round the dot's lower side (the long way when the chord is above its centre).
  return `M${P(a)}A${f(R)} ${f(R)} 0 0 1 ${P(b)}A${f(r)} ${f(r)} 0 ${yi < cy ? 1 : 0} 1 ${P(a)}Z`;
}

export const CompassSpec = /* @__PURE__ */ hoverIcon('Compass', {
  hover: { duration: COMPASS_MS / 1000, ease: LINEAR },
  geo: ({ h, entering = 1 }) => {
    const { ring, deg } = compassAt(h, entering);
    const dot = northDot(ring);
    return {
      ring: { d: ringPath(C, 13 + ring, 2) },
      hub: { d: ringPath(C, 2, 2), ...EVENODD },
      needle: { d: needleBars(deg, dot) },
      north: { d: dotInRing(dot, 14 + ring) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Compass32),
});

// ── Hourglass ────────────────────────────────────────────────────────────────
//
// The glass (its caps, walls and neck), the sand line across the top bulb (a
// 2px band, y 11–13, between the empty top and the funnel), and two grains
// (15–17 × 19–21 and 23–25) falling through the bottom bulb to its floor (y 28).
// The glass's inside walls run straight down to x 11 and 21 and turn at
// y 11.67 onto the funnel's diagonals (dx/dy ±0.75) to the neck (y 16).
//
// Hover, one smooth
// motion per part:
//  - the glass grows 1px at its caps (scaled 14/13 about (16, 16) at constant
//    weight, `weightScale`; the parts below ride with it);
//  - the sand line drops 2px (y 13–15), its ends sliding down the funnel's
//    walls, so the bulb above it deepens;
//  - the upper grain drops one place (4px, onto the lower one's spot);
//  - the lower grain drops 5px into the floor, joining it: it's cut at the
//    floor's top and drawn in the glass's even-odd path, so it merges with no
//    seam and is gone when it's all the way in;
//  - a new grain forms at the neck: it grows from nothing (side 0 → 2) as it
//    drops from the neck (y 16) to the upper grain's place.
// The grains keep at least 2px between them throughout.

export const SAND_DROP = 2;
export const GRAIN_STEP = 4;
export const GRAIN_SINK = 5;
/** The glass's scale on hover (at constant weight its caps move 13·(s − 1) = 1px out). */
export const HOURGLASS_GROW = 1 / 13;
const GLASS_OUT =
  'M23 11.67L23 4L26 4L26 2L6 2L6 4L9 4L9 11.67A2 2 0 0 0 9.4 12.87L11.75 16L9.4 19.13A2 2 0 0 0 9 20.33L9 28L6 28L6 30L26 30L26 28' +
  'L23 28L23 20.33A2 2 0 0 0 22.6 19.13L20.25 16L22.6 12.87A2 2 0 0 0 23 11.67Z';
const KNEE = 11 + 2 / 3;
/** The glass's left inside wall at height y (the right mirrors it about x 16). */
const innerWall = (y: number) => (y <= KNEE ? 11 : 12 + 0.75 * (y - 13));

/** The glass, with its sand line's top at y. */
export function glassD(y: number): string {
  const [a, b] = [innerWall(y), innerWall(y + 2)];
  const top =
    y <= KNEE
      ? `M21 4L21 ${f(y)}L11 ${f(y)}L11 4Z`
      : `M21 4L21 ${f(KNEE)}L${f(32 - a)} ${f(y)}L${f(a)} ${f(y)}L11 ${f(KNEE)}L11 4Z`;
  return `${GLASS_OUT}${top}M21 20.33L21 28L11 28L11 20.33L14.25 16L${f(b)} ${f(y + 2)}L${f(32 - b)} ${f(y + 2)}L17.75 16Z`;
}

/** The grains' centres and sides at hover h, in the unscaled drawing: [upper, lower, new]. */
export function grainsAt(h: number): { c: Pt; side: number }[] {
  return [
    { c: [16, 20 + GRAIN_STEP * h], side: 2 },
    { c: [16, 24 + GRAIN_SINK * h], side: 2 },
    { c: [16, 16 + GRAIN_STEP * h], side: 2 * h },
  ];
}

/**
 * The hourglass at hover h, as one even-odd path: the glass, and the grains
 * inside its bottom bulb (ink there). The sinking grain is cut at the floor's
 * top, so it joins the floor in the same path with no seam.
 */
export function hourglassD(h: number): string {
  const s = 1 + HOURGLASS_GROW * h;
  const at = ([x, y]: Pt): Pt => [C[0] + (x - C[0]) * s, C[1] + (y - C[1]) * s];
  const glass = glassD(11 + SAND_DROP * h);
  // The floor's top: y 28, grown (the bulb's edge, moved out of the bulb into the glass as weightScale moves it).
  const floor = C[1] + (28 - C[1]) * s + (s - 1);
  const grains = grainsAt(h).map(({ c, side }) => {
    const [x, y] = at(c);
    const bottom = Math.min(y + side / 2, floor);
    return side > 1e-3 && bottom - (y - side / 2) > 1e-3
      ? rectPath(x - side / 2, y - side / 2, x + side / 2, bottom)
      : '';
  });
  return (h ? weightScale(glass, C, s) : glass) + grains.join('');
}

export const HourglassSpec = /* @__PURE__ */ hoverIcon('Hourglass', {
  geo: ({ h }) => ({ glass: { d: hourglassD(h), ...EVENODD } }),
  static: /* @__PURE__ */ carbonArt(Hourglass32),
});

// ── Lightning ────────────────────────────────────────────────────────────────
//
// Carbon's lightning is its flash drawing (the same path), so it takes
// Flash's hover, from the same geometry.

export const LightningSpec = /* @__PURE__ */ hoverIcon('Lightning', {
  geo: FlashSpec.geo,
  static: /* @__PURE__ */ carbonArt(Lightning32),
});

// ── Phone, Phone off ─────────────────────────────────────────────────────────
//
// Carbon's handset is a filled outline (its curves are cubics, its walls
// about 2px), so it is drawn as Carbon's outline sampled into polygons (even-
// odd: the outside and the hole) and moved as geometry. Hover (on): it grows from its centre
// (16, 16) by 13/12 at constant weight (`weightScaleLoops`), so its outside
// moves 1px out on every side (3–29 → 2–30) and its walls keep their width.
//
// Off: phone--off is the handset under Carbon's "/" slash, cut with a 2px
// gap above the slash and flush below it (the set's Folder off slash). The
// off hover shrinks it to 90% about (16, 16) at constant weight: every point
// scales, then every edge moves back out of the wall by the shrink (0.1px),
// so the walls keep their width (`weightScaleLoops`).

const PHONE_D =
  'M26 29L25.83 29C6.18 27.87 3.39 11.29 3 6.23A3 3 0 0 1 5.76 3L11.27 3A2 2 0 0 1 13.13 4.26L14.65 8A2 2 0 0 1 14.21 10.16' +
  'L12.08 12.31A9.37 9.37 0 0 0 19.66 19.91L21.83 17.76A2 2 0 0 1 24 17.35L27.77 18.86A2 2 0 0 1 29 20.72L29 26A3 3 0 0 1 26 29Z' +
  'M6 5A1 1 0 0 0 5 6L5 6.08C5.46 12 8.41 26 25.94 27A1 1 0 0 0 27 26.06L27 20.72L23.23 19.21L20.36 22.06L19.88 22' +
  'C11.18 20.91 10 12.21 10 12.12L9.94 11.64L12.78 8.77L11.28 5Z';
export const PHONE_LOOPS: Pt[][] = /* @__PURE__ */ (() =>
  PHONE_D.split(/(?=M)/).map((sub) => pathPoints(sub, 0.1)))();
/** The handset's scale on hover (at constant weight its outside moves 12·(s − 1) = 1px out a side). */
export const PHONE_GROW = 1 / 12;
export const PHONE_C: Pt = [16, 16];
const PHONE_SLASH: Slash = {
  a: [29.2929, 2.7071],
  b: [2.7071, 29.2929],
  gapSide: 1,
  gap: 2,
};
/** On → off, the base kicks toward the gap. */
const PHONE_KICK: Pt = [-2, 0];

/** Is p inked by the loops (even-odd)? */
function inked(loops: readonly Pt[][], [x, y]: Pt): boolean {
  let odd = false;
  for (const pts of loops) {
    pts.forEach((a, k) => {
      const b = pts[(k + 1) % pts.length];
      if (
        a[1] <= y !== b[1] <= y &&
        x < a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1])
      ) {
        odd = !odd;
      }
    });
  }
  return odd;
}

/** For each loop, +1 if the ink lies to the left of its edges (screen: (−dy, dx)), −1 if to the right. */
export function inkSides(loops: readonly Pt[][]): (1 | -1)[] {
  return loops.map((pts) => {
    let [best, at] = [0, 0];
    pts.forEach((a, i) => {
      const b = pts[(i + 1) % pts.length];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (l > best) {
        [best, at] = [l, i];
      }
    });
    const [a, b] = [pts[at], pts[(at + 1) % pts.length]];
    const [nx, ny] = [-(b[1] - a[1]) / best, (b[0] - a[0]) / best];
    return inked(loops, [
      (a[0] + b[0]) / 2 + nx * 0.05,
      (a[1] + b[1]) / 2 + ny * 0.05,
    ])
      ? 1
      : -1;
  });
}
export const PHONE_SIDES = /* @__PURE__ */ inkSides(PHONE_LOOPS);

/**
 * Even-odd loops (2px walls) scaled by s about O at constant weight: every
 * point scales, then every edge moves back into its wall by (s − 1) along
 * its normal (mitred at the corners), so the walls keep their width.
 */
export function weightScaleLoops(
  loops: readonly Pt[][],
  sides: readonly (1 | -1)[],
  O: Pt,
  s: number
): Pt[][] {
  if (Math.abs(s - 1) < 1e-9) {
    return loops.map((l) => [...l]);
  }
  const k = s - 1;
  return loops.map((pts, li) => {
    const n = pts.length;
    const normal = (a: Pt, b: Pt): Pt => {
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [
        (sides[li] * -(b[1] - a[1])) / l,
        (sides[li] * (b[0] - a[0])) / l,
      ];
    };
    return pts.map((p, i) => {
      const [n0, n1] = [
        normal(pts[(i + n - 1) % n], p),
        normal(p, pts[(i + 1) % n]),
      ];
      const d = Math.max(0.25, 1 + n0[0] * n1[0] + n0[1] * n1[1]);
      return [
        O[0] + (p[0] - O[0]) * s + (k * (n0[0] + n1[0])) / d,
        O[1] + (p[1] - O[1]) * s + (k * (n0[1] + n1[1])) / d,
      ] as Pt;
    });
  });
}

/** The handset at on-hover hOn (grown), shrunk at constant weight by k (handed to slashShapes pre-grown by 1/k, as Send alt's Off). */
function phoneSpec(k: number): SlashToggleSpec {
  const about =
    (s: number) =>
    ([x, y]: Pt): Pt => [
      PHONE_C[0] + (x - PHONE_C[0]) * s,
      PHONE_C[1] + (y - PHONE_C[1]) * s,
    ];
  return {
    statics: [CPhone, CPhoneOff],
    slash: PHONE_SLASH,
    kick: PHONE_KICK,
    centre: PHONE_C,
    // Growing by sOn and shrinking by k at constant weight is one constant-weight scale by sOn·k.
    base: (hOn) => ({
      strokes: [],
      solids: weightScaleLoops(
        PHONE_LOOPS,
        PHONE_SIDES,
        PHONE_C,
        (1 + PHONE_GROW * hOn) * k
      ).map((l) => l.map(about(1 / k))),
    }),
    solidRule: 'evenodd',
  };
}
/**
 * Carbon's phone--off: the upper piece, and the lower piece run into the
 * slash (one outline with its hole).
 */
const PHONE_OFF_D =
  'M9.19 18.56A25.66 25.66 0 0 1 5 6.08L5 6A1 1 0 0 1 6 5L11.28 5L12.78 8.77L9.94 11.64L10 12.12A13 13 0 0 0 11.46 16.29L12.92 14.83' +
  'A9.34 9.34 0 0 1 12.08 12.31L14.21 10.16A2 2 0 0 0 14.65 8L13.13 4.26A2 2 0 0 0 11.27 3L5.76 3A3 3 0 0 0 3 6.23A28 28 0 0 0 7.79 20Z' +
  'M27.77 18.86L24 17.35A2 2 0 0 0 21.83 17.76L19.66 19.91A9.17 9.17 0 0 1 15.45 18L30 3.41L28.59 2L2 28.59L3.41 30L10.41 23' +
  'C13.79 26.18 18.69 28.62 25.8 29L26 29A3 3 0 0 0 29 26L29 20.72A2 2 0 0 0 27.77 18.86Z' +
  'M27 26L27 26.06A1 1 0 0 1 25.94 27C19.43 26.63 14.94 24.46 11.83 21.58L14 19.44A10.77 10.77 0 0 0 19.88 22L20.36 22.06L23.23 19.21L27 20.72Z';

/**
 * Phone at hover h, slash p and kick e. At rest in either state it is
 * Carbon's own path (as Moon rests on its own): Chrome flattens Carbon's
 * cubics a little off the true curve, so the sampled outline, true to the
 * curve, would sit up to 0.47% (phone--off at 20px) from it. In motion it is
 * the sampled outline, moved, shrunk and cut as geometry; the two differ by
 * no more than that sub-pixel flattening.
 */
export function phoneShapes(fr: ToggleFrame): Shapes {
  const shapes = slashShapes(phoneSpec(1 - OFF_SHRINK * fr.h * fr.p), fr);
  if (fr.h || fr.e || (fr.p !== 0 && fr.p !== 1)) {
    return shapes;
  }
  return {
    ...shapes,
    slash: { d: '' },
    solid: { d: fr.p ? PHONE_OFF_D : PHONE_D, fillRule: 'evenodd' },
  };
}

/** Phone ⇄ Phone off. `toggled` shows Phone off. */
export const PhoneOffToggleSpec = /* @__PURE__ */ toggleIcon<'on' | 'off'>(
  'PhoneOffToggle',
  {
    states: ['on', 'off'],
    statics: [CPhone, CPhoneOff],
    geo: phoneShapes,
    change: slashChange,
  }
);
export const PhoneSpec = /* @__PURE__ */ hoverIcon('Phone', {
  geo: ({ h }) => phoneShapes({ h, p: 0, e: 0 }),
  static: /* @__PURE__ */ carbonArt(Phone32),
});
export const PhoneOffSpec = /* @__PURE__ */ hoverIcon('PhoneOff', {
  geo: ({ h }) => phoneShapes({ h, p: 1, e: 0 }),
  static: /* @__PURE__ */ carbonArt(PhoneOff32),
});

// ── Connection signal, and off ───────────────────────────────────────────────
//
// Carbon's mast (x 15–17, y 12–30) and two pairs of waves, 2px arcs with
// radial ends: the inner pair r 5–7 about (16, 13), 48.2° either side of the
// horizontal; the outer pair r 9–11 about (15, 13) on the left and (17, 13)
// on the right, 53.13° either side. Every part is its centreline (cut by the
// slash as the Off art is).
//
// Hover (on): a pulse out one wavelength, 280ms on the standard ease (between moderate-02 and
// slow-01), its leave 205ms. The mast extends 2px up
// (its foot held) and every wave rises 2px with it, both ways. The pulse is
// one-shot, only on the way in, landing back on Carbon's drawing (2px up):
//  - the inner waves travel out to the outer waves' place: centreline r 6 → 10,
//    centre (16, 13) → (15, 13) / (17, 13), half-angle 48.2° → 53.13°;
//  - the outer waves travel on out one spacing (r 10 → 14), trimming toward
//    their middles to a quarter of their length by 0.7 of the
//    pulse, where they blink off in one step;
//  - new inner waves emerge from the mast's top: they grow from nothing (a
//    wedge of the inner wave's angle, r 0 → 2, until their inner edge leaves
//    the centre) out to the inner waves' place, r 6.
// Every wave keeps its 2px wall (but the emerging wedge, growing in); the
// travelling waves keep 2px between them, and the emerging wave at least 2px
// from the one ahead. Leaving shows the resting drawing (the pulse has landed
// on it), lowering the 2px. In the toggle the pulse and the rise run on their
// own hover number (`pulse`, on this timing), so the Off hover keeps its
// standard timing; the pulse plays only while it rests on (p 0), and the rise
// fades as the slash draws (2px · (1 − p)), so the off state is unchanged.
//
// Off: connection-signal--off is the resting drawing under Carbon's
// "\" slash, with a 2px gap above it (the right waves' lower ends cut flush)
// and the parts below running flush into it (the left waves, the mast). Above
// the slash the mast and the left waves' tops are gone: they lie inside the
// slash and its gap (but for a 0.29px² corner of the mast), so they're removed
// whole (cut square ABOVE side units out, past anything the kick or the hover
// can bring there) rather than cut flush, which would leave slivers beyond the
// gap while the base kicks toward it.

const INNER_HALF = Math.atan2(5.22, 4.67);
const OUTER_HALF = Math.atan2(8.8, 6.6);
/** When (pulse progress) the outgoing waves, trimmed to a quarter, blink off. */
export const OUTGOING_GONE = 0.7;
/** How much of their length the outgoing waves trim away before they blink off (to 25%). */
export const OUTGOING_TRIM = 0.75;
/** How far the mast extends up, and the waves rise with it. */
export const SIGNAL_RISE = 2;
/** The pulse's timing: 280ms (between moderate-02 and slow-01) on the standard ease. */
export const SIGNAL_HOVER = {
  duration: 0.28,
  ease: /* @__PURE__ */ toEasing(motionTokens.easing.standard),
};
const arc = (c: Pt, r: number, mid: number, half: number): Seg => ({
  k: 'A',
  c,
  r,
  t0: mid - half,
  t1: mid + half,
});
/** Side units from the slash within which the parts above it are removed whole. */
const ABOVE = 8;
const SIGNAL_SLASH: Slash = {
  a: [2.7071, 2.7071],
  b: [29.2929, 29.2929],
  gapSide: -1,
  gap: 2,
};

/** The pulse at progress q: each wave's centre offset (out from x 16), centreline radius and half-angle. */
export function signalPulse(q: number) {
  const lerp = (a: number, b: number) => a + (b - a) * q;
  return {
    travelling: { dx: q, r: lerp(6, 10), half: lerp(INNER_HALF, OUTER_HALF) },
    outgoing: {
      dx: 1,
      r: 10 + 4 * q,
      half:
        q >= OUTGOING_GONE
          ? 0
          : OUTER_HALF * (1 - (OUTGOING_TRIM * q) / OUTGOING_GONE),
    },
    emerging: { dx: 0, r: 6 * q, half: INNER_HALF },
  };
}

/** The mast and the waves' centrelines at pulse progress q, risen `rise` (the emerging waves only once they're a full band). */
export function signalStrokes(q: number, rise = 0) {
  const { travelling: t, outgoing: o, emerging: n } = signalPulse(q);
  const y = 13 - rise;
  const pair = (
    w: { dx: number; r: number; half: number },
    leftSquare: boolean
  ) =>
    w.half < 1e-4 || w.r < 1
      ? []
      : [
          leftSquare
            ? {
                path: [arc([16 - w.dx, y], w.r, Math.PI, w.half)],
                square: ABOVE,
              }
            : [arc([16 - w.dx, y], w.r, Math.PI, w.half)],
          [arc([16 + w.dx, y], w.r, 0, w.half)],
        ];
  return [
    { path: [L([16, 12 - rise], [16, 30])], square: ABOVE },
    ...pair(t, true),
    ...pair(o, true),
    ...(n.r > 1 ? pair(n, true) : []),
  ];
}

/** The emerging waves while they're still growing in: wedges of radius 2r about the waves' centre (16, 13 − rise). */
function emergingWedges(q: number, rise: number): string {
  const r = signalPulse(q).emerging.r;
  if (r <= 1e-4 || r > 1) {
    return '';
  }
  const R = 2 * r;
  return [Math.PI, 0]
    .map((mid) => {
      const n = 24;
      const pts: Pt[] = [[16, 13 - rise]];
      for (let i = 0; i <= n; i++) {
        const a = mid - INNER_HALF + (2 * INNER_HALF * i) / n;
        pts.push([16 + R * Math.cos(a), 13 - rise + R * Math.sin(a)]);
      }
      return polyPath(pts, true);
    })
    .join('');
}

/** The resting drawing's spec, as the Off icon draws it. */
const SIGNAL: SlashToggleSpec = {
  statics: [CConnectionSignal, CConnectionSignalOff],
  slash: SIGNAL_SLASH,
  kick: [2, 0],
  centre: [16, 17],
  base: () => ({ strokes: signalStrokes(0) }),
};

/**
 * Connection signal at hover h (the Off hover), pulse progress `pulse` (its own
 * hover number; h where there's none), slash p and kick e: the pulse plays (on
 * the way in) only while it rests on; the rise fades as the slash draws.
 */
export function signalShapes(fr: ToggleFrameIn): Shapes {
  const pulse = fr.pulse ?? fr.h;
  const q = fr.p === 0 && (fr.entering ?? 1) ? pulse : 0;
  const rise = SIGNAL_RISE * pulse * (1 - fr.p);
  const shapes = slashShapes(
    { ...SIGNAL, base: () => ({ strokes: signalStrokes(q, rise) }) },
    fr
  );
  const wedges = q ? emergingWedges(q, rise) : '';
  return wedges
    ? { ...shapes, fill: { d: String(shapes.fill.d) + wedges } }
    : shapes;
}

/** Connection signal ⇄ Connection signal off. `toggled` shows Connection signal off. */
export const ConnectionSignalOffToggleSpec = /* @__PURE__ */ toggleIcon<
  'on' | 'off'
>('ConnectionSignalOffToggle', {
  states: ['on', 'off'],
  statics: SIGNAL.statics,
  geo: signalShapes,
  change: slashChange,
  hovers: { pulse: { hover: SIGNAL_HOVER } },
});
export const ConnectionSignalOffSpec = /* @__PURE__ */ withStatic(
  makeOffIcon('ConnectionSignalOff', SIGNAL),
  /* @__PURE__ */ carbonArt(ConnectionSignalOff32)
);
export const ConnectionSignalSpec = /* @__PURE__ */ hoverIcon(
  'ConnectionSignal',
  {
    hover: SIGNAL_HOVER,
    geo: ({ h, entering }) => signalShapes({ h, p: 0, e: 0, entering }),
    static: /* @__PURE__ */ carbonArt(ConnectionSignal32),
  }
);

// ── Previous outline / filled ────────────────────────────────────────────────
//
// Carbon's previous--outline is next--outline mirrored about x 16 (the ring,
// and the arrow pointing left: tail at x 24, tip at (8, 16)); previous--
// filled is a disc of r 14 with that arrow knocked out. Next's geometry,
// mirrored: the ring's centreline (or the disc) grows 1px in radius and the
// arrow reaches 2px left, its tail holding. The fill is a disc to the ring's
// centreline in one even-odd path with the arrow (as Next's).

/** The arrow at hover h: Next's, mirrored. */
export const previousArrow = (h: number): Pt[] =>
  nextArrow(h).map(([x, y]) => [32 - x, y] as Pt);

export function previousShapes(h: number, p: number, e: number): Shapes {
  const r = 13 + h;
  return {
    ring: { d: ringPath(C, r, 2) },
    glyph: {
      d:
        circleD(C, r * p) +
        circleD(C, r * e) +
        polyPath(previousArrow(h), true),
      ...EVENODD,
    },
  };
}

const previous = /* @__PURE__ */ fillSet(
  'PreviousOutline',
  'PreviousFilled',
  'PreviousToggle',
  [CPreviousOutline, CPreviousFilled],
  previousShapes
);
export const PreviousOutlineSpec = /* @__PURE__ */ withStatic(
  previous.outline,
  /* @__PURE__ */ carbonArt(PreviousOutline32)
);
export const PreviousFilledSpec = /* @__PURE__ */ withStatic(
  previous.filled,
  /* @__PURE__ */ carbonArt(PreviousFilled32)
);
export const PreviousToggleSpec = previous.toggle;

// ── Chevron sort up ──────────────────────────────────────────────────────────
//
// Chevron sort down mirrored: the chevron (Carbon's, its 16px drawing the
// same) slides 2px up.

const CHEV_SORT_UP: Pt[] = [
  [16, 4],
  [23, 11],
  [21.6, 12.4],
  [16, 6.8],
  [10.4, 12.4],
  [9, 11],
];
export const SORT_UP_REACH = 2;
export const ChevronSortUpSpec = /* @__PURE__ */ hoverIcon('ChevronSortUp', {
  geo: ({ h }) => ({
    up: {
      d: polyPath(
        CHEV_SORT_UP.map(([x, y]) => [x, y - SORT_UP_REACH * h] as Pt),
        true
      ),
    },
  }),
  static: /* @__PURE__ */ carbonArt(ChevronSortUp16, ChevronSortUp32),
});
