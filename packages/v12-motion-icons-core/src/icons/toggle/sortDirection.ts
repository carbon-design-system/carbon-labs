/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ArrowDown16 from '@carbon/icons/es/arrow--down/16.js';
import ArrowDown32 from '@carbon/icons/es/arrow--down/32.js';
import ArrowUp16 from '@carbon/icons/es/arrow--up/16.js';
import ArrowUp32 from '@carbon/icons/es/arrow--up/32.js';
import ArrowsVertical32 from '@carbon/icons/es/arrows--vertical/32.js';
import {
  carbonArt,
  easeFn,
  stateIcon,
  type Frame,
  type Playback,
  type Shapes,
  type StateTweenFn,
  type TweenTiming,
} from '../../engine';
import { ENTRANCE, STANDARD } from '../../ease';
import { clipConvex, polyPath, type Pt } from '../../geometry';
import { lerp } from '../../paint';
import { motionTokens } from '../../tokens';

/**
 * A sortable column's direction, for the data table's sort header: one icon
 * that follows `value` through the three icons Carbon's TableHeader draws.
 *
 *   none        ArrowsVertical (the pair)
 *   ascending   ArrowUp
 *   descending  ArrowDown (ArrowUp turned half a turn, as Carbon draws it)
 *
 * Each state at rest is Carbon's icon exactly, at 16, 20, 24 and 32 (16 has
 * ArrowUp's and ArrowDown's own art; ArrowsVertical draws its 32 art at every
 * size). The icon is an indicator, as ProgressStep: the header button owns
 * the click, so only `value` changes it, it has no accessible name of its
 * own (the header names the sort) and it has no hover (the header is the
 * control: Carbon reveals the unsorted pair on the header's hover and
 * focus, and a reach of the icon's own would answer the pointer over the
 * glyph only, on top of that reveal). Colour is the host's (`currentColor`).
 *
 * Every change runs in two phases through one meeting point, a short line
 * at the centre (8px long at 32, 4px at 16, both whole-pixel) on the single
 * arrow's shaft:
 *
 *  1. Out (fast-01, standard ease): what is drawn now goes to the line. Its
 *     arrowheads trim back into their shafts (each arm shortening toward the
 *     tip) as the shafts shrink; the pair's two arrows also slide toward
 *     each other, so they meet at the centre as one line.
 *  2. In, once phase 1 has landed: from the line the new drawing grows. The
 *     shaft grows to ArrowUp's or ArrowDown's full length (moderate-01,
 *     entrance ease) while the head draws in at the end it points to, its
 *     arms lengthening from the tip over the whole of the phase
 *     (moderate-02, standard ease), so the draw is seen after the line has
 *     landed. Back to none, the pair grows and slides apart, each head
 *     drawing in the same way.
 *
 * So none → ascending (or descending): the pair trims, shrinks and meets,
 * then one arrow grows from the meeting line. Ascending → none plays it
 * backwards: the arrow trims and shrinks to the line, then the pair grows
 * out of it. Ascending ⇄ descending: the arrow trims and shrinks to the
 * line, and only then grows back the other way, the new head drawing in.
 * Each change takes 300ms, the same both ways (none of the states is an
 * "off").
 *
 * Every edge keeps its weight: the shaft is always 2px wide, and each arm is
 * the art's own 2px band, only ever shortened along its length; nothing is
 * scaled. At rest each state draws Carbon's points (whole-pixel edges at 16
 * and 32). A change made mid-way goes back to the line from wherever the
 * drawing is, unless the new state is the one already growing. Under
 * reduced motion a change goes to the new state at once; with motion off
 * each state draws Carbon's art.
 */

export type SortDirectionState = 'none' | 'ascending' | 'descending';
const STATES: readonly SortDirectionState[] = [
  'none',
  'ascending',
  'descending',
];

/**
 * The frame, three arms meeting at the line, each with its length and its
 * head: `p` how far the pair has gone to the line (0 the pair, 1 the line)
 * and `pk` how much of the pair's heads is drawn (1 whole, 0 gone); `u`, `uk`
 * how much of the up arrow's shaft and head has grown out of the line (0
 * the line, 1 ArrowUp); `n`, `nk` the same for the down arrow. At most one
 * arm is away from the line at a time.
 */
export type SortDirectionFrame = {
  p: number;
  pk: number;
  u: number;
  uk: number;
  n: number;
  nk: number;
};
/** Every arm at the line. */
const AT_LINE: SortDirectionFrame = { p: 1, pk: 0, u: 0, uk: 0, n: 0, nk: 0 };
export const SORT_DIRECTION_REST: Record<
  SortDirectionState,
  SortDirectionFrame
> = {
  none: { ...AT_LINE, p: 0, pk: 1 },
  ascending: { ...AT_LINE, u: 1, uk: 1 },
  descending: { ...AT_LINE, n: 1, nk: 1 },
};

const EPS = 1e-6;
const C = 16;

// ── The arrows ───────────────────────────────────────────────────────────────

/** ArrowsVertical's up arrow (left) and down arrow (right), Carbon's points, from the tip. */
const PAIR_UP: readonly Pt[] = [
  [9, 4],
  [3, 10],
  [4.4, 11.4],
  [8, 7.8],
  [8, 28],
  [10, 28],
  [10, 7.8],
  [13.6, 11.4],
  [15, 10],
];
const PAIR_DOWN: readonly Pt[] = [
  [23, 28],
  [29, 22],
  [27.6, 20.6],
  [24, 24.2],
  [24, 4],
  [22, 4],
  [22, 24.2],
  [18.4, 20.6],
  [17, 22],
];
/** ArrowUp at 32 (also its 20 and 24), in the same order: tip, left arm out and in, shaft, right arm in and out. */
const UP_32: readonly Pt[] = [
  [16, 4],
  [6, 14],
  [7.41, 15.41],
  [15, 7.83],
  [15, 28],
  [17, 28],
  [17, 7.83],
  [24.59, 15.41],
  [26, 14],
];
/** ArrowUp's own 16 art, in the 32 frame (×2). */
const UP_16: readonly Pt[] = (
  [
    [8, 1],
    [3, 6],
    [3.7, 6.7],
    [7.5, 2.9],
    [7.5, 15],
    [8.5, 15],
    [8.5, 2.9],
    [12.3, 6.7],
    [13, 6],
  ] as const
).map(([x, y]) => [x * 2, y * 2] as Pt);
/** ArrowDown: ArrowUp turned half a turn about the centre. */
const turned = (pts: readonly Pt[]): Pt[] =>
  pts.map(([x, y]) => [2 * C - x, 2 * C - y] as Pt);

/**
 * An arrow pointing up, as its parts: the shaft from `top` to `bottom` at
 * `cx` (2px wide), and the head, its tip 1px above the shaft's top, each arm
 * reaching `k` out and down at 45° with `o` its 2px band's diagonal offset
 * (Carbon's art: 1.4, or 1.41 for ArrowUp at 32). The parts overlap; at full
 * reach their union is the art's outline. Shorter arms are the same bands
 * cut across nearer the tip.
 */
type Arrow = { cx: number; top: number; bottom: number; k: number; o: number };
/** The pair's up arrow and the single arrow at full length. */
const PAIR_ARROW: Arrow = { cx: 9, top: 5, bottom: 28, k: 6, o: 1.4 };
const SINGLE_32: Arrow = { cx: C, top: 5, bottom: 28, k: 10, o: 1.41 };
const SINGLE_16: Arrow = { cx: C, top: 3, bottom: 30, k: 10, o: 1.4 };
/** The meeting line: 2px wide, 8px long, centred (whole pixels at 16 and at 32). */
const LINE = { cx: C, top: C - 4, bottom: C + 4 };

/** Positive area (the same turning for every part, so overlapping parts fill as one). */
function orient(pts: Pt[]): Pt[] {
  const a = pts.reduce(
    (s, p, i) =>
      s +
      p[0] * pts[(i + 1) % pts.length][1] -
      pts[(i + 1) % pts.length][0] * p[1],
    0
  );
  return a < 0 ? pts.reverse() : pts;
}

/** The arrow `full`, its shaft gone `g` of the way out from the line (0 the line, 1 full) and `h` of its head drawn, pointing down when `down`. */
function arrowPath(full: Arrow, g: number, h: number, down: boolean): string {
  const cx = lerp(LINE.cx, full.cx, g);
  const top = lerp(LINE.top, full.top, g);
  const bottom = lerp(LINE.bottom, full.bottom, g);
  const k = full.k * Math.min(1, Math.max(0, h));
  const { o } = full;
  const ty = top - 1;
  const parts: Pt[][] = [
    [
      [cx - 1, top],
      [cx + 1, top],
      [cx + 1, bottom],
      [cx - 1, bottom],
    ],
  ];
  if (k > EPS) {
    // The left arm's band, from the tip out to its reach, kept left of the centre line; the right arm mirrors it.
    const band: Pt[] = [
      [cx, ty],
      [cx - k, ty + k],
      [cx - k + o, ty + k + o],
      [cx + o, ty + o],
    ];
    const left = clipConvex(band, [
      [cx - 20, ty - 20],
      [cx, ty - 20],
      [cx, ty + 40],
      [cx - 20, ty + 40],
    ]);
    if (left.length > 2) {
      parts.push(
        left,
        left.map(([x, y]) => [2 * cx - x, y] as Pt)
      );
    }
  }
  return parts
    .map((q) =>
      polyPath(orient(down ? q.map(([x, y]) => [x, 2 * C - y] as Pt) : q), true)
    )
    .join('');
}

/**
 * The geometry for a frame: `up`, the pair's up arrow or the single up
 * arrow, and `down`, the pair's down arrow or the single down arrow (empty
 * when not drawn). At rest each is Carbon's own points. No hover.
 */
export function sortDirectionShapes(
  fr: Partial<SortDirectionFrame>,
  size?: number
): Shapes {
  const { p = 0, pk = 1, u = 0, uk = 0, n = 0, nk = 0 } = fr;
  const single = size === 16 ? UP_16 : UP_32;
  const arrow = size === 16 ? SINGLE_16 : SINGLE_32;
  const whole = (g: number, h: number) => g >= 1 - EPS && h >= 1 - EPS;
  if (u > EPS || uk > EPS) {
    return {
      up: {
        d: whole(u, uk)
          ? polyPath(single, true)
          : arrowPath(arrow, u, uk, false),
      },
      down: { d: '' },
    };
  }
  if (n > EPS || nk > EPS) {
    return {
      up: { d: '' },
      down: {
        d: whole(n, nk)
          ? polyPath(turned(single), true)
          : arrowPath(arrow, n, nk, true),
      },
    };
  }
  if (whole(1 - p, pk)) {
    return {
      up: { d: polyPath(PAIR_UP, true) },
      down: { d: polyPath(PAIR_DOWN, true) },
    };
  }
  return {
    up: { d: arrowPath(PAIR_ARROW, 1 - p, pk, false) },
    // The pair's down arrow is its up arrow turned half a turn (Carbon's points), its centre at 23.
    down: {
      d: arrowPath(
        { ...PAIR_ARROW, cx: 2 * C - PAIR_ARROW.cx },
        1 - p,
        pk,
        true
      ),
    },
  };
}

// ── Changes ──────────────────────────────────────────────────────────────────

const { fast01, moderate01, moderate02 } = motionTokens.duration;
/** Phase 1: the drawing trims and shrinks to the line (the pair also closing together), shaft and heads together. */
const OUT: TweenTiming = { duration: fast01 / 1000, ease: STANDARD };
/** Phase 2: the new shaft grows from the line … */
const IN: TweenTiming = { duration: moderate01 / 1000, ease: ENTRANCE };
/** … while its head draws in over the whole phase, landing after the shaft. */
const HEAD_IN: TweenTiming = { duration: moderate02 / 1000, ease: STANDARD };

/** `tw`, starting `delay` seconds from now (held at its start until then). */
function after(delay: number, tw: TweenTiming): TweenTiming {
  if (delay <= 0) {
    return tw;
  }
  const e = easeFn(tw.ease as Parameters<typeof easeFn>[0]);
  const s = delay / (delay + tw.duration);
  return {
    duration: delay + tw.duration,
    ease: (x: number) => (x <= s ? 0 : e((x - s) / (1 - s))),
  };
}

type Key = keyof SortDirectionFrame;
/** Each arm's shaft and head keys. */
const ARMS = {
  p: ['p', 'pk'],
  u: ['u', 'uk'],
  n: ['n', 'nk'],
} as const satisfies Record<string, readonly [Key, Key]>;
type Arm = keyof typeof ARMS;
const ARM: Record<SortDirectionState, Arm> = {
  none: 'p',
  ascending: 'u',
  descending: 'n',
};
/** How far a key is from the line (the pair's `p` counts the other way). */
const off = (fr: Frame, key: Key) => Math.abs(fr[key] - AT_LINE[key]);

function change(
  _prev: SortDirectionState,
  next: SortDirectionState,
  fr: Frame,
  tween: StateTweenFn,
  repaint: () => void
): Playback[] {
  const T = SORT_DIRECTION_REST[next];
  const runs: Playback[] = [];
  // When every part has landed, the numbers settle on the state's rest (the same drawing).
  let left = 0;
  const settle = () => {
    if (--left > 0) {
      return;
    }
    Object.assign(fr, T);
    repaint();
  };
  const run = (key: Key, to: number, tw: TweenTiming) => {
    left++;
    runs.push(tween(key, to, tw, settle));
  };

  // Where the drawing is: on the one arm away from the line, or at the line. Unless that is the new state's arm
  // (it carries on growing from there), it goes back to the line first, and the new arm grows once it is there.
  const want = ARM[next];
  const here = (['u', 'n', 'p'] as const).find((a) =>
    ARMS[a].some((k) => off(fr, k) > EPS)
  );
  for (const a of ['p', 'u', 'n'] as const) {
    if (a !== here && a !== want) {
      for (const k of ARMS[a]) {
        fr[k] = AT_LINE[k];
      }
    }
  }
  let at = 0;
  if (here && here !== want) {
    for (const k of ARMS[here]) {
      if (off(fr, k) > EPS) {
        run(k, AT_LINE[k], OUT);
      }
    }
    at = OUT.duration;
  }
  const [shaft, head] = ARMS[want];
  if (Math.abs(fr[shaft] - T[shaft]) > EPS) {
    run(shaft, T[shaft], after(at, IN));
  }
  if (Math.abs(fr[head] - T[head]) > EPS) {
    run(head, T[head], after(at, HEAD_IN));
  }
  if (!runs.length) {
    Object.assign(fr, T);
    repaint();
  }
  return runs;
}

/**
 * A sortable column's direction: `none` (ArrowsVertical), `ascending`
 * (ArrowUp) or `descending` (ArrowDown), set by `value`. An
 * indicator: it has no accessible name of its own and its clicks don't
 * change it.
 */
export const SortDirectionSpec = /* @__PURE__ */ stateIcon<SortDirectionState>(
  'SortDirection',
  {
    states: STATES,
    statics: {
      none: /* @__PURE__ */ carbonArt(ArrowsVertical32),
      ascending: /* @__PURE__ */ carbonArt(ArrowUp16, ArrowUp32),
      descending: /* @__PURE__ */ carbonArt(ArrowDown16, ArrowDown32),
    },
    rest: (s) => ({ ...SORT_DIRECTION_REST[s] }),
    geo: (fr, size) =>
      sortDirectionShapes(fr as Partial<SortDirectionFrame>, size),
    change,
    indicator: true,
  }
);
