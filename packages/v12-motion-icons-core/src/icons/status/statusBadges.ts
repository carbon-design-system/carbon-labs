/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The status checkmarks' bases: CheckmarkOutline,
 * CheckmarkFilled, InProgress and Incomplete as they settle into Carbon's
 * own status drawings while a mark shows.
 *
 * Carbon draws these four's status variants (checkmark--outline--warning,
 * checkmark--filled--error, in-progress--warning, incomplete--error, …)
 * with the base smaller and off-centre: the ring or disc r 12 at (14, 14),
 * not r 14 at (16, 16), its outer edge still touching the frame's top and
 * left at 2, so the mark has the corner. Every other status icon's base
 * holds; these settle there as the cut opens (`k`, 0 → 1), every wall
 * rebuilt at its own weight (nothing scaled), and grow back as it closes.
 * At `k` 0 each is its plain icon, exactly.
 *
 *  - CheckmarkOutline: the ring to r 11 (its centreline) at (14, 14); the
 *    check to Carbon's badge check (its arms 1 and 2 shorter, the vertex at
 *    12, 17), still a 2px line.
 *  - CheckmarkFilled: the disc to r 12 at (14, 14); its knocked-out check to
 *    Carbon's badge check (2.25 wide, the vertex at 12, 17).
 *  - InProgress: the ring to r 11 and the wedge (r 10.5, from 12 o'clock to
 *    half past four) to centre (14, 14).
 *  - Incomplete: the half disc to r 12 at (14, 14); its dashes onto the band
 *    r 10–12 at Carbon's badge angles (−67.5° to −45° and −22.5° to 0°, a
 *    22.5° pitch); the two lower dashes ride in with the band and go in
 *    the cut.
 *
 * A status arriving mid-hover: the hover is taken down as the cut opens
 * (cutFrame), so these settle from the hovered drawing.
 */
import type { BaseGeo } from '../../engine';
import { ERROR_GROW } from '../../status';
import { polyPath, ringPath, type Pt } from '../../geometry';
import { EVENODD, MITER, f, lerp } from '../../paint';
import { strokePoly } from '../toggle/checkToggles';
import { dot } from './alerts';
import {
  BEHIND,
  DASH_TURN,
  INCOMPLETE_DASHES,
  type Dash,
} from './carbonInternals';
import { outlineCheck } from './CheckmarkOutline';
import { FILLED_CHECK, pie } from './states';

const C: Pt = [16, 16];
/** Carbon's badge centre: the r 12 ring or disc touching the frame at 2 on the top and left. */
const BADGE_C: Pt = [14, 14];
const at = (a: Pt, b: Pt, k: number): Pt => [
  lerp(a[0], b[0], k),
  lerp(a[1], b[1], k),
];
const each = (a: readonly Pt[], b: readonly Pt[], k: number): Pt[] =>
  a.map((q, i) => at(q, b[i], k));
const settling = (k?: number) => Math.min(1, Math.max(0, k ?? 0));

/** checkmark--outline--warning's check (Carbon's badge check), as its 2px centreline. */
const OUTLINE_BADGE_CHECK: Pt[] = [
  [8.705, 13.705],
  [12, 17],
  [18.295, 10.705],
];

/** CheckmarkOutline's base: `plain` at k 0, Carbon's checkmark--outline--warning base at 1. */
/* @__NO_SIDE_EFFECTS__ */
export function checkmarkOutlineBadge(plain: BaseGeo): BaseGeo {
  return (fr, size) => {
    const k = settling(fr.k);
    if (k <= 0) {
      return plain(fr, size);
    }
    return {
      ring: { d: ringPath(at(C, BADGE_C, k), lerp(13 + fr.h, 11, k), 2) },
      check: {
        d: polyPath(each(outlineCheck(fr.h), OUTLINE_BADGE_CHECK, k)),
        ...MITER,
      },
    };
  };
}

/** checkmark--filled--warning's knocked-out check (the same in every size's drawing): its centreline, 2.25 wide. */
const FILLED_BADGE = {
  r: 12,
  check: [
    [8.7954, 13.7954],
    [12, 17],
    [18.2046, 10.7954],
  ] as Pt[],
  w: 2.25,
};
const FILLED_PIVOT: Pt = [16.004, 16.148];

/** CheckmarkFilled's base: `plain` at k 0, Carbon's checkmark--filled--error base at 1. */
/* @__NO_SIDE_EFFECTS__ */
export function checkmarkFilledBadge(plain: BaseGeo): BaseGeo {
  return (fr, size) => {
    const k = settling(fr.k);
    if (k <= 0) {
      return plain(fr, size);
    }
    const a = FILLED_CHECK[size ?? 32] ?? FILLED_CHECK[32];
    const grow = 1 + 0.2 * fr.h;
    const check = a.check.map(
      ([x, y]): Pt => [
        FILLED_PIVOT[0] + (x - FILLED_PIVOT[0]) * grow,
        FILLED_PIVOT[1] + (y - FILLED_PIVOT[1]) * grow,
      ]
    );
    const w = lerp(a.w, FILLED_BADGE.w, k);
    return {
      disc: {
        d:
          dot(at(C, BADGE_C, k), lerp(a.r + fr.h, FILLED_BADGE.r, k)) +
          polyPath(strokePoly(each(check, FILLED_BADGE.check, k), w), true),
        ...EVENODD,
      },
    };
  };
}

/** InProgress's base: `plain` at k 0, Carbon's in-progress--error base (before its cut) at 1. */
/* @__NO_SIDE_EFFECTS__ */
export function inProgressBadge(plain: BaseGeo): BaseGeo {
  return (fr, size) => {
    const k = settling(fr.k);
    if (k <= 0) {
      return plain(fr, size);
    }
    const c = at(C, BADGE_C, k);
    return {
      ring: { d: ringPath(c, lerp(13 + fr.h, 11, k), 2) },
      wedge: {
        d: pie(lerp(12.5 + fr.h, 10.5, k), -90, lerp(45 + 60 * fr.h, 45, k), c),
      },
    };
  };
}

// Incomplete's dashes: each corner's polar position about the centre, eased from the plain dash's (as
// carbonInternals draws it, hovered by `h`) to the badge's, and cut at the half disc's flat edge (±90°).
type Polar = { r: number; a: number };
const DEG = Math.PI / 180;
/** Each dash's badge angles (start, end): Carbon's two upper dashes, the lower two holding their angles (they go in the cut), the hidden one a pitch back. */
const BADGE_DASHES: [number, number][] = [
  [-112.5, -90],
  [-67.5, -45],
  [-22.5, 0],
  [49.7, 69.6],
  [10, 29.8],
];
const BADGE_BAND = { outer: 12, inner: 10 };

function polarDash(
  corners: Dash,
  g: number,
  rot: number
): [Polar, Polar, Polar, Polar] {
  const pol = corners.map(
    ([x, y]): Polar => ({
      r: Math.hypot(x - C[0], y - C[1]) + g,
      a: Math.atan2(y - C[1], x - C[0]) / DEG + rot,
    })
  );
  const a0 = pol[0].a;
  let [o0, o1, i1, i0] = pol.map((q) => ({
    r: q.r,
    a: a0 + ((((q.a - a0 + 180) % 360) + 360) % 360) - 180,
  }));
  if (o1.a < o0.a) {
    [o0, o1, i1, i0] = [o1, o0, i0, i1];
  }
  return [o0, o1, i1, i0];
}

/**
 * The badge's upper-right dash ends on the cut's top edge (y 14, Carbon's): easing there it would dip
 * across it for a few frames (its angle and the centre move together), so its end stops just short. On an
 * alias's mark hover the box grows by up to ERROR_GROW and the end draws back with it (as the batch-3 badges'
 * open ends keep their space).
 */
const STOP_Y = 14 - 0.05;

function badgeDash(
  corners: Dash,
  target: [number, number],
  h: number,
  k: number,
  c: Pt,
  stop?: number
): string {
  const [p0, p1, p2, p3] = polarDash(corners, 2 * h, DASH_TURN * h);
  const to: Polar[] = [
    { r: BADGE_BAND.outer, a: target[0] },
    { r: BADGE_BAND.outer, a: target[1] },
    { r: BADGE_BAND.inner, a: target[1] },
    { r: BADGE_BAND.inner, a: target[0] },
  ];
  let [o0, o1, i1, i0] = [p0, p1, p2, p3].map((q, i) => ({
    r: lerp(q.r, to[i].r, k),
    a: lerp(q.a, to[i].a, k),
  }));
  if (stop !== undefined) {
    // Neither end corner past `stop`.
    const most = (r: number) =>
      (Math.asin(Math.max(-1, Math.min(1, (stop - c[1]) / r))) * 180) / Math.PI;
    if (o1.a > most(o1.r) || i1.a > most(i1.r)) {
      const a = Math.min(most(o1.r), most(i1.r));
      [o1, i1] = [
        { r: o1.r, a },
        { r: i1.r, a },
      ];
    }
  }
  const [lo, hi] = [-90, 90];
  if (o1.a <= lo || o0.a >= hi || i1.a <= lo || i0.a >= hi) {
    return '';
  }
  const cut = (q: Polar, a: number): Polar => ({ r: q.r, a });
  if (o0.a < lo || i0.a < lo) {
    [o0, i0] = [cut(o0, lo), cut(i0, lo)];
  }
  if (o1.a > hi || i1.a > hi) {
    [o1, i1] = [cut(o1, hi), cut(i1, hi)];
  }
  const P = ({ r, a }: Polar) =>
    `${f(c[0] + r * Math.cos(a * DEG))} ${f(c[1] + r * Math.sin(a * DEG))}`;
  const R = (u: Polar, v: Polar) => f((u.r + v.r) / 2);
  return `M${P(o0)}A${R(o0, o1)} ${R(o0, o1)} 0 0 1 ${P(o1)}L${P(i1)}A${R(i1, i0)} ${R(i1, i0)} 0 0 0 ${P(i0)}Z`;
}

/** Incomplete's base: `plain` at k 0, Carbon's incomplete--error base (before its cut) at 1. */
/* @__NO_SIDE_EFFECTS__ */
export function incompleteBadge(plain: BaseGeo): BaseGeo {
  return (fr, size) => {
    const k = settling(fr.k);
    if (k <= 0) {
      return plain(fr, size);
    }
    const c = at(C, BADGE_C, k);
    const r = lerp(14 + 2 * fr.h, 12, k);
    const half = `M${f(c[0])} ${f(c[1] + r)}V${f(c[1] - r)}A${f(r)} ${f(r)} 0 0 0 ${f(c[0])} ${f(c[1] + r)}Z`;
    return {
      half: { d: half },
      dashes: {
        d: [BEHIND, ...INCOMPLETE_DASHES]
          .map((d, i) =>
            badgeDash(
              d,
              BADGE_DASHES[i],
              fr.h,
              k,
              c,
              i === 2 ? STOP_Y - ERROR_GROW * (fr.mh ?? 0) : undefined
            )
          )
          .join(''),
      },
    };
  };
}
