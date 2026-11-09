/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Flash32 from '@carbon/icons/es/flash/32.js';
import FlashFilled32 from '@carbon/icons/es/flash--filled/32.js';
import Light16 from '@carbon/icons/es/light/16.js';
import Light32 from '@carbon/icons/es/light/32.js';
import LightFilled32 from '@carbon/icons/es/light--filled/32.js';
import Microphone32 from '@carbon/icons/es/microphone/32.js';
import MicrophoneFilled32 from '@carbon/icons/es/microphone--filled/32.js';
import Send32 from '@carbon/icons/es/send/32.js';
import SendAlt32 from '@carbon/icons/es/send--alt/32.js';
import SendAltFilled32 from '@carbon/icons/es/send--alt--filled/32.js';
import SendFilled32 from '@carbon/icons/es/send--filled/32.js';
import View16 from '@carbon/icons/es/view/16.js';
import View32 from '@carbon/icons/es/view/32.js';
import ViewFilled32 from '@carbon/icons/es/view--filled/32.js';
import {
  carbonArt,
  fillThenClear,
  hoverIcon,
  toggleIcon,
  type CarbonIcon,
  type Shapes,
  withStatic,
} from '../../engine';
import {
  centroid,
  discFillPath,
  ringPath,
  shapeFillPath,
  type Pt,
} from '../../geometry';
import { cutBase, type OffStroke, type Slash } from '../../off';
import { f, lerp } from '../../paint';
import { FLASH_ART, flashBolt } from './flashOffArt';
import { MIC_ART, micCapsule } from './micOffArt';
import { VIEW_ART, VIEW_EYE_OUTER, VIEW_LIFT_16, viewEye } from './viewOffArt';
import {
  ALT_HOVER,
  ALT_REST,
  SEND_HOVER,
  SEND_REST,
  sendAltPlane,
  sendPlane,
} from '../operations/opsMisc';

const CFlash = /* @__PURE__ */ carbonArt(Flash32);
const CFlashFilled = /* @__PURE__ */ carbonArt(FlashFilled32);
const CLight = /* @__PURE__ */ carbonArt(Light16, Light32);
const CLightFilled = /* @__PURE__ */ carbonArt(LightFilled32);
const CMicrophone = /* @__PURE__ */ carbonArt(Microphone32);
const CMicrophoneFilled = /* @__PURE__ */ carbonArt(MicrophoneFilled32);
const CSend = /* @__PURE__ */ carbonArt(Send32);
const CSendAlt = /* @__PURE__ */ carbonArt(SendAlt32);
const CSendAltFilled = /* @__PURE__ */ carbonArt(SendAltFilled32);
const CSendFilled = /* @__PURE__ */ carbonArt(SendFilled32);
const CView = /* @__PURE__ */ carbonArt(View16, View32);
const CViewFilled = /* @__PURE__ */ carbonArt(ViewFilled32);

/**
 * Outline ↔ filled toggles on the frame engine: Flash, Light, Microphone,
 * View, Send and Send alt.
 *
 * Toggle (all): the house disc fill (§7.7). A disc grows from the shape's
 * centroid, clipped to the shape's inside (its centreline), in 160ms on the
 * entrance ease; to empty it, a hole grows from the same centre in 120ms on
 * the exit ease. Where Carbon's filled drawing knocks a part out of the fill
 * (View's iris, Send's nib), that part shares the fill's even-odd path, so it
 * turns into the knockout as the fill passes it. No masks or clip paths.
 *
 * Hover (either state): the icon's own hover, shared with the
 * matching hover icons and Off toggles, so the outline and filled drawings
 * here equal Flash, View, Microphone (their Off toggles' "on" ends), Light
 * and Send / Send alt (operations) exactly.
 *
 * Every outline is its 2px centreline (as the Off art draws it), so the line
 * weight holds through the hover; filled is that outline plus the fill.
 */

const EVENODD = { fillRule: 'evenodd' } as const;

/** A circle as two exact arcs; nothing at r ≤ 0. */
const circleD = ([cx, cy]: Pt, r: number) =>
  r > 1e-4
    ? `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`
    : '';

/** How far the fill disc must reach from `c` to cover `pts`. */
const reachOf = (pts: readonly Pt[], c: Pt) =>
  Math.max(...pts.map(([x, y]) => Math.hypot(x - c[0], y - c[1]))) + 0.5;

/** Centrelines drawn at 2px as the Off art draws them uncut: open strokes (nonzero) and closed rings (evenodd). */
function outline(strokes: readonly OffStroke[], slash: Slash): Shapes {
  const { fill, rings } = cutBase(strokes, slash, 0);
  return { outline: { d: fill }, rings: { d: rings, ...EVENODD } };
}

type FillToggle = (h: number, p: number, e: number, size?: number) => Shapes;

/** The toggle, plus its outline and filled ends as hover icons. */
function build(
  name: string,
  statics: readonly [CarbonIcon, CarbonIcon],
  shapes: FillToggle
) {
  return {
    toggle: toggleIcon<'off' | 'on'>(`${name}Toggle`, {
      states: ['off', 'on'],
      statics,
      geo: ({ h, p, e }, size) => shapes(h, p, e, size),
      change: fillThenClear,
    }),
    outline: hoverIcon(name, { geo: ({ h }, size) => shapes(h, 0, 0, size) }),
    filled: hoverIcon(`${name}Filled`, {
      geo: ({ h }, size) => shapes(h, 1, 0, size),
    }),
  };
}

// ── Flash ────────────────────────────────────────────────────────────────────
//
// The bolt from flashOffArt (its Flash hover morph included). The fill
// grows from the bolt's centroid inside its centreline; the centreline's 2px
// outline (outer corners round, inner sharp) plus that fill is Carbon's
// filled bolt.

function flashShapes(h: number, p: number, e: number): Shapes {
  const bolt = flashBolt(h);
  const c = centroid(bolt);
  const r = reachOf(bolt, c);
  return {
    fill: { d: shapeFillPath(bolt, c, r * p, r * e), ...EVENODD },
    ...outline(FLASH_ART.base(h).strokes, FLASH_ART.slash),
  };
}
const flash = build('Flash', [CFlash, CFlashFilled], flashShapes);
export const FlashToggleSpec = flash.toggle;
export const FlashSpec = /* @__PURE__ */ withStatic(
  flash.outline,
  /* @__PURE__ */ carbonArt(Flash32)
);

// ── Light ────────────────────────────────────────────────────────────────────
//
// Hover (Light's reference animation): the ring's radius grows 5 → 6, the cardinal
// rays' inner ends move out 1px and their outer ends 2px, the diagonal rays
// move out 1px. The fill is a disc inside the ring's centreline.
//
// Carbon's 16px outline drawing sets each diagonal ray 0.1px anticlockwise
// of its diagonal (r 9–14); there's no 16px filled drawing, so at 16px the
// diagonals ease onto the 32px ones as the fill comes in.

const C: Pt = [16, 16];
/** A 2px ray along angle `deg` (0 = up, clockwise) from `a` to `b` out from the centre, `side` off its axis (+ clockwise). */
function ray(deg: number, a: number, b: number, side = 0): string {
  const t = (deg * Math.PI) / 180;
  const [u, n]: [Pt, Pt] = [
    [Math.sin(t), -Math.cos(t)],
    [Math.cos(t), Math.sin(t)],
  ];
  const P = (d: number, s: number) =>
    `${f(C[0] + u[0] * d + n[0] * (s + side))} ${f(C[1] + u[1] * d + n[1] * (s + side))}`;
  return `M${P(a, -1)}L${P(b, -1)}L${P(b, 1)}L${P(a, 1)}Z`;
}
// Carbon's diagonal rays: 4.958 long, centred 11.52 from the centre (32px);
// 5 long from r 9, 0.1 anticlockwise of the diagonal (16px).
const DIAG = { a: 9.041, b: 13.999 };
const DIAG_16 = { a: 9, b: 14, side: -0.1 };

function lightShapes(h: number, p: number, e: number, size?: number): Shapes {
  const r = 5 + h;
  // How far the 16px diagonals are eased onto the 32px ones (by the fill).
  const k = size === 16 ? 1 - p * (1 - e) : 0;
  const [da, db, side] = [
    lerp(DIAG.a, DIAG_16.a, k),
    lerp(DIAG.b, DIAG_16.b, k),
    DIAG_16.side * k,
  ];
  let rays = '';
  for (let i = 0; i < 8; i++) {
    rays +=
      i % 2
        ? ray(i * 45, da + h, db + h, side)
        : ray(i * 45, 9 + h, 14 + 2 * h);
  }
  return {
    fill: { d: circleD(C, r * p) + circleD(C, r * e), ...EVENODD },
    ring: { d: ringPath(C, r, 2) },
    rays: { d: rays },
  };
}
const light = build('Light', [CLight, CLightFilled], lightShapes);
export const LightToggleSpec = light.toggle;
export const LightSpec = /* @__PURE__ */ withStatic(
  light.outline,
  /* @__PURE__ */ carbonArt(Light16, Light32)
);

// ── Microphone ───────────────────────────────────────────────────────────────
//
// The microphone from micOffArt (its reference hover: the capsule's top rises 1px
// and its bottom 2px, the stand lifts 2px and its base widens). The fill
// grows from the capsule's centre inside its centreline.

/** The capsule's centreline (radius 4 about its two arc centres), as a convex polygon. */
function capsule(top: number, bottom: number): Pt[] {
  const pts: Pt[] = [];
  for (let a = 180; a <= 360; a += 6) {
    pts.push([
      16 + 4 * Math.cos((a * Math.PI) / 180),
      top + 4 * Math.sin((a * Math.PI) / 180),
    ]);
  }
  for (let a = 0; a <= 180; a += 6) {
    pts.push([
      16 + 4 * Math.cos((a * Math.PI) / 180),
      bottom + 4 * Math.sin((a * Math.PI) / 180),
    ]);
  }
  return pts;
}

function micShapes(h: number, p: number, e: number): Shapes {
  const [top, bottom] = micCapsule(h);
  return {
    fill: {
      d: discFillPath(capsule(top, bottom), [16, (top + bottom) / 2], p, e),
      ...EVENODD,
    },
    ...outline(MIC_ART.base(h).strokes, MIC_ART.slash),
  };
}
const mic = build('Microphone', [CMicrophone, CMicrophoneFilled], micShapes);
export const MicrophoneToggleSpec = mic.toggle;
export const MicrophoneSpec = /* @__PURE__ */ withStatic(
  mic.outline,
  /* @__PURE__ */ carbonArt(Microphone32)
);

// ── View ─────────────────────────────────────────────────────────────────────
//
// The eye from viewOffArt (View's hover: the eye opens 1px top and
// bottom, the iris grows 0.5px). The fill grows from the centre inside the
// eye's centreline. The iris ring shares its even-odd path, so as the fill
// passes, the ring becomes Carbon's knockout around a solid pupil; its outer
// edge eases out 0.5px with the fill to land on Carbon's filled knockout
// (r 4–6.5 rather than the outline's 4–6).

function viewShapes(h: number, p: number, e: number, size?: number): Shapes {
  // At 16px the outline is Carbon's 16px eye (its bottom 0.1 higher); there's
  // no 16px filled drawing, so it eases to the 32px eye as the fill comes in.
  const k = size === 16 ? 1 - p * (1 - e) : 0;
  const eye = viewEye(10 + h, { bottom: 10 + h - VIEW_LIFT_16 * k });
  const inside = eye.map((s) => (s.k === 'L' ? s.a : s.c)); // the eye is all straight segments
  const ri = 4 + 0.5 * h;
  const ro = 6 + 0.5 * h + 0.5 * (p - e);
  return {
    fill: {
      d: discFillPath(inside, C, p, e) + circleD(C, ro) + circleD(C, ri),
      ...EVENODD,
    },
    ...outline([{ path: eye, round: VIEW_EYE_OUTER }], VIEW_ART.slash),
  };
}
const view = build('View', [CView, CViewFilled], viewShapes);
export const ViewToggleSpec = view.toggle;
export const ViewSpec = /* @__PURE__ */ withStatic(
  view.outline,
  /* @__PURE__ */ carbonArt(View16, View32)
);
export const ViewFilledSpec = /* @__PURE__ */ withStatic(
  view.filled,
  /* @__PURE__ */ carbonArt(ViewFilled32)
);

// ── Send / Send alt ──────────────────────────────────────────────────────────
//
// The planes from opsMisc, with their hover: the plane moves 2px
// forward as one piece. The fill grows from the centroid of the plane's
// inside. Carbon's filled planes cut the nib as a slit right through the
// back wall, so the fill's region is the inside, the nib and that bit of
// wall: in one even-odd path with the outline, the nib and wall become the
// slit as the fill passes.

type Dart = typeof SEND_REST;
function planeShapes(
  plane: (h: number) => string,
  inside: Pt[],
  tri: Pt[],
  rest: Dart,
  hover: Dart
) {
  const centre = centroid(tri);
  const reach = reachOf(inside, centre);
  const [dx, dy] = [hover.N[0] - rest.N[0], hover.N[1] - rest.N[1]];
  return (h: number, p: number, e: number): Shapes => {
    const move = (pt: Pt): Pt => [pt[0] + dx * h, pt[1] + dy * h];
    return {
      plane: {
        d:
          plane(h) +
          shapeFillPath(inside.map(move), move(centre), reach * p, reach * e),
        ...EVENODD,
      },
    };
  };
}

// The inside of Send's outline, plus the nib (y 15–17 back to x 8.76) and the
// back wall behind it, out to where the nib's edges meet the outer edges.
const SEND_INSIDE: Pt[] = [
  [6.55, 25.11],
  [8.76, 17],
  [6.7207, 17],
  [7, 16],
  [6.7252, 15],
  [8.76, 15],
  [6.55, 6.89],
  [24.76, 16],
];
const SEND_TRI: Pt[] = [
  [6.55, 6.89],
  [24.76, 16],
  [6.55, 25.11],
];
const send = /* @__PURE__ */ build(
  'Send',
  [CSend, CSendFilled],
  /* @__PURE__ */ planeShapes(
    sendPlane,
    SEND_INSIDE,
    SEND_TRI,
    SEND_REST,
    SEND_HOVER
  )
);
export const SendToggleSpec = send.toggle;

const ALT_INSIDE: Pt[] = [
  [19, 24.2],
  [16.21, 17.2],
  [14.654, 18.756],
  [14.26, 17.77],
  [13.238, 17.361],
  [14.76, 15.83],
  [7.8, 13],
  [25.33, 6.67],
];
const ALT_TRI: Pt[] = [
  [7.8, 13],
  [25.33, 6.67],
  [19, 24.2],
];
const sendAlt = /* @__PURE__ */ build(
  'SendAlt',
  [CSendAlt, CSendAltFilled],
  /* @__PURE__ */ planeShapes(
    sendAltPlane,
    ALT_INSIDE,
    ALT_TRI,
    ALT_REST,
    ALT_HOVER
  )
);
export const SendAltToggleSpec = sendAlt.toggle;
