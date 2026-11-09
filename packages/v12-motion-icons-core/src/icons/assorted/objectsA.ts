/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Email32 from '@carbon/icons/es/email/32.js';
import Catalog32 from '@carbon/icons/es/catalog/32.js';
import Security32 from '@carbon/icons/es/security/32.js';
import Bot32 from '@carbon/icons/es/bot/32.js';
import Rocket32 from '@carbon/icons/es/rocket/32.js';
import Terminal32 from '@carbon/icons/es/terminal/32.js';
import Printer32 from '@carbon/icons/es/printer/32.js';
import Cloud32 from '@carbon/icons/es/cloud/32.js';
import CloudOffline32 from '@carbon/icons/es/cloud--offline/32.js';
import {
  carbonArt,
  defineAction,
  hoverIcon,
  toggleIcon,
  type Shapes,
  type ToggleFrame,
} from '../../engine';
import { boxWith, cutTo, cutToBox, movePathBy, phase } from '../../actionGeo';
import {
  clipConvex,
  framePath,
  mapPath,
  polyPath,
  rectPath,
  roundedRectPath,
  scalePts,
  type Pt,
} from '../../geometry';
import { cutPoly, type HalfPlane, type Seg } from '../../cut';
import {
  OFF_SHRINK,
  outlineD,
  slashPath,
  SLASH_REACH,
  strokeOutline,
  type Slash,
} from '../../off';
import { kickAmount, slashChange } from '../../utils/slashToggle';
import { EVENODD, f } from '../../paint';
import { ENTRANCE, EXIT, STANDARD } from '../../ease';
import { motionTokens, toEasing } from '../../tokens';
import { GLYPH_GROW } from '../status/alerts';

const CCloud = /* @__PURE__ */ carbonArt(Cloud32);
const CCloudOffline = /* @__PURE__ */ carbonArt(CloudOffline32);

/**
 * Common objects, part A: Email, Cloud (and Cloud offline, with its
 * toggle), Catalog, Security, Bot, Rocket, Terminal and Printer, on the
 * frame engine. Carbon has one drawing of each for every size, so one
 * geometry serves 16 to 32px.
 *
 * Every shape is filled geometry rebuilt from Carbon's art: parts that
 * change shape are 2px walls about a centreline, each edge 1px off it, so
 * the weight is constant (the cloud and the shield drawn with true arcs, as
 * Carbon's; the rest as outlined centrelines, miter joins and butt ends);
 * rigid parts move or turn as geometry. No
 * masks, clip paths, transforms or stroke widths. Hover: 160ms entrance
 * ease in, 120ms exit out (the engine's standard).
 *
 *  - Email: the envelope grows 2px on every side and the whole fold moves
 *    down 4px.
 *  - Cloud: grows as Cloud upload's cloud does: its centrelines scale about
 *    the middle of its base (16, 27), rebuilt at a 2px wall, so its sides
 *    move 1px out and its top 1.4px up while its base holds.
 *  - Cloud offline (and the toggle): the standard slash and the Off rule.
 *  - Catalog: grows as Document does: the cover 2px out on every side
 *    (22×28 → 26×32, the frame's full height); the binding tabs ride with
 *    its spine (2px left); the outer entries move 1px out (up and down),
 *    their tabs with them, and every entry reaches 1px at each end.
 *  - Security: as Shield alert, the shield grows 2px wider (its centreline
 *    scales 24/22 about the icon's centre; the top corners hold r2), and
 *    the check grows with it by the status glyph rule (12% about its own
 *    centre, at constant weight).
 *  - Bot: the head tilts 10° and comes down 0.5px, the antennae reach 1px,
 *    and the eyes blink off once on the way in (see Bot).
 *  - Rocket: the Rocket reference, rotated onto Carbon's rocket: a quarter
 *    roll about its long axis, the four fins handed round, ending on
 *    Carbon's drawing (see Rocket).
 *  - Terminal: the window grows 2px on every side and a "/" types in after
 *    the caret.
 *  - Printer: the printed sheet feeds out 2px: its top edge holds inside
 *    the printer and it lengthens downward. The printer and the paper in
 *    its tray hold; the sheet stays in front of the printer's bottom edge.
 */

const unit = (a: Pt, b: Pt): Pt => {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
};
const L = (a: Pt, b: Pt): Seg => ({ k: 'L', a, b });
/** A polygon as path data, wound clockwise on screen (so pieces union under nonzero fill). */
function cw(pts: readonly Pt[]): string {
  if (pts.length < 3) {
    return '';
  }
  const area = pts.reduce(
    (s, p, i) =>
      s +
      p[0] * pts[(i + 1) % pts.length][1] -
      pts[(i + 1) % pts.length][0] * p[1],
    0
  );
  return polyPath(area >= 0 ? pts : [...pts].reverse(), true);
}
/** A rotation by `deg` (clockwise on screen) about `c`. */
const turn = (deg: number, [cx, cy]: Pt) => {
  const [cos, sin] = [
    Math.cos((deg * Math.PI) / 180),
    Math.sin((deg * Math.PI) / 180),
  ];
  return ([x, y]: Pt): Pt => [
    cx + (x - cx) * cos - (y - cy) * sin,
    cy + (x - cx) * sin + (y - cy) * cos,
  ];
};

// ── Email ────────────────────────────────────────────────────────────────────
//
// The envelope is Carbon's frame (2–30 × 6–26, outer corners r2). The flap's
// fold is a 2px V whose centreline runs from the frame's top corners (3, 7)
// and (29, 7) down to its point (16, 16): mitred on top, rounded (r1) under
// the point, as Carbon draws it. Its arms run on into the frame's wall and
// are cut there, inside the wall's ink, at the frame's centreline.
//
// Hover: the envelope grows 2px on every side (the container rule; 28 → 32
// wide, the frame's full width) and the whole fold moves down 4px, rigid:
// its corners leave the envelope's top corners and its arms run on into the
// side walls, cut there the same way.

/** How far the envelope grows on each side. */
export const EMAIL_GROW = 2;

/** How far the fold moves down on hover. */
export const EMAIL_DROP = 4;

/**
 * The fold, its corners `c` out from (3, cornerY) and (29, cornerY) and its
 * point at (16, pointY), in an envelope grown `g`.
 */
function flap(g: number, c: number, cornerY: number, pointY: number): string {
  const [a, tip, b]: Pt[] = [
    [3 - c, cornerY],
    [16, pointY],
    [29 + c, cornerY],
  ];
  const [ua, ub] = [unit(tip, a), unit(tip, b)];
  // Carry each arm 3 units past its corner, into the wall, then cut it to the frame's centreline box.
  const path = [
    L([a[0] + 3 * ua[0], a[1] + 3 * ua[1]], tip),
    L(tip, [b[0] + 3 * ub[0], b[1] + 3 * ub[1]]),
  ];
  // Open (the point above the top edge), the arms run on down past the corners: cut at the top wall's centreline instead.
  const [top, bottom] = pointY < 7 - g ? [-2, 7 - g] : [7 - g, 25 + g];
  return cw(
    clipConvex(strokeOutline(path, 2, 2).open!, [
      [3 - g, top],
      [29 + g, top],
      [29 + g, bottom],
      [3 - g, bottom],
    ])
  );
}

/**
 * The action's open flap: its point flips from the envelope's middle (16) to
 * above its top edge. With its round outer join the point's ink reaches 1px
 * past it, so at −0.75 it stays 0.25px inside the box.
 */
const FLAP_OPEN = -0.75;
/** The flap opens in fast-02 and shuts in moderate-01 (seconds). */
const EMAIL_OPEN = motionTokens.duration.fast02 / 1000;
const EMAIL_SHUT = motionTokens.duration.moderate01 / 1000;
/**
 * Email at hover `h`, its flap `k` of the way open (the action): shut, the
 * fold is Carbon's moved down `EMAIL_DROP · h`; open, it's hinged in the grown
 * envelope's top corners with its point above the top edge.
 */
const emailShapes = (h: number, k = 0) => {
  const g = EMAIL_GROW * h;
  const d = EMAIL_DROP * h;
  return {
    envelope: { d: framePath(2 - g, 6 - g, 30 + g, 26 + g) },
    flap: {
      d: flap(
        g,
        g * k,
        7 + d + (-g - d) * k,
        16 + d + (FLAP_OPEN - 16 - d) * k
      ),
    },
  };
};
export const EmailSpec = /* @__PURE__ */ hoverIcon('Email', {
  geo: ({ h }) => emailShapes(h),
  static: /* @__PURE__ */ carbonArt(Email32),
  action: /* @__PURE__ */ defineAction({
    description:
      "Mail: the envelope's flap flips open, then snaps shut. With a hand-off to `notification`, the dot enters as the flap closes.",
    duration: EMAIL_OPEN + EMAIL_SHUT,
    geo: ({ h, a }) => {
      if (a <= 0 || a >= 1) {
        return emailShapes(h);
      }
      const split = EMAIL_OPEN / (EMAIL_OPEN + EMAIL_SHUT);
      const k =
        a < split ? ENTRANCE(phase(a, 0, split)) : 1 - EXIT(phase(a, split, 1));
      return emailShapes(h, k);
    },
  }),
});

// ── Cloud and Cloud offline ──────────────────────────────────────────────────
//
// Both clouds are a 2px wall about one centreline: three circles (the left
// lobe, the top, the right lobe) and the base, tangent to both lobes. The
// outside is those circles 1px out, meeting sharp where the top meets a
// lobe; the inside is the outside taken 2px in, as Carbon builds it: 1px in
// along each circle, and at each junction the two short flats Carbon draws
// (the tangents from 2px in from the outer notch, mitred). Carbon's two
// clouds are different drawings (cloud offline's is Cloud upload's, closed
// and set 3px lower), so the toggle moves each circle from one to the
// other: every radius loses 1px. (Cloud's left lobe centre is 7.49: Carbon's
// outer and inner arcs there sit 0.08 apart; 7.49 is closest in Chrome.)

export type Circle = { c: Pt; r: number };
/** A cloud's centreline: its three circles and its base line's y. */
export type CloudArt = {
  left: Circle;
  top: Circle;
  right: Circle;
  base: number;
};
export const CLOUD: CloudArt = {
  left: { c: [7.49, 20.5], r: 6.5 },
  top: { c: [16, 15], r: 9 },
  right: { c: [24.5, 20.5], r: 6.5 },
  base: 27,
};
const OFFLINE: CloudArt = {
  left: { c: [8.5, 18.5], r: 5.5 },
  top: { c: [16, 14], r: 8 },
  right: { c: [23.5, 18.5], r: 5.5 },
  base: 24,
};

/** The middle of Cloud's base, which its hover growth holds. */
const CLOUD_BASE: Pt = [16, 27];
/** The hover scale: the sides' centrelines sit 15 from the middle, so 1/15 moves them 1px. */
export const CLOUD_GROW = 1 / 15;

/** The centreline scaled by k about o (centres and radii; the wall stays 2px), then moved by t. */
function grow(
  a: CloudArt,
  k: number,
  [ox, oy]: Pt,
  [tx, ty]: Pt = [0, 0]
): CloudArt {
  const g = ({ c, r }: Circle): Circle => ({
    c: [ox + (c[0] - ox) * k + tx, oy + (c[1] - oy) * k + ty],
    r: r * k,
  });
  return {
    left: g(a.left),
    top: g(a.top),
    right: g(a.right),
    base: oy + (a.base - oy) * k + ty,
  };
}
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
function lerpCloud(a: CloudArt, b: CloudArt, t: number): CloudArt {
  const m = (p: Circle, q: Circle): Circle => ({
    c: [mix(p.c[0], q.c[0], t), mix(p.c[1], q.c[1], t)],
    r: mix(p.r, q.r, t),
  });
  return {
    left: m(a.left, b.left),
    top: m(a.top, b.top),
    right: m(a.right, b.right),
    base: mix(a.base, b.base, t),
  };
}

/** Where two circles cross, the upper of the two points. */
function upperCross(p: Circle, q: Circle): Pt {
  const [dx, dy] = [q.c[0] - p.c[0], q.c[1] - p.c[1]];
  const d = Math.hypot(dx, dy);
  const a = (p.r * p.r - q.r * q.r + d * d) / (2 * d);
  const hh = Math.sqrt(Math.max(0, p.r * p.r - a * a));
  const [mx, my] = [p.c[0] + (dx * a) / d, p.c[1] + (dy * a) / d];
  const [s, t]: Pt[] = [
    [mx + (dy * hh) / d, my - (dx * hh) / d],
    [mx - (dy * hh) / d, my + (dx * hh) / d],
  ];
  return s[1] < t[1] ? s : t;
}
const ang = ({ c }: Circle, p: Pt) => Math.atan2(p[1] - c[1], p[0] - c[0]);
/** Points along circle k, clockwise on screen from angle t0 to t1 (radians, t1 > t0), every ~2°; both ends included. */
function arcPts({ c, r }: Circle, t0: number, t1: number): Pt[] {
  let b = t1;
  while (b <= t0) {
    b += 2 * Math.PI;
  }
  const n = Math.max(2, Math.ceil((b - t0) / (Math.PI / 90)));
  return Array.from(
    { length: n + 1 },
    (_, i) =>
      [
        c[0] + r * Math.cos(t0 + ((b - t0) * i) / n),
        c[1] + r * Math.sin(t0 + ((b - t0) * i) / n),
      ] as Pt
  );
}
/** Where the line through a along u meets the line through b along v. */
function meet(a: Pt, u: Pt, b: Pt, v: Pt): Pt {
  const den = u[0] * v[1] - u[1] * v[0];
  const t = ((b[0] - a[0]) * v[1] - (b[1] - a[1]) * v[0]) / den;
  return [a[0] + u[0] * t, a[1] + u[1] * t];
}

/** A run along a loop: an arc of circle k, clockwise on screen from angle t0 to t1, or a corner point. */
export type Arc = { k: Circle; t0: number; t1: number };
export type Run = Arc | Pt;
const isArc = (r: Run): r is Arc => 'k' in r;
const onCircle = ({ c, r }: Circle, t: number): Pt => [
  c[0] + r * Math.cos(t),
  c[1] + r * Math.sin(t),
];
const sweepOf = (t0: number, t1: number) => {
  let b = t1;
  while (b <= t0) {
    b += 2 * Math.PI;
  }
  return b - t0;
};

/** The cloud's wall as two loops (outside, inside), both clockwise on screen from the bottom of the left lobe. */
export function cloudLoops(a: CloudArt): [Run[], Run[]] {
  const off = (k: Circle, d: number): Circle => ({ c: k.c, r: k.r + d });
  const [lo, to, ro] = [off(a.left, 1), off(a.top, 1), off(a.right, 1)];
  const [li, ti, ri] = [off(a.left, -1), off(a.top, -1), off(a.right, -1)];
  const [nl, nr] = [upperCross(lo, to), upperCross(to, ro)];
  const outside: Run[] = [
    { k: lo, t0: Math.PI / 2, t1: ang(lo, nl) },
    { k: to, t0: ang(to, nl), t1: ang(to, nr) },
    { k: ro, t0: ang(ro, nr), t1: Math.PI / 2 },
  ];
  // Each junction inside: 2px in from the notch along each circle's radius, joined by those points' tangents.
  const inward = (n: Pt, k: Circle): Pt => {
    const l = Math.hypot(n[0] - k.c[0], n[1] - k.c[1]);
    return [n[0] - (2 * (n[0] - k.c[0])) / l, n[1] - (2 * (n[1] - k.c[1])) / l];
  };
  const tangent = (p: Pt, k: Circle): Pt => [-(p[1] - k.c[1]), p[0] - k.c[0]];
  const joint = (n: Pt, k1: Circle, k2: Circle): [Pt, Pt, Pt] => {
    const [p1, p2] = [inward(n, k1), inward(n, k2)];
    return [p1, meet(p1, tangent(p1, k1), p2, tangent(p2, k2)), p2];
  };
  const [bl, ml, al] = joint(nl, a.left, a.top);
  const [ar, mr, br] = joint(nr, a.top, a.right);
  const inside: Run[] = [
    { k: li, t0: Math.PI / 2, t1: ang(li, bl) },
    ml,
    { k: ti, t0: ang(ti, al), t1: ang(ti, ar) },
    mr,
    { k: ri, t0: ang(ri, br), t1: Math.PI / 2 },
  ];
  return [outside, inside];
}
/** A loop as points (arcs every ~2°), for cutting. */
const loopPts = (runs: readonly Run[]): Pt[] =>
  runs.flatMap((r) => (isArc(r) ? arcPts(r.k, r.t0, r.t1) : [r]));
/** A loop as path data with true arcs (as Carbon draws it, so it rasterises as Carbon's does). */
function loopD(runs: readonly Run[]): string {
  let d = '';
  for (const r of runs) {
    if (!isArc(r)) {
      d += `${d ? 'L' : 'M'}${f(r[0])} ${f(r[1])}`;
      continue;
    }
    const { k, t0, t1 } = r;
    const [a, b] = [onCircle(k, t0), onCircle(k, t0 + sweepOf(t0, t1))];
    d += `${d ? 'L' : 'M'}${f(a[0])} ${f(a[1])}A${f(k.r)} ${f(k.r)} 0 ${sweepOf(t0, t1) > Math.PI ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`;
  }
  return `${d}Z`;
}

// Cloud offline: Carbon's standard slash, its 2px gap above it; below it the
// cloud runs flush into the slash. The house slash toggle (utils/slashToggle):
// on → off the slash draws in from its top-right end (160ms entrance) with
// the gap opening behind its head, the cloud kicks 2px left and back, and
// settles from Cloud's drawing into cloud offline's; off → on the slash
// retracts (120ms exit), the cloud recoils half as far and grows back. The
// off hover is the Off rule: the cloud shrinks to 90% about its visual
// centre at constant weight and the slash reaches 1px further at each end.
//
// The wall is cut as a filled ring: each loop loses the gap strip (as far as
// the slash has drawn), and the loops' pieces are filled even-odd (cutting
// distributes over the even-odd difference). Under the slash the wall is
// left whole; the slash covers it.
const SLASH: Slash = {
  a: [29.2929, 2.7071],
  b: [2.7071, 29.2929],
  gapSide: 1,
  gap: 2,
};
const KICK: Pt = [-2, 0];
/** Cloud offline's visual centre (its silhouette's area centroid, rounded), which the off shrink scales about. */
export const OFFLINE_CENTRE: Pt = [16, 16.4];

/** The gap beside the slash drawn `t` of its way (with `reach` past each end), as half-planes (see slashShapes' solids). */
function gapRegion(sl: Slash, reach: number, t: number): HalfPlane[] {
  const len = Math.hypot(sl.b[0] - sl.a[0], sl.b[1] - sl.a[1]);
  const u: Pt = [(sl.b[0] - sl.a[0]) / len, (sl.b[1] - sl.a[1]) / len];
  const n: Pt = [-u[1], u[0]];
  const sd = sl.gapSide;
  const c = n[0] * sl.a[0] + n[1] * sl.a[1];
  const ua = u[0] * sl.a[0] + u[1] * sl.a[1] - reach;
  return [
    { n: [sd * n[0], sd * n[1]], c: sd * c + 1 },
    { n: [-sd * n[0], -sd * n[1]], c: -(sd * c + 1 + sl.gap) },
    { n: [-u[0], -u[1]], c: -(ua + (len + 2 * reach) * t) },
    { n: [u[0], u[1]], c: ua - 2 },
  ];
}

function cloudShapes({ h, p, e }: ToggleFrame): Shapes {
  const kick = kickAmount(e);
  const art = grow(
    lerpCloud(
      grow(CLOUD, 1 + CLOUD_GROW * h * (1 - p), CLOUD_BASE),
      OFFLINE,
      p
    ),
    1 - OFF_SHRINK * h * p,
    OFFLINE_CENTRE,
    [KICK[0] * kick, KICK[1] * kick]
  );
  const reach = SLASH_REACH * h;
  const loops = cloudLoops(art);
  // Uncut, the wall is drawn with true arcs; cut, as the loops' points less the gap.
  const d =
    p > 1e-4
      ? loops
          .flatMap((loop) => cutPoly(loopPts(loop), gapRegion(SLASH, reach, p)))
          .map((q) => polyPath(q, true))
          .join('')
      : loops.map(loopD).join('');
  return {
    cloud: { d, ...EVENODD },
    slash: { d: slashPath(SLASH, reach, p) },
  };
}

export const CloudSpec = /* @__PURE__ */ hoverIcon('Cloud', {
  geo: ({ h }) => cloudShapes({ h, p: 0, e: 0 }),
  static: /* @__PURE__ */ carbonArt(Cloud32),
});
export const CloudOfflineSpec = /* @__PURE__ */ hoverIcon('CloudOffline', {
  geo: ({ h }) => cloudShapes({ h, p: 1, e: 0 }),
  static: /* @__PURE__ */ carbonArt(CloudOffline32),
});
/** Cloud ⇄ Cloud offline; `toggled` shows Cloud offline. */
export const CloudOfflineToggleSpec = /* @__PURE__ */ toggleIcon<'on' | 'off'>(
  'CloudOfflineToggle',
  {
    states: ['on', 'off'],
    statics: [CCloud, CCloudOffline],
    geo: cloudShapes,
    change: slashChange,
  }
);

// ── Catalog ──────────────────────────────────────────────────────────────────
//
// Carbon's cover is a frame (6–28 × 2–30, outer corners r2); three binding
// tabs (x 4–10) cross its spine, each level with an entry (x 14–22) at
// y 8, 15 and 22 (2px bars).

/** How far the cover grows on each side (the container rule, as Document). */
export const CATALOG_GROW = 2;
/** How far the outer entries (and their tabs) move out. */
export const ENTRY_SPREAD = 1;
const ROWS = [8, 15, 22];

export const CatalogSpec = /* @__PURE__ */ hoverIcon('Catalog', {
  geo: ({ h }) => {
    const g = CATALOG_GROW * h;
    // The top row rides 1px up, the bottom row 1px down, the middle holds (spread 1px less per space).
    const rows = ROWS.map((y, i) => y + (i - 1) * ENTRY_SPREAD * h);
    return {
      cover: {
        d:
          framePath(6 - g, 2 - g, 28 + g, 30 + g) +
          rows.map((y) => rectPath(4 - g, y, 10 - g, y + 2)).join(''),
      },
      entries: {
        d: rows.map((y) => rectPath(14 - h, y, 22 + h, y + 2)).join(''),
      },
    };
  },
  static: /* @__PURE__ */ carbonArt(Catalog32),
});

// ── Security ─────────────────────────────────────────────────────────────────
//
// The shield is a 2px wall about a centreline 22 wide (x 5–27) from y 3:
// top corners filleted r1 (outer r2, inner sharp), sides curving (r 9.98
// about (14.98, 17) and its mirror) into the two straight edges to a sharp
// point at (16, 28.85), whose miters are Carbon's 30 and 27.73. It's drawn
// directly as its two edges with true arcs (as Carbon's), each 1px off the
// centreline. The check is a 2px centreline, mitred at its elbow (14, 18).

/** The bottom curves' centreline radius, and their centres' distance from the middle (x 16 ∓ 1.0165, y 17). */
const SHIELD_R = 9.9835;
const SHIELD_CX = 1.0165;
/** The edges into the point run along this (rightward, down), at Carbon's 28.07°; their outward normal is N. */
const EDGE: Pt = [0.88226, 0.47042];
const N: Pt = [-0.47042, 0.88226];
/** The point's y on the centreline. */
const TIP = 28.854;
/** The hover scale: the shield 2px wider (centreline 22 → 24), as Shield alert. */
export const SHIELD_GROW = 24 / 22;

/** The shield scaled by s about the icon's centre: outside and inside, each a closed path. */
export function shieldD(s: number): string {
  const S = (v: number) => 16 + (v - 16) * s;
  const [l, r, t, y0, tip, R] = [
    S(5),
    S(27),
    S(3),
    S(17),
    S(TIP),
    SHIELD_R * s,
  ];
  const [cl, cr]: Pt[] = [
    [16 - SHIELD_CX * s, y0],
    [16 + SHIELD_CX * s, y0],
  ];
  const miter = 1 / EDGE[0]; // how far each edge's offset meets the middle line beyond the point
  const side = (d: 1 | -1) => {
    const rr = R + d;
    const a: Pt = [cr[0] - N[0] * rr, cr[1] + N[1] * rr]; // the right curve's end (mirrored normal)
    const b: Pt = [cl[0] + N[0] * rr, cl[1] + N[1] * rr];
    return { rr, a, b, tip: tip + d * miter };
  };
  const o = side(1);
  const i = side(-1);
  const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
  return (
    `M${P([l + 1, t - 1])}H${f(r - 1)}A2 2 0 0 1 ${P([r + 1, t + 1])}V${f(y0)}A${f(o.rr)} ${f(o.rr)} 0 0 1 ${P(o.a)}L16 ${f(o.tip)}L${P(o.b)}` +
    `A${f(o.rr)} ${f(o.rr)} 0 0 1 ${P([l - 1, y0])}V${f(t + 1)}A2 2 0 0 1 ${P([l + 1, t - 1])}Z` +
    `M${P([l + 1, t + 1])}V${f(y0)}A${f(i.rr)} ${f(i.rr)} 0 0 0 ${P(i.b)}L16 ${f(i.tip)}L${P(i.a)}A${f(i.rr)} ${f(i.rr)} 0 0 0 ${P([r - 1, y0])}V${f(t + 1)}Z`
  );
}

const CHECK: Pt[] = [
  [10.705, 14.705],
  [14, 18],
  [21.295, 10.705],
];
/** The check's visual centre (the middle of its bounds). */
const CHECK_CENTRE: Pt = [16, 14.705];

export const SecuritySpec = /* @__PURE__ */ hoverIcon('Security', {
  geo: ({ h }) => {
    const [a, elbow, b] = scalePts(CHECK, CHECK_CENTRE, 1 + GLYPH_GROW * h);
    return {
      shield: { d: shieldD(1 + (SHIELD_GROW - 1) * h), ...EVENODD },
      check: { d: outlineD([L(a, elbow), L(elbow, b)]) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Security32),
});

// ── Bot ──────────────────────────────────────────────────────────────────────
//
// Carbon's bot: the head (a frame 8–24 × 6–18, outer corners r2) with ears
// (6–8 × 10–12, 24–26), antennae (x 12–14 and 18–20, y 2–6) and eyes (2px
// squares at y 10); the neck's two posts (x 11–13 and 19–21, y 18–20); the
// body's shoulders (y 20–22, outer corners r2) and arms down to y 30.
// Ears, antennae and neck posts run 1px into the wall they join, so the
// pieces overlap rather than abut.
//
// Hover: the head tilts 10° clockwise about the top of
// the neck (16, 18) and moves down with it (one motion); the neck's posts
// shorten to follow. Each antenna reaches 1px further (y 2 → 1). The eyes
// blink off once, for 70ms (40–110ms into the 160ms entrance), and only on
// the way in.
//
// The head's lowered corner sits 2px above the shoulders at rest; the 10°
// tilt takes 1.07px of that, so a full 1px drop would put
// it 0.07px into them. The drop is 0.5px, leaving it 0.43px clear (botGeo
// builds the other pairings for review: 1px down at 5° is 0.47px clear).

/** The head's tilt on hover (degrees, clockwise) about the top of the neck, and how far it moves down. */
export const BOT_TILT = 10;
export const BOT_DROP = 0.5;
export const BOT_PIVOT: Pt = [16, 18];
/** How far each antenna reaches. */
export const ANTENNA_REACH = 1;
/** When the eyes are off, in ms into the hover's entrance. */
export const BLINK_MS: readonly [number, number] = [40, 110];
const ENTER_MS = motionTokens.duration.moderate01;
/** The blink as hover progress (the entrance eases h, so its ms map through the ease). */
const BLINK_H = /* @__PURE__ */ BLINK_MS.map((ms) =>
  ENTRANCE(ms / ENTER_MS)
) as [number, number];

const HEAD =
  /* @__PURE__ */ framePath(8, 6, 24, 18) +
  /* @__PURE__ */ rectPath(6, 10, 9, 12) +
  /* @__PURE__ */ rectPath(23, 10, 26, 12); // with its ears
const antennae = (r: number) =>
  rectPath(12, 2 - r, 14, 7) + rectPath(18, 2 - r, 20, 7);
const EYES =
  /* @__PURE__ */ rectPath(12, 10, 14, 12) +
  /* @__PURE__ */ rectPath(18, 10, 20, 12);
const BODY = 'M4 30V22A2 2 0 0 1 6 20H26A2 2 0 0 1 28 22V30H26V22H6V30Z';

/** Bot's geometry for a tilt (degrees) and a drop (px), at hover h; Bot uses BOT_TILT and BOT_DROP. */
export function botGeo(tilt: number, drop: number) {
  return ({ h, entering = 1 }: { h: number; entering?: number }): Shapes => {
    const rot = turn(tilt * h, BOT_PIVOT);
    const move = (q: Pt): Pt => {
      const [x, y] = rot(q);
      return [x, y + drop * h];
    };
    const head = HEAD + antennae(ANTENNA_REACH * h);
    const blink = entering > 0 && h > BLINK_H[0] && h < BLINK_H[1];
    // The posts reach 1px into the head's bottom wall, and shorten as it comes down: inside its ink through the tilt.
    const top = 17 + drop * h;
    return {
      head: { d: h ? mapPath(head, move) : head },
      eyes: { d: blink ? '' : h ? mapPath(EYES, move) : EYES },
      neck: { d: rectPath(11, top, 13, 21) + rectPath(19, top, 21, 21) },
      body: { d: BODY },
    };
  };
}
export const BotSpec = /* @__PURE__ */ hoverIcon('Bot', {
  geo: botGeo(BOT_TILT, BOT_DROP),
  static: /* @__PURE__ */ carbonArt(Bot32),
});

// ── Rocket ───────────────────────────────────────────────────────────────────
//
// Hover: the Rocket reference (36×36, drawn upright), rotated 45° clockwise onto Carbon's rocket and rebuilt as
// geometry to match it frame for frame. The rocket rolls a quarter turn
// about its long axis, a four-fin hand-off: the left fin swings to the front
// and ends edge-on along the axis (Carbon's "trail" is that fin, seen
// edge-on); the edge-on fin swings out to the right; the right fin swings
// behind into the body; and a fourth fin comes round from behind it to the
// left. The body's walls run on down the silhouette while the fins are
// away. As it rolls, the whole rocket moves 2px along its heading, up and
// right (ROCKET_RISE).
//
// The comp's 15 roll frames are poses sampled linearly (linear keyframes,
// pixel-perfect), so frame f is h = f / 15 and the roll runs
// on the standard hover (160ms entrance ease in; back on the 120ms exit ease).
// Every fin moves straight from pose to pose with the comp's trims; every
// line is 2px (segments with butt ends, round joins, as in the comp; the
// walls' ends round, as the comp's are).
//
// The comp's track matte (its centre-mask: the fins behind are hidden in a
// strip down the middle) is geometry: the fins behind are cut flush along
// the strip's edges, the walls' inner edges, so they grow out of the
// silhouette (and go behind it) with a solid, square edge. Fixed from the
// comp, where it would break Carbon's static drawing or read as a glitch:
//  - rest and end are Carbon's drawing (walls ±4.95 from the axis, the
//    edge-on fin ending square at the trail's end; the comp's 69% / 70%
//    trims ran past its tip and folded back, rounding it);
//  - the strip widens from the comp's frame-0 width to its frame-1 width
//    over that frame, instead of jumping (it clipped the right fin's stub),
//    and narrows again over the last frame (the comp's wide strip clips the
//    end pose's left stub, so its end isn't its start);
//  - the comp's fins behind pop: the rear one on whole at frame 8, the
//    right one off whole at 9. Here they're revealed and hidden by the
//    strip's solid edge over those frames (BACK_HANDOFF).

const ROCKET_BODY =
  'M15.71 10.71L19.78 6.64A8.94 8.94 0 0 1 26.14 4H28V5.86A8.94 8.94 0 0 1 25.36 12.22L21.29 16.29L22.705 17.705' +
  'L26.78 13.64A10.92 10.92 0 0 0 30 5.86V4A2 2 0 0 0 28 2H26.14A10.92 10.92 0 0 0 18.36 5.22L14.295 9.295Z';

/** Axis coordinates: a along the axis (x + y = 32) toward the nose, b across it (+ toward the lower right). */
const toAxis = ([x, y]: Pt): Pt => [
  (x - y) / Math.SQRT2,
  (x + y - 32) / Math.SQRT2,
];
const fromAxis = ([a, b]: Pt): Pt => [
  (a + b) / Math.SQRT2 + 16,
  (b - a) / Math.SQRT2 + 16,
];
const mirrorAxis = ([a, b]: Pt): Pt => [a, -b];

/** The left fin's centreline, Carbon's: root on the wall, the arm's corner, the tip, the stub's end. */
const FIN_SIDE: Pt[] = (
  [
    [15, 10],
    [7.006, 10],
    [2.997, 15.011],
    [10, 16.01],
  ] as Pt[]
).map(toAxis);
const FIN_RIGHT = FIN_SIDE.map(mirrorAxis);
/** The walls' centrelines, across the axis, and where they end at rest (the fins' root). */
const WALL_B = -FIN_SIDE[0][1];
const ROOT_A = FIN_SIDE[0][0];
/**
 * Edge-on poses, on the axis: the comp's along-axis positions (its y, root
 * first) for the front fin and the back fin, scaled so the front one spans
 * Carbon's trail exactly (a 0 to −11.31, root to tip).
 */
const TRAIL_LEN = 8 * Math.SQRT2;
const REF_FRONT = [3.42, 10.036, 13.718, 8.195];
const REF_BACK = [3.42, 8.423, 11.208, 7.031];
const EDGE_K = TRAIL_LEN / (REF_FRONT[2] - REF_FRONT[0]);
const edgeOn = (ys: readonly number[]): Pt[] =>
  ys.map((y) => [-(y - ys[0]) * EDGE_K, 0]);
const FIN_FRONT = /* @__PURE__ */ edgeOn(REF_FRONT);
const FIN_BACK = /* @__PURE__ */ edgeOn(REF_BACK);
const lengths = (pts: readonly Pt[]) =>
  pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
/** How much of the front pose's path runs root to tip (the trail): its trim ends there, butt, at rest and at the end. */
const TO_TIP = /* @__PURE__ */ (() => {
  const l = lengths(FIN_FRONT);
  return (l[0] + l[1]) / (l[0] + l[1] + l[2]);
})();

/** The comp's roll frames; frame f is h = f / ROLL_FRAMES. */
export const ROLL_FRAMES = 15;
/** A piecewise-linear track of [frame, value] keys (the comp's keyframes are linear). */
function track(
  keys: readonly (readonly [number, number])[],
  f: number
): number {
  if (f <= keys[0][0]) {
    return keys[0][1];
  }
  for (let i = 1; i < keys.length; i++) {
    const [f0, v0] = keys[i - 1];
    const [f1, v1] = keys[i];
    if (f <= f1) {
      return v0 + ((v1 - v0) * (f - f0)) / (f1 - f0);
    }
  }
  return keys[keys.length - 1][1];
}
const lerpPts = (p: readonly Pt[], q: readonly Pt[], u: number): Pt[] =>
  p.map((a, i) => [a[0] + (q[i][0] - a[0]) * u, a[1] + (q[i][1] - a[1]) * u]);

/** A fin at frame f: its centreline (axis coordinates) and trim. */
type Fin = { pts: Pt[]; s: number; e: number };
/**
 * The four fins at frame f (the comp's layers). The comp's 69% and 70% trims
 * on the edge-on pose run past its tip and fold back up the line, rounding
 * its end; they are TO_TIP here, so the edge-on fin ends square, as
 * Carbon's trail does, and the end pose equals the rest pose.
 */
function fins(f: number): { left: Fin; centre: Fin; right: Fin; rear: Fin } {
  const u = f / ROLL_FRAMES;
  return {
    // Front: the left fin swings to the middle, edge-on; the edge-on fin swings out to the right.
    left: {
      pts: lerpPts(FIN_SIDE, FIN_FRONT, u),
      s: 0,
      e: track(
        [
          [0, 1],
          [6, 0.9],
          [15, TO_TIP],
        ],
        f
      ),
    },
    centre: {
      pts: lerpPts(FIN_FRONT, FIN_RIGHT, u),
      s: 0,
      e: track(
        [
          [3, TO_TIP],
          [15, 1],
        ],
        f
      ),
    },
    // Behind: the right fin swings to the middle; the rear fin comes round to the left.
    right: {
      pts: lerpPts(FIN_RIGHT, FIN_BACK, u),
      s: 0,
      e: track(
        [
          [0, 1],
          [6, 0.9],
          [15, 0.7],
        ],
        f
      ),
    },
    rear: {
      pts: lerpPts(FIN_BACK, FIN_SIDE, u),
      s: track(
        [
          [10, 0.14],
          [13, 0.016],
          [14, 0],
        ],
        f
      ),
      e: track(
        [
          [0, 0.8],
          [15, 1],
        ],
        f
      ),
    },
  };
}

/** The part of a polyline from fraction s to e of its length. */
function trimLine(pts: readonly Pt[], s: number, e: number): Pt[] {
  const l = lengths(pts);
  const total = l.reduce((x, y) => x + y, 0);
  const [d0, d1] = [s * total, e * total];
  const at = (d: number): Pt => {
    let acc = 0;
    for (let i = 0; i < l.length; i++) {
      if (d <= acc + l[i] || i === l.length - 1) {
        const t = l[i] ? Math.min(1, Math.max(0, (d - acc) / l[i])) : 0;
        return [
          pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
          pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t,
        ];
      }
      acc += l[i];
    }
    return pts[pts.length - 1];
  };
  const out: Pt[] = [at(d0)];
  let acc = 0;
  for (let i = 0; i < l.length; i++) {
    acc += l[i];
    if (acc > d0 + 1e-9 && acc < d1 - 1e-9) {
      out.push(pts[i + 1]);
    }
  }
  out.push(at(d1));
  return out;
}

/** The roll's travel along the heading (px): up and right. */
export const ROCKET_RISE = 2;
type Piece = Pt[];
/** A 2px segment p–q, butt ends. */
function bar(p: Pt, q: Pt): Piece {
  const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const [nx, ny] = l > 1e-9 ? [-(q[1] - p[1]) / l, (q[0] - p[0]) / l] : [0, 1];
  return [
    [p[0] + nx, p[1] + ny],
    [q[0] + nx, q[1] + ny],
    [q[0] - nx, q[1] - ny],
    [p[0] - nx, p[1] - ny],
  ];
}
/** A disc of radius r (1: a round join or cap). */
const disc = (c: Pt, r = 1): Piece =>
  Array.from(
    { length: 48 },
    (_, i) =>
      [
        c[0] + r * Math.cos((i * Math.PI) / 24),
        c[1] + r * Math.sin((i * Math.PI) / 24),
      ] as Pt
  );
/**
 * The round joins' radii: 1, but no more than the shorter segment either
 * side, so a trim end passing a corner grows or shrinks the join smoothly
 * instead of popping a round end on or off.
 */
function joinRadii(line: readonly Pt[]): number[] {
  const l = lengths(line);
  return line.slice(1, -1).map((_, i) => Math.min(1, l[i], l[i + 1]));
}
/** A fin, trimmed, as 2px pieces in the drawing's coordinates (moved by `rise` along the axis). */
function finPieces({ pts, s, e }: Fin, rise: number): Piece[] {
  if (e - s <= 1e-4) {
    return [];
  }
  const line = trimLine(pts, s, e).map(([a, b]) => fromAxis([a + rise, b]));
  const out: Piece[] = [];
  line.slice(1).forEach((q, i) => {
    if (Math.hypot(q[0] - line[i][0], q[1] - line[i][1]) > 1e-6) {
      out.push(bar(line[i], q));
    }
  });
  joinRadii(line).forEach((r, i) => {
    if (r > 1e-4) {
      out.push(disc(line[i + 1], r));
    }
  });
  return out;
}

/** The walls' ends: the comp's keys, as how far they run on down past the fins' root. */
const WALL_RUN: readonly (readonly [number, number])[] = [
  [0, 0],
  [4, 2.453],
  [7, 5.343],
  [8, 5.25],
  [10, 3.25],
  [13, 0.8],
  [15, 0],
];
/**
 * The strip the fins behind are hidden in, half its width: the comp's
 * frame-0 width (3), widening to the walls' inner edges over frame 0–1, and
 * (unlike the comp, whose strip stays wide and clips the end pose's stub)
 * narrowing back over frame 14–15, so the end pose is the rest pose.
 */
const stripHalf = (f: number) =>
  3 + (WALL_B - 1 - 3) * Math.max(0, Math.min(1, f, ROLL_FRAMES - f));
/**
 * The comp's hand-off between the fins behind: the rear fin comes in at
 * frame 8 and the right fin goes out at 9, each popping on or off whole.
 * Here, over those frames, the rear fin grows out of the silhouette and the
 * right fin slides in behind it: each one's strip runs between the
 * silhouette's inner edges and its own full span, so it's revealed (or
 * hidden) by a solid edge moving across it, with no pop.
 */
export const BACK_HANDOFF: readonly [number, number] = [8, 9];
/** Half the width of strip that hides all of a fin (its widest point across the axis, plus its half-width). */
const coverAll = ({ pts }: Fin) =>
  Math.max(...pts.map(([, b]) => Math.abs(b))) + 1;
/** A fin's pieces less the strip |b| ≤ w about the (moved) axis, cut flush. */
function behindStrip(pieces: readonly Piece[], w: number): Piece[] {
  const strip: HalfPlane[] = [
    { n: [Math.SQRT1_2, Math.SQRT1_2], c: 32 / Math.SQRT2 - w },
    { n: [-Math.SQRT1_2, -Math.SQRT1_2], c: -(32 / Math.SQRT2 + w) },
  ];
  return pieces.flatMap((q) => cutPoly(q, strip));
}

function rocketShapes(h: number): Shapes {
  const f = ROLL_FRAMES * h;
  const rise = ROCKET_RISE * h;
  const fs = fins(f);
  const wallEnd = ROOT_A - track(WALL_RUN, f);
  const walls = ([-1, 1] as const).flatMap((side) => {
    const [top, end] = [
      fromAxis([ROOT_A + 0.5 + rise, side * WALL_B]),
      fromAxis([wallEnd + rise, side * WALL_B]),
    ];
    return [bar(top, end), disc(end)];
  });
  // The fins behind, less the strip (|b| ≤ w about the moved axis: the axis moves along itself, so b is unchanged).
  const w = stripHalf(f);
  const [h0, h1] = BACK_HANDOFF;
  const t = Math.min(1, Math.max(0, (f - h0) / (h1 - h0)));
  const back = [
    ...(t < 1
      ? behindStrip(finPieces(fs.right, rise), w + (coverAll(fs.right) - w) * t)
      : []),
    ...(t > 0
      ? behindStrip(
          finPieces(fs.rear, rise),
          coverAll(fs.rear) + (w - coverAll(fs.rear)) * t
        )
      : []),
  ];
  return {
    rocket: {
      d: mapPath(ROCKET_BODY, ([x, y]) => [
        x + rise / Math.SQRT2,
        y - rise / Math.SQRT2,
      ]),
    },
    walls: { d: walls.map(cw).join('') },
    front: {
      d: [...finPieces(fs.left, rise), ...finPieces(fs.centre, rise)]
        .map(cw)
        .join(''),
    },
    back: { d: back.map(cw).join('') },
  };
}

/** For tests and review: the rocket at frame f of the comp, and the fins' poses. */
export const rocketAt = (f: number) => rocketShapes(f / ROLL_FRAMES);
export const rocketFins = fins;

/**
 * The action's flight, px on each axis: far enough that the whole rocket
 * (its lowest-left ink, the fins' tips near (3, 29)) clears the box's
 * top-right corner going out, and its nose (30, 2) clears the bottom-left
 * corner coming in.
 */
const LIFT_OFF = 32.5;
/** Slower than the standard hover, as it's playful: 150ms out, 240ms in. */
const LIFT_OUT_MS = 150;
const LIFT_IN_MS = 240;
const LIFT_MS = LIFT_OUT_MS + LIFT_IN_MS;
const LIFT_OUT = LIFT_OUT_MS / LIFT_MS;
/**
 * So the rotation reads, in each leg the position starts
 * ROLL_LEAD after the roll, so the rocket rolls in place before it moves (out), and the roll is under way before it shows (in).
 * The roll's timing is unchanged; the position keeps its eases over the rest of its leg.
 */
const ROLL_LEAD = 40;
export const RocketSpec = /* @__PURE__ */ hoverIcon('Rocket', {
  geo: ({ h }) => rocketShapes(h),
  static: /* @__PURE__ */ carbonArt(Rocket32),
  action: /* @__PURE__ */ defineAction({
    description:
      'Lift-off: the rocket rolls and shoots out through the top-right corner, and the next rocket flies in from the bottom left, rolling, to land in its place. Looped, the rockets keep launching.',
    duration: LIFT_MS / 1000,
    geo: ({ h, a }) => {
      if (a <= 0 || a >= 1) {
        return rocketShapes(h);
      }
      // Out up-right (+t, −t), then in from the lower left.
      const going = a < LIFT_OUT;
      // The position lags the roll by ROLL_LEAD in each leg.
      const lead = ROLL_LEAD / LIFT_MS;
      const t = going
        ? LIFT_OFF * EXIT(phase(a, lead, LIFT_OUT))
        : -LIFT_OFF * (1 - ENTRANCE(phase(a, LIFT_OUT + lead, 1)));
      // The hover's roll: the leaving rocket rolls on from wherever the hover had it; the arriving one rolls in full, its roll's
      // 2px rise along the heading taken back as it comes, so it lands on the rest drawing (the roll's end pose is the rest pose,
      // risen).
      const e = STANDARD(going ? phase(a, 0, LIFT_OUT) : phase(a, LIFT_OUT, 1));
      const roll = going ? h + (1 - h) * e : e;
      const back = going ? 0 : (ROCKET_RISE * roll) / Math.SQRT2;
      const s = rocketShapes(roll);
      const out: Shapes = {};
      for (const k in s) {
        out[k] = {
          ...s[k],
          d: cutToBox(movePathBy(String(s[k].d), t - back, -t + back)),
        };
      }
      return out;
    },
  }),
});

// ── Terminal ─────────────────────────────────────────────────────────────────
//
// Carbon's window: a frame 4–28 square (outer corners r2, nudged 0.01 down
// as Carbon does) with a title bar (a 4px band under the top edge, then a
// 2px wall) and the prompt's caret.
//
// Hover: the window grows 2px on every side (the
// container rule; the title bar rides up with the top edge, its height
// held) and a "/" types in after the caret: a 2px stroke the caret's height
// (y 14.75–23.25), leaning 25°, cut flat top and bottom like a glyph,
// 4.2px clear of the caret's point.
// As it starts drawing in at its top, the window's wall is still moving
// out. It draws in from its top over the hover, and on the way out leaves
// from its top as well (the start of the stroke), rather than rewinding.
//
// The caret and the "/" slide left together as the hover runs, so they're
// centred, keeping their 4.2px
// spacing: the pair's ink spans x 10.76–25.1, so a 1.93px slide centres it
// on 16, the grown window's middle (inside it, 4–28). The "/" is 0.9px from
// the window's moving wall as its first sliver appears, 4.8px hovered.

/** How far the window grows on each side. */
export const TERMINAL_GROW = 2;
const hole = (x0: number, y0: number, x1: number, y1: number) =>
  `M${f(x0)} ${f(y0)}V${f(y1)}H${f(x1)}V${f(y0)}Z`; // anticlockwise
const windowD = (g: number) =>
  roundedRectPath(4 - g, 4.01 - g, 28 + g, 28.01 + g) +
  hole(6 - g, 6.01 - g, 26 + g, 10.01 - g) +
  hole(6 - g, 12.01 - g, 26 + g, 26.01 + g);
// Carbon's window exactly, for rest.
const WINDOW =
  'M26 4.01H6A2 2 0 0 0 4 6.01V26.01A2 2 0 0 0 6 28.01H26A2 2 0 0 0 28 26.01V6.01A2 2 0 0 0 26 4.01ZM26 6.01V10.01H6V6.01ZM6 26.01V12.01H26V26.01Z';
const CARET: Pt[] = [
  [10.76, 16.18],
  [13.58, 19.01],
  [10.76, 21.84],
  [12.17, 23.25],
  [16.41, 19.01],
  [12.17, 14.77],
];
/** The "/": its centreline from the top (24, 14.75) to the bottom (20, 23.25), 2px across (2.21 wide on each flat cut); 4.2px clear of the caret's point. */
const GLYPH = { top: [24, 14.75] as Pt, bottom: [20, 23.25] as Pt };
const GLYPH_HALF =
  Math.hypot(GLYPH.top[0] - GLYPH.bottom[0], GLYPH.top[1] - GLYPH.bottom[1]) /
  (GLYPH.bottom[1] - GLYPH.top[1]);
/** The "/" between fractions t0 and t1 of its length from the top, cut flat. */
function glyph(t0: number, t1: number, dx: number): string {
  if (t1 - t0 <= 1e-4) {
    return '';
  }
  const at = (t: number): Pt => [
    GLYPH.top[0] + (GLYPH.bottom[0] - GLYPH.top[0]) * t,
    GLYPH.top[1] + (GLYPH.bottom[1] - GLYPH.top[1]) * t,
  ];
  const [a, b] = [at(t0), at(t1)];
  return polyPath(
    [
      [a[0] - GLYPH_HALF + dx, a[1]],
      [a[0] + GLYPH_HALF + dx, a[1]],
      [b[0] + GLYPH_HALF + dx, b[1]],
      [b[0] - GLYPH_HALF + dx, b[1]],
    ],
    true
  );
}

/** How far the caret and the "/" slide left: the pair's ink (x 10.76 to the "/"'s top corner) centred on 16. */
export const PROMPT_SLIDE = (CARET[0][0] + GLYPH.top[0] + GLYPH_HALF) / 2 - 16;

export const TerminalSpec = /* @__PURE__ */ hoverIcon('Terminal', {
  geo: ({ h, entering = 1 }) => {
    const dx = -PROMPT_SLIDE * h;
    return {
      window: { d: h ? windowD(TERMINAL_GROW * h) : WINDOW },
      caret: {
        d: polyPath(h ? CARET.map(([x, y]) => [x + dx, y] as Pt) : CARET, true),
      },
      glyph: { d: entering > 0 ? glyph(0, h, dx) : glyph(1 - h, 1, dx) },
    };
  },
  static: /* @__PURE__ */ carbonArt(Terminal32),
});

// ── Printer ──────────────────────────────────────────────────────────────────
//
// The printer: its body (2–30 × 9–23, outer corners r2) with the paper in
// its tray standing up out of its top (7–25 × 3–9); the printed sheet
// (7–25 × 15–29) hangs in front of it, so the body's bottom edge stops at
// the sheet (its ends run 1px under the sheet's sides, overlapping rather
// than abutting) and the sheet's top edge sits inside the body.

const PRINTER =
  'M8 23H4A2 2 0 0 1 2 21V11A2 2 0 0 1 4 9H28A2 2 0 0 1 30 11V21A2 2 0 0 1 28 23H24V21H28V11H4V21H8Z' +
  'M7 10V3H25V10H23V5H9V10Z';
/** How far the sheet feeds out on hover. */
export const SHEET_FEED = 2;
// The sheet lengthens:
// its top edge holds inside the printer and its bottom edge moves d down.
const sheet = (d: number) =>
  rectPath(7, 15, 25, 29 + d) + `M9 17V${f(27 + d)}H23V17Z`;

/**
 * The action feeds a page: the printed sheet slides down and out through the
 * bottom of the box (cut there), and the next sheet feeds out of the printer
 * behind it, from under the slot: a 2px line where the sheet's top edge rests
 * (y 15–17), which stays while the pages move: the slot the paper comes out
 * of. The next sheet is cut at that line, so it comes out
 * from under it, until it hangs where the first one did. The pass is FEED px:
 * the first sheet's top edge reaches the box's bottom edge as the next one's
 * reaches its rest.
 */
const FEED = 19;
const SLOT = /* @__PURE__ */ rectPath(7, 15, 25, 17);
export const PrinterSpec = /* @__PURE__ */ hoverIcon('Printer', {
  geo: ({ h }) => ({
    printer: { d: PRINTER },
    sheet: { d: sheet(SHEET_FEED * h) },
  }),
  static: /* @__PURE__ */ carbonArt(Printer32),
  action: /* @__PURE__ */ defineAction({
    description:
      "Printed: the sheet feeds down and out of the box as the next sheet comes out of the printer to take its place. It doesn't loop: `loop` and `until` play one page. With a hand-off (`then`), the status mark enters as the new sheet comes to rest.",
    duration: motionTokens.duration.moderate02 / 1000,
    ease: /* @__PURE__ */ toEasing(motionTokens.easing.standard),
    loops: false,
    geo: ({ h, a }) => {
      if (a <= 0 || a >= 1) {
        return { printer: { d: PRINTER }, sheet: { d: sheet(SHEET_FEED * h) } };
      }
      const out = cutToBox(movePathBy(sheet(SHEET_FEED * h), 0, FEED * a));
      const next = cutTo(
        movePathBy(sheet(0), 0, FEED * (a - 1)),
        boxWith({ y0: 15 })
      );
      return { printer: { d: PRINTER + SLOT }, sheet: { d: out + next } };
    },
  }),
});
