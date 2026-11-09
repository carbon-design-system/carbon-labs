/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Pt } from './geometry';
import type { Shapes } from './engine/shapes';
import { TOGGLE_IN, TOGGLE_OUT } from './engine/timing';
import type { Playback } from './engine/animate';
import {
  cutBase,
  OFF_SHRINK,
  slashPath,
  SLASH_REACH,
  type OffStroke,
  type Slash,
} from './off';
import { mapSegs, cutPoly, type HalfPlane } from './cut';
import { ENTRANCE, EXIT } from './ease';
import { f } from './paint';

/**
 * (Moved from the React package's utils/slashToggle.ts, refactor stage 1:
 * the geometry and the change; the React factories stay there.)
 *
 * On ⇄ off slash toggles (Flash, Microphone, View, …) on the frame engine.
 *
 * Toggle: on → off, the slash draws in from its start (160ms entrance) and
 * Carbon's gap opens behind its head; the base kicks sideways and back as
 * the slash arrives (the reference kick: from a quarter of the way, out on
 * the exit ease and back on the entrance ease). Off → on, the slash retracts
 * (120ms exit) and the base recoils half as far the other way.
 *
 * Hover: on, the icon's own hover (`base(h, 1)`); off, the set-wide Off
 * rule — the base shrinks to 90% about `centre` and the slash extends 1px
 * at each end. Constant 2px line weight throughout; no masks.
 */
export interface SlashToggleSpec {
  /** Carbon's [on, off] drawings, for when motion is off (the binding's; the geometry doesn't read them). */
  statics?: unknown;
  slash: Slash;
  /** The base's on→off kick at its peak, e.g. [2, 0]. */
  kick: Pt;
  /** The base's visual centre, which the off shrink scales about. */
  centre: Pt;
  /** The base at on-hover progress `hOn`: centrelines (cut by the slash) and solid shapes. */
  base: (hOn: number) => { strokes: OffStroke[]; solids?: Pt[][] };
  /** Fill rule for the solids (evenodd lets a solid carry holes as further polygons). */
  solidRule?: 'nonzero' | 'evenodd';
}

/** A slash toggle's frame: hover h, toggle p, kick e. */
type ToggleFrame = { h: number; p: number; e: number };
/** Tweens one of the frame's numbers (the frame engine's tween, as the React package types it). */
type TweenFn = (
  key: 'h' | 'p' | 'e',
  to: number,
  opts: { duration: number; ease: [number, number, number, number] },
  onComplete?: () => void
) => Playback;

export const KICK_MS = 1.25 * TOGGLE_IN.duration;
/** The kick's shape over its timeline t (0–1): still, out, back. */
/* @__NO_SIDE_EFFECTS__ */
export const kickAt = (t: number) =>
  t < 0.2 ? 0 : t < 0.6 ? EXIT((t - 0.2) / 0.4) : 1 - ENTRANCE((t - 0.6) / 0.4);

const polyD = (pts: readonly Pt[]) =>
  pts.length > 2 ? `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z` : '';

/* @__NO_SIDE_EFFECTS__ */
export function slashShapes(
  spec: SlashToggleSpec,
  { h, p, e }: ToggleFrame
): Shapes {
  const k = 1 - OFF_SHRINK * h * p;
  const amount = kickAmount(e);
  const [tx, ty] = [spec.kick[0] * amount, spec.kick[1] * amount];
  const m = { s: k, origin: spec.centre, deg: 0, pivot: spec.centre, tx, ty };
  const art = spec.base(h * (1 - p));
  const strokes = art.strokes.map((st) =>
    Array.isArray(st)
      ? mapSegs([st], m)[0]
      : { ...st, path: mapSegs([st.path], m)[0] }
  );
  const reach = SLASH_REACH * h;
  const base = cutBase(strokes, spec.slash, p, reach);
  const s: Shapes = {
    fill: { d: base.fill },
    rings: { d: base.rings, fillRule: 'evenodd' },
    slash: { d: slashPath(spec.slash, reach, p) },
  };
  if (art.solids) {
    // Solid parts lose the gap strip beside the drawn slash, cut flush.
    const [u, n] = frame(spec.slash);
    const sd = spec.slash.gapSide;
    const c = n[0] * spec.slash.a[0] + n[1] * spec.slash.a[1];
    const len =
      Math.hypot(
        spec.slash.b[0] - spec.slash.a[0],
        spec.slash.b[1] - spec.slash.a[1]
      ) +
      2 * reach;
    const ua = u[0] * spec.slash.a[0] + u[1] * spec.slash.a[1] - reach;
    const gap: HalfPlane[] = [
      { n: [sd * n[0], sd * n[1]], c: sd * c + 1 },
      { n: [-sd * n[0], -sd * n[1]], c: -(sd * c + 1 + spec.slash.gap) },
      { n: [-u[0], -u[1]], c: -(ua + len * p) },
      { n: [u[0], u[1]], c: ua - 2 },
    ];
    const moved = art.solids.map((poly) =>
      poly.map(
        ([x, y]) =>
          [
            spec.centre[0] + (x - spec.centre[0]) * k + tx,
            spec.centre[1] + (y - spec.centre[1]) * k + ty,
          ] as Pt
      )
    );
    s.solid = {
      d: moved
        .flatMap((poly) => (p > 1e-4 ? cutPoly(poly, gap) : [poly]))
        .map(polyD)
        .join(''),
      fillRule: spec.solidRule ?? 'nonzero',
    };
  }
  return s;
}

function frame(sl: Slash): [Pt, Pt] {
  const [dx, dy] = [sl.b[0] - sl.a[0], sl.b[1] - sl.a[1]];
  const l = Math.hypot(dx, dy);
  return [
    [dx / l, dy / l],
    [-dy / l, dx / l],
  ];
}

/** The slash toggle's change: p draws or retracts the slash, e runs the kick (or the half recoil) once. */
// The kick tween per toggle instance (its frame), so a re-click stops the
// previous kick instead of leaving two fighting over e.
const kicks = new WeakMap<ToggleFrame, { stop: () => void }>();
export const slashChange = (
  toOff: boolean,
  fr: ToggleFrame,
  tween: TweenFn,
  repaint: () => void
) => {
  kicks.get(fr)?.stop();
  fr.e = 0;
  kicks.set(
    fr,
    tween(
      'e',
      toOff ? 1 : -1,
      {
        duration: toOff ? KICK_MS : TOGGLE_OUT.duration,
        ease: [0, 0, 1, 1] as never,
      },
      () => {
        fr.e = 0;
        repaint();
      }
    )
  );
  return tween('p', toOff ? 1 : 0, toOff ? TOGGLE_IN : TOGGLE_OUT);
};
/** The kick's displacement (0–1 of the peak) at e: out and back on → off, half the other way off → on. */
/* @__NO_SIDE_EFFECTS__ */
export const kickAmount = (e: number) =>
  e >= 0 ? kickAt(e) : -0.5 * kickAt(-e);
