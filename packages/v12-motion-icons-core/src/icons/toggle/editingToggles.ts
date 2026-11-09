/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Chat32 from '@carbon/icons/es/chat/32.js';
import ChatOff32 from '@carbon/icons/es/chat--off/32.js';
import Edit32 from '@carbon/icons/es/edit/32.js';
import EditOff32 from '@carbon/icons/es/edit--off/32.js';
import Link32 from '@carbon/icons/es/link/32.js';
import MagicWand32 from '@carbon/icons/es/magic-wand/32.js';
import MagicWandFilled32 from '@carbon/icons/es/magic-wand--filled/32.js';
import Unlink32 from '@carbon/icons/es/unlink/32.js';
import {
  carbonArt,
  fillThenClear,
  toggleIcon,
  type Shapes,
  type ToggleFrame,
  type ToggleFrameIn,
} from '../../engine';
import { motionTokens, toEasing } from '../../tokens';
import {
  discFillPath,
  filletPath,
  insetPoly,
  polyPath,
  rectPath,
  type Pt,
} from '../../geometry';
import {
  arcSeg,
  filletSegs,
  OFF_SHRINK,
  SLASH_REACH,
  type OffStroke,
} from '../../off';
import { cutPoly, type HalfPlane, type Seg } from '../../cut';
import {
  kickAmount,
  slashChange,
  slashShapes,
  type SlashToggleSpec,
} from '../../utils/slashToggle';
import { EVENODD, f, lerp, LINE } from '../../paint';
import { ChatSpec, CHAT_HOVER, chatHover } from '../operations/opsLast';
import {
  CHAT_OFF_SLASH,
  CHAT_OFF_STROKES,
  ChatOffSpec,
} from '../operations/ChatOff';
import { PENCIL, pencilSlide, underlineEnds } from '../formatting/Edit';
import { EditOffSpec, UnlinkSpec } from '../formatting/editing';
import {
  ARC,
  LINK_GROW,
  LINKS,
  linkPathAt,
  loopPath,
  SIDE,
  type Loop,
} from '../formatting/Link';
import { ENTRANCE, EXIT, FOLD_AT } from '../../ease';
import { MagicWandSpec, MagicWandFilledSpec } from '../formatting/fmtTools';

const CChat = /* @__PURE__ */ carbonArt(Chat32);
const CChatOff = /* @__PURE__ */ carbonArt(ChatOff32);
const CEdit = /* @__PURE__ */ carbonArt(Edit32);
const CEditOff = /* @__PURE__ */ carbonArt(EditOff32);
const CLink = /* @__PURE__ */ carbonArt(Link32);
const CMagicWand = /* @__PURE__ */ carbonArt(MagicWand32);
const CMagicWandFilled = /* @__PURE__ */ carbonArt(MagicWandFilled32);
const CUnlink = /* @__PURE__ */ carbonArt(Unlink32);

/**
 * Editing toggles on the frame engine: Chat ⇄ Chat off, Edit ⇄ Edit off,
 * Link ⇄ Unlink and Magic wand ⇄ Magic wand filled.
 *
 * Each end is the matching hover icon's geometry (Chat, ChatOff, Edit,
 * EditOff, Link, Unlink, MagicWand, MagicWandFilled), so both ends equal
 * Carbon at rest and hover in either state is that icon's hover.
 * Constant 2px line weight throughout; no masks, clip paths or scaled ink.
 */

type Tween = { duration: number; ease: [number, number, number, number] };
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
// editing.ts's helpers (kept private there: its every export is an icon), for EditOff's slash and pencil.
/** A 2px band (or w) from a to b, square ends. */
function band(a: Pt, b: Pt, w = 2): string {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(dx, dy);
  const [nx, ny] = [(-dy / l) * (w / 2), (dx / l) * (w / 2)];
  return polyPath(
    [
      [a[0] + nx, a[1] + ny],
      [b[0] + nx, b[1] + ny],
      [b[0] - nx, b[1] - ny],
      [a[0] - nx, a[1] - ny],
    ],
    true
  );
}
/** a and b pushed `d` px further apart along the line through them. */
function extend(a: Pt, b: Pt, d: number): [Pt, Pt] {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const [ux, uy] = [((b[0] - a[0]) / l) * d, ((b[1] - a[1]) / l) * d];
  return [
    [a[0] - ux, a[1] - uy],
    [b[0] + ux, b[1] + uy],
  ];
}
/** A point given in rotated coordinates: d = x − y (across the 45° diagonal), u = x + y (along it). */
const DU = (d: number, u: number): Pt => [(u + d) / 2, (u - d) / 2];
const P = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
/** A polygon's path data (empty below three points). */
const polyD = (pts: readonly Pt[]) =>
  pts.length > 2 ? `M${pts.map(P).join('L')}Z` : '';

/**
 * Chat off's frame, with defaults for its extra hovers (makeToggleIcon's
 * `hovers`): `w`, Chat's hover for the bubble, and `l`, Chat's hover for the
 * text lines, held at rest after a toggle back on until the pointer leaves
 * and comes back. Outside the engine they follow `h`.
 */
const withDefaults = (fr: ToggleFrameIn) => ({
  h: fr.h,
  p: fr.p,
  e: fr.e,
  w: fr.w ?? fr.h,
  l: fr.l ?? fr.w ?? fr.h,
  entering: fr.entering ?? 1,
});

// ── Chat ⇄ Chat off ──────────────────────────────────────────────────────────
//
// The standard slash toggle (utils/slashToggle): on → off the slash draws in
// from the top left (160ms entrance) with Carbon's 2px gap opening behind its
// head, and the bubble kicks 2px right and back (Flash off's slash and kick);
// off → on the slash retracts (120ms exit) and the bubble recoils half as
// far. Chat off isn't Chat cut by the slash, so three things go with it:
//
// - The text lines have no counterpart: they retract from their right ends
//   to their left (8px), gone half way (as Image's sun), cut by the gap
//   where the slash has drawn.
// - Chat off's tail sits 3px further left, with the lower-left wall 3px
//   shorter: tail and wall end move left together with the slash (rigid;
//   the space between them holds).
// - Chat off has no lower-right corner: once the gap has cut the corner free
//   of the bottom wall, the piece left beyond the gap retracts up into the
//   right wall, which ends at y 21 (as Carbon's does).
//
// On hover (on) is Chat's: the bubble grows 2px a side and the text scrolls,
// on Chat's own 190ms linear timing (`w` for the bubble, `l` for the lines).
// Toggled back on under the pointer, the lines return unscrolled (`l` is
// held at 0) and scroll again only after the pointer leaves and comes back
//; the bubble keeps Chat's hover. Off hover is Chat off's: the
// bubble shrinks to 90% about (16, 14) under the slash, which extends 1px at
// each end (`h`, 160ms). The ends are Chat's and ChatOff's geometry exactly.

const CHAT_SPEC: SlashToggleSpec = {
  statics: [CChat, CChatOff],
  slash: CHAT_OFF_SLASH,
  kick: [2, 0],
  centre: [16, 14],
  base: () => ({ strokes: CHAT_OFF_STROKES }),
};
const TAIL_SHIFT = 3;
const LINES_GONE_AT = 0.5;
/**
 * Where the bottom wall's right end sits, under the slash: Chat off's ends in
 * the gap (x 26), where the kick would slide it out past the gap's far edge.
 * Cut, the two are the same drawing.
 */
const BOTTOM_END = 23.5;
const CHAT_OFF_KICKED: OffStroke[] = [
  CHAT_OFF_STROKES[0],
  CHAT_OFF_STROKES[1],
  /* @__PURE__ */ filletSegs(
    [
      [13.87, 29.5],
      [17.58, 23],
      [BOTTOM_END, 23],
    ],
    0
  ),
];
/** The bubble corner's arc angle at which the right wall reaches y 21 (Chat off's wall end). */
const CORNER_TO_21 = Math.asin(1 / 3);

/** The slash's frame: unit direction u, left normal n, where it starts along u (ua) and its full length. */
function slashFrame(h: number) {
  const { a, b } = CHAT_OFF_SLASH;
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const u: Pt = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  const n: Pt = [-u[1], u[0]];
  const reach = SLASH_REACH * h;
  return { u, n, ua: u[0] * a[0] + u[1] * a[1] - reach, len: l + 2 * reach };
}
/** The gap strip beside the drawn slash, as half-planes (slashShapes cuts solids with the same strip). */
function gapStrip(p: number, h: number): HalfPlane[] {
  const { u, n, ua, len } = slashFrame(h);
  const head = ua + len * p;
  const { a, gapSide: sd, gap } = CHAT_OFF_SLASH;
  const c = n[0] * a[0] + n[1] * a[1];
  return [
    { n: [sd * n[0], sd * n[1]], c: sd * c + 1 },
    { n: [-sd * n[0], -sd * n[1]], c: -(sd * c + 1 + gap) },
    { n: [-u[0], -u[1]], c: -head },
    { n: [u[0], u[1]], c: ua - 2 },
  ];
}

/**
 * Chat's bubble as 2px centrelines (outer corners r4, so r3 on the
 * centreline), grown g a side as Chat's hover grows it, with the tail and
 * the lower-left wall's end moved `shift` left. `cut`: once the gap has cut
 * the lower-right corner free (0), how far that piece has retracted (1: into
 * the right wall, ending at y 21); null while it's still joined.
 */
function chatStrokes(
  g: number,
  shift: number,
  cut: number | null
): OffStroke[] {
  const [l, t, r, b] = [3 - g, 5 - g, 29 + g, 23 + g];
  const end: Pt = [15 - shift, b];
  const tailTop: Pt = [20.58 - (4 / 7) * g - shift, b];
  const tip: Pt = [16.87 - shift, 29.5];
  if (cut === null) {
    return [
      filletSegs(
        [end, [l, b], [l, t], [r, t], [r, b], tailTop, tip],
        [0, 3, 3, 3, 3, 0, 0]
      ),
    ];
  }
  // The right wall runs round the corner (centre r−3, b−3) to angle θ (90° at the
  // bottom wall, inside the gap; 0 at the right wall's foot), with a stub
  // growing down the wall to y 21 as the arc leaves it.
  const theta = (Math.PI / 2) * (1 - cut);
  const right: Seg[] = filletSegs(
    [end, [l, b], [l, t], [r, t], [r, b - 3]],
    [0, 3, 3, 3, 0]
  );
  if (theta > 1e-4) {
    right.push(arcSeg([r - 3, b - 3], 3, 0, (theta * 180) / Math.PI));
  }
  const stub = 1 - Math.min(1, theta / CORNER_TO_21);
  return [
    right,
    filletSegs(
      [
        [r, b - 4],
        [r, b - 3 + stub],
      ],
      0
    ),
    filletSegs([[BOTTOM_END + g, b], tailTop, tip], 0),
  ];
}

/** A line of text (x0–x1, y0–y1) retracted `q` towards its left end, mapped by `move`, cut by `gap` (if any). */
function chatLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  q: number,
  move: (p: Pt) => Pt,
  gap: HalfPlane[] | null
): string {
  const right = lerp(x1, x0, q);
  if (right - x0 < 1e-3) {
    return '';
  }
  const quad = (
    [
      [x0, y0],
      [right, y0],
      [right, y1],
      [x0, y1],
    ] as Pt[]
  ).map(move);
  return (gap ? cutPoly(quad, gap) : [quad]).map(polyD).join('');
}

function chatOffShapes(fr: ToggleFrameIn): Shapes {
  const { h, p, e, w, l } = withDefaults(fr);
  const EMPTY = { d: '' };
  if (p <= 0 && e === 0) {
    const [bubble, lines] = [ChatSpec.geo({ h: w }), ChatSpec.geo({ h: l })];
    return {
      bubble: bubble.bubble,
      line1: lines.line1,
      line2: lines.line2,
      line3: lines.line3,
      fill: EMPTY,
      rings: { d: '', ...EVENODD },
      slash: EMPTY,
    };
  }
  if (p >= 1 && e === 0) {
    const s = ChatOffSpec.geo({ h });
    return {
      bubble: EMPTY,
      line1: { d: '', opacity: 0 },
      line2: EMPTY,
      line3: { d: '', opacity: 0 },
      fill: s.fill,
      rings: s.rings,
      slash: s.slash,
    };
  }
  // The bubble on Chat's hover (w), the lines on theirs (l, held at rest after a toggle back on).
  const hov = { ...chatHover(l * (1 - p)), g: chatHover(w * (1 - p)).g };
  // Where the base sits under the slash: the Off shrink (about the centre) and the kick.
  const k = 1 - OFF_SHRINK * h * p;
  const tx = CHAT_SPEC.kick[0] * kickAmount(e);
  const [cx, cy] = CHAT_SPEC.centre;
  const move = ([x, y]: Pt): Pt => [cx + (x - cx) * k + tx, cy + (y - cy) * k];
  // The lower-right corner is cut free once the slash's head is past the
  // bottom wall's whole width where the corner begins (in the gap).
  const { u, ua, len } = slashFrame(h);
  const foot = move([26 + hov.g, 23 + hov.g]);
  const pFree =
    (u[0] * foot[0] + u[1] * foot[1] + Math.SQRT1_2 + 0.3 - ua) / len;
  const cut = p < pFree ? null : clamp01((p - pFree) / (1 - pFree));
  const strokes =
    p >= 1 ? CHAT_OFF_KICKED : chatStrokes(hov.g, TAIL_SHIFT * p, cut);
  const s = slashShapes(
    { ...CHAT_SPEC, base: () => ({ strokes }) },
    { h, p, e }
  );
  const q = clamp01(p / LINES_GONE_AT);
  const gap = p > 1e-4 ? gapStrip(p, h) : null;
  const line = (l: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    hidden: boolean;
  }) => (l.hidden ? '' : chatLine(l.x0, l.y0, l.x1, l.y1, q, move, gap));
  return {
    bubble: EMPTY,
    line1: { d: line(hov.line1), opacity: f(hov.line1.opacity) },
    line2: { d: line(hov.line2) },
    line3: { d: line(hov.line3), opacity: f(hov.line3.opacity) },
    fill: s.fill,
    rings: s.rings,
    slash: s.slash,
  };
}

/** Chat ⇄ Chat off. `toggled` shows Chat off. */
export const ChatOffToggleSpec = /* @__PURE__ */ toggleIcon<'on' | 'off'>(
  'ChatOffToggle',
  {
    states: ['on', 'off'],
    statics: CHAT_SPEC.statics,
    geo: chatOffShapes,
    change: slashChange,
    // `h` stays on the standard timing (Chat off's Off hover); Chat's parts run on Chat's.
    hovers: {
      w: { hover: CHAT_HOVER },
      l: { hover: CHAT_HOVER, holdAfter: 'on' },
    },
  }
);

// ── Edit ⇄ Edit off ──────────────────────────────────────────────────────────
//
// The slash toggle's timing and kick (slashChange: 160ms entrance in, 120ms
// exit back, the base kicking 2px right and recoiling), drawn the way
// EditOff draws itself: the pencil as 2px stroked centrelines, cut where
// the slash and Carbon's gap cross it.
//
// - The slash draws in from the top left; each of the pencil's long sides
//   is cut as the slash's head reaches it, the lower piece ending on the
//   slash's edge and the upper starting beyond the gap (EditOff's cut, at
//   d = x − y of −1.4 and 4.4; the kick slides the pencil under it).
// - Edit off's pencil is longer and sits lower than Edit's: across the
//   slash it moves 2px down-right (Δ(x+y) = 4) while its tip and cap each
//   move 2.8px further out along it (Δ(x−y) = ∓4), so it lengthens along its
//   own axis at constant width (no other change of shape).
// - The underline has no counterpart: it retracts from its right end to its
//   left, gone half way, before the pencil's tip settles where it was.
//
// On hover (on) is Edit's: the pencil slides 2px right and the underline
// grows 2px at each end (Edit.ts pencilSlide, underlineEnds). Off hover is
// EditOff's: the pencil shrinks to 90% about the centre (its cut ends
// tucking under the slash) and the slash extends 1px at each end. The ends
// are Edit's and EditOff's geometry.

/** EditOff's cut, across the slash (d = x − y): the lower piece ends at `lo`, the upper starts at `hi`. */
const EDIT_CUT = { lo: -1.4, hi: 4.4 };
const EDIT_SLASH: [Pt, Pt] = [
  [2.7, 2.7],
  [29.3, 29.3],
];
const EDIT_KICK = 2;
const UNDERLINE_GONE_AT = 0.5;

/**
 * A centreline through `pts` with each corner rounded to its radius (0:
 * sharp), as filletPath rounds them; `closed` joins the last point back
 * to the first (whose own corner is sharp).
 */
function cornerPath(
  pts: readonly Pt[],
  radii: readonly number[],
  closed: boolean
): string {
  const n = pts.length;
  let d = `M${P(pts[0])}`;
  for (let i = 1; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2] = [pts[i - 1], pts[i], pts[(i + 1) % n]];
    const r = radii[i];
    if (r <= 0) {
      d += `L${P(p1)}`;
      continue;
    }
    const unit = (a: Pt, b: Pt): Pt => {
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    };
    const [u, v] = [unit(p1, p0), unit(p1, p2)];
    const t =
      r /
      Math.tan(
        Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1]))) / 2
      );
    const sweep =
      (p1[0] - p0[0]) * (p2[1] - p1[1]) - (p1[1] - p0[1]) * (p2[0] - p1[0]) > 0
        ? 1
        : 0;
    d += `L${P([p1[0] + u[0] * t, p1[1] + u[1] * t])}A${r} ${r} 0 0 ${sweep} ${P([p1[0] + v[0] * t, p1[1] + v[1] * t])}`;
  }
  return closed ? `${d}Z` : `${d}L${P(pts[n - 1])}`;
}

function editOffShapes({ h, p, e }: ToggleFrame): Shapes {
  const EMPTY = { d: '' };
  const lower = { ...LINE, strokeLinejoin: 'miter' } as const;
  const empty = {
    underline: EMPTY,
    pencil: { d: '', transform: 'translate(0 0)' },
    lower: { d: '', ...lower },
    upper: { d: '', ...LINE },
    bar: { d: '', ...LINE },
    slash: EMPTY,
  };
  if (p <= 0 && e === 0) {
    const [x0, x1] = underlineEnds(h);
    return {
      ...empty,
      underline: { d: rectPath(x0, 26, x1, 28) },
      pencil: { d: PENCIL, transform: `translate(${pencilSlide(h)} 0)` },
    };
  }
  if (p >= 1 && e === 0) {
    const s = EditOffSpec.geo({ h });
    return {
      ...empty,
      lower: s.lower,
      upper: s.upper,
      bar: s.bar,
      slash: s.slash,
    };
  }
  const hOn = h * (1 - p);
  const k = 1 - OFF_SHRINK * h * p;
  const tx = EDIT_KICK * kickAmount(e);
  const move = ([x, y]: Pt): Pt => [16 + (x - 16) * k + tx, 16 + (y - 16) * k];
  // The pencil in (d, u) = (x − y, x + y): Edit's at p 0, Edit off's at p 1; Edit's hover slides it right.
  const slide = pencilSlide(hOn);
  const [u0, u1] = [23 + 4 * p + slide, 33 + 4 * p + slide];
  const tipD = -13 - 4 * p + slide;
  const capD = 17.8 + 4 * p + slide;
  const barD = 9 + 4 * p + slide;
  // The slash, drawn p of the way from its start (reaching h further at each end on hover).
  const [a, b] = extend(...EDIT_SLASH, h);
  const head: Pt = p >= 1 ? b : [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
  // A side is cut once the slash's head has reached it (as drawn: after the shrink and kick).
  const cutAt = (side: number) =>
    head[0] + head[1] >= move(DU(0, side))[0] + move(DU(0, side))[1];
  // The cut is fixed under the kick (the pencil slides under it) and moves with the shrink (EditOff's tuck).
  const [lo, hi] = [EDIT_CUT.lo - tx / k, EDIT_CUT.hi - tx / k];
  const [cut0, cut1] = [cutAt(u0), cutAt(u1)];
  // The tip end (sharp corners) and the cap end (corners r1), as points from side u0 round to side u1.
  const tipEnd = [DU(tipD, u0), DU(tipD - 5, u0 + 5), DU(tipD, u1)];
  const capEnd = [DU(capD, u0), DU(capD, u1)];
  let pencil: { lower: string; upper: string };
  if (cut0 && cut1) {
    pencil = {
      lower: polyPath([DU(lo, u0), ...tipEnd, DU(lo, u1)].map(move)),
      upper: filletPath([DU(hi, u0), ...capEnd, DU(hi, u1)].map(move), 1),
    };
  } else if (!cut0 && !cut1) {
    // One closed outline.
    pencil = {
      lower: cornerPath(
        [...tipEnd, ...[...capEnd].reverse()].map(move),
        [0, 0, 0, 1, 1],
        true
      ),
      upper: '',
    };
  } else {
    // Cut on one side only: one line from the cap's cut end round to the tip's.
    const [cs, us] = cut0 ? [u0, u1] : [u1, u0];
    const pts = [
      DU(hi, cs),
      DU(capD, cs),
      DU(capD, us),
      DU(tipD, us),
      DU(tipD - 5, u0 + 5),
      DU(tipD, cs),
      DU(lo, cs),
    ];
    pencil = {
      lower: cornerPath(pts.map(move), [0, 1, 1, 0, 0, 0, 0], false),
      upper: '',
    };
  }
  const bar = [DU(barD, u0), DU(barD, u1)].map(move);
  const q = clamp01(p / UNDERLINE_GONE_AT);
  const [ul, ur0] = underlineEnds(hOn);
  const ur = lerp(ur0, ul, q);
  return {
    ...empty,
    underline: {
      d:
        ur - ul > 1e-3
          ? polyD(
              (
                [
                  [ul, 26],
                  [ur, 26],
                  [ur, 28],
                  [ul, 28],
                ] as Pt[]
              ).map(move)
            )
          : '',
    },
    lower: { d: pencil.lower, ...lower },
    upper: { d: pencil.upper, ...LINE },
    bar: { d: `M${P(bar[0])}L${P(bar[1])}`, ...LINE },
    slash: { d: p > 1e-4 ? band(a, head, 1.98) : '' },
  };
}

/** Edit ⇄ Edit off. `toggled` shows Edit off. */
export const EditOffToggleSpec = /* @__PURE__ */ toggleIcon<'on' | 'off'>(
  'EditOffToggle',
  {
    states: ['on', 'off'],
    statics: [CEdit, CEditOff],
    geo: editOffShapes,
    change: slashChange,
  }
);

// ── Link ⇄ Unlink ────────────────────────────────────────────────────────────
//
// A match cut (as Play ⇄ Pause and Record ⇄ Stop): p runs linear and the
// cut applies its own two-part easing, cutting at 6/15 (FOLD_AT). With the
// longer travel it runs a token longer than they do: 220ms in
// (moderate02), 160ms back (moderate01, one token faster).
//
// Link → unlink: the two links accelerate toward each other along their
// axis (exit ease, 0–96ms), each moving rigidly 3.25px per axis (4.6px
// along the axis; 9.2px closer in all). For the first 2.75px each gap
// travels with the link passing through it (Link's hover, run the other
// way), so the space round each crossing holds; for the last 0.5px the gaps
// stop and the links move on as rigid bodies, closing that space to a touch
// (0.04px) at the cut itself. (Sliding the gaps all the way would leave each
// far bend more than half inside the other's gap; stopping them earlier
// overlaps the pieces before the cut.) Squeezed, the link spans 23.3px
// along its axis: one loop's length (32.5px at rest).
//
// At the cut the drawing swaps to Unlink's two hooks, completely together:
// their bends a loop's arc centres apart (8√2) on the icon's centre and
// their arms half a loop long, meeting (a hair over, so there's no seam)
// — one link loop, at Link's own 2px weight and r 5 bends. They split apart
// (entrance ease, 96–240ms): the bends move out 2px per axis each to
// Carbon's (8.5px from the centre along the axis), and the arms shorten from
// 5.66px to Carbon's 5.31px, so the break opens from nothing to 6.35px; the
// six marks draw out from their inner ends by the break. Geometry moves and
// regrows; nothing is scaled.
//
// Unlink → link plays the same backwards in 160ms: the hooks accelerate
// together into one loop while the marks retract, cut (at 90ms) to the link
// already squeezed, and it releases out to rest.
//
// Hover: link, Link's (the links drift 1px per axis apart, their gaps
// sliding with them, and the link grows a little; the growth gives way as
// the links squeeze, so they reach the cut at rest size); unlink, Unlink's
// (the halves move 1px per axis apart, each mark extends 1px). The squeeze adds to Link's; Unlink's opens with
// the split, so the hooks are together at the cut whatever the hover. Pieces keep
// constant weight and are only ever moved; the ends are Link's and
// Unlink's geometry.

/** How far each link moves toward the other before the cut (px per axis), and how far of that its gap slides with it. */
const LINK_SQUEEZE = 3.25;
const GAP_SLIDE = 2.75;
/** The hooks' bends, from the icon's centre (px per axis): together as one loop at the cut, Carbon's at rest. */
const BEND_TOGETHER = SIDE / 2 / Math.SQRT2;
const BEND_REST = 6;
/** How far each hook's arms run past its bend's centre: half a loop at the cut (a hair over, so the two meet without a seam), Carbon's at rest. */
const ARM_TOGETHER = SIDE / 2 + 0.1;
const ARM = 5.314;
const LINK_IN: Tween = {
  duration: motionTokens.duration.moderate02 / 1000,
  ease: [0, 0, 1, 1],
};
const LINK_OUT: Tween = {
  duration: motionTokens.duration.moderate01 / 1000,
  ease: [0, 0, 1, 1],
};
const [LINK_A, LINK_B] = LINKS;
/** Unlink's marks, each from its inner end (by the break) to its outer end. */
const DIAG = 2.415 * Math.SQRT1_2;
const MARKS: { inner: Pt; outer: Pt }[] = [
  { inner: [5.996 + DIAG, 6.005 + DIAG], outer: [5.996 - DIAG, 6.005 - DIAG] },
  {
    inner: [25.995 - DIAG, 25.999 - DIAG],
    outer: [25.995 + DIAG, 25.999 + DIAG],
  },
  { inner: [12, 6], outer: [12, 2] },
  { inner: [6, 12], outer: [2, 12] },
  { inner: [26, 20], outer: [30, 20] },
  { inner: [20, 26], outer: [20, 30] },
];

/** A hook: the loop's far bend (moved to `bend`) with arms `arm` long past its centre, both sides. */
const hook = (l: Loop, bend: Pt, arm: number) =>
  loopPath(
    l,
    SIDE - arm,
    SIDE + ARC + arm,
    bend[0] - l.c2[0],
    bend[1] - l.c2[1]
  );

function linkShapes({ h, p }: ToggleFrame): Shapes {
  const still = 'translate(0 0)';
  if (p <= FOLD_AT) {
    // The links squeeze together, rigidly; their gaps travel with them (Link's hover, run the other way) as far as GAP_SLIDE.
    // Link's hover growth gives way as they squeeze, so they reach the cut at rest size.
    const q = EXIT(clamp01(p / FOLD_AT));
    const squeeze = LINK_SQUEEZE * q;
    const [t, slide, k] = [
      h - squeeze,
      h - Math.min(squeeze, GAP_SLIDE),
      1 + LINK_GROW * h * (1 - q),
    ];
    return {
      lower: { d: linkPathAt(LINK_B, t, slide, k), transform: still },
      upper: { d: linkPathAt(LINK_A, t, slide, k), transform: still },
      marks: { d: '' },
    };
  }
  if (p >= 1) {
    const s = UnlinkSpec.geo({ h });
    return { lower: s.lower, upper: s.upper, marks: s.marks };
  }
  // After the cut: the hooks start as one loop and split apart to Carbon's, the arms regrowing; the marks draw out.
  const out = ENTRANCE((p - FOLD_AT) / (1 - FOLD_AT));
  // (Together whatever the hover: Unlink's hover opens with the split.)
  const a = lerp(BEND_TOGETHER, BEND_REST + h, out);
  const arm = lerp(ARM_TOGETHER, ARM, out);
  const marks =
    out < 1e-3
      ? ''
      : MARKS.map(({ inner, outer }) => {
          const l = Math.hypot(outer[0] - inner[0], outer[1] - inner[1]);
          const reach = (out * (l + h)) / l;
          return band(inner, [
            inner[0] + (outer[0] - inner[0]) * reach,
            inner[1] + (outer[1] - inner[1]) * reach,
          ]);
        }).join('');
  return {
    lower: { d: hook(LINK_B, [16 - a, 16 + a], arm), transform: still },
    upper: { d: hook(LINK_A, [16 + a, 16 - a], arm), transform: still },
    marks: { d: marks },
  };
}

/** Link ⇄ Unlink. `toggled` shows Unlink. */
export const LinkToggleSpec = /* @__PURE__ */ toggleIcon<'link' | 'unlink'>(
  'LinkToggle',
  {
    states: ['link', 'unlink'],
    statics: [CLink, CUnlink],
    geo: linkShapes,
    // Linear progress: the match cut applies its own easing. 220ms in, 160ms back (one token faster).
    change: (on, _f, tween) => tween('p', on ? 1 : 0, on ? LINK_IN : LINK_OUT),
  }
);

// ── Magic wand ⇄ Magic wand filled ───────────────────────────────────────────
//
// Carbon's filled magic wand fills the handle (the long part); the tip stays
// open in both. The house disc fill (§7.7): a disc grows from the handle
// hole's centre, clipped to the handle's centreline, in 160ms on the
// entrance ease; to empty it, a hole grows from the same centre in 120ms on
// the exit ease. The fill turns with the wand. Hover in either state is the
// wand's own (540ms: the wand tips 5° in 160ms and the sparkles swell,
// turn and drift out, snapping back on leave), on its own timing
// (makeToggleIcon's `hover`, with `entering`); the ends are MagicWand's and
// MagicWandFilled's geometry.

/** The handle's opening in Carbon's outline wand, and its centreline (1px out). */
const WAND_HOLE: Pt[] = [
  [25.4131, 28],
  [14.4131, 17.001],
  [17, 14.4141],
  [28, 25.4141],
];
const WAND_HANDLE = /* @__PURE__ */ insetPoly(WAND_HOLE, -1);
const WAND_CENTRE: Pt = [(14.4131 + 28) / 2, (14.4141 + 28) / 2];
/** Magic wand's hover timing (fmtTools: 540ms on the entrance curve). */
const WAND_HOVER: Tween = {
  duration: 0.54,
  ease: /* @__PURE__ */ toEasing(motionTokens.easing.entrance),
};

function wandShapes({ h, p, e, entering = 1 }: ToggleFrameIn): Shapes {
  const filled = p >= 1 && e <= 0;
  const s = (filled ? MagicWandFilledSpec : MagicWandSpec).geo({ h, entering });
  const fill =
    filled || p <= 0 ? '' : discFillPath(WAND_HANDLE, WAND_CENTRE, p, e);
  return { ...s, fill: { d: fill, ...EVENODD, transform: s.wand.transform } };
}

/** Magic wand ⇄ Magic wand filled. `toggled` shows the filled wand. */
export const MagicWandToggleSpec = /* @__PURE__ */ toggleIcon<
  'outline' | 'filled'
>('MagicWandToggle', {
  states: ['outline', 'filled'],
  statics: [CMagicWand, CMagicWandFilled],
  geo: wandShapes,
  change: fillThenClear,
  hover: WAND_HOVER,
});
