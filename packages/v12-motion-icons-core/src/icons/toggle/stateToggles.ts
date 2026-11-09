/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Asleep16 from '@carbon/icons/es/asleep/16.js';
import Asleep32 from '@carbon/icons/es/asleep/32.js';
import AsleepFilled32 from '@carbon/icons/es/asleep--filled/32.js';
import Favorite32 from '@carbon/icons/es/favorite/32.js';
import FavoriteFilled32 from '@carbon/icons/es/favorite--filled/32.js';
import Locked32 from '@carbon/icons/es/locked/32.js';
import LockedFilled32 from '@carbon/icons/es/locked--filled/32.js';
import Notification16 from '@carbon/icons/es/notification/16.js';
import Notification32 from '@carbon/icons/es/notification/32.js';
import NotificationFilled32 from '@carbon/icons/es/notification--filled/32.js';
import {
  animate,
  carbonArt,
  instanceState,
  type Playback as AnimationPlaybackControls,
  fillThenClear,
  toggleIcon,
  variantToggle,
  TOGGLE_OUT,
  type Shapes,
  type ToggleFrame,
  type TweenFn,
  type VariantProps,
  type ToggleIconProps,
} from '../../engine';
import {
  discFillPath,
  mapPath,
  pathPoints,
  scalePath,
  scalePts,
  shapeFillPath,
  type Pt,
} from '../../geometry';
import { cutSegs, mapPt, mapSegs, segsPath, type Similarity } from '../../cut';
import { lerp } from '../../paint';
import {
  ANTENNA_PATH,
  bellArt,
  bellPath,
  bellPoly,
  knockerPath,
  knockerSegs,
} from './bell';
import {
  BELL_PIVOT_Y,
  BELL_RING,
  KNOCKER_PIVOT_Y,
  KNOCKER_RING,
  RING_MS,
  RING_SLOW,
  sideOf,
  trackAt,
} from './notificationOff';

const CAsleep = /* @__PURE__ */ carbonArt(Asleep16, Asleep32);
const CAsleepFilled = /* @__PURE__ */ carbonArt(AsleepFilled32);
const CFavorite = /* @__PURE__ */ carbonArt(Favorite32);
const CFavoriteFilled = /* @__PURE__ */ carbonArt(FavoriteFilled32);
const CLocked = /* @__PURE__ */ carbonArt(Locked32);
const CLockedFilled = /* @__PURE__ */ carbonArt(LockedFilled32);
const CNotification = /* @__PURE__ */ carbonArt(Notification16, Notification32);
const CNotificationFilled = /* @__PURE__ */ carbonArt(NotificationFilled32);

/**
 * Outline ↔ filled toggles on the frame engine (see utils/frameIcon):
 * Favorite, Locked, Notification and Asleep.
 *
 * Toggle: the house disc fill (§7.7). A disc grows from the shape's area
 * centroid, clipped to the shape's centreline (160ms entrance), and a hole
 * grows from the same point to empty it (120ms exit). The fill is one
 * even-odd path; no clip paths or masks. `fillOf` is how filled the shape
 * is (p while filling in, 1 − e while the hole grows), for the 16px
 * drawings that differ between outline and filled.
 *
 * Hover: each icon's own (unchanged from the legacy components), as
 * geometry at constant 2px line weight. Rest states match Carbon.
 */

/** The area centroid of a closed polygon. */
function areaCentroid(pts: readonly Pt[]): Pt {
  let [a, cx, cy] = [0, 0, 0];
  pts.forEach(([x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length];
    const c = x0 * y1 - x1 * y0;
    a += c;
    cx += (x0 + x1) * c;
    cy += (y0 + y1) * c;
  });
  return [cx / (3 * a), cy / (3 * a)];
}

/** The fill (house disc) inside `shape`, from its centroid, as an even-odd path. */
function houseFill(shape: readonly Pt[], p: number, e: number): string {
  if (p <= 0) {
    return '';
  }
  const c = areaCentroid(shape);
  // The disc's full radius reaches the shape's farthest point.
  const reach =
    Math.max(...shape.map(([x, y]) => Math.hypot(x - c[0], y - c[1]))) + 0.5;
  return shapeFillPath(shape, c, p * reach, e * reach);
}

const fillOf = ({ p, e }: ToggleFrame) => p * (1 - e);
const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 } as const;

// ── Favorite ─────────────────────────────────────────────────────────────────
//
// Hover: the heart's centreline scales 107.5% about (16, 16.276).

const HEART_PIVOT: Pt = [16, 16.276];
const HEART_D = /* @__PURE__ */ mapPath(
  'M11.073 -9.338C12.308 -8.085 13 -6.395 13 -4.636C13 -2.877 12.308 -1.188 11.073 0.065L0 11.277L-11.073 0.065' +
    'C-12.308 -1.188 -13 -2.877 -13 -4.636C-13 -6.395 -12.308 -8.085 -11.073 -9.338C-10.47 -9.952 -9.751 -10.44 -8.958 -10.773' +
    'C-8.164 -11.106 -7.311 -11.278 -6.45 -11.277C-5.585 -11.278 -4.728 -11.104 -3.931 -10.767C-3.136 -10.43 -2.418 -9.937 -1.817 -9.317' +
    'L-0.001 -7.466L1.817 -9.317C2.418 -9.937 3.136 -10.43 3.931 -10.767C4.728 -11.104 5.585 -11.278 6.45 -11.277' +
    'C7.311 -11.278 8.164 -11.106 8.958 -10.773C9.751 -10.44 10.47 -9.952 11.073 -9.338Z',
  ([x, y]) => [x + HEART_PIVOT[0], y + HEART_PIVOT[1]]
);
const HEART_PTS = /* @__PURE__ */ pathPoints(HEART_D);

export function favoriteShapes(f: ToggleFrame): Shapes {
  const s = 1 + 0.075 * f.h;
  return {
    fill: {
      d: houseFill(scalePts(HEART_PTS, HEART_PIVOT, s), f.p, f.e),
      fillRule: 'evenodd',
    },
    heart: {
      d: scalePath(HEART_D, HEART_PIVOT, s),
      ...LINE,
      strokeLinejoin: 'miter',
    },
  };
}

export const FavoriteToggleSpec = /* @__PURE__ */ toggleIcon<'off' | 'on'>(
  'FavoriteToggle',
  {
    states: ['off', 'on'],
    statics: [CFavorite, CFavoriteFilled],
    geo: favoriteShapes,
    change: fillThenClear,
  }
);

// ── Locked ───────────────────────────────────────────────────────────────────
//
// Hover (the Locked reference): the body's centreline rect scales 107.5% about
// (16, 10) and lifts 2px; the shackle's arch drops 1px and its legs
// retract 2px. Corner radius and line weight hold.

/**
 * The shackle as Carbon draws it: 2px legs at x 10–12 and 20–22 under an
 * arch about (16, cy) (outer r=6, inner r=4), the left leg down to `left`,
 * the right one to `right` (= cy when it's open).
 */
export function shackleD(cy: number, left: number, right = left): string {
  const n = (v: number) => +v.toFixed(3);
  return `M10 ${n(left)}V${n(cy)}A6 6 0 0 1 22 ${n(cy)}V${n(right)}H20V${n(cy)}A4 4 0 0 0 12 ${n(cy)}V${n(left)}Z`;
}

/** The lock body's 2px centreline rect (rest: 7,15 18×14, r=1), scaled about (16,10) by s and moved down dy. */
export function lockBody(s: number, dy: number) {
  const [x, y, w, h] = [16 - 9 * s, 10 + 5 * s + dy, 18 * s, 14 * s];
  const n = (v: number) => +v.toFixed(3);
  return {
    x: n(x),
    y: n(y),
    width: n(w),
    height: n(h),
    pts: [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ] as Pt[],
  };
}

export function lockedShapes({ h, p, e }: ToggleFrame): Shapes {
  const { pts, ...rect } = lockBody(1 + 0.075 * h, -2 * h);
  const c: Pt = [rect.x + rect.width / 2, rect.y + rect.height / 2];
  return {
    fill: { d: discFillPath(pts, c, p, e), fillRule: 'evenodd' },
    body: { tag: 'rect', ...rect, rx: 1, ry: 1, ...LINE },
    shackle: { d: shackleD(8 + h, 15 - 2 * h) },
  };
}

export const LockedToggleSpec = /* @__PURE__ */ toggleIcon<'off' | 'on'>(
  'LockedToggle',
  {
    states: ['off', 'on'],
    statics: [CLocked, CLockedFilled],
    geo: lockedShapes,
    change: fillThenClear,
  }
);

// ── Notification ─────────────────────────────────────────────────────────────
//
// Hover: the bell, knocker and antenna centrelines scale 107% about
// (16, 16). Carbon's 16px outline bell is its own drawing (bell.ts); there's
// no 16px filled bell, so the art eases to the 32px one as the fill comes in.

export function notificationShapes(f: ToggleFrame, size?: number): Shapes {
  const s = 1 + 0.07 * f.h;
  const at = (d: string) => scalePath(d, [16, 16], s);
  const art = bellArt(size, fillOf(f));
  const body = scalePts(bellPoly(art), [16, 16], s);
  return {
    knocker: { d: at(knockerPath(art)), ...LINE, strokeLinejoin: 'round' },
    fill: { d: houseFill(body, f.p, f.e), fillRule: 'evenodd' },
    bell: { d: at(bellPath(art)), ...LINE, strokeLinejoin: 'round' },
    stem: { d: at(ANTENNA_PATH), ...LINE },
  };
}

const NotificationFillToggle = /* @__PURE__ */ toggleIcon<'off' | 'on'>(
  'NotificationToggle',
  {
    states: ['off', 'on'],
    statics: [CNotification, CNotificationFilled],
    geo: notificationShapes,
    change: fillThenClear,
  }
);

// ── Notification, ringing ────────────────────────────────────────────────────
//
// NotificationToggle (same statics, hover and fill) that rings as it fills:
// off → on plays the bell ring from NotificationOffToggle (notificationOff.ts)
// — the bell, its fill and the antenna swing about the antenna tip, the
// knocker about the top of the body — while the disc fill comes in. On → off
// is the plain un-fill. Rotation is rigid (points mapped, stroke untouched);
// while the bell swings the knocker is cut at the rim's centreline so its
// legs stay tucked in.
//
// The ring runs outside the frame's channels (`p` and `e` are the fill's), in
// a per-frame record: `ms` into the ring at weight `k`, plus a `base` swing
// fading out with `bk`. A re-click freezes the swing in flight into `base`
// and fades it to 0 over the exit duration (turning on also starts a new
// ring over it), so nothing jumps and every path ends exactly at rest.

type Ring = {
  ms: number;
  k: number;
  base: [number, number];
  bk: number;
  anims: AnimationPlaybackControls[];
};
/** The ring in flight, per mounted icon (keyed by its frame). */
const ringOf = (f: ToggleFrame) =>
  instanceState(f, 'ring', (): { r: Ring | null } => ({ r: null }));

/** The swing [bell, knocker] in degrees for a frame (0, 0 at rest). */
function ringDeg(f: ToggleFrame): [number, number] {
  const r = ringOf(f).r;
  if (!r) {
    return [0, 0];
  }
  return [
    trackAt(r.ms, BELL_RING) * r.k + r.base[0] * r.bk,
    trackAt(r.ms, KNOCKER_RING) * r.k + r.base[1] * r.bk,
  ];
}

export function notificationRingShapes(f: ToggleFrame, size?: number): Shapes {
  const [bellDeg, knockDeg] = ringDeg(f);
  return bellRungShapes(f, size, bellDeg, knockDeg);
}

/** The bell swung `bellDeg` about the antenna tip, its knocker `knockDeg` (the ring's drawing at one instant). */
export function bellRungShapes(
  f: ToggleFrame,
  size: number | undefined,
  bellDeg: number,
  knockDeg: number
): Shapes {
  if (bellDeg === 0 && knockDeg === 0) {
    return notificationShapes(f, size);
  }
  const s = 1 + 0.07 * f.h;
  const move = (deg: number, pivotY: number): Similarity => ({
    s,
    origin: [16, 16],
    deg,
    pivot: [16, 16 + (pivotY - 16) * s],
    tx: 0,
    ty: 0,
  });
  const mb = move(bellDeg, BELL_PIVOT_Y);
  const mk = move(knockDeg, KNOCKER_PIVOT_Y);
  const onBell = (d: string) => mapPath(d, (q) => mapPt(q, mb), s);
  const art = bellArt(size, fillOf(f));
  const body = bellPoly(art).map((q) => mapPt(q, mb));
  // The knocker shows only below the rim's centreline.
  const rim = sideOf(
    mapPt([0, art.yb], mb),
    mapPt([32, art.yb], mb),
    mapPt([16, 13], mb)
  );
  return {
    knocker: {
      d: segsPath(cutSegs(mapSegs(knockerSegs(art.knockTop), mk), [rim])),
      ...LINE,
      strokeLinejoin: 'round',
    },
    fill: { d: houseFill(body, f.p, f.e), fillRule: 'evenodd' },
    bell: { d: onBell(bellPath(art)), ...LINE, strokeLinejoin: 'round' },
    stem: { d: onBell(ANTENNA_PATH), ...LINE },
  };
}

function notificationRingChange(
  turningOn: boolean,
  fr: ToggleFrame,
  tween: TweenFn,
  repaint: () => void
) {
  const prev = ringOf(fr).r;
  prev?.anims.forEach((a) => a.stop());
  const r: Ring = { ms: 0, k: 0, base: ringDeg(fr), bk: 1, anims: [] };
  ringOf(fr).r = r;
  let pending = 0;
  const settle = () => {
    if (--pending > 0 || ringOf(fr).r !== r) {
      return;
    }
    ringOf(fr).r = null;
    repaint();
  };
  if (r.base[0] !== 0 || r.base[1] !== 0) {
    r.anims.push(
      animate(1, 0, {
        ...TOGGLE_OUT,
        onUpdate: (v) => {
          r.bk = v;
          repaint();
        },
        onComplete: () => {
          r.bk = 0;
          settle();
        },
      })
    );
  } else {
    r.bk = 0;
  }
  if (turningOn) {
    r.k = 1;
    r.anims.push(
      animate(0, RING_MS, {
        // Played RING_SLOW (1.4×) slower than the reference track, as the off toggle's ring.
        duration: (RING_SLOW * RING_MS) / 1000,
        ease: 'linear',
        onUpdate: (v) => {
          r.ms = v;
          repaint();
        },
        onComplete: () => {
          r.ms = RING_MS;
          settle();
        },
      })
    );
  }
  pending = r.anims.length;
  if (!pending) {
    ringOf(fr).r = null;
  }
  return fillThenClear(turningOn, fr, tween, repaint);
}

/** NotificationToggle that rings the bell as it fills (off → on). */
const NotificationRingFillToggle = /* @__PURE__ */ toggleIcon<'off' | 'on'>(
  'NotificationToggle(ring)',
  {
    states: ['off', 'on'],
    statics: [CNotification, CNotificationFilled],
    geo: notificationRingShapes,
    change: notificationRingChange,
  }
);

export type NotificationVariant = 'default' | 'ring';
export type NotificationToggleProps = ToggleIconProps<'off' | 'on'> &
  VariantProps<NotificationVariant>;
/**
 * Notification ⇄ Notification filled. `variant="ring"` rings the bell as it
 * fills: the same drawings, with a ring.
 */
export const NotificationToggleSpec = /* @__PURE__ */ variantToggle(
  'NotificationToggle',
  (p: NotificationToggleProps) =>
    p.variant === 'ring' ? NotificationRingFillToggle : NotificationFillToggle
);

// ── Asleep ───────────────────────────────────────────────────────────────────
//
// Hover (the Asleep reference): the moon's centreline rotates 10° and scales
// 108.333% about (17, 16).

export const MOON_PIVOT: Pt = [17, 16];
export const MOON_HOVER_DEG = 10;
export const MOON_HOVER_SCALE = 1.08333;

/**
 * The moon's 2px centreline, fitted to Carbon's outline: a large arc (the
 * outer curve) and a concave arc (the bite) meeting at two tips, closed
 * with round joins. Carbon's 16px outline drawing is its own, a little
 * rounder and heavier (≈2.2 units), so it gets its own fit; there's no 16px
 * filled drawing, so at 16px the moon eases from one fit to the other as the
 * fill comes in.
 */
type MoonArt = {
  big: Pt;
  rBig: number;
  bite: Pt;
  rBite: number;
  weight: number;
};
const MOON_32: MoonArt = {
  big: [17.0956, 15.91],
  rBig: 12.095,
  bite: [28.1817, 8.8495],
  rBite: 14.078,
  weight: 2,
};
const MOON_16: MoonArt = {
  big: [18.25, 15.9375],
  rBig: 13.05,
  bite: [30.345, 8.3],
  rBite: 15.2,
  weight: 2.2,
};

/** The moon's art at a size, `fill` 0 (outline) → 1 (filled). */
export function moonArt(size?: number, fill = 0): MoonArt {
  if (size !== 16) {
    return MOON_32;
  }
  const [a, b] = [MOON_16, MOON_32];
  return {
    big: [lerp(a.big[0], b.big[0], fill), lerp(a.big[1], b.big[1], fill)],
    rBig: lerp(a.rBig, b.rBig, fill),
    bite: [lerp(a.bite[0], b.bite[0], fill), lerp(a.bite[1], b.bite[1], fill)],
    rBite: lerp(a.rBite, b.rBite, fill),
    weight: lerp(a.weight, b.weight, fill),
  };
}

/** The two tips where the circles cross: [top, right]. */
function tips({
  big: [x1, y1],
  rBig: r1,
  bite: [x2, y2],
  rBite: r2,
}: MoonArt): [Pt, Pt] {
  const d = Math.hypot(x2 - x1, y2 - y1);
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(r1 * r1 - a * a);
  const [mx, my] = [x1 + (a * (x2 - x1)) / d, y1 + (a * (y2 - y1)) / d];
  const [ux, uy] = [(y2 - y1) / d, -(x2 - x1) / d];
  return [
    [mx + h * ux, my + h * uy],
    [mx - h * ux, my - h * uy],
  ];
}
const moonD = (m: MoonArt) => {
  const [top, right] = tips(m);
  return `M${top[0]} ${top[1]}A${m.rBig} ${m.rBig} 0 1 0 ${right[0]} ${right[1]}A${m.rBite} ${m.rBite} 0 0 1 ${top[0]} ${top[1]}Z`;
};

/** The moon's centreline rotated `deg` and scaled `k` about (17,16): the points (and arc radii) move, the stroke doesn't. */
export function moonPath(
  deg: number,
  k: number,
  size?: number,
  fill = 0
): string {
  const a = (deg * Math.PI) / 180;
  const [cos, sin] = [Math.cos(a) * k, Math.sin(a) * k];
  const [cx, cy] = MOON_PIVOT;
  return mapPath(
    moonD(moonArt(size, fill)),
    ([x, y]) => [
      cx + (x - cx) * cos - (y - cy) * sin,
      cy + (x - cx) * sin + (y - cy) * cos,
    ],
    k
  );
}

export function asleepShapes(f: ToggleFrame, size?: number): Shapes {
  const fill = fillOf(f);
  const d = moonPath(
    MOON_HOVER_DEG * f.h,
    1 + (MOON_HOVER_SCALE - 1) * f.h,
    size,
    fill
  );
  return {
    fill: { d: houseFill(pathPoints(d), f.p, f.e), fillRule: 'evenodd' },
    moon: {
      d,
      ...LINE,
      strokeWidth: moonArt(size, fill).weight,
      strokeLinejoin: 'round',
    },
  };
}

export const AsleepToggleSpec = /* @__PURE__ */ toggleIcon<'off' | 'on'>(
  'AsleepToggle',
  {
    states: ['off', 'on'],
    statics: [CAsleep, CAsleepFilled],
    geo: asleepShapes,
    change: fillThenClear,
  }
);
