/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import * as CI from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon, FrameHoverIcon, Shapes } from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import TextBold32 from '@carbon/icons/es/text--bold/32.js';
import TextItalic32 from '@carbon/icons/es/text--italic/32.js';
import TextUnderline32 from '@carbon/icons/es/text--underline/32.js';
import type { IconDescriptor } from '../../static';
import * as ALIGN from '../../icons/formatting/alignFamilies';
import * as STYLE from '../../icons/formatting/textStyle';

const AF = { ...ALIGN, ...STYLE };

/**
 * Alignment and layout families (alignFamilies.ts), and Text style
 * (textStyle.ts: its letters grow 2 units a side, Italic leans): the same shape keys and
 * no NaN across the hover at 16 / 20 / 24 / 32; rest parity with Carbon at
 * every size by coverage (systems.test.tsx's sampler, which mirrors the
 * browser Parity story: Δ is the share of ink pixels whose coverage differs
 * by more than a quarter, gated at 0.5%; Carbon's matrix / rotate transforms
 * are honoured); constant weight (rigid parts move only by their allowed
 * offsets, and every part's local thickness never grows past its resting
 * weight); separate parts never touch, and the gaps each family means to
 * hold, hold; every frame stays inside the 36×36 hover box (−2 to 34); and
 * each family's distances.
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

/** An SVG transform attribute (matrix, rotate, translate) as a point map. */
function transformOf(t: string | null): (p: Pt) => Pt {
  if (!t) return (p) => p;
  const n = (s: string) =>
    s
      .trim()
      .split(/[\s,]+/)
      .map(Number);
  const m = /matrix\(([^)]*)\)/.exec(t);
  if (m) {
    const [a, b, c, d, e, g] = n(m[1]);
    return ([x, y]) => [a * x + c * y + e, b * x + d * y + g];
  }
  const r = /rotate\(([^)]*)\)/.exec(t);
  if (r) {
    const [deg, cx = 0, cy = 0] = n(r[1]);
    const [cos, sin] = [
      Math.cos((deg * Math.PI) / 180),
      Math.sin((deg * Math.PI) / 180),
    ];
    return ([x, y]) => [
      cx + (x - cx) * cos - (y - cy) * sin,
      cy + (x - cx) * sin + (y - cy) * cos,
    ];
  }
  const tr = /translate\(([^)]*)\)/.exec(t);
  if (tr) {
    const [tx, ty = 0] = n(tr[1]);
    return ([x, y]) => [x + tx, y + ty];
  }
  throw new Error(`transform: ${t}`);
}

/** A Carbon icon at a size, sampled in the 32-unit grid (paths, with their transforms). */
function coverCarbon(Icon: CarbonIcon, size: number): Uint8Array {
  const { container, unmount } = render(<Icon size={size} />);
  const svg = container.querySelector('svg')!;
  const vb = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const ink = new Uint8Array(N * N);
  svg.querySelectorAll('path, circle, rect').forEach((el) => {
    expect(el.tagName.toLowerCase(), 'Carbon draws these as paths').toBe(
      'path'
    );
    const map = transformOf(el.getAttribute('transform'));
    const polys = flatten(el.getAttribute('d')!).map(({ pts, closed }) => ({
      pts: pts.map((p) => {
        const [x, y] = map(p);
        return [(x * 32) / vb, (y * 32) / vb] as Pt;
      }),
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

// ── The icons ────────────────────────────────────────────────────────────────

type Moves = Record<string, Pt[]>;
const still: Pt = [0, 0];
interface Case {
  name: keyof typeof AF & keyof typeof CI;
  /** Per shape key, the offsets its outline points may move by at full hover (keys left out are rebuilt, and checked by thickness). */
  moves: Moves;
  /** Separate parts that must never touch: [part, part]. */
  apart: [string, string][];
  /** Of those, the pairs whose gap the motion holds (within 0.05px at every frame). */
  holds?: [string, string][];
}
const rows = (keys: string[]): [string, string][] =>
  keys.slice(1).map((k, i) => [keys[i], k]);
const LINES = ['line0', 'line1', 'line2', 'line3'];
const textCase = (name: Case['name'], rule: boolean): Case => {
  const apart: [string, string][] = [
    ...rows(LINES),
    ...(rule ? LINES.map((l) => ['rule', l] as [string, string]) : []),
  ];
  return { name, moves: rule ? { rule: [still] } : {}, apart, holds: apart };
};
const boxCase = (name: Case['name']): Case => {
  const dx = /Left$/.test(name) ? -1 : /Right$/.test(name) ? 1 : 0;
  const dy = /^AlignBoxTop/.test(name)
    ? -1
    : /^AlignBoxBottom/.test(name)
      ? 1
      : 0;
  return {
    name,
    moves: /Center$/.test(name) ? {} : { block: [[dx, dy]] },
    apart: [['frame', 'block']],
    holds: [['frame', 'block']],
  };
};
// With one solid side the text follows it out (its gap to the bar holds); Full and None hold the text.
const borderCase = (name: Case['name'], bar?: Pt): Case => ({
  name,
  moves: { text: [bar ?? still], ...(bar ? { border: [bar] } : {}) },
  apart:
    name === 'BorderNone'
      ? [['dots', 'text']]
      : name === 'BorderFull'
        ? [['border', 'text']]
        : [
            ['border', 'dots'],
            ['border', 'text'],
            ['dots', 'text'],
          ],
  holds: bar ? [['border', 'text']] : [],
});
const CASES: Case[] = [
  textCase('TextAlignLeft', true),
  textCase('TextAlignRight', true),
  textCase('TextAlignCenter', false),
  textCase('TextAlignJustify', false),
  {
    name: 'TextAlignMixed',
    moves: { ruleA: [still], ruleOne: [still] },
    apart: [
      ['a', 'one'],
      ['a', 'ruleA'],
      ['one', 'ruleOne'],
      ['a', 'ruleOne'],
      ['one', 'ruleA'],
    ],
    holds: [
      ['a', 'ruleA'],
      ['one', 'ruleOne'],
    ],
  },
  ...(
    [
      'TopLeft',
      'TopCenter',
      'TopRight',
      'MiddleLeft',
      'MiddleCenter',
      'MiddleRight',
      'BottomLeft',
      'BottomCenter',
      'BottomRight',
    ] as const
  ).map((p) => boxCase(`AlignBox${p}`)),
  borderCase('BorderTop', [0, -1]),
  borderCase('BorderBottom', [0, 1]),
  borderCase('BorderLeft', [-1, 0]),
  borderCase('BorderRight', [1, 0]),
  borderCase('BorderFull'),
  borderCase('BorderNone'),
  {
    name: 'TextIndent',
    moves: { arrow: [[2, 0]], lines: [still] },
    apart: [
      ['arrow', 'indented'],
      ['arrow', 'lines'],
      ['indented', 'lines'],
    ],
    holds: [['arrow', 'indented']],
  },
  // The arrow and bar move 2px as one into the lines, whose ends by the bar are cut back (rebuilt): gaps hold.
  {
    name: 'TextIndentMore',
    moves: { arrow: [[2, 0]], bar: [[2, 0]] },
    apart: [
      ['arrow', 'bar'],
      ['bar', 'lines'],
      ['arrow', 'lines'],
    ],
    holds: [
      ['arrow', 'bar'],
      ['bar', 'lines'],
    ],
  },
  {
    name: 'TextIndentLess',
    moves: { arrow: [[-2, 0]], bar: [[-2, 0]] },
    apart: [
      ['arrow', 'bar'],
      ['bar', 'lines'],
      ['arrow', 'lines'],
    ],
    holds: [
      ['arrow', 'bar'],
      ['bar', 'lines'],
    ],
  },
  // Text style: the letters are rebuilt at their own weight (checked by thickness); Underline's rule rides the U's bottom, its 3px gap held.
  { name: 'TextBold', moves: {}, apart: [] },
  { name: 'TextItalic', moves: {}, apart: [] },
  {
    name: 'TextUnderline',
    moves: {},
    apart: [['letter', 'rule']],
    holds: [['letter', 'rule']],
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

describe.each(CASES)('$name', ({ name, moves, apart, holds = [] }) => {
  const icon = AF[name] as FrameHoverIcon;
  const carbon = CI[name] as CarbonIcon;

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
            for (const [x, y] of pts)
              expect(
                x >= -2 && x <= 34 && y >= -2 && y <= 34,
                `${k} (${x}, ${y}) h=${h} @${size}`
              ).toBe(true);
          }
        }
      }
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
      const [max0, mid0, thin0] = [
        t0[t0.length - 1],
        quantile(t0, 0.5),
        quantile(t0, 0.1),
      ];
      let worst = 0;
      for (const h of [0.25, 0.5, 0.75, 1]) {
        const t = thickness(cover({ k: icon.geo({ h }, 32)[k] }));
        expect(t[t.length - 1], `${k} widest h=${h}`).toBeLessThan(
          Math.max(max0, 2) + 0.13
        );
        expect(
          Math.abs(quantile(t, 0.5) - mid0),
          `${k} median h=${h}`
        ).toBeLessThan(0.07);
        expect(quantile(t, 0.1), `${k} thinnest tenth h=${h}`).toBeGreaterThan(
          thin0 - 0.13
        );
        worst = Math.max(worst, Math.abs(quantile(t, 0.5) - mid0));
      }
      weights[name].push(`${k} ${mid0.toFixed(2)} (±${worst.toFixed(2)})`);
    }
  });

  it('keeps its separate parts apart through the hover (no shared ink, a clear gap), and holds the gaps it means to', () => {
    grid(32);
    gaps[name] = [];
    for (const [a, b] of apart) {
      let [least, most, rest] = [Infinity, 0, Infinity];
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
      expect(least, `${a}/${b}`).toBeGreaterThan(Math.min(1.9, rest - 0.01));
      if (holds.some(([p, q]) => p === a && q === b)) {
        expect(least, `${a}/${b} holds`).toBeGreaterThan(rest - 0.05);
        expect(most, `${a}/${b} holds`).toBeLessThan(rest + 0.05);
      }
      gaps[name].push(
        `${a}/${b} ${least.toFixed(2)}–${most.toFixed(2)} (rest ${rest.toFixed(2)})`
      );
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

// ── Each family's distances ──────────────────────────────────────────────────

/** A path's rect subpaths as [x0, y0, x1, y1] (rectPath's form), in drawing order. */
const rects = (d: string) =>
  flatten(d).map(({ pts }) => {
    const [xs, ys] = [pts.map((p) => p[0]), pts.map((p) => p[1])];
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  });
const lineSpans = (icon: FrameHoverIcon, h: number) =>
  LINES.map((k) => rects(String(icon.geo({ h })[k].d))[0]);

describe('Text align', () => {
  it('each line gains 2px away from its aligned edge (left: right end; right: left end; centre, justify: 1px each end)', () => {
    const cases: [FrameHoverIcon, number, number][] = [
      [AF.TextAlignLeft, 0, 2],
      [AF.TextAlignRight, -2, 0],
      [AF.TextAlignCenter, -1, 1],
      [AF.TextAlignJustify, -1, 1],
    ];
    for (const [icon, l, r] of cases) {
      const [a, b] = [lineSpans(icon, 0), lineSpans(icon, 1)];
      a.forEach((s, i) => {
        expect(b[i][0] - s[0], `${icon.displayName} line${i} left`).toBeCloseTo(
          l,
          6
        );
        expect(
          b[i][2] - s[2],
          `${icon.displayName} line${i} right`
        ).toBeCloseTo(r, 6);
        expect([b[i][1], b[i][3]]).toEqual([s[1], s[3]]);
      });
    }
  });
  it('moves every line together (no stagger)', () => {
    const mid = lineSpans(AF.TextAlignLeft, 0.3);
    for (let i = 1; i < 4; i++)
      expect(mid[i][2] - [26, 22, 26, 22][i], `line${i}`).toBeCloseTo(
        mid[0][2] - 26,
        6
      );
    expect(AF.TextAlignLeft.displayName).toBe('TextAlignLeft');
  });
  it('Mixed: the glyphs grow 10%, each anchored on its aligned edge (reach 0.8px and 0.6px)', () => {
    const box = (d: string) => {
      const p = flatten(d).flatMap((q) => q.pts);
      return [
        Math.min(...p.map((q) => q[0])),
        Math.min(...p.map((q) => q[1])),
        Math.max(...p.map((q) => q[0])),
        Math.max(...p.map((q) => q[1])),
      ];
    };
    const [a0, a1] = [box(AF.glyphA(1)), box(AF.glyphA(1.1))];
    expect(a1[0]).toBeCloseTo(a0[0], 6);
    expect(a1[2] - a0[2]).toBeCloseTo(0.8, 3);
    const [o0, o1] = [box(AF.glyphOne(1)), box(AF.glyphOne(1.1))];
    expect(o1[2]).toBeCloseTo(o0[2], 6);
    expect(o0[0] - o1[0]).toBeCloseTo(0.6, 3);
  });
});

describe('Border', () => {
  /** Every dot's [x0, y0] and the solid bars, at hover h. */
  const dotsAt = (icon: FrameHoverIcon, h: number) =>
    rects(String(icon.geo({ h }).dots?.d ?? ''));
  it('keeps every dotted side evenly spaced (the gap to a pushed bar included), dots 2px square', () => {
    for (const icon of [
      AF.BorderTop,
      AF.BorderBottom,
      AF.BorderLeft,
      AF.BorderRight,
      AF.BorderNone,
    ]) {
      for (const h of STEPS) {
        const s = icon.geo({ h });
        const solids = s.border ? rects(String(s.border.d)) : [];
        const dots = dotsAt(icon, h);
        dots.forEach(([x0, y0, x1, y1]) => {
          expect(x1 - x0).toBeCloseTo(2, 6);
          expect(y1 - y0).toBeCloseTo(2, 6);
        });
        // Each column (by x) and row (by y): the dots and any bar across its line, sorted along it.
        const lines = new Map<string, number[][]>();
        for (const r of dots) {
          for (const key of [`x${r[0].toFixed(3)}`, `y${r[1].toFixed(3)}`])
            lines.set(key, [...(lines.get(key) ?? []), r]);
        }
        for (const [key, rs] of lines) {
          if (rs.length < 3) continue;
          const vertical = key[0] === 'x';
          const across = solids.filter((b) =>
            vertical
              ? b[0] <= rs[0][0] && b[2] >= rs[0][2]
              : b[1] <= rs[0][1] && b[3] >= rs[0][3]
          );
          const all = [...rs, ...across].sort((p, q) =>
            vertical ? p[1] - q[1] : p[0] - q[0]
          );
          const g = all
            .slice(1)
            .map((r, i) => (vertical ? r[1] - all[i][3] : r[0] - all[i][2]));
          expect(
            Math.max(...g) - Math.min(...g),
            `${icon.displayName} ${key} h=${h}`
          ).toBeLessThan(1e-3);
          expect(
            Math.min(...g),
            `${icon.displayName} ${key} h=${h}`
          ).toBeGreaterThan(1.99);
        }
      }
    }
  });
  it('pushes the solid side out 1px, its length held (Full: the frame grows 1px a side; None: the dots, 1px a side)', () => {
    expect(rects(String(AF.BorderTop.geo({ h: 1 }).border.d))).toEqual([
      [3, 2, 29, 4],
    ]);
    expect(rects(String(AF.BorderRight.geo({ h: 1 }).border.d))).toEqual([
      [28, 3, 30, 29],
    ]);
    // The text follows a single solid side 1px; with Full and None it holds.
    expect(rects(String(AF.BorderTop.geo({ h: 1 }).text.d))[0]).toEqual([
      8, 9, 18, 11,
    ]);
    expect(rects(String(AF.BorderLeft.geo({ h: 1 }).text.d))[0]).toEqual([
      7, 10, 17, 12,
    ]);
    expect(rects(String(AF.BorderFull.geo({ h: 1 }).text.d))[0]).toEqual([
      8, 10, 18, 12,
    ]);
    expect(rects(String(AF.BorderFull.geo({ h: 1 }).border.d))).toEqual([
      [2, 2, 30, 30],
      [4, 4, 28, 28],
    ]);
    const none = dotsAt(AF.BorderNone, 1);
    expect(Math.min(...none.map((r) => r[0]))).toBeCloseTo(2, 6);
    expect(Math.max(...none.map((r) => r[3]))).toBeCloseTo(30, 6);
    expect(none.length).toBe(24);
  });
});

describe('Indent', () => {
  it('more / less: the lines hold, only their ends by the bar cut back 2px', () => {
    for (const [icon, cut] of [
      [AF.TextIndentMore, [2, 0]],
      [AF.TextIndentLess, [0, -2]],
    ] as const) {
      const [a, b] = [
        rects(String(icon.geo({ h: 0 }).lines.d)),
        rects(String(icon.geo({ h: 1 }).lines.d)),
      ];
      a.forEach((r, i) =>
        expect(b[i]).toEqual([r[0] + cut[0], r[1], r[2] + cut[1], r[3]])
      );
    }
  });
});

describe('Align box', () => {
  it('grows the frame 1px a side; the block rides 1px with the walls it is aligned to (centred: grows 1px at each end)', () => {
    const block = (icon: FrameHoverIcon, h: number) =>
      rects(String(icon.geo({ h }).block.d));
    for (const [icon, dx, dy, grow] of [
      [AF.AlignBoxTopLeft, -1, -1, 0],
      [AF.AlignBoxMiddleCenter, 0, 0, 1],
      [AF.AlignBoxBottomRight, 1, 1, 0],
      [AF.AlignBoxTopCenter, 0, -1, 1],
    ] as const) {
      const [a, b] = [block(icon, 0), block(icon, 1)];
      a.forEach((r, i) => {
        expect(b[i][0] - r[0]).toBeCloseTo(dx - grow, 6);
        expect(b[i][2] - r[2]).toBeCloseTo(dx + grow, 6);
        expect(b[i][1] - r[1]).toBeCloseTo(dy, 6);
      });
    }
  });
});

describe('Text style', () => {
  const box = (d: string) => {
    const p = flatten(d).flatMap((q) => q.pts);
    return [
      Math.min(...p.map((q) => q[0])),
      Math.min(...p.map((q) => q[1])),
      Math.max(...p.map((q) => q[0])),
      Math.max(...p.map((q) => q[1])),
    ];
  };
  const d = (icon: FrameHoverIcon, h: number, k = 'letter') =>
    String(icon.geo({ h })[k].d);
  const carbonD = (art: IconDescriptor, i = 0) =>
    String(art.content?.[i]?.attrs.d);

  it("rests on Carbon's path data exactly, and the hover starts from it with no jump", () => {
    expect(d(AF.TextBold, 0)).toBe(carbonD(TextBold32));
    expect(d(AF.TextItalic, 0)).toBe(carbonD(TextItalic32));
    expect(d(AF.TextUnderline, 0, 'rule')).toBe(carbonD(TextUnderline32, 0));
    expect(d(AF.TextUnderline, 0)).toBe(carbonD(TextUnderline32, 1));
    const rest: [string, IconDescriptor, number][] = [
      [AF.boldD(1 + 1e-9), TextBold32, 0],
      [AF.italicD(1 + 1e-9), TextItalic32, 0],
      [AF.italicD(1, 1e-9), TextItalic32, 0],
      [AF.underlineRule(1 + 1e-9), TextUnderline32, 0],
      [AF.underlineU(1 + 1e-9), TextUnderline32, 1],
    ];
    for (const [rebuilt, carbon, i] of rest) {
      const [a, b] = [
        flatten(rebuilt).flatMap((p) => p.pts),
        flatten(carbonD(carbon, i)).flatMap((p) => p.pts),
      ];
      expect(a.length).toBe(b.length);
      a.forEach(([x, y], j) => {
        expect(x).toBeCloseTo(b[j][0], 3);
        expect(y).toBeCloseTo(b[j][1], 3);
      });
    }
  });
  it('grows 15% by its own constant (STYLE_GROW); the text family keeps GLYPH_GROW (10%)', () => {
    expect(AF.STYLE_GROW).toBe(0.15);
    expect(AF.ITALIC_LEAN).toBe(6);
    expect(AF.GLYPH_GROW).toBe(0.1);
  });
  it('stays inside the 32×32 frame at every frame', () => {
    for (const icon of [AF.TextBold, AF.TextItalic, AF.TextUnderline]) {
      for (const h of STEPS) {
        for (const attrs of Object.values(icon.geo({ h }))) {
          const [x0, y0, x1, y1] = box(String(attrs.d));
          expect(Math.min(x0, y0), `h=${h}`).toBeGreaterThanOrEqual(0);
          expect(Math.max(x1, y1), `h=${h}`).toBeLessThanOrEqual(32);
        }
      }
    }
  });
  it('Bold: the B grows 15% about its centre (16.25, 16): 9–23.5 × 7–25 to 7.91–24.59 × 5.65–26.35, its 3px weight held', () => {
    const [a, b] = [box(d(AF.TextBold, 0)), box(d(AF.TextBold, 1))];
    [9, 7, 23.5, 25].forEach((v, i) => expect(a[i]).toBeCloseTo(v, 1)); // Carbon rounds the bowls' meeting point, so its right edge is 23.47
    // 15% of the box (14.5 × 18) about its centre: 1.0875 a side across, 1.35 up and down.
    const [gx, gy] = [7.25 * AF.STYLE_GROW, 9 * AF.STYLE_GROW];
    [a[0] - b[0], b[2] - a[2]].forEach((g) => expect(g).toBeCloseTo(gx, 2));
    [a[1] - b[1], b[3] - a[3]].forEach((g) => expect(g).toBeCloseTo(gy, 2));
    expect((b[0] + 23.5 + gx) / 2).toBeCloseTo(16.25, 2);
    const mid = box(d(AF.TextBold, 0.5));
    [a[0] - mid[0], mid[2] - a[2]].forEach((g) =>
      expect(g).toBeCloseTo(gx / 2, 2)
    );
    [a[1] - mid[1], mid[3] - a[3]].forEach((g) =>
      expect(g).toBeCloseTo(gy / 2, 2)
    );
    // The weight: the stem and the bars stay 3px (the holes' left edge is the stem's inside; the top and bottom bars 3 deep).
    const holes = flatten(d(AF.TextBold, 1))
      .slice(1)
      .map((q) => q.pts);
    const [low, up] = holes.map((pts) => [
      Math.min(...pts.map((q) => q[0])),
      Math.min(...pts.map((q) => q[1])),
      Math.max(...pts.map((q) => q[1])),
    ]);
    expect(low[0] - b[0]).toBeCloseTo(3, 6);
    expect(up[0] - b[0]).toBeCloseTo(3, 6);
    expect(up[1] - b[1]).toBeCloseTo(3, 6);
    expect(b[3] - low[2]).toBeCloseTo(3, 6);
    // The middle bar holds (14.5–17.5).
    expect(up[2]).toBeCloseTo(14.5, 6);
    expect(low[1]).toBeCloseTo(17.5, 6);
  });
  it('Italic: the I grows 15% in its slanted frame and leans 6° more (17.3° to 23.3°) at its 2px weight, serifs horizontal', () => {
    const slope = ([x0, y0]: Pt, [x1, y1]: Pt) => (x0 - x1) / (y1 - y0);
    const deg = (k: number) => (Math.atan(k) * 180) / Math.PI;
    const k0 = (17.14 - 12.77) / 14;
    const width = (p: Pt[], k: number) =>
      (p[11][0] - p[4][0]) / Math.hypot(1, k); // across the stem
    const [p0, p1] = [
      flatten(d(AF.TextItalic, 0))[0].pts,
      flatten(d(AF.TextItalic, 1))[0].pts,
    ];
    const k1 = slope(p1[4], p1[5]);
    expect(deg(k0)).toBeCloseTo(17.34, 2);
    expect(deg(k1) - deg(k0)).toBeCloseTo(AF.ITALIC_LEAN, 2);
    expect(slope(p1[11], p1[10])).toBeCloseTo(k1, 3);
    expect(width(p1, k1)).toBeCloseTo(width(p0, k0), 2);
    expect(width(p0, k0)).toBeCloseTo(2, 2);
    // Halfway, it leans halfway.
    const ph = flatten(d(AF.TextItalic, 0.5))[0].pts;
    expect(deg(slope(ph[4], ph[5])) - deg(k0)).toBeCloseTo(
      AF.ITALIC_LEAN / 2,
      2
    );
    // Serifs: horizontal and 2px thick, 1.35 out at the top and bottom (15% of 18), 15% longer (13 → 14.95), each keeping its place on the stem's line.
    const [a, b] = [box(d(AF.TextItalic, 0)), box(d(AF.TextItalic, 1))];
    const [gx, gy] = [6.5 * AF.STYLE_GROW, 9 * AF.STYLE_GROW];
    expect(a[1] - b[1]).toBeCloseTo(gy, 6);
    expect(b[3] - a[3]).toBeCloseTo(gy, 6);
    for (const [i, j] of [
      [0, 3],
      [1, 2],
      [6, 9],
      [7, 8],
    ])
      expect(p1[i][1]).toBeCloseTo(p1[j][1], 9);
    expect(p1[0][1] - p1[1][1]).toBeCloseTo(2, 6);
    expect(p1[7][1] - p1[6][1]).toBeCloseTo(2, 6);
    expect(p1[1][0] - p1[2][0]).toBeCloseTo(13 * (1 + AF.STYLE_GROW), 6);
    expect(p1[8][0] - p1[7][0]).toBeCloseTo(13 * (1 + AF.STYLE_GROW), 6);
    const line = (y: number) => 16 + (16 - y) * k1;
    expect((p1[1][0] + p1[2][0]) / 2 - line(p1[1][1] + 1)).toBeCloseTo(
      (p0[1][0] + p0[2][0]) / 2 - (16 + 8 * k0),
      2
    );
    // The lean carries the serifs along it: the top's right end and the bottom's left end go out 2.51, the others 0.56 in.
    const shift =
      (8 + gy) * Math.tan(Math.atan(k0) + (AF.ITALIC_LEAN * Math.PI) / 180) -
      8 * k0; // the design slant (k1 is measured off rounded points)
    expect(shift).toBeCloseTo(1.536, 3);
    expect(b[2] - a[2]).toBeCloseTo(gx + shift, 3);
    expect(a[0] - b[0]).toBeCloseTo(gx + shift, 3);
    expect(p1[2][0] - 12).toBeCloseTo(shift - gx, 3);
    expect(20 - p1[8][0]).toBeCloseTo(shift - gx, 3);
  });
  it('Underline: the U grows 15% about its box centre (16, 14), the rule rides its bottom and extends as it widens; the 3px gap and the group centre (16, 16.5) hold', () => {
    const [a, b] = [box(d(AF.TextUnderline, 0)), box(d(AF.TextUnderline, 1))];
    expect(a).toEqual([9, 5, 23, 23]);
    const [gx, gy] = [7 * AF.STYLE_GROW, 9 * AF.STYLE_GROW];
    [a[0] - b[0], b[2] - a[2]].forEach((g) => expect(g).toBeCloseTo(gx, 6));
    [a[1] - b[1], b[3] - a[3]].forEach((g) => expect(g).toBeCloseTo(gy, 6));
    const [r0, r1] = [
      box(d(AF.TextUnderline, 0, 'rule')),
      box(d(AF.TextUnderline, 1, 'rule')),
    ];
    [r0[0] - r1[0], r1[2] - r0[2]].forEach((g) => expect(g).toBeCloseTo(gx, 6));
    [r1[1] - r0[1], r1[3] - r0[3]].forEach((g) => expect(g).toBeCloseTo(gy, 6));
    for (const h of STEPS) {
      const [u, r] = [
        box(d(AF.TextUnderline, h)),
        box(d(AF.TextUnderline, h, 'rule')),
      ];
      expect(r[1] - u[3], `gap h=${h}`).toBeCloseTo(3, 2); // paths are written to 3 decimals
      expect(r[3] - r[1], `rule h=${h}`).toBeCloseTo(2, 2);
      expect((u[1] + r[3]) / 2, `group centre h=${h}`).toBeCloseTo(16.5, 2);
      expect(u[0] - r[0], `rule overhang h=${h}`).toBeCloseTo(5, 2);
    }
  });
});

describe('the parity measure', () => {
  it('sees ink, honours Carbon transforms, and tells different icons apart', () => {
    grid(32);
    expect(
      coverCarbon(CI.BorderLeft as CarbonIcon, 32).reduce((a, v) => a + v, 0)
    ).toBeGreaterThan(5000);
    expect(
      delta(
        cover(AF.AlignBoxTopLeft.geo({ h: 0 }, 32)),
        coverCarbon(CI.AlignBoxTopRight as CarbonIcon, 32)
      )
    ).toBeGreaterThan(0.05);
    expect(
      delta(
        cover(AF.BorderLeft.geo({ h: 0 }, 32)),
        coverCarbon(CI.BorderRight as CarbonIcon, 32)
      )
    ).toBeGreaterThan(0.05);
    expect(
      delta(
        cover(AF.TextIndent.geo({ h: 0.5 }, 32)),
        coverCarbon(CI.TextIndent as CarbonIcon, 32)
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
