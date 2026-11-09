/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import AddAlt32 from '@carbon/icons/es/add--alt/32.js';
import AddFilled32 from '@carbon/icons/es/add--filled/32.js';
import Bookmark32 from '@carbon/icons/es/bookmark/32.js';
import BookmarkFilled32 from '@carbon/icons/es/bookmark--filled/32.js';
import CloseFilled16 from '@carbon/icons/es/close--filled/16.js';
import CloseFilled32 from '@carbon/icons/es/close--filled/32.js';
import CloseOutline32 from '@carbon/icons/es/close--outline/32.js';
import Filter32 from '@carbon/icons/es/filter/32.js';
import FilterFilled32 from '@carbon/icons/es/filter--filled/32.js';
import Flag32 from '@carbon/icons/es/flag/32.js';
import FlagFilled32 from '@carbon/icons/es/flag--filled/32.js';
import NotSent32 from '@carbon/icons/es/not-sent/32.js';
import NotSentFilled32 from '@carbon/icons/es/not-sent--filled/32.js';
import Pin32 from '@carbon/icons/es/pin/32.js';
import PinFilled32 from '@carbon/icons/es/pin--filled/32.js';
import RadioButton32 from '@carbon/icons/es/radio-button/32.js';
import RadioButtonChecked32 from '@carbon/icons/es/radio-button--checked/32.js';
import SendAlt32 from '@carbon/icons/es/send--alt/32.js';
import SendAltFilled32 from '@carbon/icons/es/send--alt--filled/32.js';
import SubtractAlt32 from '@carbon/icons/es/subtract--alt/32.js';
import SubtractFilled32 from '@carbon/icons/es/subtract--filled/32.js';
import Unlocked16 from '@carbon/icons/es/unlocked/16.js';
import Unlocked32 from '@carbon/icons/es/unlocked/32.js';
import UnlockedFilled32 from '@carbon/icons/es/unlocked--filled/32.js';
import {
  carbonArt,
  fillThenClear,
  hoverIcon,
  toggleIcon,
  variantToggle,
  type CarbonIcon,
  type HoverIconSpec,
  type Shapes,
  type ToggleSpec,
  type ToggleIconProps,
} from '../../engine';
import {
  circlePts,
  clipConvex,
  discFillPath,
  pathPoints,
  polyPath,
  type Pt,
} from '../../geometry';
import { EVENODD, f, lerp } from '../../paint';
import {
  ALT_HOVER,
  ALT_REST,
  BookmarkSpec,
  dart,
  FlagSpec,
  PinSpec,
  SEND_ALT_D,
  SEND_ALT_FILLED_D,
  type Dart,
} from '../operations/opsMisc';
import { FilterSpec, FILTER_HOVER } from '../operations/opsLast';
import {
  AddAltSpec,
  CloseOutlineSpec,
  SubtractAltSpec,
} from '../operations/signs';
import { PLANE, PLANE_PIVOT } from '../operations/NotSent';
import {
  slashChange,
  slashShapes,
  type SlashToggleSpec,
} from '../../utils/slashToggle';
import { OFF_SHRINK, type Slash } from '../../off';
import { LockedUnlockedOutlineToggleSpec } from './lockToggle';
import { CheckmarkOutlineToggleSpec } from './checkToggles';

const CAddAlt = /* @__PURE__ */ carbonArt(AddAlt32);
const CAddFilled = /* @__PURE__ */ carbonArt(AddFilled32);
const CBookmark = /* @__PURE__ */ carbonArt(Bookmark32);
const CBookmarkFilled = /* @__PURE__ */ carbonArt(BookmarkFilled32);
const CCloseFilled = /* @__PURE__ */ carbonArt(CloseFilled16, CloseFilled32);
const CCloseOutline = /* @__PURE__ */ carbonArt(CloseOutline32);
const CFilter = /* @__PURE__ */ carbonArt(Filter32);
const CFilterFilled = /* @__PURE__ */ carbonArt(FilterFilled32);
const CFlag = /* @__PURE__ */ carbonArt(Flag32);
const CFlagFilled = /* @__PURE__ */ carbonArt(FlagFilled32);
const CNotSent = /* @__PURE__ */ carbonArt(NotSent32);
const CNotSentFilled = /* @__PURE__ */ carbonArt(NotSentFilled32);
const CPin = /* @__PURE__ */ carbonArt(Pin32);
const CPinFilled = /* @__PURE__ */ carbonArt(PinFilled32);
const CRadioButton = /* @__PURE__ */ carbonArt(RadioButton32);
const CRadioButtonChecked = /* @__PURE__ */ carbonArt(RadioButtonChecked32);
const CSendAlt = /* @__PURE__ */ carbonArt(SendAlt32);
const CSendAltFilled = /* @__PURE__ */ carbonArt(SendAltFilled32);
const CSubtractAlt = /* @__PURE__ */ carbonArt(SubtractAlt32);
const CSubtractFilled = /* @__PURE__ */ carbonArt(SubtractFilled32);
const CUnlocked = /* @__PURE__ */ carbonArt(Unlocked16, Unlocked32);
const CUnlockedFilled = /* @__PURE__ */ carbonArt(UnlockedFilled32);

/**
 * Outline ⇄ filled toggles for operations icons: Bookmark, Flag, Pin,
 * Filter, Add / Subtract / Close (circled), Unlocked and Radio button; and
 * the Send alt ⇄ Not sent on / off toggles (see their section).
 *
 * Toggle (all): the house disc fill (§7.7) via `fillThenClear`. A disc grows
 * from the inside's area centroid, clipped to the inside, in 160ms on the
 * entrance ease; to empty, a hole grows from the same centre in 120ms on the
 * exit ease. The fill shares one even-odd path with the outline it fills
 * (clipped to the outline's inside edge, so the two meet with no seam), and
 * any part Carbon's filled drawing knocks out of the fill (Filter's wave,
 * the circled signs) is in that path too, so it turns
 * into the knockout as the fill passes it. No masks or clip paths; nothing
 * is scaled.
 *
 * Hover (either state): the icon's own hover, unchanged. Every
 * toggle reads its outline from that hover icon's own `geo` (or the
 * functions it is built from), so the off end equals the outline hover at
 * every h by construction; the filled end is that outline filled in, which
 * moves exactly as the filled hover icon does (same rule, same numbers).
 */

// ── Shared ───────────────────────────────────────────────────────────────────

type FillShapes = (h: number, p: number, e: number, size?: number) => Shapes;
/** The fill: a disc about `c` of radius `rp`, less a hole of radius `re`. */
type Disc = { c: Pt; rp: number; re: number };

const within = (pts: readonly Pt[], [cx, cy]: Pt, r: number) =>
  pts.every(([x, y]) => Math.hypot(x - cx, y - cy) <= r);

/** `pts` inside the disc of radius r about c: `whole` when it covers them, '' when there is none. */
function clipD(pts: readonly Pt[], whole: string, c: Pt, r: number): string {
  if (r <= 1e-4 || pts.length < 3) {
    return '';
  }
  if (within(pts, c, r)) {
    return whole;
  }
  const part = clipConvex(pts, circlePts(c, r));
  return part.length > 2 ? polyPath(part, true) : '';
}

/** The polygon `pts` (drawn as `whole`) inside the fill, as even-odd subpaths. */
function inFill(
  pts: readonly Pt[],
  whole: string,
  { c, rp, re }: Disc
): string {
  const [a, b] = [clipD(pts, whole, c, rp), clipD(pts, whole, c, re)];
  return a === b ? '' : a + b;
}

/** The polygon `pts` (drawn as `whole`) outside the fill, as even-odd subpaths. */
function outsideFill(pts: readonly Pt[], whole: string, disc: Disc): string {
  const k = inFill(pts, whole, disc);
  return k === '' ? whole : k === whole ? '' : whole + k;
}

const polyD = (pts: readonly Pt[]) =>
  pts.length > 2 ? polyPath(pts, true) : '';

/** The area centroid of a simple polygon. */
function areaCentroid(pts: readonly Pt[]): Pt {
  let [a, cx, cy] = [0, 0, 0];
  pts.forEach(([x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length];
    const k = x0 * y1 - x1 * y0;
    [a, cx, cy] = [a + k, cx + (x0 + x1) * k, cy + (y0 + y1) * k];
  });
  return [cx / (3 * a), cy / (3 * a)];
}

/** How far the fill must reach from c to cover `pts`. */
const reachOf = (pts: readonly Pt[], [cx, cy]: Pt) =>
  Math.max(...pts.map(([x, y]) => Math.hypot(x - cx, y - cy))) + 0.5;

/** An absolute path's subpaths, each as its points. */
const subpaths = (d: string): Pt[][] =>
  d
    .split(/(?=M)/)
    .filter((s) => s.trim())
    .map((s) => pathPoints(s));

/** A circle about (16, 16) in the form signs.ts draws its discs; nothing at r ≤ 0. */
const circle = (r: number) =>
  r > 1e-4
    ? `M${f(16 - r)} 16A${f(r)} ${f(r)} 0 1 1 ${f(16 + r)} 16A${f(r)} ${f(r)} 0 1 1 ${f(16 - r)} 16Z`
    : '';

/**
 * subtract--filled's disc as Carbon draws it: four cubics with handles 7.6/14
 * of the radius (a true circle's are 0.5523), so it sits up to 0.07px inside
 * a circle on the diagonals. Drawn as exact arcs it misses parity at 20–24px.
 */
const SUBTRACT_HANDLE = 7.6 / 14;
function carbonDisc(r: number): string {
  if (r <= 1e-4) {
    return '';
  }
  const [a, b, c] = [f(16 - r), f(16 + r), r * SUBTRACT_HANDLE];
  const [m, n] = [f(16 - c), f(16 + c)];
  return `M16 ${a}C${m} ${a} ${a} ${m} ${a} 16C${a} ${n} ${m} ${b} 16 ${b}C${n} ${b} ${b} ${n} ${b} 16C${b} ${m} ${n} ${a} 16 ${a}Z`;
}

function toggle<S extends string>(
  name: string,
  states: readonly [S, S],
  statics: readonly [CarbonIcon, CarbonIcon],
  shapes: FillShapes,
  hover?: ToggleSpec<S>['hover']
) {
  return toggleIcon<S>(name, {
    states,
    statics,
    geo: ({ h, p, e }, size) => shapes(h, p, e, size),
    change: fillThenClear,
    hover,
  });
}

// ── Bookmark, Flag, Pin ──────────────────────────────────────────────────────
//
// The hover icons' own outlines (opsMisc: Bookmark's tail drops 3px, Flag's
// notched end reaches 3px right, Pin's head slides 3.26px along the needle).
// Each is Carbon's outline as an outer subpath and the inside as a hole; the
// fill is that hole (as the hover moves it) filled in from its centroid. The
// outline's outer edge is Carbon's filled drawing (Flag exactly; Bookmark's
// notch sits 0.05px lower than bookmark--filled's, Pin's points within
// 0.01px), and the filled hover icons move it by the same rule.

function holeFill(hover: HoverIconSpec, key: string, hole: number): FillShapes {
  return (h, p, e) => {
    const d = String(hover.geo({ h })[key].d);
    const inside = subpaths(d)[hole];
    const c = areaCentroid(inside);
    const r = reachOf(inside, c);
    return {
      [key]: {
        d: d + inFill(inside, polyD(inside), { c, rp: r * p, re: r * e }),
        ...EVENODD,
      },
    };
  };
}

export const BookmarkToggleSpec = /* @__PURE__ */ toggle(
  'BookmarkToggle',
  ['off', 'on'],
  [CBookmark, CBookmarkFilled],
  holeFill(BookmarkSpec, 'body', 0)
);
export const FlagToggleSpec = /* @__PURE__ */ toggle(
  'FlagToggle',
  ['off', 'on'],
  [CFlag, CFlagFilled],
  holeFill(FlagSpec, 'flag', 1)
);
export const PinToggleSpec = /* @__PURE__ */ toggle(
  'PinToggle',
  ['off', 'on'],
  [CPin, CPinFilled],
  holeFill(PinSpec, 'pin', 1)
);

// ── Filter ───────────────────────────────────────────────────────────────────
//
// Filter's funnel (static) and its hover wave (opsLast: a 2px wave slides in
// from the lower left, cut to the funnel's inside in two convex parts, the
// cone and the stem). The fill grows inside the funnel's hole; the wave is
// ink outside the fill and a knockout inside it, so in the filled state the
// wave slides through as a knockout (the FilterFilled hover).
//
// The wave's two parts overlap by 1px (y 17–18, where the stem part lies
// inside the cone part). In even-odd paths that overlap would cancel, so the
// stem part is trimmed to y ≥ 18 for the ink, and the knockout takes each
// part only inside its own half of the hole (cone above y 17.59, stem below).

const FILTER_HOLE: Pt[] = [
  [6, 6],
  [6, 9.59],
  [14, 17.59],
  [14, 26],
  [18, 26],
  [18, 17.59],
  [26, 9.59],
  [26, 6],
];
const HOLE_CONE: Pt[] = [
  [6, 6],
  [26, 6],
  [26, 9.59],
  [18, 17.59],
  [14, 17.59],
  [6, 9.59],
];
const HOLE_STEM: Pt[] = [
  [14, 17.59],
  [18, 17.59],
  [18, 26],
  [14, 26],
];
const STEM_BELOW: Pt[] = [
  [13, 18],
  [19, 18],
  [19, 27],
  [13, 27],
];
const FILTER_C = /* @__PURE__ */ areaCentroid(FILTER_HOLE);
// The wave's clip regions reach 1px into the walls; the disc covers them too.
const FILTER_REACH = /* @__PURE__ */ reachOf(
  [
    [5, 5],
    [27, 5],
    [27, 10],
    [19, 18],
    [19, 27],
    [13, 27],
    [13, 18],
    [5, 10],
  ],
  FILTER_C
);

/** Filter's wave as its [cone, stem] parts (either may be missing). */
function wavePieces(d: string): [Pt[] | null, Pt[] | null] {
  const parts = subpaths(d);
  if (parts.length >= 2) {
    return [parts[0], parts[1]];
  }
  if (parts.length === 0) {
    return [null, null];
  }
  // One part: the stem's reaches below the cone region (y 18); a lone part above it is the cone's.
  return Math.max(...parts[0].map(([, y]) => y)) > 18 + 1e-6
    ? [null, parts[0]]
    : [parts[0], null];
}

function filterShapes(h: number, p: number, e: number): Shapes {
  const { funnel, wave } = FilterSpec.geo({ h });
  const [cone, stem] = wavePieces(String(wave.d));
  const disc: Disc = {
    c: FILTER_C,
    rp: FILTER_REACH * p,
    re: FILTER_REACH * e,
  };
  const ink = [cone, stem && clipConvex(stem, STEM_BELOW)].filter(
    (pts): pts is Pt[] => !!pts && pts.length > 2
  );
  const knock = [
    cone && clipConvex(cone, HOLE_CONE),
    stem && clipConvex(stem, HOLE_STEM),
  ].filter((pts): pts is Pt[] => !!pts && pts.length > 2);
  return {
    funnel: {
      d:
        String(funnel.d) +
        inFill(FILTER_HOLE, polyD(FILTER_HOLE), disc) +
        knock.map((k) => inFill(k, polyD(k), disc)).join(''),
      ...EVENODD,
    },
    wave: {
      d: ink.map((w) => outsideFill(w, polyD(w), disc)).join(''),
      ...EVENODD,
    },
  };
}

export const FilterToggleSpec = /* @__PURE__ */ toggle(
  'FilterToggle',
  ['off', 'on'],
  [CFilter, CFilterFilled],
  filterShapes,
  FILTER_HOVER
);
/** Filter filled: the solid funnel with Filter's hover (the wave slides through it). */
export const FilterFilledSpec = /* @__PURE__ */ hoverIcon('FilterFilled', {
  hover: FILTER_HOVER,
  geo: ({ h }) => filterShapes(h, 1, 0),
  static: /* @__PURE__ */ carbonArt(FilterFilled32),
});

// ── Send alt ⇄ Not sent (on / off) ───────────────────────────────────────────
//
// Carbon's not-sent is send--alt's plane moved 2px down-left (−2, +2), under
// a strike, with its nib ending on the strike. The plane stays in not-sent's
// place in both states (the on state is send--alt moved there),
// so these are the standard Off toggles (utils/slashToggle, as Flash /
// Microphone / View off): on → off the strike draws in from its top-left end
// (160ms entrance) with Carbon's gap opening behind its head, the plane kicks
// 2px right and back, and the nib draws back to the strike; off → on the
// strike retracts (120ms exit), the plane recoils and the nib grows back.
// Constant line weight; no masks.
//
// Hover: on, Send alt's (opsMisc: the plane moves 2px up-right, from the
// shifted place, so it reaches send--alt's own position); off, Not
// sent's (the set-wide Off rule: the plane shrinks to 90% about (14.007, 18),
// the strike reaches 1px further each end). Send alt's hover runs on its own
// hover number, `send` (makeToggleIcon's `hovers`): toggled back on under the
// pointer, the plane stays at rest and only moves forward again after the
// pointer leaves and comes back; `h` drives Not sent's. The plane's centreline is tail
// A → tip R → tail B → notch N plus the nib N → E (opsMisc's Dart); filled,
// the nib is a slit through the solid plane (and the gap is Carbon's 3px, as
// the other filled Offs).

const STRIKE: Slash = {
  a: [2.701, 2.701],
  b: [29.297, 29.297],
  gapSide: -1,
  gap: 2,
};
const NOT_SENT: Dart = {
  A: PLANE.left,
  R: PLANE.right,
  B: PLANE.bottom,
  N: PLANE.inner,
  E: [16, 16],
};
const KEYS = ['A', 'R', 'B', 'N', 'E'] as const;

/** Where not-sent draws send--alt's plane: 2px down-left. Both states keep it there. */
const SHIFT: Pt = [-2, 2];

/**
 * The plane's centreline: send--alt moved to not-sent's place at p 0,
 * not-sent at p 1 (the same place; only the nib's end moves, back to the
 * strike, and A shifts 0.005), moved up-right by Send alt's hover `hOn`.
 */
function sendPlaneAt(p: number, hOn: number): Dart {
  const out = {} as Record<(typeof KEYS)[number], Pt>;
  for (const k of KEYS) {
    const [r, o, hv] = [ALT_REST[k], NOT_SENT[k], ALT_HOVER[k]];
    out[k] = [
      lerp(r[0] + SHIFT[0], o[0], p) + (hv[0] - r[0]) * hOn,
      lerp(r[1] + SHIFT[1], o[1], p) + (hv[1] - r[1]) * hOn,
    ];
  }
  return out;
}

/**
 * The Off spec at toggle progress p (the plane's move rides on p, as
 * micOffArt's `filledAt`). The plane is Carbon's own send--alt outline,
 * rebuilt about its moved centreline by opsMisc's `dart` (as the Send alt
 * hover is), so its walls hold their weight wherever the centreline goes.
 * slashShapes shrinks solids about the centre by k (the off hover), which
 * would thin those walls; Not sent's hover keeps them, so the plane is built
 * about the already-shrunk centreline and handed over pre-grown by 1/k.
 */
function sendAltOff(filled: boolean, p: number, k = 1): SlashToggleSpec {
  const [cx, cy] = PLANE_PIVOT;
  const about =
    (s: number) =>
    ([x, y]: Pt): Pt => [cx + (x - cx) * s, cy + (y - cy) * s];
  return {
    statics: filled ? [CSendAltFilled, CNotSentFilled] : [CSendAlt, CNotSent],
    // Carbon cuts its filled drawings with a 3px gap (2px for outlines).
    slash: filled ? { ...STRIKE, gap: 3 } : STRIKE,
    kick: [2, 0],
    centre: PLANE_PIVOT,
    base: (hOn) => {
      const pl = sendPlaneAt(p, hOn);
      const target = Object.fromEntries(
        KEYS.map((key) => [key, about(k)(pl[key])])
      ) as Dart;
      const d = dart(
        filled ? SEND_ALT_FILLED_D : SEND_ALT_D,
        ALT_REST,
        target
      )(1);
      // Outline: the outside and the hole (nib included) as even-odd polygons; filled: one polygon, slit included.
      return {
        strokes: [],
        solids: d
          .split(/(?=M)/)
          .map((sub) => pathPoints(sub, 0.05).map(about(1 / k))),
      };
    },
    solidRule: 'evenodd',
  };
}

const offToggle = (name: string, filled: boolean) =>
  toggleIcon<'on' | 'off'>(name, {
    states: ['on', 'off'],
    statics: sendAltOff(filled, 0).statics,
    geo: (fr) => {
      const spec = sendAltOff(filled, fr.p, 1 - OFF_SHRINK * fr.h * fr.p);
      // Send alt's hover on `send` (follows h outside the engine), fading as the strike draws.
      const send = (fr.send ?? fr.h) * (1 - fr.p);
      return slashShapes({ ...spec, base: () => spec.base(send) }, fr);
    },
    change: slashChange,
    hovers: { send: { holdAfter: 'on' } },
  });

export const SendAltOffOutlineToggleSpec = offToggle('SendAltOffToggle', false);
export const SendAltOffFilledToggleSpec = offToggle(
  'SendAltOffToggle(filled)',
  true
);
/** Send alt ⇄ Not sent; `filled` draws send--alt--filled ⇄ not-sent--filled. */
export const SendAltOffToggleSpec = /* @__PURE__ */ variantToggle(
  'SendAltOffToggle',
  (p: ToggleIconProps<'on' | 'off'>) =>
    p.filled ? SendAltOffFilledToggleSpec : SendAltOffOutlineToggleSpec
);

// ── Add / Subtract / Close, circled ──────────────────────────────────────────
//
// As CheckmarkToggle: the ring and the 2px sign of the outline icon
// (signs.ts; on hover the ring grows 2px in radius and each arm reaches 2px
// further at each end); the fill is a disc out to the ring's outer edge,
// Carbon's filled disc, with the sign knocked out of it. The sign shows
// outside the fill and inside the hole. At rest in the filled state the ring
// is hidden: its outer edge sits exactly on the disc's, and two anti-aliased
// edges on top of each other would darken the rim. Fully filled, Add's and
// Close's fill paths are their filled hover icons' paths exactly; Subtract's
// disc is drawn in subtract--filled's own (slightly flatter) form.

function circledSign(
  outline: HoverIconSpec,
  drawDisc: (r: number) => string = circle
): FillShapes {
  return (h, p, e) => {
    const { ring, sign } = outline.geo({ h });
    const signD = String(sign.d);
    const pts = pathPoints(signD);
    const R = 14 + 2 * h; // the ring's outer edge, and the filled icons' disc
    const disc: Disc = { c: [16, 16], rp: R * p, re: R * e };
    return {
      ring: { d: ring.d, opacity: p >= 1 && e <= 0 ? 0 : 1 },
      sign: { d: outsideFill(pts, signD, disc), ...EVENODD },
      fill: {
        d: drawDisc(R * p) + drawDisc(R * e) + inFill(pts, signD, disc),
        ...EVENODD,
      },
    };
  };
}

const subtractShapes = circledSign(SubtractAltSpec, carbonDisc);
/** Add alt ⇄ Add filled. */
export const AddToggleSpec = /* @__PURE__ */ toggle(
  'AddToggle',
  ['outline', 'filled'],
  [CAddAlt, CAddFilled],
  circledSign(AddAltSpec)
);
/** Subtract alt ⇄ Subtract filled. */
export const SubtractToggleSpec = /* @__PURE__ */ toggle(
  'SubtractToggle',
  ['outline', 'filled'],
  [CSubtractAlt, CSubtractFilled],
  subtractShapes
);
/** Subtract filled: on hover the disc grows and the bar reaches out at each end. */
export const SubtractFilledSpec = /* @__PURE__ */ hoverIcon('SubtractFilled', {
  geo: ({ h }) => subtractShapes(h, 1, 0),
  static: /* @__PURE__ */ carbonArt(SubtractFilled32),
});
/** Close outline ⇄ Close filled. */
export const CloseToggleSpec = /* @__PURE__ */ toggle(
  'CloseToggle',
  ['outline', 'filled'],
  [CCloseOutline, CCloseFilled],
  circledSign(CloseOutlineSpec)
);

// ── Unlocked ─────────────────────────────────────────────────────────────────
//
// As LockedToggle, open: the unlocked lock of LockedUnlockedToggle (its hover:
// the body scales 107.5% about (16, 10) and lifts 2px, the arch drops 1px,
// the leg retracts 2px), and the body's centreline rect fills from its
// centre. Fully filled, it's LockedUnlockedFilledToggle's unlocked lock.

function unlockedShapes(h: number, p: number, e: number): Shapes {
  const lock = LockedUnlockedOutlineToggleSpec.geo({ h, p: 1, e: 0 });
  const { x, y, width, height } = lock.body as Record<string, number>;
  const body: Pt[] = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ];
  return {
    fill: {
      d: discFillPath(body, [x + width / 2, y + height / 2], p, e),
      ...EVENODD,
    },
    ...lock,
  };
}

export const UnlockedToggleSpec = /* @__PURE__ */ toggle(
  'UnlockedToggle',
  ['off', 'on'],
  [CUnlocked, CUnlockedFilled],
  unlockedShapes
);
/** Unlocked filled: the filled drawing, with Unlocked's hover. */
export const UnlockedFilledSpec = /* @__PURE__ */ hoverIcon('UnlockedFilled', {
  geo: ({ h }) => unlockedShapes(h, 1, 0),
  static: /* @__PURE__ */ carbonArt(UnlockedFilled32),
});

// ── Radio button ─────────────────────────────────────────────────────────────
//
// The ring is CheckmarkOutlineToggle's unchecked end (radio-button; on hover
// it grows r 13 → 14). The fill is Carbon's centre dot (r 6): a disc from
// the centre; emptying, a hole from the centre. On hover the dot grows 20%
// with the ring, as the check does in CheckmarkOutline.

const DOT_R = 6;
const DOT_GROW = 0.2;

function radioShapes(h: number, p: number, e: number): Shapes {
  const { ring } = CheckmarkOutlineToggleSpec.geo({ h, p: 0, e: 0 });
  const r = DOT_R * (1 + DOT_GROW * h);
  return {
    ring: { d: ring.d },
    dot: { d: circle(r * p) + circle(r * e), ...EVENODD },
  };
}

export const RadioButtonToggleSpec = /* @__PURE__ */ toggle(
  'RadioButtonToggle',
  ['unchecked', 'checked'],
  [CRadioButton, CRadioButtonChecked],
  radioShapes
);
/** Radio button checked: the checked drawing, with Radio button's hover. */
export const RadioButtonCheckedSpec = /* @__PURE__ */ hoverIcon(
  'RadioButtonChecked',
  {
    geo: ({ h }) => radioShapes(h, 1, 0),
    static: /* @__PURE__ */ carbonArt(RadioButtonChecked32),
  }
);
