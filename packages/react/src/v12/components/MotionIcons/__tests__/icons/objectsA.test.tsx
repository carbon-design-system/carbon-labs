/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  Bot as CBot,
  Catalog as CCatalog,
  Cloud as CCloud,
  CloudOffline as CCloudOffline,
  Email as CEmail,
  Printer as CPrinter,
  Rocket as CRocket,
  Security as CSecurity,
  Terminal as CTerminal,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type {
  CarbonIcon,
  FrameHoverIcon,
  FrameToggleIcon,
  Shapes,
  ToggleFrame,
} from '../../utils/frameIcon';
import { mapPath, type Pt } from '@carbon-labs/motion-icons-core/geometry';
import { kickAmount } from '@carbon-labs/motion-icons-core/utils/slashToggle';
import {
  Bot,
  BOT_DROP,
  BOT_PIVOT,
  BOT_TILT,
  botGeo,
  Catalog,
  Cloud,
  CloudOffline,
  CloudOfflineToggle,
  Email,
  OFFLINE_CENTRE,
  Printer,
  PROMPT_SLIDE,
  Rocket,
  BACK_HANDOFF,
  ROCKET_RISE,
  ROLL_FRAMES,
  rocketFins,
  Security,
  Terminal,
} from '../../icons/assorted/objectsA';

/**
 * Common objects, part A (objectsA.ts): Email, Cloud, Cloud offline,
 * Catalog, Security, Bot, Rocket, Terminal, Printer and the Cloud offline
 * toggle.
 *
 * Coverage is compared as in deviceToggles.test.tsx (the same sampler,
 * copied; these icons are all filled paths): both drawings sampled at 8×8
 * per parity pixel, Δ the share of ink pixels whose coverage differs by more
 * than a quarter, gated at 0.5%. Constant weight is measured on the sampled
 * ink: a probe walks a ray across a wall wherever the motion has moved it,
 * and reads the length of the first run of ink. Parts that should keep
 * apart are measured edge to edge.
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
 * size, so 8/size units) at 8×8 samples each, over −2…34 (pixel-aligned at
 * 0). `grid(size)` sets it before a comparison.
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

/**
 * The parity story's Δ: each pixel's coverage from its 8×8 samples; the
 * share of ink pixels whose coverage differs by more than a quarter. `clip`
 * keeps to the 32-unit box (the story renders with overflow hidden).
 */
function delta(a: Uint8Array, b: Uint8Array, clip = false): number {
  const [S, P] = [SUB, N / SUB];
  const inBox = (q: number) =>
    !clip || (at(q * S) >= 0 && at(q * S + S - 1) <= 32);
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

/** Frame-engine shapes (all filled paths here), sampled. */
function cover(shapes: Shapes): Uint8Array {
  const ink = new Uint8Array(N * N);
  for (const a of Object.values(shapes))
    fillInto(ink, flatten(String(a.d ?? '')), a.fillRule === 'evenodd');
  return ink;
}

/** Carbon's element transforms (rotate(a cx cy), translate(x y)) as a point map. */
function carbonTransform(t: string | null): (p: Pt) => Pt {
  if (!t) return (p) => p;
  const nums = (t.match(/[-+]?(?:\d+\.?\d*|\.\d+)/g) ?? []).map(Number);
  if (t.startsWith('rotate')) {
    const [a, cx = 0, cy = 0] = nums;
    const [c, s] = [
      Math.cos((a * Math.PI) / 180),
      Math.sin((a * Math.PI) / 180),
    ];
    return ([x, y]) => [
      cx + (x - cx) * c - (y - cy) * s,
      cy + (x - cx) * s + (y - cy) * c,
    ];
  }
  if (t.startsWith('translate')) {
    const [tx, ty = 0] = nums;
    return ([x, y]) => [x + tx, y + ty];
  }
  throw new Error(`transform: ${t}`);
}

/** A Carbon icon at a size, sampled in the 32-unit grid. */
function coverCarbon(Icon: CarbonIcon, size: number): Uint8Array {
  const { container, unmount } = render(<Icon size={size} />);
  const svg = container.querySelector('svg')!;
  const vb = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const ink = new Uint8Array(N * N);
  svg.querySelectorAll('path').forEach((el) => {
    if (el.getAttribute('fill') === 'none') return;
    const tf = carbonTransform(el.getAttribute('transform'));
    const polys = flatten(el.getAttribute('d')!).map(({ pts, closed }) => ({
      pts: pts
        .map((q) => tf(q))
        .map(([x, y]) => [(x * 32) / vb, (y * 32) / vb] as Pt),
      closed,
    }));
    fillInto(ink, polys, el.getAttribute('fill-rule') === 'evenodd');
  });
  unmount();
  return ink;
}

/** The length of the first run of `want` (1 ink, 0 empty) along the ray from `from` in direction `dir` (unit), over `len` units. */
function run(
  ink: Uint8Array,
  from: Pt,
  dir: Pt,
  len: number,
  want: 0 | 1
): number {
  const ds = STEP / 4;
  let [start, end] = [NaN, NaN];
  for (let s = 0; s <= len; s += ds) {
    const [x, y] = [from[0] + dir[0] * s, from[1] + dir[1] * s];
    const [k, j] = [Math.floor((x - LO) / STEP), Math.floor((y - LO) / STEP)];
    const v = k >= 0 && j >= 0 && k < N && j < N ? ink[j * N + k] : 0;
    if (v === want && Number.isNaN(start)) start = s;
    if (v !== want && !Number.isNaN(start)) {
      end = s;
      break;
    }
  }
  if (Number.isNaN(start)) return 0;
  return (Number.isNaN(end) ? len : end) - start;
}

const noNaN = (shapes: Shapes, where: string) => {
  for (const [k, attrs] of Object.entries(shapes)) {
    for (const [a, v] of Object.entries(attrs))
      expect(
        /NaN|Infinity|undefined/.test(String(v)),
        `${k}.${a} at ${where}`
      ).toBe(false);
  }
};

// ── Cases ────────────────────────────────────────────────────────────────────

const SIZES = [16, 20, 24, 32];
const STEPS = [0, 0.1, 0.25, 0.4, 0.5, 0.75, 0.9, 1];
const GATE = 0.005;

type Probe = { from: Pt; dir: Pt; want: 0 | 1; w: number };
const [RIGHT, LEFT, DOWN, UP]: Pt[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
/** A 2px wall whose centreline passes `c`, met along `dir` from 3 units before it. */
const wallAt = (c: Pt, dir: Pt, w = 2): Probe => ({
  from: [c[0] - 3 * dir[0], c[1] - 3 * dir[1]],
  dir,
  want: 1,
  w,
});
const unit = (a: Pt, b: Pt): Pt => {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
};
/** A wall across the segment a–b at its middle (the probe runs along the segment's right-hand normal: up, for a segment running right). */
const across = (a: Pt, b: Pt): Probe => {
  const u = unit(a, b);
  return wallAt([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], [u[1], -u[0]]);
};
const rot =
  (deg: number, [cx, cy]: Pt) =>
  ([x, y]: Pt): Pt => {
    const [c, s] = [
      Math.cos((deg * Math.PI) / 180),
      Math.sin((deg * Math.PI) / 180),
    ];
    return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
  };
/** A point in the rocket's axis coordinates (a along x + y = 32, b across), in the drawing's. */
const fromAxis = ([a, b]: Pt): Pt => [
  (a + b) / Math.SQRT2 + 16,
  (b - a) / Math.SQRT2 + 16,
];
const scaleAbout =
  (k: number, [cx, cy]: Pt) =>
  ([x, y]: Pt): Pt => [cx + (x - cx) * k, cy + (y - cy) * k];

/** Cloud's walls at hover k (its centrelines scaled about the base's middle, 16 27). */
const cloudWalls = (k: number, at: (q: Pt) => Pt = (q) => q): Probe[] => [
  wallAt(at([16 - 15 * k, 27 - 6.5 * k]), RIGHT), // the left lobe's outermost point
  wallAt(at([16, 27 - 21 * k]), DOWN), // the top
  wallAt(at([16, 27]), UP), // the base
];
/** Cloud offline's walls (the left lobe, the top, the base), moved by the off shrink and the kick. */
const offlineWalls = (at: (q: Pt) => Pt): Probe[] => [
  wallAt(at([3, 18.5]), RIGHT),
  wallAt(at([16, 6]), DOWN),
  wallAt(at([16, 24]), UP),
];
/** A point of the off art at a frame: moved by the off shrink (90% at h p = 1) and by the kick. */
const moved = ([x, y]: Pt, { h, p, e }: ToggleFrame, centre: Pt): Pt => {
  const k = 1 - 0.1 * h * p;
  return [
    centre[0] + (x - centre[0]) * k - 2 * kickAmount(e),
    centre[1] + (y - centre[1]) * k,
  ];
};

interface HoverCase {
  name: string;
  icon: FrameHoverIcon;
  carbon: CarbonIcon;
  probes: (h: number) => Probe[];
  /** Shape keys that never touch: [a, b, the least gap allowed]. */
  apart?: [string, string, number][];
}
const HOVERS: HoverCase[] = [
  {
    name: 'Email',
    icon: Email,
    carbon: CEmail,
    probes: (h) => {
      const [g, d] = [2 * h, 4 * h];
      return [
        wallAt([3 - g, 16], RIGHT),
        wallAt([16, 25 + g], UP),
        across([3, 7 + d], [16, 16 + d]),
        across([16, 16 + d], [29, 7 + d]),
      ];
    },
  },
  {
    name: 'Cloud',
    icon: Cloud,
    carbon: CCloud,
    probes: (h) => cloudWalls(1 + h / 15),
  },
  {
    name: 'CloudOffline',
    icon: CloudOffline,
    carbon: CCloudOffline,
    probes: (h) =>
      offlineWalls((q) => moved(q, { h, p: 1, e: 0 }, OFFLINE_CENTRE)),
  },
  {
    name: 'Catalog',
    icon: Catalog,
    carbon: CCatalog,
    probes: (h) => [
      wallAt([7 - 2 * h, 12], RIGHT),
      wallAt([27 + 2 * h, 20], LEFT),
      wallAt([20, 3 - 2 * h], DOWN),
      wallAt([18, 9 - h], DOWN),
      wallAt([5 - 2 * h, 16], DOWN),
    ],
    apart: [['entries', 'cover', 3.9]],
  },
  {
    name: 'Security',
    icon: Security,
    carbon: CSecurity,
    probes: (h) => {
      const s = scaleAbout(1 + (2 / 22) * h, [16, 16]);
      const c = scaleAbout(1 + 0.12 * h, [16, 14.705]);
      return [
        wallAt(s([5, 10]), RIGHT),
        wallAt(s([16, 3]), DOWN),
        wallAt(s([27, 12]), LEFT),
        across(c([14, 18]), c([21.295, 10.705])),
        across(c([10.705, 14.705]), c([14, 18])),
      ];
    },
    apart: [['check', 'shield', 3.5]],
  },
  {
    name: 'Bot',
    icon: Bot,
    carbon: CBot,
    probes: (h) => {
      const turned = rot(BOT_TILT * h, BOT_PIVOT);
      const r = (q: Pt): Pt => [turned(q)[0], turned(q)[1] + BOT_DROP * h];
      const t = rot(BOT_TILT * h, [0, 0]);
      return [
        wallAt([5, 26], RIGHT),
        wallAt([16, 21], UP),
        wallAt(r([16, 7]), t(DOWN)),
        wallAt(r([9, 14]), t(RIGHT)),
        wallAt(r([13, 4]), t(RIGHT)),
        wallAt([12, 19.5], RIGHT),
      ];
    },
    apart: [
      ['head', 'body', 0.4],
      ['eyes', 'head', 1.9],
    ],
  },
  {
    // The trail (the front fin edge-on) at rest; the front-left fin's arm and leg early in the roll, while clear of everything.
    name: 'Rocket',
    icon: Rocket,
    carbon: CRocket,
    probes: (h) => {
      const f = ROLL_FRAMES * h;
      if (f > 3) return [];
      const [r, c, t, s] = rocketFins(f).left.pts.map(([a, b]) =>
        fromAxis([a + ROCKET_RISE * h, b])
      );
      return [
        across(c, r),
        across(s, t),
        ...(h ? [] : [wallAt([10, 22], [Math.SQRT1_2, Math.SQRT1_2])]),
      ];
    },
  },
  {
    name: 'Terminal',
    icon: Terminal,
    carbon: CTerminal,
    // The "/" is 2px across, so 2.21 wide along its flat cuts (once it has drawn past y 19).
    probes: (h) => [
      wallAt([5 - 2 * h, 20], RIGHT),
      wallAt([16, 11 - 2 * h], DOWN),
      across(
        [11.465 - PROMPT_SLIDE * h, 15.475],
        [14.995 - PROMPT_SLIDE * h, 19.01]
      ),
      ...(h >= 0.75 ? [wallAt([22 - PROMPT_SLIDE * h, 19], RIGHT, 2.21)] : []),
    ],
    apart: [
      ['caret', 'window', 2.7],
      ['glyph', 'caret', 3.5],
      ['glyph', 'window', 1],
    ],
  },
  {
    name: 'Printer',
    icon: Printer,
    carbon: CPrinter,
    probes: (h) => [
      wallAt([3, 16], RIGHT),
      wallAt([16, 28 + 2 * h], UP),
      wallAt([8, 25 + 2 * h], RIGHT),
      wallAt([16, 4], DOWN),
      wallAt([16, 16], DOWN),
    ],
  },
];

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

// ── Edge-to-edge distance between two shapes ────────────────────────────────

function segDist(a: Pt, b: Pt, c: Pt, d: Pt): number {
  const ptSeg = (p: Pt, q: Pt, r: Pt) => {
    const [dx, dy] = [r[0] - q[0], r[1] - q[1]];
    const l2 = dx * dx + dy * dy;
    const t = l2
      ? Math.max(0, Math.min(1, ((p[0] - q[0]) * dx + (p[1] - q[1]) * dy) / l2))
      : 0;
    return Math.hypot(p[0] - q[0] - t * dx, p[1] - q[1] - t * dy);
  };
  const cross = (o: Pt, p: Pt, q: Pt) =>
    (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const [d1, d2, d3, d4] = [
    cross(c, d, a),
    cross(c, d, b),
    cross(a, b, c),
    cross(a, b, d),
  ];
  if (d1 * d2 < 0 && d3 * d4 < 0) return 0;
  return Math.min(
    ptSeg(a, c, d),
    ptSeg(b, c, d),
    ptSeg(c, a, b),
    ptSeg(d, a, b)
  );
}
/** The least distance between the outlines of two shapes' paths (0 if they cross). */
function gap(a: string, b: string): number {
  const edges = (d: string) =>
    flatten(d).flatMap(({ pts }) =>
      pts.map((p, i) => [p, pts[(i + 1) % pts.length]] as [Pt, Pt])
    );
  const [ea, eb] = [edges(a), edges(b)];
  let best = Infinity;
  for (const [p, q] of ea)
    for (const [r, s] of eb) best = Math.min(best, segDist(p, q, r, s));
  return best;
}

describe.each(HOVERS)('$name', ({ icon, carbon, probes, apart }) => {
  it('keeps the same shape keys at every h and size, and never paints NaN or Infinity', () => {
    for (const size of SIZES) {
      const rest = Object.keys(icon.geo({ h: 0 }, size)).sort();
      for (const h of STEPS) {
        const shapes = icon.geo({ h }, size);
        expect(Object.keys(shapes).sort(), `h=${h} @${size}`).toEqual(rest);
        noNaN(shapes, `h=${h} @${size}`);
      }
    }
  });

  it("rests on Carbon's icon at 16, 20, 24 and 32 (within 0.5%, as the parity story measures)", () => {
    for (const size of SIZES) {
      grid(size);
      expect(
        delta(cover(icon.geo({ h: 0 }, size)), coverCarbon(carbon, size), true),
        `@${size}`
      ).toBeLessThan(GATE);
    }
  });

  it('moves on hover at constant line weight (filled paths only, measured walls hold)', () => {
    expect(JSON.stringify(icon.geo({ h: 0.5 }))).not.toBe(
      JSON.stringify(icon.geo({ h: 0 }))
    );
    grid(32);
    for (const h of STEPS) {
      const shapes = icon.geo({ h });
      for (const [k, a] of Object.entries(shapes)) {
        expect(a.transform, k).toBeUndefined();
        expect(a.strokeWidth, k).toBeUndefined();
        expect(a.stroke, k).toBeUndefined();
      }
      const ink = cover(shapes);
      probes(h).forEach(({ from, dir, want, w }, i) =>
        expect(
          Math.abs(run(ink, from, dir, 12, want) - w),
          `probe ${i} h=${h}`
        ).toBeLessThan(0.1)
      );
    }
  });

  it.runIf(!!apart)('keeps its separate parts apart at every h', () => {
    for (const [a, b, least] of apart ?? []) {
      for (const h of STEPS) {
        const shapes = icon.geo({ h });
        expect(
          gap(String(shapes[a].d), String(shapes[b].d)),
          `${a}–${b} h=${h}`
        ).toBeGreaterThan(least);
      }
    }
  });

  it('stays within 36×36 (−2…34) at every h', () => {
    for (const h of STEPS) {
      const pts = Object.values(icon.geo({ h })).flatMap((a) =>
        flatten(String(a.d ?? '')).flatMap((q) => q.pts)
      );
      for (const [x, y] of pts) {
        expect(x).toBeGreaterThanOrEqual(-2);
        expect(x).toBeLessThanOrEqual(34);
        expect(y).toBeGreaterThanOrEqual(-2);
        expect(y).toBeLessThanOrEqual(34);
      }
    }
  });

  it('renders animated and static, with no masks or clip paths', () => {
    const Icon = icon;
    const { container } = render(
      <MotionIconProvider animated>
        <Icon aria-label="i" />
      </MotionIconProvider>
    );
    const svg = container.querySelector('svg')!;
    expect(svg.querySelector('mask, clipPath')).toBeNull();
    expect(svg.querySelectorAll('[data-k]').length).toBe(
      Object.keys(icon.geo({ h: 0 })).length
    );
    // animated={false}: Carbon's art where the icon has one (decision 5), else the rest geometry.
    const still = render(<Icon animated={false} aria-label="i" />).container;
    expect(
      still.querySelector(
        (Icon as { static?: unknown }).static ? 'svg' : 'svg [data-k]'
      )
    ).not.toBeNull();
    if ((Icon as { static?: unknown }).static)
      expect(still.querySelector('[data-k]')).toBeNull();
  });
});

// ── The Cloud offline toggle ─────────────────────────────────────────────────

const frames = STEPS.flatMap((h) =>
  STEPS.flatMap((p) =>
    STEPS.flatMap((e) => [
      { h, p, e },
      { h, p, e: -e },
    ])
  )
);
const T = CloudOfflineToggle as unknown as FrameToggleIcon<string>;

describe('CloudOfflineToggle', () => {
  it('keeps the same shape keys at every frame and size (kick and recoil included), and never paints NaN or Infinity', () => {
    for (const size of SIZES) {
      const rest = Object.keys(T.geo({ h: 0, p: 0, e: 0 }, size)).sort();
      for (const fr of frames) {
        const shapes = T.geo(fr, size);
        expect(
          Object.keys(shapes).sort(),
          `${JSON.stringify(fr)} @${size}`
        ).toEqual(rest);
        noNaN(shapes, `${JSON.stringify(fr)} @${size}`);
      }
    }
  });

  it("rests on Carbon's Cloud and Cloud offline at every size (within 0.5%)", () => {
    for (const size of SIZES) {
      grid(size);
      for (const [p, c] of [
        [0, CCloud],
        [1, CCloudOffline],
      ] as const)
        expect(
          delta(
            cover(T.geo({ h: 0, p, e: 0 }, size)),
            coverCarbon(c, size),
            true
          ),
          `p=${p} @${size}`
        ).toBeLessThan(GATE);
    }
  });

  it('both ends are the hover icons exactly, at every h and size', () => {
    for (const size of SIZES) {
      for (const h of STEPS) {
        expect(T.geo({ h, p: 0, e: 0 }, size)).toEqual(Cloud.geo({ h }, size));
        expect(T.geo({ h, p: 1, e: 0 }, size)).toEqual(
          CloudOffline.geo({ h }, size)
        );
      }
    }
  });

  it('keeps its line weight through hover, toggle, kick and recoil (filled paths only; measured walls hold)', () => {
    grid(32);
    // The kick (left) runs as the cloud reaches cloud offline's size, the recoil (right) as it leaves it.
    for (const fr of STEPS.flatMap((h) => [
      { h, p: 0, e: 0 },
      { h, p: 0, e: -0.5 },
      { h, p: 1, e: 0 },
      { h, p: 1, e: 0.5 },
      { h, p: 1, e: -0.5 },
    ])) {
      const shapes = T.geo(fr);
      for (const a of Object.values(shapes))
        expect(a.strokeWidth ?? a.transform ?? a.stroke).toBeUndefined();
      const ink = cover(shapes);
      const probes = fr.p
        ? offlineWalls((q) => moved(q, fr, OFFLINE_CENTRE))
        : cloudWalls(1 + fr.h / 15).map((pr) => ({
            ...pr,
            from: moved(pr.from, fr, OFFLINE_CENTRE),
          }));
      probes.forEach(({ from, dir, want, w }, i) =>
        expect(
          Math.abs(run(ink, from, dir, 12, want) - w),
          `probe ${i} ${JSON.stringify(fr)}`
        ).toBeLessThan(0.1)
      );
    }
    // Mid-toggle, the cloud's left lobe is a 2px wall wherever it has got to.
    for (const p of STEPS) {
      const ink = cover(T.geo({ h: 0, p, e: 0 }));
      const row = 20.5 + (18.5 - 20.5) * p;
      expect(
        Math.abs(run(ink, [-1, row], RIGHT, 12, 1) - 2),
        `p=${p}`
      ).toBeLessThan(0.1);
    }
  });

  it('kicks on the way off and recoils on the way back on: the cloud moves left, then half as far right', () => {
    grid(32);
    const left = (e: number) => {
      const ink = cover(T.geo({ h: 0, p: 0.6, e }));
      const row = Math.floor((19.3 - LO) / STEP);
      for (let k = 0; k < N; k++) if (ink[row * N + k]) return at(k);
      return NaN;
    };
    const rest = left(0);
    expect(left(0.5) - rest).toBeCloseTo(-2 * kickAmount(0.5), 1);
    expect(left(-0.5) - rest).toBeCloseTo(-2 * kickAmount(-0.5), 1);
  });

  it.each(['on', 'off'])(
    'renders with initial="%s", animated and static, and toggles on click',
    (initial) => {
      const onToggle = vi.fn();
      const Icon = CloudOfflineToggle;
      const { container } = render(
        <MotionIconProvider animated>
          <Icon
            initial={initial as 'on' | 'off'}
            onToggle={onToggle}
            aria-label="t"
          />
        </MotionIconProvider>
      );
      const svg = container.querySelector('svg')!;
      expect(svg.querySelector('mask, clipPath')).toBeNull();
      fireEvent.click(svg);
      expect(onToggle).toHaveBeenCalledWith(
        initial === 'on' ? 'off' : 'on',
        initial === 'on'
      );
      expect(
        render(
          <Icon
            initial={initial as 'on' | 'off'}
            animated={false}
            aria-label="t"
          />
        ).container.querySelector('svg')
      ).not.toBeNull();
    }
  );
});

// ── Motion details (every distance the report states) ────────────────────────

const pointsOf = (d: string) => flatten(d).flatMap((q) => q.pts);
const bounds = (d: string) => {
  const pts = pointsOf(d);
  const xs = pts.map(([x]) => x);
  const ys = pts.map(([, y]) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};
const moveOf = (a: number[], b: number[]) => b.map((v, i) => v - a[i]);

describe('motion details', () => {
  it('Email: the envelope grows 2px a side; the whole fold moves down 4px', () => {
    const [r, h] = [Email.geo({ h: 0 }), Email.geo({ h: 1 })];
    expect(
      moveOf(bounds(String(r.flap.d)), bounds(String(h.flap.d)))[3]
    ).toBeCloseTo(4, 2);
    expect(
      moveOf(bounds(String(r.envelope.d)), bounds(String(h.envelope.d)))
    ).toEqual([-2, -2, 2, 2].map((v) => expect.closeTo(v, 3)));
  });

  it('Cloud: the sides move 1px out and the top 1.4px up; the base holds', () => {
    expect(
      moveOf(
        bounds(String(Cloud.geo({ h: 0 }).cloud.d)),
        bounds(String(Cloud.geo({ h: 1 }).cloud.d))
      )
    ).toEqual([-1, -1.4, 1, 0].map((v) => expect.closeTo(v, 1)));
  });

  it('Catalog: the cover grows 2px a side, the tabs ride 2px left, the outer entries move 1px out and reach 1px each end', () => {
    const [r, h] = [Catalog.geo({ h: 0 }), Catalog.geo({ h: 1 })];
    expect(
      moveOf(bounds(String(r.cover.d)), bounds(String(h.cover.d)))
    ).toEqual([-2, -2, 2, 2].map((v) => expect.closeTo(v, 3)));
    expect(
      moveOf(bounds(String(r.entries.d)), bounds(String(h.entries.d)))
    ).toEqual([-1, -1, 1, 1].map((v) => expect.closeTo(v, 3)));
  });

  it('Security: the shield grows 2px wider (1px a side) and the check 12% about its centre', () => {
    const [r, h] = [Security.geo({ h: 0 }), Security.geo({ h: 1 })];
    const m = moveOf(bounds(String(r.shield.d)), bounds(String(h.shield.d)));
    expect(m[0]).toBeCloseTo(-1, 2);
    expect(m[2]).toBeCloseTo(1, 2);
    const [cr, ch] = [bounds(String(r.check.d)), bounds(String(h.check.d))];
    expect(ch[2] - ch[0] - (cr[2] - cr[0])).toBeGreaterThan(1);
  });

  it(`Bot: the head tilts ${BOT_TILT}° about the top of the neck and comes down ${BOT_DROP}px; the antennae reach 1px; the body holds`, () => {
    const [r, h] = [Bot.geo({ h: 0 }), Bot.geo({ h: 1 })];
    expect(h.body.d).toBe(r.body.d);
    // The left antenna's top-left corner, reached 1px (12, 1), turned and moved down.
    const t = rot(BOT_TILT, BOT_PIVOT)([12, 1]);
    const want: Pt = [t[0], t[1] + BOT_DROP];
    expect(
      pointsOf(String(h.head.d)).some(
        ([x, y]) => Math.hypot(x - want[0], y - want[1]) < 1e-3
      )
    ).toBe(true);
    // The neck's posts shorten to follow the head down.
    expect(moveOf(bounds(String(r.neck.d)), bounds(String(h.neck.d)))).toEqual(
      [0, BOT_DROP, 0, 0].map((v) => expect.closeTo(v, 3))
    );
  });

  it("Bot: the head's low corner clears the shoulders (0.43px); 10° with the full 1px drop would overlap them", () => {
    const shoulders =
      'M4 30V22A2 2 0 0 1 6 20H26A2 2 0 0 1 28 22V30H26V22H6V30Z';
    expect(gap(String(Bot.geo({ h: 1 }).head.d), shoulders)).toBeCloseTo(
      0.43,
      1
    );
    expect(gap(String(botGeo(5, 1)({ h: 1 }).head.d), shoulders)).toBeCloseTo(
      0.47,
      1
    );
    expect(gap(String(botGeo(10, 1)({ h: 1 }).head.d), shoulders)).toBe(0);
  });

  it('Bot: the eyes blink off once on the way in (40–110ms of the entrance), never on the way out', () => {
    const blinks = (entering: number) =>
      STEPS.concat([0.3, 0.6]).filter(
        (h) => Bot.geo({ h, entering }).eyes.d === ''
      );
    expect(blinks(1).length).toBeGreaterThan(0);
    expect(blinks(0)).toEqual([]);
    for (const h of [0, 1])
      expect(Bot.geo({ h, entering: 1 }).eyes.d).not.toBe('');
    // One step: the off frames are one run of h.
    const hs = Array.from({ length: 101 }, (_, i) => i / 100);
    const off = hs.map((h) => Bot.geo({ h, entering: 1 }).eyes.d === '');
    expect(off.filter((v, i) => i > 0 && v !== off[i - 1]).length).toBe(2);
  });

  it(`Rocket: a quarter roll that ends on the rest pose, moved ${ROCKET_RISE}px along its heading (up and right)`, () => {
    const d = ROCKET_RISE / Math.SQRT2;
    // Rest moved d right and d up, against the hovered end, drawn as the parity story samples them.
    const moved: Shapes = Object.fromEntries(
      Object.entries(Rocket.geo({ h: 0 })).map(([k, v]) => [
        k,
        { ...v, d: mapPath(String(v.d), ([x, y]) => [x + d, y - d]) },
      ])
    );
    for (const size of SIZES) {
      grid(size);
      expect(
        delta(cover(Rocket.geo({ h: 1 }, size)), cover(moved)),
        `@${size}`
      ).toBeLessThan(0.001);
    }
  });

  it("Rocket: the comp's frames map linearly onto h; the fins behind hand over across frames 8–9", () => {
    expect(ROLL_FRAMES).toBe(15);
    expect(BACK_HANDOFF.map((f) => f / ROLL_FRAMES)).toEqual([8 / 15, 9 / 15]);
  });

  it('Rocket: no pops: the drawing is continuous through the hand-off and at both ends (sampled either side at arbitrary h)', () => {
    grid(32);
    for (const f of [0, ...BACK_HANDOFF, 15]) {
      const h = f / ROLL_FRAMES;
      const [a, b] = [
        cover(Rocket.geo({ h: Math.max(0, h - 1e-5) })),
        cover(Rocket.geo({ h: Math.min(1, h + 1e-5) })),
      ];
      expect(delta(a, b), `f=${f}`).toBe(0);
    }
  });

  it('Rocket: on any frame, the shape keys hold and nothing is NaN', () => {
    for (let i = 0; i <= 120; i++) {
      const g = Rocket.geo({ h: i / 120 });
      expect(Object.keys(g).sort()).toEqual([
        'back',
        'front',
        'rocket',
        'walls',
      ]);
      noNaN(g, `h=${i / 120}`);
    }
  });

  it('Terminal: the window grows 2px a side; a "/" draws in from its top after the caret, and leaves from its top; the pair slides left to centre', () => {
    const [r, h] = [Terminal.geo({ h: 0 }), Terminal.geo({ h: 1 })];
    expect(
      moveOf(bounds(String(r.window.d)), bounds(String(h.window.d)))
    ).toEqual([-2, -2, 2, 2].map((v) => expect.closeTo(v, 2)));
    expect(PROMPT_SLIDE).toBeCloseTo(1.93, 2);
    expect(
      moveOf(bounds(String(r.caret.d)), bounds(String(h.caret.d)))
    ).toEqual(
      [-PROMPT_SLIDE, 0, -PROMPT_SLIDE, 0].map((v) => expect.closeTo(v, 3))
    );
    expect(r.glyph.d).toBe('');
    expect(bounds(String(h.glyph.d))).toEqual(
      [18.895 - PROMPT_SLIDE, 14.75, 25.105 - PROMPT_SLIDE, 23.25].map((v) =>
        expect.closeTo(v, 2)
      )
    );
    // Hovered, the pair's ink is centred in the grown window (x 4–28).
    const [l, , rr] = bounds(String(h.caret.d) + String(h.glyph.d));
    expect((l + rr) / 2).toBeCloseTo(16, 2);
    // The spacing holds: the "/" (its top corner, drawn first) keeps its place from the caret's point at every h.
    const space = (k: number) =>
      bounds(String(Terminal.geo({ h: k }).glyph.d))[2] -
      bounds(String(Terminal.geo({ h: k }).caret.d))[2];
    expect(space(0.5)).toBeCloseTo(space(1), 2);
    expect(
      bounds(String(Terminal.geo({ h: 0.5, entering: 1 }).glyph.d))[1]
    ).toBeCloseTo(14.75, 3);
    expect(
      bounds(String(Terminal.geo({ h: 0.5, entering: 0 }).glyph.d))[3]
    ).toBeCloseTo(23.25, 3);
  });

  it('Printer: the sheet lengthens 2px out of the printer, its top edge holding; the printer holds', () => {
    const [r, h] = [Printer.geo({ h: 0 }), Printer.geo({ h: 1 })];
    expect(
      moveOf(bounds(String(r.sheet.d)), bounds(String(h.sheet.d)))
    ).toEqual([0, 0, 0, 2].map((v) => expect.closeTo(v, 3)));
    expect(h.printer.d).toBe(r.printer.d);
  });
});

describe('the parity measure', () => {
  it('sees ink, and tells different icons apart', () => {
    grid(16);
    expect(
      delta(cover(Cloud.geo({ h: 0 })), coverCarbon(CCloudOffline, 16), true)
    ).toBeGreaterThan(0.05);
    expect(
      delta(cover(Email.geo({ h: 1 })), coverCarbon(CEmail, 16), true)
    ).toBeGreaterThan(0.02);
    expect(coverCarbon(CBot, 16).some((v) => v)).toBe(true);
  });
});

describe('parity report', () => {
  it('logs Δ per icon and size', () => {
    const rows: string[] = [];
    for (const { name, icon, carbon } of HOVERS) {
      rows.push(
        `${name}: ${SIZES.map((size) => {
          grid(size);
          return `${size} ${(100 * delta(cover(icon.geo({ h: 0 }, size)), coverCarbon(carbon, size), true)).toFixed(2)}%`;
        }).join(', ')}`
      );
    }
    console.log(rows.join('\n'));
  });
});
