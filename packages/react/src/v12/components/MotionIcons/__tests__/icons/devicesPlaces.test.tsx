/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  Apple as CApple,
  Asset as CAsset,
  BareMetalServer as CBareMetalServer,
  Blog as CBlog,
  Camera as CCamera,
  Construction as CConstruction,
  Development as CDevelopment,
  Devices as CDevices,
  EventsAlt as CEventsAlt,
  FaceDissatisfied as CFaceDissatisfied,
  FaceDissatisfiedFilled as CFaceDissatisfiedFilled,
  Globe as CGlobe,
  Industry as CIndustry,
  Keyboard as CKeyboard,
  KeyboardOff as CKeyboardOff,
  Mobile as CMobile,
  Person as CPerson,
  ServiceDesk as CServiceDesk,
  ShoppingBag as CShoppingBag,
  Snow as CSnow,
  SysProvision as CSysProvision,
  Timer as CTimer,
  VolumeDown as CVolumeDown,
  VolumeDownFilled as CVolumeDownFilled,
  VolumeMute as CVolumeMute,
  VolumeMuteFilled as CVolumeMuteFilled,
  VolumeUp as CVolumeUp,
  VolumeUpFilled as CVolumeUpFilled,
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
  Apple,
  Asset,
  BareMetalServer,
  Blog,
  Camera,
  Construction,
  Development,
  Devices,
  EventsAlt,
  FaceDissatisfied,
  FaceDissatisfiedFilled,
  FaceDissatisfiedToggle,
  Globe,
  Industry,
  Keyboard,
  KeyboardOff,
  KeyboardOffToggle,
  Mobile,
  Person,
  ServiceDesk,
  ShoppingBag,
  Snow,
  SysProvision,
  Timer,
  VolumeDown,
  VolumeDownFilled,
  VolumeLevelToggle,
  VolumeMute,
  VolumeMuteFilled,
  VolumeUp,
  VolumeUpFilled,
  VolumeUpToggle,
  MUTE_CUT_MS,
  MUTE_MS,
  MUTE_REACH,
  PULSE_MS,
  WAVE_GROW,
  FROWN_REACH,
  assetD,
  frownAt,
  globeAt,
  volumeRest,
  volumeWaves,
  type VolumeLevel,
} from '../../icons/assorted/devicesPlaces';
import {
  VolumeDownFilledSpec,
  VolumeDownSpec,
  VolumeLevelToggleSpec,
  VolumeUpFilledSpec,
  VolumeUpSpec,
} from '@carbon-labs/motion-icons-core/icons/assorted/devicesPlaces';
import { FrameController } from '@carbon-labs/motion-icons-core/engine';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';

/**
 * Devices, places and people (devicesPlaces.ts): the same shape keys and no
 * NaN across the hover at 16 / 20 / 24 / 32 (and across h, p and e for the
 * toggles), every point inside the 36×36 hover box; rest parity with Carbon
 * at every size by coverage (Δ is the share of ink pixels whose coverage
 * differs by more than a quarter, gated at 0.5%, as the browser Parity story
 * measures); constant weight (rigid parts move only by their allowed offsets,
 * and every walled part's local thickness, the widest disc inside it through
 * each point, holds its resting weight); separate parts never touch; and each
 * toggle's ends are its hover icons.
 */

// ── A small rasteriser (as tech.test.tsx) ────────────────────────────────────

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
interface Case {
  name: string;
  icon: FrameHoverIcon;
  carbon: CarbonIcon;
  /** Per shape key, the offsets its outline points may move by at full hover (keys left out are rebuilt, and checked by thickness). */
  moves?: Moves;
  /** Separate parts that must never touch: [part, part]. */
  apart?: [string, string][];
  /** Solid parts that may grow (a play triangle, a leaf): not held to their resting thickness. */
  solids?: string[];
  /** The hover frame the parts are checked at (Volume up's pulse plays on the way in). */
  entering?: number;
}
const PEOPLE4 = ['upperLeft', 'upperRight', 'lowerLeft', 'lowerRight'];
const CASES: Case[] = [
  {
    name: 'Camera',
    icon: Camera,
    carbon: CCamera,
    moves: { body: around(1) },
    apart: [['body', 'lens']],
  },
  {
    name: 'Devices',
    icon: Devices,
    carbon: CDevices,
    moves: { phone: [still, [1, 0], [0, -1], [1, -1]], monitor: around(1) },
    apart: [['phone', 'monitor']],
  },
  {
    name: 'Mobile',
    icon: Mobile,
    carbon: CMobile,
    moves: { mobile: around(1) },
  },
  {
    name: 'Keyboard',
    icon: Keyboard,
    carbon: CKeyboard,
    moves: { keys: [still] },
    apart: [['fill', 'keys']],
  },
  {
    name: 'KeyboardOff',
    icon: KeyboardOff,
    carbon: CKeyboardOff,
    apart: [['fill', 'keys']],
  },
  { name: 'Asset', icon: Asset, carbon: CAsset, apart: [['wheel', 'hub']] },
  {
    name: 'Development',
    icon: Development,
    carbon: CDevelopment,
    moves: { blocks: [[-1, -1]], stack: [still] },
    apart: [['blocks', 'stack']],
  },
  {
    name: 'Blog',
    icon: Blog,
    carbon: CBlog,
    moves: { header: [still, [0, 1]], lines: [[0, 1]] },
    apart: [
      ['header', 'lines'],
      ['header', 'picture'],
      ['lines', 'picture'],
    ],
  },
  {
    name: 'BareMetalServer',
    icon: BareMetalServer,
    carbon: CBareMetalServer,
    moves: {
      top: [
        [-1, 0],
        [1, 0],
      ],
      middle: [
        [-1, 0],
        [1, 0],
      ],
      bottom: [
        [-1, 0],
        [1, 0],
      ],
    },
    apart: [
      ['top', 'middle'],
      ['middle', 'bottom'],
    ],
  },
  {
    name: 'SysProvision',
    icon: SysProvision,
    carbon: CSysProvision,
    moves: { dot: [still] },
    solids: ['play'],
    apart: [
      ['ring', 'play'],
      ['ring', 'rings'],
      ['rings', 'play'],
      ['rings', 'dot'],
      ['dot', 'play'],
    ],
  },
  { name: 'ServiceDesk', icon: ServiceDesk, carbon: CServiceDesk },
  {
    name: 'Construction',
    icon: Construction,
    carbon: CConstruction,
    moves: { legs: [still], pile: [still] },
    apart: [
      ['head', 'upper'],
      ['head', 'handle'],
      ['upper', 'pile'],
    ],
  },
  {
    name: 'Industry',
    icon: Industry,
    carbon: CIndustry,
    moves: { factory: [still, [0, -2]] },
  },
  {
    name: 'Globe',
    icon: Globe,
    carbon: CGlobe,
    apart: [
      ['ball', 'holder'],
      ['meridian', 'holder'],
    ],
  },
  {
    name: 'Timer',
    icon: Timer,
    carbon: CTimer,
    moves: { crown: [[0, -1]] },
    apart: [
      ['ring', 'crown'],
      ['ring', 'hand'],
      ['crown', 'hand'],
    ],
  },
  {
    name: 'Snow',
    icon: Snow,
    carbon: CSnow,
    solids: ['flakes', 'fresh'],
    apart: [
      ['cloud', 'flakes'],
      ['cloud', 'fresh'],
      ['flakes', 'fresh'],
    ],
  },
  {
    name: 'ShoppingBag',
    icon: ShoppingBag,
    carbon: CShoppingBag,
    moves: { bag: [...around(1), [0, -3]] },
  },
  {
    name: 'Apple',
    icon: Apple,
    carbon: CApple,
    solids: ['leaf'],
    apart: [['apple', 'leaf']],
  },
  {
    name: 'Person',
    icon: Person,
    carbon: CPerson,
    moves: { body: [still, [-1, 0], [1, 0]] },
    apart: [['head', 'body']],
  },
  {
    name: 'EventsAlt',
    icon: EventsAlt,
    carbon: CEventsAlt,
    apart: [
      ...PEOPLE4.map((p): [string, string] => [`${p}Head`, `${p}Body`]),
      ['upperLeftBody', 'lowerLeftHead'],
      ['upperRightBody', 'lowerRightHead'],
      ['upperLeftBody', 'upperRightBody'],
      ['lowerLeftBody', 'lowerRightBody'],
      ['upperLeftHead', 'upperRightHead'],
      ['lowerLeftHead', 'lowerRightHead'],
      ['upperLeftBody', 'lowerRightHead'],
      ['upperRightBody', 'lowerLeftHead'],
    ],
  },
  {
    name: 'FaceDissatisfied',
    icon: FaceDissatisfied,
    carbon: CFaceDissatisfied,
    apart: [['ring', 'glyph']],
  },
  {
    name: 'FaceDissatisfiedFilled',
    icon: FaceDissatisfiedFilled,
    carbon: CFaceDissatisfiedFilled,
    solids: ['glyph'],
  },
  {
    name: 'VolumeUp',
    icon: VolumeUp,
    carbon: CVolumeUp,
    moves: { speaker: [still] },
    apart: [
      ['speaker', 'waveA'],
      ['speaker', 'waveB'],
      ['waveA', 'waveB'],
    ],
  },
  {
    name: 'VolumeUpFilled',
    icon: VolumeUpFilled,
    carbon: CVolumeUpFilled,
    moves: { speaker: [still] },
    apart: [
      ['speaker', 'waveB'],
      ['waveA', 'waveB'],
    ],
  },
  {
    name: 'VolumeDown',
    icon: VolumeDown,
    carbon: CVolumeDown,
    moves: { speaker: [still] },
    apart: [['speaker', 'waveA']],
  },
  {
    name: 'VolumeDownFilled',
    icon: VolumeDownFilled,
    carbon: CVolumeDownFilled,
    moves: { speaker: [still] },
    apart: [['speaker', 'waveA']],
  },
  {
    name: 'VolumeMute',
    icon: VolumeMute,
    carbon: CVolumeMute,
    moves: { speaker: [still] },
    apart: [['speaker', 'mute']],
  },
  {
    name: 'VolumeMuteFilled',
    icon: VolumeMuteFilled,
    carbon: CVolumeMuteFilled,
    moves: { speaker: [still] },
    solids: ['speaker'],
    apart: [['speaker', 'mute']],
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
  ({
    name,
    icon,
    carbon,
    moves = {},
    apart = [],
    solids = [],
    entering = 1,
  }) => {
    it('keeps the same shape keys at every hover frame and size, never paints NaN or Infinity, and stays inside 36×36', () => {
      for (const size of SIZES) {
        const rest = Object.keys(icon.geo({ h: 0 }, size));
        for (const ent of [1, 0]) {
          for (const h of STEPS) {
            const shapes = icon.geo({ h, entering: ent }, size);
            expect(Object.keys(shapes), `h=${h} @${size}`).toEqual(rest);
            noBad(shapes, `h=${h} entering=${ent} @${size}`);
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

    it('hovers by moving geometry: no transforms or strokes, rigid parts by their allowed offsets', () => {
      for (const size of SIZES) {
        const [rest, full] = [
          icon.geo({ h: 0, entering }, size),
          icon.geo({ h: 1, entering }, size),
        ];
        if (entering)
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

    it('keeps its line weight: no walled part grows thicker or thinner than at rest through the hover', () => {
      grid(16); // 1/16px samples
      weights[name] = [];
      const rest = icon.geo({ h: 0 }, 32);
      for (const k of Object.keys(rest)) {
        if (solids.includes(k)) continue;
        const t0 = thickness(cover({ k: rest[k] }));
        const [max0, mid0, thin0] = t0.length
          ? [t0[t0.length - 1], quantile(t0, 0.5), quantile(t0, 0.1)]
          : [2, 2, 1.8];
        let worst = 0;
        for (const h of [0.25, 0.5, 0.75, 1]) {
          const t = thickness(cover({ k: icon.geo({ h, entering }, 32)[k] }));
          if (!t.length) continue;
          expect(t[t.length - 1], `${k} widest h=${h}`).toBeLessThan(
            Math.max(max0, 2) + 0.13
          );
          expect(
            Math.abs(quantile(t, 0.5) - mid0),
            `${k} median h=${h}`
          ).toBeLessThan(0.07);
          if (t.length > t0.length / 4)
            expect(
              quantile(t, 0.1),
              `${k} thinnest tenth h=${h}`
            ).toBeGreaterThan(thin0 - 0.13);
          worst = Math.max(worst, Math.abs(quantile(t, 0.5) - mid0));
        }
        weights[name].push(`${k} ${mid0.toFixed(2)} (±${worst.toFixed(2)})`);
      }
    }, 30_000);

    it.runIf(apart.length > 0)(
      'keeps its separate parts apart through the hover (no shared ink, a clear gap)',
      () => {
        grid(32);
        gaps[name] = [];
        for (const [a, b] of apart) {
          let least = Infinity;
          let rest = Infinity;
          for (const h of STEPS) {
            const shapes = icon.geo({ h, entering }, 32);
            if (!shapes[a].d || !shapes[b].d) continue;
            const [ia, ib] = [cover({ a: shapes[a] }), cover({ b: shapes[b] })];
            let shared = 0;
            for (let k = 0; k < ia.length; k++) shared += ia[k] & ib[k];
            // Carbon's own drawing may touch at a corner (Development's block and stack): no more than that.
            const g = gap(String(shapes[a].d), String(shapes[b].d));
            if (h === 0) rest = g;
            if (rest > 1e-3) expect(shared, `${a}/${b} h=${h}`).toBe(0);
            least = Math.min(least, g);
          }
          // A clear 1.1px, or (where Carbon's own gap is narrower, as a head over its shoulders) the resting gap held.
          expect(least, `${a}/${b}`).toBeGreaterThan(
            Math.min(1.1, rest - 0.01)
          );
          gaps[name].push(
            `${a}/${b} ≥ ${least.toFixed(2)} (rest ${rest.toFixed(2)})`
          );
        }
      },
      30_000
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

// ── Per-icon geometry ────────────────────────────────────────────────────────

const ringRadii = (d: string, c: Pt) =>
  flatten(d)
    .flatMap((p) => p.pts)
    .map(([x, y]) => Math.hypot(x - c[0], y - c[1]));

describe('Asset', () => {
  it("rebuilds Carbon's belt from the wheels' tangents, and grows every circle 1px in radius", () => {
    grid(32);
    // The belt's runs: Carbon's outer run, from (7.76, 10.96) to (24.15, 2.48), is the wheels' outer tangent.
    const pts = flatten(assetD(0))[0].pts;
    const near = (p: Pt) =>
      pts.some(([x, y]) => Math.hypot(x - p[0], y - p[1]) < 0.5);
    expect(
      near([7.7571, 10.9579]) &&
        near([24.1463, 2.4768]) &&
        near([21.066, 24.1929]) &&
        near([29.556, 7.7935])
    ).toBe(true);
    for (const h of STEPS) {
      for (const r of ringRadii(String(Asset.geo({ h }).hub.d), [12, 20]))
        expect(
          Math.min(Math.abs(r - 2 - h), Math.abs(r - 4 - h)),
          `hub h=${h}`
        ).toBeLessThan(5e-3);
    }
  });
});

describe('Volume up and Volume down', () => {
  // Single pulse and two pulses each have their own hover, where the pulses grow slightly; the pulse is the action.
  it('hover: each wave grows 1px in radius in place (at 2px), both ways; the speaker holds', () => {
    const arcR = (d: string, c: Pt) =>
      Math.max(
        ...flatten(d)
          .flatMap((q) => q.pts)
          .map(([x, y]) => Math.hypot(x - c[0], y - c[1]))
      );
    for (const [icon, waves] of [
      [
        VolumeUp,
        [
          ['waveB', [17, 15.87]],
          ['waveA', [18, 15.84]],
        ],
      ],
      [VolumeDown, [['waveA', [19, 15.87]]]],
    ] as const) {
      const [rest, full] = [
        icon.geo({ h: 0 }),
        icon.geo({ h: 1, entering: 0 }),
      ];
      expect(full.speaker).toEqual(rest.speaker);
      for (const [k, c] of waves)
        expect(
          arcR(String(full[k].d), c as Pt) - arcR(String(rest[k].d), c as Pt),
          k
        ).toBeCloseTo(WAVE_GROW, 2);
      expect(icon.geo({ h: 1, entering: 1 })).toEqual(full);
    }
  });

  it('action: the pulse (240ms) lands on the rest drawing; the waves keep apart from each other and, once out, from the speaker', () => {
    grid(32);
    expect(PULSE_MS).toBe(240);
    for (const spec of [
      VolumeUpSpec,
      VolumeUpFilledSpec,
      VolumeDownSpec,
      VolumeDownFilledSpec,
    ]) {
      const act = spec.action!;
      expect(act.duration).toBeCloseTo(PULSE_MS / 1000, 6);
      expect(act.geo({ h: 0, a: 0 })).toEqual(spec.geo({ h: 0 }));
      expect(act.geo({ h: 0, a: 1 })).toEqual(spec.geo({ h: 0 }));
      expect(act.geo({ h: 1, a: 1 })).toEqual(spec.geo({ h: 1 }));
      for (let i = 1; i < 40; i++)
        noBad(act.geo({ h: i % 2, a: i / 40 }), `${spec.name} a=${i / 40}`);
    }
    const speaker = String(VolumeUp.geo({ h: 0 }).speaker.d);
    // Every 10ms of the pass (the gap search is slow).
    for (let ms = 10; ms < PULSE_MS; ms += 10) {
      const t = ms / PULSE_MS;
      const w = volumeWaves({ a: 2, b: 1, x: 0, t });
      const parts = [w.waveA, w.waveB, w.waveC].filter(Boolean);
      for (let a = 0; a < parts.length; a++)
        for (let b = a + 1; b < parts.length; b++)
          expect(gap(parts[a], parts[b]), `t=${t}`).toBeGreaterThan(1.9);
      expect(gap(speaker, w.waveB), `travelling t=${t}`).toBeGreaterThan(2.4);
      if (w.waveA)
        expect(gap(speaker, w.waveA), `outgoing t=${t}`).toBeGreaterThan(5);
    }
    expect(volumeWaves({ a: 2, b: 1, x: 0, t: 0 })).toEqual(
      volumeWaves({ a: 2, b: 1, x: 0 })
    );
  }, 30_000);
});

describe.each([
  {
    name: 'VolumeLevelToggle',
    icon: VolumeLevelToggle,
    up: CVolumeUp,
    mute: CVolumeMute,
    Mute: VolumeMute,
    Up: VolumeUp,
    spec: VolumeLevelToggleSpec.pick({}),
  },
  {
    name: 'VolumeLevelToggle filled',
    icon: VolumeLevelToggle.pick({ filled: true }),
    up: CVolumeUpFilled,
    mute: CVolumeMuteFilled,
    Mute: VolumeMuteFilled,
    Up: VolumeUpFilled,
    spec: VolumeLevelToggleSpec.pick({ filled: true }),
  },
])('$name', ({ icon, up, mute, Mute, Up, spec }) => {
  const LEVELS: VolumeLevel[] = ['mute', 'quiet', 'loud'];
  const outer = (shapes: Shapes) => String(shapes.speaker.d).split('Z')[0];
  /** Runs a change on the core's engine on a 1ms clock; every frame's drawing (and its time), and the last. */
  async function run(
    from: VolumeLevel,
    to: VolumeLevel,
    ms = 320,
    then?: { at: number; to: VolumeLevel },
    size = 32
  ) {
    const clock = manualScheduler(1);
    setScheduler(clock);
    const frames: { t: number; shapes: Shapes }[] = [];
    const ctl = new FrameController(
      spec as never,
      (shapes) => frames.push({ t: clock.time(), shapes }),
      size,
      from
    );
    ctl.setState(to);
    for (let t = 0; t < ms; t++) {
      if (then && t === then.at) ctl.setState(then.to);
      clock.advance(1);
      await Promise.resolve();
    }
    setScheduler(null);
    return { frames, end: ctl.shapes() };
  }
  const rest = (s: VolumeLevel) => icon.geo({ h: 0, ...volumeRest(s) });
  const has = (shapes: Shapes, k: string) => String(shapes[k].d).length > 0;
  const waves = (shapes: Shapes) =>
    ['waveA', 'waveB', 'waveC'].some((k) => has(shapes, k));

  it("rests on Carbon's volume--up and volume--mute; down is volume--up's inner wave; the speaker never moves; none is mute", () => {
    for (const size of SIZES) {
      grid(size);
      expect(
        delta(
          cover(icon.geo({ h: 0, ...volumeRest('loud') }, size)),
          coverCarbon(up, size)
        ),
        `up @${size}`
      ).toBeLessThan(GATE);
      expect(
        delta(
          cover(icon.geo({ h: 0, ...volumeRest('mute') }, size)),
          coverCarbon(mute, size)
        ),
        `mute @${size}`
      ).toBeLessThan(GATE);
    }
    const [off, one, two] = LEVELS.map(rest);
    expect([off.waveA.d, off.waveB.d, off.waveC.d]).toEqual(['', '', '']);
    expect(has(off, 'mute')).toBe(true);
    expect([one.mute.d, two.mute.d]).toEqual(['', '']);
    expect(one.waveA.d).toBe(two.waveB.d);
    expect(one.waveB.d).toBe('');
    expect(outer(off)).toEqual(outer(two));
    expect(one.speaker).toEqual(two.speaker);
    expect(rest('none')).toEqual(off);
    // Each end is its hover icon at rest.
    expect(off).toEqual(Mute.geo({ h: 0 }));
    for (const k of ['waveA', 'waveB', 'waveC'])
      expect(two[k], k).toEqual(Up.geo({ h: 0 })[k]);
  });

  it('mutes from either level in fast-02: the waves collapse in the first 40ms at a constant 2px, then the × grows from its centre; they never overlap', async () => {
    grid(16);
    for (const from of ['loud', 'quiet'] as const) {
      const { frames, end } = await run(from, 'mute', 140);
      expect(end).toEqual(rest('mute'));
      const crossFrom = frames.find((f) => has(f.shapes, 'mute'))!.t;
      const wavesTo = Math.max(
        ...frames.filter((f) => waves(f.shapes)).map((f) => f.t)
      );
      expect(wavesTo, from).toBeLessThanOrEqual(MUTE_CUT_MS);
      expect(crossFrom, from).toBeGreaterThan(MUTE_CUT_MS);
      const done = frames.find(
        (f) => JSON.stringify(f.shapes) === JSON.stringify(rest('mute'))
      )!.t;
      expect(done, from).toBeLessThanOrEqual(MUTE_MS);
      for (const { t, shapes } of frames) {
        noBad(shapes, `${from} → mute ${t}ms`);
        expect(outer(shapes), `${t}ms`).toBe(outer(rest('loud')));
        if (t % 4) continue;
        // The waves shorten, never thicken (a 2px band, sampled at 1/16px, reads up to 2.15); while longer than 4px, a 2px band.
        for (const k of ['waveA', 'waveB']) {
          if (!has(shapes, k)) continue;
          const th = thickness(cover({ k: shapes[k] }));
          if (th.length > 8 * 256)
            expect(Math.abs(quantile(th, 0.5) - 2), `${k} ${t}ms`).toBeLessThan(
              0.07
            );
          expect(th[th.length - 1], `${k} widest ${t}ms`).toBeLessThan(2.16);
        }
        if (has(shapes, 'mute')) {
          // The × grows at 2px arms: never wider than Carbon's (its crossing reads 2.83).
          const th = thickness(cover({ k: shapes.mute }));
          expect(th[th.length - 1], `× widest ${t}ms`).toBeLessThan(
            2 * Math.SQRT2 + 0.15
          );
          expect(
            gap(String(shapes.speaker.d), String(shapes.mute.d)),
            `× to speaker ${t}ms`
          ).toBeGreaterThan(1.99);
        }
      }
    }
  }, 60_000);

  it('unmutes to either level in fast-02, the same cut the other way: the × shrinks in 40ms, then the waves open out at their places', async () => {
    for (const to of ['loud', 'quiet'] as const) {
      const { frames, end } = await run('mute', to, 140);
      expect(end).toEqual(rest(to));
      const crossTo = Math.max(
        ...frames.filter((f) => has(f.shapes, 'mute')).map((f) => f.t)
      );
      const wavesFrom = frames.find((f) => waves(f.shapes))!.t;
      expect(crossTo, to).toBeLessThanOrEqual(MUTE_CUT_MS);
      expect(wavesFrom, to).toBeGreaterThan(MUTE_CUT_MS);
      const done = frames.find(
        (f) => JSON.stringify(f.shapes) === JSON.stringify(rest(to))
      )!.t;
      expect(done, to).toBeLessThanOrEqual(MUTE_MS);
      for (const { t, shapes } of frames) noBad(shapes, `mute → ${to} ${t}ms`);
    }
  }, 60_000);

  it('steps between levels with the pulse (280ms), and reverses a cut caught midway from where it is', async () => {
    const step = await run('quiet', 'loud', 320);
    expect(step.end).toEqual(rest('loud'));
    expect(
      step.frames.find(
        (f) => JSON.stringify(f.shapes) === JSON.stringify(rest('loud'))
      )!.t
    ).toBeGreaterThan(250);
    for (const [from, to, back, at] of [
      ['loud', 'mute', 'loud', 20],
      ['loud', 'mute', 'quiet', 60],
      ['mute', 'quiet', 'mute', 20],
      ['mute', 'loud', 'mute', 70],
    ] as const) {
      const { frames, end } = await run(from, to, 400, { at, to: back });
      expect(end, `${from} → ${to} → ${back} at ${at}ms`).toEqual(rest(back));
      const keys = Object.keys(rest('mute'));
      for (const { t, shapes } of frames) {
        expect(Object.keys(shapes)).toEqual(keys);
        noBad(shapes, `${from} → ${to} → ${back} ${t}ms`);
      }
    }
  }, 60_000);

  it("hovers as Volume up / Volume down at loud / quiet (the waves grow 1px in place), and as Volume mute at mute (the ×'s ends 1px further)", () => {
    for (const h of STEPS) {
      for (const k of ['waveA', 'waveB', 'waveC'])
        expect(
          icon.geo({ h, entering: 1, ...volumeRest('loud') })[k],
          `loud ${k}`
        ).toEqual(Up.geo({ h, entering: 1 })[k]);
      // Volume down's hover, 2px left (the level's speaker stays at volume--up's place).
      const [lv, base] = [
        icon.geo({ h, entering: 1, ...volumeRest('quiet') }),
        (icon === VolumeLevelToggle ? VolumeDown : VolumeDownFilled).geo({
          h,
          entering: 1,
        }),
      ];
      for (const k of ['waveA', 'waveB', 'waveC']) {
        const moved = String(base[k].d).replace(/-?\d+(\.\d+)?/g, (v) => v);
        expect(String(lv[k].d).length > 0, k).toBe(moved.length > 0);
      }
      expect(lv.waveA.d).toBe(
        volumeWaves({ a: 1, b: 0, x: 0, g: WAVE_GROW * h }).waveA
      );
      expect(icon.geo({ h, entering: 1, ...volumeRest('mute') })).toEqual(
        Mute.geo({ h, entering: 1 })
      );
    }
    const ends = (d: string) =>
      Math.max(...flatten(d).flatMap((q) => q.pts.map(([x]) => x)));
    expect(
      ends(String(Mute.geo({ h: 1 }).mute.d)) -
        ends(String(Mute.geo({ h: 0 }).mute.d))
    ).toBeCloseTo(MUTE_REACH * Math.SQRT1_2, 3);
  });

  it('renders animated and static at every level (none as mute), with no masks', () => {
    const I = icon;
    for (const initial of [...LEVELS, 'none'] as VolumeLevel[]) {
      const { container } = render(
        <MotionIconProvider animated>
          <I aria-label="t" initial={initial} />
        </MotionIconProvider>
      );
      expect(container.querySelector('mask, clipPath')).toBeNull();
      expect(container.querySelectorAll('[data-k]').length).toBe(
        Object.keys(rest('mute')).length
      );
      expect(
        render(
          <I animated={false} aria-label="t" initial={initial} />
        ).container.querySelector('svg')
      ).not.toBeNull();
    }
    const html = (el: React.ReactElement) => render(el).container.innerHTML;
    expect(html(<I animated={false} initial="none" />)).toBe(
      html(<Mute animated={false} />)
    );
    expect(html(<I animated={false} initial="mute" />)).toBe(
      html(<Mute animated={false} />)
    );
    expect(html(<I animated={false} initial="loud" />)).toBe(
      html(<Up animated={false} />)
    );
    // The old values, deprecated: down is quiet, up loud.
    expect(html(<I animated={false} initial="up" />)).toBe(
      html(<I animated={false} initial="loud" />)
    );
    expect(html(<I animated={false} initial="down" />)).toBe(
      html(<I animated={false} initial="quiet" />)
    );
  });

  it('`muted` mutes from any level and comes back to it; clicks still step mute → down → up; none is taken and never reported', () => {
    const I = icon;
    const svg = (c: HTMLElement) => c.querySelector('svg')!.innerHTML;
    const draw = (s: VolumeLevel) =>
      svg(render(<I animated={false} initial={s} />).container);
    for (const level of ['quiet', 'loud'] as const) {
      const { container, rerender } = render(
        <I animated={false} initial={level} />
      );
      rerender(<I animated={false} initial={level} muted />);
      expect(svg(container), `${level} muted`).toBe(draw('mute'));
      rerender(<I animated={false} initial={level} muted={false} />);
      expect(svg(container), `${level} unmuted`).toBe(draw(level));
      // Controlled: `value` names the level; `muted` wins while set.
      rerender(<I animated={false} value={level} muted />);
      expect(svg(container)).toBe(draw('mute'));
      rerender(<I animated={false} value={level} muted={false} />);
      expect(svg(container)).toBe(draw(level));
    }
    // Uncontrolled clicks: mute → down → up → mute; `none` starts at mute and reports the new names.
    const seen: string[] = [];
    const { container } = render(
      <I animated={false} initial="none" onChange={(s) => seen.push(s)} />
    );
    for (let i = 0; i < 3; i++)
      fireEvent.click(container.querySelector('svg')!);
    expect(seen).toEqual(['quiet', 'loud', 'mute']);
  });
});

describe('Globe', () => {
  it('swings one meridian 120° round the tilted axis, from the limb past edge-on to a curve at R/2, and back on leave', () => {
    expect(globeAt(0).s).toBeCloseTo(-8, 6);
    expect(globeAt(1).s).toBeCloseTo(4.5, 6);
    expect(Globe.geo({ h: 1, entering: 1 }).meridian.d).not.toBe('');
    expect(Globe.geo({ h: 0, entering: 0 })).toEqual(Globe.geo({ h: 0 }));
    // Monotone: it never backs up on the way in.
    let prev = -Infinity;
    for (let i = 0; i <= 50; i++) {
      const { s } = globeAt(i / 50);
      expect(s).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = s;
    }
  });
});

describe('Face dissatisfied', () => {
  it("sweeps the frown's ends 1px round its r 7 centreline; the eyes hold", () => {
    for (const h of STEPS) {
      const sm = frownAt(h);
      expect((frownAt(0).ao - sm.ao) * 7, `sweep h=${h}`).toBeCloseTo(
        FROWN_REACH * h,
        6
      );
      expect(String(FaceDissatisfied.geo({ h }).glyph.d)).toContain('M9 13.5');
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
    name: 'KeyboardOffToggle',
    toggle: KeyboardOffToggle,
    ends: [Keyboard, KeyboardOff],
    statics: [CKeyboard, CKeyboardOff],
    slash: true,
  },
  {
    name: 'FaceDissatisfiedToggle',
    toggle: FaceDissatisfiedToggle,
    ends: [FaceDissatisfied, FaceDissatisfiedFilled],
    statics: [CFaceDissatisfied, CFaceDissatisfiedFilled],
  },
  {
    name: 'VolumeUpToggle',
    toggle: VolumeUpToggle,
    ends: [VolumeUp, VolumeUpFilled],
    statics: [CVolumeUp, CVolumeUpFilled],
  },
];

describe.each(TOGGLES)('$name', ({ toggle, ends, statics, slash }) => {
  it('keeps the same shape keys across h, p and e at every size, never paints NaN or Infinity, and stays inside 36×36', () => {
    // The slash toggle's e runs the kick (0 → 1) and the recoil (0 → −1).
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

  it('equals its hover icons at both ends, at every h and size (both ways for the pulse)', () => {
    for (const size of SIZES) {
      for (const h of STEPS) {
        for (const entering of [1, 0]) {
          expect(
            toggle.geo({ h, p: 0, e: 0, entering }, size),
            `first h=${h} @${size}`
          ).toEqual(ends[0].geo({ h, entering }, size));
          expect(
            toggle.geo({ h, p: 1, e: 0, entering }, size),
            `second h=${h} @${size}`
          ).toEqual(ends[1].geo({ h, entering }, size));
        }
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
  it('logs Δ per icon and size, the gaps and the weights', () => {
    console.log(
      Object.entries(gaps)
        .map(([n, g]) => `${n}: ${g.join(', ')}`)
        .join('\n')
    );
    console.log(
      Object.entries(weights)
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
