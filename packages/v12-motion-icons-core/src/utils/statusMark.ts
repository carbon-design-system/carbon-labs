/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  hoverIcon,
  type HoverIconSpec,
  type Shapes,
  type TweenOpts,
} from '../engine';
import { mapPath, ringPath, type Pt } from '../geometry';
import { EVENODD, f } from '../paint';

/**
 * Status marks: a base icon with a small inset mark (document--add,
 * data--view, settings--edit, user--settings, checkmark--filled--warning…).
 *
 * One mark motion per mark type, applied to every base that carries it:
 *
 *  - The mark carries the hover's story (a plus's arms reach out, as Add's
 *    do), placed by a small table per icon (its centre and size).
 *  - The base holds (the recommended rule: beside a plus, the box holds and
 *    its open corner draws back as the plus grows).
 *    A base may instead run a calm version of its own motion (`calm`, for
 *    review), its open ends still drawing back.
 *  - Where Carbon cuts the base for the mark, the cut is geometry: Carbon's
 *    own badge drawing, its open ends (the wall ends that face the mark)
 *    drawing back along their walls, or round their ring, by just enough
 *    that the space between each end and the mark holds at its resting
 *    width as the mark grows (Event's, Certificate's and Bookmark add's
 *    rule). No masks, no clip paths, no scaling: every wall keeps its
 *    weight, because an end only slides along its own wall.
 *  - Two-tone: an inner glyph (a filled base's knockout, or a filled mark's
 *    glyph) stays knocked out of its shape, as our filled status icons draw
 *    it (no inner-path element, so nothing changes for a host that doesn't
 *    colour it). With `twoTone`, the glyph is also emitted as Carbon's
 *    `<path fill="none" data-icon-path="inner-path">`, so a host's two-tone
 *    rule (`[data-icon-path='inner-path'] { fill: …; opacity: 1 }`) colours
 *    it, and it moves with its shape.
 *
 * Rest is Carbon's drawing of the mark icon, point for point.
 */

// ── Measuring ────────────────────────────────────────────────────────────────

/** The distance from p to the segment ab. */
export function segDist(p: Pt, a: Pt, b: Pt): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l2 = dx * dx + dy * dy;
  const t = l2
    ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2))
    : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

/** The narrowest space between the outlines of two polygons that don't overlap. */
export function polyGap(a: readonly Pt[], b: readonly Pt[]): number {
  let m = Infinity;
  const edges = (q: readonly Pt[]) =>
    q.map((p, i) => [p, q[(i + 1) % q.length]] as const);
  for (const [p, q] of edges(b)) {
    for (const v of a) {
      m = Math.min(m, segDist(v, p, q));
    }
  }
  for (const [p, q] of edges(a)) {
    for (const v of b) {
      m = Math.min(m, segDist(v, p, q));
    }
  }
  return m;
}

/** The narrowest space from any of `marks` to any of `others`. */
export const gapBetween = (marks: readonly Pt[][], others: readonly Pt[][]) =>
  Math.min(...marks.flatMap((m) => others.map((o) => polyGap(m, o))));

// ── Mark types ───────────────────────────────────────────────────────────────

/**
 * A mark type: one geometry and one hover motion, for every base that
 * carries the mark. `P` places it on an icon (its centre and size).
 */
export interface MarkType<P> {
  /** The mark's painted path data at hover h (Carbon's at h = 0). */
  d(place: P, h: number): string;
  /** Its ink as polygons, for measuring the space to the base. */
  ink(place: P, h: number): Pt[][];
  /** Its inner glyph (a filled mark's knockout), for two-tone hosts. */
  inner?(place: P, h: number): string;
  /** Extra painted shapes (a mark in two parts), keyed. */
  parts?(place: P, h: number): Shapes;
  /** The hover's own timing, where the mark's motion calls for one (the cog turns on Settings' 220ms (moderate-02) curve). */
  timing?: { hover: TweenOpts; leave?: TweenOpts };
  /** Fill the mark even-odd (a glyph knocked out of it: the error mark's slash, a clock's hands). */
  evenodd?: boolean;
}

/** The set's plus reach (signs.ts): each arm end reaches 2px at full hover. */
export const PLUS_REACH = 2;
/**
 * A small plus (arms 4px or less from its centre, 8px across or less)
 * reaches 1px: 2px would grow it by half or more, and the small pluses all
 * sit inside a ring, 2px from it (pills--add, calendar--add--alt). The 10px
 * and 14px pluses reach the set's 2px.
 */
export const SMALL_PLUS_REACH = 1;
/** A plus's reach by its size (arm: centre to arm end). */
export const plusReach = (arm: number) =>
  arm > 4 ? PLUS_REACH : SMALL_PLUS_REACH;

/**
 * Where a plus sits: its centre, how far its arms reach from it (Carbon's:
 * 5 for the 10px plus, 7 for calendar--add's 14px one, 3–4 for the small
 * ones), and, where the base leaves it less room than the set's reach, its
 * own reach (default `plusReach(arm)`). `drift`: how far its centre moves
 * at full hover, for a plus that must make room as it grows (a part of the
 * base that holds, and isn't a wall end that can draw back, is in its way).
 */
export interface PlusPlace {
  c: Pt;
  arm: number;
  reach?: number;
  drift?: Pt;
}

/** A plus's 12 corners: arms reaching l from c, 1px half-width (2px arms). */
export function plusPts([cx, cy]: Pt, l: number, w = 1): Pt[] {
  return [
    [cx + w, cy - l],
    [cx + w, cy - w],
    [cx + l, cy - w],
    [cx + l, cy + w],
    [cx + w, cy + w],
    [cx + w, cy + l],
    [cx - w, cy + l],
    [cx - w, cy + w],
    [cx - l, cy + w],
    [cx - l, cy - w],
    [cx - w, cy - w],
    [cx - w, cy - l],
  ];
}
/** A closed polygon's path data. */
export const loopD = (pts: readonly Pt[]) =>
  `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
const reachOf = (p: PlusPlace) => p.reach ?? plusReach(p.arm);
/** The plus's arms at hover h (each end reaches out; the arm width holds). */
const armAt = (p: PlusPlace, h: number) => p.arm + reachOf(p) * h;
/** The plus's centre at hover h. */
export const plusCentre = (p: PlusPlace, h: number): Pt =>
  p.drift ? [p.c[0] + p.drift[0] * h, p.c[1] + p.drift[1] * h] : p.c;
/** Its ink: the two arms as rectangles (the plus is not convex). */
const plusInk = (c: Pt, l: number): Pt[][] => [
  [
    [c[0] - 1, c[1] - l],
    [c[0] + 1, c[1] - l],
    [c[0] + 1, c[1] + l],
    [c[0] - 1, c[1] + l],
  ],
  [
    [c[0] - l, c[1] - 1],
    [c[0] + l, c[1] - 1],
    [c[0] + l, c[1] + 1],
    [c[0] - l, c[1] + 1],
  ],
];

/** The add mark (Carbon's plus, `--add` and `--plus`): Add's hover, each arm end reaching out. */
export const PLUS: MarkType<PlusPlace> = {
  d: (p, h) => loopD(plusPts(plusCentre(p, h), armAt(p, h))),
  ink: (p, h) => plusInk(plusCentre(p, h), armAt(p, h)),
};
/**
 * The most a plus with arms `arm` inside a ring (inner radius `r`, about the
 * plus's centre) can reach while its arm ends' corners stay `gap` clear of
 * the ring, capped at its size's reach.
 */
export const reachInRing = (r: number, arm: number, gap = 2) =>
  Math.min(plusReach(arm), Math.sqrt((r - gap) ** 2 - 1) - arm);

/**
 * Where a circled plus sits (calendar--add--alt): its centre, the ring's
 * outer radius and the plus's arms.
 */
export interface PlusAltPlace extends PlusPlace {
  R: number;
}
/**
 * The circled add mark: Add alt's hover. The ring grows by the plus's
 * reach in radius (Add alt: 2px; a small one 1px) as the arms reach out by
 * the same, so the 2px inside the ring holds; the ring keeps its weight.
 */
export const PLUS_ALT: MarkType<PlusAltPlace> = {
  d: (p, h) => loopD(plusPts(p.c, armAt(p, h))),
  ink: (p, h) => {
    const R = p.R + reachOf(p) * h;
    // The ring's outside, as a 72-gon just outside the circle (so gaps measured to it are never short).
    const k = 1 / Math.cos(Math.PI / 72);
    return [
      Array.from(
        { length: 72 },
        (_, i) =>
          [
            p.c[0] + R * k * Math.cos((i * Math.PI) / 36),
            p.c[1] + R * k * Math.sin((i * Math.PI) / 36),
          ] as Pt
      ),
    ];
  },
  parts: (p, h) => ({
    ring: { d: ringPath(p.c, p.R - 1 + reachOf(p) * h, 2), ...EVENODD },
  }),
};

// ── Bases ────────────────────────────────────────────────────────────────────

/**
 * An open end of the base: one of the wall ends Carbon leaves beside the
 * mark. `at` are Carbon's points at the end (the corners of its butt end, as
 * they appear in the base path); they draw back along `back`, a unit vector
 * along the wall away from the mark, or round a ring about `c` (`turn`: +1
 * clockwise on screen, −1 anticlockwise).
 */
export interface OpenEnd {
  at: readonly Pt[];
  back: Pt | { c: Pt; turn: 1 | -1 };
  /**
   * The end also follows the mark as it moves away (extends along its wall,
   * up to this far), so the space holds at its resting width exactly, not
   * only as a floor (Task edit's wall above the pencil).
   */
  follow?: number;
  /**
   * How far back along its wall the space to the mark is measured (default
   * 3): longer where the mark comes up beside the wall, not only at its end
   * (Column delete's wall beside the x's arm).
   */
  stub?: number;
}

export interface MarkBase {
  /** Carbon's drawing of the base in the mark icon (absolute commands), its open ends at rest. */
  d: string;
  /** Fill the base even-odd (default nonzero, as Carbon's paths). */
  evenodd?: boolean;
  /** Its open ends beside the mark (none when the mark sits clear of the base, or inside it). */
  ends?: readonly OpenEnd[];
  /** Other parts of the base, which hold (dots, rays, a second piece), by key. */
  parts?: Record<string, string>;
  /** An inner glyph knocked out of the base (two-tone hosts colour it). */
  inner?: string;
  /**
   * The base's own motion, calmed (for review; the recommended rule holds
   * the base): where each of Carbon's points moves at hover h. The open
   * ends ride along, then draw back as they must.
   */
  calm?: (p: Pt, h: number) => Pt;
  /** With `calm`: each arc's radius at hover h (a base whose rings grow; default unchanged). */
  calmArc?: (r: number, h: number) => number;
  /** Parts drawn per frame (a part whose own motion isn't a point mapping, e.g. a dot growing), at h > 0. */
  partsAt?: (h: number) => Record<string, string>;
  /**
   * For a cut open ends can't express (a disc cut round the mark's own
   * outline, as checkmark--filled--warning's): the base's drawing at hover
   * h, its cut following the mark. Replaces `ends` and `calm`; `d` is its
   * rest.
   */
  at?: (h: number) => string;
}

export interface StatusMarkSpec<P> {
  base: MarkBase;
  mark: MarkType<P>;
  place: P;
  /** 'hold' (default): the base holds and the mark carries the hover. 'calm': the base runs `base.calm`. */
  baseMotion?: 'hold' | 'calm';
  /**
   * The space each open end keeps to the mark: 'rest' (default) holds its
   * resting width (Carbon's 2–4px), as Bookmark add and Event do; a number
   * only floors it there (an end draws back once the space would fall below).
   */
  gap?: 'rest' | number;
  /** Also emit the inner glyph(s) as Carbon's inner-path, for two-tone hosts. */
  twoTone?: boolean;
  /** The icon's hover timing, where its base's motion sets it (a gear turning on Settings' curve); else the mark's. */
  timing?: { hover: TweenOpts; leave?: TweenOpts };
}

/** How far an end's stub reaches back along its wall, for measuring. */
const STUB = 3;
const near = (p: Pt, q: Pt) =>
  Math.abs(p[0] - q[0]) < 1e-3 && Math.abs(p[1] - q[1]) < 1e-3;

/** An end's points drawn back by d. */
function endMove(end: OpenEnd, d: number): (p: Pt) => Pt {
  if (Array.isArray(end.back)) {
    const [ux, uy] = end.back as Pt;
    return ([x, y]) => [x + ux * d, y + uy * d];
  }
  const { c, turn } = end.back as { c: Pt; turn: 1 | -1 };
  const r =
    end.at.reduce((s, [x, y]) => s + Math.hypot(x - c[0], y - c[1]), 0) /
    end.at.length;
  const a = (turn * d) / r; // d along the wall's middle
  const [cos, sin] = [Math.cos(a), Math.sin(a)];
  return ([x, y]) => [
    c[0] + (x - c[0]) * cos - (y - c[1]) * sin,
    c[1] + (x - c[0]) * sin + (y - c[1]) * cos,
  ];
}
/** The end's stub (its butt end and the wall STUB, or its own `stub`, behind it) at draw-back d. */
function stub(end: OpenEnd, at: readonly Pt[], d: number): Pt[] {
  const [front, behind] = [
    endMove(end, d),
    endMove(end, d + (end.stub ?? STUB)),
  ];
  return [...at.map(front), ...[...at].reverse().map(behind)];
}
/** The least draw-back (0–max) that keeps `gapAt(d)` at `want` (bisection; the gap grows with d). */
function drawBack(gapAt: (d: number) => number, want: number, max = 8): number {
  if (gapAt(0) >= want - 1e-9) {
    return 0;
  }
  let [lo, hi] = [0, max];
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (gapAt(mid) >= want) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return hi;
}

/** A mark icon's geometry at hover h, with what the tests and review sheets measure. */
export interface MarkParts {
  shapes: Shapes;
  /** The base's path (ends drawn back) and the mark's ink. */
  base: string;
  ink: Pt[][];
  /** How far each open end has drawn back. */
  drawn: number[];
  /** Each open end's stub, and the space from it to the mark. */
  stubs: Pt[][];
  gaps: number[];
}

/** The parts of a status-mark icon at hover h (see `makeStatusMarkIcon`). */
export function statusMarkParts<P>(
  spec: StatusMarkSpec<P>
): (h: number) => MarkParts {
  const { base, mark, place } = spec;
  const ends = base.ends ?? [];
  const calm = spec.baseMotion === 'calm' && base.calm ? base.calm : null;
  const restInk = mark.ink(place, 0);
  const rest = ends.map((end) => gapBetween(restInk, [stub(end, end.at, 0)]));
  const want = rest.map((g) =>
    spec.gap === undefined || spec.gap === 'rest' ? g : Math.min(g, spec.gap)
  );
  return (h) => {
    const ink = mark.ink(place, h);
    const at = ends.map((end) =>
      calm ? end.at.map((p) => calm(p, h)) : end.at
    );
    const drawn = ends.map((end, i) => {
      if (h <= 0 && !calm) {
        return 0;
      }
      const gapAt = (d: number) => gapBetween(ink, [stub(end, at[i], d)]);
      const d = drawBack(gapAt, want[i]);
      // A following end comes forward (a negative draw-back) while the space is wider than at rest.
      return end.follow && d === 0
        ? -drawBack((e) => -gapAt(-e), -want[i], end.follow)
        : d;
    });
    const moves = ends.map((end, i) => endMove(end, drawn[i]));
    const move = (p: Pt): Pt => {
      const q = calm ? calm(p, h) : p;
      for (let i = 0; i < ends.length; i++) {
        if (ends[i].at.some((a) => near(a, p))) {
          return moves[i](q);
        }
      }
      return q;
    };
    // A base whose rings grow: every arc's radius through calmArc (mapPath keeps radii).
    const arc = (d: string) =>
      calm && base.calmArc
        ? d.replace(
            /A([\d.]+) ([\d.]+)/g,
            (_, rx, ry) =>
              `A${f(base.calmArc!(+rx, h))} ${f(base.calmArc!(+ry, h))}`
          )
        : d;
    const d = base.at
      ? h <= 0
        ? base.d
        : base.at(h)
      : h <= 0
        ? base.d
        : arc(mapPath(base.d, move));
    const stubs = ends.map((end, i) => stub(end, at[i], drawn[i]));
    const shapes: Shapes = { base: { d, ...(base.evenodd ? EVENODD : {}) } };
    const partsNow = base.partsAt && h > 0 ? base.partsAt(h) : null;
    for (const [k, pd] of Object.entries(base.parts ?? {})) {
      shapes[k] = {
        d: partsNow
          ? partsNow[k]
          : calm && h > 0
            ? arc(mapPath(pd, (p) => calm(p, h)))
            : pd,
      };
    }
    Object.assign(shapes, mark.parts?.(place, h) ?? {});
    shapes.mark = {
      d: mark.d(place, h),
      ...(mark.inner || mark.evenodd ? EVENODD : {}),
    };
    if (spec.twoTone && base.inner) {
      shapes.baseInner = innerPath(
        calm && h > 0 ? mapPath(base.inner, (p) => calm(p, h)) : base.inner
      );
    }
    if (spec.twoTone && mark.inner) {
      shapes.markInner = innerPath(mark.inner(place, h));
    }
    return {
      shapes,
      base: d,
      ink,
      drawn,
      stubs,
      gaps: stubs.map((s) => gapBetween(ink, [s])),
    };
  };
}

/** Carbon's two-tone inner glyph: unpainted unless a host colours it. */
const innerPath = (d: string) => ({
  d,
  fill: 'none',
  'data-icon-path': 'inner-path',
});

/** A status-mark hover icon, its parts exposed for tests and review sheets. */
export type StatusMarkIcon = HoverIconSpec & {
  parts: (h: number) => MarkParts;
};

/* @__NO_SIDE_EFFECTS__ */
export function makeStatusMarkIcon<P>(
  name: string,
  spec: StatusMarkSpec<P>
): StatusMarkIcon {
  const parts = statusMarkParts(spec);
  return Object.assign(
    hoverIcon(name, {
      geo: ({ h }) => parts(h).shapes,
      ...(spec.timing ?? spec.mark.timing),
    }),
    { parts }
  );
}
