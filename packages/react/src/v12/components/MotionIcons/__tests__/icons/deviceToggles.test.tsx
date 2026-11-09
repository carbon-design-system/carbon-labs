/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  Folder as CFolder,
  FolderOff as CFolderOff,
  Screen as CScreen,
  ScreenOff as CScreenOff,
  Video as CVideo,
  VideoFilled as CVideoFilled,
  VideoOff as CVideoOff,
  VideoOffFilled as CVideoOffFilled,
} from '@carbon/icons-react';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type {
  CarbonIcon,
  FrameHoverIcon,
  FrameToggleIcon,
  Shapes,
  ToggleFrame,
} from '../../utils/frameIcon';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { kickAmount } from '@carbon-labs/motion-icons-core/utils/slashToggle';
import {
  Folder,
  FolderOff,
  FolderOffToggle,
  Screen,
  ScreenOff,
  ScreenOffToggle,
  Video,
  VideoFilled,
  VideoOff,
  VideoOffFilled,
  VideoOffToggle,
  VideoToggle,
} from '../../icons/toggle/deviceToggles';

/**
 * Devices: Folder, Screen and Video hover icons and toggles (deviceToggles.ts).
 *
 * Coverage is compared as in opsFillToggles.test.tsx (the same sampler,
 * copied; these icons are all filled paths): both drawings sampled at 8×8
 * per parity pixel, Δ the share of ink pixels whose coverage differs by more
 * than a quarter, gated at 0.5%. Constant weight is measured on the sampled
 * ink: a probe walks a ray across a wall (or the gap) wherever the motion has
 * moved it, and reads the length of the first run of ink (or of empty).
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
const HS = [0, 0.5, 1];
const GATE = 0.005;

/**
 * A probe at a frame: a ray from `from` along `dir`, the run it should find
 * (`want` 1: a wall of ink; 0: a gap) and how wide. Probes are written about
 * a point on the art at rest and moved with it (`at` below), so they follow
 * the hover, the off shrink and the kick.
 */
type Probe = { from: Pt; dir: Pt; want: 0 | 1; w: number };
type Probes = (fr: ToggleFrame) => Probe[];
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
/** A point of the off toggles' art at a frame: moved by the off shrink (90% at h p = 1) about `centre`, and by the kick. */
const moved = ([x, y]: Pt, { h, p, e }: ToggleFrame, centre: Pt): Pt => {
  const k = 1 - 0.1 * h * p;
  return [
    centre[0] + (x - centre[0]) * k - 2 * kickAmount(e),
    centre[1] + (y - centre[1]) * k,
  ];
};

/** Folder: left wall, tab top, bottom wall (every edge 2px out on the hover). */
const folderWalls = (hOn: number, at: (q: Pt) => Pt, g = 2 * hOn): Probe[] => [
  wallAt(at([3 - g, 16]), RIGHT),
  wallAt(at([7, 5 - g]), DOWN),
  wallAt(at([24, 27 + g]), UP),
];
/** Screen: the display's left wall (above its cut corner), a leg (between display and base) and the base (the display 1px out on the hover). */
const screenWalls = (hOn: number, at: (q: Pt) => Pt, g = hOn): Probe[] => [
  wallAt(at([3 - g, 12]), RIGHT),
  wallAt(at([13, (23 + g + 1 + 28) / 2]), RIGHT),
  wallAt(at([16, 29]), UP),
];
/** The wedge's top arm at the on hover: from the body (1px up) to the mouth (2px right, 1px up). */
const topArm = (hOn: number): [Pt, Pt] => [
  [22, 14 - hOn],
  [29 + 2 * hOn, 9 - hOn],
];
/** Video outline: top wall, left wall, the wedge's mouth and, across its middle, the top arm. */
const videoWalls = (hOn: number, at: (q: Pt) => Pt): Probe[] => {
  const [a, b] = topArm(hOn);
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const across: Pt = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; // the arm's normal, pointing down-right
  return [
    wallAt(at([10, 7]), DOWN),
    wallAt(at([3, 16]), RIGHT),
    wallAt(at([29 + 2 * hOn, 16]), LEFT),
    wallAt(at([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]), [
      -across[0],
      -across[1],
    ]),
  ];
};
const same = (q: Pt) => q;

interface HoverCase {
  name: string;
  icon: FrameHoverIcon;
  carbon: CarbonIcon;
  probes: (h: number) => Probe[];
}
const offAt = (centre: Pt) => (h: number) => (q: Pt) =>
  moved(q, { h, p: 1, e: 0 }, centre);
const HOVERS: HoverCase[] = [
  {
    name: 'Folder',
    icon: Folder,
    carbon: CFolder,
    probes: (h) => folderWalls(h, same),
  },
  {
    name: 'FolderOff',
    icon: FolderOff,
    carbon: CFolderOff,
    probes: (h) => folderWalls(0, offAt([16, 16])(h)),
  },
  {
    name: 'Screen',
    icon: Screen,
    carbon: CScreen,
    probes: (h) => screenWalls(h, same),
  },
  {
    name: 'ScreenOff',
    icon: ScreenOff,
    carbon: CScreenOff,
    probes: (h) => screenWalls(0, offAt([16, 17])(h)),
  },
  {
    name: 'Video',
    icon: Video,
    carbon: CVideo,
    probes: (h) => videoWalls(h, same),
  },
  {
    name: 'VideoFilled',
    icon: VideoFilled,
    carbon: CVideoFilled,
    probes: () => [],
  },
  {
    name: 'VideoOff',
    icon: VideoOff,
    carbon: CVideoOff,
    probes: (h) => videoWalls(0, offAt([16, 16])(h)),
  },
  // Filled, the gap above the slash is Carbon's 3px, whatever the base does under it.
  {
    name: 'VideoOffFilled',
    icon: VideoOffFilled,
    carbon: CVideoOffFilled,
    probes: () => [
      { from: [8, 12], dir: [Math.SQRT1_2, Math.SQRT1_2], want: 0, w: 3 },
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

describe.each(HOVERS)('$name', ({ icon, carbon, probes }) => {
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
    expect(JSON.stringify(icon.geo({ h: 1 }))).not.toBe(
      JSON.stringify(icon.geo({ h: 0 }))
    );
    grid(32);
    for (const h of STEPS) {
      const shapes = icon.geo({ h });
      for (const [k, a] of Object.entries(shapes)) {
        expect(a.transform, k).toBeUndefined();
        expect(a.strokeWidth, k).toBeUndefined();
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

// ── Toggles ──────────────────────────────────────────────────────────────────

interface ToggleCase {
  name: string;
  toggle: FrameToggleIcon<string>;
  states: readonly [string, string];
  carbon: readonly [CarbonIcon, CarbonIcon];
  /** The hover icons each end must equal; `exact` when the toggle's end is that icon's geometry itself. */
  ends: readonly [FrameHoverIcon, FrameHoverIcon];
  exact: readonly [boolean, boolean];
  kind: 'slash' | 'fill';
  probes: Probes;
}
const loose = <S extends string>(t: FrameToggleIcon<S>) =>
  t as unknown as FrameToggleIcon<string>;
/** Off toggles: the on hover's walls (hOn = h(1 − p)) moved by the off shrink and the kick. */
const slashProbes =
  (walls: (hOn: number, at: (q: Pt) => Pt) => Probe[], centre: Pt): Probes =>
  (fr) =>
    walls(fr.h * (1 - fr.p), (q) => moved(q, fr, centre));

const TOGGLES: ToggleCase[] = [
  {
    name: 'FolderOffToggle',
    toggle: loose(FolderOffToggle),
    states: ['on', 'off'],
    carbon: [CFolder, CFolderOff],
    ends: [Folder, FolderOff],
    exact: [false, true],
    kind: 'slash',
    probes: slashProbes(folderWalls, [16, 16]),
  },
  {
    name: 'ScreenOffToggle',
    toggle: loose(ScreenOffToggle),
    states: ['on', 'off'],
    carbon: [CScreen, CScreenOff],
    ends: [Screen, ScreenOff],
    exact: [true, true],
    kind: 'slash',
    probes: slashProbes(screenWalls, [16, 17]),
  },
  {
    name: 'VideoToggle',
    toggle: loose(VideoToggle),
    states: ['off', 'on'],
    carbon: [CVideo, CVideoFilled],
    ends: [Video, VideoFilled],
    exact: [true, true],
    kind: 'fill',
    // The outline's walls while it's empty (filled, the fill meets them).
    probes: ({ h, p, e }) => (p === 0 || e === 1 ? videoWalls(h, same) : []),
  },
  {
    name: 'VideoOffToggle',
    toggle: loose(VideoOffToggle),
    states: ['on', 'off'],
    carbon: [CVideo, CVideoOff],
    ends: [Video, VideoOff],
    exact: [false, true],
    kind: 'slash',
    probes: slashProbes(videoWalls, [16, 16]),
  },
  {
    name: 'VideoOffToggle filled',
    toggle: loose(VideoOffToggle.pick({ filled: true })),
    states: ['on', 'off'],
    carbon: [CVideoFilled, CVideoOffFilled],
    ends: [VideoFilled, VideoOffFilled],
    exact: [false, true],
    kind: 'slash',
    probes: ({ p }) =>
      p === 1
        ? [{ from: [8, 12], dir: [Math.SQRT1_2, Math.SQRT1_2], want: 0, w: 3 }]
        : [],
  },
];

const frames = STEPS.flatMap((h) =>
  STEPS.flatMap((p) => [
    { h, p, e: 0 },
    { h, p: 1, e: p },
  ])
);
// Slash toggles also kick (e 0…1) and recoil (e −1…0) at any p.
const slashFrames = [
  ...frames,
  ...STEPS.flatMap((h) =>
    STEPS.flatMap((p) =>
      STEPS.flatMap((e) => [
        { h, p, e },
        { h, p, e: -e },
      ])
    )
  ),
];

describe.each(TOGGLES)(
  '$name',
  ({ toggle, states, carbon, ends, exact, kind, probes }) => {
    const grid3 = kind === 'slash' ? slashFrames : frames;

    it('keeps the same shape keys at every frame and size (kick and recoil included), and never paints NaN or Infinity', () => {
      for (const size of SIZES) {
        const rest = Object.keys(toggle.geo({ h: 0, p: 0, e: 0 }, size)).sort();
        for (const fr of grid3) {
          const shapes = toggle.geo(fr, size);
          expect(
            Object.keys(shapes).sort(),
            `${JSON.stringify(fr)} @${size}`
          ).toEqual(rest);
          noNaN(shapes, `${JSON.stringify(fr)} @${size}`);
        }
      }
    });

    it("rests on Carbon's static icons at both ends and every size (within 0.5%)", () => {
      for (const size of SIZES) {
        grid(size);
        for (const p of [0, 1] as const)
          expect(
            delta(
              cover(toggle.geo({ h: 0, p, e: 0 }, size)),
              coverCarbon(carbon[p], size),
              true
            ),
            `p=${p} @${size}`
          ).toBeLessThan(GATE);
      }
    });

    it('both ends are the hover icons, at every h and size', () => {
      for (const size of SIZES) {
        grid(size);
        for (const h of HS) {
          for (const p of [0, 1] as const) {
            const [t, o] = [
              toggle.geo({ h, p, e: 0 }, size),
              ends[p].geo({ h }, size),
            ];
            if (exact[p]) expect(t, `p=${p} h=${h}`).toEqual(o);
            expect(
              delta(cover(t), cover(o)),
              `p=${p} h=${h} @${size}`
            ).toBeLessThan(GATE);
          }
        }
      }
    });

    it('keeps its line weight through hover and toggle (filled paths only; measured walls hold)', () => {
      grid(32);
      for (const fr of kind === 'slash'
        ? STEPS.flatMap((h) =>
            STEPS.flatMap((p) => [
              { h, p, e: 0 },
              { h, p, e: p / 2 },
              { h, p, e: -p / 2 },
            ])
          )
        : frames) {
        const shapes = toggle.geo(fr);
        for (const a of Object.values(shapes))
          expect(a.strokeWidth ?? a.transform).toBeUndefined();
        const ink = cover(shapes);
        probes(fr).forEach(({ from, dir, want, w }, i) =>
          expect(
            Math.abs(run(ink, from, dir, 12, want) - w),
            `probe ${i} ${JSON.stringify(fr)}`
          ).toBeLessThan(0.1)
        );
      }
    });

    it.runIf(kind === 'slash')(
      'kicks on the way off and recoils on the way back on: the base moves left, then half as far right',
      () => {
        grid(32);
        // The left wall at rest, mid-slash: where the first run of ink starts on a ray from the far left at y 16.
        const left = (e: number) => {
          const ink = cover(toggle.geo({ h: 0, p: 0.6, e }));
          const row = Math.floor((16 - LO) / STEP);
          for (let k = 0; k < N; k++) if (ink[row * N + k]) return at(k);
          return NaN;
        };
        const rest = left(0);
        expect(left(0.5) - rest).toBeCloseTo(-2 * kickAmount(0.5), 1);
        expect(left(-0.5) - rest).toBeCloseTo(-2 * kickAmount(-0.5), 1);
        expect(left(0.5)).toBeLessThan(rest - 1);
        expect(left(-0.5)).toBeGreaterThan(rest + 0.5);
      }
    );

    it.runIf(kind === 'fill')(
      'empties back to the outline: a full hole leaves the off end',
      () => {
        for (const size of SIZES) {
          grid(size);
          for (const h of HS)
            expect(
              delta(
                cover(toggle.geo({ h, p: 1, e: 1 }, size)),
                cover(toggle.geo({ h, p: 0, e: 0 }, size))
              )
            ).toBe(0);
        }
      }
    );

    it.each(states)(
      'renders with initial="%s", animated and static, and toggles on click',
      (initial) => {
        const [onToggle, Icon] = [vi.fn(), toggle];
        const { container } = render(
          <MotionIconProvider animated>
            <Icon initial={initial} onToggle={onToggle} aria-label="t" />
          </MotionIconProvider>
        );
        const svg = container.querySelector('svg')!;
        expect(svg.querySelector('mask, clipPath')).toBeNull();
        expect(svg.querySelectorAll('[data-k]').length).toBe(
          Object.keys(
            toggle.geo({ h: 0, p: initial === states[1] ? 1 : 0, e: 0 })
          ).length
        );
        fireEvent.click(svg);
        expect(onToggle).toHaveBeenCalledWith(
          initial === states[0] ? states[1] : states[0],
          initial === states[0]
        );
        expect(
          render(
            <Icon initial={initial} animated={false} aria-label="t" />
          ).container.querySelector('svg')
        ).not.toBeNull();
      }
    );
  }
);

// ── Motion details ───────────────────────────────────────────────────────────

/** Every vertex of a path's polylines. */
const pointsOf = (d: string) => flatten(d).flatMap((q) => q.pts);

describe('motion details', () => {
  it("the off toggles' on ends draw the hover icon's outline exactly", () => {
    for (const h of HS) {
      expect(FolderOffToggle.geo({ h, p: 0, e: 0 }).rings.d).toBe(
        Folder.geo({ h }).frame.d
      );
      expect(String(Video.geo({ h }).camera.d)).toBe(
        VideoOffToggle.geo({ h, p: 0, e: 0 }).rings.d
      );
    }
  });

  it("Video: the wedge's mouth moves 2px right and opens 1px up and down (14 → 16px), and the body holds", () => {
    for (const icon of [
      Video,
      VideoFilled,
      VideoOffToggle,
      VideoOffToggle.pick({ filled: true }),
    ]) {
      const geo = (h: number) => icon.geo({ h, p: 0, e: 0 });
      const pts = (h: number) =>
        Object.values(geo(h)).flatMap((a) => pointsOf(String(a.d ?? '')));
      const [xs, ys] = [
        (h: number) => pts(h).map(([x]) => x),
        (h: number) =>
          pts(h)
            .filter(([x]) => x > 26)
            .map(([, y]) => y),
      ];
      expect(
        Math.max(...xs(1)) - Math.max(...xs(0)),
        icon.displayName
      ).toBeCloseTo(2, 3);
      expect(Math.min(...xs(1)), icon.displayName).toBeCloseTo(
        Math.min(...xs(0)),
        6
      );
      // The mouth's ends (beyond x 26), top and bottom, each 1px further out.
      expect(
        Math.min(...ys(1)) - Math.min(...ys(0)),
        icon.displayName
      ).toBeCloseTo(-1, 2);
      expect(
        Math.max(...ys(1)) - Math.max(...ys(0)),
        icon.displayName
      ).toBeCloseTo(1, 2);
    }
  });

  it('Video fill: a single disc from one centre fills the body and wedge together', () => {
    // Mid-fill, the camera path is the outline's two loops plus exactly one fill polygon.
    for (const h of [0, 1]) {
      const subs = String(VideoToggle.geo({ h, p: 0.5, e: 0 }).camera.d)
        .split(/(?=M)/)
        .filter((x) => x.trim());
      expect(subs.length, `h=${h}`).toBe(3);
    }
  });

  it('Screen: the display grows 1px each side while the base holds', () => {
    const ext = (h: number) => {
      const pts = pointsOf(String(Screen.geo({ h }).fill.d));
      return [
        Math.min(...pts.map(([x]) => x)),
        Math.max(...pts.map(([x]) => x)),
        Math.min(...pts.map(([, y]) => y)),
        Math.max(...pts.map(([, y]) => y)),
      ];
    };
    expect(ext(1).map((v, i) => v - ext(0)[i])).toEqual(
      [-1, 1, -1, 0].map((v) => expect.closeTo(v, 3))
    );
  });
});

describe('the parity measure', () => {
  it('sees ink, and tells different icons apart', () => {
    grid(16);
    expect(
      delta(cover(Folder.geo({ h: 0 })), coverCarbon(CFolderOff, 16), true)
    ).toBeGreaterThan(0.05);
    expect(
      delta(cover(Video.geo({ h: 0 })), coverCarbon(CVideoOff, 16), true)
    ).toBeGreaterThan(0.05);
    expect(
      delta(cover(Screen.geo({ h: 1 })), coverCarbon(CScreen, 16), true)
    ).toBeGreaterThan(0.05);
    expect(coverCarbon(CScreenOff, 16).some((v) => v)).toBe(true);
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
