/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  Column as CColumn,
  Compare as CCompare,
  Fade as CFade,
  Grid as CGrid,
  List as CList,
  Popup as CPopup,
  Query as CQuery,
  Split as CSplit,
  Table as CTable,
  TableSplit as CTableSplit,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  Column,
  Compare,
  Fade,
  Grid,
  List,
  LIST_GRID_CUT,
  LIST_GRID_MS,
  ListToggle,
  Popup,
  Query,
  Split,
  Table,
  TABLE_WIDEN,
  TableSplit,
} from '../../icons/data/viewSwitch';

/**
 * The view and layout switches (viewSwitch.ts) and List ⇄ Grid.
 *
 *  - The same shape keys at every hover (and toggle h, p, e) frame and
 *    size, and no NaN or Infinity; everything inside the 36×36 hover box.
 *  - Rest parity with Carbon at 16 / 20 / 24 / 32 by coverage (people.test's
 *    sampler, which mirrors the browser Parity story; gated at 0.5%).
 *  - Constant line weight through the hover: every line-art shape's widest
 *    inscribed disc holds (2px walls stay 2px), and nothing is transformed.
 *  - Separate parts never touch (no shared ink, a clear gap).
 *  - The toggle's ends equal the List and Grid hover icons.
 *  - The distances the module's doc gives.
 */

// ── A small rasteriser (as opsFillToggles.test.tsx) ──────────────────────────

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

/**
 * The sampling grid for a rendered size: the parity story's pixels (4× the
 * size, so 8/size units) at 8×8 samples each, over −2…34. `grid(size)` sets
 * it before a comparison.
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

/** A circle as a path. */
const circleD = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
/** A shape's outline as a path (Query's dot is a <circle>, as Carbon's is). */
const dOf = (a: Shapes[string]) =>
  a.tag === 'circle'
    ? circleD(Number(a.cx), Number(a.cy), Number(a.r))
    : String(a.d ?? '');

/** Frame-engine shapes (all filled outlines here), sampled. */
function cover(shapes: Shapes): Uint8Array {
  const ink = new Uint8Array(N * N);
  for (const a of Object.values(shapes))
    fillInto(ink, flatten(dOf(a)), a.fillRule === 'evenodd');
  return ink;
}

/** A Carbon icon at a size, sampled in the 32-unit grid. */
function coverCarbon(Icon: CarbonIcon, size: number): Uint8Array {
  const { container, unmount } = render(<Icon size={size} />);
  const svg = container.querySelector('svg')!;
  const vb = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const ink = new Uint8Array(N * N);
  svg.querySelectorAll('path, circle').forEach((el) => {
    if (el.getAttribute('fill') === 'none') return;
    const d =
      el.tagName === 'circle'
        ? circleD(
            ...(['cx', 'cy', 'r'].map((a) => Number(el.getAttribute(a))) as [
              number,
              number,
              number,
            ])
          )
        : el.getAttribute('d')!;
    const polys = flatten(d).map(({ pts, closed }) => ({
      pts: pts.map(([x, y]) => [(x * 32) / vb, (y * 32) / vb] as Pt),
      closed,
    }));
    fillInto(ink, polys, el.getAttribute('fill-rule') === 'evenodd');
  });
  unmount();
  return ink;
}

/** The parity story's Δ, inside the 32-unit box. */
function delta(a: Uint8Array, b: Uint8Array): number {
  const [S, P] = [SUB, N / SUB];
  const inBox = (q: number) => at(q * S) >= 0 && at(q * S + S - 1) <= 32;
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

// ── Line weight: the widest inscribed disc ───────────────────────────────────

/** Felzenszwalb's 1D squared distance transform of f (in place into d). */
function edt1d(
  f: Float64Array,
  n: number,
  d: Float64Array,
  v: Int32Array,
  z: Float64Array
) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  const s = (q: number, p: number) =>
    (f[q] + q * q - (f[p] + p * p)) / (2 * q - 2 * p);
  for (let q = 1; q < n; q++) {
    let x = s(q, v[k]);
    while (x <= z[k]) x = s(q, v[--k]);
    v[++k] = q;
    z[k] = x;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) ** 2 + f[v[k]];
  }
}

/** The largest distance (in units) from a sample of `ink` to an empty one: half the widest stroke. */
function inscribed(ink: Uint8Array): number {
  // Crop to the ink, with a margin of empty samples.
  let [j0, j1, k0, k1] = [N, -1, N, -1];
  for (let j = 0; j < N; j++)
    for (let k = 0; k < N; k++)
      if (ink[j * N + k])
        [j0, j1, k0, k1] = [
          Math.min(j0, j),
          Math.max(j1, j),
          Math.min(k0, k),
          Math.max(k1, k),
        ];
  if (j1 < 0) return 0;
  const [W, H] = [k1 - k0 + 3, j1 - j0 + 3];
  const BIG = 1e12;
  const g = new Float64Array(W * H);
  for (let j = 0; j < H; j++) {
    for (let k = 0; k < W; k++) {
      const [jj, kk] = [j0 - 1 + j, k0 - 1 + k];
      g[j * W + k] =
        jj >= 0 && jj < N && kk >= 0 && kk < N && ink[jj * N + kk] ? BIG : 0;
    }
  }
  const L = Math.max(W, H);
  const [f, d, z, v] = [
    new Float64Array(L),
    new Float64Array(L),
    new Float64Array(L + 1),
    new Int32Array(L),
  ];
  for (let k = 0; k < W; k++) {
    for (let j = 0; j < H; j++) f[j] = g[j * W + k];
    edt1d(f, H, d, v, z);
    for (let j = 0; j < H; j++) g[j * W + k] = d[j];
  }
  let best = 0;
  for (let j = 0; j < H; j++) {
    for (let k = 0; k < W; k++) f[k] = g[j * W + k];
    edt1d(f, W, d, v, z);
    for (let k = 0; k < W; k++) best = Math.max(best, d[k]);
  }
  return Math.sqrt(best) * STEP;
}

// ── Gaps ─────────────────────────────────────────────────────────────────────

/** Outline points, sampled every ~0.1 along each edge. */
const outline = (d: string): Pt[] =>
  flatten(d).flatMap(({ pts }) =>
    pts.flatMap((a, i) => {
      const b = pts[(i + 1) % pts.length];
      const n = Math.max(
        1,
        Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.1)
      );
      return Array.from(
        { length: n },
        (_, k) =>
          [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n] as Pt
      );
    })
  );
/** The narrowest gap between two parts' outlines. */
function gap(a: string, b: string): number {
  const [p, q] = [outline(a), outline(b)];
  let m = Infinity;
  for (const [x, y] of p)
    for (const [u, v] of q) m = Math.min(m, Math.hypot(x - u, y - v));
  return m;
}

// ── The icons ────────────────────────────────────────────────────────────────

interface Case {
  name: string;
  icon: FrameHoverIcon;
  carbon: CarbonIcon;
  /** Separate parts that must never touch. */
  apart: [string, string][];
  /** Parts that are one ink at rest (Carbon draws them joined) and must part once the hover starts. */
  part?: [string, string][];
  /** Parts that may meet mid-hover by design (a dash passing behind a solid half), apart at rest and hovered. */
  ends?: [string, string][];
  /** Solid shapes (dots, bullets), left out of the line-weight check. */
  solid?: string[];
  /**
   * The widest inscribed half-width allowed in a 2px-walled shape where its
   * walls meet (Carbon's own joints): a T is 1.25, a cross √2, an
   * arrowhead's tip 1.73, the question mark's bend 1.19. Default 1.06.
   */
  joint?: number;
}

const ROWS = [0, 1, 2];
const CASES: Case[] = [
  {
    name: 'List',
    icon: List,
    carbon: CList,
    solid: ROWS.map((i) => `bullet${i}`),
    apart: [
      ...ROWS.map((i) => [`bullet${i}`, `line${i}`] as [string, string]),
      ['line0', 'line1'],
      ['line1', 'line2'],
      ['bullet0', 'bullet1'],
      ['bullet1', 'bullet2'],
    ],
  },
  {
    name: 'Grid',
    icon: Grid,
    carbon: CGrid,
    apart: [
      ['tile0', 'tile1'],
      ['tile0', 'tile2'],
      ['tile1', 'tile3'],
      ['tile2', 'tile3'],
      ['tile0', 'tile3'],
      ['tile1', 'tile2'],
    ],
  },
  { name: 'Table', icon: Table, carbon: CTable, apart: [], joint: 1.26 },
  {
    name: 'TableSplit',
    icon: TableSplit,
    carbon: CTableSplit,
    apart: [],
    joint: 1.42,
  },
  {
    name: 'Column',
    icon: Column,
    carbon: CColumn,
    apart: [['column', 'rules']],
  },
  {
    name: 'Split',
    icon: Split,
    carbon: CSplit,
    apart: [['left', 'right']],
    part: [
      ['left', 'line'],
      ['right', 'line'],
    ],
  },
  { name: 'Compare', icon: Compare, carbon: CCompare, apart: [], joint: 1.74 },
  {
    name: 'Fade',
    icon: Fade,
    carbon: CFade,
    apart: [],
    ends: [['half', 'dashes']],
  },
  { name: 'Popup', icon: Popup, carbon: CPopup, apart: [['front', 'back']] },
  {
    name: 'Query',
    icon: Query,
    carbon: CQuery,
    solid: ['dot'],
    joint: 1.2,
    apart: [
      ['mark', 'lens'],
      ['mark', 'handle'],
      ['dot', 'lens'],
      ['dot', 'mark'],
    ],
  },
];

const SIZES = [16, 20, 24, 32];
const STEPS = [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1];
const GATE = 0.005;

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

/** Every point a set of shapes paints. */
const pointsOf = (shapes: Shapes) =>
  Object.values(shapes).flatMap((a) => flatten(dOf(a)).flatMap((q) => q.pts));
/** The bounding box [x0, y0, x1, y1] of a path. */
const box = (d: string) => {
  const pts = flatten(d).flatMap((p) => p.pts);
  return [
    Math.min(...pts.map(([x]) => x)),
    Math.min(...pts.map(([, y]) => y)),
    Math.max(...pts.map(([x]) => x)),
    Math.max(...pts.map(([, y]) => y)),
  ];
};
/** Shared ink between two shapes at the 32px grid. */
const shared = (a: Shapes[string], b: Shapes[string]) => {
  const [ia, ib] = [cover({ a }), cover({ b })];
  let n = 0;
  for (let k = 0; k < ia.length; k++) n += ia[k] & ib[k];
  return n;
};

const parity: Record<string, Record<string, number>> = {};
const weights: Record<string, string[]> = {};

describe.each(CASES)(
  '$name',
  ({
    name,
    icon,
    carbon,
    apart,
    part = [],
    ends = [],
    solid = [],
    joint = 1.06,
  }) => {
    it('stays inside the 36×36 hover box (−2…34) at every frame and size', () => {
      for (const size of SIZES) {
        for (const h of STEPS) {
          const pts = pointsOf(icon.geo({ h }, size));
          expect(
            Math.min(...pts.flat()),
            `h=${h} @${size}`
          ).toBeGreaterThanOrEqual(-2 - 1e-6);
          expect(
            Math.max(...pts.flat()),
            `h=${h} @${size}`
          ).toBeLessThanOrEqual(34 + 1e-6);
        }
      }
    });

    it('keeps the same shape keys at every hover frame and size, and never paints NaN or Infinity', () => {
      for (const size of SIZES) {
        const rest = Object.keys(icon.geo({ h: 0 }, size));
        for (const h of STEPS) {
          const shapes = icon.geo({ h }, size);
          expect(Object.keys(shapes), `h=${h} @${size}`).toEqual(rest);
          for (const [k, attrs] of Object.entries(shapes)) {
            for (const [a, v] of Object.entries(attrs))
              expect(
                /NaN|Infinity|undefined/.test(String(v)),
                `${k}.${a} h=${h} @${size}`
              ).toBe(false);
          }
        }
      }
    });

    it("rests on Carbon's icon at 16, 20, 24 and 32 (within 0.5%, as the parity story measures)", () => {
      parity[name] = {};
      for (const size of SIZES) {
        grid(size);
        const d = delta(
          cover(icon.geo({ h: 0 }, size)),
          coverCarbon(carbon, size)
        );
        parity[name][size] = d;
        expect(d, `@${size}`).toBeLessThan(GATE);
      }
    });

    it('hovers at a constant line weight (no transforms or strokes; every wall holds its weight)', () => {
      grid(32);
      const rest: Record<string, number> = {};
      weights[name] = [];
      for (const h of [0, 0.25, 0.5, 0.75, 1]) {
        for (const [k, attrs] of Object.entries(icon.geo({ h }, 32))) {
          expect(attrs.transform, k).toBeUndefined();
          expect(attrs.strokeWidth, k).toBeUndefined();
          if (solid.includes(k) || !dOf(attrs)) continue;
          const w = inscribed(cover({ [k]: attrs }));
          if (rest[k] === undefined) {
            rest[k] = w;
            weights[name].push(`${k} ${w.toFixed(2)}`);
            // A 2px wall: no ink further than 1 unit from empty space, more only where walls meet.
            expect(w, k).toBeLessThan(joint);
            expect(w, k).toBeGreaterThan(0.95);
          }
          expect(
            Math.abs(w - rest[k]),
            `${k} h=${h}: ${w} vs ${rest[k]}`
          ).toBeLessThan(0.04);
        }
      }
      expect(JSON.stringify(icon.geo({ h: 1 }))).not.toBe(
        JSON.stringify(icon.geo({ h: 0 }))
      );
    });

    it.runIf(apart.length + part.length + ends.length > 0)(
      'keeps its separate parts apart through the hover (no shared ink, a clear gap)',
      () => {
        grid(32);
        for (const h of STEPS) {
          const s = icon.geo({ h });
          for (const [a, b] of apart) {
            expect(shared(s[a], s[b]), `${a}/${b} h=${h}`).toBe(0);
            expect(
              gap(dOf(s[a]), dOf(s[b])),
              `${a}/${b} h=${h}`
            ).toBeGreaterThan(0.9);
          }
          // Joined at rest, as Carbon draws them; parting as the hover runs, never back into each other.
          for (const [a, b] of part)
            if (h >= 0.5)
              expect(
                gap(dOf(s[a]), dOf(s[b])),
                `${a}/${b} h=${h}`
              ).toBeGreaterThan(0.9);
        }
        for (const h of [0, 1]) {
          const s = icon.geo({ h });
          for (const [a, b] of ends) {
            expect(shared(s[a], s[b]), `${a}/${b} h=${h}`).toBe(0);
            expect(
              gap(dOf(s[a]), dOf(s[b])),
              `${a}/${b} h=${h}`
            ).toBeGreaterThan(0.9);
          }
        }
      }
    );

    it('renders animated and static with no masks or clip paths', () => {
      const Icon = icon;
      const { container } = render(
        <MotionIconProvider animated>
          <Icon aria-label="t" />
        </MotionIconProvider>
      );
      const svg = container.querySelector('svg')!;
      expect(svg.querySelector('mask, clipPath')).toBeNull();
      expect(svg.querySelectorAll('[data-k]').length).toBe(
        Object.keys(icon.geo({ h: 0 }, 32)).length
      );
      // animated={false}: Carbon's art where the icon has one (decision 5), else the rest geometry.
      const still = render(<Icon animated={false} aria-label="t" />).container;
      expect(
        still.querySelector(
          (Icon as { static?: unknown }).static ? 'svg' : 'svg [data-k]'
        )
      ).not.toBeNull();
      if ((Icon as { static?: unknown }).static)
        expect(still.querySelector('[data-k]')).toBeNull();
    });
  }
);

// ── The distances the module's doc gives ─────────────────────────────────────

describe('the hovers move as documented', () => {
  const at = (icon: FrameHoverIcon, h: number, k: string) =>
    box(dOf(icon.geo({ h })[k]));
  const near = (a: number[], b: number[]) =>
    b.forEach((v, i) => expect(a[i], `[${i}]`).toBeCloseTo(v, 3));

  it('List: each line reaches 1px right and each bullet grows 0.5px a side, every row together (no stagger)', () => {
    for (const i of ROWS) {
      near(at(List, 1, `line${i}`), [10, 6 + 9 * i, 29, 8 + 9 * i]);
      near(at(List, 1, `bullet${i}`), [3.5, 5.5 + 9 * i, 6.5, 8.5 + 9 * i]);
    }
    // Early on, every row has started, and as far.
    const early = 0.1;
    expect(at(List, early, 'line0')[2]).toBeGreaterThan(28.01);
    expect(at(List, early, 'line2')[2]).toBeCloseTo(
      at(List, early, 'line0')[2],
      6
    );
  });

  it('Grid: each tile grows 0.5px a side in place (gaps 4 → 3)', () => {
    near(at(Grid, 1, 'tile0'), [3.5, 3.5, 14.5, 14.5]);
    near(at(Grid, 1, 'tile3'), [17.5, 17.5, 28.5, 28.5]);
  });

  /** The holes (cell insides) of a table path, as boxes, top to bottom then left to right. */
  const holes = (d: string) =>
    d
      .split(/(?=M)/)
      .slice(1)
      .map(box)
      .sort((a, b) => a[1] - b[1] || a[0] - b[0]);

  it('Table: widens only: the side walls move 1px out, the top, the bottom and every rule hold their y, and the rules lengthen with the walls', () => {
    expect(TABLE_WIDEN).toBe(1);
    const d = String(Table.geo({ h: 1 }).table.d);
    near(box(d), [2, 3, 30, 29]);
    const rows = holes(d);
    near(rows[0], [4, 5, 28, 9]);
    near(rows[1], [4, 11, 28, 15]);
    near(rows[2], [4, 17, 28, 21]);
    near(rows[3], [4, 23, 28, 27]);
    // Halfway, halfway: only x moves.
    const half = String(Table.geo({ h: 0.5 }).table.d);
    near(box(half), [2.5, 3, 29.5, 29]);
    holes(half).forEach((row, i) =>
      near(row, [4.5, [5, 11, 17, 23][i], 27.5, [9, 15, 21, 27][i]])
    );
  });

  it('Table split: the frame grows 1px a side; every rule holds and the outer cells grow with the edges', () => {
    const d = String(TableSplit.geo({ h: 1 }).table.d);
    near(box(d), [2, 2, 30, 30]);
    const [header, ...cells] = holes(d);
    near(header, [4, 4, 28, 9]);
    near(cells[0], [4, 11, 15, 18]);
    near(cells[1], [17, 11, 28, 18]);
    near(cells[2], [4, 20, 15, 28]);
    near(cells[3], [17, 20, 28, 28]);
  });

  it('Column: the box grows 1px a side, the rules step 1px out and lengthen 1px at each end (gaps hold at 4px)', () => {
    near(at(Column, 1, 'column'), [11, 3, 21, 29]);
    const rules = String(Column.geo({ h: 1 }).rules.d)
      .split(/(?=M)/)
      .map(box);
    near(rules[0], [5, 3, 7, 29]);
    near(rules[1], [25, 3, 27, 29]);
  });

  it('Split: each half moves 3px straight out, rigid (a 3px gap to the line); the dashed line scrolls one 6px period up', () => {
    const [l0, l1] = [at(Split, 0, 'left'), at(Split, 1, 'left')];
    near(l1, [l0[0] - 3, l0[1], l0[2] - 3, l0[3]]);
    const [r0, r1] = [at(Split, 0, 'right'), at(Split, 1, 'right')];
    near(r1, [r0[0] + 3, r0[1], r0[2] + 3, r0[3]]);
    expect(
      gap(
        String(Split.geo({ h: 1 }).left.d),
        String(Split.geo({ h: 1 }).line.d)
      )
    ).toBeCloseTo(3, 1);
    const dashes = (h: number) =>
      String(Split.geo({ h }).line.d).split(/(?=M)/).map(box);
    expect(dashes(0).map((b) => b[1])).toEqual([2, 8, 14, 20, 26]);
    // Half way: everything 3px up, cut at y 2 and 30.
    expect(dashes(0.5).map((b) => [b[1], b[3]])).toEqual([
      [2, 3],
      [5, 9],
      [11, 15],
      [17, 21],
      [23, 27],
      [29, 30],
    ]);
    expect(Split.geo({ h: 1 }).line).toEqual(Split.geo({ h: 0 }).line);
    for (const h of STEPS)
      for (const b of dashes(h))
        expect(
          b[1] >= 2 - 1e-9 && b[3] <= 30 + 1e-9 && b[3] - b[1] >= 0.3,
          `h=${h}`
        ).toBe(true);
  });

  it('Compare: the pages keep their size and move 1.5px together horizontally; the right arrow moves 1.5px back, the left rides with its page', () => {
    near(at(Compare, 1, 'pages'), [3.5, 2, 28.5, 30]);
    const [rest, full] = [
      String(Compare.geo({ h: 0 }).pages.d),
      String(Compare.geo({ h: 1 }).pages.d),
    ];
    expect(rest).toContain('L14 14');
    expect(rest).toContain('L18 18');
    // The tips: the left rides with its page (14 → 15.5, 2px from its wall at 17.5), the right 1.5px back (18 → 19.5), against that wall.
    expect(full).toContain('L15.5 14');
    expect(full).toContain('M5.5 15L11.67 15'); // the left shaft keeps its rest length (4 → 10.17 at rest)
    expect(full).toContain('L19.5 18');
    expect(full).toContain('M26.5 6H19.5V4'); // the right page's top edge meets the left page's wall; heights hold
    // The right arrowhead's back stays clear of its page's outer wall: 0.59px of shaft still shows.
    for (const h of STEPS) {
      const k = 1.5 * h;
      expect(28 - k - (24.41 + k), `right h=${h}`).toBeGreaterThan(0.5);
    }
  });

  it('Fade: the half ring grows 2px in radius; the dashes ride out 2px and land one slot on, four whole dashes again', () => {
    const r = (h: number) => {
      const pts = flatten(String(Fade.geo({ h }).half.d))
        .flatMap((p) => p.pts)
        .map(([x, y]) => Math.hypot(x - 16, y - 16));
      return [Math.min(...pts), Math.max(...pts)];
    };
    near(r(1), [14, 16]);
    const count = (h: number) =>
      String(Fade.geo({ h }).dashes.d).split(/(?=M)/).filter(Boolean).length;
    expect(count(0)).toBe(4);
    expect(count(1)).toBe(4);
    expect(count(0.5)).toBe(5); // one sliding in behind at the top, one coming out at the bottom
  });

  it('Popup: the front window grows 2px up and 2px right from its overlapping corner; the window behind holds', () => {
    near(at(Popup, 1, 'front'), [8, 2, 32, 22]);
    expect(Popup.geo({ h: 1 }).back).toEqual(Popup.geo({ h: 0 }).back);
  });

  it("Query: Search's magnifier: the lens grows 1px in diameter in place, the handle turns 15° clockwise; the mark holds", () => {
    const radii = (h: number) => {
      const pts = flatten(String(Query.geo({ h }).lens.d))
        .flatMap((p) => p.pts)
        .map(([x, y]) => Math.hypot(x - 14, y - 14));
      return [Math.min(...pts), Math.max(...pts)];
    };
    near(radii(0), [9, 11]);
    near(radii(1), [9.5, 11.5]);
    const end = (h: number) => {
      const pts = flatten(String(Query.geo({ h }).handle.d))[0].pts;
      const [a, b] = [pts[1], pts[2]];
      return (
        Math.atan2((a[1] + b[1]) / 2 - 14, (a[0] + b[0]) / 2 - 14) *
        (180 / Math.PI)
      );
    };
    expect(end(0)).toBeCloseTo(45, 3);
    expect(end(1)).toBeCloseTo(60, 3);
    expect(Query.geo({ h: 1 }).mark).toEqual(Query.geo({ h: 0 }).mark);
    expect(Query.geo({ h: 1 }).dot).toEqual(Query.geo({ h: 0 }).dot);
  });
});

// ── List ⇄ Grid ──────────────────────────────────────────────────────────────

describe('ListToggle', () => {
  const frames = STEPS.flatMap((h) =>
    STEPS.flatMap((p) => [
      { h, p, e: 0 },
      { h, p, e: 1 },
      { h, p, e: 0, list: (h + p) / 2 },
    ])
  );
  const painted = (s: Shapes) =>
    Object.fromEntries(Object.entries(s).filter(([, a]) => a.d !== ''));

  it('keeps the same keys across the (h, p, e) grid at 16, 20, 24 and 32, with no NaN or Infinity, inside the 36×36 box', () => {
    for (const size of SIZES) {
      const keys = Object.keys(ListToggle.geo({ h: 0, p: 0, e: 0 }, size));
      for (const fr of frames) {
        const s = ListToggle.geo(fr, size);
        expect(Object.keys(s), JSON.stringify(fr)).toEqual(keys);
        for (const [k, attrs] of Object.entries(s)) {
          for (const [a, v] of Object.entries(attrs))
            expect(
              /NaN|Infinity|undefined/.test(String(v)),
              `${k}.${a} ${JSON.stringify(fr)}`
            ).toBe(false);
        }
        const pts = pointsOf(s).flat();
        if (pts.length)
          expect(Math.min(...pts)).toBeGreaterThanOrEqual(-2 - 1e-6);
        if (pts.length) expect(Math.max(...pts)).toBeLessThanOrEqual(34 + 1e-6);
      }
    }
  });

  it('ends equal the hover icons: list (p 0) is List, grid (p 1) is Grid, at every hover frame', () => {
    for (const h of STEPS) {
      for (const size of SIZES) {
        expect(
          painted(ListToggle.geo({ h, p: 0, e: 0 }, size)),
          `list h=${h}`
        ).toEqual(List.geo({ h }, size));
        expect(
          painted(ListToggle.geo({ h, p: 1, e: 0 }, size)),
          `grid h=${h}`
        ).toEqual(Grid.geo({ h }, size));
      }
    }
  });

  it('rests on Carbon at both ends, at every size', () => {
    for (const size of SIZES) {
      grid(size);
      expect(
        delta(
          cover(ListToggle.geo({ h: 0, p: 0, e: 0 }, size)),
          coverCarbon(CList, size)
        ),
        `list @${size}`
      ).toBeLessThan(GATE);
      expect(
        delta(
          cover(ListToggle.geo({ h: 0, p: 1, e: 0 }, size)),
          coverCarbon(CGrid, size)
        ),
        `grid @${size}`
      ).toBeLessThan(GATE);
    }
  });

  it('is a match cut: one view at a time, shrinking to 60% before the cut and growing from 60% after, at constant weight', () => {
    grid(32);
    const CUT = LIST_GRID_CUT;
    for (const p of [0, 0.1, 0.2, 0.3, CUT, CUT + 0.01, 0.5, 0.7, 0.9, 1]) {
      for (const h of [0, 1]) {
        const s = painted(ListToggle.geo({ h, p, e: 0 }));
        const keys = Object.keys(s);
        const isList = keys.every((k) => /^(bullet|line)/.test(k));
        const isGrid = keys.every((k) => /^tile/.test(k));
        expect(isList !== isGrid, `p=${p}`).toBe(true);
        expect(isList, `p=${p}`).toBe(p <= CUT);
        // Lines stay 2px tall; walls stay 2px.
        for (const [k, a] of Object.entries(s))
          if (!k.startsWith('bullet'))
            expect(inscribed(cover({ [k]: a })), `${k} p=${p}`).toBeCloseTo(
              1,
              1
            );
      }
    }
    expect(LIST_GRID_MS).toBe(290);
    const ms = (t: number) =>
      painted(ListToggle.geo({ h: 0, p: t / LIST_GRID_MS, e: 0 }));
    const mid = (b: number[]) => (b[1] + b[3]) / 2;
    // Bottom row first, 30ms apart: at 30ms the bottom row is well on its way down, the middle row just starting, the top row still.
    expect(mid(box(String(ms(30).line2.d)))).toBeGreaterThan(25);
    expect(mid(box(String(ms(30).line1.d)))).toBeCloseTo(16, 6);
    expect(mid(box(String(ms(60).line0.d)))).toBeCloseTo(7, 6);
    // At the cut (140ms): every row at 60% about the centre and 4px down; lines still 2px tall.
    const atCut = ms(140);
    [0, 1, 2].forEach((i) =>
      expect(mid(box(String(atCut[`line${i}`].d)))).toBeCloseTo(
        16 + (7 + 9 * i - 16) * 0.6 + 4,
        3
      )
    );
    expect(
      box(String(atCut.line0.d))[3] - box(String(atCut.line0.d))[1]
    ).toBeCloseTo(2, 6);
    // Just after: the tiles at 60%, 6px above their places; the bottom two move first.
    const after = ms(140.001);
    const t0 = box(String(after.tile0.d));
    expect(t0[2] - t0[0]).toBeCloseTo(6, 2);
    expect(mid(t0)).toBeCloseTo(16 + (9 - 16) * 0.6 - 6, 2);
    expect(mid(box(String(ms(170).tile2.d)))).toBeGreaterThan(
      mid(box(String(after.tile2.d))) + 0.5
    );
    expect(mid(box(String(ms(170).tile0.d)))).toBeCloseTo(mid(t0), 2);
  });

  it('renders as a toggle with no masks, and flips state on click', () => {
    const { container } = render(
      <MotionIconProvider animated>
        <ListToggle aria-label="view" />
      </MotionIconProvider>
    );
    expect(container.querySelector('mask, clipPath')).toBeNull();
    expect(container.querySelectorAll('[data-k]').length).toBe(
      Object.keys(ListToggle.geo({ h: 0, p: 0, e: 0 })).length
    );
    const onToggle = vi.fn();
    const { getByRole } = render(
      <MotionIconProvider animated>
        <ListToggle asButton aria-label="layout" onToggle={onToggle} />
      </MotionIconProvider>
    );
    const button = getByRole('button', { name: 'layout' });
    expect(button.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledWith('grid', true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });
});

it('reports parity and weights', () => {
  console.log(
    'Rest parity (Δ %):\n' +
      Object.entries(parity)
        .map(
          ([n, s]) =>
            `${n}: ` +
            Object.entries(s)
              .map(([k, v]) => `${k} ${(100 * v).toFixed(2)}`)
              .join(', ')
        )
        .join('\n')
  );
  console.log(
    'Weights (inscribed half-width):\n' +
      Object.entries(weights)
        .map(([n, w]) => `${n}: ${w.join(', ')}`)
        .join('\n')
  );
});
