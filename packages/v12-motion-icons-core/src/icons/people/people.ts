/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import User16 from '@carbon/icons/es/user/16.js';
import User32 from '@carbon/icons/es/user/32.js';
import UserFilled32 from '@carbon/icons/es/user--filled/32.js';
import UserAvatar16 from '@carbon/icons/es/user--avatar/16.js';
import UserAvatar32 from '@carbon/icons/es/user--avatar/32.js';
import UserAvatarFilledAlt32 from '@carbon/icons/es/user--avatar--filled--alt/32.js';
import UserAvatarFilled32 from '@carbon/icons/es/user--avatar--filled/32.js';
import UserMultiple32 from '@carbon/icons/es/user--multiple/32.js';
import Group32 from '@carbon/icons/es/group/32.js';
import Events32 from '@carbon/icons/es/events/32.js';
import Collaborate32 from '@carbon/icons/es/collaborate/32.js';
import UserFollow32 from '@carbon/icons/es/user--follow/32.js';
import UserAdmin32 from '@carbon/icons/es/user--admin/32.js';
import UserProfile32 from '@carbon/icons/es/user--profile/32.js';
import { HOVER, hoverIcon, type Shapes, carbonArt } from '../../engine';
import { motionTokens } from '../../tokens';
import {
  circlePts,
  clipConvex,
  mapPath,
  pathPoints,
  polyPath,
  rectPath,
  ringPath,
  scalePts,
  type Pt,
} from '../../geometry';
import { together } from '../../ease';
import { EVENODD, f, lerp } from '../../paint';
import { glyphScale } from '../status/alerts';
import { strokePoly } from '../toggle/checkToggles';

/**
 * People icons on the frame engine: User (outline and filled), User avatar
 * (outline, filled, filled alt), User multiple, Group, Events, User follow,
 * User admin, User profile and Collaborate. No reference sources: every motion
 * follows the house rules. Each person is Carbon's own drawing rebuilt as
 * 2px centrelines (a head ring, and shoulders as a filleted polyline with
 * butt ends), so every wall keeps its weight as the geometry moves. Nothing
 * is scaled or masked. Standard hover timing (160ms entrance in, 120ms exit
 * out) unless noted.
 *
 * The person (the family motion, every person but the avatar's): the shoulders grow 2px wider (their sides step 1px out, the
 * corners rigid, so the flat top lengthens), and the head grows 1px in
 * diameter with its bottom held, so the gap to the shoulders holds. Where
 * people stand together they also step apart as they grow, so the space
 * between them holds, all within the 36×36 hover box (−2…34).
 *
 *  - User / User filled: the person, in place.
 *  - User multiple: the front person steps 1px left, the one behind 1px
 *    right. The one behind keeps Carbon's cuts in place (x 20 and 23), so
 *    more of it shows as they part.
 *  - Group: the upper person steps 1px left, the lower 1px right, so the
 *    space between the upper's legs and the lower's shoulder holds.
 *  - Events: the front person steps 1px down, then both people behind step
 *    1px out, 30ms later (two stages, as Share's nodes), 180ms.
 *  - Collaborate: the people orbit 41.19° counter-clockwise, upright, to
 *    stand side by side 4px apart; the arcs turn 33° and move with them,
 *    holding their resting gap to each person (see below). 220ms.
 *  - User follow, User admin, User profile: the person does what user--
 *    multiple's front person does (it's the same drawing): it grows and steps
 *    1px left. The plus's arms reach 2px at each end; the check grows 34%
 *    about its visual centre, so its ends reach about 2px as the plus's do;
 *    the three lines reach 2px right, together (no stagger).
 *  - User avatar (all three): the ring (or disc) grows 2px in radius (the
 *    container rule; 14 → 16 fits the frame, as Add alt's ring) and the
 *    person inside scales by the status-glyph growth (12%) about the ring's
 *    centre at constant weight; the shoulders' legs run on into the ring at
 *    every frame. Filled: the disc grows 2px and the knocked-out person
 *    grows as the outline's person does (its head stays Carbon's 0.5px
 *    smaller knockout, top-aligned).
 *
 * Fills (the toggles, and the filled hover icons): one disc from the head's
 * centre fills every part of the person, and one hole from there empties it.
 *
 * User and User avatar have their own 16px drawings. User's matches the
 * 32px one (to within Carbon's cubic rounding), so one drawing serves; User
 * avatar's sits the person 2px higher, so at 16px its person is drawn there.
 */

const C: Pt = [16, 16];

const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const unit = (a: Pt, b: Pt): Pt => {
  const [dx, dy] = sub(b, a);
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
};
/** The normal to the right of travel on screen (y down). */
const nrm = ([ux, uy]: Pt): Pt => [-uy, ux];
const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];
const crossZ = (a: Pt, b: Pt) => a[0] * b[1] - a[1] * b[0];

/** A circle as two exact arcs (nothing at r ≤ 0). */
export const circleD = ([cx, cy]: Pt, r: number) =>
  r > 1e-4
    ? `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`
    : '';

// ── Centrelines ──────────────────────────────────────────────────────────────

/** A corner of a filleted polyline: its tangent points, the turn's sign, and the segment directions. */
function corners(pts: readonly Pt[], r: number) {
  return pts.slice(1, -1).map((p, j) => {
    const [ui, uo] = [unit(pts[j], p), unit(p, pts[j + 2])];
    const half = Math.acos(Math.max(-1, Math.min(1, -dot(ui, uo)))) / 2;
    const t = r / Math.tan(half);
    return {
      a: [p[0] - ui[0] * t, p[1] - ui[1] * t] as Pt,
      b: [p[0] + uo[0] * t, p[1] + uo[1] * t] as Pt,
      turn: Math.sign(crossZ(ui, uo)),
      ui,
      uo,
    };
  });
}

/**
 * A polyline's centreline (corners filleted at radius r) drawn as a 2px
 * band with butt ends: its two sides offset 1px each way, with exact arcs
 * (radius r ± 1) at the corners. One closed outline, nonzero.
 */
export function bandPath(pts: readonly Pt[], r: number): string {
  const n = pts.length;
  const cs = corners(pts, r);
  type Node = { p: Pt; arc?: { r: number; sweep: 0 | 1 } };
  const off = (p: Pt, u: Pt, s: number): Pt => [
    p[0] + nrm(u)[0] * s,
    p[1] + nrm(u)[1] * s,
  ];
  const side = (s: 1 | -1): Node[] => {
    const out: Node[] = [{ p: off(pts[0], unit(pts[0], pts[1]), s) }];
    for (const c of cs) {
      out.push({ p: off(c.a, c.ui, s) });
      out.push({
        p: off(c.b, c.uo, s),
        arc: { r: r - s * c.turn, sweep: c.turn > 0 ? 1 : 0 },
      });
    }
    out.push({ p: off(pts[n - 1], unit(pts[n - 2], pts[n - 1]), s) });
    return out;
  };
  const [A, B] = [side(1), side(-1)];
  const arc = (rr: number, sweep: number, to: Pt) =>
    `A${f(rr)} ${f(rr)} 0 0 ${sweep} ${P(to)}`;
  let d = `M${P(A[0].p)}`;
  for (let k = 1; k < A.length; k++) {
    d += A[k].arc ? arc(A[k].arc!.r, A[k].arc!.sweep, A[k].p) : `L${P(A[k].p)}`;
  }
  d += `L${P(B[B.length - 1].p)}`;
  for (let k = B.length - 1; k > 0; k--) {
    d += B[k].arc
      ? arc(B[k].arc!.r, 1 - B[k].arc!.sweep, B[k - 1].p)
      : `L${P(B[k - 1].p)}`;
  }
  return `${d}Z`;
}

/** The filleted centreline's points (arcs every 2°), for a region to clip a fill to. */
export function filletPts(pts: readonly Pt[], r: number): Pt[] {
  const cs = corners(pts, r);
  const out: Pt[] = [pts[0]];
  for (const c of cs) {
    // The fillet's centre: r from the tangent point, toward the turn.
    const n = nrm(c.ui);
    const ctr: Pt = [c.a[0] + n[0] * r * c.turn, c.a[1] + n[1] * r * c.turn];
    const [t0, t1] = [
      Math.atan2(c.a[1] - ctr[1], c.a[0] - ctr[0]),
      Math.atan2(c.b[1] - ctr[1], c.b[0] - ctr[0]),
    ];
    let dt = t1 - t0;
    while (dt > Math.PI) {
      dt -= 2 * Math.PI;
    }
    while (dt < -Math.PI) {
      dt += 2 * Math.PI;
    }
    const k = Math.max(2, Math.ceil(Math.abs(dt) / (Math.PI / 90)));
    for (let i = 0; i <= k; i++) {
      out.push([
        ctr[0] + r * Math.cos(t0 + (dt * i) / k),
        ctr[1] + r * Math.sin(t0 + (dt * i) / k),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/**
 * The centreline moved d outward (away from its fillets' centres), miter at
 * the corners. With the fillet radius grown by d too, the corners' centres
 * hold: the band grows d in place. End points move across their segment
 * only, so a leg keeps its end's height and a cut end its place.
 */
export function growPts(pts: readonly Pt[], d: number): Pt[] {
  const turn = corners(pts, 1)[0]?.turn ?? 1;
  const k = -turn * d;
  return pts.map((p, i) => {
    const ni = i > 0 ? nrm(unit(pts[i - 1], p)) : null;
    const no = i < pts.length - 1 ? nrm(unit(p, pts[i + 1])) : null;
    if (!ni || !no) {
      const m = (ni ?? no)!;
      return [p[0] + m[0] * k, p[1] + m[1] * k] as Pt;
    }
    const s = 1 + dot(ni, no);
    return [
      p[0] + ((ni[0] + no[0]) / s) * k,
      p[1] + ((ni[1] + no[1]) / s) * k,
    ] as Pt;
  });
}

// ── The person ───────────────────────────────────────────────────────────────

/**
 * A person as Carbon draws it, in centrelines: the head ring (centre and
 * centreline radius; with `cut`, only the part right of x = cut, as a person
 * half hidden behind another), and the shoulders' polyline with its fillet
 * radius.
 */
export type Person = {
  head: Pt;
  hr: number;
  cut?: number;
  body: Pt[];
  r: number;
};

/** How far each side of the shoulders steps out on hover. */
const WIDEN = 1;
/** How much the head's diameter grows on hover. */
const HEAD_GROW = 1;

/**
 * The family motion at progress g, then the whole person moved by (dx, dy):
 * the shoulders 1px wider each side (their corners move out rigidly, so the
 * flat top lengthens 2px), the head 1px larger in diameter with its bottom
 * held, so the gap to the shoulders holds. Points on the person's centre
 * line (a cut through its middle) stay on it.
 */
export function grown(pp: Person, g: number, [dx, dy]: Pt = [0, 0]): Person {
  const cx = pp.head[0];
  const side = (x: number) => (x < cx - 1e-6 ? -1 : x > cx + 1e-6 ? 1 : 0);
  const k = (HEAD_GROW / 2) * g;
  return {
    ...pp,
    head: [cx + dx, pp.head[1] - k + dy],
    hr: pp.hr + k,
    cut: pp.cut === undefined ? undefined : pp.cut + dx,
    body: pp.body.map(([x, y]): Pt => [x + side(x) * WIDEN * g + dx, y + dy]),
  };
}

/** The head ring right of x (2px), cut straight down there. */
function cutRing([cx, cy]: Pt, r: number, x: number): string {
  const dx = x - cx;
  const [ro, ri] = [r + 1, r - 1];
  const [yo, yi] = [Math.sqrt(ro * ro - dx * dx), Math.sqrt(ri * ri - dx * dx)];
  const large = dx < -1e-9 ? 1 : 0;
  return `M${f(x)} ${f(cy - yo)}A${f(ro)} ${f(ro)} 0 ${large} 1 ${f(x)} ${f(cy + yo)}L${f(x)} ${f(cy + yi)}A${f(ri)} ${f(ri)} 0 ${large} 0 ${f(x)} ${f(cy - yi)}Z`;
}

/** A person's two shapes, under `name` + Head / Body. */
export function personShapes(name: string, pp: Person): Shapes {
  return {
    [`${name}Head`]:
      pp.cut !== undefined
        ? { d: cutRing(pp.head, pp.hr, pp.cut) }
        : { d: ringPath(pp.head, pp.hr, 2), ...EVENODD },
    [`${name}Body`]: { d: bandPath(pp.body, pp.r) },
  };
}

/** A U-shaped body: legs at x0 and x1 from `bottom` up to `top` (centrelines). */
const u = (x0: number, x1: number, top: number, bottom: number): Pt[] => [
  [x0, bottom],
  [x0, top],
  [x1, top],
  [x1, bottom],
];

// ── The fill ─────────────────────────────────────────────────────────────────

/** Convex regions inside the disc of radius r about c: each whole, clipped to it, or nothing. */
function regionsInDisc(regions: readonly Pt[][], c: Pt, r: number): string {
  if (r <= 1e-4) {
    return '';
  }
  return regions
    .map((reg) => {
      if (reg.every(([x, y]) => Math.hypot(x - c[0], y - c[1]) <= r)) {
        return polyPath(reg, true);
      }
      const part = clipConvex(reg, circlePts(c, r, 360));
      return part.length > 2 ? polyPath(part, true) : '';
    })
    .join('');
}

/**
 * The house disc fill (§7.7) for a person, as one disc: it grows from the
 * head's centre and fills every part it reaches (the head, then the
 * shoulders), each to its walls' centreline so the fill tucks 1px under the
 * ink with no seam; to empty, one hole grows from the same point. One
 * even-odd path. (Set-wide for multi-part fills.)
 */
function personFill(
  pp: Person,
  regions: readonly Pt[][],
  p: number,
  e: number
): string {
  const c = pp.head;
  const reach =
    Math.max(
      pp.hr,
      ...regions.flat().map(([x, y]) => Math.hypot(x - c[0], y - c[1]))
    ) + 0.5;
  const part = (r: number) =>
    circleD(c, Math.min(pp.hr, r)) + regionsInDisc(regions, c, r);
  return part(reach * p) + part(reach * e);
}

// ── User, User filled ────────────────────────────────────────────────────────

/** user (16px drawing too): the head r 6 about (16, 9); the shoulders 7–25, top 19, corners r 6. */
export const USER: Person = {
  head: [16, 9],
  hr: 6,
  body: u(7, 25, 19, 30),
  r: 6,
};

/**
 * User at hover h, fill p (in) and e (out): the person (the family motion,
 * in place) and the one-disc fill from the head's centre. Filled, it's
 * user--filled. The toggle (UserToggle) and both hover icons share this.
 */
export function userShapes(h: number, p: number, e: number): Shapes {
  const pp = grown(USER, h);
  return {
    ...personShapes('user', pp),
    fill: { d: personFill(pp, [filletPts(pp.body, pp.r)], p, e), ...EVENODD },
  };
}

export const UserSpec = /* @__PURE__ */ hoverIcon('User', {
  geo: ({ h }) => userShapes(h, 0, 0),
  static: /* @__PURE__ */ carbonArt(User16, User32),
});
export const UserFilledSpec = /* @__PURE__ */ hoverIcon('UserFilled', {
  geo: ({ h }) => userShapes(h, 1, 0),
  static: /* @__PURE__ */ carbonArt(UserFilled32),
});

// ── User avatar ──────────────────────────────────────────────────────────────

/** user--avatar's person at 32px: the head r 4 about (16, 13); the shoulders 9–23, top 21, corners r 4. */
const AVATAR: Person = { head: [16, 13], hr: 4, body: u(9, 23, 21, 30), r: 4 };
/**
 * Its 16px drawing: the same person 2px higher, the shoulders' corners a
 * touch rounder. Carbon's 16px corners are uneven cubics (the left one
 * 5.4 tall, the right 4.4); r 4.3 on the centreline sits between them. In
 * Chrome's Parity measure (4×, at 2× device scale) Δ is 0.08% (r 4: 0.91%,
 * r 4.2: 0.33%, r 4.4: 0.08%, r 4.5: 0.25%).
 */
const AVATAR_16: Person = {
  head: [16, 11],
  hr: 4,
  body: u(9, 23, 19, 30),
  r: 4.3,
};
/** The ring's centreline radius (14 outer, 12 inner) and its hover growth. */
const RING = 13;
/**
 * Carbon's 16px ring is drawn as cubics a touch wider than r 13 (outer
 * 14.00–14.04, inner 12.04–12.06): at 16px the ring rests on r 13.04 (its
 * wall still 2) and grows the same 2px from there. Δ 0.57% → 0.33% in Chrome.
 */
const RING_16 = 13.04;
const RING_GROW = 2;

/**
 * The avatar's person at glyph scale k (about the ring's centre), its legs
 * run on to the ring's centreline (radius rc), and `lift16` of the way to
 * the 16px drawing.
 */
function avatarPerson(k: number, rc: number, lift16: number): Person {
  const lerpPt = (a: Pt, b: Pt): Pt => [
    lerp(a[0], b[0], lift16),
    lerp(a[1], b[1], lift16),
  ];
  const head = scalePts([lerpPt(AVATAR.head, AVATAR_16.head)], C, k)[0];
  const [, l, r] = scalePts(
    AVATAR.body.map((q, i) => lerpPt(q, AVATAR_16.body[i])),
    C,
    k
  );
  const legEnd = (x: number) => C[1] + Math.sqrt(rc * rc - (x - C[0]) ** 2);
  return {
    head,
    hr: AVATAR.hr * k,
    body: [[l[0], legEnd(l[0])], l, r, [r[0], legEnd(r[0])]],
    r: lerp(AVATAR.r, AVATAR_16.r, lift16) * k,
  };
}

/**
 * User avatar at hover h, fill p and e: the ring grows 2px, the person
 * scales by the glyph growth. The fill (toward user--avatar--filled--alt)
 * is one disc from the head's centre, filling the head and then the
 * shoulders (to the ring). At 16px the person rests in the 16px drawing's place
 * and moves to the 32px one (the only filled drawing) as the fill comes in.
 */
export function avatarShapes(
  h: number,
  p: number,
  e: number,
  size?: number
): Shapes {
  const lift16 = size === 16 ? 1 - p * (1 - e) : 0;
  const rc = lerp(RING, RING_16, lift16) + RING_GROW * h;
  const pp = avatarPerson(glyphScale(h), rc, lift16);
  const [l, , , r] = pp.body;
  const shoulders = clipConvex(
    filletPts(
      [[l[0], C[1] + rc + 2], pp.body[1], pp.body[2], [r[0], C[1] + rc + 2]],
      pp.r
    ),
    circlePts(C, rc, 360)
  );
  return {
    ring: { d: ringPath(C, rc, 2), ...EVENODD },
    ...personShapes('person', pp),
    fill: { d: personFill(pp, [shoulders], p, e), ...EVENODD },
  };
}

export const UserAvatarSpec = /* @__PURE__ */ hoverIcon('UserAvatar', {
  geo: ({ h }, size) => avatarShapes(h, 0, 0, size),
  static: /* @__PURE__ */ carbonArt(UserAvatar16, UserAvatar32),
});
export const UserAvatarFilledAltSpec = /* @__PURE__ */ hoverIcon(
  'UserAvatarFilledAlt',
  {
    geo: ({ h }) => avatarShapes(h, 1, 0),
    static: /* @__PURE__ */ carbonArt(UserAvatarFilledAlt32),
  }
);

/**
 * User avatar filled: a solid disc with the person cut out. On hover the
 * disc grows and the person follows User avatar's hover.
 */
export const UserAvatarFilledSpec = /* @__PURE__ */ hoverIcon(
  'UserAvatarFilled',
  {
    geo: ({ h }) => {
      const rc = RING + RING_GROW * h;
      const pp = avatarPerson(glyphScale(h), rc, 0);
      const out = growPts(
        [
          [pp.body[0][0], C[1] + rc + 2],
          pp.body[1],
          pp.body[2],
          [pp.body[3][0], C[1] + rc + 2],
        ],
        1
      );
      const shoulders = clipConvex(
        filletPts(out, pp.r + 1),
        circlePts(C, rc - 1, 720)
      );
      const ko = pp.hr + 0.5;
      return {
        disc: {
          d:
            circleD(C, rc + 1) +
            circleD([pp.head[0], pp.head[1] - 0.5], ko) +
            polyPath(shoulders, true),
          ...EVENODD,
        },
      };
    },
    static: /* @__PURE__ */ carbonArt(UserAvatarFilled32),
  }
);

// ── User multiple, Group, Events, Collaborate ────────────────────────────────

/** The person shared by user--multiple (front), user--follow, user--admin and user--profile. */
const LEFT_USER: Person = {
  head: [12, 9],
  hr: 6,
  body: u(3, 21, 19, 30),
  r: 6,
};
/** user--multiple's person behind: its head cut at x 20 (1px clear of the front head), its shoulders at x 23 (1px clear of the front shoulders). */
const BEHIND: Person = {
  head: [20, 9],
  hr: 6,
  cut: 20,
  body: [
    [23, 19],
    [29, 19],
    [29, 30],
  ],
  r: 6,
};
/** How far apart people step (each, away from the other) as they grow. */
const SPREAD = 1;

const shapesOf = (named: Record<string, Person>): Shapes =>
  Object.assign(
    {},
    ...Object.entries(named).map(([k, pp]) => personShapes(k, pp))
  );

export const UserMultipleSpec = /* @__PURE__ */ hoverIcon('UserMultiple', {
  geo: ({ h }) => {
    const front = grown(LEFT_USER, h, [-SPREAD * h, 0]);
    const back = grown(BEHIND, h, [SPREAD * h, 0]);
    // The person behind keeps Carbon's cuts where they are (its head at
    // x 20, its shoulders at x 23): as it steps right and grows, more of it
    // shows from behind the front person, never nearer it.
    back.cut = BEHIND.cut;
    back.body[0] = BEHIND.body[0];
    return shapesOf({ front, back });
  },
  static: /* @__PURE__ */ carbonArt(UserMultiple32),
});

const GROUP_A: Person = { head: [8, 7], hr: 4, body: u(2, 14, 15, 22), r: 4 };
const GROUP_B: Person = {
  head: [24, 15],
  hr: 4,
  body: u(18, 30, 23, 30),
  r: 4,
};
export const GroupSpec = /* @__PURE__ */ hoverIcon('Group', {
  geo: ({ h }) =>
    shapesOf({
      upper: grown(GROUP_A, h, [-SPREAD * h, 0]),
      lower: grown(GROUP_B, h, [SPREAD * h, 0]),
    }),
  static: /* @__PURE__ */ carbonArt(Group32),
});

const EVENTS_FRONT: Person = {
  head: [16, 16],
  hr: 4,
  body: u(10, 22, 24, 30),
  r: 4,
};
const EVENTS_LEFT: Person = {
  head: [8, 7],
  hr: 4,
  body: [
    [8, 15],
    [2, 15],
    [2, 23],
  ],
  r: 4,
};
const EVENTS_RIGHT: Person = {
  head: [24, 7],
  hr: 4,
  body: [
    [24, 15],
    [30, 15],
    [30, 23],
  ],
  r: 4,
};
/** The front person and both people behind, together (no stagger). */
const eventsTiming = /* @__PURE__ */ together();
export const EventsSpec = /* @__PURE__ */ hoverIcon('Events', {
  hover: eventsTiming.hover,
  geo: ({ h }) => {
    const [a, b] = [eventsTiming.at(h, 0), eventsTiming.at(h, 1)];
    return shapesOf({
      front: grown(EVENTS_FRONT, a, [0, SPREAD * a]),
      left: grown(EVENTS_LEFT, b, [-SPREAD * b, 0]),
      right: grown(EVENTS_RIGHT, b, [SPREAD * b, 0]),
    });
  },
  static: /* @__PURE__ */ carbonArt(Events32),
});

// Collaborate: the two people orbit counter-clockwise about the centre, each
// staying upright, until they stand side by side on the centre line. Their
// boxes' centres (8, 9) and (24, 23) sit opposite each other, so a turn of
// atan(7 / 8) = 41.19° levels them; the orbit's radius closes from 10.63 to
// 9 on the way, which leaves 4px between the two grown people, the space each
// kept to the arcs at rest. The arcs come with them: each turns 33° counter-
// clockwise about its own centre and ends centred across on the pair (box on
// x 16), the lower below and the upper above, mirror-placed, each 4px (its
// resting gap) from the nearer person. Each moves as one smooth curve on the
// hover's progress, never backing up (see COLLAB_PATH). Rigid moves only;
// every wall keeps its weight. 220ms (moderate-02, as Filter's longer hover):
// a bigger travel than a grow.
const COLLAB_A: Person = { head: [8, 6], hr: 3, body: u(3, 13, 12, 16), r: 2 };
const COLLAB_B: Person = {
  head: [24, 20],
  hr: 3,
  body: u(19, 29, 26, 30),
  r: 2,
};
const COLLAB_REF: [Pt, Pt] = [
  [8, 9],
  [24, 23],
];
export const COLLAB_TURN = Math.atan2(7, 8);
const COLLAB_R: [number, number] = [Math.hypot(8, 7), 9];
/** The two exchange arcs (2px, r 6 on the centreline). */
const COLLAB_ARCS = [
  /* @__PURE__ */ bandPath(
    [
      [5, 20],
      [5, 27],
      [14, 27],
    ],
    6
  ),
  /* @__PURE__ */ bandPath(
    [
      [16, 5],
      [25, 5],
      [25, 12],
    ],
    6
  ),
];
export const ARC_TURN = (33 * Math.PI) / 180;
const COLLAB_HOVER = {
  duration: motionTokens.duration.moderate02 / 1000,
  ease: HOVER.ease,
};

/** The two people at hover h. */
function collabPeople(h: number): [Person, Person] {
  const r = lerp(COLLAB_R[0], COLLAB_R[1], h);
  const move = (ref: Pt): Pt => {
    const a = Math.atan2(ref[1] - C[1], ref[0] - C[0]) - COLLAB_TURN * h;
    return [C[0] + r * Math.cos(a) - ref[0], C[1] + r * Math.sin(a) - ref[1]];
  };
  return [
    grown(COLLAB_A, h, move(COLLAB_REF[0])),
    grown(COLLAB_B, h, move(COLLAB_REF[1])),
  ];
}

const segDist = ([px, py]: Pt, [ax, ay]: Pt, [bx, by]: Pt) => {
  const [dx, dy] = [bx - ax, by - ay];
  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1))
  );
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
/** The space between two outlines (polygons that don't cross). */
function outlineGap(a: readonly Pt[], b: readonly Pt[]): number {
  let m = Infinity;
  for (const [p, q] of [
    [a, b],
    [b, a],
  ] as const) {
    for (const v of p) {
      for (let i = 0; i < q.length; i++) {
        m = Math.min(m, segDist(v, q[i], q[(i + 1) % q.length]));
      }
    }
  }
  return m;
}
/** A person as the arcs see it: its head ring's centre and outer radius, and its shoulders' outline. */
type Obstacle = { c: Pt; r: number; body: Pt[] };
const obstacle = (pp: Person): Obstacle => ({
  c: pp.head,
  r: pp.hr + 1,
  body: pathPoints(bandPath(pp.body, pp.r), 0.5),
});
/** The space between an arc's outline and a person (the nearer of its head ring and its shoulders). */
function personGap(arc: readonly Pt[], o: Obstacle): number {
  let head = Infinity;
  for (let i = 0; i < arc.length; i++) {
    head = Math.min(
      head,
      segDist(o.c, arc[i], arc[(i + 1) % arc.length]) - o.r
    );
  }
  return Math.min(head, outlineGap(arc, o.body));
}

/** An arc's box centre (sampled finely). */
function boxCentre(pts: readonly Pt[]): Pt {
  const [xs, ys] = [pts.map((q) => q[0]), pts.map((q) => q[1])];
  return [
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2,
  ];
}
/** p turned counter-clockwise on screen by a (radians) about c. */
const turnAbout = (c: Pt, [x, y]: Pt, a: number): Pt => [
  c[0] + (x - c[0]) * Math.cos(a) + (y - c[1]) * Math.sin(a),
  c[1] - (x - c[0]) * Math.sin(a) + (y - c[1]) * Math.cos(a),
];
export const ARC_CENTRES = /* @__PURE__ */ COLLAB_ARCS.map((d) =>
  boxCentre(pathPoints(d, 0.05))
);

/**
 * Each arc's end move (after its 33° turn about its own centre): across, so
 * its box is centred on x 16 (the midpoint between the two people), and up or down until its
 * gap to the nearer person is its resting 4px (Newton's method). Run once to
 * make COLLAB_ENDS (the test re-solves and compares); nothing calls it at
 * runtime.
 */
export function solveCollabEnds(): Pt[] {
  const people = collabPeople(1).map(obstacle);
  const rest = collabPeople(0).map(obstacle);
  return COLLAB_ARCS.map((d, i) => {
    const o = pathPoints(d, 0.5);
    const target = Math.min(...rest.map((ob) => personGap(o, ob)));
    const turned = o.map((q) => turnAbout(ARC_CENTRES[i], q, ARC_TURN));
    const tx =
      C[0] -
      boxCentre(
        pathPoints(d, 0.05).map((q) => turnAbout(ARC_CENTRES[i], q, ARC_TURN))
      )[0];
    const F = (ty: number) =>
      Math.min(
        ...people.map((ob) =>
          personGap(
            turned.map(([x, y]): Pt => [x + tx, y + ty]),
            ob
          )
        )
      ) - target;
    let ty = 0;
    for (let it = 0; it < 40; it++) {
      const f0 = F(ty);
      if (Math.abs(f0) < 1e-6) {
        break;
      }
      ty -= Math.max(-0.5, Math.min(0.5, f0 / ((F(ty + 1e-4) - f0) / 1e-4)));
    }
    return [tx, ty];
  });
}

/** solveCollabEnds(), rounded to 0.0001: [lower arc, upper arc]. */
export const COLLAB_ENDS: Pt[] = [
  [7, 4.66],
  [-5, -4.5497],
];

/**
 * How each arc gets there, smoothly: one motion on one progress, the hover's own (the entrance ease
 * the people move on too), turning and moving together. Its turn (33° about
 * its own centre) runs straight on that progress; its move follows one cubic
 * Bézier from rest to its end, given as the two control points in fractions
 * of the end move [across, up or down]. Both arcs first draw away from the
 * pair and slide across into the centre late, so the lower arc clears the
 * lower person's shoulders as they rise past it: a gently curved path,
 * monotonic on both axes (its control points are in order). Neither comes
 * nearer a person than 3.81px (rest 4), nor more than 0.41px further from
 * the nearer one; both end exactly on their resting 4px.
 */
export const COLLAB_PATH: Array<[c1: Pt, c2: Pt]> = [
  [
    [0, 1],
    [0, 1],
  ], // lower: x = dx·h³, y = dy·(1 − (1 − h)³)
  [
    [0, 1],
    [1, 1],
  ], // upper: x = dx·h²(3 − 2h), y = dy·(1 − (1 − h)³)
];

/** Arc i's outline transform at hover h: its turn about its own centre, then its move along its path. */
export function collabArc(i: number, h: number): (q: Pt) => Pt {
  const s = Math.max(0, Math.min(1, h));
  const [[a1, b1], [a2, b2]] = COLLAB_PATH[i];
  const [ex, ey] = COLLAB_ENDS[i];
  const bez = (c1: number, c2: number) =>
    3 * (1 - s) ** 2 * s * c1 + 3 * (1 - s) * s * s * c2 + s ** 3;
  const [a, tx, ty] = [ARC_TURN * s, ex * bez(a1, a2), ey * bez(b1, b2)];
  return (q) => {
    const [x, y] = turnAbout(ARC_CENTRES[i], q, a);
    return [x + tx, y + ty];
  };
}

export const CollaborateSpec = /* @__PURE__ */ hoverIcon('Collaborate', {
  hover: COLLAB_HOVER,
  geo: ({ h }) => {
    const [a, b] = collabPeople(h);
    return {
      ...shapesOf({ a, b }),
      arcs: {
        d: COLLAB_ARCS.map((d, i) => mapPath(d, collabArc(i, h))).join(''),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Collaborate32),
});

// ── User follow, User admin, User profile ────────────────────────────────────
//
// The person does what user--multiple's front person does (the same drawing
// in the same place): it grows and steps 1px left. The mark keeps its own
// motion.

const sidePerson = (h: number) =>
  personShapes('person', grown(LEFT_USER, h, [-SPREAD * h, 0]));

/** A plus about c, each arm l from the centre, 2px wide. */
const plus = ([cx, cy]: Pt, l: number) =>
  polyPath(
    [
      [cx + 1, cy - 1],
      [cx + 1, cy - l],
      [cx - 1, cy - l],
      [cx - 1, cy - 1],
      [cx - l, cy - 1],
      [cx - l, cy + 1],
      [cx - 1, cy + 1],
      [cx - 1, cy + l],
      [cx + 1, cy + l],
      [cx + 1, cy + 1],
      [cx + l, cy + 1],
      [cx + l, cy - 1],
    ],
    true
  );
const PLUS_C: Pt = [27, 15];
const PLUS_REACH = 2;
export const UserFollowSpec = /* @__PURE__ */ hoverIcon('UserFollow', {
  geo: ({ h }) => ({
    ...sidePerson(h),
    plus: { d: plus(PLUS_C, 5 + PLUS_REACH * h) },
  }),
  static: /* @__PURE__ */ carbonArt(UserFollow32),
});

// Carbon's check (25,16.18 … 30.59,10.59) as its 2px centreline; its visual
// centre is the middle of its outline's box.
const ADMIN_CHECK: Pt[] = [
  [21.705, 14.295],
  [25, 17.59],
  [31.295, 11.295],
];
const ADMIN_CENTRE: Pt = [26.5, 14.795];
/**
 * The check grows 34% about its visual centre at constant weight (as strong as User
 * follow's plus): its long arm's end reaches
 * 2.02px further, its short arm's 1.64px, the corner 1.08px. With the person
 * stepping 1px left, its space to the person closes about as the plus's does.
 */
const CHECK_GROW = 0.34;
export const UserAdminSpec = /* @__PURE__ */ hoverIcon('UserAdmin', {
  geo: ({ h }) => ({
    ...sidePerson(h),
    check: {
      d: polyPath(
        strokePoly(scalePts(ADMIN_CHECK, ADMIN_CENTRE, 1 + CHECK_GROW * h), 2),
        true
      ),
    },
  }),
  static: /* @__PURE__ */ carbonArt(UserAdmin32),
});

const PROFILE_LINES: Array<[y: number, x1: number]> = [
  [4, 32],
  [9, 32],
  [14, 29],
];
const LINE_REACH = 2;
const profileTiming = /* @__PURE__ */ together();
export const UserProfileSpec = /* @__PURE__ */ hoverIcon('UserProfile', {
  hover: profileTiming.hover,
  geo: ({ h }) => ({
    ...sidePerson(h),
    lines: {
      d: PROFILE_LINES.map(([y, x1], i) =>
        rectPath(22, y, x1 + LINE_REACH * profileTiming.at(h, i), y + 2)
      ).join(''),
    },
  }),
  static: /* @__PURE__ */ carbonArt(UserProfile32),
});
