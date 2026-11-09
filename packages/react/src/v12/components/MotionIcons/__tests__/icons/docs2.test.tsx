/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  Badge as CBadge,
  CopyLink as CCopyLink,
  DocumentHorizontal as CDocumentHorizontal,
  DocumentVertical as CDocumentVertical,
  ModelAlt as CModelAlt,
  Playlist as CPlaylist,
  PresentationFile as CPresentationFile,
  Product as CProduct,
  Scale as CScale,
  Script as CScript,
  Sprout as CSprout,
  StarReview as CStarReview,
  Template as CTemplate,
  WatsonHealthMagnify as CWatsonHealthMagnify,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  Badge,
  CopyLink,
  DocumentHorizontal,
  DocumentVertical,
  ModelAlt,
  Playlist,
  PresentationFile,
  Product,
  Scale,
  Script,
  Sprout,
  StarReview,
  Template,
  WatsonHealthMagnify,
  badgeDrawBack,
  badgeStarAt,
  halfStar,
  modelArt,
  modelCube,
  MODEL_SCALE,
  sproutLeaves,
  STAR_GROW,
  BIG_LEAF_REACH,
  GROUND_REACH,
  LEAF_REACH,
  SPROUT_RISE,
} from '../../icons/assorted/docs2';

/**
 * Documents and objects, batch 2 (docs2.ts): keys and NaNs across the hover
 * at every size; rest parity with Carbon at 16 / 20 / 24 / 32 by coverage
 * (the sampler of files.test.tsx, which mirrors the browser Parity story: Δ
 * is the share of ink pixels whose coverage differs by more than a quarter,
 * gated at 0.5%); constant line weight (each outline point moves by one of
 * the icon's allowed offsets, never by a scale; walls crossed by fixed
 * probes keep their width; the star review's and model's walls sit 2px
 * apart at every frame); separate parts never touch; and every frame stays
 * inside the 36×36 hover box (−2…34).
 */

// ── A small rasteriser (as objectsB.test.tsx) ────────────────────────────────

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

/** Frame-engine shapes (all filled outlines here), sampled. */
function cover(shapes: Shapes): Uint8Array {
  const ink = new Uint8Array(N * N);
  for (const a of Object.values(shapes))
    fillInto(ink, flatten(String(a.d ?? '')), a.fillRule === 'evenodd');
  return ink;
}

/** A Carbon icon at a size, sampled in the 32-unit grid (paths and circles; fill="none" paths are skipped, as the browser does). */
function coverCarbon(Icon: CarbonIcon, size: number): Uint8Array {
  const { container, unmount } = render(<Icon size={size} />);
  const svg = container.querySelector('svg')!;
  const vb = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const ink = new Uint8Array(N * N);
  svg.querySelectorAll('path, circle').forEach((el) => {
    if (el.getAttribute('fill') === 'none') return;
    let d = el.getAttribute('d');
    if (el.tagName.toLowerCase() === 'circle') {
      const [cx, cy, r] = ['cx', 'cy', 'r'].map((a) =>
        Number(el.getAttribute(a))
      );
      d = `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
    }
    const polys = flatten(d!).map(({ pts, closed }) => ({
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

/** Is p inside the outline (nonzero, or even-odd)? */
const inside = (polys: Poly[], [x, y]: Pt, evenodd = false) => {
  let [w, c] = [0, 0];
  for (const { pts } of polys) {
    pts.forEach((a, k) => {
      const b = pts[(k + 1) % pts.length];
      if (a[1] <= y !== b[1] <= y) {
        const xi = a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]);
        if (xi > x) [w, c] = [w + (b[1] > a[1] ? 1 : -1), c + 1];
      }
    });
  }
  return evenodd ? c % 2 === 1 : w !== 0;
};
/** Ink runs (their lengths) along the segment from a to b, in one shape. */
function runs(attrs: Shapes[string], a: Pt, b: Pt): number[] {
  const polys = flatten(String(attrs.d));
  const evenodd = attrs.fillRule === 'evenodd';
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.ceil(len / 0.005);
  const out: number[] = [];
  let run = 0;
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    if (
      k < n &&
      inside(
        polys,
        [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
        evenodd
      )
    )
      run++;
    else if (run) {
      out.push((run * len) / n);
      run = 0;
    }
  }
  return out;
}

// ── The icons ────────────────────────────────────────────────────────────────

/** Per shape key, the offsets its outline points may move by at full hover (keys left out are checked otherwise). */
type Moves = Record<string, Pt[]>;
const still: Pt = [0, 0];
const corners = (d: number): Pt[] => [
  [-d, -d],
  [d, -d],
  [-d, d],
  [d, d],
];
/** A probe square across a straight wall: from 2px outside its outer edge (a → b) to 3px inside. */
function across(a: Pt, b: Pt, outward: Pt): [Pt, Pt] {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(dx, dy);
  let n: Pt = [dy / l, -dx / l];
  if (n[0] * outward[0] + n[1] * outward[1] < 0) n = [-n[0], -n[1]];
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return [
    [m[0] + 2 * n[0], m[1] + 2 * n[1]],
    [m[0] - 3 * n[0], m[1] - 3 * n[1]],
  ];
}
const STAR_O: Pt = [16, 17.478];
const away = (a: Pt, b: Pt): Pt => [
  (a[0] + b[0]) / 2 - STAR_O[0],
  (a[1] + b[1]) / 2 - STAR_O[1],
];
const starProbe = (a: Pt, b: Pt): [string, Pt, Pt] => [
  'star',
  ...across(a, b, away(a, b)),
];

interface Case {
  name: string;
  icon: FrameHoverIcon;
  carbon: CarbonIcon;
  moves?: Moves;
  /** Fixed probes [shape, from, to]: every wall they cross keeps its width through the hover. */
  probes?: [string, Pt, Pt][];
  /** Separate parts that must never touch: [part, part]. */
  apart?: [string, string][];
}
const pairs = (keys: string[]) =>
  keys.flatMap((a, i) =>
    keys.slice(i + 1).map((b): [string, string] => [a, b])
  );
const CASES: Case[] = [
  {
    name: 'Template',
    icon: Template,
    carbon: CTemplate,
    moves: {
      header: [still, [0, 2]],
      sidebar: [still, [0, 2], [2, 0], [2, 2]],
      content: [still, [0, 2], [2, 0], [2, 2]],
    },
    probes: [
      ['header', [16, -2], [16, 15]],
      ['sidebar', [-2, 22], [14.5, 22]],
      ['content', [13, 22], [34, 22]],
      ['content', [22, 13], [22, 34]],
    ],
    apart: pairs(['header', 'sidebar', 'content']),
  },
  {
    name: 'Script',
    icon: Script,
    carbon: CScript,
    moves: {
      page: [still, [-2, 0], [0, 2], [-2, 2], [-1, 0]],
      left: [[-1, 0]],
      right: [[1, 0]],
    },
    probes: [
      ['page', [10, -2], [10, 34]],
      ['page', [-2, 20], [30, 20]],
    ],
    apart: pairs(['page', 'left', 'right']),
  },
  {
    name: 'DocumentVertical',
    icon: DocumentVertical,
    carbon: CDocumentVertical,
    moves: { page: [...corners(1), [-1, 0], [1, 0]] },
    probes: [
      ['head', [16, -2], [16, 14.5]],
      ['page', [-2, 20], [34, 20]],
      ['page', [16, -2], [16, 4.8]],
    ],
    apart: [['page', 'head']],
  },
  {
    name: 'DocumentHorizontal',
    icon: DocumentHorizontal,
    carbon: CDocumentHorizontal,
    moves: { page: [...corners(1), [-1, 0], [1, 0]] },
    probes: [
      ['head', [16, -2], [16, 18.5]],
      ['page', [-2, 22.5], [34, 22.5]],
      ['page', [16, -2], [16, 8.8]],
    ],
    apart: [['page', 'head']],
  },
  {
    name: 'StarReview',
    icon: StarReview,
    carbon: CStarReview,
    moves: { lines: [still] },
    probes: [
      starProbe([16, 2], [20.549, 11.217]),
      starProbe([16, 2], [11.451, 11.217]),
      starProbe([11.451, 11.217], [1.28, 12.695]),
      starProbe([8.64, 19.87], [6.902, 30]),
      starProbe([1.28, 12.695], [8.64, 19.87]),
      starProbe([20.549, 11.217], [28, 12.3]),
    ],
    apart: [['star', 'lines']],
  },
  {
    name: 'Playlist',
    icon: Playlist,
    carbon: CPlaylist,
    apart: [
      ...pairs(['lineA', 'lineB', 'lineC', 'lineD']),
      ['lineB', 'play'],
      ['lineC', 'play'],
      ['lineD', 'play'],
    ],
  },
  {
    name: 'Product',
    icon: Product,
    carbon: CProduct,
    moves: {
      box: corners(1),
      lines: [
        [-1, 1],
        [1, 1],
      ],
    },
    probes: [
      ['box', [-2, 15], [34, 15]],
      ['box', [16, -2], [16, 15]],
      ['box', [9, 15], [9, 34]],
      ['lines', [10, 15], [10, 30]],
    ],
    apart: [['box', 'lines']],
  },
  {
    name: 'PresentationFile',
    icon: PresentationFile,
    carbon: CPresentationFile,
    moves: {
      easel: [still, ...corners(1), [0, -1], [0, 1], [-1, 0], [1, 0]],
      bars: [
        [0, 1],
        [0, -1],
      ],
    },
    probes: [
      ['bars', [8, 17], [24, 17]],
      ['easel', [16, -2], [16, 9]],
      ['easel', [-2, 12], [34, 12]],
      ['easel', [12, 24], [12, 34]],
    ],
    apart: [['easel', 'bars']],
  },
  {
    name: 'Badge',
    icon: Badge,
    carbon: CBadge,
    probes: [
      ['ribbon', [-2, 11], [10, 11]],
      ['ribbon', [-2, 22.5], [34, 22.5]],
    ],
    apart: [['ribbon', 'star']],
  },
  {
    name: 'CopyLink',
    icon: CopyLink,
    carbon: CCopyLink,
    moves: { page: [...corners(1), [0, -1], [1, 0]] },
    probes: [
      ['lower', [13.09, 10.09], [10.26, 7.26]],
      ['upper', [23.91, 10.91], [26.74, 13.74]],
      ['page', [-2, 20], [6, 20]],
      ['page', [16, 24], [16, 34]],
    ],
    apart: pairs(['page', 'lower', 'upper']),
  },
  { name: 'ModelAlt', icon: ModelAlt, carbon: CModelAlt },
  {
    name: 'Scale',
    icon: Scale,
    carbon: CScale,
    moves: {
      square: [still, [0, -2], [2, 0], [2, -2]],
      outline: [still, [2, 0], [0, -2]],
    },
    probes: [
      ['square', [-2, 22], [10, 22]],
      ['square', [8, 10], [8, 30]],
      ['outline', [16, -2], [16, 10]],
      ['outline', [-2, 9], [16, 9]],
    ],
    apart: [['square', 'outline']],
  },
  { name: 'Sprout', icon: Sprout, carbon: CSprout },
  {
    name: 'WatsonHealthMagnify',
    icon: WatsonHealthMagnify,
    carbon: CWatsonHealthMagnify,
    probes: [
      ['lens', [10, 22], [34, 22]],
      ['frame', [-2, 12], [10, 12]],
      ['frame', [10, -2], [10, 10]],
      ['frame', [8, 18], [8, 34]],
    ],
    apart: [
      ['frame', 'lens'],
      ['frame', 'handle'],
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

const parity: Record<string, Record<number, number>> = {};
const gaps: Record<string, string[]> = {};

/** Outline points, sampled every ~0.05 along each edge. */
const outline = (d: string): Pt[] =>
  flatten(d).flatMap(({ pts }) =>
    pts.flatMap((a, i) => {
      const b = pts[(i + 1) % pts.length];
      const n = Math.max(
        1,
        Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.05)
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
  ({ name, icon, carbon, moves = {}, probes = [], apart = [] }) => {
    it.runIf(apart.length > 0)(
      'keeps its separate parts apart through the hover (no shared ink, never closer than at rest)',
      () => {
        grid(32);
        gaps[name] = [];
        for (const [a, b] of apart) {
          let least = Infinity;
          let rest = Infinity;
          for (const h of STEPS) {
            const shapes = icon.geo({ h }, 32);
            const [ia, ib] = [cover({ a: shapes[a] }), cover({ b: shapes[b] })];
            let shared = 0;
            for (let k = 0; k < ia.length; k++) shared += ia[k] & ib[k];
            expect(shared, `${a}/${b} h=${h}`).toBe(0);
            const g = gap(String(shapes[a].d), String(shapes[b].d));
            if (h === 0) rest = g;
            least = Math.min(least, g);
          }
          expect(least, `${a}/${b} (rest ${rest})`).toBeGreaterThan(
            Math.min(1.4, rest - 0.05)
          );
          gaps[name].push(
            `${a}/${b} ≥ ${least.toFixed(2)} (rest ${rest.toFixed(2)})`
          );
        }
      },
      60_000
    );

    it('keeps the same shape keys at every hover frame and size, and never paints NaN or Infinity', () => {
      for (const size of SIZES) {
        const rest = Object.keys(icon.geo({ h: 0 }, size));
        for (const h of STEPS) {
          const shapes = icon.geo({ h }, size);
          expect(Object.keys(shapes), `h=${h} @${size}`).toEqual(rest);
          noBad(shapes, `h=${h} @${size}`);
        }
      }
    });

    it('stays inside the 36×36 hover box (−2…34) at every frame', () => {
      for (const h of STEPS) {
        for (const [k, a] of Object.entries(icon.geo({ h }, 32))) {
          for (const { pts } of flatten(String(a.d))) {
            for (const [x, y] of pts)
              expect(
                x >= -2 && x <= 34 && y >= -2 && y <= 34,
                `${k} (${x}, ${y}) h=${h}`
              ).toBe(true);
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

    it('hovers by moving geometry: no transforms or strokes, each listed part by an allowed offset', () => {
      const [rest, full] = [icon.geo({ h: 0 }, 32), icon.geo({ h: 1 }, 32)];
      expect(JSON.stringify(full)).not.toBe(JSON.stringify(rest));
      for (const [k, attrs] of Object.entries(full)) {
        expect(attrs.transform, k).toBeUndefined();
        expect(attrs.strokeWidth, k).toBeUndefined();
        expect(attrs.fill, k).toBeUndefined();
        const allowed = moves[k];
        if (!allowed) continue;
        const [a, b] = [flatten(String(rest[k].d)), flatten(String(attrs.d))];
        expect(
          b.map((p) => p.pts.length),
          k
        ).toEqual(a.map((p) => p.pts.length));
        a.forEach((poly, i) =>
          poly.pts.forEach(([x, y], j) => {
            const [X, Y] = b[i].pts[j];
            const ok = allowed.some(
              ([dx, dy]) =>
                Math.abs(X - x - dx) < 2e-3 && Math.abs(Y - y - dy) < 2e-3
            );
            expect(ok, `${k} point ${i}/${j} (${x}, ${y}) → (${X}, ${Y})`).toBe(
              true
            );
          })
        );
      }
    });

    it.runIf(probes.length > 0)(
      'keeps every wall its probes cross at a constant width',
      () => {
        for (const [k, a, b] of probes) {
          const r0 = runs(icon.geo({ h: 0 }, 32)[k], a, b);
          expect(r0.length, `${k} ${a}→${b}`).toBeGreaterThan(0);
          for (const h of [0.5, 1]) {
            const r = runs(icon.geo({ h }, 32)[k], a, b);
            expect(r.length, `${k} ${a}→${b} h=${h}`).toBe(r0.length);
            r.forEach((w, i) =>
              expect(
                Math.abs(w - r0[i]),
                `${k} ${a}→${b} run ${i}: ${r0[i]} → ${w} h=${h}`
              ).toBeLessThan(0.06)
            );
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

// ── Per-icon motion ──────────────────────────────────────────────────────────

/** The gap between two shapes of an icon at h. */
const gapAt = (icon: FrameHoverIcon, a: string, b: string, h: number) => {
  const s = icon.geo({ h }, 32);
  return gap(String(s[a].d), String(s[b].d));
};

describe('Template', () => {
  it('holds the 2px gaps between its tiles', () => {
    for (const h of [0, 0.5, 1])
      for (const [a, b] of pairs(['header', 'sidebar', 'content']))
        expect(gapAt(Template, a, b, h), `${a}/${b} h=${h}`).toBeCloseTo(2, 1);
  }, 60_000);
});

describe('Script', () => {
  it("holds the space between the page's bottom wall and the left bracket as they step apart", () => {
    const rest = gapAt(Script, 'page', 'left', 0);
    for (const h of [0.5, 1])
      expect(gapAt(Script, 'page', 'left', h), `h=${h}`).toBeCloseTo(rest, 1);
  }, 60_000);
});

describe('Document vertical / horizontal', () => {
  it("holds the head's 1px gap to the shoulders, and its 2px to the page's top", () => {
    for (const icon of [DocumentVertical, DocumentHorizontal]) {
      for (const h of [0, 0.5, 1])
        expect(
          gapAt(icon, 'page', 'head', h),
          `${icon.displayName} h=${h}`
        ).toBeCloseTo(1, 1);
      // Down the head's axis (x 16): the space from the page's top wall to the head's top.
      const space = (h: number) => {
        const s = icon.geo({ h });
        const [page, head] = [
          flatten(String(s.page.d)),
          flatten(String(s.head.d)),
        ];
        let lastPage = NaN;
        for (let y = -2; y < 20; y += 0.005) {
          if (inside(page, [16, y])) lastPage = y;
          if (inside(head, [16, y], true)) return y - lastPage;
        }
        return NaN;
      };
      expect(space(0), icon.displayName).toBeCloseTo(2, 1);
      expect(space(1), icon.displayName).toBeCloseTo(2, 1);
    }
  }, 60_000);
});

describe('Star review', () => {
  it('grows the half star at constant 2px walls: each inner edge 2px inside its outer edge, at every frame', () => {
    const pairsOf: [number, number][] = [
      [1, 14],
      [2, 13],
      [3, 12],
      [4, 11],
      [5, 10],
    ];
    for (const h of STEPS) {
      const v = halfStar(h);
      // Outer edge i runs v[i] → v[i+1]; its inner partner runs between the mirrored vertices.
      for (const [i, j] of pairsOf) {
        const [a, b] = [v[i], v[i + 1]];
        const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
        const dist =
          Math.abs((v[j][0] - a[0]) * dy - (v[j][1] - a[1]) * dx) /
          Math.hypot(dx, dy);
        expect(dist, `edge ${i} h=${h}`).toBeCloseTo(2, 2);
      }
    }
    // The top tip reaches 1 / sin(half its angle): Carbon's tips are 52.6°, so 2.26px.
    const half = Math.atan2(20.549 - 16, 11.217 - 2);
    expect(halfStar(0)[2][1] - halfStar(1)[2][1]).toBeCloseTo(
      STAR_GROW / Math.sin(half),
      3
    );
    expect(halfStar(0)[2][1] - halfStar(1)[2][1]).toBeCloseTo(2.26, 2);
  });
});

describe('Badge', () => {
  it("takes Recommend's medal motion: the ring 2px larger in radius, the tails 3px lower, the star with the ring", () => {
    const leftWall = (h: number) =>
      runs(Badge.geo({ h }).ribbon, [-2, 11], [10, 11]);
    expect(leftWall(0)).toHaveLength(1);
    expect(leftWall(0)[0]).toBeCloseTo(2, 1);
    const outerLeft = (h: number) => {
      const polys = flatten(String(Badge.geo({ h }).ribbon.d));
      let x = -2;
      while (!inside(polys, [x, 11]) && x < 10) x += 0.005;
      return x;
    };
    expect(outerLeft(0) - outerLeft(1)).toBeCloseTo(2, 1);
    const tail = (h: number) =>
      Math.max(
        ...flatten(String(Badge.geo({ h }).ribbon.d))[0].pts.map(([, y]) => y)
      );
    expect(tail(1) - tail(0)).toBeCloseTo(3, 3);
    const [r0, r1] = [badgeStarAt(0), badgeStarAt(1)];
    r0.forEach(([x, y], i) => {
      expect(r1[i][0]).toBeCloseTo(14 + (x - 14) * 1.25, 6);
      expect(r1[i][1]).toBeCloseTo(11 + (y - 11) * 1.25, 6);
    });
  });
  it('holds the space from each ring end to the star', () => {
    const rest = gapAt(Badge, 'ribbon', 'star', 0);
    for (const h of [0.25, 0.5, 1])
      expect(gapAt(Badge, 'ribbon', 'star', h), `h=${h}`).toBeCloseTo(rest, 1);
    expect(badgeDrawBack(0)).toEqual([0, 0]);
  }, 60_000);
});

describe('Copy link', () => {
  it('keeps the links at least 2px from the page as they come together and it grows (2.12 and 2.25 at rest)', () => {
    for (const k of ['lower', 'upper'])
      for (const h of STEPS)
        expect(gapAt(CopyLink, 'page', k, h), `${k} h=${h}`).toBeGreaterThan(
          1.995
        );
  }, 60_000);
  it('holds the space between the links (1.51px) as they come together, the gaps sliding with them', () => {
    const rest = gapAt(CopyLink, 'lower', 'upper', 0);
    for (const h of STEPS)
      expect(gapAt(CopyLink, 'lower', 'upper', h), `h=${h}`).toBeCloseTo(
        rest,
        2
      );
  }, 60_000);
});

describe('Model alt', () => {
  /** Distance from p to the segment a–b. */
  const segDist = (p: Pt, a: Pt, b: Pt) => {
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const u = Math.max(
      0,
      Math.min(
        1,
        ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)
      )
    );
    return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy);
  };
  const edges = (q: readonly Pt[]) =>
    q.map((a, i): [Pt, Pt] => [a, q[(i + 1) % q.length]]);
  const nearest = (p: Pt, q: readonly Pt[]) =>
    Math.min(...edges(q).map(([a, b]) => segDist(p, a, b)));
  it('keeps every wall 2px as the cubes turn: each outline 1px outside its silhouette, each face inside 1px in', () => {
    for (const h of STEPS) {
      const art = modelArt(h);
      for (const k of ['top', 'left', 'right'] as const) {
        const [out, ...holes] = flatten(String(ModelAlt.geo({ h })[k].d));
        for (const p of out.pts)
          expect(nearest(p, art[k].hull), `${k} outline h=${h}`).toBeCloseTo(
            1,
            2
          );
        for (const hole of holes) {
          const d = Math.min(
            ...art[k].faces.map((q) =>
              Math.max(...hole.pts.map((p) => Math.abs(nearest(p, q) - 1)))
            )
          );
          expect(d, `${k} hole h=${h}`).toBeLessThan(1e-2);
        }
      }
    }
  });
  it('turns each cube 90° and lands on its own drawing, grown 1px a side about the icon centre', () => {
    for (const c of [
      [16, 7],
      [10, 17],
      [22, 17],
    ] as Pt[]) {
      const [a, b] = [
        modelCube(c, 0, MODEL_SCALE).hull,
        modelCube(c, 90, MODEL_SCALE).hull,
      ];
      for (const p of b)
        expect(
          Math.min(...a.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1]))),
          `${c}`
        ).toBeLessThan(1e-6);
    }
    const xs = (h: number) =>
      (['left', 'right'] as const).flatMap((k) =>
        modelArt(h)[k].hull.map(([x]) => x)
      );
    expect(
      Math.max(...xs(1)) -
        Math.min(...xs(1)) -
        (Math.max(...xs(0)) - Math.min(...xs(0)))
    ).toBeCloseTo(24 * (MODEL_SCALE - 1), 3);
  });
  it('turns the cubes one after another, 30ms apart: top clockwise, then left anticlockwise, then right clockwise', () => {
    const deg = (ms: number) => modelArt(ms / 210).deg;
    expect(deg(20).top).toBeGreaterThan(0);
    expect(deg(20).left).toBeCloseTo(0, 9);
    expect(deg(20).right).toBeCloseTo(0, 9);
    expect(deg(50).left).toBeLessThan(0);
    expect(deg(50).right).toBeCloseTo(0, 9);
    expect(deg(80).right).toBeGreaterThan(0);
    expect([deg(210).top, deg(210).left, deg(210).right]).toEqual(
      [90, -90, 90].map((v) => expect.closeTo(v, 6))
    );
  });
  it('keeps the shared seams under the cubes at rest and at full hover', () => {
    grid(32);
    const area = (h: number) =>
      cover({ b: ModelAlt.geo({ h }).seams }).reduce((a, v) => a + v, 0);
    expect(area(0)).toBeLessThan(5);
    expect(area(1)).toBeLessThan(5);
  });
});

describe('Sprout', () => {
  it('grows each leaf at a constant 2px wall: radial probes through its two walls read 2px at every frame', () => {
    for (const h of STEPS) {
      const { right, left } = sproutLeaves(h);
      const rise = SPROUT_RISE * h;
      const plant = Sprout.geo({ h }).plant;
      const probe = (c: Pt, r: number, deg: number) => {
        const [u, v] = [
          Math.cos((deg * Math.PI) / 180),
          Math.sin((deg * Math.PI) / 180),
        ];
        return runs(
          plant,
          [c[0] + u * (r - 3), c[1] - rise + v * (r - 3)],
          [c[0] + u * (r + 3), c[1] - rise + v * (r + 3)]
        );
      };
      for (const [c, r, deg] of [
        [right.up, right.r, -120],
        [right.low, right.r, 45],
        [left.up, left.r, -45],
        [left.low, left.r, 135],
      ] as [Pt, number, number][]) {
        const w = probe(c, r, deg);
        expect(w.length, `h=${h} ${deg}`).toBe(1);
        expect(w[0], `h=${h} ${deg}`).toBeCloseTo(2, 1);
      }
    }
  });
  // The bigger leaf grows more and the leaves travel up less to make room; the bottom curve extends 1px at either end.
  it("reaches the big leaf's tip 2px out on each axis and the small one's 1px, on top of a 1px rise; the top reaches 3px, as before", () => {
    expect([SPROUT_RISE, BIG_LEAF_REACH, LEAF_REACH, GROUND_REACH]).toEqual([
      1, 2, 1, 1,
    ]);
    const pts = (h: number) =>
      flatten(String(Sprout.geo({ h }).plant.d))[0].pts;
    const [r0, r1] = [pts(0), pts(1)];
    expect(
      Math.max(...r1.map(([x]) => x)) - Math.max(...r0.map(([x]) => x))
    ).toBeCloseTo(BIG_LEAF_REACH, 2);
    expect(
      Math.min(...r1.map(([x]) => x)) - Math.min(...r0.map(([x]) => x))
    ).toBeCloseTo(-LEAF_REACH, 2);
    expect(
      Math.min(...r1.map(([, y]) => y)) - Math.min(...r0.map(([, y]) => y))
    ).toBeCloseTo(-(BIG_LEAF_REACH + SPROUT_RISE), 2);
  });
  it("runs the ground's arc 1px further round at each end (along its centreline, r 9 about (15, 35)), its 2px band and radial ends held", () => {
    const C: Pt = [15, 35];
    const ang = ([x, y]: Pt) => Math.atan2(y - C[1], x - C[0]);
    // The ground: the outline's points below the stem's foot (y > 25.5), away from the stem (|x − 15| > 2).
    const ground = (h: number) =>
      flatten(String(Sprout.geo({ h }).plant.d))[0].pts.filter(
        ([x, y]) => y > 25.5 && Math.abs(x - 15) > 1.5
      );
    for (const h of STEPS) {
      const g = ground(h);
      const a = g.map(ang);
      const [lo, hi] = [Math.min(...a), Math.max(...a)];
      const [lo0, hi0] = [
        Math.min(...ground(0).map(ang)),
        Math.max(...ground(0).map(ang)),
      ];
      expect((lo0 - lo) * 9, `left end h=${h}`).toBeCloseTo(
        GROUND_REACH * h,
        2
      );
      expect((hi - hi0) * 9, `right end h=${h}`).toBeCloseTo(
        GROUND_REACH * h,
        2
      );
      // The band: every point 8 or 10 (Carbon's 9.92–10.02) from the centre.
      for (const p of g) {
        const r = Math.hypot(p[0] - C[0], p[1] - C[1]);
        expect(
          Math.min(Math.abs(r - 8), Math.abs(r - 10)),
          `h=${h} (${p})`
        ).toBeLessThan(0.1);
      }
    }
  });
});

describe('Playlist', () => {
  it("scrolls the list a line, as Chat's lines: at full hover the lines sit where Carbon's are", () => {
    const [rest, full] = [Playlist.geo({ h: 0 }), Playlist.geo({ h: 1 })];
    expect(full.lineA.d).toBe('');
    expect(rest.lineD.d).toBe('');
    expect(full.lineB.d).toBe(rest.lineA.d);
    expect(full.lineC.d).toBe(rest.lineB.d);
    expect(full.lineD.d).toBe(rest.lineC.d);
    expect(Number(full.lineD.opacity)).toBe(1);
  });
});

describe('Scale', () => {
  it("holds the outline's 4px space to the growing square", () => {
    for (const h of STEPS)
      expect(gapAt(Scale, 'square', 'outline', h), `h=${h}`).toBeCloseTo(4, 1);
  }, 60_000);
});

describe('Watson Health magnify', () => {
  it("holds the frame's space to the lens as it grows, and keeps the handle 2px wide", () => {
    const rest = gapAt(WatsonHealthMagnify, 'frame', 'lens', 0);
    for (const h of [0.5, 1])
      expect(
        gapAt(WatsonHealthMagnify, 'frame', 'lens', h),
        `h=${h}`
      ).toBeCloseTo(rest, 1);
    for (const h of STEPS) {
      const [p] = flatten(String(WatsonHealthMagnify.geo({ h }).handle.d));
      expect(
        Math.hypot(p.pts[0][0] - p.pts[3][0], p.pts[0][1] - p.pts[3][1]),
        `h=${h}`
      ).toBeCloseTo(2, 3);
    }
  }, 60_000);
});

describe('the parity measure', () => {
  it('sees ink, and tells different icons apart', () => {
    grid(32);
    expect(coverCarbon(CBadge, 32).reduce((a, v) => a + v, 0)).toBeGreaterThan(
      5000
    );
    expect(
      delta(cover(Template.geo({ h: 0 }, 32)), coverCarbon(CProduct, 32))
    ).toBeGreaterThan(0.3);
    expect(
      delta(cover(Template.geo({ h: 0.5 }, 32)), coverCarbon(CTemplate, 32))
    ).toBeGreaterThan(GATE);
  });
});

describe('parity report', () => {
  it('logs Δ per icon and size, and the gaps', () => {
    console.log(
      Object.entries(gaps)
        .map(([n, g]) => `${n}: ${g.join(', ')}`)
        .join('\n')
    );
    console.log(
      Object.entries(parity)
        .map(
          ([n, s]) =>
            `${n}: ${SIZES.map((z) => `${z}=${(100 * (s[z] ?? NaN)).toFixed(2)}%`).join(' ')}`
        )
        .join('\n')
    );
  });
});
