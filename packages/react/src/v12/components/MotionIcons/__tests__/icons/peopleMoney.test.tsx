/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  Accessibility as CAccessibility,
  Account as CAccount,
  ChatBot as CChatBot,
  Chemistry as CChemistry,
  ChevronSortUp as CChevronSortUp,
  Compass as CCompass,
  ConnectionSignal as CConnectionSignal,
  ConnectionSignalOff as CConnectionSignalOff,
  FaceSatisfied as CFaceSatisfied,
  FaceSatisfiedFilled as CFaceSatisfiedFilled,
  Hourglass as CHourglass,
  Lightning as CLightning,
  Money as CMoney,
  Partnership as CPartnership,
  Phone as CPhone,
  PhoneOff as CPhoneOff,
  PreviousFilled as CPreviousFilled,
  PreviousOutline as CPreviousOutline,
  UserRole as CUserRole,
  Wallet as CWallet,
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
  Accessibility,
  Account,
  ARM_REACH,
  BOT_EYE_GAP,
  botFace,
  ChatBot,
  Chemistry,
  ChevronSortUp,
  circleD,
  Compass,
  compassAt,
  ConnectionSignal,
  ConnectionSignalOff,
  ConnectionSignalOffToggle,
  eyeGap,
  FACE_EYE_GAP,
  FaceSatisfied,
  FaceSatisfiedFilled,
  FaceSatisfiedToggle,
  faceEyeLift,
  faceSmile,
  grainsAt,
  HIP,
  Hourglass,
  HOURGLASS_GROW,
  LEAN_DEG,
  Lightning,
  Money,
  needleBars,
  northDot,
  Partnership,
  partnerV,
  Phone,
  PHONE_C,
  PHONE_GROW,
  PHONE_LOOPS,
  PHONE_SIDES,
  PhoneOff,
  PhoneOffToggle,
  PreviousFilled,
  PreviousOutline,
  PreviousToggle,
  previousArrow,
  ROLE_CHEVRON_C,
  ROLE_CHEVRON_GROW,
  signalPulse,
  smilePath,
  UserRole,
  Wallet,
  weightScaleLoops,
  flaskAt,
  flaskD,
  FLASK_TILT,
  FLASK_GROW,
  OUTGOING_GONE,
  SIGNAL_RISE,
  accessHead,
  CHAT_BOT_BLINK_H,
  signalShapes,
} from '../../icons/assorted/peopleMoney';
import { nextArrow } from '../../icons/assorted/statesTime';
import { Flash } from '../../icons/toggle/fillToggles';

/**
 * People, money and toggles (peopleMoney.ts): keys and NaNs across the hover
 * (and the toggles' h / p / e) at every size; rest parity with Carbon at
 * 16 / 20 / 24 / 32 by coverage (statesTime.test's sampler, which mirrors the
 * browser Parity story: Δ is the share of ink pixels whose coverage differs
 * by more than a quarter, gated at 0.5%); the hover at constant weight
 * (every outline point moves by one of the icon's allowed offsets, or walls
 * keep their width); separate parts never touch; everything stays inside
 * 36×36; and each toggle's ends are its hover icons.
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
 * walls (rings, arcs, discs), checked below.
 */
type Moves = Record<string, Pt[]>;
const still: Pt = [0, 0];
interface Case {
  name: string;
  icon: FrameHoverIcon;
  carbon: CarbonIcon;
  moves: Moves;
  /** Separate parts that must never touch: [part, part, least gap (default 1.4)]. */
  apart?: [string, string, number?][];
}
const CASES: Case[] = [
  {
    name: 'FaceSatisfied',
    icon: FaceSatisfied,
    carbon: CFaceSatisfied,
    moves: {},
    apart: [['ring', 'glyph']],
  },
  {
    name: 'FaceSatisfiedFilled',
    icon: FaceSatisfiedFilled,
    carbon: CFaceSatisfiedFilled,
    moves: {},
  },
  {
    name: 'Partnership',
    icon: Partnership,
    carbon: CPartnership,
    moves: {},
    apart: [
      ['left', 'bodies', 0.9],
      ['right', 'bodies', 0.9],
      ['left', 'right'],
    ],
  },
  {
    name: 'UserRole',
    icon: UserRole,
    carbon: CUserRole,
    moves: {},
    apart: [
      ['personHead', 'chevron'],
      ['personBody', 'chevron'],
      ['personHead', 'personBody', 0.9],
    ],
  },
  {
    name: 'Accessibility',
    icon: Accessibility,
    carbon: CAccessibility,
    moves: { wheel: [still] },
    apart: [
      ['head', 'upper', 0.9],
      ['head', 'chair'],
      ['head', 'wheel'],
    ],
  },
  {
    name: 'ChatBot',
    icon: ChatBot,
    carbon: CChatBot,
    moves: {},
    apart: [
      ['bubble', 'eyes'],
      ['bubble', 'mouth'],
      ['eyes', 'mouth'],
    ],
  },
  {
    name: 'Money',
    icon: Money,
    carbon: CMoney,
    moves: { bill: [[0, -1]], base: [still] },
    apart: [
      ['note', 'bill'],
      ['bill', 'base'],
    ],
  },
  {
    name: 'Wallet',
    icon: Wallet,
    carbon: CWallet,
    moves: {},
    apart: [['wallet', 'button']],
  },
  {
    name: 'Account',
    icon: Account,
    carbon: CAccount,
    moves: {
      card: [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ],
      lines: [
        [-1, 0],
        [1, 0],
      ],
    },
    apart: [['card', 'lines']],
  },
  { name: 'Chemistry', icon: Chemistry, carbon: CChemistry, moves: {} },
  {
    name: 'Compass',
    icon: Compass,
    carbon: CCompass,
    moves: { hub: [still] },
    apart: [
      ['ring', 'needle'],
      ['needle', 'north', 1.9],
      ['hub', 'north'],
      ['ring', 'hub'],
    ],
  },
  { name: 'Hourglass', icon: Hourglass, carbon: CHourglass, moves: {} },
  { name: 'Lightning', icon: Lightning, carbon: CLightning, moves: {} },
  { name: 'Phone', icon: Phone, carbon: CPhone, moves: {} },
  { name: 'PhoneOff', icon: PhoneOff, carbon: CPhoneOff, moves: {} },
  {
    name: 'ConnectionSignal',
    icon: ConnectionSignal,
    carbon: CConnectionSignal,
    moves: {},
  },
  {
    name: 'ConnectionSignalOff',
    icon: ConnectionSignalOff,
    carbon: CConnectionSignalOff,
    moves: {},
  },
  {
    name: 'PreviousOutline',
    icon: PreviousOutline,
    carbon: CPreviousOutline,
    moves: { glyph: [still, [-2, 0]] },
    apart: [['ring', 'glyph']],
  },
  {
    name: 'PreviousFilled',
    icon: PreviousFilled,
    carbon: CPreviousFilled,
    moves: {},
  },
  {
    name: 'ChevronSortUp',
    icon: ChevronSortUp,
    carbon: CChevronSortUp,
    moves: { up: [[0, -2]] },
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

describe.each(CASES)('$name', ({ name, icon, carbon, moves, apart = [] }) => {
  it.runIf(apart.length > 0)(
    'keeps its separate parts apart through the hover (no shared ink, a clear gap)',
    () => {
      grid(32);
      gaps[name] = [];
      for (const [a, b, min = 1.4] of apart) {
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
        expect(least, `${a}/${b}`).toBeGreaterThan(min);
        gaps[name].push(
          `${a}/${b} ≥ ${least.toFixed(2)} (rest ${rest.toFixed(2)})`
        );
      }
    }
  );

  it('keeps the same shape keys at every hover frame and size, never paints NaN or Infinity, and stays inside 36×36', () => {
    for (const size of SIZES) {
      const rest = Object.keys(icon.geo({ h: 0 }, size));
      for (const entering of [1, 0]) {
        for (const h of STEPS) {
          const shapes = icon.geo({ h, entering }, size);
          expect(Object.keys(shapes), `h=${h} @${size}`).toEqual(rest);
          noBad(shapes, `h=${h} entering=${entering} @${size}`);
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

  it('hovers by moving geometry: no transforms, each point by an allowed offset', () => {
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

// ── Walls rebuilt at constant weight ─────────────────────────────────────────

const C: Pt = [16, 16];
/** Every point's distance from c. */
const radii = (d: string, c: Pt) =>
  flatten(d)
    .flatMap((p) => p.pts)
    .map(([x, y]) => Math.hypot(x - c[0], y - c[1]));
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

const turnAbout =
  (c: Pt, deg: number) =>
  ([x, y]: Pt): Pt => {
    const [cs, sn] = [
      Math.cos((deg * Math.PI) / 180),
      Math.sin((deg * Math.PI) / 180),
    ];
    return [
      c[0] + (x - c[0]) * cs - (y - c[1]) * sn,
      c[1] + (x - c[0]) * sn + (y - c[1]) * cs,
    ];
  };
const bbox = (d: string) => {
  const pts = flatten(d).flatMap((p) => p.pts);
  const [xs, ys] = [pts.map(([x]) => x), pts.map(([, y]) => y)];
  return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
};

describe('Face satisfied', () => {
  it('grows the ring 1px at a 2px wall, sweeps the smile 2px round its r 7 centreline, and lifts the eyes so their space to it holds', () => {
    expect(FACE_EYE_GAP).toBeCloseTo(3.14, 2);
    expect(faceEyeLift(1)).toBeCloseTo(1.47, 1);
    for (const h of STEPS) {
      for (const r of radii(String(FaceSatisfied.geo({ h }).ring.d), C))
        expect(near(r, [12 + h, 14 + h]), `ring ${r} h=${h}`).toBe(true);
      const sm = faceSmile(h);
      expect((faceSmile(0).ao - sm.ao) * 7, `sweep h=${h}`).toBeCloseTo(
        2 * h,
        6
      );
      for (const r of radii(smilePath(sm), C))
        expect(r > 6 - 5e-3 && r < 8 + 5e-3, `smile ${r} h=${h}`).toBe(true);
      const lift = faceEyeLift(h);
      for (const x of [11.5, 20.5]) {
        expect(
          eyeGap([x, 13.5 - lift], 2.5, sm),
          `eye ${x} h=${h}`
        ).toBeCloseTo(FACE_EYE_GAP, 3);
        expect(
          gap(circleD([x, 13.5 - lift], 2.5), smilePath(sm)),
          `drawn eye ${x} h=${h}`
        ).toBeCloseTo(FACE_EYE_GAP, 1);
      }
    }
  });
});

describe('Partnership', () => {
  it('grows each head 1px in diameter with its bottom held, moving 1px in with its person', () => {
    for (const h of STEPS) {
      const s = Partnership.geo({ h });
      for (const [k, cx, side] of [
        ['left', 8, 1],
        ['right', 24, -1],
      ] as const) {
        const c: Pt = [cx + side * h, 5 - h / 2];
        for (const r of radii(String(s[k].d), c))
          expect(near(r, [2 + h / 2, 4 + h / 2]), `${k} ${r} h=${h}`).toBe(
            true
          );
        expect(bbox(String(s[k].d))[3], `${k} bottom h=${h}`).toBeCloseTo(9, 3);
      }
    }
  });
  it('holds the outer sides, moves the inner sides 2px in, and raises the V at its own angles with 2px arms', () => {
    const polys = flatten(String(Partnership.geo({ h: 1 }).bodies.d));
    expect(bbox(String(Partnership.geo({ h: 1 }).bodies.d))).toEqual([
      2, 30, 10, 30,
    ]);
    expect(runs(polys, [1, 16], [5, 16])).toEqual([expect.closeTo(2, 1)]); // the left arm, held
    expect(runs(polys, [9, 25], [16, 25])).toEqual([expect.closeTo(2, 1)]); // its inner leg, 2px in (x 12–14)
    expect(inked(polys, [13, 25])).toBe(true);
    const v = partnerV(1);
    expect(v.outer).toBeCloseTo(12.49, 2);
    expect(v.inner).toBeCloseTo(16.51, 2);
    // The arms keep their angle: run over rise, outer and inner, as at rest.
    expect((16 - 14.58) / (v.outer - 10)).toBeCloseTo((16 - 12.58) / 6, 3);
    expect((16 - 13.42) / (v.inner - 12)).toBeCloseTo((16 - 11.42) / 8, 3);
    // Across the V's left arm, square to it: 2px.
    const u: Pt = [3.42 / Math.hypot(3.42, 6), 6 / Math.hypot(3.42, 6)];
    const mid: Pt = [15, 12.5];
    expect(
      runs(
        polys,
        [mid[0] - u[1] * 1.4, mid[1] + u[0] * 1.4],
        [mid[0] + u[1] * 1.4, mid[1] - u[0] * 1.4]
      )
    ).toEqual([expect.closeTo(2, 1)]);
  });
});

describe('User role', () => {
  it('grows the chevron about its visual centre so its ends reach 2px, at a 2px wall, and holds its space to the head', () => {
    const chev = (h: number) =>
      flatten(String(UserRole.geo({ h }).chevron.d))[0].pts;
    const [a, b] = [chev(0), chev(1)];
    const reach = a.map((p, i) => Math.hypot(b[i][0] - p[0], b[i][1] - p[1]));
    expect(Math.max(...reach)).toBeGreaterThan(2);
    expect(Math.max(...reach)).toBeLessThan(2.6);
    expect(ROLE_CHEVRON_GROW).toBeCloseTo(0.3277, 3);
    const u: Pt = [0.7111, -0.7031];
    const mid: Pt = [ROLE_CHEVRON_C[0] + 0.5, 12.2];
    expect(
      runs(
        flatten(String(UserRole.geo({ h: 1 }).chevron.d)),
        [mid[0] - u[1] * 2, mid[1] + u[0] * 2],
        [mid[0] + u[1] * 2, mid[1] - u[0] * 2]
      )
    ).toEqual([expect.closeTo(2, 1)]);
    const headGap = (h: number) =>
      gap(
        String(UserRole.geo({ h }).personHead.d),
        String(UserRole.geo({ h }).chevron.d)
      );
    expect(headGap(1)).toBeCloseTo(headGap(0), 1);
  });
});

describe('Accessibility', () => {
  it('moves the head only 1.25px forward', () => {
    expect(accessHead(1)[0] - 15.5).toBeCloseTo(1.25, 2);
  });
  it('leans the upper body 12° forward about the hip, the head upright on it (1.25px forward), the arm reaching 1px; the chair and wheel hold, the joints stay whole', () => {
    /** The path's segment ends (its corners and arc ends), in order. */
    const ends = (d: string): Pt[] =>
      [...d.matchAll(/([MLA])([^MLAZ]*)/g)].map(([, , args]) => {
        const n = args
          .trim()
          .split(/[\s,]+/)
          .map(Number);
        return [n[n.length - 2], n[n.length - 1]] as Pt;
      });
    const rest = ends(String(Accessibility.geo({ h: 0 }).upper.d));
    for (const h of STEPS) {
      const s = Accessibility.geo({ h });
      const lean = turnAbout(HIP, LEAN_DEG * h);
      for (const r of radii(String(s.head.d), accessHead(h)))
        expect(near(r, [1.5, 3.5]), `head h=${h}`).toBe(true);
      // The head stays upright on the leaning torso, at its resting offset from the cap's centre (so the neck gap holds).
      const cap = lean([15, 13]);
      expect(accessHead(h)[0] - cap[0]).toBeCloseTo(0.5, 9);
      expect(accessHead(h)[1] - cap[1]).toBeCloseTo(-8.5, 9);
      const moved = ends(String(s.upper.d));
      expect(moved.length).toBe(rest.length);
      moved.forEach(([x, y], j) => {
        const [x0, y0] = rest[j];
        const [X, Y] = lean([x0 === 24 ? x0 + ARM_REACH * h : x0, y0]);
        expect(Math.hypot(X - x, Y - y), `upper ${j} h=${h}`).toBeLessThan(
          1e-3
        );
      });
      const up = flatten(String(s.upper.d));
      // The wheel's end and the hip's corner stay inside the leaning wall.
      expect(inked(up, [12.5, 15]), `wheel joint h=${h}`).toBe(true);
      // The arm stays clear of the chair (the leg).
      const arm = outline(String(s.upper.d)).filter(([x]) => x > 20);
      const chairPts = outline(String(s.chair.d));
      let least = Infinity;
      for (const [x, y] of arm)
        for (const [u, v] of chairPts)
          least = Math.min(least, Math.hypot(x - u, y - v));
      expect(least, `arm h=${h}`).toBeGreaterThan(2);
      // Down the leaning wall's centreline and round the hip's corner (r 3 about the hip) to the seat, the ink never breaks.
      const chair = flatten(String(s.chair.d));
      const any = (p: Pt) => inked(up, p) || inked(chair, p);
      for (let k = 0; k <= 60; k++)
        expect(any(lean([12, 13 + (6 * k) / 60])), `wall ${k} h=${h}`).toBe(
          true
        );
      for (let k = 0; k <= 30; k++) {
        const a =
          Math.PI +
          (LEAN_DEG * h * Math.PI) / 180 -
          ((Math.PI / 2 + (LEAN_DEG * h * Math.PI) / 180) * k) / 30;
        expect(
          any([HIP[0] + 3 * Math.cos(a), HIP[1] + 3 * Math.sin(a)]),
          `hip ${k} h=${h}`
        ).toBe(true);
      }
    }
  });
});

describe('Chat bot', () => {
  it('blinks both eyes once on the way in (70ms, 40–110ms into the entrance), never on the way out', () => {
    const [a, b] = CHAT_BOT_BLINK_H;
    expect(ChatBot.geo({ h: (a + b) / 2, entering: 1 }).eyes.d).toBe('');
    expect(ChatBot.geo({ h: (a + b) / 2, entering: 0 }).eyes.d).not.toBe('');
    expect(ChatBot.geo({ h: 1 }).eyes.d).not.toBe('');
    expect(flatten(String(ChatBot.geo({ h: 1 }).eyes.d)).length).toBe(2);
  });
  it('grows the face 1px a side, widens the smile 2px a side and lifts the eyes so their space to it holds', () => {
    for (const h of STEPS) {
      const fc = botFace(h);
      for (const eye of fc.eyes)
        expect(eyeGap(eye, 2, fc.smile), `h=${h}`).toBeCloseTo(BOT_EYE_GAP, 3);
    }
    const full = botFace(1);
    expect(full.smile.r).toBeCloseTo(7, 6);
    expect(full.eyes[1][0] - full.eyes[0][0]).toBeCloseTo((8 * 7) / 6, 6);
    expect(bbox(String(ChatBot.geo({ h: 1 }).bubble.d))).toEqual([
      0, 32, 0, 30,
    ]);
    expect(
      runs(flatten(String(ChatBot.geo({ h: 1 }).bubble.d)), [8, -1], [8, 6])
    ).toEqual([expect.closeTo(2, 2)]);
  });
});

describe('Money, Wallet', () => {
  it('Money: the note lifts 2px and widens 1px a side, its dots riding out with its sides', () => {
    expect(bbox(String(Money.geo({ h: 1 }).note.d))).toEqual([1, 31, 2, 18]);
    const polys = flatten(String(Money.geo({ h: 1 }).note.d));
    expect(runs(polys, [0, 10], [5, 10])).toEqual([expect.closeTo(2, 2)]);
    expect(runs(polys, [0, 10], [10, 10])).toEqual([
      expect.closeTo(2, 2),
      expect.closeTo(4, 2),
    ]); // the wall, then the dot (r 2 about (7, 10))
  });
  it('Wallet: every wall steps 1px out and the clasp widens 2px to the left, the walls 2px', () => {
    for (const h of STEPS) {
      const polys = flatten(String(Wallet.geo({ h }).wallet.d));
      expect(bbox(String(Wallet.geo({ h }).wallet.d)), `h=${h}`).toEqual([
        2 - h,
        30 + h,
        3 - h,
        28 + h,
      ]);
      // Along y 18: the left wall, the clasp's left wall (x 18 − 2h … 20 − 2h), the right wall.
      const r = runs(polys, [0, 18], [32, 18]);
      expect(r, `h=${h}`).toEqual([
        expect.closeTo(2, 2),
        expect.closeTo(2, 2),
        expect.closeTo(2, 2),
      ]);
      expect(inked(polys, [19 - 2 * h, 18]), `clasp h=${h}`).toBe(true);
    }
  });
});

describe('Chemistry', () => {
  it('tilts the flask 12° clockwise and grows it 1px; the liquid stays level throughout', () => {
    for (const h of STEPS) {
      const { grow, tilt, surface } = flaskAt(h);
      expect(grow).toBe(h);
      expect(tilt).toBeCloseTo(FLASK_TILT * h, 9);
      expect(tilt + surface).toBeCloseTo(0, 9);
    }
    // At constant weight, grown 1px at the caps: down the middle with the surface level, the top bar, surface and base are 2px each.
    for (const g of STEPS) {
      const d = flaskD(g, 0);
      expect(bbox(d)[2], `top g=${g}`).toBeCloseTo(2 - g, 2);
      expect(bbox(d)[3], `base g=${g}`).toBeCloseTo(30 + g, 2);
      expect(runs(flatten(d), [16, 0], [16, 32]), `g=${g}`).toEqual([
        expect.closeTo(2, 1),
        expect.closeTo(2, 1),
        expect.closeTo(2, 1),
      ]);
    }
  });
  it('keeps the surface a 2px band cut to the walls, 2px clear of the neck at every slosh', () => {
    let least = Infinity;
    for (let i = 0; i <= 100; i++) {
      const { grow, surface } = flaskAt(i / 100);
      const d = flaskD(grow, surface);
      const subs = d.split(/(?=M)/);
      const band = subs[subs.length - 1];
      const s = 1 + FLASK_GROW * grow;
      const feet: Pt[] = [
        [16 - 2 * s, 16 + (14.3252 - 16) * s],
        [16 + 2 * s, 16 + (14.3252 - 16) * s],
      ];
      for (const [x, y] of outline(band))
        for (const [u, v] of feet)
          least = Math.min(least, Math.hypot(x - u, y - v));
      // Across the band, square to it at its middle: 2px.
      const a = (surface * Math.PI) / 180;
      const n: Pt = [-Math.sin(a), Math.cos(a)];
      expect(
        runs(
          flatten(d),
          [16 - n[0] * 1.6, 19 - n[1] * 1.6],
          [16 + n[0] * 1.6, 19 + n[1] * 1.6]
        ),
        `band ${i}`
      ).toEqual([expect.closeTo(2, 1)]);
    }
    expect(least).toBeGreaterThan(2);
  });
});

describe('Compass', () => {
  it("is Explore's motion: the needle swings to −61°, settles at −45° (north) and stays; the ring grows 1px", () => {
    const peak = Math.min(
      ...Array.from({ length: 101 }, (_, i) => compassAt(i / 100).deg)
    );
    expect(peak).toBeCloseTo(-61, 1);
    expect(compassAt(1).deg).toBeCloseTo(-45, 6);
    for (const h of STEPS) {
      expect(compassAt(h, 0).deg).toBeCloseTo(-45 * compassAt(h, 0).ring, 6);
      const g = compassAt(h).ring;
      for (const r of radii(String(Compass.geo({ h }).ring.d), C))
        expect(near(r, [12 + g, 14 + g]), `ring h=${h}`).toBe(true);
    }
  });
  it('cuts the needle 2px clear of the north dot wherever they meet; the dot doubles and rises onto the ring', () => {
    for (let i = 0; i <= 50; i++) {
      const s = Compass.geo({ h: i / 50, entering: 1 });
      expect(
        gap(String(s.needle.d), String(s.north.d)),
        `h=${i / 50}`
      ).toBeGreaterThan(1.95);
    }
    expect(northDot(0)).toEqual({ c: [16, 7.5], r: 1.5 });
    expect(northDot(1)).toEqual({ c: [16, 2], r: 3 });
    // Nothing of it passes the ring's outside edge, at any frame; at rest it's Carbon's whole dot.
    for (let i = 0; i <= 50; i++) {
      const h = i / 50;
      const g = compassAt(h).ring;
      for (const r of radii(String(Compass.geo({ h }).north.d), C))
        expect(r, `h=${h}`).toBeLessThan(14 + g + 2e-3);
    }
    expect(Compass.geo({ h: 0 }).north.d).toBe(circleD([16, 7.5], 1.5));
    // Fully hovered its centre is on the grown ring's centreline (r 14).
    expect(Math.hypot(northDot(1).c[0] - 16, northDot(1).c[1] - 16)).toBe(14);
    // Pointing north under the risen dot, the needle runs its full length (to 8.9 from the centre), 2.1px clear.
    const bars = needleBars(-45, northDot(1));
    expect(bbox(bars)[2]).toBeCloseTo(16 - Math.hypot(6.295, 6.295), 2);
    expect(runs(flatten(bars), [14, 20], [18, 20])).toEqual([
      expect.closeTo(2, 2),
    ]);
  });
});

describe('Hourglass', () => {
  it('drops the sand line 2px and each grain a place, sinks the lower one into the floor and grows a new one at the neck, in a glass grown 1px', () => {
    for (const h of STEPS) {
      const d = String(Hourglass.geo({ h }).glass.d);
      const polys = flatten(d);
      const s = 1 + HOURGLASS_GROW * h;
      const at = (y: number) => 16 + (y - 16) * s;
      expect(bbox(d)[2], `top h=${h}`).toBeCloseTo(2 - h, 2);
      expect(bbox(d)[3], `bottom h=${h}`).toBeCloseTo(30 + h, 2);
      // Down the middle above the neck: the cap, then the sand line (2px each), the line 2h lower.
      const r = runs(polys, [16, 0], [16, at(15.6)]);
      expect(r, `h=${h}`).toEqual([expect.closeTo(2, 1), expect.closeTo(2, 1)]);
      expect(inked(polys, [16, at(12 + 2 * h)]), `sand h=${h}`).toBe(true);
      // The grains keep at least 2px between them.
      const g = grainsAt(h).sort((a, b) => a.c[1] - b.c[1]);
      for (let k = 1; k < g.length; k++)
        expect(
          g[k].c[1] - g[k].side / 2 - (g[k - 1].c[1] + g[k - 1].side / 2),
          `grains h=${h}`
        ).toBeGreaterThanOrEqual(2 - 1e-9);
    }
    // Fully hovered: the lower grain is all in the floor (nothing above it), the others a place down.
    const polys = flatten(String(Hourglass.geo({ h: 1 }).glass.d));
    const at = (y: number) => 16 + (y - 16) * (1 + HOURGLASS_GROW);
    expect(inked(polys, [16, at(28) - 0.3])).toBe(false);
    expect(inked(polys, [16, at(24)])).toBe(true);
    expect(inked(polys, [16, at(20)])).toBe(true);
  });
});

describe('Lightning', () => {
  it("is Flash's drawing and hover", () => {
    for (const h of STEPS)
      expect(Lightning.geo({ h })).toEqual(Flash.geo({ h }));
  });
});

describe('Phone', () => {
  it('grows the handset from its centre at constant weight, 1px out a side', () => {
    const want = weightScaleLoops(
      PHONE_LOOPS,
      PHONE_SIDES,
      PHONE_C,
      1 + PHONE_GROW
    );
    const got = flatten(String(Phone.geo({ h: 1 }).solid.d));
    expect(got.map((p) => p.pts.length)).toEqual(want.map((p) => p.length));
    got.forEach((poly, i) =>
      poly.pts.forEach((p, j) =>
        expect(
          Math.hypot(p[0] - want[i][j][0], p[1] - want[i][j][1])
        ).toBeLessThan(2e-3)
      )
    );
    const [x0, x1, y0, y1] = bbox(String(Phone.geo({ h: 1 }).solid.d));
    expect([x0, x1, y0, y1].map((v) => Math.round(v * 10) / 10)).toEqual([
      2, 30, 2, 30,
    ]);
  });
  it('scales at constant weight both ways (the hover grows 14/13, Phone off shrinks to 90%): every wall keeps its width', () => {
    const width = (loops: Pt[][]) =>
      loops[0].map((p) =>
        Math.min(...loops[1].map((q) => Math.hypot(p[0] - q[0], p[1] - q[1])))
      );
    const w0 = width(PHONE_LOOPS);
    for (const s of [0.9, 1 + PHONE_GROW]) {
      const w1 = width(weightScaleLoops(PHONE_LOOPS, PHONE_SIDES, PHONE_C, s));
      let worst = 0;
      w0.forEach((w, i) => {
        if (w > 2.2) return; // the cord's end and the earpiece's corners, where the hole isn't across the wall
        worst = Math.max(worst, Math.abs(w1[i] - w));
      });
      expect(worst, `s=${s}`).toBeLessThan(0.03);
    }
  });
});

describe('Connection signal', () => {
  it('pulses out one wavelength on the way in and lands on the resting drawing risen 2px; leaving, it lowers at rest', () => {
    grid(32);
    const raised = signalShapes({ h: 1, p: 0, e: 0, entering: 0 });
    expect(
      delta(cover(ConnectionSignal.geo({ h: 1 })), cover(raised))
    ).toBeLessThan(0.002);
    expect(
      delta(
        cover(ConnectionSignal.geo({ h: 0.5 })),
        cover(signalShapes({ h: 0.5, p: 0, e: 0, entering: 0 }))
      )
    ).toBeGreaterThan(0.05);
    // The mast's top rises 2px (its foot holds); the waves' tops with it.
    for (const h of STEPS) {
      const mast = flatten(
        String(signalShapes({ h, p: 0, e: 0, entering: 0 }).fill.d)
      )[0].pts;
      expect(Math.min(...mast.map(([, y]) => y)), `h=${h}`).toBeCloseTo(
        12 - SIGNAL_RISE * h,
        3
      );
      expect(Math.max(...mast.map(([, y]) => y)), `h=${h}`).toBeCloseTo(30, 3);
    }
    // In the toggle, the rise fades as the slash draws: the off end is the approved Off icon.
    expect(signalShapes({ h: 1, p: 1, e: 0, pulse: 1 })).toEqual(
      ConnectionSignalOff.geo({ h: 1 })
    );
  });
  it('keeps the travelling waves 2px apart (and the emerging one further), and trims the outgoing ones to a quarter before they blink off', () => {
    for (const q of STEPS) {
      const { travelling: t, outgoing: o, emerging: n } = signalPulse(q);
      // Along the horizontal, on the left: the space between each wave and the next one out.
      const outer = (w: typeof t) => 16 - w.dx - (w.r + 1);
      const inner = (w: typeof t) => 16 - w.dx - (w.r - 1);
      if (o.half > 0)
        expect(outer(t) - inner(o), `q=${q}`).toBeGreaterThanOrEqual(2 - 1e-9);
      expect(outer(n) - inner(t), `q=${q}`).toBeGreaterThanOrEqual(2 - 1e-9);
      if (q >= OUTGOING_GONE) expect(o.half).toBe(0);
      // Trimmed to no less than half, then off in one step.
      if (q < OUTGOING_GONE)
        expect(o.half, `q=${q}`).toBeGreaterThanOrEqual(
          signalPulse(0).outgoing.half / 4
        );
      if (q < OUTGOING_GONE)
        expect(o.half, `q=${q}`).toBeCloseTo(
          signalPulse(0).outgoing.half * (1 - (0.75 * q) / OUTGOING_GONE),
          9
        );
    }
    // Every wave in the drawing is a 2px wall (but the emerging wedge): radii r ± 1 about its centre.
    const polys = flatten(
      String(ConnectionSignal.geo({ h: 0.4 }).fill.d)
    ).slice(1);
    const { travelling: t } = signalPulse(0.4);
    const rs = polys[0].pts.map(([x, y]) =>
      Math.hypot(x - (16 - t.dx), y - (13 - SIGNAL_RISE * 0.4))
    );
    expect(Math.min(...rs)).toBeCloseTo(t.r - 1, 2);
    expect(Math.max(...rs)).toBeCloseTo(t.r + 1, 2);
  });
});

describe('Previous', () => {
  it('is Next mirrored: the ring grows 1px and the arrow reaches 2px left, its tail holding', () => {
    for (const h of STEPS) {
      expect(previousArrow(h)).toEqual(
        nextArrow(h).map(([x, y]) => [32 - x, y])
      );
      for (const r of radii(String(PreviousOutline.geo({ h }).ring.d), C))
        expect(near(r, [12 + h, 14 + h]), `ring h=${h}`).toBe(true);
    }
  });
});

// ── Toggles ──────────────────────────────────────────────────────────────────

type AnyToggle =
  | FrameToggleIcon<'outline' | 'filled'>
  | FrameToggleIcon<'on' | 'off'>;
const TOGGLES: {
  name: string;
  toggle: AnyToggle;
  ends: [FrameHoverIcon, FrameHoverIcon];
  statics: [CarbonIcon, CarbonIcon];
  slash?: boolean;
}[] = [
  {
    name: 'FaceSatisfiedToggle',
    toggle: FaceSatisfiedToggle,
    ends: [FaceSatisfied, FaceSatisfiedFilled],
    statics: [CFaceSatisfied, CFaceSatisfiedFilled],
  },
  {
    name: 'PreviousToggle',
    toggle: PreviousToggle,
    ends: [PreviousOutline, PreviousFilled],
    statics: [CPreviousOutline, CPreviousFilled],
  },
  {
    name: 'PhoneOffToggle',
    toggle: PhoneOffToggle,
    ends: [Phone, PhoneOff],
    statics: [CPhone, CPhoneOff],
    slash: true,
  },
  {
    name: 'ConnectionSignalOffToggle',
    toggle: ConnectionSignalOffToggle,
    ends: [ConnectionSignal, ConnectionSignalOff],
    statics: [CConnectionSignal, CConnectionSignalOff],
    slash: true,
  },
];

describe.each(TOGGLES)('$name', ({ toggle, ends, statics, slash }) => {
  it('keeps the same shape keys across h, p and e at every size, never paints NaN or Infinity, and stays inside 36×36', () => {
    // The slash toggles' e runs the kick (0 → 1) and the recoil (0 → −1).
    const es = slash
      ? [-1, -0.5, 0, 0.25, 0.4, 0.6, 1]
      : [0, 0.25, 0.5, 0.75, 1];
    for (const size of SIZES) {
      const rest = Object.keys(toggle.geo({ h: 0, p: 0, e: 0 }, size));
      for (const h of [0, 0.5, 1]) {
        for (const p of [0, 0.25, 0.5, 0.75, 1]) {
          for (const e of es) {
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
  }, 60_000);

  it('equals its hover icons at both ends, at every h and size', () => {
    for (const size of SIZES) {
      for (const h of STEPS) {
        expect(
          toggle.geo({ h, p: 0, e: 0 }, size),
          `first h=${h} @${size}`
        ).toEqual(ends[0].geo({ h }, size));
        expect(
          toggle.geo({ h, p: 1, e: 0 }, size),
          `second h=${h} @${size}`
        ).toEqual(ends[1].geo({ h }, size));
      }
    }
  });

  it("rests on Carbon's two icons, and passes through neither in between", () => {
    grid(32);
    const at = (p: number, e: number, h = 0) =>
      cover(toggle.geo({ h, p, e }, 32));
    expect(delta(at(0, 0), coverCarbon(statics[0], 32))).toBeLessThan(GATE);
    expect(delta(at(1, 0), coverCarbon(statics[1], 32))).toBeLessThan(GATE);
    expect(delta(at(0.5, 0), at(0, 0))).toBeGreaterThan(0.02);
    expect(delta(at(0.5, 0), at(1, 0))).toBeGreaterThan(0.02);
    // A fill toggle fully emptied is the outline again (before the engine resets p and e).
    if (!slash)
      for (const h of [0, 1])
        expect(delta(at(1, 1, h), at(0, 0, h)), `h=${h}`).toBeLessThan(0.002);
  });

  it('renders animated with no masks or clip paths', () => {
    const T = toggle as FrameToggleIcon<string>;
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
