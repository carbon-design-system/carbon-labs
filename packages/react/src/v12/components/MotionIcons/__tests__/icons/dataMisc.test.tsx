/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  Area as CArea,
  CarouselHorizontal as CCarouselHorizontal,
  Categories as CCategories,
  Category as CCategory,
  CenterSquare as CCenterSquare,
  ChartParallel as CChartParallel,
  DataStructured as CDataStructured,
  HeatMap as CHeatMap,
  Insert as CInsert,
  JoinRight as CJoinRight,
  License as CLicense,
  MigrateAlt as CMigrateAlt,
  Ordinal as COrdinal,
  Overlay as COverlay,
  PackageNode as CPackageNode,
  ParentChild as CParentChild,
  Policy as CPolicy,
  ProgressBarRound as CProgressBarRound,
  QueryQueue as CQueryQueue,
  Queued as CQueued,
  TableOfContents as CTableOfContents,
  TextLink as CTextLink,
  TreeViewAlt as CTreeViewAlt,
  Types as CTypes,
  UpdateNow as CUpdateNow,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  Area,
  CarouselHorizontal,
  Categories,
  Category,
  CenterSquare,
  ChartParallel,
  DataStructured,
  HeatMap,
  Insert,
  JoinRight,
  License,
  MigrateAlt,
  Ordinal,
  Overlay,
  PackageNode,
  ParentChild,
  Policy,
  ProgressBarRound,
  QueryQueue,
  Queued,
  TableOfContents,
  TextLink,
  TreeViewAlt,
  Types,
  UpdateNow,
  SERIES_HOVER,
  updateDrawBack,
} from '../../icons/assorted/dataMisc';

/**
 * Data and miscellaneous icons (dataMisc.ts): the same shape keys and no NaN
 * across the hover at 16 / 20 / 24 / 32; rest parity with Carbon at every
 * size by coverage (systems.test.tsx's sampler, which mirrors the browser
 * Parity story: Δ is the share of ink pixels whose coverage differs by more
 * than a quarter, gated at 0.5%); constant weight (rigid parts move only by
 * their allowed offsets, and every part's local thickness, the widest disc
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

// The sampled box runs 2px past the hover box on every side (−4 to 36), so ink on its edge still has a measured thickness.
const [LO, SUB, SPAN] = [-4, 8, 40];
let [STEP, N] = [1 / 32, 1280];
const grid = (size: number) => {
  [STEP, N] = [8 / size / SUB, (SPAN * size * SUB) / 8];
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
    if (el.getAttribute('fill') === 'none') return; // Join right's unpainted guide path
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
const corners = (k: number): Pt[] => [
  [-k, -k],
  [k, -k],
  [-k, k],
  [k, k],
];
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
}
const pairs = (keys: string[]): [string, string][] =>
  keys.flatMap((a, i) =>
    keys.slice(i + 1).map((b) => [a, b] as [string, string])
  );
const CASES: Case[] = [
  {
    name: 'ChartParallel',
    icon: ChartParallel,
    carbon: CChartParallel,
    moves: { axes: [still] },
    apart: [
      ['series0', 'series1'],
      ['series1', 'series2'],
    ],
    joins: [
      ['series0', 'axes'],
      ['series1', 'axes'],
      ['series2', 'axes'],
    ],
  },
  {
    name: 'HeatMap',
    icon: HeatMap,
    carbon: CHeatMap,
    moves: {
      dots: [still],
      topLeft: corners(1),
      bottomRight: corners(1),
      topRight: [still, [2, 0], [0, -2], [2, -2]],
      bottomLeft: [still, [-2, 0], [0, -2], [-2, -2]],
    },
    apart: pairs(['topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'dots']),
    holds: [['topRight', 'dots']],
  },
  {
    name: 'ProgressBarRound',
    icon: ProgressBarRound,
    carbon: CProgressBarRound,
    moves: { outer: [still], inner: [still] },
    apart: [
      ['outer', 'arc'],
      ['arc', 'inner'],
      ['outer', 'inner'],
    ],
    holds: [
      ['outer', 'arc'],
      ['arc', 'inner'],
    ],
  },
  {
    name: 'DataStructured',
    icon: DataStructured,
    carbon: CDataStructured,
    moves: { root: [still], dot: [still], box: around(1) },
    apart: [
      ['root', 'box'],
      ['root', 'left'],
      ['root', 'right'],
      ['box', 'left'],
      ['box', 'right'],
      ['dot', 'root'],
    ],
    holds: [
      ['box', 'left'],
      ['box', 'right'],
      ['dot', 'root'],
    ],
    joins: [
      ['links', 'root'],
      ['links', 'box'],
      ['links', 'left'],
      ['links', 'right'],
    ],
    solid: ['dot'],
  },
  {
    name: 'ParentChild',
    icon: ParentChild,
    carbon: CParentChild,
    moves: {
      root: around(1),
      left: [
        [-2, -1],
        [-2, 1],
        [0, -1],
        [0, 1],
      ],
      right: [
        [0, -1],
        [0, 1],
        [2, -1],
        [2, 1],
      ],
    },
    apart: [
      ['root', 'left'],
      ['root', 'right'],
      ['left', 'right'],
    ],
    holds: [['left', 'right']],
    joins: [
      ['links', 'root'],
      ['links', 'left'],
      ['links', 'right'],
    ],
  },
  {
    name: 'TreeViewAlt',
    icon: TreeViewAlt,
    carbon: CTreeViewAlt,
    moves: {
      root: around(1),
      links: [still],
      top: [still, [2, 0]],
      middle: [still, [2, 0]],
      bottom: [still, [2, 0]],
    },
    apart: pairs(['root', 'top', 'middle', 'bottom']),
    holds: [
      ['top', 'middle'],
      ['middle', 'bottom'],
    ],
    joins: [
      ['links', 'root'],
      ['links', 'top'],
      ['links', 'middle'],
      ['links', 'bottom'],
    ],
  },
  {
    name: 'QueryQueue',
    icon: QueryQueue,
    carbon: CQueryQueue,
    moves: {},
    apart: [
      ['lineA', 'lineB'],
      ['lineB', 'lineC'],
      ['lineC', 'lineD'],
      ['lineD', 'lineE'],
      ['lineB', 'play'],
      ['lineC', 'play'],
      ['lineD', 'play'],
      ['lineE', 'play'],
    ],
    solid: ['play'],
  },
  { name: 'Ordinal', icon: Ordinal, carbon: COrdinal, moves: {} },
  {
    name: 'Types',
    icon: Types,
    carbon: CTypes,
    moves: { left: [[-2, 0]], right: [[2, 0]] },
    apart: [
      ['left', 'diamond'],
      ['diamond', 'right'],
    ],
  },
  {
    name: 'Categories',
    icon: Categories,
    carbon: CCategories,
    moves: {},
    apart: pairs(['topLeft', 'topRight', 'bottomLeft', 'bottomRight']),
    holds: [
      ['topLeft', 'topRight'],
      ['topLeft', 'bottomLeft'],
      ['topRight', 'bottomRight'],
      ['bottomLeft', 'bottomRight'],
    ],
  },
  {
    name: 'Category',
    icon: Category,
    carbon: CCategory,
    moves: { root: around(1) },
    apart: [
      ['root', 'left'],
      ['root', 'middle'],
      ['root', 'right'],
      ['left', 'middle'],
      ['middle', 'right'],
    ],
    holds: [
      ['left', 'middle'],
      ['middle', 'right'],
    ],
    joins: [
      ['links', 'root'],
      ['links', 'left'],
      ['links', 'middle'],
      ['links', 'right'],
    ],
  },
  {
    name: 'TableOfContents',
    icon: TableOfContents,
    carbon: CTableOfContents,
    moves: Object.fromEntries(
      [0, 1, 2, 3].map((i) => [`line${i}`, [still, [-1, 0]]])
    ),
    solid: ['number0', 'number1', 'number2', 'number3'],
    apart: [0, 1, 2, 3].flatMap(
      (i) =>
        [
          [`line${i}`, `number${i}`],
          ...(i < 3
            ? [
                [`line${i}`, `line${i + 1}`],
                [`number${i}`, `number${i + 1}`],
              ]
            : []),
        ] as [string, string][]
    ),
  },
  {
    name: 'Policy',
    icon: Policy,
    carbon: CPolicy,
    moves: { page: [still, [0, -1]] },
    apart: [
      ['page', 'medal'],
      ['lines', 'medal'],
      ['page', 'lines'],
    ],
    holds: [
      ['page', 'medal'],
      ['lines', 'medal'],
    ],
  },
  {
    name: 'License',
    icon: License,
    carbon: CLicense,
    moves: { page: around(2) },
    apart: [['page', 'lines']],
  },
  {
    name: 'JoinRight',
    icon: JoinRight,
    carbon: CJoinRight,
    moves: {},
    apart: [['lens', 'crescent']],
    holds: [['lens', 'crescent']],
    // The overlap's two solid pieces change shape as the circles slide (the crescent 8 → 6px at its widest); the ring keeps its 2px.
    solid: ['lens', 'crescent'],
  },
  { name: 'PackageNode', icon: PackageNode, carbon: CPackageNode, moves: {} },
  {
    name: 'TextLink',
    icon: TextLink,
    carbon: CTextLink,
    moves: { text: [still, [2, 0]] },
    apart: [
      ['upper', 'lower'],
      ['text', 'upper'],
      ['text', 'lower'],
    ],
    holds: [['upper', 'lower']],
  },
  {
    name: 'MigrateAlt',
    icon: MigrateAlt,
    carbon: CMigrateAlt,
    moves: { window: [still, [2, 0]] },
  },
  {
    name: 'Area',
    icon: Area,
    carbon: CArea,
    moves: {},
    joins: [['edges', 'nodes']],
  },
  {
    name: 'Overlay',
    icon: Overlay,
    carbon: COverlay,
    moves: { back: [[1, 1]], front: [[-1, -1]] },
  },
  {
    name: 'Insert',
    icon: Insert,
    carbon: CInsert,
    moves: {
      top: [[0, -1]],
      middle: [[0, 1]],
      bottom: [[0, 1]],
      arrow: [still, [-2, 0]],
    },
    apart: [
      ['top', 'middle'],
      ['middle', 'bottom'],
      ['top', 'arrow'],
      ['middle', 'arrow'],
      ['bottom', 'arrow'],
    ],
  },
  {
    name: 'UpdateNow',
    icon: UpdateNow,
    carbon: CUpdateNow,
    moves: {},
    apart: [
      ['upper', 'ring'],
      ['lower', 'ring'],
      ['upper', 'hands'],
      ['lower', 'hands'],
      ['ring', 'hands'],
      ['upper', 'lower'],
    ],
    holds: [
      ['upper', 'ring'],
      ['lower', 'ring'],
      ['upper', 'lower'],
    ],
    // The hands' mitre fattens as the minute hand turns toward the hour hand (Time's); their 2px is checked across each hand below.
    solid: ['hands'],
  },
  {
    name: 'CenterSquare',
    icon: CenterSquare,
    carbon: CCenterSquare,
    moves: {
      brackets: corners(2),
      ticks: [still, [0, -1], [-1, 0], [1, 0], [0, 1]],
    },
    apart: [['brackets', 'ticks']],
  },
  {
    name: 'Queued',
    icon: Queued,
    carbon: CQueued,
    moves: {
      bullets: [still],
      line0: [still, [1, 0]],
      line1: [still, [1, 0]],
      line2: [still, [1, 0]],
    },
    // Dashes cut where they pass the queue's clearance thin to nothing there: checked below.
    solid: ['dashes'],
    apart: [
      ['dashes', 'bullets'],
      ['dashes', 'line0'],
      ['dashes', 'line2'],
      ['bullets', 'line0'],
      ['bullets', 'line1'],
      ['bullets', 'line2'],
      ['line0', 'line1'],
      ['line1', 'line2'],
    ],
    // The 4px to the queue is held by the clearance (checked below): nothing comes nearer, dashes leave it.
  },
  {
    name: 'CarouselHorizontal',
    icon: CarouselHorizontal,
    carbon: CCarouselHorizontal,
    moves: {},
    cycles: true,
    apart: [
      ['left', 'centre'],
      ['centre', 'right'],
      ['right', 'next'],
    ],
    holds: [['centre', 'right']],
    // Cards cut at the frame's edges (as Carbon cuts the side cards) thin to nothing as they leave: their walls are checked whole below.
    solid: ['left', 'centre', 'right', 'next'],
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

describe('ChartParallel', () => {
  it("moves each series' points along their axes to the new values, at a 2px perpendicular weight", () => {
    const at = (d: string, x: number) => {
      // The series' centre at x: the midpoint of its top and bottom edges there.
      const ys: number[] = [];
      for (const { pts } of flatten(d)) {
        pts.forEach((a, i) => {
          const b = pts[(i + 1) % pts.length];
          if ((a[0] - x) * (b[0] - x) < 0)
            ys.push(a[1] + ((x - a[0]) * (b[1] - a[1])) / (b[0] - a[0]));
        });
      }
      return ys;
    };
    const s = ChartParallel.geo({ h: 1 });
    const X = [3, 11, 21, 29];
    SERIES_HOVER.forEach((ys, i) => {
      // Just inside each axis's wall (x 4, 10, 12, …) the line's centre lies on the line through the new values, its vertical thickness 2√(1+m²).
      X.slice(1).forEach((x1, j) => {
        const m = (ys[j + 1] - ys[j]) / (x1 - X[j]);
        for (const x of [X[j] + 1, x1 - 1]) {
          const [a, b] = at(String(s[`series${i}`].d), x);
          expect((a + b) / 2, `series${i} @${x}`).toBeCloseTo(
            ys[j] + m * (x - X[j]),
            3
          );
          expect(
            Math.abs(b - a) / Math.sqrt(1 + m * m),
            `series${i} weight @${x}`
          ).toBeCloseTo(2, 3);
        }
      });
    });
  });
});

describe('QueryQueue', () => {
  it("advances one row and lands on Carbon's drawing", () => {
    grid(32);
    const end = QueryQueue.geo({ h: 1 });
    expect(end.lineA.d).toBe('');
    const moved = { a: end.lineB, b: end.lineC, c: end.lineD, d: end.lineE };
    const { lineA, lineB, lineC, lineD } = QueryQueue.geo({ h: 0 });
    expect(
      delta(cover(moved), cover({ lineA, lineB, lineC, lineD })),
      'one row on'
    ).toBe(0);
    expect(end.lineE.opacity).toBe(1);
  });
});

describe('Queued', () => {
  it("turns its dashes one period clockwise, never into the queue's 4px clearance, landing on the same seven", () => {
    for (const h of STEPS) {
      for (const { pts } of flatten(String(Queued.geo({ h }).dashes.d))) {
        for (const [x, y] of pts)
          expect(x > 14.001 && y > 16.001, `(${x}, ${y}) h=${h}`).toBe(false);
      }
    }
    expect(flatten(String(Queued.geo({ h: 0 }).dashes.d)).length).toBe(7);
    expect(flatten(String(Queued.geo({ h: 1 }).dashes.d)).length).toBe(7);
  });
});

describe('TextLink', () => {
  it('pulls the halves apart rigidly, 1px per axis each: far ends 2px further out along the diagonal, sides held', () => {
    const span = (d: string, fn: (p: Pt) => number) => {
      const v = flatten(d).flatMap(({ pts }) => pts.map(fn));
      return [Math.min(...v), Math.max(...v)];
    };
    const [r, e] = [TextLink.geo({ h: 0 }), TextLink.geo({ h: 1 })];
    const u = (p: Pt) => p[0] - p[1];
    const w = (p: Pt) => p[0] + p[1];
    expect(span(String(e.upper.d), u)[1]).toBeCloseTo(
      span(String(r.upper.d), u)[1] + 2,
      2
    );
    expect(span(String(e.lower.d), u)[0]).toBeCloseTo(
      span(String(r.lower.d), u)[0] - 2,
      2
    );
    // Each side keeps its line across the axis (the pull runs along it).
    expect(span(String(e.upper.d), w)[1]).toBeCloseTo(
      span(String(r.upper.d), w)[1],
      2
    );
    expect(span(String(e.lower.d), w)[0]).toBeCloseTo(
      span(String(r.lower.d), w)[0],
      2
    );
  });
});

describe('HeatMap', () => {
  it('keeps every tile square and every gap 2px or more', () => {
    grid(32);
    for (const h of STEPS) {
      const s = HeatMap.geo({ h });
      const keys = Object.keys(s);
      keys.forEach((a, i) =>
        keys
          .slice(i + 1)
          .forEach((b) =>
            expect(
              gap(String(s[a].d), String(s[b].d)),
              `${a}/${b} h=${h}`
            ).toBeGreaterThan(1.99)
          )
      );
      for (const k of ['topLeft', 'bottomRight']) {
        const xs = flatten(String(s[k].d))[0].pts.map(([x]) => x);
        const ys = flatten(String(s[k].d))[0].pts.map(([, y]) => y);
        expect(Math.max(...xs) - Math.min(...xs), k).toBeCloseTo(
          Math.max(...ys) - Math.min(...ys),
          6
        );
      }
    }
  }, 30000);
});

describe('CarouselHorizontal', () => {
  it('keeps every card a 2px wall wherever it is not cut by the frame', () => {
    for (const h of STEPS) {
      for (const [k, a] of Object.entries(CarouselHorizontal.geo({ h }))) {
        const [outer, inner] = flatten(String(a.d)).map(({ pts }) => pts);
        if (!outer || !inner) continue;
        const xs = (p: Pt[]) => p.map(([x]) => x);
        const ys = (p: Pt[]) => p.map(([, y]) => y);
        // Top and bottom walls 2px; side walls 2px where the card's side is inside the frame.
        expect(
          Math.min(...ys(inner)) - Math.min(...ys(outer)),
          `${k} top h=${h}`
        ).toBeCloseTo(2, 6);
        expect(
          Math.max(...ys(outer)) - Math.max(...ys(inner)),
          `${k} bottom h=${h}`
        ).toBeCloseTo(2, 6);
        if (Math.min(...xs(outer)) > 0)
          expect(
            Math.min(...xs(inner)) - Math.min(...xs(outer)),
            `${k} left h=${h}`
          ).toBeCloseTo(2, 6);
        if (Math.max(...xs(outer)) < 32)
          expect(
            Math.max(...xs(outer)) - Math.max(...xs(inner)),
            `${k} right h=${h}`
          ).toBeCloseTo(2, 6);
      }
    }
  });
  it("scrolls one card left and lands on Carbon's drawing", () => {
    grid(32);
    expect(
      delta(
        cover(CarouselHorizontal.geo({ h: 1 })),
        cover(CarouselHorizontal.geo({ h: 0 }))
      )
    ).toBe(0);
    expect(CarouselHorizontal.geo({ h: 1 }).left.d).toBe('');
  });
});

/** The width of a closed polygon along the line through p in direction u (the span between its first and last crossings). */
function crossWidth(pts: Pt[], p: Pt, u: Pt): number {
  const ts: number[] = [];
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length];
    const [ex, ey] = [b[0] - a[0], b[1] - a[1]];
    const den = u[0] * ey - u[1] * ex;
    if (Math.abs(den) < 1e-12) return;
    const s = ((a[0] - p[0]) * ey - (a[1] - p[1]) * ex) / den;
    const r = ((a[0] - p[0]) * u[1] - (a[1] - p[1]) * u[0]) / den;
    if (r >= 0 && r <= 1 && Math.abs(s) < 1.6) ts.push(s);
  });
  return Math.max(...ts) - Math.min(...ts);
}

describe('UpdateNow', () => {
  it("turns the clock's hands as Time's (minute 90°, hour 7.5°), anticlockwise with the arrow, at a 2px weight", () => {
    for (const h of STEPS) {
      const hands = flatten(String(UpdateNow.geo({ h }).hands.d))[0].pts;
      for (const [deg, len] of [
        [-90 * h, 3],
        [135 - 7.5 * h, 2.293 * Math.SQRT2],
      ] as const) {
        const a = (deg * Math.PI) / 180;
        const u: Pt = [Math.sin(a), -Math.cos(a)];
        const m: Pt = [24 + u[0] * len * 0.9, 24 + u[1] * len * 0.9];
        expect(
          crossWidth(hands, m, [-u[1], u[0]]),
          `${deg}° h=${h}`
        ).toBeCloseTo(2, 3);
      }
    }
  });
  it("draws the arcs' ends back by the angle that holds their space to the grown ring", () => {
    expect(updateDrawBack(7)).toBeCloseTo(0, 6);
    expect(updateDrawBack(8)).toBeGreaterThan(5);
    expect(updateDrawBack(8)).toBeLessThan(6);
  });
});

describe('the parity measure', () => {
  it('sees ink, and tells different icons apart', () => {
    grid(32);
    expect(
      coverCarbon(CCategories, 32).reduce((a, v) => a + v, 0)
    ).toBeGreaterThan(5000);
    expect(
      delta(cover(Category.geo({ h: 0 }, 32)), coverCarbon(CDataStructured, 32))
    ).toBeGreaterThan(0.1);
    // A quarter-hover slip shows.
    expect(
      delta(cover(License.geo({ h: 0.25 }, 32)), coverCarbon(CLicense, 32))
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
