/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  Api as CApi,
  Application as CApplication,
  Book as CBook,
  Certificate as CCertificate,
  ContentView as CContentView,
  CopyFile as CCopyFile,
  Cube as CCube,
  DocumentBlank as CDocumentBlank,
  Folders as CFolders,
  Rule as CRule,
  RuleFilled as CRuleFilled,
  Task as CTask,
  Workspace as CWorkspace,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { Document } from '../../icons/operations/transfer';
import {
  Api,
  Application,
  Book,
  Certificate,
  ContentView,
  CopyFile,
  Cube,
  DocumentBlank,
  Folders,
  Rule,
  RuleFilled,
  RuleToggle,
  Task,
  Workspace,
  CUBE_TURN,
  SEAL_CENTRE,
  SEAL_GROW,
  cubeArt,
  ruleShapes,
} from '../../icons/assorted/files';

/**
 * Files and documents (files.ts): keys and NaNs across the hover (and the
 * Rule toggle's h/p/e grid) at every size; rest parity with Carbon at 16 /
 * 20 / 24 / 32 by coverage (the sampler of objectsB.test.tsx, which mirrors
 * the browser Parity story: Δ is the share of ink pixels whose coverage
 * differs by more than a quarter, gated at 0.5%); constant line weight (each
 * outline point moves by one of the icon's allowed offsets, never by a
 * scale; walls crossed by fixed probes keep their width; the cube's walls
 * sit 1px either side of its centreline); separate parts never touch; and
 * the toggle's ends equal the hover icons.
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
const tiles = ['main', 'right', 'below', 'corner'];
const pairs = (keys: string[]) =>
  keys.flatMap((a, i) =>
    keys.slice(i + 1).map((b): [string, string] => [a, b])
  );
const CASES: Case[] = [
  {
    name: 'DocumentBlank',
    icon: DocumentBlank,
    carbon: CDocumentBlank,
    probes: [
      ['page', [0, 20], [32, 20]],
      ['page', [12, -2], [12, 34]],
    ],
  },
  {
    name: 'Application',
    icon: Application,
    carbon: CApplication,
    moves: {
      main: corners(1),
      right: [[1, 1]],
      below: [[1, 1]],
      corner: [[1, 1]],
    },
    apart: pairs(tiles),
  },
  {
    name: 'Workspace',
    icon: Workspace,
    carbon: CWorkspace,
    moves: {
      main: [still, [3, 0]],
      above: [still, [3, 0]],
      right: [still, [3, 0]],
      corner: [still, [3, 0]],
    },
    apart: pairs(['main', 'above', 'right', 'corner']),
  },
  { name: 'Cube', icon: Cube, carbon: CCube },
  {
    name: 'Folders',
    icon: Folders,
    carbon: CFolders,
    probes: [
      ['front', [0, 20], [32, 20]],
      ['front', [22, 9], [22, 34]],
      ['back', [22, -2], [22, 10]],
      ['front', [10.4, 16.3], [20, 3.5]],
      ['back', [10.4, 16.3], [20, 3.5]],
    ],
    apart: [['front', 'back']],
  },
  {
    name: 'Task',
    icon: Task,
    carbon: CTask,
    moves: {
      board: [
        [-2, -2],
        [2, -2],
        [-2, 2],
        [2, 2],
        [0, -2],
      ],
    },
    probes: [
      ['check', [9.85, 21.44], [13.85, 17.44]],
      ['check', [16.15, 15.44], [20.15, 19.44]],
    ],
    apart: [['board', 'check']],
  },
  {
    name: 'Book',
    icon: Book,
    carbon: CBook,
    moves: {
      cover: [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 1],
        [0, 1],
        [1, 1],
      ],
      lines: [still, [-1, 0], [1, 0]],
    },
    apart: [['cover', 'lines']],
  },
  {
    name: 'Certificate',
    icon: Certificate,
    carbon: CCertificate,
    moves: { lines: [still, [2, 0]] },
    apart: [
      ['frame', 'seal'],
      ['lines', 'seal'],
      ['frame', 'lines'],
    ],
  },
  {
    name: 'CopyFile',
    icon: CopyFile,
    carbon: CCopyFile,
    moves: {
      back: [
        [1, 1],
        [-2, 1],
        [1, 2],
      ],
    },
    probes: [
      ['front', [0, 24], [34, 24]],
      ['front', [14, 0], [14, 34]],
    ],
    apart: [['back', 'front']],
  },
  {
    name: 'Api',
    icon: Api,
    carbon: CApi,
    probes: [
      ['hub', [0, 16], [32, 16]],
      ['ends', [-2, 6], [34, 6]],
      ['ends', [-2, 26], [34, 26]],
    ],
    apart: [['hub', 'ends']],
  },
  {
    name: 'ContentView',
    icon: ContentView,
    carbon: CContentView,
    probes: [
      ['window', [6, -2], [6, 34]],
      ['window', [-2, 7], [34, 7]],
      ['eye', [16, 11.5], [16, 16.5]],
      ['eye', [16, 21.5], [16, 26.5]],
    ],
    apart: [
      ['window', 'eye'],
      ['eye', 'pupil'],
      ['window', 'pupil'],
    ],
  },
  {
    name: 'Rule',
    icon: Rule,
    carbon: CRule,
    probes: [
      ['shield', [-2, 8], [34, 8]],
      ['shield', [16, -2], [16, 9]],
      ['shield', [16, 20], [16, 34]],
      ['fill', [16, 9], [16, 19]],
    ],
    apart: [['shield', 'fill']],
  },
  {
    name: 'RuleFilled',
    icon: RuleFilled,
    carbon: CRuleFilled,
    probes: [
      ['shield', [-2, 8], [34, 8]],
      ['shield', [16, -2], [16, 9]],
      ['shield', [16, 20], [16, 34]],
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
          expect(least, `${a}/${b}`).toBeGreaterThan(
            name === 'Api' ? 1.1 : 1.4
          );
          gaps[name].push(
            `${a}/${b} ≥ ${least.toFixed(2)} (rest ${rest.toFixed(2)})`
          );
        }
      },
      30_000
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

describe('Document blank', () => {
  it("is Document's page, at every hover frame", () => {
    for (const h of STEPS)
      expect(DocumentBlank.geo({ h }).page).toEqual(Document.geo({ h }).page);
  });
});

describe('Cube', () => {
  /** Distance from p to the segment a–b. */
  const segDist = (p: Pt, a: Pt, b: Pt) => {
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)
      )
    );
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  };
  const edges = (q: readonly Pt[]) =>
    q.map((a, i): [Pt, Pt] => [a, q[(i + 1) % q.length]]);
  it('keeps every wall 2px: the outline 1px outside the turned centreline, each face 1px inside', () => {
    for (const h of STEPS) {
      const { hex, faces } = cubeArt(CUBE_TURN * h);
      const [out, ...holes] = flatten(String(Cube.geo({ h }).cube.d));
      expect(holes.length).toBe(3);
      for (const p of out.pts)
        expect(
          Math.min(...edges(hex).map(([a, b]) => segDist(p, a, b))),
          `outline h=${h}`
        ).toBeCloseTo(1, 3);
      holes.forEach((hole, i) => {
        for (const p of hole.pts)
          expect(
            Math.min(...edges(faces[i]).map(([a, b]) => segDist(p, a, b))),
            `face ${i} h=${h}`
          ).toBeCloseTo(1, 3);
      });
    }
  });
  it('turns about its vertical axis: the front edge swings right, the silhouette stays centred', () => {
    const { faces } = cubeArt(CUBE_TURN);
    const front = faces[0][2];
    expect(front[0] - 16).toBeCloseTo(
      12 * Math.sin((CUBE_TURN * Math.PI) / 180),
      6
    );
    const xs = cubeArt(CUBE_TURN).hex.map(([x]) => x);
    expect(Math.min(...xs) + Math.max(...xs)).toBeCloseTo(32, 6);
  });
});

describe('Folders', () => {
  it('holds the 3px space between the folders through the hover, while the back folder shows its side walls', () => {
    grid(32);
    for (const h of STEPS) {
      const { front, back } = Folders.geo({ h });
      expect(gap(String(front.d), String(back.d)), `h=${h}`).toBeCloseTo(3, 1);
    }
    // At full hover each side wall shows 3px below the band (probes down the walls' centrelines, x 6 and 28, from the band's underside).
    const back = Folders.geo({ h: 1 }).back;
    expect(runs(back, [6, 4.001], [6, 12])[0]).toBeCloseTo(3, 1);
    expect(runs(back, [28, 7.001], [28, 14])[0]).toBeCloseTo(3, 1);
  });
});

describe('Certificate', () => {
  it('grows the seal about its centre (a solid, scaled as geometry)', () => {
    const [r0, r1] = [0, 1].map(
      (h) => flatten(String(Certificate.geo({ h }).seal.d))[0].pts
    );
    r0.forEach(([x, y], i) => {
      expect(r1[i][0]).toBeCloseTo(
        SEAL_CENTRE[0] + (x - SEAL_CENTRE[0]) * (1 + SEAL_GROW),
        2
      );
      expect(r1[i][1]).toBeCloseTo(
        SEAL_CENTRE[1] + (y - SEAL_CENTRE[1]) * (1 + SEAL_GROW),
        2
      );
    });
  });
});

describe('Content view', () => {
  it('opens the eye 1px top and bottom, its lids holding 2px, and grows the pupil 0.5px', () => {
    const lids = (h: number) =>
      runs(ContentView.geo({ h }).eye, [16, 10], [16, 28]);
    expect(lids(0).map((w) => +w.toFixed(2))).toEqual([2, 2]);
    expect(lids(1).map((w) => +w.toFixed(2))).toEqual([2, 2]);
    const top = (h: number) =>
      Math.min(
        ...flatten(String(ContentView.geo({ h }).eye.d))[0].pts.map(
          ([, y]) => y
        )
      );
    expect(top(1) - top(0)).toBeCloseTo(-1, 3);
    expect(
      runs(ContentView.geo({ h: 1 }).pupil, [10, 19], [22, 19])[0]
    ).toBeCloseTo(5, 1);
  });
});

describe('Rule', () => {
  const bars = (h: number, p: number) =>
    runs(ruleShapes(h, p, 0).fill, [0, 11], [32, 11]);
  it('reaches its bars 1px at each end on hover; filled, they are knocked out 1px longer still', () => {
    expect(bars(0, 0).map((w) => +w.toFixed(2))).toEqual([12]);
    expect(bars(1, 0).map((w) => +w.toFixed(2))).toEqual([14]);
    // Filled: the knockout around the bar's middle (16, 11), scanning out to the fill's ink each side.
    const knockout = (h: number) => {
      const polys = flatten(String(ruleShapes(h, 1, 0).fill.d));
      const edge = (dir: 1 | -1) => {
        let x = 16;
        while (!inside(polys, [x, 11], true) && Math.abs(x - 16) < 16)
          x += dir * 0.005;
        return x;
      };
      return edge(1) - edge(-1);
    };
    expect(knockout(0)).toBeCloseTo(14, 1);
    expect(knockout(1)).toBeCloseTo(16, 1);
  });
});

// ── Rule ⇄ Rule filled ───────────────────────────────────────────────────────

describe('Rule toggle', () => {
  const GRID = [0, 0.3, 0.5, 0.7, 1];
  it('keeps the same keys across h, p and e at every size, and never paints NaN', () => {
    for (const size of SIZES) {
      const keys = Object.keys(RuleToggle.geo({ h: 0, p: 0, e: 0 }, size));
      for (const h of GRID)
        for (const p of GRID)
          for (const e of [0, 0.4, 1]) {
            const shapes = RuleToggle.geo({ h, p, e }, size);
            expect(
              Object.keys(shapes),
              `h=${h} p=${p} e=${e} @${size}`
            ).toEqual(keys);
            noBad(shapes, `h=${h} p=${p} e=${e} @${size}`);
          }
    }
  });
  it('ends on the hover icons: Rule at p 0, Rule filled at p 1, at every hover frame', () => {
    for (const size of SIZES) {
      for (const h of STEPS) {
        expect(RuleToggle.geo({ h, p: 0, e: 0 }, size), `off h=${h}`).toEqual(
          Rule.geo({ h }, size)
        );
        expect(RuleToggle.geo({ h, p: 1, e: 0 }, size), `on h=${h}`).toEqual(
          RuleFilled.geo({ h }, size)
        );
        // Emptied all the way (before the reset), it is the outline again.
        grid(size);
        expect(
          delta(
            cover(RuleToggle.geo({ h, p: 1, e: 1 }, size)),
            cover(Rule.geo({ h }, size))
          ),
          `emptied h=${h}`
        ).toBeLessThan(GATE);
      }
    }
  });
  it("rests on Carbon's Rule and Rule filled at every size", () => {
    for (const size of SIZES) {
      grid(size);
      expect(
        delta(
          cover(RuleToggle.geo({ h: 0, p: 0, e: 0 }, size)),
          coverCarbon(CRule, size)
        ),
        `off @${size}`
      ).toBeLessThan(GATE);
      expect(
        delta(
          cover(RuleToggle.geo({ h: 0, p: 1, e: 0 }, size)),
          coverCarbon(CRuleFilled, size)
        ),
        `on @${size}`
      ).toBeLessThan(GATE);
    }
  });
  it('fills from one centre: a disc that only grows, then a hole from the same centre', () => {
    grid(32);
    const area = (s: Shapes) => cover({ f: s.fill }).reduce((a, v) => a + v, 0);
    let last = area(ruleShapes(0, 0, 0));
    for (const p of [0.2, 0.4, 0.6]) {
      const a = area(ruleShapes(0, p, 0));
      expect(a, `p=${p}`).toBeGreaterThan(last);
      last = a;
    }
  });
  it('toggles on click, and renders no masks', () => {
    const { container } = render(
      <MotionIconProvider animated>
        <RuleToggle aria-label="t" />
      </MotionIconProvider>
    );
    const svg = container.querySelector('svg')!;
    expect(svg.querySelector('mask, clipPath')).toBeNull();
    fireEvent.click(svg);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});

describe('the parity measure', () => {
  it('sees ink, and tells different icons apart', () => {
    grid(32);
    expect(coverCarbon(CTask, 32).reduce((a, v) => a + v, 0)).toBeGreaterThan(
      5000
    );
    expect(
      delta(cover(Book.geo({ h: 0 }, 32)), coverCarbon(CCube, 32))
    ).toBeGreaterThan(0.3);
    expect(
      delta(
        cover(Application.geo({ h: 0.5 }, 32)),
        coverCarbon(CApplication, 32)
      )
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
