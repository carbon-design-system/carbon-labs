/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Notification16 from '@carbon/icons/es/notification/16.js';
import Notification32 from '@carbon/icons/es/notification/32.js';
import NotificationFilled32 from '@carbon/icons/es/notification--filled/32.js';
import NotificationOff16 from '@carbon/icons/es/notification--off/16.js';
import NotificationOff32 from '@carbon/icons/es/notification--off/32.js';
import NotificationOffFilled32 from '@carbon/icons/es/notification--off--filled/32.js';
import {
  carbonArt,
  instanceState,
  type Playback as AnimationPlaybackControls,
  toggleIcon,
  variantToggle,
  TOGGLE_IN,
  TOGGLE_OUT,
  type Shapes,
  type ToggleFrame,
  type TweenFn,
  type ToggleIconProps,
} from '../../engine';
import { polyPath, type Pt } from '../../geometry';
import {
  cutPoly,
  cutSegs,
  growPoly,
  mapPt,
  mapSegs,
  segsPath,
  type HalfPlane,
  type Similarity,
} from '../../cut';
import { cubicBezier } from '../../ease';
import { OFF_SHRINK, SLASH_REACH } from '../../off';
import { KICK_MS, kickAt } from '../../utils/slashToggle';
import {
  ANTENNA_SEGS,
  BELL_32,
  bellArt,
  bellPoly,
  knockerSegs,
  openBellSegs,
} from './bell';

const CNotification = /* @__PURE__ */ carbonArt(Notification16, Notification32);
const CNotificationFilled = /* @__PURE__ */ carbonArt(NotificationFilled32);
const CNotificationOff = /* @__PURE__ */ carbonArt(
  NotificationOff16,
  NotificationOff32
);
const CNotificationOffFilled = /* @__PURE__ */ carbonArt(
  NotificationOffFilled32
);

/**
 * Notification ⇄ Notification off (outline and filled), on the frame engine
 * (see utils/frameIcon). The motion is the legacy components'.
 *
 * On → off (its reference animation): the slash draws in
 * (160ms entrance), Carbon's gap opens behind its head and the bell's lower
 * left folds open for it; the bell kicks 2px left and back (the reference
 * kick, as utils/slashToggle). Off → on: the slash retracts (120ms exit)
 * and the bell rings instead of recoiling: it swings about the antenna tip
 * (0° → −15° → +10° → 0° over 190ms) while the knocker swings about the top
 * of the body (0° → −15° → +20° → −8° → 0° from 40ms to 300ms), on the reference
 * animation's keyframe easings.
 *
 * Hover: on, the bell's centrelines scale 107% about (16,16); off (the
 * set-wide Off rule), they shrink to 90% and the slash extends 1px at each
 * end. Constant 2px line weight, no masks or transforms: every part is
 * mapped into place as geometry and cut by the gap (the knocker also by the
 * rim). Filled, the bell is its centreline grown 1px, cut by Carbon's 3px
 * gap.
 *
 * Frame: `p` is the slash; `e` runs the kick (0 → 1 over KICK_MS) or the
 * ring (0 → −1 over the 300ms track, played RING_SLOW = 1.4× slower), and is 0 at rest.
 */

// The reference's pivots (36 → 32 units): the antenna tip and the top of the body.
export const BELL_PIVOT_Y = 6 * (32 / 36);
export const KNOCKER_PIVOT_Y = 8 * (32 / 36);
const HOVER_ON = 0.07;
const KICK = -2;

// The ring (off → on), in ms from the toggle, with each segment's reference easing.
export type Track = {
  kf: readonly { t: number; deg: number }[];
  ease: readonly ((t: number) => number)[];
};
export const BELL_RING: Track = {
  kf: [
    { t: 0, deg: 0 },
    { t: 60, deg: -15 },
    { t: 120, deg: 10 },
    { t: 190, deg: 0 },
  ],
  ease: [
    /* @__PURE__ */ cubicBezier(0.458, 0.064, 0.529, 0.946),
    /* @__PURE__ */ cubicBezier(0.458, 0.064, 0.529, 0.946),
    /* @__PURE__ */ cubicBezier(0.458, 0.066, 0.529, 0.944),
  ],
};
export const KNOCKER_RING: Track = {
  kf: [
    { t: 40, deg: 0 },
    { t: 90, deg: -15 },
    { t: 140, deg: 20 },
    { t: 190, deg: -8 },
    { t: 300, deg: 0 },
  ],
  ease: [
    /* @__PURE__ */ cubicBezier(0.221, 0, 0.422, 0.34),
    /* @__PURE__ */ cubicBezier(0.001, 0, 0.385, 0.355),
    /* @__PURE__ */ cubicBezier(0.45, 0.138, 0.69, 1),
    /* @__PURE__ */ cubicBezier(0.341, 0, 0.67, 1),
  ],
};
export const RING_MS = 300;
/** The ring plays this much slower than its reference track (calmer); used by every bell that rings. */
export const RING_SLOW = 1.4;
const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 } as const;

export function trackAt(ms: number, { kf, ease }: Track): number {
  if (ms <= kf[0].t || ms >= kf[kf.length - 1].t) {
    return 0;
  }
  const i = kf.findIndex((k, j) => ms >= k.t && ms < kf[j + 1].t);
  return (
    kf[i].deg +
    (kf[i + 1].deg - kf[i].deg) *
      ease[i]((ms - kf[i].t) / (kf[i + 1].t - kf[i].t))
  );
}

/**
 * The gap: the bell is cut between x + y = `edge` (Carbon's gap edge above
 * the slash: 2px outlined, 3px filled) and the slash's centre (x + y = 32,
 * so the cut ends sit under the slash), along the slash as far as it has
 * been drawn.
 */
function gapChannel(edge: number, p: number, h: number): HalfPlane[] {
  const ext = (SLASH_REACH / Math.SQRT2) * h;
  const head = 26.6 - 53.2 * p - 2 * ext * p; // x − y at the slash's head
  return [
    { n: [1, 1], c: edge },
    { n: [-1, -1], c: -32 },
    { n: [1, -1], c: head },
  ];
}

/** The slash: a 2px line from the top right, drawn p of the way, reaching 1px further at each end on hover. */
function slash(p: number, h: number) {
  if (p <= 0.001) {
    return { d: '', ...LINE };
  }
  const ext = (SLASH_REACH / Math.SQRT2) * h;
  const n = (v: number) => +v.toFixed(3);
  return {
    d: `M${n(29.3 + ext)} ${n(2.7 - ext)}L${n(29.3 - 26.6 * p - ext * p)} ${n(2.7 + 26.6 * p + ext * p)}`,
    ...LINE,
  };
}

/** How far the bell has opened for the slash (0 closed → 1 open): early in the draw, late in the retract. */
function openness(p: number, retracting: boolean) {
  const [a, b] = retracting ? [0.8667, 1] : [0.35, 0.55];
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

/** The side of the line a→b that `toward` is on. */
export function sideOf(a: Pt, b: Pt, toward: Pt): HalfPlane {
  let n: [number, number] = [a[1] - b[1], b[0] - a[0]];
  if (n[0] * (toward[0] - a[0]) + n[1] * (toward[1] - a[1]) < 0) {
    n = [-n[0], -n[1]];
  }
  return { n, c: n[0] * a[0] + n[1] * a[1] };
}

/** Each part's placement: the hover scale about (16,16), its swing about its pivot (moved by the scale), the kick. */
function placement({ h, p, e }: ToggleFrame) {
  const s = 1 + (HOVER_ON + (-OFF_SHRINK - HOVER_ON) * p) * h;
  const tx = e > 0 ? KICK * kickAt(e) : 0;
  const ms = e < 0 ? -e * RING_MS : -1;
  const move = (track: Track, pivotY: number): Similarity => ({
    s,
    origin: [16, 16],
    deg: ms < 0 ? 0 : trackAt(ms, track),
    pivot: [16, 16 + (pivotY - 16) * s],
    tx,
    ty: 0,
  });
  return {
    bell: move(BELL_RING, BELL_PIVOT_Y),
    knocker: move(KNOCKER_RING, KNOCKER_PIVOT_Y),
  };
}

export function notificationOffShapes(f: ToggleFrame, size?: number): Shapes {
  const art = bellArt(size);
  const m = placement(f);
  const gap = gapChannel(27.754, f.p, f.h);
  // The knocker shows only below the rim's centreline (its leg ends tuck into the rim).
  const rim = sideOf(
    mapPt([0, art.yb], m.bell),
    mapPt([32, art.yb], m.bell),
    mapPt([16, 13], m.bell)
  );
  const knocker = cutSegs(mapSegs(knockerSegs(art.yb - 3), m.knocker), [rim]);
  return {
    bell: {
      d: segsPath(
        cutSegs(mapSegs(openBellSegs(art, openness(f.p, f.e < 0)), m.bell), gap)
      ),
      ...LINE,
      strokeLinejoin: 'round',
    },
    antenna: {
      d: segsPath(cutSegs(mapSegs(ANTENNA_SEGS, m.bell), gap)),
      ...LINE,
    },
    knocker: {
      d: segsPath(cutSegs(knocker, gap)),
      ...LINE,
      strokeLinejoin: 'round',
    },
    slash: slash(f.p, f.h),
  };
}

// The solid bell: its centreline grown 1px. Carbon has no 16px filled bell,
// so the 32px drawing serves every size.
const BELL_SOLID = /* @__PURE__ */ growPoly(
  /* @__PURE__ */ bellPoly(BELL_32),
  1
);
const KNOCKER_32 = /* @__PURE__ */ knockerSegs(BELL_32.knockTop);

export function notificationOffFilledShapes(fr: ToggleFrame): Shapes {
  // Also exported under a deprecated alias whose name doesn't say "Toggle": take a hover-only frame too.
  const f = { h: fr.h, p: fr.p ?? 0, e: fr.e ?? 0 };
  const m = placement(f);
  const gap = gapChannel(26.35, f.p, f.h);
  return {
    // The solid bell covers the knocker's legs.
    knocker: {
      d: segsPath(cutSegs(mapSegs(KNOCKER_32, m.knocker), gap)),
      ...LINE,
      strokeLinejoin: 'round',
    },
    bell: {
      d: cutPoly(
        BELL_SOLID.map((q) => mapPt(q, m.bell)),
        gap
      )
        .map((piece) => polyPath(piece, true))
        .join(''),
    },
    antenna: {
      d: segsPath(cutSegs(mapSegs(ANTENNA_SEGS, m.bell), gap)),
      ...LINE,
    },
    slash: slash(f.p, f.h),
  };
}

// The kick or ring in flight, per frame, so a re-click stops it.
const kickOf = (f: ToggleFrame) =>
  instanceState(f, 'kick', (): { p: AnimationPlaybackControls | null } => ({
    p: null,
  }));

function notificationChange(
  toOff: boolean,
  fr: ToggleFrame,
  tween: TweenFn,
  repaint: () => void
) {
  kickOf(fr).p?.stop();
  fr.e = 0;
  const done = () => {
    fr.e = 0;
    repaint();
  };
  kickOf(fr).p = toOff
    ? tween('e', 1, { duration: KICK_MS, ease: [0, 0, 1, 1] as never }, done)
    : tween(
        'e',
        -1,
        { duration: (RING_SLOW * RING_MS) / 1000, ease: [0, 0, 1, 1] as never },
        done
      );
  return tween('p', toOff ? 1 : 0, toOff ? TOGGLE_IN : TOGGLE_OUT);
}

export const NotificationOffOutlineToggleSpec = /* @__PURE__ */ toggleIcon<
  'on' | 'off'
>('NotificationOffToggle', {
  states: ['on', 'off'],
  statics: [CNotification, CNotificationOff],
  geo: notificationOffShapes,
  change: notificationChange,
});

export const NotificationOffFilledToggleSpec = /* @__PURE__ */ toggleIcon<
  'on' | 'off'
>('NotificationOffToggle(filled)', {
  states: ['on', 'off'],
  statics: [CNotificationFilled, CNotificationOffFilled],
  geo: notificationOffFilledShapes,
  change: notificationChange,
});

/** Notification ⇄ Notification off; `filled` draws the filled bells. */
export const NotificationOffToggleSpec = /* @__PURE__ */ variantToggle(
  'NotificationOffToggle',
  (p: ToggleIconProps<'on' | 'off'>) =>
    p.filled
      ? NotificationOffFilledToggleSpec
      : NotificationOffOutlineToggleSpec
);
