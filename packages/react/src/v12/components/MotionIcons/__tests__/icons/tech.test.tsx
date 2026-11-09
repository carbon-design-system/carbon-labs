/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  Building as CBuilding,
  Chip as CChip,
  ContainerRegistry as CContainerRegistry,
  Education as CEducation,
  Enterprise as CEnterprise,
  Forum as CForum,
  Headset as CHeadset,
  Identification as CIdentification,
  Model as CModel,
  Package as CPackage,
  Replicate as CReplicate,
  Tree as CTree,
  Wikis as CWikis,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  Building,
  Chip,
  ContainerRegistry,
  Education,
  Enterprise,
  Forum,
  Headset,
  Identification,
  Model,
  Package,
  Replicate,
  Tree,
  Wikis,
  modelTop,
  ROOT_REACH,
  TREE_RISE,
} from '../../icons/assorted/tech';

/**
 * Tech, enterprise and people-adjacent objects (tech.ts): the same shape keys
 * and no NaN across the hover at 16 / 20 / 24 / 32; rest parity with Carbon
 * at every size by coverage (the sampler of objectsB.test.tsx, which mirrors
 * the browser Parity story: Δ is the share of ink pixels whose coverage
 * differs by more than a quarter, gated at 0.5%); constant weight (rigid
 * parts move only by their allowed offsets, and every part's local
 * thickness, the widest disc inside it through each point, never grows
 * past its resting weight); and separate parts never touch.
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

/** A Carbon icon at a size, sampled in the 32-unit grid (paths and circles). */
function coverCarbon(Icon: CarbonIcon, size: number): Uint8Array {
  const { container, unmount } = render(<Icon size={size} />);
  const svg = container.querySelector('svg')!;
  const vb = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const ink = new Uint8Array(N * N);
  svg.querySelectorAll('path, circle').forEach((el) => {
    let d = el.getAttribute('d');
    if (el.tagName.toLowerCase() === 'circle') {
      const [cx, cy, r] = ['cx', 'cy', 'r'].map((a) =>
        Number(el.getAttribute(a))
      );
      d = `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
    }
    // A translated element (none here, but cheap to honour).
    const t = /translate\(\s*([-\d.]+)[\s,]+([-\d.]+)\s*\)/.exec(
      el.getAttribute('transform') ?? ''
    );
    const [tx, ty] = t ? [Number(t[1]), Number(t[2])] : [0, 0];
    const polys = flatten(d!).map(({ pts, closed }) => ({
      pts: pts.map(
        ([x, y]) => [((x + tx) * 32) / vb, ((y + ty) * 32) / vb] as Pt
      ),
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

// ── Local thickness ──────────────────────────────────────────────────────────

/** Squared Euclidean distance transform along one line (Felzenszwalb–Huttenlocher). */
function edt1(
  f: Float64Array,
  n: number,
  out: Float64Array,
  v: Int32Array,
  z: Float64Array
) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    out[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}
/** Each ink sample's distance (in samples) to the nearest empty sample. */
function distances(ink: Uint8Array): Float64Array {
  const big = 1e12;
  const d = new Float64Array(N * N);
  for (let i = 0; i < N * N; i++) d[i] = ink[i] ? big : 0;
  const [f, o, v, z] = [
    new Float64Array(N),
    new Float64Array(N),
    new Int32Array(N),
    new Float64Array(N + 1),
  ];
  for (let j = 0; j < N; j++) {
    for (let k = 0; k < N; k++) f[k] = d[j * N + k];
    edt1(f, N, o, v, z);
    for (let k = 0; k < N; k++) d[j * N + k] = o[k];
  }
  for (let k = 0; k < N; k++) {
    for (let j = 0; j < N; j++) f[j] = d[j * N + k];
    edt1(f, N, o, v, z);
    for (let j = 0; j < N; j++) d[j * N + k] = Math.sqrt(o[j]);
  }
  return d;
}
/**
 * The local thickness of a shape at each ink sample (in px of the 32 grid):
 * the diameter of the widest disc inside the shape that covers the sample.
 * Returns the thickness of every ink sample.
 */
function thickness(ink: Uint8Array): Float64Array {
  const d = distances(ink);
  const t = new Float64Array(N * N);
  for (let j = 1; j < N - 1; j++) {
    for (let k = 1; k < N - 1; k++) {
      const i = j * N + k;
      const r = d[i];
      if (!r) continue;
      let ridge = true;
      for (let a = -1; a <= 1 && ridge; a++)
        for (let b = -1; b <= 1; b++)
          if (d[i + a * N + b] > r + 1e-9) {
            ridge = false;
            break;
          }
      if (!ridge) continue;
      const R = Math.ceil(r);
      for (let a = -R; a <= R; a++) {
        for (let b = -R; b <= R; b++) {
          if (a * a + b * b > r * r) continue;
          const q = i + a * N + b;
          if (t[q] < 2 * r) t[q] = 2 * r;
        }
      }
    }
  }
  const out: number[] = [];
  for (let i = 0; i < N * N; i++) if (ink[i]) out.push(t[i] * STEP);
  return Float64Array.from(out).sort();
}
const quantile = (s: Float64Array, q: number) =>
  s[Math.min(s.length - 1, Math.floor(q * s.length))];

// ── The icons ────────────────────────────────────────────────────────────────

type Moves = Record<string, Pt[]>;
const still: Pt = [0, 0];
const around = (k: number): Pt[] =>
  [-k, 0, k].flatMap((x) => [-k, 0, k].map((y) => [x, y] as Pt));
interface Case {
  name: string;
  icon: FrameHoverIcon;
  carbon: CarbonIcon;
  /** Per shape key, the offsets its outline points may move by at full hover (keys left out are rebuilt, and checked by thickness). */
  moves: Moves;
  /** Separate parts that must never touch: [part, part]. */
  apart?: [string, string][];
}
const CASES: Case[] = [
  {
    name: 'Forum',
    icon: Forum,
    carbon: CForum,
    moves: {
      back: [
        [-2, -2],
        [-2, 0],
        [0, -2],
      ],
    },
    apart: [['back', 'front']],
  },
  { name: 'Wikis', icon: Wikis, carbon: CWikis, moves: { ring: [still] } },
  {
    name: 'Chip',
    icon: Chip,
    carbon: CChip,
    moves: {
      body: around(1),
      die: [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ],
    },
    apart: [['body', 'die']],
  },
  { name: 'Headset', icon: Headset, carbon: CHeadset, moves: {} },
  {
    name: 'Model',
    icon: Model,
    carbon: CModel,
    moves: {
      top: [
        [4, 0],
        [-4, 0],
      ],
      bottom: [still],
    },
  },
  {
    name: 'ContainerRegistry',
    icon: ContainerRegistry,
    carbon: CContainerRegistry,
    moves: {
      stack: [-1, 0, 1].flatMap((x) => [0, -1, -2].map((y) => [x, y] as Pt)),
      box: [
        [1.5, -2.5],
        [1.5, -3.5],
        [2.5, -2.5],
        [2.5, -3.5],
      ],
      rack: [still, [1, 0], [-1, 0]],
    },
    apart: [
      ['stack', 'box'],
      ['stack', 'rack'],
      ['box', 'rack'],
    ],
  },
  {
    name: 'Building',
    icon: Building,
    carbon: CBuilding,
    moves: { building: [still, [0, -2]], windows: [still] },
    apart: [['building', 'windows']],
  },
  {
    name: 'Enterprise',
    icon: Enterprise,
    carbon: CEnterprise,
    moves: {
      building: [-1, 0, 1].flatMap((x) => [0, -2].map((y) => [x, y] as Pt)),
      windows: [[0, -1]],
    },
    apart: [['building', 'windows']],
  },
  {
    name: 'Tree',
    icon: Tree,
    carbon: CTree,
    moves: { branch: [still, [0, -2], [-2, 0]] },
    apart: [['branch', 'canopy']],
  },
  {
    name: 'Package',
    icon: Package,
    carbon: CPackage,
    moves: {
      box: [
        [-2, 0],
        [2, 0],
      ],
      slot: [
        [-1, 0],
        [1, 0],
      ],
      arrow: [still, [0, 2]],
    },
    apart: [
      ['box', 'slot'],
      ['box', 'arrow'],
      ['slot', 'arrow'],
    ],
  },
  {
    name: 'Replicate',
    icon: Replicate,
    carbon: CReplicate,
    moves: {
      front: [
        [-2, 0],
        [0, 0],
        [-2, 2],
        [0, 2],
      ],
      corner: [[2, -2]],
      dashes: [
        [0, -2],
        [2, -2],
        [2, 0],
      ],
    },
    apart: [
      ['front', 'corner'],
      ['front', 'dashes'],
      ['joined', 'corner'],
      ['joined', 'dashes'],
      ['corner', 'dashes'],
    ],
  },
  {
    name: 'Identification',
    icon: Identification,
    carbon: CIdentification,
    moves: {
      card: around(1),
      lines: [
        [-1, -1],
        [0, -1],
      ],
    },
    apart: [
      ['card', 'lines'],
      ['card', 'personHead'],
      ['card', 'personBody'],
      ['lines', 'personHead'],
      ['lines', 'personBody'],
      ['personHead', 'personBody'],
    ],
  },
  {
    name: 'Education',
    icon: Education,
    carbon: CEducation,
    moves: {
      tassel: [
        [-2, -1],
        [-2, 1],
      ],
    },
    apart: [
      ['head', 'tassel'],
      ['head', 'body'],
      ['tassel', 'body'],
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
const weights: Record<string, string[]> = {};

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

describe.each(CASES)('$name', ({ name, icon, carbon, moves, apart = [] }) => {
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

  it('hovers by moving geometry: no transforms or strokes, rigid parts by their allowed offsets', () => {
    for (const size of SIZES) {
      const [rest, full] = [icon.geo({ h: 0 }, size), icon.geo({ h: 1 }, size)];
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
          `${k} @${size}`
        ).toEqual(a.map((p) => p.pts.length));
        a.forEach((poly, i) =>
          poly.pts.forEach(([x, y], j) => {
            const [X, Y] = b[i].pts[j];
            const ok = allowed.some(
              ([dx, dy]) =>
                Math.abs(X - x - dx) < 2e-3 && Math.abs(Y - y - dy) < 2e-3
            );
            expect(
              ok,
              `${k} point ${i}/${j} (${x}, ${y}) → (${X}, ${Y}) @${size}`
            ).toBe(true);
          })
        );
      }
    }
  });

  it('keeps its line weight: no part grows thicker or thinner than at rest through the hover', () => {
    grid(16); // 1/16px samples
    weights[name] = [];
    const rest = icon.geo({ h: 0 }, 32);
    for (const k of Object.keys(rest)) {
      const t0 = thickness(cover({ k: rest[k] }));
      const [max0, mid0, thin0] = t0.length
        ? [t0[t0.length - 1], quantile(t0, 0.5), quantile(t0, 0.1)]
        : [2, 2, 1.8];
      let worst = 0;
      for (const h of [0.25, 0.5, 0.75, 1]) {
        const t = thickness(cover({ k: icon.geo({ h }, 32)[k] }));
        if (!t.length) continue;
        // The widest disc never gets wider than at rest (or than the 2px wall), the typical one stays 2px.
        expect(t[t.length - 1], `${k} widest h=${h}`).toBeLessThan(
          Math.max(max0, 2) + 0.13
        );
        expect(
          Math.abs(quantile(t, 0.5) - mid0),
          `${k} median h=${h}`
        ).toBeLessThan(0.07);
        // A short dash (a meridian trimmed near the limb) has a larger share of its ends; skip its thin tail.
        if (t.length > t0.length / 4)
          expect(
            quantile(t, 0.1),
            `${k} thinnest tenth h=${h}`
          ).toBeGreaterThan(thin0 - 0.13);
        worst = Math.max(worst, Math.abs(quantile(t, 0.5) - mid0));
      }
      weights[name].push(`${k} ${mid0.toFixed(2)} (±${worst.toFixed(2)})`);
    }
  });

  it.runIf(apart.length > 0)(
    'keeps its separate parts apart through the hover (no shared ink, a clear gap)',
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
        // A clear 1.4px, or (where Carbon's own gap is narrower, as a head over its shoulders) the resting gap held.
        expect(least, `${a}/${b}`).toBeGreaterThan(Math.min(1.4, rest - 0.01));
        gaps[name].push(
          `${a}/${b} ≥ ${least.toFixed(2)} (rest ${rest.toFixed(2)})`
        );
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
});

describe('Wikis', () => {
  it("spins one meridian spacing and lands back on Carbon's drawing", () => {
    for (const size of SIZES) {
      grid(size);
      expect(
        delta(cover(Wikis.geo({ h: 1 }, size)), coverCarbon(CWikis, size)),
        `@${size}`
      ).toBeLessThan(GATE);
    }
    // Midway it is visibly another drawing (the meridians have moved).
    grid(32);
    expect(
      delta(cover(Wikis.geo({ h: 0.5 }, 32)), coverCarbon(CWikis, 32))
    ).toBeGreaterThan(0.05);
  });
  it('moves every meridian continuously, full length: no snapping, no meridian missing mid-spin', () => {
    grid(8); // 1/8px samples
    const area = (d: string) =>
      cover({ k: { d } }).reduce((x, v) => x + v, 0) * STEP * STEP;
    const keys = ['m0', 'm1', 'm2'];
    let prev = keys.map((k) => area(String(Wikis.geo({ h: 0.01 })[k].d)));
    for (let i = 2; i <= 99; i++) {
      const s = Wikis.geo({ h: i / 100 });
      const now = keys.map((k) => area(String(s[k].d)));
      keys.forEach((k, j) => {
        expect(now[j], `${k} drawn at h=${i / 100}`).toBeGreaterThan(20);
        // A full-length meridian's ink changes a little each step (its curve flattens or bends): never a jump.
        expect(
          Math.abs(now[j] - prev[j]),
          `${k} area step at h=${i / 100}`
        ).toBeLessThan(3);
      });
      prev = now;
    }
  }, 30000);
});

// The base parts extend 2px left and 2px right.
describe('Tree', () => {
  it('reaches its roots 2px further along the ground, left and right, as it rises 2px; they hold their 2px', () => {
    expect([ROOT_REACH, TREE_RISE]).toEqual([2, 2]);
    const roots = (h: number) => {
      const s = Tree.geo({ h });
      const pts = [
        ...flatten(String(s.branch.d)),
        ...flatten(String(s.canopy.d)),
      ]
        .flatMap((p) => p.pts)
        .filter(([, y]) => y >= 27.99);
      return {
        left: Math.min(...pts.map(([x]) => x)),
        right: Math.max(...pts.map(([x]) => x)),
        ys: pts.map(([, y]) => y),
      };
    };
    const rest = roots(0);
    expect([rest.left, rest.right]).toEqual([9, 22]);
    for (const h of STEPS) {
      const r = roots(h);
      expect(r.left, `h=${h}`).toBeCloseTo(9 - ROOT_REACH * h, 3);
      expect(r.right, `h=${h}`).toBeCloseTo(22 + ROOT_REACH * h, 3);
      // On the ground: y 28 to 30.
      for (const y of r.ys) expect(y, `h=${h}`).toBeLessThanOrEqual(30 + 1e-3);
    }
  });
});

describe('Model', () => {
  const nodes = (h: number): Pt[] => [
    ...modelTop(h),
    [4, 27],
    [16, 27],
    [28, 27],
  ];
  it("keeps every link joined to its nodes, inside the rings' walls, never in a hole", () => {
    grid(32);
    for (const h of STEPS) {
      const s = Model.geo({ h });
      const links = cover({ l: s.links });
      const rings = cover({ t: s.top, b: s.bottom });
      // Every ring shares ink with a link (they're joined).
      let joined = 0;
      for (let k = 0; k < links.length; k++) joined += links[k] & rings[k];
      expect(joined).toBeGreaterThan(0);
      // No link ink near any node's hole (r 1; the links end ≥ 1.73 out).
      let nearest = Infinity;
      for (let j = 0; j < N; j++) {
        for (let k = 0; k < N; k++) {
          if (!links[j * N + k]) continue;
          const [x, y] = [at(k), at(j)];
          for (const c of nodes(h))
            nearest = Math.min(nearest, Math.hypot(x - c[0], y - c[1]));
        }
      }
      expect(nearest, `h=${h}`).toBeGreaterThan(1.6);
    }
  });
});

describe('the parity measure', () => {
  it('sees ink, and tells different icons apart', () => {
    grid(32);
    const ink = coverCarbon(CForum, 32);
    expect(ink.reduce((a, v) => a + v, 0)).toBeGreaterThan(5000);
    expect(
      delta(cover(Building.geo({ h: 0 }, 32)), coverCarbon(CEnterprise, 32))
    ).toBeGreaterThan(0.3);
    // A quarter-hover slip shows.
    expect(
      delta(cover(Chip.geo({ h: 0.25 }, 32)), coverCarbon(CChip, 32))
    ).toBeGreaterThan(GATE);
  });
  it('sees a scaled stroke: a wall drawn 2.5px wide fails the weight check', () => {
    grid(16);
    const t2 = thickness(cover({ a: { d: 'M2 2H30V4H2Z' } }));
    const t25 = thickness(cover({ a: { d: 'M2 2H30V4.5H2Z' } }));
    expect(quantile(t2, 0.5)).toBeCloseTo(2, 1);
    expect(quantile(t25, 0.5)).toBeGreaterThan(2.4);
  });
});

describe('parity report', () => {
  it('logs Δ per icon and size, the gaps and the weights', () => {
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
    console.log(
      Object.entries(weights)
        .map(([n, w]) => `${n}: ${w.join(', ')}`)
        .join('\n')
    );
  });
});
