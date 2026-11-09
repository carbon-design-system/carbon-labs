/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  Earth as CEarth,
  EarthFilled as CEarthFilled,
  Location as CLocation,
  LocationFilled as CLocationFilled,
  Star as CStar,
  StarFilled as CStarFilled,
  ThumbsDown as CThumbsDown,
  ThumbsDownFilled as CThumbsDownFilled,
  ThumbsUp as CThumbsUp,
  ThumbsUpFilled as CThumbsUpFilled,
  Time as CTime,
  TimeFilled as CTimeFilled,
  Trophy as CTrophy,
  TrophyFilled as CTrophyFilled,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type {
  CarbonIcon,
  FrameHoverIcon,
  FrameToggleIcon,
  Shapes,
} from '../../utils/frameIcon';
import { pathPoints, type Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  Earth,
  EarthFilled,
  EarthToggle,
  Location,
  LocationFilled,
  LocationToggle,
  Star,
  StarFilled,
  StarToggle,
  ThumbsDown,
  ThumbsDownFilled,
  ThumbsDownToggle,
  ThumbsUp,
  ThumbsUpFilled,
  ThumbsUpToggle,
  Time,
  TimeFilled,
  TimeToggle,
  Trophy,
  TrophyFilled,
  TrophyToggle,
  pinArt,
  starArt,
  thumbParts,
  thumbRock,
  thumbWalls,
  timeArt,
  ROCK_PEAK,
  THUMB_IN_MS,
  trophyArt,
  STAR_CENTRE,
  EARTH_HOVER_TURN,
  earthTurnArt,
  PIN_LIFT,
} from '../../icons/toggle/stateFillToggles';
import {
  EARTH_MAP,
  mapCoasts,
} from '@carbon-labs/motion-icons-core/icons/toggle/earthGlobe';

/**
 * The outline ⇄ filled state toggles (stateFillToggles.ts) and their hover
 * icons: Star, Thumbs up / down, Trophy, Time, Location and Earth.
 *
 * Coverage comparisons use the rasteriser from opsFillToggles.test: both
 * drawings sampled at 8×8 per parity pixel (4× the rendered size), Δ the
 * share of ink pixels whose coverage differs by more than a quarter, gated
 * at 0.5%. On top of that: line weight (an erosion count, and the walls'
 * own offsets), parts never touching (components of the slightly dilated
 * ink) and the hover distances themselves.
 */

// ── A small rasteriser ───────────────────────────────────────────────────────

type Poly = { pts: Pt[]; closed: boolean };

function arcPts(
  p0: Pt,
  rxIn: number,
  ryIn: number,
  phiDeg: number,
  large: number,
  sweep: number,
  p1: Pt
): Pt[] {
  let [rx, ry] = [Math.abs(rxIn), Math.abs(ryIn)];
  if (!rx || !ry) return [p1];
  const phi = (phiDeg * Math.PI) / 180;
  const [cos, sin] = [Math.cos(phi), Math.sin(phi)];
  const [dx, dy] = [(p0[0] - p1[0]) / 2, (p0[1] - p1[1]) / 2];
  const [x1, y1] = [cos * dx + sin * dy, -sin * dx + cos * dy];
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) [rx, ry] = [rx * Math.sqrt(lambda), ry * Math.sqrt(lambda)];
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const co = Math.sqrt(Math.max(0, num / den)) * (large === sweep ? -1 : 1);
  const [cxp, cyp] = [(co * rx * y1) / ry, (-co * ry * x1) / rx];
  const [cx, cy] = [
    cos * cxp - sin * cyp + (p0[0] + p1[0]) / 2,
    sin * cxp + cos * cyp + (p0[1] + p1[1]) / 2,
  ];
  const ang = (ux: number, uy: number, vx: number, vy: number) =>
    Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = ang(1, 0, (x1 - cxp) / rx, (y1 - cyp) / ry);
  let dt = ang(
    (x1 - cxp) / rx,
    (y1 - cyp) / ry,
    (-x1 - cxp) / rx,
    (-y1 - cyp) / ry
  );
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  const n = Math.max(2, Math.ceil(Math.abs(dt) / (Math.PI / 120)));
  return Array.from({ length: n }, (_, k) => {
    const t = t1 + (dt * (k + 1)) / n;
    return [
      cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin,
      cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos,
    ] as Pt;
  });
}

/** Any SVG path (absolute or relative M L H V C S Q T A Z) as polylines. */
function flatten(d: string): Poly[] {
  const tok =
    d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? [];
  const out: Poly[] = [];
  let [i, cmd, prev] = [0, '', ''];
  let cur: Pt = [0, 0];
  let start: Pt = [0, 0];
  let ctrl: Pt = [0, 0];
  let poly: Pt[] = [];
  const num = () => Number(tok[i++]);
  const flush = (closed: boolean) => {
    if (poly.length > 1) out.push({ pts: poly, closed });
    poly = [];
  };
  const bez = (pts: Pt[]) => {
    for (let k = 1; k <= 24; k++) {
      const t = k / 24;
      let q = pts;
      while (q.length > 1)
        q = q
          .slice(1)
          .map(
            (b, j) =>
              [
                q[j][0] + (b[0] - q[j][0]) * t,
                q[j][1] + (b[1] - q[j][1]) * t,
              ] as Pt
          );
      poly.push(q[0]);
    }
  };
  while (i < tok.length) {
    if (/^[a-zA-Z]$/.test(tok[i])) cmd = tok[i++];
    const rel = cmd !== cmd.toUpperCase();
    const P = (): Pt => {
      const [x, y] = [num(), num()];
      return rel ? [cur[0] + x, cur[1] + y] : [x, y];
    };
    const C = cmd.toUpperCase();
    if (C === 'M') {
      flush(false);
      cur = P();
      start = cur;
      poly = [cur];
      cmd = rel ? 'l' : 'L';
    } else if (C === 'L') {
      cur = P();
      poly.push(cur);
    } else if (C === 'H') {
      const x = num();
      cur = [rel ? cur[0] + x : x, cur[1]];
      poly.push(cur);
    } else if (C === 'V') {
      const y = num();
      cur = [cur[0], rel ? cur[1] + y : y];
      poly.push(cur);
    } else if (C === 'C' || C === 'S') {
      const c1: Pt =
        C === 'C'
          ? P()
          : /[CS]/.test(prev)
            ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]]
            : cur;
      const [c2, e] = [P(), P()];
      bez([cur, c1, c2, e]);
      [ctrl, cur] = [c2, e];
    } else if (C === 'Q' || C === 'T') {
      const c1: Pt =
        C === 'Q'
          ? P()
          : /[QT]/.test(prev)
            ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]]
            : cur;
      const e = P();
      bez([cur, c1, e]);
      [ctrl, cur] = [c1, e];
    } else if (C === 'A') {
      const [rx, ry, rot, large, sweep] = [num(), num(), num(), num(), num()];
      const e = P();
      poly.push(...arcPts(cur, rx, ry, rot, large, sweep, e));
      cur = e;
    } else if (C === 'Z') {
      flush(true);
      cur = start;
      poly = [start];
    } else throw new Error(`flatten: "${cmd}"`);
    prev = C;
  }
  flush(false);
  return out;
}

const roundedRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

/**
 * The sampling grid for a rendered size: the parity story's pixels (4× the
 * size, so 8/size units) at 8×8 samples each, over −2…34 (pixel-aligned at
 * 0). `grid(size)` sets it before a comparison.
 */
const [LO, SUB] = [-2, 8];
let [STEP, N] = [1 / 32, 1152];
const grid = (size: number) => {
  [STEP, N] = [8 / size / SUB, (36 * size * SUB) / 8];
};
const at = (k: number) => LO + (k + 0.5) * STEP;

function fillInto(ink: Uint8Array, polys: Poly[], evenodd: boolean) {
  for (let j = 0; j < N; j++) {
    const y = at(j);
    const xs: [number, number][] = [];
    for (const { pts } of polys) {
      pts.forEach((a, k) => {
        const b = pts[(k + 1) % pts.length];
        if (a[1] <= y !== b[1] <= y)
          xs.push([
            a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]),
            b[1] > a[1] ? 1 : -1,
          ]);
      });
    }
    if (!xs.length) continue;
    xs.sort((p, q) => p[0] - q[0]);
    let [w, c, m] = [0, 0, 0];
    for (let k = 0; k < N; k++) {
      const x = at(k);
      while (m < xs.length && xs[m][0] < x)
        [w, c, m] = [w + xs[m][1], c + 1, m + 1];
      if (evenodd ? c % 2 : w) ink[j * N + k] = 1;
    }
  }
}

function strokeInto(ink: Uint8Array, polys: Poly[], width: number) {
  const r = width / 2;
  /** Mark samples in the box around a–b that `hit` says are inside. */
  const mark = (a: Pt, b: Pt, hit: (x: number, y: number) => boolean) => {
    const [k0, k1] = [
      Math.floor((Math.min(a[0], b[0]) - r - LO) / STEP),
      Math.ceil((Math.max(a[0], b[0]) + r - LO) / STEP),
    ];
    const [j0, j1] = [
      Math.floor((Math.min(a[1], b[1]) - r - LO) / STEP),
      Math.ceil((Math.max(a[1], b[1]) + r - LO) / STEP),
    ];
    for (let j = Math.max(0, j0); j < Math.min(N, j1); j++) {
      for (let k = Math.max(0, k0); k < Math.min(N, k1); k++)
        if (hit(at(k), at(j))) ink[j * N + k] = 1;
    }
  };
  for (const { pts, closed } of polys) {
    const n = closed ? pts.length : pts.length - 1;
    for (let s = 0; s < n; s++) {
      // Each segment with butt ends…
      const [a, b] = [pts[s], pts[(s + 1) % pts.length]];
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
      const l2 = dx * dx + dy * dy;
      if (!l2) continue;
      mark(a, b, (x, y) => {
        const t = ((x - a[0]) * dx + (y - a[1]) * dy) / l2;
        return (
          t >= 0 &&
          t <= 1 &&
          Math.abs((x - a[0]) * dy - (y - a[1]) * dx) / Math.sqrt(l2) <= r
        );
      });
      // …and a round join where it meets the next one.
      if (closed || s < n - 1)
        mark(b, b, (x, y) => Math.hypot(x - b[0], y - b[1]) <= r);
    }
  }
}

/** Frame-engine shapes, sampled. */
function cover(shapes: Shapes): Uint8Array {
  const ink = new Uint8Array(N * N);
  for (const a of Object.values(shapes)) {
    if (Number(a.opacity ?? 1) === 0) continue;
    const n = (k: string) => Number(a[k] ?? 0);
    const polys =
      a.tag === 'rect'
        ? flatten(roundedRect(n('x'), n('y'), n('width'), n('height'), n('rx')))
        : flatten(String(a.d ?? ''));
    if (a.fill === 'none') {
      if (a.stroke && !/^0[ ,]/.test(String(a.strokeDasharray ?? '')))
        strokeInto(ink, polys, Number(a.strokeWidth ?? 1));
    } else fillInto(ink, polys, a.fillRule === 'evenodd');
  }
  return ink;
}

/** A Carbon icon at a size, sampled in the 32-unit grid (moved by `shift`, in units). */
function coverCarbon(
  Icon: CarbonIcon,
  size: number,
  [dx, dy]: Pt = [0, 0]
): { ink: Uint8Array } {
  const { container, unmount } = render(<Icon size={size} />);
  const svg = container.querySelector('svg')!;
  const vb = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const ink = new Uint8Array(N * N);
  svg.querySelectorAll('path').forEach((el) => {
    if (
      el.getAttribute('fill') === 'none' ||
      el.getAttribute('opacity') === '0'
    )
      return;
    const polys = flatten(el.getAttribute('d')!).map(({ pts, closed }) => ({
      pts: pts.map(([x, y]) => [(x * 32) / vb + dx, (y * 32) / vb + dy] as Pt),
      closed,
    }));
    fillInto(ink, polys, el.getAttribute('fill-rule') === 'evenodd');
  });
  unmount();
  return { ink };
}

/**
 * The parity story's Δ: each pixel's coverage from its 8×8 samples; the
 * share of ink pixels whose coverage differs by more than a quarter. `clip`
 * keeps to the 32-unit box (the story renders with overflow hidden).
 */
function delta(a: Uint8Array, b: Uint8Array, clip = false): number {
  const [S, P] = [SUB, N / SUB];
  const inBox = (q: number) =>
    !clip || (at(q * S) >= 0 && at(q * S + S - 1) <= 32);
  let [diff, ink] = [0, 0];
  for (let pj = 0; pj < P; pj++) {
    for (let pk = 0; pk < P; pk++) {
      if (!inBox(pj) || !inBox(pk)) continue;
      let [ca, cb] = [0, 0];
      for (let j = pj * S; j < pj * S + S; j++) {
        for (let k = pk * S; k < pk * S + S; k++)
          [ca, cb] = [ca + a[j * N + k], cb + b[j * N + k]];
      }
      if (ca || cb) ink++;
      if (Math.abs(ca - cb) > (S * S) / 4) diff++;
    }
  }
  return ink ? diff / ink : 0;
}

// ── Line weight and touching parts ───────────────────────────────────────────

/** Ink samples that a disc of radius r about them stays inside (24 points round its edge, all ink). */
function eroded(ink: Uint8Array, r: number): number {
  const dirs = Array.from({ length: 24 }, (_, i) => [
    Math.cos((i * Math.PI) / 12) * (r / STEP),
    Math.sin((i * Math.PI) / 12) * (r / STEP),
  ]);
  let n = 0;
  for (let j = 0; j < N; j++) {
    for (let k = 0; k < N; k++) {
      if (!ink[j * N + k]) continue;
      if (
        dirs.every(([dx, dy]) => {
          const [kk, jj] = [Math.round(k + dx), Math.round(j + dy)];
          return (
            kk >= 0 && jj >= 0 && kk < N && jj < N && ink[jj * N + kk] === 1
          );
        })
      )
        n++;
    }
  }
  return n;
}

/** Connected parts of the ink after growing it by r (parts closer than 2r merge). */
function parts(ink: Uint8Array, r: number): number {
  const grown = new Uint8Array(N * N);
  const R = Math.ceil(r / STEP);
  const offs: [number, number][] = [];
  for (let dy = -R; dy <= R; dy++)
    for (let dx = -R; dx <= R; dx++)
      if (Math.hypot(dx, dy) * STEP <= r) offs.push([dx, dy]);
  for (let j = 0; j < N; j++) {
    for (let k = 0; k < N; k++) {
      if (!ink[j * N + k]) continue;
      for (const [dx, dy] of offs) {
        const [kk, jj] = [k + dx, j + dy];
        if (kk >= 0 && jj >= 0 && kk < N && jj < N) grown[jj * N + kk] = 1;
      }
    }
  }
  let count = 0;
  const seen = new Uint8Array(N * N);
  for (let s = 0; s < N * N; s++) {
    if (!grown[s] || seen[s]) continue;
    count++;
    const stack = [s];
    seen[s] = 1;
    while (stack.length) {
      const q = stack.pop()!;
      const [j, k] = [Math.floor(q / N), q % N];
      for (const [jj, kk] of [
        [j - 1, k],
        [j + 1, k],
        [j, k - 1],
        [j, k + 1],
      ]) {
        const t = jj * N + kk;
        if (jj >= 0 && kk >= 0 && jj < N && kk < N && grown[t] && !seen[t]) {
          seen[t] = 1;
          stack.push(t);
        }
      }
    }
  }
  return count;
}

/** The distance from p to the closed polygon `poly`'s edges. */
function toEdges(p: Pt, poly: readonly Pt[]): number {
  let best = Infinity;
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)
      )
    );
    best = Math.min(
      best,
      Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy)
    );
  });
  return best;
}
/** A wall's weight: how far its inner edge's points sit from its outer edge, at the least and typically (median). */
function wall(outer: readonly Pt[], inner: readonly Pt[]) {
  const ds = inner.map((p) => toEdges(p, outer)).sort((a, b) => a - b);
  return { min: ds[0], median: ds[Math.floor(ds.length / 2)] };
}

// ── The cases ────────────────────────────────────────────────────────────────

interface Case {
  name: string;
  outline: FrameHoverIcon;
  filled: FrameHoverIcon;
  toggle: FrameToggleIcon<'off' | 'on'>;
  carbon: readonly [CarbonIcon, CarbonIcon];
  /** Separate parts at the [outline, filled] end (they must stay apart through the hover). */
  pieces: [number, number];
  /**
   * Ink past 2px allowed beyond the rest's, as a share of the 2px core. Earth: as the hover turns the globe, coasts
   * meet the rim and Africa's south-west closes against it (see its case).
   */
  junctions?: number;
  /** The share of the 2px core that must remain. */
  core?: number;
  /** Rests on its own reference drawing rather than Carbon's (Earth: its own world map on the globe); [outline, filled] at h. */
  reference?: (h: number) => [Uint8Array, Uint8Array];
  /** The share of ink that may differ from the reference (default GATE). */
  gate?: number;
}

/**
 * Earth drawn independently: the rim (a 2px stroke on r 13 + 0.5h), and the
 * reference map (earthGlobe.ts: its coasts, rounded) wrapped round the sphere here by
 * hand, seen from the equator: a map point (x, y) at longitude
 * λ = (x − 52.7)/14 plus the hover's turn and latitude φ = (19.4 − y)/14 lands
 * at (16 + 14·cos φ·sin λ, 16 − 14·sin φ) on the near side, and on past the
 * limb along its row behind it. Its coasts are stroked 2px (round joins, as
 * this sampler draws them) and cut to the circle r 13 + 0.5h; filled is the
 * land inside them too.
 */
function earthReference(h: number): [Uint8Array, Uint8Array] {
  const R = 13 + 0.5 * h;
  const land: Poly[] = mapCoasts().map((q) => ({
    closed: true,
    pts: q.map(([x, y]): Pt => {
      const [l, f] = [(x - 52.7) / 14 + EARTH_HOVER_TURN * h, (19.4 - y) / 14];
      const near = Math.min(Math.abs(l), Math.PI / 2);
      return [
        16 +
          Math.sign(l) *
            14 *
            (Math.cos(f) * Math.sin(near) + Math.abs(l) - near),
        16 - 14 * Math.sin(f),
      ];
    }),
  }));
  const [inside, line] = [new Uint8Array(N * N), new Uint8Array(N * N)];
  fillInto(inside, land, false);
  strokeInto(line, land, 2);
  const [o, f] = [new Uint8Array(N * N), new Uint8Array(N * N)];
  for (let j = 0; j < N; j++) {
    for (let k = 0; k < N; k++) {
      const q = j * N + k;
      const r = Math.hypot(at(k) - 16, at(j) - 16);
      const rim = Math.abs(r - R) <= 1;
      const inDisc = r <= R;
      o[q] = rim || (inDisc && line[q]) ? 1 : 0;
      f[q] = rim || (inDisc && (inside[q] || line[q])) ? 1 : 0;
    }
  }
  return [o, f];
}

const CASES: Case[] = [
  {
    name: 'Star',
    outline: Star,
    filled: StarFilled,
    toggle: StarToggle,
    carbon: [CStar, CStarFilled],
    pieces: [1, 1],
  },
  {
    name: 'ThumbsUp',
    outline: ThumbsUp,
    filled: ThumbsUpFilled,
    toggle: ThumbsUpToggle,
    carbon: [CThumbsUp, CThumbsUpFilled],
    pieces: [1, 2],
  },
  {
    name: 'ThumbsDown',
    outline: ThumbsDown,
    filled: ThumbsDownFilled,
    toggle: ThumbsDownToggle,
    carbon: [CThumbsDown, CThumbsDownFilled],
    pieces: [1, 2],
  },
  {
    name: 'Trophy',
    outline: Trophy,
    filled: TrophyFilled,
    toggle: TrophyToggle,
    carbon: [CTrophy, CTrophyFilled],
    pieces: [1, 1],
  },
  {
    name: 'Time',
    outline: Time,
    filled: TimeFilled,
    toggle: TimeToggle,
    carbon: [CTime, CTimeFilled],
    pieces: [2, 1],
  },
  {
    name: 'Location',
    outline: Location,
    filled: LocationFilled,
    toggle: LocationToggle,
    carbon: [CLocation, CLocationFilled],
    pieces: [2, 1],
  },
  {
    name: 'Earth',
    outline: Earth,
    filled: EarthFilled,
    toggle: EarthToggle,
    carbon: [CEarth, CEarthFilled],
    pieces: [1, 1],
    // The hover turns the globe: as the land turns towards the rim, coasts close up against it and their walls meet
    // the rim's.
    junctions: 0.22,
    reference: (h) => earthReference(h),
    // The drawing's joins are mitred and its Labrador and Florida end square, where this sampler draws them round: at
    // his many corners that is 1.0% of the ink, where the other icons are within 0.5%.
    gate: 0.012,
  },
];

const SIZES = [16, 20, 24, 32];
const STEPS = [0, 0.1, 0.25, 0.4, 0.5, 0.75, 0.9, 1];
const HS = [0, 0.5, 1];
const GATE = 0.005;
const frames = STEPS.flatMap((h) =>
  STEPS.flatMap((p) => [
    { h, p, e: 0 },
    { h, p: 1, e: p },
  ])
);

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

const noBad = (shapes: Shapes, where: string) => {
  for (const [k, attrs] of Object.entries(shapes)) {
    for (const [a, v] of Object.entries(attrs))
      expect(
        /NaN|Infinity|undefined/.test(String(v)),
        `${k}.${a} ${where}`
      ).toBe(false);
  }
};

describe.each(CASES)(
  '$name',
  ({
    outline,
    filled,
    toggle,
    carbon,
    pieces,
    junctions = 0.02,
    core = 0.92,
    reference,
    gate = GATE,
  }) => {
    it('keeps the same shape keys across the h / p / e grid at every size, and never paints NaN', () => {
      for (const size of SIZES) {
        const rest = Object.keys(toggle.geo({ h: 0, p: 0, e: 0 }, size)).sort();
        for (const fr of frames) {
          const shapes = toggle.geo(fr, size);
          expect(
            Object.keys(shapes).sort(),
            `${JSON.stringify(fr)} @${size}`
          ).toEqual(rest);
          noBad(shapes, `${JSON.stringify(fr)} @${size}`);
        }
        for (const h of STEPS) {
          for (const icon of [outline, filled]) {
            const shapes = icon.geo({ h }, size);
            expect(Object.keys(shapes).sort()).toEqual(rest);
            noBad(shapes, `h=${h} @${size}`);
          }
        }
      }
    });

    it("toggle ends are the hover icons, at every h and size (each state's hover is its own icon's)", () => {
      for (const size of SIZES) {
        for (const h of STEPS) {
          expect(
            toggle.geo({ h, p: 0, e: 0 }, size),
            `off h=${h} @${size}`
          ).toEqual(outline.geo({ h }, size));
          expect(
            toggle.geo({ h, p: 1, e: 0 }, size),
            `on h=${h} @${size}`
          ).toEqual(filled.geo({ h }, size));
        }
      }
    });

    // (Earth's hover turns the globe instead of panning the map: core test/earth.test.ts covers it.)
    it.runIf(!!reference)('rests on its reference drawing, both ends', () => {
      grid(32);
      for (const h of [0]) {
        const [o, f] = reference!(h);
        expect(
          delta(cover(outline.geo({ h })), o),
          `outline h=${h}`
        ).toBeLessThan(gate);
        expect(
          delta(cover(filled.geo({ h })), f),
          `filled h=${h}`
        ).toBeLessThan(gate);
      }
    });

    it.runIf(!reference)(
      "rests on Carbon's static icons (both ends, each size, as the parity story measures)",
      () => {
        for (const size of SIZES) {
          grid(size);
          for (const [icon, Carbon] of [
            [outline, carbon[0]],
            [filled, carbon[1]],
          ] as const) {
            const d = delta(
              cover(icon.geo({ h: 0 }, size)),
              coverCarbon(Carbon, size).ink,
              true
            );
            expect(d, `${icon.displayName} @${size}`).toBeLessThan(GATE);
          }
        }
      }
    );

    it('empties back to the outline: a full hole leaves the off end', () => {
      for (const size of SIZES) {
        grid(size);
        for (const h of HS)
          expect(
            delta(
              cover(toggle.geo({ h, p: 1, e: 1 }, size)),
              cover(toggle.geo({ h, p: 0, e: 0 }, size))
            ),
            `h=${h} @${size}`
          ).toBeLessThan(GATE);
      }
    });

    it('keeps its line weight through the hover (no wall thickens or thins)', () => {
      grid(16);
      const rest = cover(outline.geo({ h: 0 }));
      const [a0, b0] = [eroded(rest, 0.85), eroded(rest, 1.15)];
      expect(a0).toBeGreaterThan(0);
      for (const h of [0.25, 0.5, 0.75, 1]) {
        const ink = cover(outline.geo({ h }));
        // A thinner wall loses its core (fewer survive 0.85); a thicker one keeps some past 1.15.
        expect(eroded(ink, 0.85), `core h=${h}`).toBeGreaterThan(a0 * core);
        expect(eroded(ink, 1.15), `past 2px h=${h}`).toBeLessThan(
          b0 * 1.6 + a0 * junctions
        );
      }
    });

    it('parts never touch: the same separate parts at every h, at both ends', () => {
      grid(8);
      for (const [icon, n] of [
        [outline, pieces[0]],
        [filled, pieces[1]],
      ] as const) {
        for (const h of [0, 0.25, 0.5, 0.75, 1])
          expect(
            parts(cover(icon.geo({ h })), 0.45),
            `${icon.displayName} h=${h}`
          ).toBe(n);
      }
    });

    it('moves on hover', () => {
      expect(JSON.stringify(outline.geo({ h: 1 }))).not.toBe(
        JSON.stringify(outline.geo({ h: 0 }))
      );
      expect(JSON.stringify(filled.geo({ h: 1 }))).not.toBe(
        JSON.stringify(filled.geo({ h: 0 }))
      );
    });

    it.each(['off', 'on'] as const)(
      'renders with initial="%s", animated and static, toggles on click, and uses no masks',
      (initial) => {
        const onToggle = vi.fn();
        const Toggle = toggle;
        const { container } = render(
          <MotionIconProvider animated>
            <Toggle initial={initial} onToggle={onToggle} aria-label="t" />
          </MotionIconProvider>
        );
        const svg = container.querySelector('svg')!;
        expect(svg.querySelector('mask, clipPath')).toBeNull();
        expect(svg.querySelectorAll('[data-k]').length).toBe(
          Object.keys(
            toggle.geo({ h: 0, p: initial === 'on' ? 1 : 0, e: 0 }, 32)
          ).length
        );
        fireEvent.click(svg);
        expect(onToggle).toHaveBeenCalledWith(
          initial === 'off' ? 'on' : 'off',
          initial === 'off'
        );
        expect(
          render(
            <Toggle initial={initial} animated={false} aria-label="t" />
          ).container.querySelector('svg')
        ).not.toBeNull();
        for (const Icon of [outline, filled]) {
          const r = render(
            <MotionIconProvider animated>
              <Icon aria-label="h" />
            </MotionIconProvider>
          );
          expect(r.container.querySelector('svg [data-k]')).not.toBeNull();
          expect(r.container.querySelector('mask, clipPath')).toBeNull();
        }
      }
    );
  }
);

// ── The hover distances ──────────────────────────────────────────────────────

describe('hover distances', () => {
  const bounds = (d: string) => {
    const pts = d
      .split(/(?=M)/)
      .filter((s) => s.trim())
      .flatMap((s) => pathPoints(s, 0.1));
    const xs = pts.map(([x]) => x),
      ys = pts.map(([, y]) => y);
    return {
      x0: Math.min(...xs),
      x1: Math.max(...xs),
      y0: Math.min(...ys),
      y1: Math.max(...ys),
    };
  };

  it('Star grows 12.5% about its centre: tips reach 1.94px, every edge 0.86px, the wall holds', () => {
    const [rest, hov] = [starArt(0), starArt(1)];
    const tip = (pts: readonly Pt[]) =>
      Math.hypot(pts[0][0] - STAR_CENTRE[0], pts[0][1] - STAR_CENTRE[1]);
    expect(tip(hov.outer) - tip(rest.outer)).toBeCloseTo(1.935, 2);
    for (let i = 0; i < rest.outer.length; i++) {
      const [a, b] = [rest.outer[i], hov.outer[i]];
      const s =
        Math.hypot(b[0] - STAR_CENTRE[0], b[1] - STAR_CENTRE[1]) /
        Math.hypot(a[0] - STAR_CENTRE[0], a[1] - STAR_CENTRE[1]);
      expect(s).toBeCloseTo(1.125, 2);
    }
    // Every edge, outer and inner, moves out the same 0.51px along its own normal (so it stays parallel):
    // each wall keeps its weight, whatever Carbon drew it as.
    for (const size of [16, 32]) {
      const [a, b] = [starArt(0, size), starArt(1, size)];
      for (const key of ['outer', 'inner'] as const) {
        const [ra, rb] = [a[key], b[key]];
        ra.forEach((p0, i) => {
          const [p1, q0, q1] = [
            ra[(i + 1) % ra.length],
            rb[i],
            rb[(i + 1) % rb.length],
          ];
          const [ux, uy] = [p1[0] - p0[0], p1[1] - p0[1]];
          const l = Math.hypot(ux, uy);
          const off = (q: Pt) =>
            Math.abs((q[0] - p0[0]) * uy - (q[1] - p0[1]) * ux) / l;
          expect(off(q0), `${key} edge ${i} @${size}`).toBeCloseTo(
            0.125 * 6.85,
            6
          );
          expect(off(q1), `${key} edge ${i} @${size}`).toBeCloseTo(
            0.125 * 6.85,
            6
          );
        });
      }
    }
    const w = wall(starArt(0).outer, starArt(0).inner);
    expect(w.median).toBeGreaterThan(1.95);
    expect(w.median).toBeLessThan(2.1);
  });

  it('Thumbs: the whole thumb, cuff and hand, lifts 2px (up / down); the gap and every wall stay 2px through the fill and the rock', () => {
    for (const icon of [ThumbsUp, ThumbsUpFilled]) {
      const [a, b] = [
        bounds(String(icon.geo({ h: 0 }).thumb.d)),
        bounds(String(icon.geo({ h: 1 }).thumb.d)),
      ];
      expect(a.y0 - b.y0).toBeCloseTo(2, 3);
      expect(a.y1 - b.y1).toBeCloseTo(2, 3); // the cuff's foot lifts with it
      expect(b.x0).toBeCloseTo(a.x0, 6);
    }
    for (const icon of [ThumbsDown, ThumbsDownFilled]) {
      const [a, b] = [
        bounds(String(icon.geo({ h: 0 }).thumb.d)),
        bounds(String(icon.geo({ h: 1 }).thumb.d)),
      ];
      expect(b.y1 - a.y1).toBeCloseTo(2, 3);
      expect(b.y0 - a.y0).toBeCloseTo(2, 3);
    }
    for (const k of [0, 0.5, 1]) {
      for (const r of [0, 0.5, 1]) {
        for (const [o, i] of thumbWalls(1, k, r)) {
          const w = wall(o, i);
          expect(w.min, `k=${k} r=${r}`).toBeGreaterThan(1.99);
          expect(w.median, `k=${k} r=${r}`).toBeCloseTo(2, 2);
        }
        const t = thumbParts(0, k, r);
        if (k === 1) expect(t.xl - t.xc).toBeCloseTo(2, 6); // the filled gap
      }
    }
  });

  it("Thumbs: the toggle in plays the reference's rock (rest → rocked in 150ms → rest in 150ms) on linear time", () => {
    expect(thumbRock(0)).toBe(0);
    expect(ROCK_PEAK * THUMB_IN_MS).toBeCloseTo(150, 6); // up in 150ms
    expect((1 - ROCK_PEAK) * THUMB_IN_MS).toBeCloseTo(150, 6); // back in 150ms
    expect(thumbRock(ROCK_PEAK)).toBeCloseTo(1, 6);
    expect(thumbRock(1)).toBeCloseTo(0, 6);
    // The fill is complete by 150ms of the 300 (only the two parts' outer edges remain), not before.
    const subpaths = (p: number) =>
      String(ThumbsUpToggle.geo({ h: 0, p, e: 0 }).thumb.d).split('M').length -
      1;
    expect(subpaths(150 / THUMB_IN_MS)).toBe(2);
    // (On the entrance curve the disc is all but there by 120ms, so look at 100ms.)
    expect(subpaths(100 / THUMB_IN_MS)).toBeGreaterThan(2);
    // At the peak the hand's centreline runs through the reference's rocked points (comp − (1, 1)).
    const { hand } = thumbParts(0, 0, 1);
    expect(hand[0][0]).toBeCloseTo(9, 2); // the hand's foot on the cuff holds
    expect(hand[7]).toEqual([9, expect.closeTo(29, 2)]);
    const onLine = (q: Pt, a: Pt, b: Pt) =>
      Math.abs((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0])) /
      Math.hypot(b[0] - a[0], b[1] - a[1]);
    expect(onLine([16.574, 12.41], hand[4], hand[5])).toBeLessThan(1e-6); // the fingers' top run
    expect(onLine([27.968, 13.988], hand[5], hand[6])).toBeLessThan(1e-6); // the fingers' side run
    // Back to outline the hand holds still: only the emptying plays (the hand's top stays where it rests).
    for (const e of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      expect(
        bounds(String(ThumbsUpToggle.geo({ h: 0, p: 1, e }).thumb.d)).y0,
        `e=${e}`
      ).toBeCloseTo(3, 2);
      expect(
        bounds(String(ThumbsDownToggle.geo({ h: 0, p: 1, e }).thumb.d)).y1,
        `down e=${e}`
      ).toBeCloseTo(29, 2);
    }
    // Mid-toggle the hand is rocked; at either end it is not.
    expect(ThumbsUpToggle.geo({ h: 0, p: ROCK_PEAK, e: 0 })).not.toEqual(
      ThumbsUpToggle.geo({ h: 0, p: 1, e: 0 })
    );
  });

  it("Thumbs: through every frame of the toggle (in and out) the hand's left edge runs clean (no step or notch) and its wall stays 2px", () => {
    grid(32);
    const frames = [
      ...Array.from({ length: 31 }, (_, i) => ({ p: i / 30, e: 0 })), // in: 0–300ms
      ...Array.from({ length: 11 }, (_, i) => ({ p: 1, e: i / 10 })), // out: 0–110ms
    ];
    for (const [T, flip] of [
      [ThumbsUpToggle, false],
      [ThumbsDownToggle, true],
    ] as const)
      for (const { p, e } of frames) {
        const ink = cover(T.geo({ h: 0, p, e }));
        // The hand's left edge beyond the cuff (y 5–16, mirrored for thumbs down): its leftmost ink, row by row (every 1/32).
        let prev: number | null = null;
        for (let j = 0; j < N; j++) {
          const y = flip ? 32 - at(j) : at(j);
          if (y < 5 || y > 15.9) continue;
          let x: number | null = null;
          // (A run of at least 1/8px, so a cut lying exactly on an edge, which cancels, isn't read as ink.)
          for (let k = 0; k < N - 4; k++)
            if (
              at(k) >= 7 &&
              ink[j * N + k] &&
              ink[j * N + k + 1] &&
              ink[j * N + k + 2] &&
              ink[j * N + k + 3]
            ) {
              x = at(k);
              break;
            }
          if (x !== null && prev !== null)
            expect(
              Math.abs(x - prev),
              `p=${p} e=${e} y=${y.toFixed(2)}`
            ).toBeLessThan(0.2);
          prev = x;
        }
      }
    // The hand's wall is a 2px band at every point of the rock.
    for (let i = 0; i <= 20; i++) {
      const [, [o, inner]] = thumbWalls(0, 0, thumbRock(i / 20));
      const w = wall(o, inner);
      expect(w.min, `rock ${i / 20}`).toBeGreaterThan(1.99);
      expect(w.median, `rock ${i / 20}`).toBeCloseTo(2, 2);
    }
  });

  it('Trophy: the cup and handles grow 1/7 about the stem top at constant weight, the base widens 1px each side', () => {
    const [a, b] = [
      bounds(String(Trophy.geo({ h: 0 }).trophy.d)),
      bounds(String(Trophy.geo({ h: 1 }).trophy.d)),
    ];
    expect(a.y0 - b.y0).toBeCloseTo(17 / 7, 2); // the rim: 2.43px higher
    expect(a.x0 - b.x0).toBeCloseTo(11 / 7, 2); // the handles: 1.57px further out
    expect(b.y1).toBeCloseTo(a.y1, 6); // the base's foot holds
    const outer = (h: number) => bounds(trophyArt(h).outer.split(/(?=M)/)[0]);
    const cup = (h: number) => bounds(trophyArt(h).cup);
    for (const h of [0, 0.5, 1]) {
      // The cup's wall stays 2px: its inside sits 2px in from its outside at the rim and the sides.
      const [o, c] = [outer(h), cup(h)];
      expect(c.y0 - o.y0, `rim h=${h}`).toBeCloseTo(2, 2);
      const side = 16 - 8 - (8 - 1) * (h / 7); // the cup's left outer edge: its centreline (x 9) scaled, less 1
      expect(c.x0 - side, `side h=${h}`).toBeCloseTo(2, 2);
      expect(
        Math.abs(c.y1 - cup(0).y1),
        `the bowl stays on the stem h=${h}`
      ).toBeLessThan(0.15);
    }
    expect(cup(1).x1 - cup(1).x0 - (cup(0).x1 - cup(0).x0)).toBeCloseTo(2, 2);
    // The stem stays x 15–17, the base widens: x 10–22 → 9–23.
    const d1 = String(Trophy.geo({ h: 1 }).trophy.d);
    expect(d1).toContain('L15 26L9 26L9 28L23 28L23 26L17 26');
  });

  it('Time: the ring grows 1px, the minute hand turns 90° clockwise and the hour hand 7.5°, joined at the centre', () => {
    const [a, b] = [timeArt(0, 0), timeArt(1, 0)];
    expect(b.r - a.r).toBeCloseTo(1, 6);
    expect(b.w).toBe(a.w);
    // The minute hand's tip (the polygon's first and last points straddle it).
    const tipAngle = (hd: Pt[]) =>
      Math.atan2(
        (hd[0][0] + hd[hd.length - 1][0]) / 2 - 16,
        16 - (hd[0][1] + hd[hd.length - 1][1]) / 2
      ) *
      (180 / Math.PI);
    expect(tipAngle(b.hands) - tipAngle(a.hands)).toBeCloseTo(90, 3);
    // The hour hand's tip (its butt end's two corners straddle it).
    const hourAngle = (hd: Pt[]) =>
      Math.atan2(
        (hd[2][0] + hd[3][0]) / 2 - 16,
        16 - (hd[2][1] + hd[3][1]) / 2
      ) *
      (180 / Math.PI);
    expect(hourAngle(b.hands) - hourAngle(a.hands)).toBeCloseTo(7.5, 3);
    // Both butt ends stay 2px wide; the hands are one stroke, mitred at the centre.
    for (const hd of [a.hands, b.hands]) {
      expect(Math.hypot(hd[0][0] - hd[5][0], hd[0][1] - hd[5][1])).toBeCloseTo(
        2,
        6
      );
      expect(Math.hypot(hd[2][0] - hd[3][0], hd[2][1] - hd[3][1])).toBeCloseTo(
        2,
        6
      );
    }
  });

  it('Location: the head lifts 2px and grows 1px in diameter, the eye grows 1px, the point stays, the wall stays 2px', () => {
    const [a, b] = [pinArt(0), pinArt(1)];
    expect(a.head[1] - b.head[1]).toBe(PIN_LIFT);
    expect(b.eye - a.eye).toBe(0.5);
    const [ba, bb] = [bounds(a.outer), bounds(b.outer)];
    expect(bb.y1).toBeCloseTo(ba.y1, 6);
    expect(ba.y0 - bb.y0).toBeCloseTo(2.5, 2);
    expect(bb.x1 - bb.x0 - (ba.x1 - ba.x0)).toBeCloseTo(1, 2);
    for (const art of [a, b]) {
      const w = wall(pathPoints(art.outer, 0.1), pathPoints(art.inner, 0.1));
      expect(w.min).toBeCloseTo(2, 2);
    }
  });

  it('Earth: the hover turns the globe as far as the old pan moved the map (its centre 4px) as the rim and its clip grow r 13 → 13.5', () => {
    const [a, b] = [earthTurnArt(0, 0), earthTurnArt(EARTH_HOVER_TURN, 1)];
    expect(14 * Math.sin(EARTH_HOVER_TURN)).toBeCloseTo(4, 9);
    expect(a.R).toBe(13);
    expect(b.R).toBe(13.5);
    // Everything of the map lies inside the clip circle.
    for (const q of [...b.stroke, ...b.inside])
      for (const [x, y] of q)
        expect(Math.hypot(x - 16, y - 16)).toBeLessThanOrEqual(13.5 + 1e-6);
    // The map is the reference's (Earth-globe-full_mo_02.svg, its units ÷ 10; spot checks): the Americas (with Labrador, Florida
    // and the isthmus drawn out and back), Eurasia and Africa, Australia.
    expect(EARTH_MAP.map((s) => s.length)).toEqual([22, 27, 8]);
    expect(EARTH_MAP[0][6]).toEqual([36.2167, 5.89]);
    expect(EARTH_MAP[1][9]).toEqual([80.5814, 22.7338]);
  });
});
