/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  ChevronSortDown as CChevronSortDown,
  CircleFilled as CCircleFilled,
  CircleOutline as CCircleOutline,
  Contrast as CContrast,
  DirectionLoopRight as CDirectionLoopRight,
  DirectionLoopRightFilled as CDirectionLoopRightFilled,
  DirectionStraightRight as CDirectionStraightRight,
  DirectionStraightRightFilled as CDirectionStraightRightFilled,
  Erase as CErase,
  Event as CEvent,
  EventSchedule as CEventSchedule,
  Moon as CMoon,
  NextFilled as CNextFilled,
  NextOutline as CNextOutline,
  NotAvailable as CNotAvailable,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type {
  CarbonIcon,
  FrameHoverIcon,
  FrameToggleIcon,
  Shapes,
} from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import {
  CLOCK_C,
  ChevronSortDown,
  CircleFilled,
  CircleOutline,
  CircleToggle,
  Contrast,
  DirectionLoopRight,
  DirectionLoopRightFilled,
  DirectionLoopRightToggle,
  DirectionStraightRight,
  DirectionStraightRightFilled,
  DirectionStraightRightToggle,
  EVENT_STAR_C,
  EVENT_STAR_GROW,
  ERASE_SLIDE,
  ERASER_RIGHT,
  Erase,
  eraserBottomLeft,
  eraserMove,
  Event,
  EventSchedule,
  Moon,
  NextFilled,
  NextOutline,
  NextToggle,
  NotAvailable,
  eventDrawBack,
  loopGlyph,
  scheduleDrawBack,
} from '../../icons/assorted/statesTime';

/**
 * States, controls and time (statesTime.ts): keys and NaNs across the hover
 * (and the toggles' h / p / e) at every size; rest parity with Carbon at
 * 16 / 20 / 24 / 32 by coverage (the sampler of objectsB.test.tsx, which
 * mirrors the browser Parity story: Δ is the share of ink pixels whose
 * coverage differs by more than a quarter, gated at 0.5%); the hover at
 * constant weight (every outline point moves by one of the icon's allowed
 * offsets, or walls keep their width); separate parts never touch; and each
 * toggle's ends are its hover icons.
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
    // The filled icons carry their knockout again as an unpainted "inner-path".
    if (el.getAttribute('fill') === 'none') return;
    let d = el.getAttribute('d');
    if (el.tagName.toLowerCase() === 'circle') {
      const [cx, cy, r] = ['cx', 'cy', 'r'].map((a) =>
        Number(el.getAttribute(a))
      );
      d = `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
    }
    // Some Carbon paths carry a translate (a zero one here).
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
 * (a rigid part, a held part, a wall's end). Keys left out are rebuilt
 * walls (rings, discs, the clock's hands), checked below.
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
  /** A stroked centreline (Moon): parity is measured in Chrome. */
  stroked?: boolean;
}
const [EV_DR, EV_DB] = eventDrawBack(1);
const [ES_DR, ES_DB] = scheduleDrawBack(1);
const CASES: Case[] = [
  {
    name: 'CircleOutline',
    icon: CircleOutline,
    carbon: CCircleOutline,
    moves: {},
  },
  {
    name: 'CircleFilled',
    icon: CircleFilled,
    carbon: CCircleFilled,
    moves: {},
    apart: [['ring', 'dot']],
  },
  {
    name: 'NextOutline',
    icon: NextOutline,
    carbon: CNextOutline,
    moves: { glyph: [still, [2, 0]] },
    apart: [['ring', 'glyph']],
  },
  { name: 'NextFilled', icon: NextFilled, carbon: CNextFilled, moves: {} },
  { name: 'Moon', icon: Moon, carbon: CMoon, moves: {} },
  {
    name: 'Event',
    icon: Event,
    carbon: CEvent,
    moves: { page: [still, [0, -EV_DR], [-EV_DB, 0]] },
    apart: [['page', 'star']],
  },
  {
    name: 'EventSchedule',
    icon: EventSchedule,
    carbon: CEventSchedule,
    moves: { page: [still, [0, -ES_DR], [-ES_DB, 0]] },
    apart: [
      ['page', 'ring'],
      ['page', 'hands'],
      ['ring', 'hands'],
    ],
  },
  {
    name: 'Erase',
    icon: Erase,
    carbon: CErase,
    moves: {},
    apart: [['eraser', 'line']],
  },
  { name: 'Contrast', icon: Contrast, carbon: CContrast, moves: {} },
  {
    name: 'ChevronSortDown',
    icon: ChevronSortDown,
    carbon: CChevronSortDown,
    moves: { down: [[0, 2]] },
  },
  {
    name: 'NotAvailable',
    icon: NotAvailable,
    carbon: CNotAvailable,
    moves: { left: [still, [-2, 0]], right: [still, [2, 0]] },
    apart: [['left', 'right']],
  },
  {
    name: 'DirectionStraightRight',
    icon: DirectionStraightRight,
    carbon: CDirectionStraightRight,
    moves: { arrow: [still, [4, 0]] },
  },
  {
    name: 'DirectionStraightRightFilled',
    icon: DirectionStraightRightFilled,
    carbon: CDirectionStraightRightFilled,
    moves: { arrow: [still, [2, 0], ...corners(1, 1)] },
  },
  {
    name: 'DirectionLoopRight',
    icon: DirectionLoopRight,
    carbon: CDirectionLoopRight,
    moves: {},
  },
  {
    name: 'DirectionLoopRightFilled',
    icon: DirectionLoopRightFilled,
    carbon: CDirectionLoopRightFilled,
    moves: {},
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
/** No NaN or Infinity anywhere, and every point inside the 36×36 box (−2…34). */
const noBad = (shapes: Shapes, at: string) => {
  for (const [k, attrs] of Object.entries(shapes)) {
    for (const [a, v] of Object.entries(attrs))
      expect(/NaN|Infinity|undefined/.test(String(v)), `${k}.${a} ${at}`).toBe(
        false
      );
    for (const { pts } of flatten(String(attrs.d ?? ''))) {
      for (const [x, y] of pts)
        expect(
          x >= -2 - 5e-3 && x <= 34 + 5e-3 && y >= -2 - 5e-3 && y <= 34 + 5e-3,
          `${k} (${x}, ${y}) ${at}`
        ).toBe(true);
    }
  }
};

describe.each(CASES)(
  '$name',
  ({ name, icon, carbon, moves, apart = [], stroked }) => {
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

    it('keeps the same shape keys at every hover frame and size, never paints NaN or Infinity, and stays inside 36×36', () => {
      for (const size of SIZES) {
        const rest = Object.keys(icon.geo({ h: 0 }, size));
        for (const h of STEPS) {
          const shapes = icon.geo({ h }, size);
          expect(Object.keys(shapes), `h=${h} @${size}`).toEqual(rest);
          noBad(shapes, `h=${h} @${size}`);
        }
      }
    });

    it.runIf(!stroked)(
      "rests on Carbon's icon at 16, 20, 24 and 32 (within 0.5%, as the parity story measures)",
      () => {
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
      }
    );

    it('hovers by moving geometry: no transforms, each point by an allowed offset', () => {
      for (const size of SIZES) {
        const [rest, full] = [
          icon.geo({ h: 0 }, size),
          icon.geo({ h: 1 }, size),
        ];
        expect(JSON.stringify(full)).not.toBe(JSON.stringify(rest));
        for (const [k, attrs] of Object.entries(full)) {
          expect(attrs.transform, k).toBeUndefined();
          if (stroked) {
            if (attrs.stroke)
              expect(attrs.strokeWidth, k).toBe(rest[k].strokeWidth);
          } else {
            expect(attrs.strokeWidth, k).toBeUndefined();
            expect(attrs.fill, k).toBeUndefined();
          }
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
  }
);

// ── Walls rebuilt at constant weight ─────────────────────────────────────────

/** Every point's distance from c. */
const radii = (d: string, c: Pt) =>
  flatten(d)
    .flatMap((p) => p.pts)
    .map(([x, y]) => Math.hypot(x - c[0], y - c[1]));
const C: Pt = [16, 16];
const near = (v: number, targets: number[], tol = 5e-3) =>
  targets.some((t) => Math.abs(v - t) < tol);

/** Is p inked by the polygons (even-odd)? */
const inked = (polys: Poly[], [x, y]: Pt) => {
  let odd = false;
  for (const { pts } of polys) {
    pts.forEach((a, k) => {
      const b = pts[(k + 1) % pts.length];
      if (
        a[1] <= y !== b[1] <= y &&
        x < a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1])
      )
        odd = !odd;
    });
  }
  return odd;
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
      inked(polys, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    )
      run++;
    else if (run) {
      out.push((run * len) / n);
      run = 0;
    }
  }
  return out;
};

describe('Circle outline / filled', () => {
  it('grows the ring and the disc 1px in radius, the ring a 2px wall, the gap between them 2px', () => {
    for (const h of STEPS) {
      for (const r of radii(String(CircleOutline.geo({ h }).ring.d), C))
        expect(near(r, [12 + h, 14 + h]), `ring ${r} h=${h}`).toBe(true);
      const filled = CircleFilled.geo({ h });
      for (const r of radii(String(filled.dot.d), C))
        expect(r, `dot h=${h}`).toBeCloseTo(10 + h, 3);
    }
  });
});

describe('Next outline / filled', () => {
  it('grows the ring (or disc) 1px in radius and reaches the arrow 2px, its tail holding', () => {
    for (const h of STEPS) {
      for (const r of radii(String(NextOutline.geo({ h }).ring.d), C))
        expect(near(r, [12 + h, 14 + h]), `ring h=${h}`).toBe(true);
      const [disc, arrow] = flatten(String(NextFilled.geo({ h }).glyph.d));
      for (const [x, y] of disc.pts)
        expect(Math.hypot(x - 16, y - 16), `disc h=${h}`).toBeCloseTo(
          13 + h,
          3
        );
      const [rest] = flatten(String(NextOutline.geo({ h: 0 }).glyph.d));
      arrow.pts.forEach(([x, y], i) => {
        const [x0, y0] = rest.pts[i];
        expect(y).toBeCloseTo(y0, 6);
        expect(x - x0, `point ${i} h=${h}`).toBeCloseTo(
          x0 === 8 ? 0 : 2 * h,
          6
        );
      });
    }
  });
});

describe('Moon', () => {
  const pivot: Pt = [17, 16];
  const ray = (polys: Poly[], deg: number) => {
    const t = (deg * Math.PI) / 180;
    return runs(
      polys,
      [17 + 9 * Math.cos(t), 16 + 9 * Math.sin(t)],
      [17 + 15 * Math.cos(t), 16 + 15 * Math.sin(t)]
    );
  };
  it("is Asleep's hover: turned 10° and grown 8.3% about (17, 16), its walls keeping their width", () => {
    /** The path's segment ends (its corners), in order. */
    const ends = (d: string): Pt[] =>
      [...d.matchAll(/([MLA])([^MLAZ]*)/g)].map(([, , args]) => {
        const n = args
          .trim()
          .split(/[\s,]+/)
          .map(Number);
        return [n[n.length - 2], n[n.length - 1]] as Pt;
      });
    const rest = flatten(String(Moon.geo({ h: 0 }).moon.d));
    const restEnds = ends(String(Moon.geo({ h: 0 }).moon.d));
    for (const h of STEPS) {
      const d = String(Moon.geo({ h }).moon.d);
      const polys = flatten(d);
      // Every corner is the rest corner moved by the similarity, give or take the growth it gives back to keep
      // the wall (0.083px along an edge's normal; more at the crescent's sharp inner tips, along their bisectors).
      const [a, s] = [(10 * h * Math.PI) / 180, 1 + 0.08333 * h];
      const moved = ends(d);
      expect(moved.length).toBe(restEnds.length);
      moved.forEach(([x, y], i) => {
        const [x0, y0] = restEnds[i];
        const [dx, dy] = [(x0 - pivot[0]) * s, (y0 - pivot[1]) * s];
        const [X, Y] = [
          pivot[0] + dx * Math.cos(a) - dy * Math.sin(a),
          pivot[1] + dx * Math.sin(a) + dy * Math.cos(a),
        ];
        expect(Math.hypot(x - X, y - Y), `corner ${i} h=${h}`).toBeLessThan(
          0.0834 * h * 6 + 1e-3
        );
      });
      // Across the wall on the left and at the bottom (rays from the pivot), turned with the moon.
      for (const deg of [180, 135, 100]) {
        const [r0, r1] = [ray(rest, deg), ray(polys, deg + 10 * h)];
        expect(r1.length, `${deg}° h=${h}`).toBe(1);
        expect(r1[0], `${deg}° h=${h}`).toBeCloseTo(r0[0], 1);
      }
    }
  });
});

describe('Event, Event schedule', () => {
  it('grows the star 24% about its centroid, its tips reaching 2px', () => {
    const [s0, s1] = [
      flatten(String(Event.geo({ h: 0 }).star.d))[0].pts,
      flatten(String(Event.geo({ h: 1 }).star.d))[0].pts,
    ];
    s0.forEach(([x, y], i) => {
      expect(s1[i][0]).toBeCloseTo(
        EVENT_STAR_C[0] + (x - EVENT_STAR_C[0]) * (1 + EVENT_STAR_GROW),
        2
      );
      expect(s1[i][1]).toBeCloseTo(
        EVENT_STAR_C[1] + (y - EVENT_STAR_C[1]) * (1 + EVENT_STAR_GROW),
        2
      );
    });
    const reach = s0.map((p, i) =>
      Math.hypot(s1[i][0] - p[0], s1[i][1] - p[1])
    );
    expect(Math.max(...reach)).toBeGreaterThan(1.95);
    expect(Math.max(...reach)).toBeLessThan(2.05);
  });
  it.each([
    ['Event', Event, 'star'],
    ['EventSchedule', EventSchedule, 'ring'],
  ] as const)(
    '%s: the open corner draws back so the space to the mark holds',
    (_, icon, mark) => {
      // The page's outline along each open end's stub: the right wall's (x ≥ 26) and the bottom wall's (y ≥ 26, x ≥ 6).
      const stubs = [
        ([x, y]: Pt) => x >= 26 - 1e-6 && y >= 6,
        ([x, y]: Pt) => y >= 26 - 1e-6 && x >= 6 + 1e-6,
      ];
      const at = (h: number) => {
        const s = icon.geo({ h });
        const [page, m] = [
          outline(String(s.page.d)),
          outline(String(s[mark].d)),
        ];
        return stubs.map((on) => {
          let least = Infinity;
          for (const [x, y] of page.filter(on))
            for (const [u, v] of m)
              least = Math.min(least, Math.hypot(x - u, y - v));
          return least;
        });
      };
      const rest = at(0);
      for (const h of STEPS)
        at(h).forEach((g, i) =>
          expect(g, `stub ${i} h=${h}`).toBeCloseTo(rest[i], 1)
        );
    }
  );
  it("turns the clock's hands as Time's (minute 90°, hour 7.5°) at a 2px weight, its ring a 2px wall growing 1px", () => {
    for (const h of STEPS) {
      const s = EventSchedule.geo({ h });
      for (const r of radii(String(s.ring.d), CLOCK_C))
        expect(near(r, [6 + h, 8 + h]), `ring h=${h}`).toBe(true);
      const hands = flatten(String(s.hands.d));
      for (const [deg, len] of [
        [90 * h, 4],
        [135 + 7.5 * h, 3.245],
      ] as const) {
        const a = (deg * Math.PI) / 180;
        const u: Pt = [Math.sin(a), -Math.cos(a)];
        const m: Pt = [
          CLOCK_C[0] + u[0] * len * 0.7,
          CLOCK_C[1] + u[1] * len * 0.7,
        ];
        const w = runs(
          hands,
          [m[0] - u[1] * 1.3, m[1] + u[0] * 1.3],
          [m[0] + u[1] * 1.3, m[1] - u[0] * 1.3]
        );
        expect(w.length, `${deg}° h=${h}`).toBe(1);
        expect(w[0], `${deg}° h=${h}`).toBeCloseTo(2, 1);
      }
    }
  });
});

describe('Erase', () => {
  it('pushes the eraser 1px left and 2px down into a fixed crop line as it slides 6px right, its walls 2px, the line erased under it 3px below', () => {
    const rest = flatten(String(Erase.geo({ h: 0 }).eraser.d));
    for (const h of STEPS) {
      const s = Erase.geo({ h });
      const polys = flatten(String(s.eraser.d));
      expect(polys.map((p) => p.pts.length)).toEqual(
        rest.map((p) => p.pts.length)
      );
      // Every point moved by ((slide − 1)h, 2h), or lying on a crop line (y 24 outside, y 22 for the lower hole).
      polys.forEach((p, i) =>
        p.pts.forEach(([x, y], j) => {
          const [x0, y0] = rest[i].pts[j];
          const moved =
            Math.abs(x - x0 - (ERASE_SLIDE - 1) * h) < 2e-3 &&
            Math.abs(y - y0 - 2 * h) < 2e-3;
          const cropped =
            Math.abs(y - (i === 1 ? 22 : 24)) < 2e-3 && Math.abs(y0 - y) < 2e-3;
          expect(
            moved || cropped,
            `point ${i}/${j} (${x0}, ${y0}) → (${x}, ${y}) h=${h}`
          ).toBe(true);
        })
      );
      // The eraser's bottom stays at y 24: 3px above the line; the wall above the crop and the side walls stay 2px.
      const ys = polys.flatMap((p) => p.pts.map(([, y]) => y));
      expect(Math.max(...ys), `h=${h}`).toBeCloseTo(24, 3);
      expect(runs(polys, [12, 19], [12, 26]), `crop wall h=${h}`).toEqual([
        expect.closeTo(2, 1),
      ]);
      const u = Math.SQRT1_2;
      for (const [cx, cy] of [
        [5 + (ERASE_SLIDE - 1) * h, 17 + 2 * h],
        [24 + (ERASE_SLIDE - 1) * h, 15 + 2 * h],
      ] as const) {
        const w = runs(
          polys,
          [cx - 2 * u, cy - 2 * u],
          [cx + 2 * u, cy + 2 * u]
        );
        expect(w, `side wall at (${cx}, ${cy}) h=${h}`).toEqual([
          expect.closeTo(2, 1),
        ]);
      }
      // The line's left end rides with the bottom-left point (0.13 left of it, as at rest).
      const [line] = flatten(String(s.line.d));
      expect(Math.min(...line.pts.map(([x]) => x))).toBeCloseTo(
        eraserBottomLeft(eraserMove(h)) - 0.13,
        3
      );
      expect(Math.max(...line.pts.map(([x]) => x))).toBe(30);
    }
    expect(
      eraserBottomLeft(eraserMove(1)) - eraserBottomLeft(eraserMove(0))
    ).toBeCloseTo(ERASE_SLIDE - 1 - (2 * 4.51) / 4.58, 3);
    // The 6px slide (5px net) takes the eraser's rightmost ink from x 27.97 to 32.97.
    expect(ERASE_SLIDE).toBe(6);
    const right = (h: number) =>
      Math.max(
        ...flatten(String(Erase.geo({ h }).eraser.d)).flatMap((p) =>
          p.pts.map(([x]) => x)
        )
      );
    expect(right(0)).toBeCloseTo(ERASER_RIGHT, 2);
    expect(right(1)).toBeCloseTo(ERASER_RIGHT + 5, 2);
    expect(ERASER_RIGHT + 5).toBeCloseTo(32.967, 3);
  });
});

describe('Contrast', () => {
  it('grows the disc 1px with a constant 2px rim, the split turning 45° about the centre', () => {
    for (const h of STEPS) {
      const [disc, half] = flatten(String(Contrast.geo({ h }).disc.d));
      for (const [x, y] of disc.pts)
        expect(Math.hypot(x - 16, y - 16)).toBeCloseTo(14 + h, 3);
      const a = (45 * h * Math.PI) / 180;
      for (const [x, y] of half.pts) {
        const onArc = Math.abs(Math.hypot(x - 16, y - 16) - (12 + h)) < 5e-3;
        const onSplit =
          Math.abs((x - 16) * Math.cos(a) + (y - 16) * Math.sin(a)) < 5e-3;
        expect(onArc || onSplit, `(${x}, ${y}) h=${h}`).toBe(true);
      }
    }
  });
});

describe('Direction loop right', () => {
  it('keeps the loop a 2px wall and the shaft 2px as the glyph settles and the loop tightens, the road 2px clear of the shaft', () => {
    for (const k of STEPS) {
      for (const h of STEPS) {
        const { loop, road } = loopGlyph(h, k);
        const polys = flatten(loop);
        const rc = (6 - 2 * k) * (1 - h / 6);
        const [cx, cy] = [15 - rc, 17 - 2 * k - rc];
        // Across the loop's left wall and its top wall, through its centre; along the shaft.
        expect(
          runs(polys, [cx - rc - 3, cy], [cx, cy]),
          `left wall k=${k} h=${h}`
        ).toEqual([expect.closeTo(2, 1)]);
        expect(
          runs(polys, [cx, cy - rc - 3], [cx, cy]),
          `top wall k=${k} h=${h}`
        ).toEqual([expect.closeTo(2, 1)]);
        expect(
          runs(polys, [17.5, 9], [17.5, 21]),
          `shaft k=${k} h=${h}`
        ).toEqual([expect.closeTo(2, 1)]);
        expect(gap(loop, road), `road k=${k} h=${h}`).toBeCloseTo(2, 1);
        // The loop's left edge and top draw in by twice the radius it loses; the right side holds at x 16.
        const xs = polys.flatMap((p) => p.pts.map(([x]) => x));
        const ys = polys.flatMap((p) => p.pts.map(([, y]) => y));
        expect(Math.min(...xs), `left k=${k} h=${h}`).toBeCloseTo(
          14 - 2 * rc,
          2
        );
        expect(Math.min(...ys), `top k=${k} h=${h}`).toBeCloseTo(
          17 - 2 * k - 2 * rc - 1,
          2
        );
      }
    }
  });
  it('reaches the head 4px (outline) and 1px (filled), the road holding', () => {
    const tip = (h: number, k: number) =>
      Math.max(
        ...flatten(loopGlyph(h, k).loop).flatMap((p) => p.pts.map(([x]) => x))
      );
    expect(tip(1, 0) - tip(0, 0)).toBeCloseTo(4, 3);
    expect(tip(1, 1) - tip(0, 1)).toBeCloseTo(1, 3);
    expect(loopGlyph(1, 0).road).toBe(loopGlyph(0, 0).road);
  });
});

// ── Toggles ──────────────────────────────────────────────────────────────────

const TOGGLES: {
  name: string;
  toggle: FrameToggleIcon<'outline' | 'filled'>;
  ends: [FrameHoverIcon, FrameHoverIcon];
  statics: [CarbonIcon, CarbonIcon];
}[] = [
  {
    name: 'CircleToggle',
    toggle: CircleToggle,
    ends: [CircleOutline, CircleFilled],
    statics: [CCircleOutline, CCircleFilled],
  },
  {
    name: 'NextToggle',
    toggle: NextToggle,
    ends: [NextOutline, NextFilled],
    statics: [CNextOutline, CNextFilled],
  },
  {
    name: 'DirectionStraightRightToggle',
    toggle: DirectionStraightRightToggle,
    ends: [DirectionStraightRight, DirectionStraightRightFilled],
    statics: [CDirectionStraightRight, CDirectionStraightRightFilled],
  },
  {
    name: 'DirectionLoopRightToggle',
    toggle: DirectionLoopRightToggle,
    ends: [DirectionLoopRight, DirectionLoopRightFilled],
    statics: [CDirectionLoopRight, CDirectionLoopRightFilled],
  },
];

describe.each(TOGGLES)('$name', ({ toggle, ends, statics }) => {
  it('keeps the same shape keys across h, p and e at every size, never paints NaN or Infinity, and stays inside 36×36', () => {
    for (const size of SIZES) {
      const rest = Object.keys(toggle.geo({ h: 0, p: 0, e: 0 }, size));
      for (const h of [0, 0.5, 1]) {
        for (const p of STEPS) {
          for (const e of STEPS) {
            const shapes = toggle.geo({ h, p, e }, size);
            expect(
              Object.keys(shapes),
              `h=${h} p=${p} e=${e} @${size}`
            ).toEqual(rest);
            noBad(shapes, `h=${h} p=${p} e=${e} @${size}`);
          }
        }
      }
    }
  });

  it('equals its hover icons at both ends, at every h and size', () => {
    for (const size of SIZES) {
      for (const h of STEPS) {
        expect(
          toggle.geo({ h, p: 0, e: 0 }, size),
          `outline h=${h} @${size}`
        ).toEqual(ends[0].geo({ h }, size));
        expect(
          toggle.geo({ h, p: 1, e: 0 }, size),
          `filled h=${h} @${size}`
        ).toEqual(ends[1].geo({ h }, size));
      }
    }
  });

  it("rests on Carbon's two icons, fills in between, and is empty again when the hole has opened", () => {
    grid(32);
    const at = (p: number, e: number, h = 0) =>
      cover(toggle.geo({ h, p, e }, 32));
    expect(delta(at(0, 0), coverCarbon(statics[0], 32))).toBeLessThan(GATE);
    expect(delta(at(1, 0), coverCarbon(statics[1], 32))).toBeLessThan(GATE);
    // Mid-fill is neither end; fully emptied is the outline again (before the engine resets p and e).
    expect(delta(at(0.5, 0), at(0, 0))).toBeGreaterThan(0.05);
    expect(delta(at(0.5, 0), at(1, 0))).toBeGreaterThan(0.05);
    for (const h of [0, 1])
      expect(delta(at(1, 1, h), at(0, 0, h)), `h=${h}`).toBeLessThan(0.002);
  });

  it('renders animated with no masks or clip paths', () => {
    const T = toggle;
    const { container } = render(
      <MotionIconProvider animated>
        <T aria-label="t" />
      </MotionIconProvider>
    );
    expect(container.querySelector('mask, clipPath')).toBeNull();
    expect(container.querySelectorAll('[data-k]').length).toBe(
      Object.keys(toggle.geo({ h: 0, p: 0, e: 0 })).length
    );
  });
});

describe('the parity measure', () => {
  it('sees ink, and tells different icons apart', () => {
    grid(32);
    expect(coverCarbon(CEvent, 32).reduce((a, v) => a + v, 0)).toBeGreaterThan(
      5000
    );
    expect(
      delta(
        cover(CircleOutline.geo({ h: 0 }, 32)),
        coverCarbon(CCircleFilled, 32)
      )
    ).toBeGreaterThan(0.3);
    // A quarter-hover slip shows.
    expect(
      delta(
        cover(NotAvailable.geo({ h: 0.25 }, 32)),
        coverCarbon(CNotAvailable, 32)
      )
    ).toBeGreaterThan(GATE);
  });
});

describe('parity report', () => {
  it('logs Δ per icon and size, the gaps and the draw-backs', () => {
    console.log(
      `Event draw-back: right ${EV_DR.toFixed(2)} bottom ${EV_DB.toFixed(2)}; Event schedule: right ${ES_DR.toFixed(2)} bottom ${ES_DB.toFixed(2)}`
    );
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
