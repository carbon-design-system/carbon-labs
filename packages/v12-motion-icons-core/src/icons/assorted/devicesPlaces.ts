/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Camera32 from '@carbon/icons/es/camera/32.js';
import Devices32 from '@carbon/icons/es/devices/32.js';
import Mobile32 from '@carbon/icons/es/mobile/32.js';
import Asset32 from '@carbon/icons/es/asset/32.js';
import Development32 from '@carbon/icons/es/development/32.js';
import Blog32 from '@carbon/icons/es/blog/32.js';
import BareMetalServer32 from '@carbon/icons/es/bare-metal-server/32.js';
import SysProvision32 from '@carbon/icons/es/sys-provision/32.js';
import ServiceDesk32 from '@carbon/icons/es/service-desk/32.js';
import Construction32 from '@carbon/icons/es/construction/32.js';
import Industry32 from '@carbon/icons/es/industry/32.js';
import Globe32 from '@carbon/icons/es/globe/32.js';
import Timer32 from '@carbon/icons/es/timer/32.js';
import Snow32 from '@carbon/icons/es/snow/32.js';
import ShoppingBag32 from '@carbon/icons/es/shopping--bag/32.js';
import Apple32 from '@carbon/icons/es/apple/32.js';
import Person32 from '@carbon/icons/es/person/32.js';
import EventsAlt32 from '@carbon/icons/es/events--alt/32.js';
import VolumeDown32 from '@carbon/icons/es/volume--down/32.js';
import VolumeDownFilled32 from '@carbon/icons/es/volume--down--filled/32.js';
import FaceDissatisfied32 from '@carbon/icons/es/face--dissatisfied/32.js';
import FaceDissatisfiedFilled32 from '@carbon/icons/es/face--dissatisfied--filled/32.js';
import Keyboard32 from '@carbon/icons/es/keyboard/32.js';
import KeyboardOff32 from '@carbon/icons/es/keyboard--off/32.js';
import VolumeUp32 from '@carbon/icons/es/volume--up/32.js';
import VolumeUpFilled32 from '@carbon/icons/es/volume--up--filled/32.js';
import VolumeMute32 from '@carbon/icons/es/volume--mute/32.js';
import VolumeMuteFilled32 from '@carbon/icons/es/volume--mute--filled/32.js';
import {
  carbonArt,
  defineAction,
  fillThenClear,
  hoverIcon,
  specStill,
  stateIcon,
  toggleIcon,
  variantToggle,
  type ActionInput,
  type CarbonIcon,
  type StateIconProps,
  type Frame,
  type Shapes,
  type StateTweenFn,
  type ToggleFrame,
  type ToggleFrameIn,
  withStatic,
} from '../../engine';
import {
  circlePts,
  clipConvex,
  mapPath,
  pathPoints,
  polyPath,
  rectPath,
  ringPath,
  scalePath,
  scalePts,
  shapeFillPath,
  type Pt,
} from '../../geometry';
import { cutPoly, growPoly, mapSegs, type HalfPlane } from '../../cut';
import {
  cutBase,
  filletSegs,
  OFF_SHRINK,
  slashPath,
  SLASH_REACH,
  type Slash,
} from '../../off';
import { kickAmount, slashChange } from '../../utils/slashToggle';
import { cubicBezier, ENTRANCE, EXIT } from '../../ease';
import { motionTokens, toEasing } from '../../tokens';
import { EVENODD, f, lerp } from '../../paint';
import {
  grown,
  personShapes,
  type Person as PersonArt,
} from '../people/people';
import {
  circleD,
  OUTGOING_GONE,
  OUTGOING_TRIM,
  SIGNAL_HOVER,
  weightScaleLoops,
  type Smile,
} from './peopleMoney';
import { areaCentroid } from '../toggle/stateFillToggles';
import { cloudLoops, type Circle, type CloudArt, type Run } from './objectsA';

const CFaceDissatisfied = /* @__PURE__ */ carbonArt(FaceDissatisfied32);
const CFaceDissatisfiedFilled = /* @__PURE__ */ carbonArt(
  FaceDissatisfiedFilled32
);
const CKeyboard = /* @__PURE__ */ carbonArt(Keyboard32);
const CKeyboardOff = /* @__PURE__ */ carbonArt(KeyboardOff32);
const CVolumeUp = /* @__PURE__ */ carbonArt(VolumeUp32);
const CVolumeUpFilled = /* @__PURE__ */ carbonArt(VolumeUpFilled32);
const CVolumeMute = /* @__PURE__ */ carbonArt(VolumeMute32);
const CVolumeMuteFilled = /* @__PURE__ */ carbonArt(VolumeMuteFilled32);

/**
 * Devices, places and people on the frame engine: Camera, Devices, Mobile,
 * Keyboard (and Keyboard off, with the toggle), Asset, Development, Blog,
 * Bare metal server, Sys provision, Service desk, Construction, Industry,
 * Globe, Timer, Snow, Shopping bag, Apple, Person, Events alt, Face
 * dissatisfied (outline, filled and the toggle), Volume up, Volume down and
 * Volume mute (outline and filled), the Volume up fill toggle and the Volume level
 * toggles (outline and filled). Carbon has one (32px) drawing of each, so
 * one geometry serves every size, and each rests on Carbon's drawing. On
 * hover the parts move as geometry at a constant 2px wall: points move,
 * nothing is transform-scaled, no masks or clip paths. Standard hover (160ms
 * entrance in, 120ms exit out) unless noted.
 *
 *  - Camera: the body grows 1px a side; the viewfinder hump rides up 1px; the
 *    lens grows 1px in radius (5 → 6), its 2px to the bottom wall held.
 *  - Devices: the monitor grows 1px a side (Screen's), the phone 1px up and
 *    right from its bottom-left; the monitor's ends beside the phone draw back
 *    1px, so their 2px gaps hold; the neck shortens 4 → 3px.
 *  - Mobile: grows 1px a side; the earpiece band rides up 1px.
 *  - Keyboard: the case grows 1px a side; the keys hold.
 *  - Keyboard off (and the toggle): the standard slash and the Off rule.
 *  - Asset: every circle grows 1px in radius in place; the belt is rebuilt
 *    tangent to the grown wheels.
 *  - Development: the three loose blocks lift 1px up and left together.
 *  - Blog: the header grows 1px down; the lines and the picture ride 1px down
 *    with it; the picture shrinks 1px overall (10 → 9px).
 *  - Bare metal server: each unit widens 1px a side; the 2px gaps hold.
 *  - Sys provision: the play triangle grows 20% and both rings 1px in
 *    radius; the outer ring's ends draw back so their spaces to the triangle
 *    stay as the triangle alone leaves them; the inner ring is cut 2px round
 *    the triangle where it comes nearer.
 *  - Service desk: the dome grows 1px in radius and the knob is pushed all
 *    the way in (stem 2.05 → 0), seated on the dome, held while hovered.
 *  - Construction: the worker leans 10° forward about the hip and his hands
 *    slide 2px further along the handle; the shovel pushes 2px into the pile.
 *  - Industry: the chimney rises 2px.
 *  - Globe: a meridian swings 120° round the holder's tilted axis, past
 *    edge-on, to rest as a curve; the ball and holder grow 1px; the base
 *    widens 1px a side.
 *  - Timer: the ring grows 1px in radius, the hand sweeps 45°; the crown and
 *    lever ride out 1px.
 *  - Snow: the cloud grows from its base; the three flakes fall away,
 *    shrinking into 1px diamonds, as two new ones grow from 1px diamonds under
 *    the cloud into place, and the other way round on the way out.
 *  - Shopping bag: the bag grows 1px a side and the handle lifts 2px from it.
 *  - Apple: the apple swells 1.5px a side; the leaf grows, its tip 2px out.
 *  - Person, Events alt: the People family motion.
 *  - Face dissatisfied (and filled): the ring grows 1px; the frown's ends
 *    droop 1px further round.
 *  - Volume up, Volume down (and filled): each wave grows 1px in radius in
 *    place. Their action (trigger()) is Connection signal's pulse, 240ms;
 *    the wave passing the last place keeps its 2px weight and shrinks toward
 *    its middle as Connection signal's outer waves do, to a quarter by 0.7 of
 *    the travel, then off (no fade).
 *  - Volume mute (and filled): Carbon's volume--mute; the ×'s arm ends reach
 *    1px further; the speaker holds.
 *
 * Toggles
 *  - Keyboard ⇄ Keyboard off: the standard slash (see Keyboard).
 *  - Face dissatisfied ⇄ filled, Volume up ⇄ filled: the house disc fill
 *    (`fillThenClear`): one disc from one centre, 160ms in on the entrance
 *    ease; emptying, a hole from the same centre, 120ms on the exit ease.
 *  - Volume level (outline and filled): mute → quiet → loud → mute, a click a
 *    step, and `muted` from any level; the speaker holds; the waves grow out
 *    of it and travel out between levels; into mute they cut to the × (a
 *    120ms match cut), and back the same way (see Volume).
 *
 * Not built: none of these is a badge icon (a base with an inset status
 * mark); each mark here (the lens, the play triangle, the keys) is part of
 * its object.
 */

const C: Pt = [16, 16];
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** The outline ⇄ filled toggle and its two ends as hover icons. */
/* @__NO_SIDE_EFFECTS__ */
function fillSet(
  names: [outline: string, filled: string, toggle: string],
  statics: readonly [CarbonIcon, CarbonIcon],
  shapes: (f: ToggleFrameIn) => Shapes,
  hover?: { duration: number; ease: [number, number, number, number] }
) {
  return {
    outline: hoverIcon(names[0], {
      hover,
      geo: ({ h, entering }) => shapes({ h, p: 0, e: 0, entering }),
    }),
    filled: hoverIcon(names[1], {
      hover,
      geo: ({ h, entering }) => shapes({ h, p: 1, e: 0, entering }),
    }),
    toggle: toggleIcon<'outline' | 'filled'>(names[2], {
      states: ['outline', 'filled'],
      statics,
      geo: shapes,
      change: fillThenClear,
      hover,
    }),
  };
}

// ── Camera ───────────────────────────────────────────────────────────────────
//
// The body (2–30 × 7–26, r 1 outer corners, inside 4–28 × 9–24) with its
// viewfinder hump (x 9.46–22.54, up to y 4) and the lens, a ring r 4–6 about
// the centre. Hover: every point left of the hump moves 1px left, right of it
// 1px right, above the lens 1px up and below it 1px down; the hump's points
// only rise.

const CAMERA_BODY =
  'M29 26H3A1 1 0 0 1 2 25V8A1 1 0 0 1 3 7H9.46L11.17 4.45A1 1 0 0 1 12 4H20A1 1 0 0 1 20.83 4.45L22.54 7H29A1 1 0 0 1 30 8V25A1 1 0 0 1 29 26Z' +
  'M4 24H28V9H22A1 1 0 0 1 21.17 8.55L19.46 6H12.54L10.83 8.55A1 1 0 0 1 10 9H4Z';
export const CAMERA_GROW = 1;

export const CameraSpec = /* @__PURE__ */ hoverIcon('Camera', {
  geo: ({ h }) => {
    const g = CAMERA_GROW * h;
    const move = ([x, y]: Pt): Pt => [
      x < 9 ? x - g : x > 23 ? x + g : x,
      y < 10 ? y - g : y > 23 ? y + g : y,
    ];
    return {
      body: { d: h ? mapPath(CAMERA_BODY, move) : CAMERA_BODY, ...EVENODD },
      lens: { d: ringPath(C, 5 + g, 2), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(Camera32),
});

// ── Devices ──────────────────────────────────────────────────────────────────
//
// The phone (2–12 × 14–30, r 2 outer corners) in front of the monitor (4–30
// × 4–22): its left wall stops at y 12 and its bottom edge at x 14, 2px
// from the phone; the neck (x 16–18) runs down to the base (14–23 × 26–28).
//
// Hover: the monitor
// grows 1px a side (Screen's motion) and the phone 1px up and 1px right from
// its bottom-left corner. The monitor's ends beside the phone draw back with
// it, so their 2px gaps hold: the left wall's end 1px up (y 12 → 11), the
// bottom edge's end and the base's left end 1px right (x 14 → 15). The neck
// shortens 4 → 3px onto the base.

const DEVICES_PHONE =
  'M10 30H4A2 2 0 0 1 2 28V16A2 2 0 0 1 4 14H10A2 2 0 0 1 12 16V28A2 2 0 0 1 10 30ZM4 16V28H10V16Z';
const DEVICES_MONITOR =
  'M28 4H6A2 2 0 0 0 4 6V12H6V6H28V20H14V22H16V26H14V28H23V26H18V22H28A2 2 0 0 0 30 20V6A2 2 0 0 0 28 4Z';
export const MONITOR_GROW = 1;
export const PHONE_GROW = 1;

export const DevicesSpec = /* @__PURE__ */ hoverIcon('Devices', {
  geo: ({ h }) => {
    const [g, q] = [MONITOR_GROW * h, PHONE_GROW * h];
    // The walls step out; the ends beside the phone draw back as it grows; the stand's foot holds.
    const monitor = ([x, y]: Pt): Pt => [
      x <= 6 ? x - g : x >= 28 ? x + g : x === 14 ? x + q : x,
      y <= 6 ? y - g : y === 12 ? y - q : y >= 20 && y <= 22 ? y + g : y,
    ];
    const phone = ([x, y]: Pt): Pt => [
      x >= 10 ? x + q : x,
      y <= 16 ? y - q : y,
    ];
    return {
      phone: {
        d: h ? mapPath(DEVICES_PHONE, phone) : DEVICES_PHONE,
        ...EVENODD,
      },
      monitor: { d: h ? mapPath(DEVICES_MONITOR, monitor) : DEVICES_MONITOR },
    };
  },
  static: /* @__PURE__ */ carbonArt(Devices32),
});

// ── Mobile ───────────────────────────────────────────────────────────────────
//
// The case (8–24 × 4–30, r 2 outer corners), its earpiece band (inside
// 10–22 × 6–8) over the rule (y 8–10) and the screen (10–22 × 10–28).

const MOBILE =
  'M22 4H10A2.002 2.002 0 0 0 8 6V28A2.0023 2.0023 0 0 0 10 30H22A2.0027 2.0027 0 0 0 24 28V6A2.0023 2.0023 0 0 0 22 4Z' +
  'M22 6L22 8H10V6ZM10 28V10H22L22 28Z';
export const MOBILE_GROW = 1;

export const MobileSpec = /* @__PURE__ */ hoverIcon('Mobile', {
  geo: ({ h }) => {
    const g = MOBILE_GROW * h;
    const move = ([x, y]: Pt): Pt => [
      x < 16 ? x - g : x + g,
      y <= 10 ? y - g : y >= 28 ? y + g : y,
    ];
    return { mobile: { d: h ? mapPath(MOBILE, move) : MOBILE, ...EVENODD } };
  },
  static: /* @__PURE__ */ carbonArt(Mobile32),
});

// ── Keyboard, Keyboard off ───────────────────────────────────────────────────
//
// The case is a 2px centreline (3–29 × 9–25, r 1 fillets: Carbon's r 2 outer
// corners about a square inside), drawn as two open strokes meeting halfway
// down each side wall (one fill path, so no seam): the top half and the
// bottom half. The keys are Carbon's solid rects.
//
// Hover (on): the case grows 1px a side; the keys hold.
//
// Off: keyboard--off is the keyboard under Carbon's "\" slash, its 2px gap
// above the slash. Above it the top edge is cut flush along the gap and the
// right wall square at y 23 (so the top half is cut flush, the bottom half
// square, 4.24 side units out); below it the case runs flush into the slash.
// Of the keys, those the slash crosses below it run flush into it (two keys
// and the space bar); the three above it are removed whole as the slash
// passes (as Carbon removes them, though one reaches past the gap); the rest
// are whole (Carbon keeps two whose corners dip 0.17px into the gap). The off
// hover is the Off rule: the case shrinks to 90% about (16, 17) at constant
// weight, the keys' places with it (each key keeps its size), and the slash
// reaches 1px further at each end.

const KB_SLASH: Slash = {
  a: [2.7071, 2.7071],
  b: [29.2929, 29.2929],
  gapSide: -1,
  gap: 2,
};
const KB_CENTRE: Pt = [16, 17];
const KB_KICK: Pt = [2, 0];
export const KEYBOARD_GROW = 1;
type Key = { r: [number, number, number, number]; cut?: 'flush' | 'gone' };
const KEYS: Key[] = [
  { r: [6, 12, 8, 14] },
  { r: [10, 12, 12, 14], cut: 'flush' },
  { r: [14, 12, 16, 14], cut: 'gone' },
  { r: [18, 12, 20, 14] },
  { r: [22, 12, 26, 14] },
  { r: [6, 16, 8, 18] },
  { r: [10, 16, 12, 18] },
  { r: [14, 16, 16, 18], cut: 'flush' },
  { r: [18, 16, 20, 18], cut: 'gone' },
  { r: [22, 16, 26, 18] },
  { r: [6, 20, 8, 22] },
  { r: [10, 20, 21, 22], cut: 'flush' },
  { r: [23, 20, 26, 22], cut: 'gone' },
];
/** Side units from the slash at which Carbon cuts the right wall square (its centreline at y 23). */
const KB_SQUARE = (29 - 23) / Math.SQRT2;

function slashFrame(sl: Slash) {
  const l = Math.hypot(sl.b[0] - sl.a[0], sl.b[1] - sl.a[1]);
  const u: Pt = [(sl.b[0] - sl.a[0]) / l, (sl.b[1] - sl.a[1]) / l];
  const n: Pt = [-u[1], u[0]];
  return { u, n, c: n[0] * sl.a[0] + n[1] * sl.a[1], l };
}

/** Keyboard at hover h, slash p and kick e (both the hover icons and the toggle). */
export function keyboardShapes({ h, p, e }: ToggleFrame): Shapes {
  const k = 1 - OFF_SHRINK * h * p;
  const amount = kickAmount(e);
  const [tx, ty] = [KB_KICK[0] * amount, KB_KICK[1] * amount];
  const m = { s: k, origin: KB_CENTRE, deg: 0, pivot: KB_CENTRE, tx, ty };
  const g = KEYBOARD_GROW * h * (1 - p);
  const [l, r, t, b] = [3 - g, 29 + g, 9 - g, 25 + g];
  const top = filletSegs(
    [
      [r, 17],
      [r, t],
      [l, t],
      [l, 17],
    ],
    1
  );
  const bottom = filletSegs(
    [
      [l, 17],
      [l, b],
      [r, b],
      [r, 17],
    ],
    1
  );
  const reach = SLASH_REACH * h;
  const [a, z] = [
    cutBase([mapSegs([top], m)[0]], KB_SLASH, p, reach),
    cutBase(
      [{ path: mapSegs([bottom], m)[0], square: KB_SQUARE }],
      KB_SLASH,
      p,
      reach
    ),
  ];
  // The keys: each keeps its size, its centre moving with the case; cut by the slash behind its head.
  const { u, n, c, l: len } = slashFrame(KB_SLASH);
  const s = KB_SLASH.gapSide;
  const head =
    u[0] * KB_SLASH.a[0] + u[1] * KB_SLASH.a[1] - reach + (len + 2 * reach) * p;
  const behind: HalfPlane[] = [
    { n: [s * n[0], s * n[1]], c: s * c - 1 },
    { n: [-u[0], -u[1]], c: -head },
  ];
  const keys = KEYS.map(({ r: [x0, y0, x1, y1], cut }) => {
    const [cx, cy] = [(x0 + x1) / 2, (y0 + y1) / 2];
    const [X, Y] = [
      KB_CENTRE[0] + (cx - KB_CENTRE[0]) * k + tx,
      KB_CENTRE[1] + (cy - KB_CENTRE[1]) * k + ty,
    ];
    const [hw, hh] = [(x1 - x0) / 2, (y1 - y0) / 2];
    const poly: Pt[] = [
      [X - hw, Y - hh],
      [X + hw, Y - hh],
      [X + hw, Y + hh],
      [X - hw, Y + hh],
    ];
    if (!cut || p <= 1e-4) {
      return polyPath(poly, true);
    }
    return cutPoly(poly, behind)
      .map((q) => polyPath(q, true))
      .join('');
  });
  return {
    fill: { d: a.fill + z.fill },
    keys: { d: keys.join('') },
    slash: { d: slashPath(KB_SLASH, reach, p) },
  };
}

/** Keyboard ⇄ Keyboard off. `toggled` shows Keyboard off. */
export const KeyboardOffToggleSpec = /* @__PURE__ */ toggleIcon<'on' | 'off'>(
  'KeyboardOffToggle',
  {
    states: ['on', 'off'],
    statics: [CKeyboard, CKeyboardOff],
    geo: keyboardShapes,
    change: slashChange,
  }
);
export const KeyboardSpec = /* @__PURE__ */ hoverIcon('Keyboard', {
  geo: ({ h }) => keyboardShapes({ h, p: 0, e: 0 }),
  static: /* @__PURE__ */ carbonArt(Keyboard32),
});
export const KeyboardOffSpec = /* @__PURE__ */ hoverIcon('KeyboardOff', {
  geo: ({ h }) => keyboardShapes({ h, p: 1, e: 0 }),
  static: /* @__PURE__ */ carbonArt(KeyboardOff32),
});

// ── Asset ────────────────────────────────────────────────────────────────────
//
// A wheel (a ring r 8–10 about (12, 20)) with its hub (a ring r 2–4) and a
// belt to a pulley (r 2–4 about (26, 6)). The silhouette is the hull of the
// wheel's and pulley's outsides: Carbon's runs are their outer tangents. The
// belt is 2px: its inside edges are the tangents of circles 2px smaller,
// cut where they meet the wheel's and the pulley's outsides. Built from those
// numbers, as exact arcs, at any growth g: every radius grows by g.

const WHEEL: Pt = [12, 20];
const PULLEY: Pt = [26, 6];
export const ASSET_GROW = 1;

/** The silhouette and the belt's opening at growth g. */
export function assetD(g: number): string {
  const [R, r] = [10 + g, 4 + g];
  const [dx, dy] = [PULLEY[0] - WHEEL[0], PULLEY[1] - WHEEL[1]];
  const D = Math.hypot(dx, dy);
  const u: Pt = [dx / D, dy / D];
  const w: Pt = [-u[1], u[0]];
  // Each run's normal n (its tangent points are c − radius·n): n·u = (r − R)/D, ± the perpendicular part.
  const a = (r - R) / D;
  const b = Math.sqrt(1 - a * a);
  const [n1, n2]: Pt[] = [
    [a * u[0] + b * w[0], a * u[1] + b * w[1]],
    [a * u[0] - b * w[0], a * u[1] - b * w[1]],
  ];
  /** Along a run, toward the pulley. */
  const along = (nn: Pt): Pt => {
    const sgn = Math.sign(-nn[1] * u[0] + nn[0] * u[1]);
    return [-nn[1] * sgn, nn[0] * sgn];
  };
  const at = (c: Pt, nn: Pt, d: number, t = 0, tau: Pt = [0, 0]): Pt => [
    c[0] - nn[0] * d + tau[0] * t,
    c[1] - nn[1] * d + tau[1] * t,
  ];
  const [T1, S1, S2, T2] = [
    at(WHEEL, n1, R),
    at(PULLEY, n1, r),
    at(PULLEY, n2, r),
    at(WHEEL, n2, R),
  ];
  const outer = `M${P(T1)}L${P(S1)}A${f(r)} ${f(r)} 0 0 1 ${P(S2)}L${P(T2)}A${f(R)} ${f(R)} 0 1 1 ${P(T1)}Z`;
  // The opening: each run's inside edge (the tangent 2px in) between the wheel's and the pulley's outsides.
  const inner = (nn: Pt) => {
    const tau = along(nn);
    const tw = Math.sqrt(R * R - (R - 2) ** 2);
    const tp = Math.sqrt(r * r - (r - 2) ** 2);
    return [
      at(WHEEL, nn, R - 2, tw, tau),
      at(PULLEY, nn, r - 2, -tp, tau),
    ] as const;
  };
  const [[P1, P2], [P4, P3]] = [inner(n1), inner(n2)];
  const opening = `M${P(P1)}L${P(P2)}A${f(r)} ${f(r)} 0 0 0 ${P(P3)}L${P(P4)}A${f(R)} ${f(R)} 0 0 0 ${P(P1)}Z`;
  return outer + opening + circleD(WHEEL, R - 2) + circleD(PULLEY, r - 2);
}

export const AssetSpec = /* @__PURE__ */ hoverIcon('Asset', {
  geo: ({ h }) => {
    const g = ASSET_GROW * h;
    return {
      wheel: { d: assetD(g), ...EVENODD },
      hub: { d: ringPath(WHEEL, 3 + g, 2), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(Asset32),
});

// ── Development ──────────────────────────────────────────────────────────────
//
// Three loose blocks (8px frames) beside the stack, a staircase of six cells.

const DEV_BLOCKS =
  'M8 4V8H4V4H8M2 2V10H10V2Z' +
  'M18 7V11H14V7H18M12 5V13H20V5Z' +
  'M8 16V20H4V16H8M2 14V22H10V14Z';
const DEV_STACK =
  'M22 10V16H16V22H10V30H30V10ZM18 18H22V22H18ZM16 28H12V24H16ZM22 28H18V24H22ZM28 28H24V24H28ZM28 22H24V18H28ZM24 16V12H28V16Z';
export const BLOCK_LIFT = 1;

export const DevelopmentSpec = /* @__PURE__ */ hoverIcon('Development', {
  geo: ({ h }) => {
    const d = BLOCK_LIFT * h;
    return {
      blocks: {
        d: h ? mapPath(DEV_BLOCKS, ([x, y]) => [x - d, y - d]) : DEV_BLOCKS,
        ...EVENODD,
      },
      stack: { d: DEV_STACK, ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(Development32),
});

// ── Blog ─────────────────────────────────────────────────────────────────────
//
// Hover:
// the header grows 1px down (4–14 → 4–15, its wall 2px); the two lines ride
// 1px down at their length; the picture rides 1px down and shrinks 1px overall
// (10 → 9px square: its top-left rides with the header, its right and bottom
// edges come in, so its bottom stays at y 28). The 4px gaps under the header
// and between the lines and the picture hold.

const BLOG_HEADER =
  'M26 14H6A2 2 0 0 1 4 12V6A2 2 0 0 1 6 4H26A2 2 0 0 1 28 6V12A2 2 0 0 1 26 14ZM6 6V12H26V6Z';
export const BLOG_DROP = 1;
export const BLOG_SHRINK = 1;
/** The picture: a 2px frame, r 2 outer corners, from (x0, y0), `side` px square. */
const pictureD = (x0: number, y0: number, side: number) => {
  const [x1, y1] = [x0 + side, y0 + side];
  return (
    `M${f(x1 - 2)} ${f(y1)}H${f(x0 + 2)}A2 2 0 0 1 ${f(x0)} ${f(y1 - 2)}V${f(y0 + 2)}A2 2 0 0 1 ${f(x0 + 2)} ${f(y0)}H${f(x1 - 2)}A2 2 0 0 1 ${f(x1)} ${f(y0 + 2)}V${f(y1 - 2)}A2 2 0 0 1 ${f(x1 - 2)} ${f(y1)}Z` +
    `M${f(x0 + 2)} ${f(y0 + 2)}V${f(y1 - 2)}H${f(x1 - 2)}V${f(y0 + 2)}Z`
  );
};

export const BlogSpec = /* @__PURE__ */ hoverIcon('Blog', {
  geo: ({ h }) => {
    const d = BLOG_DROP * h;
    return {
      header: {
        d: h
          ? mapPath(BLOG_HEADER, ([x, y]) => [x, y >= 12 ? y + d : y])
          : BLOG_HEADER,
        ...EVENODD,
      },
      lines: {
        d: rectPath(4, 18 + d, 14, 20 + d) + rectPath(4, 24 + d, 14, 26 + d),
      },
      picture: { d: pictureD(18, 18 + d, 10 - BLOG_SHRINK * h), ...EVENODD },
    };
  },
  static: /* @__PURE__ */ carbonArt(Blog32),
});

// ── Bare metal server ────────────────────────────────────────────────────────
//
// Hover: every unit
// widens 1px a side (4–28 → 3–29, walls 2px); the 2px gaps between them
// hold. The status dots ride 1px left with the units' left walls.

const UNITS = [2, 12, 22];
export const UNIT_WIDEN = 1;
const unitD = (y: number, w: number) =>
  `M${f(26 + w)} ${y + 8}H${f(6 - w)}A2.0021 2.0021 0 0 1 ${f(4 - w)} ${y + 6}V${y + 2}A2.0021 2.0021 0 0 1 ${f(6 - w)} ${y}H${f(26 + w)}A2.0021 2.0021 0 0 1 ${f(28 + w)} ${y + 2}V${y + 6}A2.0021 2.0021 0 0 1 ${f(26 + w)} ${y + 8}Z` +
  `M${f(6 - w)} ${y + 2}V${y + 6}H${f(26 + w)}V${y + 2}Z` +
  circleD([9 - w, y + 4], 1);

export const BareMetalServerSpec = /* @__PURE__ */ hoverIcon(
  'BareMetalServer',
  {
    geo: ({ h }) => {
      const [top, middle, bottom] = UNITS.map((y) => ({
        d: unitD(y, UNIT_WIDEN * h),
        ...EVENODD,
      }));
      return { top, middle, bottom };
    },
    static: /* @__PURE__ */ carbonArt(BareMetalServer32),
  }
);

// ── Sys provision ────────────────────────────────────────────────────────────
//
// The outer ring (r 10–12 about (14, 14)) runs the long way round from its
// top-right end (a radial cut at 15.8°) to its bottom end (cut upright at
// x 17), leaving the opening where the play triangle sits. The inner ring
// and dot hold.
//
// Hover: the triangle grows 20%
// about its centroid (as Playlist's) and the outer ring grows 1px in radius
// (r 11–13). Its two ends draw back round the ring as it grows, so each
// end's space to the grown triangle stays what the triangle's growth alone
// leaves it (the nearest, 4.0px at rest, closes to 3.4px).

const SYS_C: Pt = [14, 14];
const SYS_INNER =
  'M14 20A6 6 0 1 1 20 14A6.0066 6.0066 0 0 1 14 20ZM14 10A4 4 0 1 0 18 14A4.0045 4.0045 0 0 0 14 10Z';
const SYS_PLAY: Pt[] = [
  [21, 20],
  [21, 30],
  [30, 25],
];
const SYS_PLAY_C: Pt = [24, 25];
export const PLAY_GROW = 0.2;
export const SYS_RING_GROW = 1;
const SYS_TOP_END = Math.atan2(2.7286, 9.6235);
const SYS_BOTTOM_X = 17;
/** Carbon's ring's inside and outside radii (its wall is 2.07: 9.98–12.05). */
const [SYS_IN, SYS_OUT] = [9.98, 12.05];

const sysPlay = (h: number): Pt[] =>
  scalePts(SYS_PLAY, SYS_PLAY_C, 1 + PLAY_GROW * h);
/** The outer ring at growth g, its top end at angle t (radial cut) and its bottom end cut upright at x. */
function sysRingPts(
  g: number,
  t: number,
  x: number
): { top: Pt[]; bottom: Pt[] } {
  const [ri, ro] = [SYS_IN + g, SYS_OUT + g];
  const at = (r: number, a: number): Pt => [
    SYS_C[0] + r * Math.cos(a),
    SYS_C[1] + r * Math.sin(a),
  ];
  const upright = (r: number): Pt => [
    x,
    SYS_C[1] + Math.sqrt(r * r - (x - SYS_C[0]) ** 2),
  ];
  // Each end with a short run of its arcs (what the triangle can come near).
  const run = (r: number, a0: number, da: number) =>
    Array.from({ length: 13 }, (_, i) => at(r, a0 + (da * i) / 12));
  const ab = (r: number) => Math.atan2(upright(r)[1] - SYS_C[1], x - SYS_C[0]);
  return {
    top: [...run(ro, t, -0.6), ...run(ri, t, -0.6)],
    bottom: [
      upright(ro),
      upright(ri),
      ...run(ro, ab(ro), 0.6),
      ...run(ri, ab(ri), 0.6),
    ],
  };
}
const segGap = (p: Pt, a: Pt, b: Pt) => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const k = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))
  );
  return Math.hypot(p[0] - a[0] - k * dx, p[1] - a[1] - k * dy);
};
/** The space from some ring points to the triangle. */
const toPlay = (pts: Pt[], tri: Pt[]) =>
  Math.min(
    ...pts.flatMap((p) => tri.map((a, i) => segGap(p, a, tri[(i + 1) % 3])))
  );
/** Bisection on a monotone gap (it grows as v goes from lo to hi). */
function solve(
  gap: (v: number) => number,
  want: number,
  lo: number,
  hi: number
): number {
  if (gap(lo) >= want) {
    return lo;
  }
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (gap(mid) >= want) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return hi;
}

/** The outer ring at hover h: grown, its ends drawn back to hold their space to the grown triangle. */
/** Carbon's outer ring (a touch off r 12: its big arc is r 12.05), for the resting drawing. */
const SYS_RING_CARBON =
  'M25.9512 12.91L25.9448 12.91A12.05 12.05 0 1 0 17 25.605V23.5386A9.9813 9.9813 0 1 1 23.6235 16.7286L25.5483 17.2726A12.0341 12.0341 0 0 0 26 14Q26 13.4492 25.9512 12.91Z';

export function sysRingD(h: number): string {
  if (!h) {
    return SYS_RING_CARBON;
  }
  const g = SYS_RING_GROW * h;
  const tri = sysPlay(h);
  const want = sysRingPts(0, SYS_TOP_END, SYS_BOTTOM_X);
  const t = solve(
    (a) => toPlay(sysRingPts(g, a, SYS_BOTTOM_X).top, tri),
    toPlay(want.top, tri),
    SYS_TOP_END,
    SYS_TOP_END - 0.6
  );
  const x = solve(
    (v) => toPlay(sysRingPts(g, t, v).bottom, tri),
    toPlay(want.bottom, tri),
    SYS_BOTTOM_X,
    SYS_BOTTOM_X - 4
  );
  const [ri, ro] = [SYS_IN + g, SYS_OUT + g];
  const at = (r: number, a: number): Pt => [
    SYS_C[0] + r * Math.cos(a),
    SYS_C[1] + r * Math.sin(a),
  ];
  const upright = (r: number): Pt => [
    x,
    SYS_C[1] + Math.sqrt(r * r - (x - SYS_C[0]) ** 2),
  ];
  return `M${P(at(ro, t))}A${f(ro)} ${f(ro)} 0 1 0 ${P(upright(ro))}L${P(upright(ri))}A${f(ri)} ${f(ri)} 0 1 1 ${P(at(ri, t))}Z`;
}

// The inner ring: it grows 1px in
// radius too (r 4–6 → 5–7; the 3.96px between the rings holds), which brings
// it to 1.12px from the grown triangle; there it is cut back along a line
// 2px out from the triangle (its rounded offset), as geometry, so a 2px gap
// runs round the triangle's corner.

export const SYS_INNER_GROW = 1;
export const SYS_PLAY_GAP = 2;
/** The inner ring at hover h, knocked out 2px round the triangle where it comes nearer. */
export function sysInnerD(h: number): string {
  if (!h) {
    return SYS_INNER;
  }
  const r = 5 + SYS_INNER_GROW * h;
  const tri = sysPlay(h);
  const near = Math.min(
    ...tri.map((a, i) => segGap(SYS_C, a, tri[(i + 1) % 3]))
  );
  if (near - (r + 1) >= SYS_PLAY_GAP) {
    return ringPath(SYS_C, r, 2);
  }
  // The knockout: the triangle grown 2px (round corners); the ring's outside runs round it.
  const k = growPoly(tri, SYS_PLAY_GAP, Math.PI / 36);
  const area = k.reduce(
    (a, q, i) =>
      a + q[0] * k[(i + 1) % k.length][1] - k[(i + 1) % k.length][0] * q[1],
    0
  );
  const hs: HalfPlane[] = k.map((a, i) => {
    const b = k[(i + 1) % k.length];
    const n: Pt =
      area > 0 ? [-(b[1] - a[1]), b[0] - a[0]] : [b[1] - a[1], -(b[0] - a[0])];
    return { n, c: n[0] * a[0] + n[1] * a[1] };
  });
  return (
    polyPath(discMinus(circlePts(SYS_C, r + 1, 240), r + 1, k, hs), true) +
    polyPath(circlePts(SYS_C, r - 1, 240), true)
  );
}

/**
 * A disc (its outline `ring`, radius R about SYS_C) less a convex region that
 * bites into it once (its outline `cut`, and as inward half-planes): the
 * disc's outline, with the bitten run replaced by the cut's outline inside
 * the disc.
 */
function discMinus(ring: Pt[], R: number, cut: Pt[], hs: HalfPlane[]): Pt[] {
  const inCut = (p: Pt) =>
    hs.every(({ n, c }) => n[0] * p[0] + n[1] * p[1] >= c);
  const inDisc = (p: Pt) => Math.hypot(p[0] - SYS_C[0], p[1] - SYS_C[1]) < R;
  const cross = (a: Pt, b: Pt, inside: (p: Pt) => boolean): Pt => {
    let [lo, hi] = [0, 1];
    for (let i = 0; i < 40; i++) {
      const t = (lo + hi) / 2;
      if (inside([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])) {
        hi = t;
      } else {
        lo = t;
      }
    }
    return [a[0] + (b[0] - a[0]) * hi, a[1] + (b[1] - a[1]) * hi];
  };
  const s0 = ring.findIndex((p) => !inCut(p));
  const q = [...ring.slice(s0), ...ring.slice(0, s0)];
  const i = q.findIndex(inCut);
  if (i < 0) {
    return ring;
  }
  let j = i;
  while (j < q.length && inCut(q[j])) {
    j++;
  }
  const [enter, exit] = [
    cross(q[i - 1], q[i], inCut),
    cross(q[j % q.length], q[j - 1], inCut),
  ];
  // The cut's outline inside the disc, as one run, from the end nearer the entry.
  const c0 = cut.findIndex((p) => !inDisc(p));
  const cc = [...cut.slice(c0), ...cut.slice(0, c0)];
  let run = cc.filter(inDisc);
  const d = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  if (run.length && d(run[0], enter) > d(run[run.length - 1], enter)) {
    run = run.reverse();
  }
  return [...q.slice(0, i), enter, ...run, exit, ...q.slice(j)];
}

export const SysProvisionSpec = /* @__PURE__ */ hoverIcon('SysProvision', {
  geo: ({ h }) => ({
    ring: { d: sysRingD(h) },
    rings: { d: sysInnerD(h), ...EVENODD },
    dot: { d: circleD([14, 14], 2) },
    play: { d: polyPath(sysPlay(h), true) },
  }),
  static: /* @__PURE__ */ carbonArt(SysProvision32),
});

// ── Service desk ─────────────────────────────────────────────────────────────
//
// The bell: the knob (a bar, 12–20 × 6–8, on a stem down to the dome at
// y 10.05), the dome (r 10–12 about (16, 22)), its rim, the slot under it
// and the base. Carbon draws it 0.005px low.
//
// Hover: the dome grows 1px in radius about (16, 22)
// (its feet 1px out, its top 1px up; the rim and slot widen with it, 2px
// each) and the knob is pushed all the way in: the stem closes 2.05 → 0 (the
// bar moves down 1.05px as the dome rises 1px) and the bar seats on the
// dome's top. The knob and the dome are two parts, each its own 2px walls:
// the stem runs on 1px into the dome's wall (hidden there, so the two meet
// with no seam), drawing back out as it closes, and the bar comes to rest on
// the dome. Held
// while hovered. The base holds.

export const BELL_GROW = 1;
/** The stem's length at rest. */
const STEM = 10.0507 - 8;
/** Carbon's dome: its outside's radius and its top's height at the stem (x 15 and 17). */
const DOME_R = Math.hypot(1, 22 - 10.0507);

/** The bell (dome, rim, slot and base; the dome's top runs straight across under the stem) and the knob at hover h. */
export function serviceDeskShapes(h: number): Shapes {
  const g = BELL_GROW * h;
  const top = 22 - Math.sqrt((DOME_R + g) ** 2 - 1);
  const bar = top - STEM * (1 - h);
  const R = f(12.01 + g);
  /** The inside's foot on the rim (y 20), from Carbon's (16 ± x0), its radius grown g. */
  const ri = (x0: number) => 16 + Math.sqrt((Math.hypot(x0, 2) + g) ** 2 - 4);
  const [rIn, rIn2] = [f(10.0167 + g), f(10.0165 + g)];
  const bell =
    `M${f(28 + g)} 24V22A${R} ${R} 0 0 0 17 ${f(top)}H15A${R} ${R} 0 0 0 ${f(4 - g)} 22V24H2V26H30V24Z` +
    `M16 ${f(12 - g)}A${rIn} ${rIn} 0 0 1 ${f(ri(9.7984))} 20H${f(32 - ri(9.7985))}A${rIn2} ${rIn2} 0 0 1 16 ${f(12 - g)}Z` +
    `M${f(6 - g)} 22H${f(26 + g)}V24H${f(6 - g)}Z`;
  const knob = `M12 ${f(bar - 2)}H20V${f(bar)}H17V${f(top + 1 - h)}H15V${f(bar)}H12Z`;
  const low = (d: string) => mapPath(d, ([x, y]) => [x, y + 0.005]);
  return { bell: { d: low(bell), ...EVENODD }, knob: { d: low(knob) } };
}

export const ServiceDeskSpec = /* @__PURE__ */ hoverIcon('ServiceDesk', {
  geo: ({ h }) => serviceDeskShapes(h),
  static: /* @__PURE__ */ carbonArt(ServiceDesk32),
});

// ── Construction ─────────────────────────────────────────────────────────────
//
// The worker (head: a ring r 1.5–3.5 about (12.5, 4.5)) holds a shovel's
// handle, a 2px band (dy/dx 2/11) from the back hand (x 2) across the body
// into the pile (a right triangle, its hypotenuse's walls dy/dx −1.2).
// Carbon draws one outline; here it is overlapping pieces whose union is
// Carbon's: the torso (the shoulders and the back, run on down past the
// handle), the back arm (upper arm and forearm, an L), the front arm, the
// handle, the legs (run up into the handle) and the pile.
//
// Hover: the upper body leans 10° forward about the hip
// (8, 18.9), rigid; the head rides upright with it (2.4px forward, 1px down;
// its 1px gap holds). On top of the lean each arm swings forward about its
// shoulder joint (the back arm 20.3° about the inside corner of its joint, the
// front arm 13.2° about its middle), just far enough that
// its hand slides 2px further along the handle toward the blade. The joints
// stay whole: the front arm turns about a round joint (a disc its own width
// at the shoulder); the back arm's end is cut upright against the back, so
// the wedge its turn opens at each corner is filled back to the torso's
// corner (no notch, no bump). Every arm is cut along the handle's underside. The
// handle pushes 2px into the pile along its own line, its end cut along the
// pile's inside edge so it disappears into the pile's wall. The legs and the
// pile hold.

const HANDLE_SLOPE = 2 / 11;
const HANDLE_U: Pt = [11 / Math.hypot(11, 2), 2 / Math.hypot(11, 2)];
const handleTop = (x: number) => 17.7112 + HANDLE_SLOPE * (x - 7);
const handleBottom = (x: number) => 18.8345 + HANDLE_SLOPE * (x - 2);
const HIP: Pt = [8, 18.9];
export const TORSO_LEAN = 10;
export const SHOVEL_DIG = 2;
export const HAND_REACH = 2;
const RUN = 23.5; // how far down the arms and back run (under the handle)
const runOn = (p: Pt, d: Pt): Pt => [p[0] + (d[0] * (RUN - p[1])) / d[1], RUN];
const FRONT_OUT: Pt = [15.4225, 10.9463];
const FRONT_IN: Pt = [13.5591, 11.6709];
const FRONT_DIR: Pt = [3.371, 8.3775];
/** The torso: the back wall, the shoulders and their corners, to the arms' joints. */
const TORSO = /* @__PURE__ */ pathPoints(
  `M7 ${RUN}L7 11.7664L7.01 9.4277A3.0018 3.0018 0 0 1 8.5538 9L12.6138 9A3.014 3.014 0 0 1 15.4225 10.9463` +
    `L13.5591 11.6709A1.0141 1.0141 0 0 0 12.6138 11L9 11L9 ${RUN}Z`,
  0.1
);
/** The front arm, from its joint at the shoulder corner down past the handle. */
const FRONT_ARM: Pt[] = [
  FRONT_OUT,
  runOn(FRONT_OUT, [3.602, 8.9512]),
  runOn(FRONT_IN, [3.14, 7.8037]),
  FRONT_IN,
];
const FRONT_JOINT: Pt = [
  (FRONT_OUT[0] + FRONT_IN[0]) / 2,
  (FRONT_OUT[1] + FRONT_IN[1]) / 2,
];
/** The back arm, from its joint (its end cut upright at x 7, against the back) down past the handle. */
const BACK_ARM: Pt[] = [
  [7.01, 9.4277],
  [2, 12.4336],
  [2, RUN],
  [4, RUN],
  [4, 13.5664],
  [7, 11.7664],
];
const BACK_JOINT: Pt = [7, 11.7664]; // the inside corner of its joint, so the inside corner never moves
/** Below the handle's underside. */
const UNDER: HalfPlane = {
  n: [-HANDLE_SLOPE, 1],
  c: 18.8345 - HANDLE_SLOPE * 2,
};
/** Past the pile's inside edge (its hypotenuse's inner line, through (21.14, 28) and (28, 19.76)). */
const PILE_IN: HalfPlane = (() => {
  const [a, b]: Pt[] = [
    [21.1353, 28],
    [28, 19.7617],
  ];
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n: Pt = [(b[1] - a[1]) / -l, (b[0] - a[0]) / l];
  return { n, c: n[0] * a[0] + n[1] * a[1] };
})();
/** Where the line through a along u meets the handle's top edge. */
const ontoHandle = (a: Pt, u: Pt): Pt => {
  const t = (handleTop(a[0]) - a[1]) / (u[1] - HANDLE_SLOPE * u[0]);
  return [a[0] + u[0] * t, a[1] + u[1] * t];
};
const LEGS =
  /* @__PURE__ */ polyPath(
    [
      [7, /* @__PURE__ */ handleTop(7)],
      [9, /* @__PURE__ */ handleTop(9)],
      [9, 30],
      [7, 30],
    ],
    true
  ) +
  /* @__PURE__ */ polyPath(
    [
      /* @__PURE__ */ ontoHandle([12.5652, 20.7554], [1.4348, 3.4446]),
      /* @__PURE__ */ ontoHandle([14.9089, 21.1818], [1.0911, 2.6182]),
      [16, 23.8],
      [16, 30],
      [14, 30],
      [14, 24.2],
    ],
    true
  );
const PILE =
  'M29.34 16.06A1.0007 1.0007 0 0 0 28.2316 16.36L18.2319 28.36A1 1 0 0 0 19 30L29 30A1 1 0 0 0 30 29L30 17A1 1 0 0 0 29.34 16.06Z' +
  'M28 28L21.1353 28L28 19.7617Z';

/** p turned `deg` clockwise about c. */
const turnAbout = (c: Pt, deg: number) => {
  const a = rad(deg);
  const [cs, sn] = [Math.cos(a), Math.sin(a)];
  return ([x, y]: Pt): Pt => [
    c[0] + (x - c[0]) * cs - (y - c[1]) * sn,
    c[1] + (x - c[0]) * sn + (y - c[1]) * cs,
  ];
};
/** How far along the handle (its x) a line through p along d meets the handle's top edge. */
const alongHandle = (p: Pt, d: Pt) => ontoHandle(p, d)[0];
/**
 * The swing (degrees, clockwise; negative is forward) that carries an arm's
 * line (through p along d, after the lean) `reach` px further along the
 * handle, turning about its joint j (bisection).
 */
function armSwing(j: Pt, p: Pt, d: Pt, reach: number): number {
  const want = alongHandle(p, d) + reach * HANDLE_U[0];
  let [lo, hi] = [-40, 0];
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const t = turnAbout(j, mid);
    const [q, e] = [t(p), t([p[0] + d[0], p[1] + d[1]])];
    if (alongHandle(q, [e[0] - q[0], e[1] - q[1]]) > want) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}
/** A polygon wound one way (so overlapping pieces union under nonzero). */
const cw = (q: Pt[]) =>
  q.reduce(
    (a, p, i) =>
      a + p[0] * q[(i + 1) % q.length][1] - q[(i + 1) % q.length][0] * p[1],
    0
  ) < 0
    ? [...q].reverse()
    : q;

/** The front and back arms' swings at hover h (degrees), after the lean. */
export function armSwings(h: number): { front: number; back: number } {
  if (!h) {
    return { front: 0, back: 0 };
  }
  const lean = turnAbout(HIP, TORSO_LEAN * h);
  const dir = (d: Pt): Pt => {
    const [a, b] = [lean([0, 0]), lean(d)];
    return [b[0] - a[0], b[1] - a[1]];
  };
  return {
    front: armSwing(
      lean(FRONT_JOINT),
      lean(FRONT_JOINT),
      dir(FRONT_DIR),
      HAND_REACH * h
    ),
    back: armSwing(
      lean(BACK_JOINT),
      lean([3, 15]),
      dir([0, 1]),
      HAND_REACH * h
    ),
  };
}

export function constructionShapes(h: number): Shapes {
  const lean = turnAbout(HIP, TORSO_LEAN * h);
  const { front, back } = armSwings(h);
  const [fj, bj] = [lean(FRONT_JOINT), lean(BACK_JOINT)];
  const swing = (pts: Pt[], j: Pt, deg: number) =>
    pts.map((q) => turnAbout(j, deg)(lean(q)));
  const pieces = [
    TORSO.map(lean),
    swing(FRONT_ARM, FRONT_JOINT, 0).map(turnAbout(fj, front)),
    swing(BACK_ARM, BACK_JOINT, 0).map(turnAbout(bj, back)),
  ];
  // The joints: the front arm's a round one (a disc its own width); the back arm's end is cut upright, so each corner of it
  // is joined back to the torso's corner by a triangle through the joint (filling the wedge its turn opens, nothing more).
  const backEnd = [BACK_ARM[0], BACK_ARM[5]].map((q) =>
    turnAbout(bj, back)(lean(q))
  );
  const joints = h
    ? [
        circlePts(fj, 1, 72),
        [lean(BACK_ARM[0]), backEnd[0], bj],
        [lean(BACK_ARM[5]), backEnd[1], bj],
      ]
    : [];
  const upper = [...pieces, ...joints]
    .flatMap((q) => cutPoly(q, [UNDER]))
    .map((q) => polyPath(cw(q), true))
    .join('');
  const [tx, ty] = [HANDLE_U[0] * SHOVEL_DIG * h, HANDLE_U[1] * SHOVEL_DIG * h];
  const handle: Pt[] = [
    [2, handleTop(2)],
    [31, handleTop(31)],
    [31, handleBottom(31)],
    [2, handleBottom(2)],
  ];
  return {
    head: { d: ringPath(lean([12.5, 4.5]), 2.5, 2), ...EVENODD },
    upper: { d: upper },
    handle: {
      d: cutPoly(
        handle.map(([x, y]) => [x + tx, y + ty] as Pt),
        [PILE_IN]
      )
        .map((q) => polyPath(q, true))
        .join(''),
    },
    legs: { d: LEGS },
    pile: { d: PILE, ...EVENODD },
  };
}

export const ConstructionSpec = /* @__PURE__ */ hoverIcon('Construction', {
  geo: ({ h }) => constructionShapes(h),
  static: /* @__PURE__ */ carbonArt(Construction32),
});

// ── Industry ─────────────────────────────────────────────────────────────────

const INDUSTRY =
  'M29.53 6.15A1 1 0 0 0 28.53 6.15L20 10.38V7A1 1 0 0 0 18.55 6.11L10 10.38V3A1 1 0 0 0 9 2H3A1 1 0 0 0 2 3V28H30V7A1 1 0 0 0 29.53 6.15Z' +
  'M22 26H18V19H22ZM28 26H24V18A1 1 0 0 0 23 17H17A1 1 0 0 0 16 18V26H4V4H8V13.62L18 8.62V13.62L28 8.62Z';
export const CHIMNEY_RISE = 2;

export const IndustrySpec = /* @__PURE__ */ hoverIcon('Industry', {
  geo: ({ h }) => ({
    factory: {
      d: h
        ? mapPath(INDUSTRY, ([x, y]) => [
            x,
            x <= 10 && y <= 4 ? y - CHIMNEY_RISE * h : y,
          ])
        : INDUSTRY,
      ...EVENODD,
    },
  }),
  static: /* @__PURE__ */ carbonArt(Industry32),
});

// ── Globe ────────────────────────────────────────────────────────────────────
//
// The ball (a ring r 7–9 about (14, 11)) in its holder (an arc r 12–14 about
// the same centre, its ends radial at −45° and 135°: the globe's axis runs
// through them, tilted 45°), on a stem (x 14–16) down to the base (10–20 ×
// 28–30).
//
// Hover: the ball turns
// about the holder's axis, as Wikis' globe turns about its own. One meridian
// peels out of the ring on the upper left and swings 120° round the axis:
// past edge-on (a straight line along the axis, at 90°) to rest as a curve on
// the lower right, half a radius from the axis (s = R/2). Leaving, it swings
// back into the ring, and the rest is Carbon's drawing. It is Wikis'
// meridian: a 2px band about a circular centreline through its equator point
// (s from the axis, across it) that meets the ring's centreline at 0.255·s
// from the axis (so it ends at an angle inside the ring's wall, never
// tangent, and at the limb it is the ring itself). It clears the limb (the
// last 4px, where the crescent between it and the ring is under 2px) in the
// first 10% of the swing. The ball and holder grow 1px in radius (the 3px
// between them holds; the meridian rides the grown ring), the stem shortens
// 3 → 2px, and the base widens 1px at each end (10–20 → 9–21). 240ms: in on
// the entrance ease, out (176ms) on the exit ease, so the meridian leaves
// and rejoins the limb quickly.

const GLOBE_C: Pt = [14, 11];
export const GLOBE_GROW = 1;
export const GLOBE_BASE_WIDEN = 1;
const GLOBE_MS = 240;
const LINEAR = [0, 0, 1, 1] as [number, number, number, number];
/** Along the axis (to the holder's top end) and across it (down-right). */
const AXIS: Pt = [Math.SQRT1_2, -Math.SQRT1_2];
const ACROSS: Pt = [Math.SQRT1_2, Math.SQRT1_2];
const POLE_LEAN = 0.255;
/** The meridian's offset from the axis (in ball radii) through the swing: quickly off the limb, to rest at R/2 (120° round). */
export const MERIDIAN_PATH: Array<[t: number, s: number]> = [
  [0, -1],
  [0.1, -0.5],
  [1, 0.5],
];

/** A monotone cubic (Fritsch–Carlson) through knots, at x (as Wikis'). */
function monotone(
  knots: ReadonlyArray<readonly [number, number]>,
  x: number
): number {
  const n = knots.length;
  const d = knots
    .slice(1)
    .map(([x1, y1], i) => (y1 - knots[i][1]) / (x1 - knots[i][0]));
  const m = knots.map((_, i) =>
    i === 0
      ? d[0]
      : i === n - 1
        ? d[n - 2]
        : d[i - 1] * d[i] <= 0
          ? 0
          : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i])
  );
  const i = Math.max(
    0,
    Math.min(
      n - 2,
      knots.findIndex((_, j) => j < n - 1 && x <= knots[j + 1][0])
    )
  );
  const [[x0, y0], [x1, y1]] = [knots[i], knots[i + 1]];
  const w = x1 - x0;
  const t = Math.max(0, Math.min(1, (x - x0) / w));
  const [t2, t3] = [t * t, t * t * t];
  return (
    (2 * t3 - 3 * t2 + 1) * y0 +
    (t3 - 2 * t2 + t) * w * m[i] +
    (-2 * t3 + 3 * t2) * y1 +
    (t3 - t2) * w * m[i + 1]
  );
}

/** The swing's progress (0–1) at hover h: the entrance ease in, the exit ease out (the engine runs h linear). */
export const globeProgress = (h: number, entering = 1) =>
  entering ? ENTRANCE(h) : 1 - EXIT(1 - h);
/** The ball's growth (0–1) and the meridian's offset s (px across the axis) at hover h. */
export function globeAt(h: number, entering = 1): { grow: number; s: number } {
  const p = globeProgress(h, entering);
  const R = 8 + GLOBE_GROW * p;
  // The limb's 4px pass in the first 10% of the swing, whatever the ball's size.
  const limb = 1 - 4 / R;
  const knots = MERIDIAN_PATH.map(([t, v]): [number, number] => [
    t,
    v === -0.5 ? -limb : v,
  ]);
  return { grow: p, s: R * monotone(knots, p) };
}

/** The meridian at offset s on a ball of centreline radius R: a 2px band, cut inside the ring's wall. */
export function meridianD(s: number, R: number): string {
  if (Math.abs(s) >= R - 1e-3) {
    return '';
  }
  const local = (u: number, v: number): Pt => [
    GLOBE_C[0] + ACROSS[0] * u + AXIS[0] * v,
    GLOBE_C[1] + ACROSS[1] * u + AXIS[1] * v,
  ];
  const q = POLE_LEAN * s;
  const pole = Math.sqrt(R * R - q * q);
  let side: Pt[];
  if (Math.abs(s) < 0.01) {
    side = [
      [s, -R - 1],
      [s, R + 1],
    ];
  } else {
    // The centreline's centre (cx, 0), on the equator: through (s, 0) and (q, ±pole).
    const cx = (R * R - s * s) / (2 * (q - s));
    const rho = Math.abs(s - cx);
    const t0 = Math.atan2(0, s - cx);
    const tp = Math.atan2(pole, q - cx);
    let span = Math.abs(tp - t0);
    if (span > Math.PI) {
      span = 2 * Math.PI - span;
    }
    span += 1.5 / rho; // run on past the ring's centreline (cut back to it below)
    const n = 64;
    side = Array.from({ length: n + 1 }, (_, i) => {
      const t = t0 - span + (2 * span * i) / n;
      return [cx + rho * Math.cos(t), rho * Math.sin(t)] as Pt;
    });
  }
  // Offset 1px each side (normals of the polyline), then cut to the ring's centreline disc.
  const off = (d: number): Pt[] =>
    side.map((p, i) => {
      const [a, b] = [
        side[Math.max(0, i - 1)],
        side[Math.min(side.length - 1, i + 1)],
      ];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      return [p[0] - ((b[1] - a[1]) / l) * d, p[1] + ((b[0] - a[0]) / l) * d];
    });
  const band = [...off(1), ...off(-1).reverse()].map(([u, v]) => local(u, v));
  const cut = clipConvex(band, circlePts(GLOBE_C, R, 180));
  return cut.length > 2 ? polyPath(cut, true) : '';
}

export function globeHolderD(g: number, b: number): string {
  const out = (p: Pt): Pt => {
    const [dx, dy] = [p[0] - GLOBE_C[0], p[1] - GLOBE_C[1]];
    const r = Math.hypot(dx, dy);
    return [GLOBE_C[0] + (dx * (r + g)) / r, GLOBE_C[1] + (dy * (r + g)) / r];
  };
  const A = (r: number, sweep: 0 | 1, to: Pt) =>
    `A${f(r + g)} ${f(r + g)} 0 0 ${sweep} ${P(to)}`;
  /** Where the stem's side x meets the holder's outside (r at rest). */
  const stem = (x: number, r: number): Pt => [
    x,
    GLOBE_C[1] + Math.sqrt((r + g) ** 2 - (x - GLOBE_C[0]) ** 2),
  ];
  const r16 = Math.hypot(2, 24.84 - GLOBE_C[1]);
  return (
    `M${P(out([28, 11]))}${A(13.9563, 0, out([23.8949, 1.1051]))}L${P(out([22.4813, 2.5187]))}${A(11.9944, 1, out([5.5568, 19.5194]))}` +
    `L${P(out([5.5187, 19.4813]))}L${P(out([4.1051, 20.8949]))}${A(13.9563, 0, stem(14, 14))}L14 28L${f(10 - b)} 28L${f(10 - b)} 30L${f(20 + b)} 30L${f(20 + b)} 28L16 28L${P(stem(16, r16))}` +
    `${A(14.0094, 0, out([28, 11]))}Z`
  );
}

export const GlobeSpec = /* @__PURE__ */ hoverIcon('Globe', {
  hover: { duration: GLOBE_MS / 1000, ease: LINEAR },
  geo: ({ h, entering = 1 }) => {
    const { grow, s } = globeAt(h, entering);
    const g = GLOBE_GROW * grow;
    return {
      ball: { d: ringPath(GLOBE_C, 8 + g, 2), ...EVENODD },
      meridian: { d: h ? meridianD(s, 8 + g) : '' },
      holder: { d: globeHolderD(g, GLOBE_BASE_WIDEN * grow) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Globe32),
});

// ── Timer ────────────────────────────────────────────────────────────────────
//
// The ring (inside r 9 about (16, 17); Carbon's outside is an arc of r 10.94
// about (16.06, 17)), the lever (a 2px bar out of the ring at 45°, between
// the lines through (24.33, 9.84) and (25.51, 11.49)), the crown (13–19 ×
// 2–4) and the hand (15–17 × 11–20).

const TIMER_C: Pt = [16, 17];
const TIMER_OUT_C: Pt = [16.0597, 17.0014];
const TIMER_OUT_R = 10.94;
export const TIMER_GROW = 1;
export const HAND_TURN = 45;
const LEVER_DIR: Pt = [Math.SQRT1_2, -Math.SQRT1_2];

/** Where the line through p0 along LEVER_DIR meets the circle (c, r), nearest p0. */
function onCircle(p0: Pt, c: Pt, r: number): Pt {
  const [ox, oy] = [p0[0] - c[0], p0[1] - c[1]];
  const b = LEVER_DIR[0] * ox + LEVER_DIR[1] * oy;
  const disc = Math.sqrt(Math.max(0, b * b - (ox * ox + oy * oy - r * r)));
  const t = Math.abs(-b + disc) < Math.abs(-b - disc) ? -b + disc : -b - disc;
  return [p0[0] + LEVER_DIR[0] * t, p0[1] + LEVER_DIR[1] * t];
}

export function timerRingD(g: number): string {
  const R = TIMER_OUT_R + g;
  const lever = (p: Pt): Pt => [
    p[0] + LEVER_DIR[0] * g,
    p[1] + LEVER_DIR[1] * g,
  ];
  const [a, b] = [
    onCircle([24.33, 9.84], TIMER_OUT_C, R),
    onCircle([25.51, 11.49], TIMER_OUT_C, R),
  ];
  const ri = 9 + g;
  const [cx, cy] = TIMER_C;
  return (
    `M${P(lever([28, 9]))}L${P(lever([26.58, 7.59]))}L${P(a)}A${f(R)} ${f(R)} 0 1 0 ${P(b)}Z` +
    `M${f(cx)} ${f(cy + ri)}A${f(ri)} ${f(ri)} 0 1 1 ${f(cx + ri)} ${f(cy)}A${f(ri)} ${f(ri)} 0 0 1 ${f(cx)} ${f(cy + ri)}Z`
  );
}

export const TimerSpec = /* @__PURE__ */ hoverIcon('Timer', {
  geo: ({ h }) => {
    const g = TIMER_GROW * h;
    const [cs, sn] = [
      Math.cos(rad(HAND_TURN * h)),
      Math.sin(rad(HAND_TURN * h)),
    ];
    const turn = ([x, y]: Pt): Pt => [
      TIMER_C[0] + (x - TIMER_C[0]) * cs - (y - TIMER_C[1]) * sn,
      TIMER_C[1] + (x - TIMER_C[0]) * sn + (y - TIMER_C[1]) * cs,
    ];
    const hand: Pt[] = [
      [15, 11],
      [17, 11],
      [17, 20],
      [15, 20],
    ];
    return {
      ring: { d: timerRingD(g), ...EVENODD },
      crown: { d: rectPath(13, 2 - g, 19, 4 - g) },
      hand: {
        d: h ? polyPath(hand.map(turn), true) : rectPath(15, 11, 17, 20),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Timer32),
});

// ── Snow ─────────────────────────────────────────────────────────────────────
//
// The cloud is cloud--offline's drawing 3px higher (its centreline: lobes r
// 5.5 about (8.5, 15.5) and (23.5, 15.5), the top r 8 about (16, 11), the
// base at y 21), built as Cloud's (`cloudLoops`); under it three flakes,
// Carbon's × (arms 1.48px), at (9.5, 26.5), (16.5, 28.5) and (23.5, 26.5).
//
// Hover, 240ms linear, each part on
// its own slice:
//  - the cloud grows as Cloud's does: its centreline scales 14/13 about the
//    middle of its base (16, 21), so its sides move 1px out and its top
//    1.38px up; the base holds (entrance ease, 0–150ms);
//  - the three flakes fall away 4px, shrinking as they go into a 1px diamond
//    (a square turned 45°, 1px corner to corner), which is gone the moment
//    they land (exit ease, 120ms, all together);
//  - two new flakes, at (12.5, 26.5) and (19.5, 28.5) (2px apart, 2px under
//    the cloud, as Carbon's), appear as a 1px diamond just under the cloud
//    (centred at y 23.5) and grow into the × as they fall into place
//    (entrance ease, from 60ms to the end, together).
// The × becomes the diamond by moving its points: each arm's two tip corners
// close onto the middle of the diamond's edge between them, and the four
// notches between the arms onto its corners.
// Leaving (176ms) swaps the roles: the two new flakes fall away and the three
// come down out of the cloud into their places as the cloud settles back
// (exit ease).

const SNOW_CLOUD: CloudArt = {
  left: { c: [8.5, 15.5], r: 5.5 },
  top: { c: [16, 11], r: 8 },
  right: { c: [23.5, 15.5], r: 5.5 },
  base: 21,
};
const SNOW_BASE: Pt = [16, 21];
/** Carbon's cloud, for the resting drawing (the construction below sits within 0.01px of it; Chrome rasterises Carbon's own a touch closer). */
const SNOW_CLOUD_CARBON =
  'M23.5 22H8.5A6.5 6.5 0 0 1 7.2 9.14A9 9 0 0 1 24.8 9.14A6.5 6.5 0 0 1 23.5 22Z' +
  'M16 4A7 7 0 0 0 9.06 10.14L9 11L8.14 11A4.5 4.5 0 0 0 8.5 20H23.5A4.5 4.5 0 0 0 23.86 11L23 11L22.9 10.18A7 7 0 0 0 16 4Z';
export const SNOW_CLOUD_GROW = 1 / 13;
const SNOW_MS = 240;
export const SNOW_FALL = 4;
const FLAKES: Pt[] = [
  [9.5, 26.5],
  [16.5, 28.5],
  [23.5, 26.5],
];
const FRESH: Pt[] = [
  [12.5, 26.5],
  [19.5, 28.5],
];
const FLAKE: Pt[] = [
  [2.5, -1.45],
  [1.45, -2.5],
  [0, -1.05],
  [-1.45, -2.5],
  [-2.5, -1.45],
  [-1.05, 0],
  [-2.5, 1.45],
  [-1.45, 2.5],
  [0, 1.05],
  [1.45, 2.5],
  [2.5, 1.45],
  [1.05, 0],
];
/** Where each of the ×'s points goes in the 1px diamond: tip corners to the middles of its edges, notches to its corners. */
const DIAMOND: Pt[] = FLAKE.map(([x, y]) =>
  Math.abs(x) < 1e-9 || Math.abs(y) < 1e-9
    ? [Math.sign(x) * 0.5, Math.sign(y) * 0.5]
    : [Math.sign(x) * 0.25, Math.sign(y) * 0.25]
);
/** A flake about (x, y), m of the way from the 1px diamond (0) to the × (1); nothing before it appears or once it has gone. */
const flake = ([x, y]: Pt, m: number, shown: boolean): string => {
  if (!shown) {
    return '';
  }
  return polyPath(
    FLAKE.map(
      ([fx, fy], i) =>
        [x + lerp(DIAMOND[i][0], fx, m), y + lerp(DIAMOND[i][1], fy, m)] as Pt
    ),
    true
  );
};
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/**
 * Falling away, at ms into the timeline: every flake together (a stagger across small parts doesn't
 * read at small sizes). `i` and `n` stay in the signature.
 */
const fallAway = (ms: number, i: number) => (void i, EXIT(clamp01(ms / 120)));
/** Falling in, at ms (they land as the timeline ends). */
const fallIn = (ms: number, i: number, n: number) => (
  void i,
  void n,
  ENTRANCE(clamp01((ms - 60) / (SNOW_MS - 60)))
);
/** The diamond new flakes appear as, centred just under the cloud. */
const FLAKE_FROM = 23.5;
const away = (p: Pt, t: number) =>
  flake([p[0], p[1] + SNOW_FALL * t], 1 - t, t < 1);
const into = (p: Pt, t: number) =>
  flake([p[0], FLAKE_FROM + (p[1] - FLAKE_FROM) * t], t, t > 0);

/** A cloud's loop as path data with true arcs (as objectsA's). */
function cloudLoopD(runs: readonly Run[]): string {
  let d = '';
  for (const r of runs) {
    if (!('k' in r)) {
      d += `${d ? 'L' : 'M'}${P(r)}`;
      continue;
    }
    const { k, t0, t1 } = r;
    let b = t1;
    while (b <= t0) {
      b += 2 * Math.PI;
    }
    const at = (t: number): Pt => [
      k.c[0] + k.r * Math.cos(t),
      k.c[1] + k.r * Math.sin(t),
    ];
    d += `${d ? 'L' : 'M'}${P(at(t0))}A${f(k.r)} ${f(k.r)} 0 ${b - t0 > Math.PI ? 1 : 0} 1 ${P(at(b))}`;
  }
  return `${d}Z`;
}
/**
 * The cloud grown g (0–1). Its outside is Cloud's construction (`cloudLoops`);
 * its inside is Carbon's own (snow's junctions are drawn differently from
 * the clouds'), each point carried with its circle: centres scale about the
 * base's middle, radii stay 1px inside the scaled centreline, and the two
 * short flats' corners scale with the rest.
 */
export function snowCloudD(g: number): string {
  if (!g) {
    return SNOW_CLOUD_CARBON;
  }
  const k = 1 + SNOW_CLOUD_GROW * g;
  const s = ({ c, r }: Circle): Circle => ({
    c: [
      SNOW_BASE[0] + (c[0] - SNOW_BASE[0]) * k,
      SNOW_BASE[1] + (c[1] - SNOW_BASE[1]) * k,
    ],
    r: r * k,
  });
  const [l, t, r] = [
    s(SNOW_CLOUD.left),
    s(SNOW_CLOUD.top),
    s(SNOW_CLOUD.right),
  ];
  const [outside] = cloudLoops({
    left: l,
    top: t,
    right: r,
    base: SNOW_BASE[1],
  });
  /** A point of Carbon's inside on circle `from` (at rest, 1px inside its centreline), carried to the grown circle `to`. */
  const on = (p: Pt, from: Circle, to: Circle): Pt => {
    const k1 = (to.r - 1) / (from.r - 1);
    return [
      to.c[0] + (p[0] - from.c[0]) * k1,
      to.c[1] + (p[1] - from.c[1]) * k1,
    ];
  };
  const corner = ([x, y]: Pt): Pt => [
    SNOW_BASE[0] + (x - SNOW_BASE[0]) * k,
    SNOW_BASE[1] + (y - SNOW_BASE[1]) * k,
  ];
  const [L0, T0, R0] = [SNOW_CLOUD.left, SNOW_CLOUD.top, SNOW_CLOUD.right];
  const [ri, ti, li] = [f(r.r - 1), f(t.r - 1), f(l.r - 1)];
  const inside =
    `M${P(on([16, 4], T0, t))}A${ti} ${ti} 0 0 0 ${P(on([9.06, 10.14], T0, t))}L${P(corner([9, 11]))}L${P(on([8.14, 11], L0, l))}` +
    `A${li} ${li} 0 0 0 ${P(on([8.5, 20], L0, l))}L${P(on([23.5, 20], R0, r))}A${ri} ${ri} 0 0 0 ${P(on([23.86, 11], R0, r))}` +
    `L${P(corner([23, 11]))}L${P(on([22.9, 10.18], T0, t))}A${ti} ${ti} 0 0 0 ${P(on([16, 4], T0, t))}Z`;
  return cloudLoopD(outside) + inside;
}

export const SnowSpec = /* @__PURE__ */ hoverIcon('Snow', {
  hover: { duration: SNOW_MS / 1000, ease: [0, 0, 1, 1] },
  geo: ({ h, entering = 1 }) => {
    const ms = (entering ? h : 1 - h) * SNOW_MS;
    const cloud = entering ? ENTRANCE(clamp01(ms / 150)) : 1 - EXIT(1 - h);
    // Entering, the three fall away and the two fall in; leaving, the other way round.
    const [goers, comers] = entering ? [FLAKES, FRESH] : [FRESH, FLAKES];
    const out = goers.map((p, i) => away(p, fallAway(ms, i))).join('');
    const inn = comers
      .map((p, i) => into(p, fallIn(ms, i, comers.length)))
      .join('');
    return {
      cloud: { d: snowCloudD(cloud), ...EVENODD },
      flakes: { d: entering ? out : inn },
      fresh: { d: entering ? inn : out },
    };
  },
  static: /* @__PURE__ */ carbonArt(Snow32),
});

// ── Shopping bag ─────────────────────────────────────────────────────────────
//
// Hover: the bag grows
// 1px a side (its slanted sides 1px out, its top 1px up, its bottom 1px down;
// walls 2px) and the handle lifts 2px from the grown top (3px in all), its
// legs lengthening 2px; the legs keep their places across the top.

const BAG =
  'M28.76 11.35A1 1 0 0 0 28 11H22V7A3 3 0 0 0 19 4H13A3 3 0 0 0 10 7V11H4A1 1 0 0 0 3 12.15L4.88 24.3A2 2 0 0 0 6.88 26H25.14A2 2 0 0 0 27.14 24.3L29 12.15A1 1 0 0 0 28.76 11.35Z' +
  'M12 7A1 1 0 0 1 13 6H19A1 1 0 0 1 20 7V11H12ZM25.14 24H6.86L5.17 13H26.83Z';
export const BAG_GROW = 1;
export const HANDLE_LIFT = 2;

export const ShoppingBagSpec = /* @__PURE__ */ hoverIcon('ShoppingBag', {
  geo: ({ h }) => {
    const g = BAG_GROW * h;
    const move = ([x, y]: Pt): Pt => {
      if (y <= 7) {
        return [x, y - g - HANDLE_LIFT * h];
      } // the handle's arch
      const top = y <= 13;
      const dx = top && x > 9 && x < 23 ? 0 : x < 16 ? -g : g; // the legs' feet hold across
      return [x + dx, top ? y - g : y >= 24 ? y + g : y];
    };
    return { bag: { d: h ? mapPath(BAG, move) : BAG, ...EVENODD } };
  },
  static: /* @__PURE__ */ carbonArt(ShoppingBag32),
});

// ── Apple ────────────────────────────────────────────────────────────────────
//
// The apple (one outline with its stem, its walls 2px) and the leaf (a solid,
// based at (17, 7), its tip at (20, 4)). Hover: the apple scales 12.5/11
// about (16, 18) at constant weight (`weightScaleLoops`, as Phone), so its
// sides move 1.5px out; the leaf rides with the apple's growth at its
// base and grows 5/3 about the base, so its tip reaches 2px further on each
// axis. At rest it is Carbon's own path; in
// motion the outline is sampled (as Phone's).

const APPLE =
  'M21.7788 8A11.4843 11.4843 0 0 0 18.7241 8.5342A14.5665 14.5665 0 0 1 16.9016 8.9468A6.0054 6.0054 0 0 0 11 4V6A3.9933 3.9933 0 0 1 14.8267 8.9' +
  'C14.3086 8.8121 13.7698 8.6793 13.2095 8.5352A12.89 12.89 0 0 0 10.0317 8C6.311 8 4 11.0652 4 16C4 23.51 8.0679 27.999 12.0005 28H12.002' +
  'A7.1576 7.1576 0 0 0 14.492 27.41A5.0128 5.0128 0 0 1 16 27A5.0266 5.0266 0 0 1 17.5112 27.41A7.15 7.15 0 0 0 20 28H20C23.9307 27.999 28 23.51 28 16' +
  'C28 12.3094 26.3706 8 21.7788 8Z' +
  'M20 26H20A5.5038 5.5038 0 0 1 18.2095 25.5361A6.4168 6.4168 0 0 0 16 25A6.4043 6.4043 0 0 0 13.7939 25.5361A5.5343 5.5343 0 0 1 12 26H12.0015' +
  'C9.0513 25.9988 6 22.2586 6 16C6 14.1963 6.3931 10 10.0317 10A11.2363 11.2363 0 0 1 12.7124 10.4726A12.9819 12.9819 0 0 0 15.7612 11H16.2534' +
  'A11.7955 11.7955 0 0 0 19.249 10.4639A9.8483 9.8483 0 0 1 21.7788 10C25.7964 10 26 14.9978 26 16C26 22.2586 22.9482 25.9988 20 26Z';
const LEAF =
  'M18 7H17V6A2.0021 2.0021 0 0 1 19 4H20V5A2.0021 2.0021 0 0 1 18 7Z';
const APPLE_C: Pt = [16, 18];
/** The apple's scale on hover: its sides' centrelines (11 out) move 1.5px. */
export const APPLE_GROW = 1.5 / 11;
const LEAF_BASE: Pt = [17, 7];
export const LEAF_GROW = 2 / 3;
const APPLE_LOOPS: Pt[][] = /* @__PURE__ */ (() =>
  APPLE.split(/(?=M)/).map((sub) => pathPoints(sub, 0.1)))();

/** For each loop, +1 if the ink lies to the left of its edges, −1 if to the right (as Phone's). */
function inkSides(loops: readonly Pt[][]): (1 | -1)[] {
  const inked = ([x, y]: Pt) => {
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
  };
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
    return inked([(a[0] + b[0]) / 2 + nx * 0.05, (a[1] + b[1]) / 2 + ny * 0.05])
      ? 1
      : -1;
  });
}
const APPLE_SIDES = /* @__PURE__ */ inkSides(APPLE_LOOPS);

export const AppleSpec = /* @__PURE__ */ hoverIcon('Apple', {
  geo: ({ h }) => {
    if (!h) {
      return { apple: { d: APPLE, ...EVENODD }, leaf: { d: LEAF } };
    }
    const s = 1 + APPLE_GROW * h;
    const apple = weightScaleLoops(APPLE_LOOPS, APPLE_SIDES, APPLE_C, s)
      .map((l) => polyPath(l, true))
      .join('');
    const [dx, dy] = [
      (LEAF_BASE[0] - APPLE_C[0]) * (s - 1),
      (LEAF_BASE[1] - APPLE_C[1]) * (s - 1),
    ];
    return {
      apple: { d: apple, ...EVENODD },
      leaf: { d: scalePath(LEAF, LEAF_BASE, 1 + LEAF_GROW * h, dx, dy) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Apple32),
});

// ── Person ───────────────────────────────────────────────────────────────────
//
// The head (a ring r 2–4 about (16, 5)) over the body: the arms (walls x
// 10–12 and 20–22, r 3 shoulders) and the legs (x 12–14 and 18–20, joined
// at the feet). Hover (People family): each arm, its shoulder corner and the
// r 2 turn into the leg step 1px out (the shoulders' top lengthens 2px; a
// short run opens where each arm's turn meets its leg); the head grows 1px
// in diameter, its bottom held.

export const PERSON_WIDEN = 1;
function personD(w: number): string {
  const [l, r] = [(x: number) => f(x - w), (x: number) => f(x + w)];
  return (
    `M18 30H14A2 2 0 0 1 12 28V21H${l(12)}A2 2 0 0 1 ${l(10)} 19V13A3 3 0 0 1 ${l(13)} 10H${r(19)}A3 3 0 0 1 ${r(22)} 13V19A2 2 0 0 1 ${r(20)} 21H20V28A2 2 0 0 1 18 30Z` +
    `M${l(13)} 12A0.94 0.94 0 0 0 ${l(12)} 13V19H14V28H18V19H${r(20)}V13A0.94 0.94 0 0 0 ${r(19)} 12Z`
  );
}

export const PersonSpec = /* @__PURE__ */ hoverIcon('Person', {
  geo: ({ h }) => ({
    head: { d: ringPath([16, 5 - h / 2], 3 + h / 2, 2), ...EVENODD },
    body: { d: personD(PERSON_WIDEN * h), ...EVENODD },
  }),
  static: /* @__PURE__ */ carbonArt(Person32),
});

// ── Events alt ───────────────────────────────────────────────────────────────

const u = (x0: number, x1: number, top: number, bottom: number): Pt[] => [
  [x0, bottom],
  [x0, top],
  [x1, top],
  [x1, bottom],
];
const EVENTS_ALT: [string, PersonArt, Pt][] = [
  ['upperLeft', { head: [8, 6], hr: 3, body: u(3, 13, 12, 16), r: 2 }, [-1, 0]],
  [
    'upperRight',
    { head: [24, 6], hr: 3, body: u(19, 29, 12, 16), r: 2 },
    [1, 0],
  ],
  [
    'lowerLeft',
    { head: [8, 21], hr: 3, body: u(3, 13, 27, 31), r: 2 },
    [-1, 1],
  ],
  [
    'lowerRight',
    { head: [24, 21], hr: 3, body: u(19, 29, 27, 31), r: 2 },
    [1, 1],
  ],
];

export const EventsAltSpec = /* @__PURE__ */ hoverIcon('EventsAlt', {
  geo: ({ h }) =>
    Object.assign(
      {},
      ...EVENTS_ALT.map(([k, pp, [dx, dy]]) =>
        personShapes(k, grown(pp, h, [dx * h, dy * h]))
      )
    ),
  static: /* @__PURE__ */ carbonArt(EventsAlt32),
});

// ── Face dissatisfied ────────────────────────────────────────────────────────
//
// Face satisfied's face (the ring r 12–14, the eyes r 2.5 about (11.5, 13.5)
// and (20.5, 13.5)) with a frown: a band r 6–8 about (16, 27), its ends
// 30.97° (outer) and 31.18° (inner) above the horizontal.
// face--dissatisfied--filled is a disc of r 14 with the eyes and frown
// knocked out (its frown 0.03px lower; not drawn apart).
//
// Hover: the ring (or disc) grows 1px in radius and the frown's ends sweep
// 1px further round its r 7 centreline (8.2°), so the corners droop; their space to the ring holds
// within 0.1px (2.28 → 2.19). The eyes hold.

const FROWN: Smile = {
  c: [16, 27],
  r: 7,
  ao: Math.atan2(4.11, 6.85),
  ai: Math.atan2(3.11, 5.14),
};
export const FROWN_REACH = 1;
const FACE_EYES: Pt[] = [
  [11.5, 13.5],
  [20.5, 13.5],
];

/** The frown at hover h: each end swept FROWN_REACH·h further round the centreline (the corners droop). */
export const frownAt = (h: number): Smile => ({
  ...FROWN,
  ao: FROWN.ao - (FROWN_REACH * h) / FROWN.r,
  ai: FROWN.ai - (FROWN_REACH * h) / FROWN.r,
});

export function frownPath(sm: Smile): string {
  const [ro, ri] = [sm.r + 1, sm.r - 1];
  const at = (r: number, a: number, side: 1 | -1): Pt => [
    sm.c[0] + side * r * Math.cos(a),
    sm.c[1] - r * Math.sin(a),
  ];
  return `M${P(at(ro, sm.ao, -1))}A${f(ro)} ${f(ro)} 0 0 1 ${P(at(ro, sm.ao, 1))}L${P(at(ri, sm.ai, 1))}A${f(ri)} ${f(ri)} 0 0 0 ${P(at(ri, sm.ai, -1))}Z`;
}

export function dissatisfiedShapes({ h, p, e }: ToggleFrameIn): Shapes {
  const r = 13 + h;
  return {
    ring: { d: ringPath(C, r, 2) },
    glyph: {
      d:
        circleD(C, r * p) +
        circleD(C, r * e) +
        FACE_EYES.map((c) => circleD(c, 2.5)).join('') +
        frownPath(frownAt(h)),
      ...EVENODD,
    },
  };
}

const dissatisfied = /* @__PURE__ */ fillSet(
  ['FaceDissatisfied', 'FaceDissatisfiedFilled', 'FaceDissatisfiedToggle'],
  [CFaceDissatisfied, CFaceDissatisfiedFilled],
  dissatisfiedShapes
);
export const FaceDissatisfiedSpec = /* @__PURE__ */ withStatic(
  dissatisfied.outline,
  /* @__PURE__ */ carbonArt(FaceDissatisfied32)
);
export const FaceDissatisfiedFilledSpec = /* @__PURE__ */ withStatic(
  dissatisfied.filled,
  /* @__PURE__ */ carbonArt(FaceDissatisfiedFilled32)
);
export const FaceDissatisfiedToggleSpec = dissatisfied.toggle;

// ── Volume ───────────────────────────────────────────────────────────────────
//
// The speaker (Carbon's outline: the box and the cone, 2px walls) and its
// waves, 2px arcs with radial ends: the first r 6–8 about (17, 15.87), the
// second r 10–12 about (18, 15.84), both from 40.17° above the horizontal to
// 42.71° below (Carbon's are a touch turned). volume--up has both waves;
// volume--down is volume--up without its second wave, all 2px right (so the
// speaker and wave sit centred); the --filled drawings are the speaker solid.
// volume--mute is volume--up's speaker, in the same place, with a 10px ×
// where the waves were (volume--mute's and volume--down's cone corners are a
// touch rounder, r 1.17: the speaker eases between the two with its 2px move,
// or with the ×).
//
// A wave is placed by one number p: 0–1 it grows out of the cone's wall into
// the first place (a wedge r 0 → 2, then a 2px band out to r 7), 1–2 it
// travels to the second place (centre and radius), 2–3 one spacing further
// (r 11 → 15). A wave travelling past its icon's last place keeps its 2px
// weight and shrinks toward its middle as Connection signal's outer waves do,
// to a quarter of its length by 0.7 of the travel, where it blinks off (no
// fade).
//
// Hover (Volume up, Volume down, and the toggles' levels): each wave grows 1px in radius in place, about its own centre, at
// its 2px weight; its arc keeps its angles, so it lengthens with it (the
// inner wave about 0.7px an end, the outer 0.75px). Two waves grow together,
// so their 2px gap holds; one wave grows alone. The speaker holds. Standard
// hover (160ms entrance in, 120ms exit out).
//
// Action (Volume up, Volume down and filled; trigger() / actionKey /
// actionOn): Connection signal's pulse, one wavelength out,
// 240ms on Carbon's standard ease: every wave travels one
// place out (the one passing the last place shrinks away, as above)
// and a new wave grows out of the cone into the first place, landing on the
// resting drawing. A wave's hover growth comes in as it reaches the first
// place and goes as it travels past the last, so nothing leaves the box.
//
// Fill (Volume up ⇄ filled): one disc from the area centroid of the
// speaker's inside, filling it out to its walls' centreline (1px under the
// ink, so no seam); a hole from the same point empties it.
//
// Levels (VolumeLevelToggle, and its filled form): mute → quiet → loud →
// mute, a click a step, and mute from any level. Two waves are loud and one
// is quiet (Carbon's volume--up / --down, and their --alt + / − speakers, are
// louder / quieter controls). The values none / down / up still work,
// deprecated. Each
// level hovers as its icon does (quiet as Volume down, loud as Volume up,
// mute as Volume mute). Mute is Volume mute (and filled), reached from any
// level by a snappy cut rather than the pulses retracting. Up a level
// (280ms, the pulse's level-step timing): the new wave grows out of the cone into the
// first place, and the wave already there travels to the second. The
// speaker never moves: it stays at volume--up's place at every level, so
// only the waves and the × come and go. So its one-wave level is volume--up
// without its second wave, 2px left of Carbon's volume--down (which centres
// its speaker and wave), drawn here, also as the static icon when motion is
// off. Its two-wave level is volume--up, and its off level is Carbon's
// volume--mute (and --filled): the same speaker in the same place (only its
// cone corners are a touch rounder, r 1.17, easing with the ×), and the
// remove family's 10px × (2px arms) beside it, centred at (26, 16).
//
// Mute (from either level, 120ms, fast-02): a match cut. The waves collapse
// onto their middles at a constant 2px (their arcs shorten to nothing, radial
// ends) over the first 40ms on the exit ease, then the × grows out of its
// centre over the last 80ms (fast-01) on the entrance ease: two 2px bars
// whose ends reach out from (26, 16) to Carbon's, its arms never thinner or
// thicker. They run one after the other because the × sits where the inner
// wave sits (its arms cross x 21–31, the waves x 22–30). Unmute is the same
// cut the other way, equally snappy (120ms): the × shrinks back into its
// centre (40ms, exit ease), then the level's waves open out at their places
// from their middles (80ms, entrance ease). The pulse (280ms) is kept for
// the steps between levels; it can't bring the waves back out of mute until
// the × has gone, which would make unmuting 320ms against a 120ms mute. A
// change caught mid-cut reverses from where it is. With motion off each
// state draws Carbon's art (volume--mute, volume--up) or the quiet level's
// own drawing.
//
// Volume mute (and filled), and the toggle at mute: hover reaches each of
// the ×'s arm ends 1px further (the Off rule's slash reach; the 2px of the
// close family would bring the × within 0.6px of the speaker), on the
// standard hover. The speaker holds.

const SPEAKER =
  'M18 30A1 1 0 0 1 17.29 29.7L9.67 22H3A1 1 0 0 1 2 21H2V11A1 1 0 0 1 3 10H9.67L17.29 2.3A1 1 0 0 1 18.7 2.3A1 1 0 0 1 19 3V29A1 1 0 0 1 18 30Z';
/** The speaker's inside, its cone corners k of the way from volume--up's (r 1) to volume--down's (r 1.17). */
const speakerInside = (k: number) => {
  const [x, r] = [f(10.08 - 0.08 * k), f(1 + 0.17 * k)];
  return `M4 20H${x}A${r} ${r} 0 0 1 10.79 20.3L17 26.57V5.43L10.79 11.7A${r} ${r} 0 0 1 ${x} 12H4Z`;
};
const SPEAKER_INSIDE = /* @__PURE__ */ speakerInside(0);
/** The inside out to the walls' centreline (1px out): the fill's reach. */
const SPEAKER_FILL: Pt[] = /* @__PURE__ */ growPoly(
  /* @__PURE__ */ pathPoints(SPEAKER_INSIDE, 0.1),
  1
);
const SPEAKER_FILL_C = /* @__PURE__ */ areaCentroid(
  /* @__PURE__ */ pathPoints(SPEAKER_INSIDE, 0.1)
);
const SPEAKER_FILL_R =
  /* @__PURE__ */ Math.max(
    .../* @__PURE__ */ SPEAKER_FILL.map(([x, y]) =>
      Math.hypot(x - SPEAKER_FILL_C[0], y - SPEAKER_FILL_C[1])
    )
  ) + 0.5;

const WAVE_IN: Pt = [17, 15.87];
const WAVE_OUT: Pt = [18, 15.84];
const WAVE_A0 = rad(-40.17);
const WAVE_A1 = rad(42.71);
const WAVE_MID = (WAVE_A0 + WAVE_A1) / 2;
const WAVE_HALF = (WAVE_A1 - WAVE_A0) / 2;
/** A band `w` wide (2px) about the centreline arc (c, r), `half` either side of the middle angle, radial ends. */
function arcBand(c: Pt, r: number, half: number, w = 2): string {
  if (half < 1e-4 || r < 1) {
    return '';
  }
  const at = (rr: number, a: number): Pt => [
    c[0] + rr * Math.cos(a),
    c[1] + rr * Math.sin(a),
  ];
  const [a0, a1] = [WAVE_MID - half, WAVE_MID + half];
  const [ro, ri] = [r + w / 2, r - w / 2];
  return `M${P(at(ro, a0))}A${f(ro)} ${f(ro)} 0 0 1 ${P(at(ro, a1))}L${P(at(ri, a1))}A${f(ri)} ${f(ri)} 0 0 0 ${P(at(ri, a0))}Z`;
}
/** A wedge of radius R about c over the waves' angles (a wave while it grows in), `span` of them about their middle. */
function wedge(c: Pt, R: number, span = 1): string {
  const pts: Pt[] = [c];
  const [a0, a1] =
    span === 1
      ? [WAVE_A0, WAVE_A1]
      : [WAVE_MID - WAVE_HALF * span, WAVE_MID + WAVE_HALF * span];
  for (let i = 0; i <= 24; i++) {
    const a = a0 + ((a1 - a0) * i) / 24;
    pts.push([c[0] + R * Math.cos(a), c[1] + R * Math.sin(a)]);
  }
  return polyPath(pts, true);
}

/** A wave's centre and centreline radius at place p (see above). */
export function wavePlace(p: number): { c: Pt; r: number } {
  if (p <= 1) {
    return { c: WAVE_IN, r: 7 * Math.max(0, p) };
  }
  if (p <= 2) {
    return {
      c: [
        lerp(WAVE_IN[0], WAVE_OUT[0], p - 1),
        lerp(WAVE_IN[1], WAVE_OUT[1], p - 1),
      ],
      r: 7 + 4 * (p - 1),
    };
  }
  return { c: WAVE_OUT, r: 11 + 4 * Math.min(1, p - 2) };
}
/** How far a wave's radius grows on hover (in place, about its own centre, at 2px weight; its arc keeps its angles, so it lengthens with it). */
export const WAVE_GROW = 1;
/**
 * A wave at place p, moved x right, `span` of its arc about its middle (1
 * whole; 0 collapsed, into mute), its radius grown `grow` px (the hover; it
 * comes in as a wave grows into the first place, and goes as one travels
 * past the last, so nothing leaves the box); '' before it appears.
 */
export function waveD(p: number, x: number, span = 1, grow = 0): string {
  if (p <= 1e-4 || span <= 1e-4) {
    return '';
  }
  const { c, r } = wavePlace(p);
  const at: Pt = [c[0] + x, c[1]];
  if (r < 1) {
    return wedge(at, 2 * r, span);
  }
  const g = grow * Math.min(1, r / 7, Math.max(0, 3 - p));
  return arcBand(at, r + g, WAVE_HALF * span);
}

/** The pulse, Volume up's and Volume down's action: one pass, in ms. */
export const PULSE_MS = 240;
/** The pulse's travel over its time (Carbon's standard productive ease; the action's time runs linear). */
const PULSE_EASE = /* @__PURE__ */ cubicBezier(
  ...toEasing(motionTokens.easing.standard)
);

/**
 * How much of its length a wave passing the last place keeps at pulse
 * progress q (the eased travel): Connection signal's outgoing waves',
 * trimming toward its middle to a quarter by OUTGOING_GONE, then gone in one
 * step.
 */
export const waveShrink = (q: number) =>
  q >= OUTGOING_GONE ? 0 : 1 - (OUTGOING_TRIM * q) / OUTGOING_GONE;

/**
 * The waves of a level drawing: the older wave at place a, the newer at b
 * (0 when there's none), x the speaker's move, c the collapse into mute (0
 * whole, 1 gone), g the hover's growth (px of radius) and t the pulse's time
 * (the action, 0 → 1 linear in time). The wave passing the last place
 * shrinks away as Connection signal's do. Three keys: the older, the newer
 * and the one the pulse brings in.
 */
type WaveKey = 'waveA' | 'waveB' | 'waveC';
export function volumeWaveParts({
  a,
  b,
  x,
  c = 0,
  g = 0,
  t = 0,
}: {
  a: number;
  b: number;
  x: number;
  c?: number;
  g?: number;
  t?: number;
}): Record<WaveKey, { d: string }> {
  const level = (a >= 0.5 ? 1 : 0) + (b >= 0.5 ? 1 : 0);
  const time = level ? t : 0;
  const pulse = time > 0 && time < 1 ? PULSE_EASE(time) : 0;
  const wave = (w: number) => {
    const here = w >= 0.5;
    // Travelling past the last place, a wave shrinks toward its middle and blinks off.
    const passes = here && w + 1 > level + 0.5;
    return {
      d: waveD(
        w + (here ? pulse : 0),
        x,
        (1 - c) * (passes ? waveShrink(pulse) : 1),
        g
      ),
    };
  };
  return {
    waveA: wave(a),
    waveB: wave(b),
    waveC: { d: waveD(pulse, x, 1 - c, g) },
  };
}
/** The waves' drawings (see volumeWaveParts). */
export function volumeWaves(fr: {
  a: number;
  b: number;
  x: number;
  c?: number;
  g?: number;
  t?: number;
}): Record<WaveKey, string> {
  const w = volumeWaveParts(fr);
  return { waveA: w.waveA.d, waveB: w.waveB.d, waveC: w.waveC.d };
}

/** The speaker at move x, its cone's corners k of the way to volume--down's / volume--mute's (by default with the move), outlined or solid. */
const speakerD = (x: number, solid: boolean, k = x / 2) => {
  const move = (d: string) => (x ? mapPath(d, ([px, py]) => [px + x, py]) : d);
  return move(SPEAKER) + (solid ? '' : move(speakerInside(k)));
};

/** Mute's ×: Carbon's (the remove family's small close, 10px across, 2px arms), centred at (26, 16). */
const MUTE_C: Pt = [26, 16];
/** How far each of the ×'s arms reaches from its centre to the middle of its end (5√2 − 1, Carbon's). */
export const MUTE_ARM = 5 * Math.SQRT2 - 1;
/** Its hover: each arm end 1px further along its arm. */
export const MUTE_REACH = 1;
/**
 * The × with arms reaching l from its centre: two 2px bars (one subpath
 * each, wound alike, so they fill as one), so it grows out of its centre at
 * a constant 2px from nothing. At l = MUTE_ARM it is Carbon's ×.
 */
export function muteCrossD(l: number): string {
  if (l <= 1e-3) {
    return '';
  }
  const S = Math.SQRT1_2;
  const [cx, cy] = MUTE_C;
  const bar = (ux: number, uy: number): Pt[] => [
    [cx + ux * l - uy, cy + uy * l + ux],
    [cx + ux * l + uy, cy + uy * l - ux],
    [cx - ux * l + uy, cy - uy * l - ux],
    [cx - ux * l - uy, cy - uy * l + ux],
  ];
  return polyPath(bar(S, -S), true) + polyPath(bar(S, S), true);
}

/** Volume up at hover h, fill p and e, and pulse time t (the hover icons, the fill toggle, and the action). */
export function volumeShapes({
  h,
  p,
  e,
  t = 0,
}: ToggleFrameIn & { t?: number }): Shapes {
  return {
    speaker: { d: speakerD(0, false), ...EVENODD },
    fill: {
      d: shapeFillPath(
        SPEAKER_FILL,
        SPEAKER_FILL_C,
        SPEAKER_FILL_R * p,
        SPEAKER_FILL_R * e
      ),
      ...EVENODD,
    },
    ...volumeWaveParts({ a: 2, b: 1, x: 0, g: WAVE_GROW * h, t }),
  };
}

/** The pulse as an action's input, over a drawing that takes pulse time t (Volume up, Volume down and their filled forms). */
/* @__NO_SIDE_EFFECTS__ */
const pulse = (
  geo: (f: { h: number; t: number }) => Shapes,
  waves: string
): ActionInput => ({
  description: `The sound goes out: ${waves}, and a new wave grows from the speaker to take its place. Looped, the waves keep coming.`,
  duration: PULSE_MS / 1000,
  geo: ({ h, a }) => geo({ h, t: a >= 1 ? 0 : a }),
});

const volume = /* @__PURE__ */ fillSet(
  ['VolumeUp', 'VolumeUpFilled', 'VolumeUpToggle'],
  [CVolumeUp, CVolumeUpFilled],
  volumeShapes
);
const UP_WAVES =
  'each wave moves one place outward and the outermost shrinks to nothing';
/** Volume up: on hover the waves grow a little; its action sends out a pulse. */
export const VolumeUpSpec = /* @__PURE__ */ hoverIcon('VolumeUp', {
  geo: volume.outline.geo,
  static: /* @__PURE__ */ carbonArt(VolumeUp32),
  action: /* @__PURE__ */ defineAction(
    pulse(({ h, t }) => volumeShapes({ h, p: 0, e: 0, t }), UP_WAVES)
  ),
});
/** Volume up filled: Volume up's hover and action, the speaker solid. */
export const VolumeUpFilledSpec = /* @__PURE__ */ hoverIcon('VolumeUpFilled', {
  geo: volume.filled.geo,
  static: /* @__PURE__ */ carbonArt(VolumeUpFilled32),
  action: /* @__PURE__ */ defineAction(
    pulse(({ h, t }) => volumeShapes({ h, p: 1, e: 0, t }), UP_WAVES)
  ),
});
export const VolumeUpToggleSpec = volume.toggle;

// The levels.

/**
 * The level toggle's states, in click order: mute (Carbon's volume--mute),
 * quiet (one wave) and loud (two waves, volume--up). Deprecated names are
 * also taken, and never reported: `none` is mute, `down` quiet, `up` loud.
 */
export type VolumeLevel = 'mute' | 'quiet' | 'loud' | 'none' | 'down' | 'up';
const VOLUME_LEVELS: readonly VolumeLevel[] = ['mute', 'quiet', 'loud'];
const MUTE_REST: Frame = { x: 0, a: 0, b: 0, c: 1, m: 1 };
const QUIET_REST: Frame = { x: 0, a: 1, b: 0, c: 0, m: 0 };
const LOUD_REST: Frame = { x: 0, a: 2, b: 1, c: 0, m: 0 };
/** Each level's numbers: the speaker's move x, the older and newer waves' places a and b, the waves' collapse c, and the ×'s growth m. */
export const volumeRest = (s: VolumeLevel): Frame =>
  ({
    mute: MUTE_REST,
    none: MUTE_REST,
    quiet: QUIET_REST,
    down: QUIET_REST,
    loud: LOUD_REST,
    up: LOUD_REST,
  })[s];
const LEVEL_UP = SIGNAL_HOVER;

/** Mute's cut, all told (fast-02, 120ms). */
export const MUTE_MS = motionTokens.duration.fast02;
/** Its first part, the waves collapsing (or, unmuting, the × shrinking): 40ms, fast-02 − fast-01. */
export const MUTE_CUT_MS =
  motionTokens.duration.fast02 - motionTokens.duration.fast01;
/** The first part: 40ms on the exit ease. */
const CUT = {
  duration: MUTE_CUT_MS / 1000,
  ease: /* @__PURE__ */ toEasing(motionTokens.easing.exit),
};
/** The second part on its own (fast-01, 80ms, entrance ease): when there is nothing to cut first. */
const GROW = {
  duration: motionTokens.duration.fast01 / 1000,
  ease: /* @__PURE__ */ toEasing(motionTokens.easing.entrance),
};
/** Where the second part starts in the whole cut (40 / 110). */
const CUT_SHARE = MUTE_CUT_MS / MUTE_MS;
/** The second part after the first: the whole 120ms, holding for the first 40ms, then the entrance ease over the last 80ms. */
const AFTER_CUT = {
  duration: MUTE_MS / 1000,
  ease: (t: number) =>
    t <= CUT_SHARE ? 0 : ENTRANCE((t - CUT_SHARE) / (1 - CUT_SHARE)),
};

/** A level drawing at hover h, pulse time t and the level numbers (Volume down's hover icons; the toggle adds the ×). */
export function volumeLevelShapes(fr: Frame, solid: boolean): Shapes {
  const { h = 0, x = 0, a = 0, b = 0, c = 0, t = 0 } = fr;
  return {
    speaker: { d: speakerD(x, solid), ...EVENODD },
    ...volumeWaveParts({ a, b, x, c, g: WAVE_GROW * h, t }),
  };
}

/**
 * The level toggle's drawing (and Volume mute's): the level drawing, the
 * speaker's cone corners easing to volume--mute's with the ×, and the ×
 * (its ends reaching MUTE_REACH further on hover).
 */
export function volumeMuteShapes(fr: Frame, solid: boolean): Shapes {
  const { h = 0, x = 0, a = 0, b = 0, c = 0, m = 0 } = fr;
  return {
    speaker: { d: speakerD(x, solid, Math.min(1, x / 2 + m)), ...EVENODD },
    ...volumeWaveParts({ a, b, x, c, g: WAVE_GROW * h }),
    mute: { d: muteCrossD(m * (MUTE_ARM + MUTE_REACH * h)) },
  };
}

/**
 * A level change (see Levels and Mute above). Into mute: the waves collapse
 * (40ms), then the × grows (80ms). Out of mute: the × shrinks (40ms), then
 * the level's waves open out at their places (80ms); caught mid-cut, the
 * waves open back out from where they are and travel to the level's places.
 * Between levels: the pulse (280ms).
 */
const volumeLevelChange = (
  _prev: VolumeLevel,
  next: VolumeLevel,
  fr: Frame,
  tween: StateTweenFn,
  repaint: () => void
) => {
  const to = volumeRest(next);
  const wavesShowing = fr.c < 1 - 1e-3 && (fr.a > 1e-3 || fr.b > 1e-3);
  if (to.m === 1) {
    return [
      tween('c', 1, CUT, () => {
        // Collapsed: the waves are gone; rest at mute's numbers.
        Object.assign(fr, { x: 0, a: 0, b: 0 });
        repaint();
      }),
      tween('m', 1, wavesShowing ? AFTER_CUT : GROW),
    ];
  }
  if (fr.m > 1e-3 || fr.c > 1e-3) {
    const runs = [tween('m', 0, CUT)];
    if (wavesShowing) {
      runs.push(
        tween('c', 0, GROW),
        ...(['x', 'a', 'b'] as const).map((k) => tween(k, to[k], LEVEL_UP))
      );
    } else {
      // The waves are cut: set them at the level's places, collapsed, and open them out once the × has gone.
      const crossShowing = fr.m > 1e-3;
      Object.assign(fr, { x: to.x, a: to.a, b: to.b, c: 1 });
      runs.push(tween('c', 0, crossShowing ? AFTER_CUT : GROW));
    }
    return runs;
  }
  return (['x', 'a', 'b'] as const).map((k) => tween(k, to[k], LEVEL_UP));
};

/** Volume down (and filled): Carbon's volume--down, one wave, its speaker 2px right of volume--up's; its hover grows the wave, its action is the pulse. */
const VOLUME_DOWN: Frame = { x: 2, a: 1, b: 0 };
const DOWN_WAVES = 'the wave moves outward and shrinks to nothing';
/** Volume down: on hover the wave grows a little; its action sends out a pulse. */
export const VolumeDownSpec = /* @__PURE__ */ hoverIcon('VolumeDown', {
  geo: ({ h }) => volumeLevelShapes({ h, ...VOLUME_DOWN }, false),
  static: /* @__PURE__ */ carbonArt(VolumeDown32),
  action: /* @__PURE__ */ defineAction(
    pulse(
      ({ h, t }) => volumeLevelShapes({ h, t, ...VOLUME_DOWN }, false),
      DOWN_WAVES
    )
  ),
});
/** Volume down filled: Volume down's hover and action, the speaker solid. */
export const VolumeDownFilledSpec = /* @__PURE__ */ hoverIcon(
  'VolumeDownFilled',
  {
    geo: ({ h }) => volumeLevelShapes({ h, ...VOLUME_DOWN }, true),
    static: /* @__PURE__ */ carbonArt(VolumeDownFilled32),
    action: /* @__PURE__ */ defineAction(
      pulse(
        ({ h, t }) => volumeLevelShapes({ h, t, ...VOLUME_DOWN }, true),
        DOWN_WAVES
      )
    ),
  }
);
/** Volume mute: the speaker with an × beside it. On hover the × reaches out a little. */
export const VolumeMuteSpec = /* @__PURE__ */ hoverIcon('VolumeMute', {
  geo: ({ h }) => volumeMuteShapes({ h, ...MUTE_REST }, false),
  static: /* @__PURE__ */ carbonArt(VolumeMute32),
});
/** Volume mute filled: the solid speaker with an ×, with Volume mute's hover. */
export const VolumeMuteFilledSpec = /* @__PURE__ */ hoverIcon(
  'VolumeMuteFilled',
  {
    geo: ({ h }) => volumeMuteShapes({ h, ...MUTE_REST }, true),
    static: /* @__PURE__ */ carbonArt(VolumeMuteFilled32),
  }
);
/** The down level's drawing as a static icon (its own drawing, at volume--up's place, for when motion is off). */
const levelStatic = (s: VolumeLevel, solid: boolean): CarbonIcon => {
  return specStill(
    hoverIcon(`VolumeLevel${s}${solid ? 'Filled' : ''}`, {
      geo: () => volumeLevelShapes(volumeRest(s), solid),
    })
  );
};

/* @__NO_SIDE_EFFECTS__ */
const volumeLevels = (
  name: string,
  solid: boolean,
  up: CarbonIcon,
  mute: CarbonIcon,
  quiet = levelStatic('quiet', solid)
) =>
  stateIcon<VolumeLevel>(name, {
    states: VOLUME_LEVELS,
    statics: { mute, none: mute, quiet, down: quiet, loud: up, up },
    rest: volumeRest,
    geo: (fr) => volumeMuteShapes(fr, solid),
    change: volumeLevelChange,
    muteState: 'mute',
    renamed: { none: 'mute', down: 'quiet', up: 'loud' },
  });
const VolumeLevelOutlineToggle = /* @__PURE__ */ volumeLevels(
  'VolumeLevelToggle',
  false,
  CVolumeUp,
  CVolumeMute
);
const VolumeLevelFilledToggle = /* @__PURE__ */ volumeLevels(
  'VolumeLevelToggle(filled)',
  true,
  CVolumeUpFilled,
  CVolumeMuteFilled
);
/** Volume: each click steps mute → quiet → loud → mute; `muted` mutes from any level and returns to that level when cleared. `filled` draws Carbon's filled speakers. The older state names `none`, `down` and `up` still work. */
export const VolumeLevelToggleSpec = /* @__PURE__ */ variantToggle(
  'VolumeLevelToggle',
  (p: StateIconProps<VolumeLevel>) =>
    p.filled ? VolumeLevelFilledToggle : VolumeLevelOutlineToggle
);
