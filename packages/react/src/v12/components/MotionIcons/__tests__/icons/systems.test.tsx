/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  AppConnectivity as CAppConnectivity,
  Branch as CBranch,
  ChartWinLoss as CChartWinLoss,
  Data_2 as CData_2,
  DataViewAlt as CDataViewAlt,
  Debug as CDebug,
  DecisionTree as CDecisionTree,
  Deploy as CDeploy,
  Integration as CIntegration,
  MergeNode as CMergeNode,
  Migrate as CMigrate,
  ParentNode as CParentNode,
  Run as CRun,
  TreeView as CTreeView,
  VirtualMachine as CVirtualMachine,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import { polyPath, type Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  AppConnectivity,
  Branch,
  ChartWinLoss,
  Data_2,
  DataViewAlt,
  Debug,
  DecisionTree,
  Deploy,
  Integration,
  MergeNode,
  Migrate,
  ParentNode,
  Run,
  TreeView,
  VirtualMachine,
  hexTurned,
  integration,
} from '../../icons/assorted/systems';

/**
 * Systems and data icons (systems.ts): the same shape keys and no NaN across
 * the hover at 16 / 20 / 24 / 32; rest parity with Carbon at every size by
 * coverage (tech.test.tsx's sampler, which mirrors the browser Parity story:
 * Δ is the share of ink pixels whose coverage differs by more than a
 * quarter, gated at 0.5%); constant weight (rigid parts move only by their
 * allowed offsets, and every stroked part's local thickness, the widest disc
 * inside it through each point, never grows past its resting weight);
 * separate parts never touch (and the gaps the motion holds, hold); links
 * stay joined to their nodes and never reach a node's hole; and every frame
 * stays inside the 36×36 hover box (−2 to 34).
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
  /** Of those, the pairs whose gap the motion holds (within 0.05px at every frame). */
  holds?: [string, string][];
  /** Links and the parts they join: [link, part]; joined at every frame, never in the part's holes. */
  joins?: [string, string][];
  /** Solid glyphs that grow (a disc, a triangle): exempt from the weight check. */
  solid?: string[];
  /** The hover ends back on the resting drawing (a scroll of one period): checked mid-hover instead. */
  cycles?: boolean;
  /** Parts cut square at a window's ends as they scroll (a field leaves a sliver there): their thinnest tenth isn't checked. */
  cut?: string[];
}
const CASES: Case[] = [
  {
    name: 'Data_2',
    icon: Data_2,
    carbon: CData_2,
    moves: { row2: [still] },
    cycles: true,
    cut: ['row0', 'row1', 'row3'],
    apart: [
      ['row0', 'row1'],
      ['row1', 'row2'],
      ['row2', 'row3'],
    ],
    holds: [
      ['row0', 'row1'],
      ['row1', 'row2'],
      ['row2', 'row3'],
    ],
  },
  {
    name: 'DataViewAlt',
    icon: DataViewAlt,
    carbon: CDataViewAlt,
    moves: { page: [still, [0, -1], [-0.2, 0]], lines: [still] },
    apart: [
      ['page', 'eye'],
      ['page', 'lines'],
      ['lines', 'eye'],
      ['eye', 'pupil'],
      ['page', 'pupil'],
    ],
    // The eye opens as Content view's: its lids hold 2px (lens and iris both grow 1px), the iris round the pupil 2 → 2.5.
    holds: [['page', 'eye']],
    solid: ['eye', 'pupil'],
  },
  {
    name: 'ChartWinLoss',
    icon: ChartWinLoss,
    carbon: CChartWinLoss,
    moves: { axis: [still], win: [still, [0, -4]], loss: [still, [0, -4]] },
    joins: [
      ['win', 'axis'],
      ['loss', 'axis'],
    ],
  },
  {
    name: 'MergeNode',
    icon: MergeNode,
    carbon: CMergeNode,
    moves: { arrow: [still, [0, 2]] },
  },
  {
    name: 'ParentNode',
    icon: ParentNode,
    carbon: CParentNode,
    moves: { link: [still] },
    apart: [['parent', 'child']],
    joins: [
      ['link', 'parent'],
      ['link', 'child'],
    ],
    solid: ['parent'],
  },
  {
    name: 'AppConnectivity',
    icon: AppConnectivity,
    carbon: CAppConnectivity,
    moves: {
      links: [still],
      hub: around(1),
      top: around(1),
      bottom: around(1),
    },
    apart: [
      ['hub', 'top'],
      ['hub', 'bottom'],
      ['top', 'bottom'],
    ],
    joins: [
      ['links', 'hub'],
      ['links', 'top'],
      ['links', 'bottom'],
    ],
  },
  { name: 'Integration', icon: Integration, carbon: CIntegration, moves: {} },
  {
    name: 'DecisionTree',
    icon: DecisionTree,
    carbon: CDecisionTree,
    moves: {
      links: [still],
      root: around(1),
      upper: around(1),
      lower: around(1),
    },
    apart: [
      ['root', 'upper'],
      ['root', 'lower'],
      ['upper', 'lower'],
    ],
    joins: [
      ['links', 'root'],
      ['links', 'upper'],
      ['links', 'lower'],
    ],
  },
  {
    name: 'TreeView',
    icon: TreeView,
    carbon: CTreeView,
    moves: {
      links: [still, [0, -1], [0, 1]],
      root: around(1),
      middle: [-1, 1].flatMap((x) => [-2, 0].map((y) => [x, y] as Pt)),
      last: [-1, 1].flatMap((x) => [0, 2].map((y) => [x, y] as Pt)),
    },
    apart: [
      ['root', 'middle'],
      ['root', 'last'],
      ['middle', 'last'],
    ],
    holds: [['middle', 'last']],
    joins: [
      ['links', 'root'],
      ['links', 'middle'],
      ['links', 'last'],
    ],
  },
  {
    name: 'VirtualMachine',
    icon: VirtualMachine,
    carbon: CVirtualMachine,
    moves: {
      server: [
        [-1, -2],
        [1, -2],
      ],
    },
    apart: [['cloud', 'server']],
    holds: [['cloud', 'server']],
  },
  {
    name: 'Branch',
    icon: Branch,
    carbon: CBranch,
    moves: { lines: [still] },
    apart: [['base', 'tips']],
    joins: [
      ['lines', 'base'],
      ['lines', 'tips'],
    ],
  },
  {
    name: 'Migrate',
    icon: Migrate,
    carbon: CMigrate,
    moves: {
      source: [[0, -1]],
      target: [
        [-1, 1],
        [0, 1],
        [1, 1],
      ],
      arrow: [
        [0, -1],
        [0, 1],
      ],
    },
    apart: [
      ['source', 'target'],
      ['arrow', 'target'],
    ],
    holds: [['arrow', 'target']],
    joins: [['arrow', 'source']],
  },
  {
    name: 'Deploy',
    icon: Deploy,
    carbon: CDeploy,
    moves: { container: [still, [0, -2]], box: [still, [0, -2]] },
    apart: [['container', 'box']],
    holds: [['container', 'box']],
  },
  {
    name: 'Run',
    icon: Run,
    carbon: CRun,
    moves: {},
    apart: [
      ['window', 'ring'],
      ['ring', 'play'],
      ['window', 'play'],
    ],
    holds: [['window', 'ring']],
    solid: ['play'],
  },
  {
    name: 'Debug',
    icon: Debug,
    carbon: CDebug,
    moves: {
      antennae: [
        [0, -1],
        [0, -2],
      ],
    },
    joins: [
      ['legs', 'body'],
      ['antennae', 'body'],
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
/** A part's holes: the empty samples its ink encloses (not reachable from the border). */
function holes(ink: Uint8Array): Uint8Array {
  const out = new Uint8Array(N * N).fill(1);
  const stack: number[] = [];
  const push = (i: number) => {
    if (out[i] && !ink[i]) {
      out[i] = 0;
      stack.push(i);
    }
  };
  for (let k = 0; k < N; k++) {
    push(k);
    push((N - 1) * N + k);
    push(k * N);
    push(k * N + N - 1);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const [j, k] = [Math.floor(i / N), i % N];
    if (j > 0) push(i - N);
    if (j < N - 1) push(i + N);
    if (k > 0) push(i - 1);
    if (k < N - 1) push(i + 1);
  }
  for (let i = 0; i < N * N; i++) if (ink[i]) out[i] = 0;
  return out;
}

describe.each(CASES)(
  '$name',
  ({
    name,
    icon,
    carbon,
    moves,
    apart = [],
    holds = [],
    joins = [],
    solid = [],
    cycles = false,
    cut = [],
  }) => {
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

    it('stays inside the 36×36 hover box (−2 to 34) at every frame and size', () => {
      for (const size of SIZES) {
        for (const h of STEPS) {
          for (const [k, attrs] of Object.entries(icon.geo({ h }, size))) {
            for (const { pts } of flatten(String(attrs.d ?? ''))) {
              for (const [x, y] of pts) {
                expect(
                  x >= -2 && x <= 34 && y >= -2 && y <= 34,
                  `${k} (${x}, ${y}) h=${h} @${size}`
                ).toBe(true);
              }
            }
          }
        }
      }
    });

    it('hovers by moving geometry: no transforms or strokes, rigid parts by their allowed offsets', () => {
      for (const size of SIZES) {
        const [rest, full] = [
          icon.geo({ h: 0 }, size),
          icon.geo({ h: 1 }, size),
        ];
        expect(
          JSON.stringify(cycles ? icon.geo({ h: 0.5 }, size) : full)
        ).not.toBe(JSON.stringify(rest));
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
        if (solid.includes(k)) continue;
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
          if (!cut.includes(k))
            expect(
              quantile(t, 0.1),
              `${k} thinnest tenth h=${h}`
            ).toBeGreaterThan(thin0 - 0.13);
          worst = Math.max(worst, Math.abs(quantile(t, 0.5) - mid0));
        }
        weights[name].push(`${k} ${mid0.toFixed(2)} (±${worst.toFixed(2)})`);
      }
    }, 30000);

    it.runIf(apart.length > 0)(
      'keeps its separate parts apart through the hover (no shared ink, a clear gap), and holds the gaps it means to',
      () => {
        grid(32);
        gaps[name] = [];
        for (const [a, b] of apart) {
          let least = Infinity;
          let most = 0;
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
            most = Math.max(most, g);
          }
          // A clear 1.4px, or (where Carbon's own gap is narrower) the resting gap held.
          expect(least, `${a}/${b}`).toBeGreaterThan(
            Math.min(1.4, rest - 0.01)
          );
          if (holds.some(([p, q]) => p === a && q === b)) {
            expect(least, `${a}/${b} holds`).toBeGreaterThan(rest - 0.05);
            expect(most, `${a}/${b} holds`).toBeLessThan(rest + 0.05);
          }
          gaps[name].push(
            `${a}/${b} ${least.toFixed(2)}–${most.toFixed(2)} (rest ${rest.toFixed(2)})`
          );
        }
      },
      30000
    );

    it.runIf(joins.length > 0)(
      'keeps its links joined to the parts they join, and out of their holes',
      () => {
        grid(32);
        for (const h of STEPS) {
          const s = icon.geo({ h }, 32);
          for (const [l, p] of joins) {
            const [link, part] = [cover({ l: s[l] }), cover({ p: s[p] })];
            const hole = holes(part);
            let [joined, inHole] = [0, 0];
            for (let k = 0; k < link.length; k++) {
              joined += link[k] & part[k];
              inHole += link[k] & hole[k];
            }
            expect(joined, `${l}→${p} joined h=${h}`).toBeGreaterThan(0);
            expect(inHole, `${l}→${p} in a hole h=${h}`).toBe(0);
          }
        }
      },
      30000
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

/** The number of separate holes in a part's ink (ignoring specks under 16 samples, a sampler's edge noise far below a pixel). */
function holeCount(ink: Uint8Array): number {
  const hole = holes(ink);
  let n = 0;
  for (let i = 0; i < N * N; i++) {
    if (!hole[i]) continue;
    const stack = [i];
    hole[i] = 0;
    let size = 0;
    while (stack.length) {
      const q = stack.pop()!;
      size++;
      for (const r of [q - 1, q + 1, q - N, q + N])
        if (r >= 0 && r < N * N && hole[r]) {
          hole[r] = 0;
          stack.push(r);
        }
    }
    if (size >= 16) n++;
  }
  return n;
}

describe('Data_2', () => {
  const runs = (d: string) =>
    flatten(d).map(({ pts }) => [
      Math.min(...pts.map((p) => p[0])),
      Math.max(...pts.map((p) => p[0])),
    ]);
  it("scrolls each row's fields right and lands back on Carbon's drawing", () => {
    const [rest, end] = [Data_2.geo({ h: 0 }), Data_2.geo({ h: 1 })];
    for (const k of Object.keys(rest)) {
      const [a, b] = [runs(String(rest[k].d)), runs(String(end[k].d))];
      expect(b.length, k).toBe(a.length);
      a.forEach(([x0, x1], i) => {
        expect(b[i][0], k).toBeCloseTo(x0, 3);
        expect(b[i][1], k).toBeCloseTo(x1, 3);
      });
    }
    // Through the scroll the gaps keep their 3px (they slide, they don't grow), and a moving row's first gap starts right of where it did.
    const gapsOf = (d: string) => {
      const r = runs(d);
      return r.slice(1).map(([x0], i) => [r[i][1], x0]);
    };
    for (const h of STEPS) {
      for (const k of ['row0', 'row1', 'row3'])
        gapsOf(String(Data_2.geo({ h })[k].d)).forEach(([a, b]) =>
          expect(b - a, `${k} gap h=${h}`).toBeCloseTo(3, 3)
        );
    }
    // Just after each moving row starts (its slot, 16ms apart), its first gap is right of where it rests.
    const started = (slot: number) =>
      (slot * 16 + 5) / (motionTokens.duration.moderate02 + 2 * 16);
    for (const [k, slot] of [
      ['row0', 2],
      ['row1', 0],
      ['row3', 1],
    ] as const) {
      expect(
        gapsOf(String(Data_2.geo({ h: started(slot) })[k].d))[0][0],
        k
      ).toBeGreaterThan(gapsOf(String(rest[k].d))[0][0]);
    }
    expect(String(Data_2.geo({ h: 0.5 }).row2.d)).toBe(String(rest.row2.d));
  });
});

describe('Integration', () => {
  it('turns half a wedge clockwise to an even hexagon (a full wedge would land on its own drawing), six holes all the way', () => {
    grid(32);
    for (const h of STEPS)
      expect(
        holeCount(cover({ a: Integration.geo({ h }).hexagon })),
        `h=${h}`
      ).toBe(6);
    // Landed: the turned corners are the resting ones.
    hexTurned(1).forEach((p, i) => {
      const q = hexTurned(0)[(i + 5) % 6];
      expect(p[0]).toBeCloseTo(q[0], 6);
      expect(p[1]).toBeCloseTo(q[1], 6);
    });
    expect(
      delta(
        cover({ a: { d: integration(hexTurned(1), 2) } }),
        cover({ a: { d: integration(hexTurned(0), 2) } })
      )
    ).toBe(0);
    // Hovered it rests half a wedge round: the right corner has turned clockwise (down, on screen), and the
    // hexagon is even: mirror-symmetric about both axes through the centre, every corner the same distance out (within 0.02px: Carbon's corners sit 13 and 13.04 out).
    const half = hexTurned(0.5);
    expect(half[0][1]).toBeGreaterThan(16 + 5);
    const key = (p: Pt) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`;
    const set = new Set(half.map(key));
    half.forEach(([x, y]) => {
      expect(set.has(key([32 - x, y]))).toBe(true);
      expect(set.has(key([x, 32 - y]))).toBe(true);
    });
    const radii = half.map(([x, y]) => Math.hypot(x - 16, y - 16));
    expect(Math.max(...radii) - Math.min(...radii)).toBeLessThan(0.03);
  }, 30000);
});

describe('Debug', () => {
  it('swings each pair of legs down and back, top pair first, and only on the way in', () => {
    const legs = (h: number, entering = 1) =>
      flatten(String(Debug.geo({ h, entering }).legs.d)).map(({ pts }) => pts);
    const grownOnly = legs(1);
    // At full hover every leg is back from its swing (only the grow's ride remains): same as leaving at h=1.
    legs(1, 0).forEach((p, i) =>
      p.forEach(([x, y], j) => {
        expect(grownOnly[i][j][0]).toBeCloseTo(x, 6);
        expect(grownOnly[i][j][1]).toBeCloseTo(y, 6);
      })
    );
    // Midway the swing has the tips lower than the same frame unswung (leaving), the top pair furthest along first.
    // A leg's tip: its two points furthest from the bug's middle.
    const tipY = (pts: Pt[][], i: number) => {
      const far = [...pts[i]]
        .sort(
          (p, q) =>
            Math.hypot(q[0] - 16, q[1] - 16) - Math.hypot(p[0] - 16, p[1] - 16)
        )
        .slice(0, 2);
      return (far[0][1] + far[1][1]) / 2;
    };
    const [swung, plain] = [legs(0.3), legs(0.3, 0)];
    for (let i = 0; i < 6; i++)
      expect(tipY(swung, i), `leg ${i}`).toBeGreaterThan(tipY(plain, i));
    expect(tipY(swung, 0) - tipY(plain, 0)).toBeGreaterThan(
      tipY(swung, 4) - tipY(plain, 4)
    );
  });
  it('keeps the legs clear of each other through the swing (same-side neighbours ≥ 2px apart)', () => {
    let least = Infinity;
    for (let i = 0; i <= 40; i++) {
      const polys = flatten(String(Debug.geo({ h: i / 40 }).legs.d)).map(
        ({ pts }) => polyPath(pts, true)
      );
      for (const [a, b] of [
        [0, 2],
        [2, 4],
        [1, 3],
        [3, 5],
      ])
        least = Math.min(least, gap(polys[a], polys[b]));
    }
    expect(least).toBeGreaterThan(2);
    console.log(`Debug legs: nearest neighbours ${least.toFixed(2)}px apart`);
  }, 30000);
});

describe('DataViewAlt', () => {
  it("opens the eye with its lids at 2px (the lens's and the iris's growth match)", () => {
    grid(32);
    const col = Math.round((22 - LO) / STEP - 0.5);
    for (const h of STEPS) {
      const ink = cover({ e: DataViewAlt.geo({ h }).eye });
      const runs: number[] = [];
      let run = 0;
      for (let j = 0; j < N; j++) {
        if (ink[j * N + col]) run++;
        else if (run) {
          runs.push(run * STEP);
          run = 0;
        }
      }
      expect(runs.length, `h=${h}`).toBe(2);
      runs.forEach((r) => expect(r, `lid h=${h}`).toBeCloseTo(2, 1));
    }
  });
});

describe('MergeNode', () => {
  it("keeps the arrow's tip on the node's apex as the node grows", () => {
    for (const h of STEPS) {
      const s = MergeNode.geo({ h });
      const tip = flatten(String(s.arrow.d))[0].pts.reduce((m, p) =>
        p[1] > m[1] ? p : m
      );
      const apex = flatten(String(s.node.d))[0].pts.reduce((m, p) =>
        p[1] < m[1] ? p : m
      );
      expect(tip[0]).toBeCloseTo(16, 3);
      expect(tip[1], `h=${h}`).toBeCloseTo(apex[1], 2);
    }
  });
});

describe('the parity measure', () => {
  it('sees ink, and tells different icons apart', () => {
    grid(32);
    expect(coverCarbon(CDebug, 32).reduce((a, v) => a + v, 0)).toBeGreaterThan(
      5000
    );
    expect(
      delta(cover(DecisionTree.geo({ h: 0 }, 32)), coverCarbon(CTreeView, 32))
    ).toBeGreaterThan(0.3);
    // A quarter-hover slip shows.
    expect(
      delta(
        cover(Integration.geo({ h: 0.25 }, 32)),
        coverCarbon(CIntegration, 32)
      )
    ).toBeGreaterThan(GATE);
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
