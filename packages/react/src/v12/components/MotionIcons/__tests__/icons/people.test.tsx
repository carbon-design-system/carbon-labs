/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  Collaborate as CCollaborate,
  Events as CEvents,
  Group as CGroup,
  User as CUser,
  UserAdmin as CUserAdmin,
  UserAvatar as CUserAvatar,
  UserAvatarFilled as CUserAvatarFilled,
  UserAvatarFilledAlt as CUserAvatarFilledAlt,
  UserFilled as CUserFilled,
  UserFollow as CUserFollow,
  UserMultiple as CUserMultiple,
  UserProfile as CUserProfile,
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
  ARC_CENTRES,
  COLLAB_ENDS,
  Collaborate,
  collabArc,
  Events,
  Group,
  solveCollabEnds,
  User,
  UserAdmin,
  UserAvatar,
  UserAvatarFilled,
  UserAvatarFilledAlt,
  UserFilled,
  UserFollow,
  UserMultiple,
  UserProfile,
} from '../../icons/people/people';
import { UserAvatarToggle, UserToggle } from '../../icons/toggle/peopleToggles';

/**
 * The people icons (people.ts) and their toggles (peopleToggles.ts).
 *
 *  - The same shape keys at every hover (and toggle) frame and size, and no
 *    NaN or Infinity.
 *  - Rest parity with Carbon at 16 / 20 / 24 / 32 by coverage (the sampler
 *    of opsFillToggles.test.tsx, which mirrors the browser Parity story: Δ
 *    is the share of ink pixels whose coverage differs by more than a
 *    quarter, gated at 0.5%), for the hover icons and both toggle ends.
 *  - Toggle ends equal the hover icons (geometry identical).
 *  - Constant line weight through the hover: every line-art shape's widest
 *    inscribed disc stays 2px across (its ink's largest distance to empty
 *    space is 1 unit), so nothing thickens or thins as it grows or scales.
 *  - Separate parts never touch (no shared ink, a clear gap), and each
 *    person's head-to-shoulders gap holds.
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
    if (el.getAttribute('fill') === 'none') return;
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
  /** Head ↔ shoulders pairs whose gap holds through the hover (or, `grows`, never shrinks). */
  hold?: [string, string][];
  grows?: boolean;
  /** Pairs (between people) whose space must never shrink: they step apart as they grow. */
  keep?: [string, string][];
  /** Pairs that must stay at least 2px apart. */
  clear?: [string, string][];
  /** Solid shapes (fills, discs), left out of the line-weight check. */
  solid?: string[];
}

const BODY = (n: string): [string, string] => [`${n}Head`, `${n}Body`];
const CASES: Case[] = [
  {
    name: 'User',
    icon: User,
    carbon: CUser,
    apart: [BODY('user')],
    hold: [BODY('user')],
    solid: ['fill'],
  },
  {
    name: 'UserFilled',
    icon: UserFilled,
    carbon: CUserFilled,
    apart: [],
    solid: ['fill'],
  },
  {
    name: 'UserAvatar',
    icon: UserAvatar,
    carbon: CUserAvatar,
    apart: [BODY('person'), ['personHead', 'ring']],
    hold: [BODY('person')],
    grows: true,
    solid: ['fill'],
  },
  {
    name: 'UserAvatarFilledAlt',
    icon: UserAvatarFilledAlt,
    carbon: CUserAvatarFilledAlt,
    apart: [['personHead', 'ring']],
    solid: ['fill'],
  },
  {
    name: 'UserAvatarFilled',
    icon: UserAvatarFilled,
    carbon: CUserAvatarFilled,
    apart: [],
    solid: ['disc'],
  },
  {
    name: 'UserMultiple',
    icon: UserMultiple,
    carbon: CUserMultiple,
    apart: [
      BODY('front'),
      BODY('back'),
      ['frontHead', 'backHead'],
      ['frontBody', 'backBody'],
      ['frontHead', 'backBody'],
      ['frontBody', 'backHead'],
    ],
    // The person behind steps right under Carbon's held cuts, so its head nears its shoulders' cut corner
    // (2.49 → 2.21); the head-to-shoulders gap itself stays 2px (`clear`).
    hold: [BODY('front')],
    clear: [BODY('back')],
    keep: [
      ['frontHead', 'backHead'],
      ['frontBody', 'backBody'],
      ['frontHead', 'backBody'],
      ['frontBody', 'backHead'],
    ],
  },
  {
    name: 'Group',
    icon: Group,
    carbon: CGroup,
    apart: [
      BODY('upper'),
      BODY('lower'),
      ['upperBody', 'lowerHead'],
      ['upperBody', 'lowerBody'],
      ['upperHead', 'lowerHead'],
    ],
    hold: [BODY('upper'), BODY('lower')],
    keep: [
      ['upperBody', 'lowerHead'],
      ['upperBody', 'lowerBody'],
      ['upperHead', 'lowerHead'],
    ],
  },
  {
    name: 'Events',
    icon: Events,
    carbon: CEvents,
    apart: [
      BODY('front'),
      BODY('left'),
      BODY('right'),
      ['frontHead', 'leftHead'],
      ['frontHead', 'rightHead'],
      ['frontHead', 'leftBody'],
      ['frontHead', 'rightBody'],
      ['frontBody', 'leftBody'],
      ['frontBody', 'rightBody'],
    ],
    hold: [BODY('front'), BODY('left'), BODY('right')],
    keep: [
      ['frontHead', 'leftHead'],
      ['frontHead', 'rightHead'],
      ['frontHead', 'leftBody'],
      ['frontHead', 'rightBody'],
      ['frontBody', 'leftBody'],
      ['frontBody', 'rightBody'],
    ],
  },
  {
    name: 'Collaborate',
    icon: Collaborate,
    carbon: CCollaborate,
    apart: [
      BODY('a'),
      BODY('b'),
      ['aHead', 'arcs'],
      ['aBody', 'arcs'],
      ['bHead', 'arcs'],
      ['bBody', 'arcs'],
      ['aHead', 'bHead'],
      ['aBody', 'bBody'],
      ['aHead', 'bBody'],
      ['aBody', 'bHead'],
    ],
    hold: [BODY('a'), BODY('b')],
  },
  {
    name: 'UserFollow',
    icon: UserFollow,
    carbon: CUserFollow,
    apart: [BODY('person'), ['personHead', 'plus'], ['personBody', 'plus']],
  },
  {
    name: 'UserAdmin',
    icon: UserAdmin,
    carbon: CUserAdmin,
    apart: [BODY('person'), ['personHead', 'check'], ['personBody', 'check']],
  },
  {
    name: 'UserProfile',
    icon: UserProfile,
    carbon: CUserProfile,
    apart: [BODY('person'), ['personHead', 'lines'], ['personBody', 'lines']],
  },
];

const SIZES = [16, 20, 24, 32];
const STEPS = [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1];
const HS = [0, 0.5, 1];
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

const parity: Record<string, Record<string, number>> = {};
const gaps: Record<string, string[]> = {};

describe.each(CASES)(
  '$name',
  ({
    name,
    icon,
    carbon,
    apart,
    hold = [],
    grows,
    keep = [],
    clear = [],
    solid = [],
  }) => {
    it('stays inside the 36×36 hover box (−2…34) at every frame', () => {
      for (const h of STEPS) {
        const pts = Object.values(icon.geo({ h })).flatMap((a) =>
          flatten(String(a.d ?? '')).flatMap((q) => q.pts)
        );
        expect(Math.min(...pts.flat()), `h=${h}`).toBeGreaterThanOrEqual(
          -2 - 1e-6
        );
        expect(Math.max(...pts.flat()), `h=${h}`).toBeLessThanOrEqual(
          34 + 1e-6
        );
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

    it('hovers at a constant 2px line weight (no transforms, strokes or scaled walls)', () => {
      grid(32);
      const rest: Record<string, number> = {};
      for (const h of [0, 0.25, 0.5, 0.75, 1]) {
        for (const [k, attrs] of Object.entries(icon.geo({ h }, 32))) {
          expect(attrs.transform, k).toBeUndefined();
          expect(attrs.strokeWidth, k).toBeUndefined();
          if (solid.includes(k)) continue;
          const w = inscribed(cover({ [k]: attrs }));
          rest[k] ??= w;
          // A 2px wall: no ink more than 1 unit from empty space (more only where a plus's arms cross,
          // √2, or a check's arms meet in a miter, 1.19), and never a change through the hover.
          expect(w, `${k} h=${h}`).toBeCloseTo(
            ({ plus: Math.SQRT2, check: 1.19 } as Record<string, number>)[k] ??
              1,
            1
          );
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

    it.runIf(apart.length > 0)(
      'keeps its separate parts apart through the hover (no shared ink, a clear gap), and each head-to-shoulders gap holds',
      () => {
        grid(32);
        gaps[name] = [];
        for (const [a, b] of apart) {
          const rest = gap(
            String(icon.geo({ h: 0 })[a].d),
            String(icon.geo({ h: 0 })[b].d)
          );
          let least = Infinity;
          for (const h of STEPS) {
            const shapes = icon.geo({ h });
            const [ia, ib] = [cover({ a: shapes[a] }), cover({ b: shapes[b] })];
            let shared = 0;
            for (let k = 0; k < ia.length; k++) shared += ia[k] & ib[k];
            expect(shared, `${a}/${b} h=${h}`).toBe(0);
            const g = gap(String(shapes[a].d), String(shapes[b].d));
            least = Math.min(least, g);
            if (hold.some(([p, q]) => p === a && q === b)) {
              if (grows)
                expect(g, `${a}/${b} h=${h}`).toBeGreaterThanOrEqual(
                  rest - 0.02
                );
              else
                expect(Math.abs(g - rest), `${a}/${b} h=${h}`).toBeLessThan(
                  0.03
                );
            }
            // Between people: never more than a sliver nearer mid-stagger, and no nearer at all once settled.
            if (clear.some(([p, q]) => p === a && q === b))
              expect(g, `${a}/${b} h=${h}`).toBeGreaterThanOrEqual(2 - 0.03);
            if (keep.some(([p, q]) => p === a && q === b))
              expect(g, `${a}/${b} h=${h}`).toBeGreaterThanOrEqual(
                rest - (h === 1 ? 0.03 : 0.2)
              );
          }
          expect(least, `${a}/${b}`).toBeGreaterThan(0.9);
          const full = gap(
            String(icon.geo({ h: 1 })[a].d),
            String(icon.geo({ h: 1 })[b].d)
          );
          gaps[name].push(
            `${a}/${b} ${rest.toFixed(2)} → ${full.toFixed(2)} (least ${least.toFixed(2)})`
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
  }
);

describe('the person moves as the family motion says', () => {
  /** A ring's inner and outer radius about its centre. */
  const radii = (d: string, c: Pt) => {
    const r = flatten(d)
      .flatMap((p) => p.pts)
      .map(([x, y]) => Math.hypot(x - c[0], y - c[1]));
    return [Math.min(...r), Math.max(...r)];
  };
  const box = (d: string) => {
    const pts = flatten(d).flatMap((p) => p.pts);
    return [
      Math.min(...pts.map(([x]) => x)),
      Math.min(...pts.map(([, y]) => y)),
      Math.max(...pts.map(([x]) => x)),
      Math.max(...pts.map(([, y]) => y)),
    ];
  };

  it('User: the shoulders grow 1px each side (top and leg ends held), the head 1px in diameter with its bottom held', () => {
    const [rest, full] = [User.geo({ h: 0 }), User.geo({ h: 1 })];
    expect(radii(String(full.userHead.d), [16, 8.5])).toEqual([
      expect.closeTo(5.5, 3),
      expect.closeTo(7.5, 3),
    ]);
    expect(box(String(full.userHead.d))[3]).toBeCloseTo(
      box(String(rest.userHead.d))[3],
      3
    );
    const [a, b] = [box(String(rest.userBody.d)), box(String(full.userBody.d))];
    expect(b).toEqual([
      expect.closeTo(a[0] - 1, 3),
      expect.closeTo(a[1], 3),
      expect.closeTo(a[2] + 1, 3),
      expect.closeTo(a[3], 3),
    ]);
  });

  it('User multiple, Group: the people step 1px apart as they grow', () => {
    const x = (shapes: Shapes, k: string) => box(String(shapes[k].d));
    const [m0, m1] = [UserMultiple.geo({ h: 0 }), UserMultiple.geo({ h: 1 })];
    expect(x(m1, 'frontBody')[0]).toBeCloseTo(x(m0, 'frontBody')[0] - 2, 3); // 1px wider, 1px left
    expect(x(m1, 'backBody')[2]).toBeCloseTo(x(m0, 'backBody')[2] + 2, 3);
    const [g0, g1] = [Group.geo({ h: 0 }), Group.geo({ h: 1 })];
    expect(x(g1, 'upperBody')[0]).toBeCloseTo(x(g0, 'upperBody')[0] - 2, 3);
    expect(x(g1, 'lowerBody')[2]).toBeCloseTo(x(g0, 'lowerBody')[2] + 2, 3);
  });

  it('Collaborate: the people orbit 41.19° CCW to stand level, 4px apart; each arc turns 33° and moves as one smooth curve, keeping about its resting gap, never backing up', () => {
    const full = Collaborate.geo({ h: 1 });
    const [a, b] = [box(String(full.aBody.d)), box(String(full.bBody.d))];
    expect(a[1]).toBeCloseTo(b[1], 3);
    expect(a[3]).toBeCloseTo(b[3], 3);
    expect(b[0] - a[2]).toBeCloseTo(4, 3);
    const [ha, hb] = [box(String(full.aHead.d)), box(String(full.bHead.d))];
    expect(ha[1]).toBeCloseTo(hb[1], 3);
    // Each arc's gap to each person (the nearer of head and shoulders), held at its resting value.
    const arcGaps = (h: number) => {
      const g = Collaborate.geo({ h });
      const arcs = String(g.arcs.d).split(/(?=M)/);
      return arcs.map((d) =>
        (['a', 'b'] as const).map((p) =>
          Math.min(
            gap(d, String(g[`${p}Head`].d)),
            gap(d, String(g[`${p}Body`].d))
          )
        )
      );
    };
    const rest = arcGaps(0);
    const report: string[] = [];
    let least = Infinity;
    for (const h of Array.from({ length: 33 }, (_, i) => i / 32)) {
      const now = arcGaps(h);
      // Never nearer either person than 3.5, and the nearer person never more than 0.7 further than at rest.
      now.forEach((row, i) => {
        row.forEach((v, k) =>
          expect(v, `arc ${i} person ${k} h=${h}`).toBeGreaterThanOrEqual(3.5)
        );
        expect(Math.min(...row), `arc ${i} h=${h}`).toBeLessThan(
          Math.min(...rest[i]) + 0.7
        );
        least = Math.min(least, ...row);
      });
      if ([0, 0.5, 1].includes(h))
        report.push(
          `h ${h}: ` +
            now
              .map(
                (row, i) =>
                  `arc ${i} → a ${row[0].toFixed(2)}, b ${row[1].toFixed(2)}`
              )
              .join('; ')
        );
    }
    console.log(
      `Collaborate arc gaps (least ${least.toFixed(2)})\n` + report.join('\n')
    );
    expect(least).toBeGreaterThanOrEqual(3.8);
    // One smooth motion: monotonic along both axes (each arc's centre), its turn running straight on h.
    for (const i of [0, 1]) {
      const at = (h: number) => collabArc(i, h)(ARC_CENTRES[i]);
      const path = Array.from({ length: 401 }, (_, j) => at(j / 400));
      for (const k of [0, 1]) {
        const dir = Math.sign(path[400][k] - path[0][k]);
        for (let j = 1; j <= 400; j++)
          expect(
            (path[j][k] - path[j - 1][k]) * dir,
            `arc ${i} axis ${k} at ${j / 400}`
          ).toBeGreaterThanOrEqual(-1e-9);
      }
    }
    for (const i of [0, 1]) {
      // Turned 33° × h: a point 1 unit right of the arc's centre ends up at angle −16.5° at h 0.5.
      const [cx, cy] = ARC_CENTRES[i];
      const [p, q] = [
        collabArc(i, 0.5)([cx + 1, cy]),
        collabArc(i, 0.5)([cx, cy]),
      ];
      expect(
        (Math.atan2(-(p[1] - q[1]), p[0] - q[0]) * 180) / Math.PI
      ).toBeCloseTo(16.5, 3);
    }
    // Both end centred across on the pair (box centre x 16), the lower below and the upper above.
    const ends = String(full.arcs.d)
      .split(/(?=M)/)
      .map((d) => box(d));
    for (const e of ends) expect((e[0] + e[2]) / 2).toBeCloseTo(16, 1);
    expect(ends[0][1]).toBeGreaterThan(a[3]);
    expect(ends[1][3]).toBeLessThan(ha[1]);
    console.log(
      'Collaborate arcs at h 1 (box x0, y0, x1, y1): ' +
        ends.map((e) => e.map((v) => v.toFixed(2)).join(', ')).join(' | ')
    );
    // The shipped end moves are the solver's.
    solveCollabEnds().forEach(([x, y], i) => {
      expect(COLLAB_ENDS[i][0]).toBeCloseTo(x, 3);
      expect(COLLAB_ENDS[i][1]).toBeCloseTo(y, 3);
    });
    // The two arcs never come near each other.
    for (const h of STEPS) {
      const [p, q] = String(Collaborate.geo({ h }).arcs.d).split(/(?=M)/);
      expect(gap(p, q), `h=${h}`).toBeGreaterThan(4);
    }
    // Each arc moves rigidly: the distances between its own nodes hold, and it turned 33° CCW.
    const nodes = (d: string): Pt[][] =>
      d
        .split(/(?=M)/)
        .filter(Boolean)
        .map((sp) => {
          const out: Pt[] = [];
          for (const [, c, args] of sp.matchAll(/([MLA])([^MLAZ]*)/g)) {
            const n = args
              .trim()
              .split(/[\s,]+/)
              .map(Number);
            out.push(c === 'A' ? [n[5], n[6]] : [n[0], n[1]]);
          }
          return out;
        });
    const [r0, r1] = [
      nodes(String(Collaborate.geo({ h: 0 }).arcs.d)),
      nodes(String(full.arcs.d)),
    ];
    expect(r1.map((q) => q.length)).toEqual(r0.map((q) => q.length));
    for (const i of [0, 1]) {
      const [p0, p1] = [r0[i], r1[i]];
      for (let j = 0; j < p0.length; j++)
        for (let k = 0; k < p0.length; k++)
          expect(
            Math.hypot(p1[j][0] - p1[k][0], p1[j][1] - p1[k][1])
          ).toBeCloseTo(
            Math.hypot(p0[j][0] - p0[k][0], p0[j][1] - p0[k][1]),
            2
          );
      const ang = (p: Pt[]) => Math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]);
      expect((((ang(p0) - ang(p1)) * 180) / Math.PI + 360) % 360).toBeCloseTo(
        33,
        1
      );
    }
  });

  it('Events: the front person grows and steps 1px down, and the two behind step 1px out, all together (no stagger)', () => {
    const bx = (shapes: Shapes, k: string) => box(String(shapes[k].d));
    // Early on, every person has started.
    const early = Events.geo({ h: 0.15 });
    expect(bx(early, 'frontBody')[1]).toBeGreaterThan(23 + 0.01);
    expect(bx(early, 'leftHead')[0]).toBeLessThan(3 - 0.01);
    expect(bx(early, 'rightHead')[2]).toBeGreaterThan(29 + 0.01);
    const mid = Events.geo({ h: 0.5 });
    expect(bx(mid, 'leftHead')[0]).toBeLessThan(3 - 0.01);
    expect(32 - bx(mid, 'rightHead')[2]).toBeCloseTo(bx(mid, 'leftHead')[0], 3);
    const full = Events.geo({ h: 1 });
    expect(bx(full, 'frontBody')[1]).toBeCloseTo(24, 3);
    expect(bx(full, 'frontBody')[3]).toBeCloseTo(31, 3);
    expect([bx(full, 'leftHead')[0], bx(full, 'rightHead')[2]]).toEqual([
      expect.closeTo(1.5, 3),
      expect.closeTo(30.5, 3),
    ]);
  });

  it('User follow, admin, profile: the person grows and steps 1px left, as user--multiple front person; the marks keep their motion', () => {
    for (const icon of [UserFollow, UserAdmin, UserProfile]) {
      const full = icon.geo({ h: 1 });
      const front = UserMultiple.geo({ h: 1 });
      expect(full.personHead).toEqual(front.frontHead);
      expect(full.personBody).toEqual(front.frontBody);
    }
    expect(box(String(UserFollow.geo({ h: 1 }).plus.d))).toEqual([
      20, 8, 34, 22,
    ]);
  });

  it("User admin: the check grows 34% about its visual centre, its ends reaching about 2px, its space to the person as User follow's", () => {
    const [r, f] = [
      box(String(UserAdmin.geo({ h: 0 }).check.d)),
      box(String(UserAdmin.geo({ h: 1 }).check.d)),
    ];
    expect(f[2] - r[2]).toBeGreaterThan(1.5); // the long arm's end, right
    expect(r[0] - f[0]).toBeGreaterThan(1.5); // the short arm's end, left
    const g = (icon: FrameHoverIcon, mark: string) => {
      const s1 = icon.geo({ h: 1 });
      return [
        gap(String(s1.personHead.d), String(s1[mark].d)),
        gap(String(s1.personBody.d), String(s1[mark].d)),
      ];
    };
    const [admin, follow] = [g(UserAdmin, 'check'), g(UserFollow, 'plus')];
    console.log(
      `User admin gaps at h 1: head ${admin[0].toFixed(2)}, shoulders ${admin[1].toFixed(2)} (User follow: ${follow[0].toFixed(2)}, ${follow[1].toFixed(2)})`
    );
    admin.forEach((v, i) => expect(Math.abs(v - follow[i])).toBeLessThan(0.15));
  });

  it('User profile: the lines reach 2px right, 16ms apart from the top; their left ends hold', () => {
    const full = box(String(UserProfile.geo({ h: 1 }).lines.d));
    expect(full).toEqual([22, 4, 34, 16]);
  });
});

// ── The toggles ──────────────────────────────────────────────────────────────

interface ToggleCase {
  name: string;
  toggle: FrameToggleIcon<'off' | 'on'>;
  carbon: readonly [CarbonIcon, CarbonIcon];
  ends: readonly [FrameHoverIcon, FrameHoverIcon];
}
const TOGGLES: ToggleCase[] = [
  {
    name: 'UserToggle',
    toggle: UserToggle,
    carbon: [CUser, CUserFilled],
    ends: [User, UserFilled],
  },
  {
    name: 'UserAvatarToggle',
    toggle: UserAvatarToggle,
    carbon: [CUserAvatar, CUserAvatarFilledAlt],
    ends: [UserAvatar, UserAvatarFilledAlt],
  },
];
const frames = STEPS.flatMap((h) =>
  STEPS.flatMap((p) => [
    { h, p, e: 0 },
    { h, p: 1, e: p },
  ])
);

describe.each(TOGGLES)('$name', ({ name, toggle, carbon, ends }) => {
  it('keeps the same shape keys at every frame and size, and never paints NaN or Infinity', () => {
    for (const size of SIZES) {
      const rest = Object.keys(toggle.geo({ h: 0, p: 0, e: 0 }, size)).sort();
      for (const fr of frames) {
        const shapes = toggle.geo(fr, size);
        expect(
          Object.keys(shapes).sort(),
          `${JSON.stringify(fr)} @${size}`
        ).toEqual(rest);
        for (const [k, attrs] of Object.entries(shapes)) {
          for (const [a, v] of Object.entries(attrs))
            expect(
              /NaN|Infinity|undefined/.test(String(v)),
              `${k}.${a} at ${JSON.stringify(fr)} @${size}`
            ).toBe(false);
        }
      }
    }
  });

  it('its ends are the hover icons at every hover frame and size', () => {
    for (const size of SIZES) {
      for (const h of STEPS) {
        expect(
          toggle.geo({ h, p: 0, e: 0 }, size),
          `off h=${h} @${size}`
        ).toEqual(ends[0].geo({ h }, size));
        expect(
          toggle.geo({ h, p: 1, e: 0 }, size),
          `on h=${h} @${size}`
        ).toEqual(ends[1].geo({ h }, size));
      }
    }
  });

  it("rests on Carbon's static icons at both ends and every size (within 0.5%)", () => {
    for (const size of SIZES) {
      grid(size);
      for (const p of [0, 1] as const) {
        const d = delta(
          cover(toggle.geo({ h: 0, p, e: 0 }, size)),
          coverCarbon(carbon[p], size)
        );
        parity[`${name} p=${p}`] = { ...parity[`${name} p=${p}`], [size]: d };
        expect(d, `p=${p} @${size}`).toBeLessThan(GATE);
      }
    }
  });

  it("fills with one disc from the head's centre (every fill point within its radius), and empties with one hole from there", () => {
    for (const h of HS) {
      const head = (fr: { h: number; p: number; e: number }) => {
        const d = String(toggle.geo(fr).fill.d);
        return { d, pts: flatten(d).flatMap((q) => q.pts) };
      };
      const ring = flatten(
        String(
          toggle.geo({ h, p: 0, e: 0 })[
            name === 'UserToggle' ? 'userHead' : 'personHead'
          ].d
        )
      ).flatMap((q) => q.pts);
      const c: Pt = [
        (Math.min(...ring.map(([x]) => x)) +
          Math.max(...ring.map(([x]) => x))) /
          2,
        (Math.min(...ring.map(([, y]) => y)) +
          Math.max(...ring.map(([, y]) => y))) /
          2,
      ];
      const full = Math.max(
        ...head({ h, p: 1, e: 0 }).pts.map(([x, y]) =>
          Math.hypot(x - c[0], y - c[1])
        )
      );
      for (const p of [0.1, 0.3, 0.6]) {
        const { pts } = head({ h, p, e: 0 });
        const far = Math.max(
          ...pts.map(([x, y]) => Math.hypot(x - c[0], y - c[1]))
        );
        expect(far, `p=${p} h=${h}`).toBeLessThanOrEqual(full * p + 0.6);
      }
      // Early on, only the head has fill (one subpath); by p 0.6 the shoulders have it too.
      expect(head({ h, p: 0.1, e: 0 }).d.split('M').length - 1).toBe(1);
      expect(head({ h, p: 0.6, e: 0 }).d.split('M').length - 1).toBe(2);
      // Emptying: the hole is a circle about the same centre.
      const hole = flatten(String(toggle.geo({ h, p: 1, e: 0.1 }).fill.d)).map(
        (q) => q.pts
      );
      const last = hole[hole.length - 1];
      const rs = last.map(([x, y]) => Math.hypot(x - c[0], y - c[1]));
      expect(Math.max(...rs) - Math.min(...rs), `h=${h}`).toBeLessThan(0.01);
    }
  });

  it('fills part-way (the disc), and a full hole empties it back to the outline', () => {
    for (const size of SIZES) {
      grid(size);
      for (const h of HS) {
        const [off, on, mid] = [
          cover(toggle.geo({ h, p: 0, e: 0 }, size)),
          cover(toggle.geo({ h, p: 1, e: 0 }, size)),
          cover(toggle.geo({ h, p: 0.4, e: 0 }, size)),
        ];
        expect(
          delta(cover(toggle.geo({ h, p: 1, e: 1 }, size)), off),
          `h=${h} @${size}`
        ).toBeLessThan(GATE);
        if (size !== 16 || name === 'UserToggle') {
          expect(delta(mid, off)).toBeGreaterThan(GATE);
          expect(delta(mid, on)).toBeGreaterThan(GATE);
        }
      }
    }
  });

  it.each(['off', 'on'] as const)(
    'renders with initial="%s", animated and static, and toggles on click',
    (initial) => {
      const onToggle = vi.fn();
      const Icon = toggle;
      const { container } = render(
        <MotionIconProvider animated>
          <Icon initial={initial} onToggle={onToggle} aria-label="t" />
        </MotionIconProvider>
      );
      const svg = container.querySelector('svg')!;
      expect(svg.querySelector('mask, clipPath')).toBeNull();
      fireEvent.click(svg);
      expect(onToggle).toHaveBeenCalledWith(
        initial === 'off' ? 'on' : 'off',
        initial === 'off'
      );
      expect(
        render(
          <Icon initial={initial} animated={false} aria-label="t" />
        ).container.querySelector('svg')
      ).not.toBeNull();
    }
  );
});

describe('the parity measure', () => {
  it('sees ink, and tells the avatar drawings apart', () => {
    grid(32);
    expect(coverCarbon(CUser, 32).reduce((a, v) => a + v, 0)).toBeGreaterThan(
      10000
    );
    expect(
      delta(
        cover(UserAvatar.geo({ h: 0 })),
        coverCarbon(CUserAvatarFilledAlt, 32)
      )
    ).toBeGreaterThan(GATE);
    expect(
      delta(
        cover(UserAvatarFilled.geo({ h: 0 })),
        coverCarbon(CUserAvatarFilledAlt, 32)
      )
    ).toBeGreaterThan(GATE);
    // A 1px rise of the head and shoulders shows.
    expect(
      delta(cover(User.geo({ h: 1 })), coverCarbon(CUser, 32))
    ).toBeGreaterThan(GATE);
  });
});

describe('report', () => {
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
