/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  CloudDownload as CCloudDownload,
  CloudUpload as CCloudUpload,
  Document as CDocument,
  DocumentExport as CDocumentExport,
  DocumentImport as CDocumentImport,
  Download as CDownload,
  Export as CExport,
  ImportExport as CImportExport,
  Share as CShare,
  Upload as CUpload,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  CloudDownload,
  CloudUpload,
  Document,
  DocumentExport,
  DocumentImport,
  Download,
  Export,
  ImportExport,
  Share,
  Upload,
} from '../../icons/operations/transfer';

/**
 * The transfer icons (transfer.ts): keys and NaNs across the hover at every
 * size; rest parity with Carbon at 16 / 20 / 24 / 32 by coverage (the same
 * sampler as opsFillToggles.test.tsx, which mirrors the browser Parity
 * story: Δ is the share of ink pixels whose coverage differs by more than a
 * quarter, gated at 0.5%); and the hover as rigid moves at constant weight:
 * every outline point moves by one of the icon's allowed offsets (a head
 * rigidly by its reach, a tail not at all), never by a scale.
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

/** A Carbon icon at a size, sampled in the 32-unit grid. */
function coverCarbon(Icon: CarbonIcon, size: number): Uint8Array {
  const { container, unmount } = render(<Icon size={size} />);
  const svg = container.querySelector('svg')!;
  const vb = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const ink = new Uint8Array(N * N);
  svg.querySelectorAll('path').forEach((el) => {
    const polys = flatten(el.getAttribute('d')!).map(({ pts, closed }) => ({
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

// ── The icons ────────────────────────────────────────────────────────────────

/**
 * Per shape key, the offsets its outline points may move by at full hover
 * (a rigid head, a held tail, a wall end). Keys left out (Share's rings)
 * are checked another way.
 */
type Moves = Record<string, Pt[]>;
const still: Pt = [0, 0];
const wider: Pt[] = [
  [-2, 0],
  [2, 0],
]; // a tray's walls step 2px out (or in)
interface Case {
  name: string;
  icon: FrameHoverIcon;
  carbon: CarbonIcon;
  moves: Moves;
  /** Separate parts that must never touch: [part, part]. */
  apart?: [string, string][];
}
const CASES: Case[] = [
  {
    name: 'Download',
    icon: Download,
    carbon: CDownload,
    moves: { tray: wider, arrow: [still, [0, 2]] },
    apart: [['tray', 'arrow']],
  },
  {
    name: 'Upload',
    icon: Upload,
    carbon: CUpload,
    moves: { tray: wider, arrow: [still, [0, -2]] },
    apart: [['tray', 'arrow']],
  },
  {
    name: 'Export',
    icon: Export,
    carbon: CExport,
    moves: { tray: wider, arrow: [still, [0, -2]] },
    apart: [['tray', 'arrow']],
  },
  {
    name: 'ImportExport',
    icon: ImportExport,
    carbon: CImportExport,
    moves: { tray: [still], down: [still, [0, 2]], up: [still, [0, -2]] },
    apart: [
      ['tray', 'down'],
      ['tray', 'up'],
    ],
  },
  { name: 'Share', icon: Share, carbon: CShare, moves: { links: [still] } },
  {
    name: 'Document',
    icon: Document,
    carbon: CDocument,
    // The page's quarters move 2px out; the fold's points then 4px further in (left, down, or both).
    moves: {
      page: [
        [-2, -2],
        [2, -2],
        [-2, 2],
        [2, 2],
      ],
      lines: [
        [-1, 2],
        [1, 2],
      ],
    },
    apart: [['page', 'lines']],
  },
  {
    name: 'DocumentImport',
    icon: DocumentImport,
    carbon: CDocumentImport,
    moves: { page: [still], arrow: [still, [-2, 0]] },
    apart: [['page', 'arrow']],
  },
  {
    name: 'DocumentExport',
    icon: DocumentExport,
    carbon: CDocumentExport,
    moves: { page: [still], arrow: [still, [2, 0]] },
    apart: [['page', 'arrow']],
  },
  {
    name: 'CloudUpload',
    icon: CloudUpload,
    carbon: CCloudUpload,
    moves: { arrow: [still, [0, -2]] },
    apart: [['cloud', 'arrow']],
  },
  {
    name: 'CloudDownload',
    icon: CloudDownload,
    carbon: CCloudDownload,
    moves: { arrow: [still, [0, 2]] },
    apart: [['cloud', 'arrow']],
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
const gaps: Record<string, string[]> = {};

describe.each(CASES)('$name', ({ name, icon, carbon, moves, apart = [] }) => {
  it.runIf(apart.length > 0)(
    'keeps its separate parts apart through the hover (no shared ink, a clear gap)',
    () => {
      grid(32);
      gaps[name] = [];
      for (const [a, b] of apart) {
        let least = Infinity;
        for (const h of STEPS) {
          const shapes = icon.geo({ h }, 32);
          const [ia, ib] = [cover({ a: shapes[a] }), cover({ b: shapes[b] })];
          let shared = 0;
          for (let k = 0; k < ia.length; k++) shared += ia[k] & ib[k];
          expect(shared, `${a}/${b} h=${h}`).toBe(0);
          least = Math.min(
            least,
            gap(String(shapes[a].d), String(shapes[b].d))
          );
        }
        expect(least, `${a}/${b}`).toBeGreaterThan(1.4);
        gaps[name].push(`${a}/${b} ≥ ${least.toFixed(2)}`);
      }
    }
  );

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

  it('hovers by moving geometry: no transforms or strokes, each point by an allowed offset', () => {
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

describe('Share', () => {
  const rings = ['source', 'top', 'bottom'] as const;
  const centres: Record<(typeof rings)[number], Pt> = {
    source: [7, 16],
    top: [23, 7],
    bottom: [23, 25],
  };
  const radii = (d: string, c: Pt) => {
    const r = flatten(d)
      .flatMap((p) => p.pts)
      .map(([x, y]) => Math.hypot(x - c[0], y - c[1]));
    return [Math.min(...r), Math.max(...r)];
  };

  it('grows each ring 1px in radius in place at a constant 2px wall, all together (no stagger)', () => {
    for (const h of STEPS) {
      const shapes = Share.geo({ h });
      for (const k of rings) {
        const [lo, hi] = radii(String(shapes[k].d), centres[k]);
        expect(hi - lo, `${k} wall h=${h}`).toBeCloseTo(2, 3);
      }
    }
    const full = Share.geo({ h: 1 });
    for (const k of rings)
      expect(radii(String(full[k].d), centres[k])[1], k).toBeCloseTo(6, 3);
    const early = Share.geo({ h: 0.2 });
    expect(radii(String(early.source.d), centres.source)[1] - 5).toBeCloseTo(
      radii(String(early.top.d), centres.top)[1] - 5,
      6
    );
  });

  it('keeps every link end inside a ring wall, at rest and grown (never poking into a node)', () => {
    const ends = flatten(String(Share.geo({ h: 0 }).links.d)).flatMap(
      (p) => p.pts
    );
    for (const [x, y] of ends) {
      const c = Object.values(centres).reduce((best, q) =>
        Math.hypot(x - q[0], y - q[1]) < Math.hypot(x - best[0], y - best[1])
          ? q
          : best
      );
      const r = Math.hypot(x - c[0], y - c[1]);
      expect(r).toBeGreaterThan(4); // the grown ring's inner edge
      expect(r).toBeLessThan(5); // the resting ring's outer edge
    }
    // And the middle of each link's end edge, too.
    for (const { pts } of flatten(String(Share.geo({ h: 0 }).links.d))) {
      for (const [a, b] of [
        [pts[3], pts[0]],
        [pts[1], pts[2]],
      ]) {
        const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const r = Math.min(
          ...Object.values(centres).map((q) =>
            Math.hypot(m[0] - q[0], m[1] - q[1])
          )
        );
        expect(r).toBeGreaterThan(4);
        expect(r).toBeLessThan(5);
      }
    }
  });
});

describe('Clouds', () => {
  /** Ink runs (in units) along row y or column x of one shape, at 32px. */
  const runs = (d: string, axis: 'row' | 'col', at0: number): number[] => {
    grid(32);
    const ink = cover({ s: { d } });
    const line = Math.round((at0 - LO) / STEP - 0.5);
    const out: number[] = [];
    let n = 0;
    for (let k = 0; k <= N; k++) {
      const v =
        k < N && (axis === 'row' ? ink[line * N + k] : ink[k * N + line]);
      if (v) n++;
      else if (n) {
        out.push(n * STEP);
        n = 0;
      }
    }
    return out;
  };
  it.each([
    ['CloudUpload', CloudUpload, 1],
    ['CloudDownload', CloudDownload, -1],
  ] as const)(
    '%s: the cloud scales about its base (sides 1px, top 1.38px, base held) at a constant wall',
    (_n, icon, g) => {
      const [rest, full] = [
        String(icon.geo({ h: 0 }).cloud.d),
        String(icon.geo({ h: 1 }).cloud.d),
      ];
      // Across the lobes (y 15.5) and the top (x 16): the same wall widths.
      for (const [axis, at0] of [
        ['row', 15.5],
        ['col', 16],
      ] as const) {
        const [a, b] = [runs(rest, axis, at0), runs(full, axis, at0)];
        expect(b.length, `${axis} ${at0}`).toBe(a.length);
        b.forEach((w, i) =>
          expect(Math.abs(w - a[i]), `${axis} ${at0} run ${i}`).toBeLessThan(
            0.07
          )
        );
      }
      const box = (d: string) => {
        const pts = flatten(d).flatMap((p) => p.pts);
        return [
          Math.min(...pts.map(([x]) => x)),
          Math.min(...pts.map(([, y]) => y)),
          Math.max(...pts.map(([x]) => x)),
          Math.max(...pts.map(([, y]) => y)),
        ];
      };
      const [r, h] = [box(rest), box(full)];
      expect(h[0]).toBeCloseTo(r[0] - g, 1);
      expect(h[1]).toBeCloseTo(r[1] - (g * 17.97) / 13, 1);
      expect(h[2]).toBeCloseTo(r[2] + g, 1);
      expect(h[3]).toBeCloseTo(r[3], 2);
    }
  );

  const cloudGaps: string[] = [];
  it.each([
    ['CloudUpload', CloudUpload],
    ['CloudDownload', CloudDownload],
  ] as const)(
    '%s: the open ends stay cut at x 9 and 23, 6px either side of the shaft, at every frame',
    (name, icon) => {
      const at3: string[] = [];
      for (const h of STEPS) {
        const shapes = icon.geo({ h });
        // Across the stubs (y 21): left stub, shaft, right stub, with the same spaces between them.
        grid(32);
        const ink = cover(shapes);
        const row = Math.round((21 - LO) / STEP - 0.5);
        const edges: number[] = [];
        for (let k = 1; k < N; k++)
          if (ink[row * N + k] !== ink[row * N + k - 1])
            edges.push(LO + k * STEP);
        // [cloud left …, stub end 9, shaft 15, 17, stub end 23, … cloud right]
        const inner = edges.slice(1, -1);
        expect(
          inner.map((x) => Math.round(x * 10) / 10),
          `h=${h}`
        ).toEqual([9, 15, 17, 23]);
        if ([0, 0.5, 1].includes(h))
          at3.push(
            `h ${h}: shaft ↔ ends ${(inner[1] - inner[0]).toFixed(2)} / ${(inner[3] - inner[2]).toFixed(2)}, nearest ${gap(String(shapes.cloud.d), String(shapes.arrow.d)).toFixed(2)}`
          );
      }
      cloudGaps.push(`${name}: ${at3.join('; ')}`);
    }
  );
  it('reports the cloud gaps', () => {
    console.log(cloudGaps.join('\n'));
  });
});

describe('the parity measure', () => {
  it('sees ink, and tells different icons apart', () => {
    grid(32);
    const ink = coverCarbon(CDownload, 32);
    expect(ink.reduce((a, v) => a + v, 0)).toBeGreaterThan(10000);
    expect(
      delta(cover(Download.geo({ h: 0 }, 32)), coverCarbon(CUpload, 32))
    ).toBeGreaterThan(0.3);
    // A 0.5px slip of one part shows: the arrow alone, half a unit down.
    expect(delta(cover(Download.geo({ h: 0.25 }, 32)), ink)).toBeGreaterThan(
      GATE
    );
  });
});

describe('parity report', () => {
  it('logs Δ per icon and size', () => {
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
