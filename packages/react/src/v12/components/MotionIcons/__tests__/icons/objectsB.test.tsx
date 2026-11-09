/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  Attachment as CAttachment,
  Calculator as CCalculator,
  DocumentPdf as CDocumentPdf,
  Laptop as CLaptop,
  Map as CMap,
  Notebook as CNotebook,
  Power as CPower,
  ShoppingCart as CShoppingCart,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  Attachment,
  Calculator,
  CLIP_SCALE,
  DocumentPdf,
  Laptop,
  Map as MapIcon,
  Notebook,
  Power,
  ShoppingCart,
} from '../../icons/assorted/objectsB';

/**
 * Common objects, part B (objectsB.ts): keys and NaNs across the hover at
 * every size; rest parity with Carbon at 16 / 20 / 24 / 32 by coverage (the
 * sampler of transfer.test.tsx, which mirrors the browser Parity story: Δ is
 * the share of ink pixels whose coverage differs by more than a quarter,
 * gated at 0.5%); the hover at constant weight (every outline point moves by
 * one of the icon's allowed offsets, never by a scale; Power's ring, Map's
 * pin and the Attachment clip's scale are checked as walls of constant
 * width); and separate parts never touch.
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
    // Carbon's Laptop nudges its screen with a translate.
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
// ── The icons ────────────────────────────────────────────────────────────────

/**
 * Per shape key, the offsets its outline points may move by at full hover
 * (a rigid part, a held part, a wall's edge). Keys left out (Power's arc,
 * Map's pin and dot, Attachment's clip) are checked as rebuilt walls below.
 */
type Moves = Record<string, Pt[]>;
const still: Pt = [0, 0];
const corners = (dx: number, dy: number): Pt[] => [
  [-dx, -dy],
  [dx, -dy],
  [-dx, dy],
  [dx, dy],
];
interface Case {
  name: string;
  icon: FrameHoverIcon;
  carbon: CarbonIcon;
  moves: Moves;
  /** Separate parts that must never touch: [part, part]. */
  apart?: [string, string][];
}
const CASES: Case[] = [
  // The page holds; the fold's points move 2px in (left, down, or both).
  {
    name: 'DocumentPdf',
    icon: DocumentPdf,
    carbon: CDocumentPdf,
    moves: { page: [still, [-2, 0], [0, 2], [-2, 2]], letters: [still] },
    apart: [['page', 'letters']],
  },
  {
    name: 'Power',
    icon: Power,
    carbon: CPower,
    moves: {
      line: [
        [0, -3],
        [0, 1],
      ],
    },
    apart: [['arc', 'line']],
  },
  { name: 'Attachment', icon: Attachment, carbon: CAttachment, moves: {} },
  {
    name: 'Map',
    icon: MapIcon,
    carbon: CMap,
    moves: { box: [still] },
    apart: [
      ['pin', 'box'],
      ['pin', 'dot'],
    ],
  },
  {
    name: 'ShoppingCart',
    icon: ShoppingCart,
    carbon: CShoppingCart,
    moves: { wheels: [still] },
    apart: [['cart', 'wheels']],
  },
  {
    name: 'Calculator',
    icon: Calculator,
    carbon: CCalculator,
    moves: { case: corners(2, 2), display: [[0, -1]], keys: [[0, 1]] },
    apart: [
      ['case', 'display'],
      ['case', 'keys'],
      ['display', 'keys'],
    ],
  },
  {
    name: 'Laptop',
    icon: Laptop,
    carbon: CLaptop,
    moves: {
      screen: [
        [-1, -2],
        [1, -2],
        [-1, 0],
        [1, 0],
      ],
      base: [
        [-1, 0],
        [1, 0],
      ],
    },
    apart: [['screen', 'base']],
  },
  {
    name: 'Notebook',
    icon: Notebook,
    carbon: CNotebook,
    moves: {
      cover: [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 1],
        [0, 1],
        [1, 1],
      ],
      lines: [still, [1, 0]],
    },
    apart: [['cover', 'lines']],
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
        expect(least, `${a}/${b}`).toBeGreaterThan(1.4);
        gaps[name].push(
          `${a}/${b} ≥ ${least.toFixed(2)} (rest ${rest.toFixed(2)})`
        );
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

/** Every point's distance from c. */
const radii = (d: string, c: Pt) =>
  flatten(d)
    .flatMap((p) => p.pts)
    .map(([x, y]) => Math.hypot(x - c[0], y - c[1]));

/** Is p inside the clip's outline (nonzero)? */
const inside = (polys: Poly[], [x, y]: Pt) => {
  let w = 0;
  for (const { pts } of polys) {
    pts.forEach((a, k) => {
      const b = pts[(k + 1) % pts.length];
      if (a[1] <= y !== b[1] <= y) {
        const xi = a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]);
        if (xi > x) w += b[1] > a[1] ? 1 : -1;
      }
    });
  }
  return w !== 0;
};
/** Ink runs (their lengths) along the segment from a to b. */
const runs = (polys: Poly[], a: Pt, b: Pt): number[] => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.ceil(len / 0.005);
  const out: number[] = [];
  let run = 0;
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    if (
      k < n &&
      inside(polys, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    )
      run++;
    else if (run) {
      out.push((run * len) / n);
      run = 0;
    }
  }
  return out;
};

describe('Power', () => {
  const rings = {
    16: {
      co: [16.095, 17.116] as Pt,
      ro: 13.02,
      ci: [15.904, 17.106] as Pt,
      ri: 10.959,
    },
    32: { co: [16, 17] as Pt, ro: 13, ci: [16, 17] as Pt, ri: 11 },
  };
  it.each([16, 32] as const)(
    '@%i: the ring grows 1px in radius at a constant wall, and its ends keep their space to the line',
    (size) => {
      const { co, ro, ci, ri } = rings[size];
      const rest = gap(
        String(Power.geo({ h: 0 }, size).arc.d),
        String(Power.geo({ h: 0 }, size).line.d)
      );
      for (const h of STEPS) {
        const shapes = Power.geo({ h }, size);
        const [first] = flatten(String(shapes.arc.d));
        // Every point lies on the grown outer circle, the grown inner one, or an end cut between them.
        for (const [x, y] of first.pts) {
          const [o, i] = [
            Math.hypot(x - co[0], y - co[1]),
            Math.hypot(x - ci[0], y - ci[1]),
          ];
          const onEdge =
            Math.abs(o - ro - h) < 5e-3 || Math.abs(i - ri - h) < 5e-3;
          const onCut = y < 9 && o <= ro + h + 5e-3 && i >= ri + h - 5e-3;
          expect(onEdge || onCut, `(${x}, ${y}) h=${h}`).toBe(true);
        }
        expect(
          gap(String(shapes.arc.d), String(shapes.line.d)),
          `h=${h}`
        ).toBeCloseTo(rest, 2);
      }
      if (size === 32) expect(rest).toBeCloseTo(4.5, 2);
    }
  );
});

describe('Attachment', () => {
  const clip = (h: number) => flatten(String(Attachment.geo({ h }).clip.d));
  it('scales at a constant 2px wire: every wire crossed keeps its width', () => {
    // Along the diagonal (both end loops' tips, the inner loop) and across the clip through its centre (all three straight wires).
    const lines: [Pt, Pt][] = [
      [
        [-1, -1],
        [33, 33],
      ],
      [
        [24, 8],
        [8, 24],
      ],
      [
        [27, 11],
        [11, 27],
      ],
    ];
    for (const [a, b] of lines) {
      const [r0, r1] = [runs(clip(0), a, b), runs(clip(1), a, b)];
      expect(r0.length, `${a}→${b}`).toBeGreaterThan(1);
      expect(r1.length, `${a}→${b}`).toBe(r0.length);
      r1.forEach((w, i) =>
        expect(
          Math.abs(w - r0[i]),
          `${a}→${b} run ${i}: ${r0[i]} → ${w}`
        ).toBeLessThan(0.06)
      );
    }
  });
  it('reaches each end loop 2px further out along the diagonal', () => {
    const u = (h: number) =>
      clip(h)
        .flatMap((p) => p.pts)
        .map(([x, y]) => (x + y) / Math.SQRT2);
    expect(Math.min(...u(1)) - Math.min(...u(0))).toBeCloseTo(-2, 1);
    expect(Math.max(...u(1)) - Math.max(...u(0))).toBeCloseTo(2, 1);
    expect(CLIP_SCALE).toBeCloseTo(1.124, 3);
  });
  it("slides the inner loop so its space to the outer wire's free end holds", () => {
    const rest = clip(0)[0].pts;
    const at = (p: Pt) =>
      rest.findIndex(
        ([x, y]) => Math.abs(x - p[0]) < 1e-6 && Math.abs(y - p[1]) < 1e-6
      );
    const [e0, e1] = [at([6.8, 16]), at([8.2, 14.6])];
    // The inner loop's outer edge (Carbon's points round its centre (14.6, 17.42), outside its centreline).
    const loop = rest
      .map((p, i) => [p, i] as const)
      .filter(
        ([[x, y]]) =>
          x + y > 24 && x + y < 33 && Math.hypot(x - 14.6, y - 17.42) > 3.5
      )
      .map(([, i]) => i);
    expect(loop.length).toBeGreaterThan(20);
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
    const space = (h: number) => {
      const pts = clip(h)[0].pts;
      return Math.min(...loop.map((i) => segDist(pts[i], pts[e0], pts[e1])));
    };
    const s0 = space(0);
    expect(s0).toBeGreaterThan(2);
    for (const h of STEPS) expect(space(h), `h=${h}`).toBeCloseTo(s0, 1);
    // The free end draws back along the diagonal to make room for the loop's 4px slide.
    const back = (h: number) => {
      const pts = clip(h)[0].pts;
      return (pts[e0][0] + pts[e0][1]) / Math.SQRT2;
    };
    const scaledEnd =
      16 * Math.SQRT2 + CLIP_SCALE * (22.8 / Math.SQRT2 - 16 * Math.SQRT2);
    gaps.Attachment = [
      `free end/inner loop ${s0.toFixed(2)} → ${space(1).toFixed(2)}; free end draws back ${(scaledEnd - back(1)).toFixed(2)} (vs the scaled clip)`,
    ];
  });
});

describe('Shopping cart', () => {
  const cart = (h: number) => flatten(String(ShoppingCart.geo({ h }).cart.d));
  it('scales open at constant weight: every wall crossed keeps its width', () => {
    // Down through the basket and base, across the upright and the basket's right side, down through the handle.
    const lines: [Pt, Pt][] = [
      [
        [16, 0],
        [16, 26],
      ],
      [
        [0, 12.5],
        [32, 12.5],
      ],
      [
        [2, 0],
        [2, 8],
      ],
    ];
    for (const [a, b] of lines) {
      const [r0, r1] = [runs(cart(0), a, b), runs(cart(1), a, b)];
      expect(r0.length, `${a}→${b}`).toBeGreaterThan(0);
      expect(r1.length, `${a}→${b}`).toBe(r0.length);
      r1.forEach((w, i) =>
        expect(
          Math.abs(w - r0[i]),
          `${a}→${b} run ${i}: ${r0[i]} → ${w}`
        ).toBeLessThan(0.06)
      );
    }
  });
  it('holds the base bar and the upright where it meets it', () => {
    const [p0, p1] = [cart(0)[0].pts, cart(1)[0].pts];
    p0.forEach(([x, y], i) => {
      if (y >= 22) expect(p1[i], `(${x}, ${y})`).toEqual([x, y]);
    });
  });
});

describe('Map', () => {
  /** The pin's two teardrops: [tip, side end, …arc…] each. */
  const pin = (h: number) => flatten(String(MapIcon.geo({ h }).pin.d));
  const dist = (p: Pt, a: Pt, b: Pt) =>
    Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) /
    Math.hypot(b[0] - a[0], b[1] - a[1]);
  it('keeps the pin a 2px wall: the head 2px thick, and the sides parallel 2px apart', () => {
    for (const h of STEPS) {
      const [outer, inner] = pin(h);
      const head: Pt = [16, 10.06 - 2 * h];
      const r = 8.03 + 0.5 * h;
      // The arcs' points (past the tip and the first side's end) lie on the head's circles.
      for (const p of outer.pts.slice(2))
        expect(
          Math.hypot(p[0] - head[0], p[1] - head[1]),
          `outer h=${h}`
        ).toBeCloseTo(r, 2);
      for (const p of inner.pts.slice(2))
        expect(
          Math.hypot(p[0] - head[0], p[1] - head[1]),
          `inner h=${h}`
        ).toBeCloseTo(r - 2, 2);
      // The inner side runs 2px inside the outer side, along its whole length.
      for (const p of [inner.pts[0], inner.pts[1]])
        expect(dist(p, outer.pts[0], outer.pts[1]), `side h=${h}`).toBeCloseTo(
          2,
          2
        );
      // The point holds; the head lifts 2px and grows 1px in diameter.
      expect(outer.pts[0]).toEqual([16, 24]);
    }
  });
  it('lifts the dot with the head and grows it 1px in diameter', () => {
    const r0 = radii(String(MapIcon.geo({ h: 0 }).dot.d), [16, 9]);
    const r1 = radii(String(MapIcon.geo({ h: 1 }).dot.d), [16, 7]);
    for (const r of r0) expect(r).toBeCloseTo(2, 3);
    for (const r of r1) expect(r).toBeCloseTo(2.5, 3);
  });
});

describe('the parity measure', () => {
  it('sees ink, and tells different icons apart', () => {
    grid(32);
    const ink = coverCarbon(CDocumentPdf, 32);
    expect(ink.reduce((a, v) => a + v, 0)).toBeGreaterThan(5000);
    expect(
      delta(cover(Calculator.geo({ h: 0 }, 32)), coverCarbon(CLaptop, 32))
    ).toBeGreaterThan(0.3);
    // A quarter-hover slip shows.
    expect(
      delta(
        cover(ShoppingCart.geo({ h: 0.25 }, 32)),
        coverCarbon(CShoppingCart, 32)
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
