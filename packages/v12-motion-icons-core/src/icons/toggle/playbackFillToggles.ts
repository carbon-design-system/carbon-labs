/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Pause16 from '@carbon/icons/es/pause/16.js';
import Pause32 from '@carbon/icons/es/pause/32.js';
import PauseFilled32 from '@carbon/icons/es/pause--filled/32.js';
import PauseOutline16 from '@carbon/icons/es/pause--outline/16.js';
import PauseOutline32 from '@carbon/icons/es/pause--outline/32.js';
import PauseOutlineFilled16 from '@carbon/icons/es/pause--outline--filled/16.js';
import PauseOutlineFilled32 from '@carbon/icons/es/pause--outline--filled/32.js';
import Play16 from '@carbon/icons/es/play/16.js';
import Play32 from '@carbon/icons/es/play/32.js';
import PlayFilledAlt32 from '@carbon/icons/es/play--filled--alt/32.js';
import PlayOutline16 from '@carbon/icons/es/play--outline/16.js';
import PlayOutline32 from '@carbon/icons/es/play--outline/32.js';
import PlayOutlineFilled16 from '@carbon/icons/es/play--outline--filled/16.js';
import PlayOutlineFilled32 from '@carbon/icons/es/play--outline--filled/32.js';
import Recording32 from '@carbon/icons/es/recording/32.js';
import RecordingFilled32 from '@carbon/icons/es/recording--filled/32.js';
import SkipBack32 from '@carbon/icons/es/skip--back/32.js';
import SkipBackFilled32 from '@carbon/icons/es/skip--back--filled/32.js';
import SkipBackOutline32 from '@carbon/icons/es/skip--back--outline/32.js';
import SkipBackOutlineFilled32 from '@carbon/icons/es/skip--back--outline--filled/32.js';
import SkipBackSolidFilled32 from '@carbon/icons/es/skip--back--solid--filled/32.js';
import SkipForward32 from '@carbon/icons/es/skip--forward/32.js';
import SkipForwardFilled32 from '@carbon/icons/es/skip--forward--filled/32.js';
import SkipForwardOutline32 from '@carbon/icons/es/skip--forward--outline/32.js';
import SkipForwardOutlineFilled32 from '@carbon/icons/es/skip--forward--outline--filled/32.js';
import SkipForwardSolidFilled32 from '@carbon/icons/es/skip--forward--solid--filled/32.js';
import Stop16 from '@carbon/icons/es/stop/16.js';
import Stop32 from '@carbon/icons/es/stop/32.js';
import StopFilledAlt32 from '@carbon/icons/es/stop--filled--alt/32.js';
import StopOutline16 from '@carbon/icons/es/stop--outline/16.js';
import StopOutline32 from '@carbon/icons/es/stop--outline/32.js';
import StopOutlineFilled16 from '@carbon/icons/es/stop--outline--filled/16.js';
import StopOutlineFilled32 from '@carbon/icons/es/stop--outline--filled/32.js';
import {
  carbonArt,
  fillThenClear,
  hoverIcon,
  toggleIcon,
  type CarbonIcon,
  type Shapes,
} from '../../engine';
import {
  centroid,
  circlePts,
  clipConvex,
  discFillPath,
  insetPoly,
  pathPoints,
  polyPath,
  rectPath,
  roundedOutlinePath,
  roundedRectPath,
  type Pt,
} from '../../geometry';
import { EVENODD, lerp } from '../../paint';
import {
  C,
  disc,
  grow,
  outline16With,
  pauseBar16,
  playPause,
  ring,
  sq,
  stretch,
  STROKE,
  PAUSE_BIG_FILLED,
  PAUSE_BIG_OUTLINE,
  PAUSE_SMALL,
  PLAY_16,
  PLAY_BIG,
  PLAY_BIG_16,
  PLAY_OUTLINE_16,
  PLAY_SMALL,
  PLAY_SMALL_16,
  SKIP,
  SKIP_SMALL,
  PauseSpec,
  PauseFilledSpec,
  PauseOutlineSpec,
  PauseOutlineFilledSpec,
  PlayFilledAltSpec,
  PlayOutlineSpec,
  PlayOutlineFilledSpec,
  RecordingSpec,
  RecordingFilledSpec,
  SkipBackSpec,
  SkipBackFilledSpec,
  SkipBackOutlineSpec,
  SkipForwardSpec,
  SkipForwardFilledSpec,
  SkipForwardOutlineSpec,
  StopSpec,
  StopFilledAltSpec,
  StopOutlineSpec,
  StopOutlineFilledSpec,
  type Box,
} from '../controls/playback';

const CPause = /* @__PURE__ */ carbonArt(Pause16, Pause32);
const CPauseFilled = /* @__PURE__ */ carbonArt(PauseFilled32);
const CPauseOutline = /* @__PURE__ */ carbonArt(PauseOutline16, PauseOutline32);
const CPauseOutlineFilled = /* @__PURE__ */ carbonArt(
  PauseOutlineFilled16,
  PauseOutlineFilled32
);
const CPlay = /* @__PURE__ */ carbonArt(Play16, Play32);
const CPlayFilledAlt = /* @__PURE__ */ carbonArt(PlayFilledAlt32);
const CPlayOutline = /* @__PURE__ */ carbonArt(PlayOutline16, PlayOutline32);
const CPlayOutlineFilled = /* @__PURE__ */ carbonArt(
  PlayOutlineFilled16,
  PlayOutlineFilled32
);
const CRecording = /* @__PURE__ */ carbonArt(Recording32);
const CRecordingFilled = /* @__PURE__ */ carbonArt(RecordingFilled32);
const CSkipBack = /* @__PURE__ */ carbonArt(SkipBack32);
const CSkipBackFilled = /* @__PURE__ */ carbonArt(SkipBackFilled32);
const CSkipBackOutline = /* @__PURE__ */ carbonArt(SkipBackOutline32);
const CSkipBackOutlineFilled = /* @__PURE__ */ carbonArt(
  SkipBackOutlineFilled32
);
const CSkipForward = /* @__PURE__ */ carbonArt(SkipForward32);
const CSkipForwardFilled = /* @__PURE__ */ carbonArt(SkipForwardFilled32);
const CSkipForwardOutline = /* @__PURE__ */ carbonArt(SkipForwardOutline32);
const CSkipForwardOutlineFilled = /* @__PURE__ */ carbonArt(
  SkipForwardOutlineFilled32
);
const CStop = /* @__PURE__ */ carbonArt(Stop16, Stop32);
const CStopFilledAlt = /* @__PURE__ */ carbonArt(StopFilledAlt32);
const CStopOutline = /* @__PURE__ */ carbonArt(StopOutline16, StopOutline32);
const CStopOutlineFilled = /* @__PURE__ */ carbonArt(
  StopOutlineFilled16,
  StopOutlineFilled32
);

/**
 * Outline ↔ filled toggles for the playback family: Play, Pause, Stop,
 * Skip back / forward (bare and in a circle) and Recording.
 *
 * Toggle (all): the house disc fill (§7.7). A disc grows from the shape's
 * centroid, clipped to the shape's inside (its centreline), in 160ms on the
 * entrance ease; to empty it, a hole grows from the same centre in 120ms on
 * the exit ease (`fillThenClear`). Two separate shapes (the pause bars) each
 * fill from their own centre at once. In a circle, the circle is the shape:
 * the disc grows from its centre to the ring's centreline, and the glyph
 * inside shares the fill's even-odd path, so it turns into Carbon's knockout
 * as the fill passes it (the CheckmarkToggle pattern). No masks.
 *
 * Hover (either state): the playback family's hovers, unchanged.
 * At rest in either state the toggle paints that state's hover icon's own
 * shapes (`o-*` outline, `f-*` filled, from the same geometry functions), so
 * both ends equal those hover icons at every h and size by construction;
 * the fill's shapes (`m-*`) take over only while `p`/`e` are moving, and meet
 * those drawings at both ends.
 *
 * Where Carbon's filled drawing isn't the outline filled in, the outline
 * settles onto it as the fill comes in (and back as the hole opens):
 * - pause--filled's bars are 6 wide (outline: 8), so each bar's outer wall
 *   moves 2px in;
 * - skip--*--outline--filled's knocked-out bar sits 1px further out than
 *   skip--*--outline's bar;
 * - at 16px, play and pause have their own outline drawings but play--filled
 *   --alt and pause--filled don't, so the 16px outline eases onto the 32px
 *   centreline (as Light and View do).
 */

type Ends = (h: number, size?: number) => Shapes;
/** A hover icon's geometry as an end state. */
const ends =
  (icon: { geo: (f: { h: number }, size?: number) => Shapes }): Ends =>
  (h, size) =>
    icon.geo({ h }, size);
type Motion = (h: number, p: number, e: number, size?: number) => Shapes;

/** Every shape under `prefix`, painted or (d '') not. */
function tag(prefix: string, shapes: Shapes, show: boolean): Shapes {
  const out: Shapes = {};
  for (const k in shapes) {
    out[`${prefix}-${k}`] = show ? shapes[k] : { ...shapes[k], d: '' };
  }
  return out;
}

/* @__NO_SIDE_EFFECTS__ */
function fillToggle(
  name: string,
  statics: readonly [CarbonIcon, CarbonIcon],
  outline: Ends,
  filled: Ends,
  motion: Motion
) {
  return toggleIcon<'outline' | 'filled'>(name, {
    states: ['outline', 'filled'],
    statics,
    geo: ({ h, p, e }, size) => {
      const atOutline = p <= 0 && e <= 0;
      const atFilled = p >= 1 && e <= 0;
      return {
        ...tag('o', outline(h, size), atOutline),
        ...tag('f', filled(h, size), atFilled),
        ...tag('m', motion(h, p, e, size), !atOutline && !atFilled),
      };
    },
    change: fillThenClear,
  });
}

/** How far a drawing has settled onto the filled one: in with the fill, back out with the hole. */
const settle = (p: number, e: number) => p * (1 - e);

// ── Knockouts in a circle ────────────────────────────────────────────────────
//
// A glyph part is a polygon `outer`, less an optional `inner` polygon (a
// stroked outline's band). The fill (F) and its hole (H) are discs about the
// circle's centre. In one even-odd path each:
//   glyph = part + (part ∩ F) + (part ∩ H)   → shows outside F, and inside H
//   fill  = F + H + (part ∩ F) + (part ∩ H)  → F less H, with the part knocked out
// so a band's middle (inside `inner`) fills with the disc, as Carbon's do.

type Part = { outer: readonly Pt[]; inner?: readonly Pt[] };
const SEG = 128;

const poly = (pts: readonly Pt[]) =>
  pts.length > 2 ? polyPath(pts, true) : '';
/** `pts` inside the disc of radius r about the centre (nothing at r ≤ 0). */
const inDisc = (pts: readonly Pt[], r: number) =>
  r > 1e-4 ? poly(clipConvex(pts, circlePts(C, r, SEG))) : '';
const discD = (r: number) => (r > 1e-4 ? poly(circlePts(C, r, SEG)) : '');
/** A part's polygons inside discs of radius F and H. */
const cuts = (parts: readonly Part[], F: number, H: number) =>
  parts
    .map(
      ({ outer, inner = [] }) =>
        inDisc(outer, F) +
        inDisc(inner, F) +
        inDisc(outer, H) +
        inDisc(inner, H)
    )
    .join('');

/** The ring, the glyph's parts and the disc fill, at fill p and hole e. */
function circleFill(
  h: number,
  p: number,
  e: number,
  parts: readonly Part[]
): Shapes {
  const r = 13 + h; // the ring's centreline
  const [F, H] = [r * p, r * e];
  const knock = cuts(parts, F, H);
  return {
    ring: ring(h),
    glyph: {
      d:
        parts
          .map(({ outer, inner = [] }) => poly(outer) + poly(inner))
          .join('') + knock,
      ...EVENODD,
    },
    fill: { d: discD(F) + discD(H) + knock, ...EVENODD },
  };
}

/** A stroked convex polygon's 2px band: its round-joined outer edge less its sharp inner one. */
const band = (centreline: readonly Pt[]): Part => ({
  outer: pathPoints(roundedOutlinePath(centreline, 1), 0.1),
  inner: insetPoly(centreline, 1),
});
const boxPts = ([x0, y0, x1, y1]: Box): Pt[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
const boxCentre = ([x0, y0, x1, y1]: Box): Pt => [(x0 + x1) / 2, (y0 + y1) / 2];

// ── Play ⇄ play--filled--alt ─────────────────────────────────────────────────
//
// The triangle (2px centreline, round joins) fills from its centroid. Hover:
// it grows 10% about its centroid (PlayPauseToggle's play end, the frame
// version of Play). At 16px the outline is Carbon's 16px drawing, whose
// corners ride its centreline; that centreline eases onto the 32px one with
// the fill, since play--filled--alt has no 16px drawing.

function playMotion(h: number, p: number, e: number, size?: number): Shapes {
  if (size === 16) {
    const k = settle(p, e);
    const line16 = grow(PLAY_BIG_16, h);
    const line = line16.map(
      (q, i) =>
        [
          lerp(q[0], grow(PLAY_BIG, h)[i][0], k),
          lerp(q[1], grow(PLAY_BIG, h)[i][1], k),
        ] as const
    );
    // Carbon's 16px corners (doubled into the 32 grid) move rigidly with their vertex.
    const move = (i: number, [x, y]: Pt): Pt => [
      2 * x + line[i][0] - PLAY_BIG_16[i][0],
      2 * y + line[i][1] - PLAY_BIG_16[i][1],
    ];
    return {
      tri: { d: outline16With(PLAY_16, move), ...EVENODD },
      fill: { d: discFillPath(line, centroid(line), p, e), ...EVENODD },
    };
  }
  const t = grow(PLAY_BIG, h);
  return {
    tri: { d: polyPath(t, true), ...STROKE },
    fill: { d: discFillPath(t, centroid(t), p, e), ...EVENODD },
  };
}
export const PlayToggleSpec = /* @__PURE__ */ fillToggle(
  'PlayToggle',
  [CPlay, CPlayFilledAlt],
  (h, size) => playPause('outline', h, 0, size),
  ends(PlayFilledAltSpec),
  playMotion
);

// ── Play outline ⇄ play--outline--filled ─────────────────────────────────────
//
// The disc fills the circle; the triangle's 2px band becomes the knockout and
// its middle fills with the disc. Hover: the ring grows 1px and the triangle
// 10% about its centroid. At 16px the band is Carbon's 16px outline, its
// corners riding the centreline (play--outline--filled has a 16px drawing
// too, which the filled end shows at rest).

function playOutlineMotion(
  h: number,
  p: number,
  e: number,
  size?: number
): Shapes {
  if (size === 16) {
    const line = grow(PLAY_SMALL_16, h);
    const move = (i: number, [x, y]: Pt): Pt => [
      2 * x + line[i][0] - PLAY_SMALL_16[i][0],
      2 * y + line[i][1] - PLAY_SMALL_16[i][1],
    ];
    const outer = pathPoints(
      outline16With({ corners: PLAY_OUTLINE_16.corners }, move),
      0.1
    );
    const inner = PLAY_OUTLINE_16.inner!.map((q, i) => move(i, q));
    return circleFill(h, p, e, [{ outer, inner }]);
  }
  return circleFill(h, p, e, [band(grow(PLAY_SMALL, h))]);
}
export const PlayOutlineToggleSpec = /* @__PURE__ */ fillToggle(
  'PlayOutlineToggle',
  [CPlayOutline, CPlayOutlineFilled],
  ends(PlayOutlineSpec),
  ends(PlayOutlineFilledSpec),
  playOutlineMotion
);

// ── Pause ⇄ pause--filled ────────────────────────────────────────────────────
//
// Each bar (2px centreline, r 1) fills from its own centre, both at once.
// pause--filled's bars are 6 wide where pause's are 8, so each bar's outer
// wall moves 2px in as it fills (the 2px wall holds). Hover: the bars stretch
// 2px at each end. At 16px the bars are Carbon's 16px outlines.

/** Bar i's centreline: the outline's, settled `k` of the way onto pause--filled's (its solid box less 1). */
function pauseBox(i: number, h: number, k: number): Box {
  const [o, s] = [PAUSE_BIG_OUTLINE[i], PAUSE_BIG_FILLED[i]];
  const solid = [s[0] + 1, s[1] + 1, s[2] - 1, s[3] - 1];
  return stretch(o.map((v, j) => lerp(v, solid[j], k)) as Box, 2 * h);
}

function pauseMotion(h: number, p: number, e: number, size?: number): Shapes {
  const boxes = [0, 1].map((i) => pauseBox(i, h, settle(p, e)));
  const bar = (b: Box) =>
    size === 16
      ? { d: pauseBar16(b), ...EVENODD }
      : { d: roundedRectPath(...b, 1), ...STROKE };
  return {
    bar0: bar(boxes[0]),
    bar1: bar(boxes[1]),
    fill: {
      d: boxes.map((b) => discFillPath(boxPts(b), boxCentre(b), p, e)).join(''),
      ...EVENODD,
    },
  };
}
export const PauseToggleSpec = /* @__PURE__ */ fillToggle(
  'PauseToggle',
  [CPause, CPauseFilled],
  ends(PauseSpec),
  ends(PauseFilledSpec),
  pauseMotion
);

// ── Pause outline ⇄ pause--outline--filled ───────────────────────────────────
//
// The disc fills the circle and the two solid bars become knockouts as it
// passes. Hover: the ring grows 1px, the bars stretch 2px at each end.

const pauseOutlineMotion = (h: number, p: number, e: number): Shapes =>
  circleFill(
    h,
    p,
    e,
    PAUSE_SMALL.map((b) => ({ outer: boxPts(stretch(b, 2 * h)) }))
  );
export const PauseOutlineToggleSpec = /* @__PURE__ */ fillToggle(
  'PauseOutlineToggle',
  [CPauseOutline, CPauseOutlineFilled],
  ends(PauseOutlineSpec),
  ends(PauseOutlineFilledSpec),
  pauseOutlineMotion
);

// ── Stop ⇄ stop--filled--alt ─────────────────────────────────────────────────
//
// The square (2px centreline, r 1) fills from its centre. Hover: it grows
// 1.2px per side.

function stopMotion(h: number, p: number, e: number): Shapes {
  const s = 9 + 1.2 * h;
  const box: Box = [16 - s, 16 - s, 16 + s, 16 + s];
  return {
    square: { d: roundedRectPath(...box, 1), ...STROKE },
    fill: { d: discFillPath(boxPts(box), C, p, e), ...EVENODD },
  };
}
export const StopToggleSpec = /* @__PURE__ */ fillToggle(
  'StopToggle',
  [CStop, CStopFilledAlt],
  ends(StopSpec),
  ends(StopFilledAltSpec),
  stopMotion
);

// ── Stop outline ⇄ stop--outline--filled ─────────────────────────────────────
//
// The disc fills the circle; the square's 2px band (outer r 2, inner sharp)
// becomes the knockout and its middle fills. Hover: the ring and the square
// grow 1px.

const stopOutlineMotion = (h: number, p: number, e: number): Shapes => {
  const s = 4 + h; // the band's inner half-side
  return circleFill(h, p, e, [
    {
      outer: pathPoints(sq(s + 2, 2), 0.1),
      inner: boxPts([16 - s, 16 - s, 16 + s, 16 + s]),
    },
  ]);
};
export const StopOutlineToggleSpec = /* @__PURE__ */ fillToggle(
  'StopOutlineToggle',
  [CStopOutline, CStopOutlineFilled],
  ends(StopOutlineSpec),
  ends(StopOutlineFilledSpec),
  stopOutlineMotion
);

// ── Skip back / forward ⇄ filled ─────────────────────────────────────────────
//
// The triangle (2px centreline, round joins) fills from its centroid; the
// bar is solid in both. Hover: the bar stretches 2px at each end and the
// triangle nudges 2px toward it.

function skipMotion(which: 'back' | 'forward') {
  const s = SKIP[which];
  return (h: number, p: number, e: number): Shapes => {
    const tri = s.tri.map(([x, y]) => [x + 2 * h * s.dir, y] as const);
    return {
      tri: { d: polyPath(tri, true), ...STROKE },
      bar: { d: rectPath(...stretch(s.bar, 2 * h)) },
      fill: { d: discFillPath(tri, centroid(tri), p, e), ...EVENODD },
    };
  };
}
export const SkipBackToggleSpec = /* @__PURE__ */ fillToggle(
  'SkipBackToggle',
  [CSkipBack, CSkipBackFilled],
  ends(SkipBackSpec),
  ends(SkipBackFilledSpec),
  skipMotion('back')
);
export const SkipForwardToggleSpec = /* @__PURE__ */ fillToggle(
  'SkipForwardToggle',
  [CSkipForward, CSkipForwardFilled],
  ends(SkipForwardSpec),
  ends(SkipForwardFilledSpec),
  skipMotion('forward')
);

// ── Skip back / forward outline ⇄ outline--filled ────────────────────────────
//
// The disc fills the circle; the triangle's band and the bar become
// knockouts, the triangle's middle fills. Carbon's filled drawing sets the
// bar 1px further from the triangle (back: x 8–10, outline 9–11), so the bar
// moves 1px out as the fill comes in. Hover (as skip--*--outline): the ring
// grows 1px and the bar stretches 2px at each end; nothing moves sideways.

/** The bar at hover h, settled `k` of the way onto the filled drawing's. */
function skipOutlineBar(which: 'back' | 'forward', h: number, k: number): Box {
  const { bar, dir } = SKIP_SMALL[which];
  return stretch([bar[0] + dir * k, bar[1], bar[2] + dir * k, bar[3]], 2 * h);
}

function skipOutlineMotion(which: 'back' | 'forward') {
  const tri = SKIP_SMALL[which].tri;
  const triBand = band(tri);
  return (h: number, p: number, e: number): Shapes =>
    circleFill(h, p, e, [
      triBand,
      { outer: boxPts(skipOutlineBar(which, h, settle(p, e))) },
    ]);
}

/** skip--*--outline--filled: a disc less the triangle's outline and the bar, the triangle's middle filled back in. */
function skipOutlineFilled(which: 'back' | 'forward', h: number): Shapes {
  const tri = SKIP_SMALL[which].tri;
  return {
    disc: {
      d:
        disc(14 + h) +
        roundedOutlinePath(tri, 1) +
        rectPath(...skipOutlineBar(which, h, 1)),
      ...EVENODD,
    },
    inner: { d: polyPath(insetPoly(tri, 1), true) },
  };
}

/** Skip back outline filled: the filled end of the skip-back outline toggle, with the same hover. */
export const SkipBackOutlineFilledSpec = /* @__PURE__ */ hoverIcon(
  'SkipBackOutlineFilled',
  {
    geo: ({ h }) => skipOutlineFilled('back', h),
    static: /* @__PURE__ */ carbonArt(SkipBackOutlineFilled32),
  }
);
export const SkipForwardOutlineFilledSpec = /* @__PURE__ */ hoverIcon(
  'SkipForwardOutlineFilled',
  {
    geo: ({ h }) => skipOutlineFilled('forward', h),
    static: /* @__PURE__ */ carbonArt(SkipForwardOutlineFilled32),
  }
);

/** skip--*--solid--filled: the same disc with the whole triangle knocked out (no middle); the same hover. */
function skipSolidFilled(which: 'back' | 'forward', h: number): Shapes {
  return { disc: skipOutlineFilled(which, h).disc };
}
export const SkipBackSolidFilledSpec = /* @__PURE__ */ hoverIcon(
  'SkipBackSolidFilled',
  {
    geo: ({ h }) => skipSolidFilled('back', h),
    static: /* @__PURE__ */ carbonArt(SkipBackSolidFilled32),
  }
);
export const SkipForwardSolidFilledSpec = /* @__PURE__ */ hoverIcon(
  'SkipForwardSolidFilled',
  {
    geo: ({ h }) => skipSolidFilled('forward', h),
    static: /* @__PURE__ */ carbonArt(SkipForwardSolidFilled32),
  }
);

export const SkipBackOutlineToggleSpec = /* @__PURE__ */ fillToggle(
  'SkipBackOutlineToggle',
  [CSkipBackOutline, CSkipBackOutlineFilled],
  /* @__PURE__ */ ends(SkipBackOutlineSpec),
  /* @__PURE__ */ ends(SkipBackOutlineFilledSpec),
  /* @__PURE__ */ skipOutlineMotion('back')
);
export const SkipForwardOutlineToggleSpec = /* @__PURE__ */ fillToggle(
  'SkipForwardOutlineToggle',
  [CSkipForwardOutline, CSkipForwardOutlineFilled],
  /* @__PURE__ */ ends(SkipForwardOutlineSpec),
  /* @__PURE__ */ ends(SkipForwardOutlineFilledSpec),
  /* @__PURE__ */ skipOutlineMotion('forward')
);

// ── Recording ⇄ recording--filled ────────────────────────────────────────────
//
// The disc fills the circle; the inner ring (r 4–6) becomes the knockout
// around a solid dot. Hover: the ring and the inner ring grow 1px.

const recordingMotion = (h: number, p: number, e: number): Shapes =>
  circleFill(h, p, e, [
    { outer: circlePts(C, 6 + h, SEG), inner: circlePts(C, 4 + h, SEG) },
  ]);
export const RecordingToggleSpec = /* @__PURE__ */ fillToggle(
  'RecordingToggle',
  [CRecording, CRecordingFilled],
  ends(RecordingSpec),
  ends(RecordingFilledSpec),
  recordingMotion
);
