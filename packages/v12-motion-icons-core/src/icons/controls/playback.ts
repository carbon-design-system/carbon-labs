/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PlayOutlineFilled16 from '@carbon/icons/es/play--outline--filled/16.js';
import PlayOutlineFilled32 from '@carbon/icons/es/play--outline--filled/32.js';
import Stop16 from '@carbon/icons/es/stop/16.js';
import Stop32 from '@carbon/icons/es/stop/32.js';
import StopFilledAlt32 from '@carbon/icons/es/stop--filled--alt/32.js';
import SkipBack32 from '@carbon/icons/es/skip--back/32.js';
import SkipBackFilled32 from '@carbon/icons/es/skip--back--filled/32.js';
import SkipBackOutline32 from '@carbon/icons/es/skip--back--outline/32.js';
import SkipBackOutlineSolid32 from '@carbon/icons/es/skip--back--outline--solid/32.js';
import SkipForward32 from '@carbon/icons/es/skip--forward/32.js';
import SkipForwardFilled32 from '@carbon/icons/es/skip--forward--filled/32.js';
import SkipForwardOutline32 from '@carbon/icons/es/skip--forward--outline/32.js';
import SkipForwardOutlineSolid32 from '@carbon/icons/es/skip--forward--outline--solid/32.js';
import PauseFilled32 from '@carbon/icons/es/pause--filled/32.js';
import Pause16 from '@carbon/icons/es/pause/16.js';
import Pause32 from '@carbon/icons/es/pause/32.js';
import PauseOutline16 from '@carbon/icons/es/pause--outline/16.js';
import PauseOutline32 from '@carbon/icons/es/pause--outline/32.js';
import PauseOutlineFilled16 from '@carbon/icons/es/pause--outline--filled/16.js';
import PauseOutlineFilled32 from '@carbon/icons/es/pause--outline--filled/32.js';
import Play16 from '@carbon/icons/es/play/16.js';
import Play32 from '@carbon/icons/es/play/32.js';
import PlayFilled16 from '@carbon/icons/es/play--filled/16.js';
import PlayFilled32 from '@carbon/icons/es/play--filled/32.js';
import PlayFilledAlt32 from '@carbon/icons/es/play--filled--alt/32.js';
import PlayOutline16 from '@carbon/icons/es/play--outline/16.js';
import PlayOutline32 from '@carbon/icons/es/play--outline/32.js';
import Recording32 from '@carbon/icons/es/recording/32.js';
import RecordingFilled32 from '@carbon/icons/es/recording--filled/32.js';
import RecordingFilledAlt32 from '@carbon/icons/es/recording--filled--alt/32.js';
import StopFilled16 from '@carbon/icons/es/stop--filled/16.js';
import StopFilled32 from '@carbon/icons/es/stop--filled/32.js';
import StopOutline16 from '@carbon/icons/es/stop--outline/16.js';
import StopOutline32 from '@carbon/icons/es/stop--outline/32.js';
import StopOutlineFilled16 from '@carbon/icons/es/stop--outline--filled/16.js';
import StopOutlineFilled32 from '@carbon/icons/es/stop--outline--filled/32.js';
import {
  carbonArt,
  hoverIcon,
  toggleIcon,
  variantToggle,
  TOGGLE_IN,
  type CarbonIcon,
  type Shapes,
  type VariantProps,
  type ToggleIconProps,
  withStatic,
} from '../../engine';
import { ENTRANCE, EXIT } from '../../ease';
import {
  centroid,
  insetPoly,
  polyPath,
  rectPath,
  ringPath,
  roundedOutlinePath,
  roundedRectPath,
  scalePts,
  type Pt,
} from '../../geometry';
import { EVENODD, f, lerp } from '../../paint';

const CPauseFilled = /* @__PURE__ */ carbonArt(PauseFilled32);
const CPause = /* @__PURE__ */ carbonArt(Pause16, Pause32);
const CPauseOutline = /* @__PURE__ */ carbonArt(PauseOutline16, PauseOutline32);
const CPauseOutlineFilled = /* @__PURE__ */ carbonArt(
  PauseOutlineFilled16,
  PauseOutlineFilled32
);
const CPlay = /* @__PURE__ */ carbonArt(Play16, Play32);
const CPlayFilled = /* @__PURE__ */ carbonArt(PlayFilled16, PlayFilled32);
const CPlayFilledAlt = /* @__PURE__ */ carbonArt(PlayFilledAlt32);
const CPlayOutline = /* @__PURE__ */ carbonArt(PlayOutline16, PlayOutline32);
const CRecording = /* @__PURE__ */ carbonArt(Recording32);
const CRecordingFilled = /* @__PURE__ */ carbonArt(RecordingFilled32);
const CRecordingFilledAlt = /* @__PURE__ */ carbonArt(RecordingFilledAlt32);
const CStopFilled = /* @__PURE__ */ carbonArt(StopFilled16, StopFilled32);
const CStopOutline = /* @__PURE__ */ carbonArt(StopOutline16, StopOutline32);
const CStopOutlineFilled = /* @__PURE__ */ carbonArt(
  StopOutlineFilled16,
  StopOutlineFilled32
);

/**
 * Carbon's playback controls (no reference animations). One vocabulary for the whole family:
 *
 * Hover
 * - Play triangles grow 10% about their centroid (as Play).
 * - Pause bars stretch 2px at top and bottom.
 * - Stop squares grow 1.2px per side (1px inside a circle).
 * - Recording dots/rings grow 1px.
 * - Skip bars stretch 2px at top and bottom; outside a circle the triangle
 *   also nudges 2px toward the bar, inside one nothing else moves.
 * - Rings and discs around any of these grow 1px (as the
 *   checkmark ring does).
 * Every change is geometry, so 2px lines and knockouts keep their weight.
 *
 * Toggles (160ms both ways; neither state is "off")
 * - Play ↔ Pause is a match cut: the outgoing glyph shrinks (pause bars lose
 *   4px at each end; the triangle shrinks about its centroid to the same
 *   height), then the incoming glyph appears at that small size and grows
 *   to full. Exit ease to the cut at 6/15, entrance ease after; played
 *   backwards for pause → play. Line weights stay constant throughout.
 * - Recording ↔ Stop is the same match cut on the centre shape: the outgoing
 *   dot/ring (or square) shrinks 3px per side toward the centre, then the
 *   incoming one appears at that small size and grows to full. The ring or disc around it
 *   holds; a stroked centre keeps its 2px line, and a knockout's hole stays
 *   2px outside its dot, so the gap between them holds too.
 *
 * Knockout ("filled circle") variants are one even-odd path: the disc plus
 * each hole. No masks.
 */

export const C: Pt = [16, 16];
const shift = (pts: readonly Pt[], dx: number): Pt[] =>
  pts.map(([x, y]) => [x + dx, y] as const);
export const disc = (r: number) =>
  `M${C[0] - r} ${C[1]}A${r} ${r} 0 1 0 ${C[0] + r} ${C[1]}A${r} ${r} 0 1 0 ${C[0] - r} ${C[1]}Z`;
export const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinejoin: 'round',
} as const;
const FILLED_STROKE = {
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinejoin: 'round',
} as const;

/** Ring (r 13 ± 1) or disc (r 14), each growing 1px with hover. */
export const ring = (h: number) => ({ d: ringPath(C, 13 + h, 2) });

// ── Glyph geometry ───────────────────────────────────────────────────────────
// Centrelines (2px strokes) or solid shapes, taken from Carbon's paths.

export const PLAY_BIG: Pt[] = [
  [7, 5],
  [7, 27],
  [27, 16],
];
export const PLAY_SMALL: Pt[] = [
  [11, 10],
  [11, 22],
  [23, 16],
];
// Carbon draws both triangles differently at 16px; these are those
// drawings' best-fit centrelines, doubled into the 32-unit grid. The
// triangles themselves are drawn from Carbon's 16px outlines (below): their
// lines aren't uniform and their corners are their own curves.
export const PLAY_BIG_16: Pt[] = [
  [7, 5.0052],
  [7, 27.1632],
  [26.1364, 16.0842],
];
export const PLAY_SMALL_16: Pt[] = [
  [12, 9.9773],
  [12, 21.8727],
  [22.9042, 15.925],
];
export const grow = (tri: readonly Pt[], h: number) =>
  scalePts(tri, centroid(tri), 1 + 0.1 * h);

// ── Carbon's 16px outlines ───────────────────────────────────────────────────
//
// Each 16px triangle is Carbon's own outline: its corners (each a run of
// cubics, from where it leaves one edge to where it meets the next) and, for
// the outlined ones, its inner triangle, in Carbon's 16-unit grid and in
// centreline order (top left, bottom left, tip). Growing or shrinking the
// triangle by σ moves each corner (and its inner vertex) rigidly with its
// centreline vertex, so every line keeps Carbon's weight.

type Cubic = readonly [Pt, Pt, Pt];
type Corner = { start: Pt; curves: readonly Cubic[] };
export type Outline16 = { corners: readonly Corner[]; inner?: readonly Pt[] };

const TIP_SMALL: Corner = {
  start: [11.7, 7.6],
  curves: [
    [
      [12, 7.7],
      [12.1, 8],
      [11.9, 8.2],
    ],
    [
      [11.9, 8.3],
      [11.8, 8.4],
      [11.7, 8.4],
    ],
  ],
};
const TOP_SMALL: Corner = {
  start: [5.5, 5],
  curves: [
    [
      [5.5, 4.8],
      [5.6, 4.7],
      [5.7, 4.6],
    ],
    [
      [5.9, 4.5],
      [6, 4.5],
      [6.2, 4.6],
    ],
  ],
};
/** 16/play.svg */
export const PLAY_16: Outline16 = {
  corners: [
    {
      start: [3, 2.5],
      curves: [
        [
          [3, 2.3],
          [3.1, 2.2],
          [3.2, 2.1],
        ],
        [
          [3.4, 2],
          [3.6, 2],
          [3.8, 2.1],
        ],
      ],
    },
    {
      start: [3.8, 14],
      curves: [
        [
          [3.7, 14],
          [3.6, 14],
          [3.5, 14],
        ],
        [
          [3.2, 14],
          [3, 13.8],
          [3, 13.5],
        ],
      ],
    },
    {
      start: [13.3, 7.6],
      curves: [
        [
          [13.5, 7.7],
          [13.6, 8],
          [13.5, 8.3],
        ],
        [
          [13.5, 8.4],
          [13.4, 8.4],
          [13.3, 8.5],
        ],
      ],
    },
  ],
  inner: [
    [4, 3.4],
    [4, 12.7],
    [12, 8],
  ],
};
/** 16/play--outline.svg */
export const PLAY_OUTLINE_16: Outline16 = {
  corners: [
    TOP_SMALL,
    {
      start: [6.2, 11.4],
      curves: [
        [
          [6.2, 11.5],
          [6.1, 11.5],
          [6, 11.5],
        ],
        [
          [5.9, 11.5],
          [5.8, 11.5],
          [5.7, 11.4],
        ],
        [
          [5.5, 11.3],
          [5.5, 11.1],
          [5.5, 11],
        ],
      ],
    },
    TIP_SMALL,
  ],
  inner: [
    [6.5, 5.8],
    [6.5, 10.1],
    [10.5, 7.9],
  ],
};
/** The hole in 16/play--filled.svg and 16/play--outline--filled.svg. */
const PLAY_HOLE_16: Outline16 = {
  corners: [
    TOP_SMALL,
    {
      start: [6.2, 11.4],
      curves: [
        [
          [6, 11.5],
          [5.9, 11.5],
          [5.7, 11.4],
        ],
        [
          [5.5, 11.3],
          [5.5, 11.1],
          [5.5, 11],
        ],
      ],
    },
    TIP_SMALL,
  ],
};
/** play--outline--filled's filled-in middle (not quite the outline's inner triangle). */
const PLAY_MIDDLE_16: Pt[] = [
  [6.5, 5.8],
  [6.5, 10.2],
  [10.5, 8],
];

const pt = ([x, y]: Pt) => `${f(x)} ${f(y)}`;
/** Drawing order round each outline: bottom left, top left, tip (clockwise on screen, as Carbon draws them). */
const ORDER = [1, 0, 2];

/**
 * Corner k's points at scale σ about the centreline's centroid: doubled into
 * the 32-unit grid, then moved with centreline vertex k.
 */
function corners16(line: readonly Pt[], sigma: number) {
  const c = centroid(line);
  return (k: number, [x, y]: Pt): Pt => [
    2 * x + (sigma - 1) * (line[k][0] - c[0]),
    2 * y + (sigma - 1) * (line[k][1] - c[1]),
  ];
}
/** The outline (and its inner triangle, as an even-odd hole) at scale σ. */
function outline16(art: Outline16, line: readonly Pt[], sigma: number): string {
  return outline16With(art, corners16(line, sigma));
}
/** The outline (and its inner triangle) with each corner k's points mapped by `move(k, point)`. */
export function outline16With(
  art: Outline16,
  move: (k: number, q: Pt) => Pt
): string {
  const outer = ORDER.map((k) => {
    const cn = art.corners[k];
    return `${pt(move(k, cn.start))}${cn.curves.map((cv) => `C${cv.map((q) => pt(move(k, q))).join(' ')}`).join('')}`;
  });
  const inner = art.inner
    ? `M${art.inner.map((q, k) => pt(move(k, q))).join('L')}Z`
    : '';
  return `M${outer.join('L')}Z${inner}`;
}

export type Box = [number, number, number, number];
export const PAUSE_BIG_OUTLINE: Box[] = [
  [7, 7, 13, 25],
  [19, 7, 25, 25],
]; // centreline, r=1, stroked
export const PAUSE_BIG_FILLED: Box[] = [
  [8, 6, 14, 26],
  [18, 6, 24, 26],
]; // solid, r=2
export const PAUSE_SMALL: Box[] = [
  [12, 10, 14, 22],
  [18, 10, 20, 22],
]; // solid
/** A bar stretched (d > 0) or shrunk (d < 0) at both ends. */
export const stretch = ([x0, y0, x1, y1]: Box, d: number): Box => [
  x0,
  y0 - d,
  x1,
  y1 + d,
];
/**
 * 16/pause.svg's bar around a centreline box: Carbon's outline (its corners
 * a touch squarer than round: 0.6 handles at r 1px) less the inner
 * rectangle, as one even-odd path. Stretching moves the ends, so the line
 * keeps its weight.
 */
export function pauseBar16([x0, y0, x1, y1]: Box): string {
  const [a, b, c, d] = [x0 - 1, y0 - 1, x1 + 1, y1 + 1].map(f);
  const [r, k] = [2, 0.8]; // k = r − Carbon's handle (1.2)
  return (
    `M${c - r} ${b}H${a + r}C${a + k} ${b} ${a} ${f(b + k)} ${a} ${f(b + r)}V${f(d - r)}C${a} ${f(d - k)} ${a + k} ${d} ${a + r} ${d}` +
    `H${c - r}C${c - k} ${d} ${c} ${f(d - k)} ${c} ${f(d - r)}V${f(b + r)}C${c} ${f(b + k)} ${c - k} ${b} ${c - r} ${b}Z` +
    `M${x0 + 1} ${f(y0 + 1)}H${x1 - 1}V${f(y1 - 1)}H${x0 + 1}Z`
  );
}

// ── Play ↔ Pause match cut ───────────────────────────────────────────────────

export const CUT_AT = 6 / 15;
export const CUT_SHRINK = 4; // bars lose this much at each end before the cut

/**
 * At progress k (0 first glyph … 1 second, e.g. play → pause): which glyph
 * shows, and how far it's shrunk (1 = fully small).
 */
export function cut(k: number): { second: boolean; small: number } {
  if (k <= CUT_AT) {
    return { second: false, small: EXIT(k / CUT_AT) };
  }
  return { second: true, small: 1 - ENTRANCE((k - CUT_AT) / (1 - CUT_AT)) };
}

type Style = 'outline' | 'filled' | 'circle' | 'knockout';

/**
 * Play/pause geometry. `k` is the toggle (0 play, 1 pause); `h` hover.
 * Styles: outline (play, pause), filled (play--filled--alt, pause--filled),
 * circle (play--outline, pause--outline), knockout (play--filled,
 * pause--outline--filled).
 */
export function playPause(
  style: Style,
  h: number,
  k: number,
  size?: number
): Shapes {
  const c = cut(k);
  const big = style === 'outline' || style === 'filled';
  const s16 = size === 16;
  // play--filled--alt and pause--filled have no 16px drawing in Carbon; the others do.
  const tri = big
    ? s16 && style === 'outline'
      ? PLAY_BIG_16
      : PLAY_BIG
    : s16
      ? PLAY_SMALL_16
      : PLAY_SMALL;
  const bars =
    style === 'outline'
      ? PAUSE_BIG_OUTLINE
      : style === 'filled'
        ? PAUSE_BIG_FILLED
        : PAUSE_SMALL;
  // The triangle's small size matches the bars' shrunk height, so the cut
  // swaps like for like.
  const barH = bars[0][3] - bars[0][1];
  const triH =
    Math.max(...tri.map((p) => p[1])) - Math.min(...tri.map((p) => p[1]));
  const triSmall = (barH - 2 * CUT_SHRINK) / triH;

  // Hover follows whichever glyph is showing (play grows, pause stretches).
  // σ: the triangle's scale about its centroid (hover growth × the cut's shrink).
  const sigma = (1 + 0.1 * h) * lerp(1, triSmall, c.small);
  const t = !c.second ? scalePts(tri, centroid(tri), sigma) : null;
  const bs = c.second
    ? bars.map((b) => stretch(b, 2 * h - CUT_SHRINK * c.small))
    : null;
  // At 16px the outlined triangles and bars are Carbon's 16px outlines.
  const art16 = !s16
    ? null
    : style === 'outline'
      ? PLAY_16
      : style === 'circle'
        ? PLAY_OUTLINE_16
        : style === 'knockout'
          ? PLAY_HOLE_16
          : null;

  const triD = t
    ? art16 && style !== 'knockout'
      ? outline16(art16, tri, sigma)
      : polyPath(t, true)
    : '';
  const triPaint = art16 ? EVENODD : STROKE;
  const shapes: Shapes = {};
  if (style === 'circle') {
    shapes.ring = ring(h);
  }

  if (style === 'knockout') {
    // Disc less the rounded triangle (play--filled) or the two bars (pause--outline--filled).
    const holes = t
      ? art16
        ? outline16(art16, tri, sigma)
        : roundedOutlinePath(t, 1)
      : bs!.map((b) => rectPath(...b)).join('');
    shapes.disc = { d: disc(14 + h) + holes, ...EVENODD };
    return shapes;
  }
  if (style === 'outline') {
    shapes.play = { d: triD, ...triPaint };
    (bs ?? [null, null]).forEach((b, i) => {
      shapes[`bar${i}`] = !b
        ? { d: '' }
        : s16
          ? { d: pauseBar16(b), ...EVENODD }
          : { d: roundedRectPath(...b, 1), ...STROKE };
    });
  } else if (style === 'filled') {
    shapes.play = { d: triD, ...FILLED_STROKE };
    (bs ?? [null, null]).forEach((b, i) => {
      shapes[`bar${i}`] = { d: b ? roundedRectPath(...b, 2) : '' };
    });
  } else {
    shapes.play = { d: triD, ...triPaint };
    (bs ?? [null, null]).forEach((b, i) => {
      shapes[`bar${i}`] = { d: b ? rectPath(...b) : '' };
    });
  }
  return shapes;
}

/** play--outline--filled: a disc less the triangle's outline, with its middle filled back in. */
function playOutlineFilled(h: number, size?: number): Shapes {
  if (size === 16) {
    // Carbon's 16px hole and middle, both moving with the centreline's corners.
    const sigma = 1 + 0.1 * h;
    const move = corners16(PLAY_SMALL_16, sigma);
    return {
      disc: {
        d: disc(14 + h) + outline16(PLAY_HOLE_16, PLAY_SMALL_16, sigma),
        ...EVENODD,
      },
      inner: {
        d: `M${PLAY_MIDDLE_16.map((q, k) => pt(move(k, q))).join('L')}Z`,
      },
    };
  }
  const t = grow(PLAY_SMALL, h);
  return {
    disc: { d: disc(14 + h) + roundedOutlinePath(t, 1), ...EVENODD },
    inner: { d: polyPath(insetPoly(t, 1), true) },
  };
}

// ── Stop & recording ─────────────────────────────────────────────────────────
//
// One shape: a rounded square around the centre with half-side `s` and
// corner radius `r`. Recording's circles are the same square with r = s.

export const sq = (s: number, r: number) =>
  roundedRectPath(16 - s, 16 - s, 16 + s, 16 + s, r);
const RS_SHRINK = 2; // the centre shape loses this much per side before the cut

/**
 * Stop/recording at hover `h` and toggle `k` (0 recording, 1 stop). Both
 * grow 1px on hover. Between the two, the centre shape match-cuts (see
 * `cut`): the outgoing one shrinks RS_SHRINK per side, the incoming one grows
 * back from there. Stop's corner radii hold while it shrinks.
 */
function recordStop(
  style: 'circle' | 'knockout' | 'knockoutAlt',
  h: number,
  k: number
): Shapes {
  const c = cut(k);
  const stop = c.second;
  // How far the centre shape's half-side moves from full: +1 on hover, −3 at the cut.
  const ds = h - RS_SHRINK * c.small;
  if (style === 'circle') {
    // recording: inner ring r5 (centreline); stop--outline: centreline square 11..21, r1.
    const s = 5 + ds;
    return { ring: ring(h), inner: { d: sq(s, stop ? 1 : s), ...STROKE } };
  }
  // The hole: recording r6; stop 10..22, r2. Always 2px outside the dot.
  const hs = 6 + ds;
  const hole = sq(hs, stop ? 2 : hs);
  if (style === 'knockout') {
    // recording--filled: hole r6 + dot r4; stop--outline--filled: hole 10..22 r2 + square 12..20.
    const s = 4 + ds;
    return {
      disc: { d: disc(14 + h) + hole, ...EVENODD },
      inner: { d: sq(s, stop ? 0 : s) },
    };
  }
  // recording--filled--alt: hole r6; stop--filled: hole 10..22 r2.
  return { disc: { d: disc(14 + h) + hole, ...EVENODD } };
}

// ── Skip ─────────────────────────────────────────────────────────────────────

export const SKIP = {
  back: {
    tri: [
      [27, 5],
      [27, 27],
      [8, 16],
    ] as Pt[],
    bar: [2, 4, 4, 28] as Box,
    dir: -1,
  },
  forward: {
    tri: [
      [5, 5],
      [5, 27],
      [24, 16],
    ] as Pt[],
    bar: [28, 4, 30, 28] as Box,
    dir: 1,
  },
};
export const SKIP_SMALL = {
  back: {
    tri: [
      [23, 11],
      [23, 21],
      [14, 16],
    ] as Pt[],
    bar: [9, 10, 11, 22] as Box,
    dir: -1,
  },
  forward: {
    tri: [
      [9, 11],
      [9, 21],
      [18, 16],
    ] as Pt[],
    bar: [21, 10, 23, 22] as Box,
    dir: 1,
  },
};

function skip(
  which: 'back' | 'forward',
  style: 'outline' | 'filled' | 'circle' | 'circleSolid',
  h: number
): Shapes {
  if (style === 'circle' || style === 'circleSolid') {
    const s = SKIP_SMALL[which];
    return {
      ring: ring(h),
      tri: {
        d: polyPath(s.tri, true),
        ...(style === 'circleSolid' ? FILLED_STROKE : STROKE),
      },
      bar: { d: rectPath(...stretch(s.bar, 2 * h)) },
    };
  }
  const s = SKIP[which];
  return {
    tri: {
      d: polyPath(shift(s.tri, 2 * h * s.dir), true),
      ...(style === 'filled' ? FILLED_STROKE : STROKE),
    },
    bar: { d: rectPath(...stretch(s.bar, 2 * h)) },
  };
}

// ── Hover icons ──────────────────────────────────────────────────────────────

/* @__NO_SIDE_EFFECTS__ */
const hover = (name: string, geo: (h: number, size?: number) => Shapes) =>
  hoverIcon(name, { geo: ({ h }, size) => geo(h, size) });

export const PlayFilledAltSpec = /* @__PURE__ */ withStatic(
  hover('PlayFilledAlt', (h, size) => playPause('filled', h, 0, size)),
  /* @__PURE__ */ carbonArt(PlayFilledAlt32)
);
export const PlayOutlineSpec = /* @__PURE__ */ withStatic(
  hover('PlayOutline', (h, size) => playPause('circle', h, 0, size)),
  /* @__PURE__ */ carbonArt(PlayOutline16, PlayOutline32)
);
export const PlayFilledSpec = /* @__PURE__ */ withStatic(
  hover('PlayFilled', (h, size) => playPause('knockout', h, 0, size)),
  /* @__PURE__ */ carbonArt(PlayFilled16, PlayFilled32)
);
export const PlayOutlineFilledSpec = /* @__PURE__ */ withStatic(
  hover('PlayOutlineFilled', playOutlineFilled),
  /* @__PURE__ */ carbonArt(PlayOutlineFilled16, PlayOutlineFilled32)
);
export const PauseSpec = /* @__PURE__ */ withStatic(
  hover('Pause', (h, size) => playPause('outline', h, 1, size)),
  /* @__PURE__ */ carbonArt(Pause16, Pause32)
);
export const PauseFilledSpec = /* @__PURE__ */ withStatic(
  hover('PauseFilled', (h) => playPause('filled', h, 1)),
  /* @__PURE__ */ carbonArt(PauseFilled32)
);
export const PauseOutlineSpec = /* @__PURE__ */ withStatic(
  hover('PauseOutline', (h) => playPause('circle', h, 1)),
  /* @__PURE__ */ carbonArt(PauseOutline16, PauseOutline32)
);
export const PauseOutlineFilledSpec = /* @__PURE__ */ withStatic(
  hover('PauseOutlineFilled', (h) => playPause('knockout', h, 1)),
  /* @__PURE__ */ carbonArt(PauseOutlineFilled16, PauseOutlineFilled32)
);

export const StopSpec = /* @__PURE__ */ withStatic(
  hover('Stop', (h) => ({
    square: {
      d: roundedRectPath(
        7 - 1.2 * h,
        7 - 1.2 * h,
        25 + 1.2 * h,
        25 + 1.2 * h,
        1
      ),
      ...STROKE,
    },
  })),
  /* @__PURE__ */ carbonArt(Stop16, Stop32)
);
export const StopFilledAltSpec = /* @__PURE__ */ withStatic(
  hover('StopFilledAlt', (h) => ({
    square: {
      d: roundedRectPath(
        6 - 1.2 * h,
        6 - 1.2 * h,
        26 + 1.2 * h,
        26 + 1.2 * h,
        2
      ),
    },
  })),
  /* @__PURE__ */ carbonArt(StopFilledAlt32)
);
export const StopOutlineSpec = /* @__PURE__ */ withStatic(
  hover('StopOutline', (h) => recordStop('circle', h, 1)),
  /* @__PURE__ */ carbonArt(StopOutline16, StopOutline32)
);
export const StopOutlineFilledSpec = /* @__PURE__ */ withStatic(
  hover('StopOutlineFilled', (h) => recordStop('knockout', h, 1)),
  /* @__PURE__ */ carbonArt(StopOutlineFilled16, StopOutlineFilled32)
);
export const StopFilledSpec = /* @__PURE__ */ withStatic(
  hover('StopFilled', (h) => recordStop('knockoutAlt', h, 1)),
  /* @__PURE__ */ carbonArt(StopFilled16, StopFilled32)
);
export const RecordingSpec = /* @__PURE__ */ withStatic(
  hover('Recording', (h) => recordStop('circle', h, 0)),
  /* @__PURE__ */ carbonArt(Recording32)
);
export const RecordingFilledSpec = /* @__PURE__ */ withStatic(
  hover('RecordingFilled', (h) => recordStop('knockout', h, 0)),
  /* @__PURE__ */ carbonArt(RecordingFilled32)
);
export const RecordingFilledAltSpec = /* @__PURE__ */ withStatic(
  hover('RecordingFilledAlt', (h) => recordStop('knockoutAlt', h, 0)),
  /* @__PURE__ */ carbonArt(RecordingFilledAlt32)
);

export const SkipBackSpec = /* @__PURE__ */ withStatic(
  hover('SkipBack', (h) => skip('back', 'outline', h)),
  /* @__PURE__ */ carbonArt(SkipBack32)
);
export const SkipBackFilledSpec = /* @__PURE__ */ withStatic(
  hover('SkipBackFilled', (h) => skip('back', 'filled', h)),
  /* @__PURE__ */ carbonArt(SkipBackFilled32)
);
export const SkipBackOutlineSpec = /* @__PURE__ */ withStatic(
  hover('SkipBackOutline', (h) => skip('back', 'circle', h)),
  /* @__PURE__ */ carbonArt(SkipBackOutline32)
);
export const SkipForwardSpec = /* @__PURE__ */ withStatic(
  hover('SkipForward', (h) => skip('forward', 'outline', h)),
  /* @__PURE__ */ carbonArt(SkipForward32)
);
export const SkipForwardFilledSpec = /* @__PURE__ */ withStatic(
  hover('SkipForwardFilled', (h) => skip('forward', 'filled', h)),
  /* @__PURE__ */ carbonArt(SkipForwardFilled32)
);
export const SkipForwardOutlineSpec = /* @__PURE__ */ withStatic(
  hover('SkipForwardOutline', (h) => skip('forward', 'circle', h)),
  /* @__PURE__ */ carbonArt(SkipForwardOutline32)
);
// skip--*--outline--solid: skip--*--outline with its triangle solid; the same hover.
export const SkipBackOutlineSolidSpec = /* @__PURE__ */ withStatic(
  hover('SkipBackOutlineSolid', (h) => skip('back', 'circleSolid', h)),
  /* @__PURE__ */ carbonArt(SkipBackOutlineSolid32)
);
export const SkipForwardOutlineSolidSpec = /* @__PURE__ */ withStatic(
  hover('SkipForwardOutlineSolid', (h) => skip('forward', 'circleSolid', h)),
  /* @__PURE__ */ carbonArt(SkipForwardOutlineSolid32)
);

// ── Toggles ──────────────────────────────────────────────────────────────────

type PP = 'play' | 'pause';
type RS = 'recording' | 'stop';
// Linear progress: the match cut applies its two-part easing itself.
const LINEAR = {
  duration: TOGGLE_IN.duration,
  ease: [0, 0, 1, 1] as [number, number, number, number],
};

/* @__NO_SIDE_EFFECTS__ */
const playPauseToggle = (
  name: string,
  style: Style,
  statics: readonly [CarbonIcon, CarbonIcon]
) =>
  toggleIcon<PP>(name, {
    states: ['play', 'pause'],
    statics,
    geo: ({ h, p }, size) => playPause(style, h, p, size),
    change: (on, _f, tween) => tween('p', on ? 1 : 0, LINEAR),
  });

/* @__NO_SIDE_EFFECTS__ */
const recordStopToggle = (
  name: string,
  style: 'circle' | 'knockout' | 'knockoutAlt',
  statics: readonly [CarbonIcon, CarbonIcon]
) =>
  toggleIcon<RS>(name, {
    states: ['recording', 'stop'],
    statics,
    geo: ({ h, p }) => recordStop(style, h, p),
    // 160ms both ways: recording and stop are both valid states, neither an
    // 'off'. Linear progress: the match cut applies its own easing.
    change: (on, _f, tween) => tween('p', on ? 1 : 0, LINEAR),
  });

const PLAY_PAUSE = {
  plain: playPauseToggle('PlayPauseToggle', 'outline', [CPlay, CPause]),
  filled: playPauseToggle('PlayPauseToggle(filled)', 'filled', [
    CPlayFilledAlt,
    CPauseFilled,
  ]),
  outline: playPauseToggle('PlayPauseToggle(outline)', 'circle', [
    CPlayOutline,
    CPauseOutline,
  ]),
  outlineFilled: playPauseToggle(
    'PlayPauseToggle(outline, filled)',
    'knockout',
    [CPlayFilled, CPauseOutlineFilled]
  ),
};
export type PlayPauseVariant = 'default' | 'outline';
export type PlayPauseToggleProps = ToggleIconProps<PP> &
  VariantProps<PlayPauseVariant>;
/**
 * Play ⇄ Pause; `toggled` shows pause (it's playing). Four drawings:
 * play ⇄ pause (default), `filled` play--filled--alt ⇄ pause--filled,
 * `variant="outline"` (circled) play--outline ⇄ pause--outline, and
 * `variant="outline" filled` play--filled ⇄ pause--outline--filled.
 */
export const PlayPauseToggleSpec = /* @__PURE__ */ variantToggle(
  'PlayPauseToggle',
  (p: PlayPauseToggleProps) =>
    p.variant === 'outline'
      ? p.filled
        ? PLAY_PAUSE.outlineFilled
        : PLAY_PAUSE.outline
      : p.filled
        ? PLAY_PAUSE.filled
        : PLAY_PAUSE.plain
);

const RECORD_STOP = {
  outline: recordStopToggle('RecordStopToggle', 'circle', [
    CRecording,
    CStopOutline,
  ]),
  filled: recordStopToggle('RecordStopToggle(filled)', 'knockout', [
    CRecordingFilled,
    CStopOutlineFilled,
  ]),
  alt: recordStopToggle('RecordStopToggle(alt)', 'knockoutAlt', [
    CRecordingFilledAlt,
    CStopFilled,
  ]),
};
export type RecordStopVariant = 'default' | 'alt';
export type RecordStopToggleProps = ToggleIconProps<RS> &
  VariantProps<RecordStopVariant>;
/**
 * Recording ⇄ Stop; `toggled` shows stop (it's recording). Three drawings:
 * recording ⇄ stop--outline (default), `filled` recording--filled ⇄
 * stop--outline--filled, and `variant="alt"` recording--filled--alt ⇄
 * stop--filled (Carbon draws the alt pair filled only, so `alt` is always filled).
 */
export const RecordStopToggleSpec = /* @__PURE__ */ variantToggle(
  'RecordStopToggle',
  (p: RecordStopToggleProps) =>
    p.variant === 'alt'
      ? RECORD_STOP.alt
      : p.filled
        ? RECORD_STOP.filled
        : RECORD_STOP.outline
);
