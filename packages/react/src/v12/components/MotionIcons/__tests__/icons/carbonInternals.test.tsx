/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import {
  AiLabel as CAiLabel,
  Calendar as CCalendar,
  Checkbox as CCheckbox,
  CheckboxChecked as CCheckboxChecked,
  CheckboxCheckedFilled as CCheckboxCheckedFilled,
  CheckboxIndeterminate as CCheckboxIndeterminate,
  CheckboxIndeterminateFilled as CCheckboxIndeterminateFilled,
  CircleDash as CCircleDash,
  Incomplete as CIncomplete,
  Undo as CUndo,
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
  AiLabel,
  Calendar,
  Checkbox,
  CheckboxChecked,
  CheckboxCheckedFilled,
  CheckboxIndeterminate,
  CheckboxIndeterminateFilled,
  CircleDash,
  DASH_TURN,
  Incomplete,
  Undo,
  checkPts,
  CHECK_W,
} from '../../icons/status/carbonInternals';
import {
  CheckboxStateToggle,
  CheckboxToggle,
} from '../../icons/toggle/checkboxToggles';
import {
  barHalf,
  checkAt,
  checkboxFilledShapes,
  checkboxOutlineShapes,
  glyphCut,
  type CheckboxState,
} from '../../icons/status/carbonInternals';
import type { Frame, FrameStateIcon } from '../../utils/frameIcon';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';

/**
 * Icons Carbon's own components use (carbonInternals.ts, checkboxToggles.ts).
 *
 * Coverage is compared as in opsFillToggles.test.tsx (the same sampler,
 * copied): both drawings sampled at 8×8 per parity pixel, Δ the share of ink
 * pixels whose coverage differs by more than a quarter, gated at 0.5%.
 * Constant weight is measured on the sampled ink: a probe walks a ray and
 * reads the length of the first run of ink (a wall) or of empty (a knockout).
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

const roundedRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

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

function strokeInto(ink: Uint8Array, polys: Poly[], width: number) {
  const r = width / 2;
  /** Mark samples in the box around a–b that `hit` says are inside. */
  const mark = (a: Pt, b: Pt, hit: (x: number, y: number) => boolean) => {
    const [k0, k1] = [
      Math.floor((Math.min(a[0], b[0]) - r - LO) / STEP),
      Math.ceil((Math.max(a[0], b[0]) + r - LO) / STEP),
    ];
    const [j0, j1] = [
      Math.floor((Math.min(a[1], b[1]) - r - LO) / STEP),
      Math.ceil((Math.max(a[1], b[1]) + r - LO) / STEP),
    ];
    for (let j = Math.max(0, j0); j < Math.min(N, j1); j++) {
      for (let k = Math.max(0, k0); k < Math.min(N, k1); k++)
        if (hit(at(k), at(j))) ink[j * N + k] = 1;
    }
  };
  for (const { pts, closed } of polys) {
    const n = closed ? pts.length : pts.length - 1;
    for (let s = 0; s < n; s++) {
      // Each segment with butt ends…
      const [a, b] = [pts[s], pts[(s + 1) % pts.length]];
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
      const l2 = dx * dx + dy * dy;
      if (!l2) continue;
      mark(a, b, (x, y) => {
        const t = ((x - a[0]) * dx + (y - a[1]) * dy) / l2;
        return (
          t >= 0 &&
          t <= 1 &&
          Math.abs((x - a[0]) * dy - (y - a[1]) * dx) / Math.sqrt(l2) <= r
        );
      });
      // …and a round join where it meets the next one.
      if (closed || s < n - 1)
        mark(b, b, (x, y) => Math.hypot(x - b[0], y - b[1]) <= r);
    }
  }
}

/** Frame-engine shapes, sampled. */
function cover(shapes: Shapes): Uint8Array {
  const ink = new Uint8Array(N * N);
  for (const a of Object.values(shapes)) {
    if (Number(a.opacity ?? 1) === 0) continue;
    const n = (k: string) => Number(a[k] ?? 0);
    const polys =
      a.tag === 'rect'
        ? flatten(roundedRect(n('x'), n('y'), n('width'), n('height'), n('rx')))
        : flatten(String(a.d ?? ''));
    if (a.fill === 'none') {
      if (a.stroke && !/^0[ ,]/.test(String(a.strokeDasharray ?? '')))
        strokeInto(ink, polys, Number(a.strokeWidth ?? 1));
    } else fillInto(ink, polys, a.fillRule === 'evenodd');
  }
  return ink;
}

/** A Carbon icon at a size, sampled in the 32-unit grid (moved by `shift`, in units). */
function coverCarbon(
  Icon: CarbonIcon,
  size: number,
  [dx, dy]: Pt = [0, 0]
): { ink: Uint8Array } {
  const { container, unmount } = render(<Icon size={size} />);
  const svg = container.querySelector('svg')!;
  const vb = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const ink = new Uint8Array(N * N);
  svg.querySelectorAll('path').forEach((el) => {
    if (
      el.getAttribute('fill') === 'none' ||
      el.getAttribute('opacity') === '0'
    )
      return;
    const polys = flatten(el.getAttribute('d')!).map(({ pts, closed }) => ({
      pts: pts.map(([x, y]) => [(x * 32) / vb + dx, (y * 32) / vb + dy] as Pt),
      closed,
    }));
    fillInto(ink, polys, el.getAttribute('fill-rule') === 'evenodd');
  });
  unmount();
  return { ink };
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

// ── Cases ────────────────────────────────────────────────────────────────────

const SIZES = [16, 20, 24, 32];
const HS = [0, 0.1, 0.25, 0.4, 0.5, 0.75, 0.9, 1];
const GATE = 0.005;
const deg = (a: number): Pt => [
  Math.cos((a * Math.PI) / 180),
  Math.sin((a * Math.PI) / 180),
];

/** A probe at hover h: a ray, and what it should find (a wall of ink, or a knockout) and how wide. */
type Probe = (h: number) => { from: Pt; dir: Pt; want: 0 | 1; w: number };
const wall =
  (from: Pt, dir: Pt = [1, 0], w = 2): Probe =>
  () => ({ from, dir, want: 1, w });
/** Out from the centre through the middle of a dash that turns DASH_TURN clockwise over the hover. */
const turning =
  (a: number): Probe =>
  (h) => ({ from: [16, 16], dir: deg(a + DASH_TURN * h), want: 1, w: 2 });
/** The check's knockout, across its long arm at the middle. */
const checkGap: Probe = (h) => {
  const [, b, c] = checkPts(h);
  const mid: Pt = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
  const n: Pt = [Math.SQRT1_2, Math.SQRT1_2];
  return {
    from: [mid[0] - 2.5 * n[0], mid[1] - 2.5 * n[1]],
    dir: n,
    want: 0,
    w: CHECK_W,
  };
};

interface HoverCase {
  name: string;
  icon: FrameHoverIcon;
  carbon: CarbonIcon;
  probes: Probe[];
}
const HOVERS: HoverCase[] = [
  // The shaft's arc (r 6–8 about 20, 18), across its left side; the head's shaft at y 10–12.
  {
    name: 'Undo',
    icon: Undo,
    carbon: CUndo,
    probes: [wall([9, 18]), wall([16, 8], [0, 1])],
  },
  // The page's left wall, the divider (rides up with the header) and a ring.
  {
    name: 'Calendar',
    icon: Calendar,
    carbon: CCalendar,
    probes: [
      wall([-1, 20]),
      wall([16, 7], [0, 1]),
      (h) => ({ from: [8 - h, 3 - 2 * h], dir: [1, 0], want: 1, w: 2 }),
    ],
  },
  {
    name: 'CircleDash',
    icon: CircleDash,
    carbon: CCircleDash,
    probes: [turning(9), turning(225)],
  },
  {
    name: 'Incomplete',
    icon: Incomplete,
    carbon: CIncomplete,
    probes: [turning(20), turning(-60)],
  },
  {
    name: 'Checkbox',
    icon: Checkbox,
    carbon: CCheckbox,
    probes: [wall([-1, 16]), wall([16, -1], [0, 1])],
  },
  {
    name: 'CheckboxChecked',
    icon: CheckboxChecked,
    carbon: CCheckboxChecked,
    probes: [wall([-1, 16]), (h) => ({ ...checkGap(h), want: 1 })],
  },
  {
    name: 'CheckboxCheckedFilled',
    icon: CheckboxCheckedFilled,
    carbon: CCheckboxCheckedFilled,
    probes: [checkGap],
  },
  {
    name: 'CheckboxIndeterminate',
    icon: CheckboxIndeterminate,
    carbon: CCheckboxIndeterminate,
    probes: [wall([-1, 16]), wall([16, 9], [0, 1], 4)],
  },
  {
    name: 'CheckboxIndeterminateFilled',
    icon: CheckboxIndeterminateFilled,
    carbon: CCheckboxIndeterminateFilled,
    probes: [() => ({ from: [16, 9], dir: [0, 1], want: 0, w: 4 })],
  },
  {
    name: 'AiLabel',
    icon: AiLabel,
    carbon: CAiLabel,
    probes: [wall([-3, 24]), wall([20, -3], [0, 1])],
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

const noNaN = (shapes: Shapes, at: string) => {
  for (const [k, attrs] of Object.entries(shapes)) {
    for (const [a, v] of Object.entries(attrs))
      expect(
        /NaN|Infinity|undefined/.test(String(v)),
        `${k}.${a} at ${at}`
      ).toBe(false);
  }
};

describe.each(HOVERS)('$name', ({ icon, carbon, probes }) => {
  it('keeps the same shape keys at every h and size, and never paints NaN or Infinity', () => {
    for (const size of SIZES) {
      const rest = Object.keys(icon.geo({ h: 0 }, size)).sort();
      for (const h of HS) {
        const shapes = icon.geo({ h }, size);
        expect(Object.keys(shapes).sort(), `h=${h} @${size}`).toEqual(rest);
        noNaN(shapes, `h=${h} @${size}`);
      }
    }
  });

  it("rests on Carbon's icon at every size (as the parity story measures)", () => {
    for (const size of SIZES) {
      grid(size);
      expect(
        delta(
          cover(icon.geo({ h: 0 }, size)),
          coverCarbon(carbon, size).ink,
          true
        ),
        `@${size}`
      ).toBeLessThan(GATE);
    }
  });

  it('moves on hover, at constant line weight (stroke widths and measured walls hold)', () => {
    expect(JSON.stringify(icon.geo({ h: 1 }))).not.toBe(
      JSON.stringify(icon.geo({ h: 0 }))
    );
    const rest = icon.geo({ h: 0 });
    grid(32);
    for (const h of HS) {
      const shapes = icon.geo({ h });
      for (const [k, a] of Object.entries(shapes)) {
        expect(a.strokeWidth, `${k} h=${h}`).toBe(rest[k].strokeWidth);
        expect(a.transform).toBeUndefined();
      }
      const ink = cover(shapes);
      probes.forEach((probe, i) => {
        const { from, dir, want, w } = probe(h);
        expect(
          Math.abs(run(ink, from, dir, 20, want) - w),
          `probe ${i} h=${h}`
        ).toBeLessThan(0.1);
      });
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
    fireEvent.mouseEnter(svg);
    // animated={false}: Carbon's art where the icon has one (decision 5), else the rest geometry.
    const still = render(<Icon animated={false} aria-label="i" />);
    expect(still.container.querySelector('svg')).not.toBeNull();
    expect(!!still.container.querySelector('[data-k]')).toBe(
      !(Icon as { static?: unknown }).static
    );
  });
});

// ── Specific motion ──────────────────────────────────────────────────────────

describe('motion details', () => {
  it("Undo is Redo's hover mirrored: the head reaches 4px left, the curl holds", () => {
    grid(32);
    const [rest, hov] = [cover(Undo.geo({ h: 0 })), cover(Undo.geo({ h: 1 }))];
    // The head's tip moves from x 4 to x 0 along y 11; the curl's right edge (x 28) holds.
    expect(run(rest, [-3, 11], [1, 0], 10, 1)).toBeGreaterThan(0);
    const tip = (ink: Uint8Array) => {
      for (let x = -3; x < 10; x += STEP)
        if (run(ink, [x, 11], [1, 0], STEP, 1) > 0) return x;
      return NaN;
    };
    expect(tip(rest) - tip(hov)).toBeCloseTo(4, 1);
    expect(run(rest, [27, 18], [1, 0], 3, 1)).toBeCloseTo(
      run(hov, [27, 18], [1, 0], 3, 1),
      2
    );
  });

  it('Calendar: the rings stand 2px proud of the page and 2px into the header at every h', () => {
    grid(32);
    for (const h of HS) {
      const ink = cover(Calendar.geo({ h }));
      const top = 4 - 2 * h;
      // Down the ring's middle: ink from the ring's top (top − 2) to the header's inside, plus 2px more.
      expect(run(ink, [11 - h, top - 3], [0, 1], 12, 1), `h=${h}`).toBeCloseTo(
        6,
        1
      );
      // Down the page between the rings: the 2px top wall, then the header's 4px inside, then the divider.
      expect(run(ink, [16, top - 1], [0, 1], 12, 0) - 1, `h=${h}`).toBeCloseTo(
        0,
        1
      );
      expect(run(ink, [16, top + 1], [0, 1], 12, 0), `h=${h}`).toBeCloseTo(
        4,
        1
      );
    }
  });

  it('Circle dash keeps ten dashes at 18° on, 18° off as it grows and turns', () => {
    grid(32);
    for (const h of [0, 1]) {
      const ink = cover(CircleDash.geo({ h }));
      const r = 13 + 2 * h;
      let [dashes, prev] = [0, 0];
      for (let a = 0.5; a < 360; a += 1) {
        const [x, y] = [
          16 + r * Math.cos((a * Math.PI) / 180),
          16 + r * Math.sin((a * Math.PI) / 180),
        ];
        const v = run(ink, [x, y], [1, 0], STEP, 1) > 0 ? 1 : 0;
        // Turned 40.4°: hovered, 2.5° is in a gap and 56.5° on a dash; at rest the reverse.
        if (a === 2.5) expect(v, `2.5° at h=${h}`).toBe(h ? 0 : 1);
        if (a === 56.5) expect(v, `56.5° at h=${h}`).toBe(h ? 1 : 0);
        if (v && !prev) dashes++;
        prev = v;
      }
      expect(dashes, `h=${h}`).toBe(10);
    }
  });

  it('Incomplete: the half disc grows 2px in radius with its flat edge on the centre line', () => {
    grid(32);
    const ink = cover(Incomplete.geo({ h: 1 }));
    expect(run(ink, [-3, 16], [1, 0], 30, 1)).toBeCloseTo(16, 1);
  });

  it('Incomplete: the dashes turn one pitch as a full ring behind the disc, cut at its flat edge, ending on four even dashes', () => {
    const d = (h: number) => String(Incomplete.geo({ h }).dashes.d);
    const pts = (h: number) => flatten(d(h)).flatMap((q) => q.pts);
    const count = (h: number) => (d(h).match(/M/g) ?? []).length;
    for (const h of HS) {
      // No dash ever reaches past the flat edge (x = 16) into the disc's side.
      for (const [x] of pts(h))
        expect(x, `h=${h}`).toBeGreaterThanOrEqual(16 - 1e-3);
    }
    // The first half of the turn, a dash comes out from behind the disc at the top (cut on the flat edge);
    // the second half, the bottom one goes behind it.
    const cutAt = (h: number) =>
      pts(h).filter(([x]) => Math.abs(x - 16) < 1e-3);
    expect(
      cutAt(0.25).some(([, y]) => y < 16) &&
        !cutAt(0.25).some(([, y]) => y > 16)
    ).toBe(true);
    expect(
      cutAt(0.75).some(([, y]) => y > 16) &&
        !cutAt(0.75).some(([, y]) => y < 16)
    ).toBe(true);
    expect(count(0.25)).toBe(5);
    expect(count(0.75)).toBe(5);
    // Hovered: four whole dashes, none on the cut, each a dash pitch on from where it rested, all spaced evenly.
    expect(count(0)).toBe(4);
    expect(count(1)).toBe(4);
    for (const [x] of pts(1))
      expect(Math.abs(x - 16), 'no stub on the flat edge').toBeGreaterThan(1);
    const spans = flatten(d(1))
      .map((q) => {
        const as = q.pts.map(
          ([x, y]) => (Math.atan2(y - 16, x - 16) * 180) / Math.PI
        );
        return [Math.min(...as), Math.max(...as)];
      })
      .sort((p, q) => p[0] - q[0]);
    const gaps = [
      spans[0][0] + 90,
      ...spans.slice(1).map((s, i) => s[0] - spans[i][1]),
      90 - spans[3][1],
    ];
    for (const g of gaps) expect(g).toBeGreaterThan(19.4);
    for (const g of gaps) expect(g).toBeLessThan(20.7);
    for (const [a0, a1] of spans) expect(a1 - a0).toBeCloseTo(20, 0);
    // Each dash keeps its 2px band.
    grid(32);
    for (const h of HS)
      expect(
        run(
          cover(Incomplete.geo({ h })),
          [16, 16],
          deg(-20 + DASH_TURN * h),
          20,
          1
        ),
        `h=${h}`
      ).toBeCloseTo(2, 1);
  });
});

// ── Toggles ──────────────────────────────────────────────────────────────────

const STEPS = [0, 0.1, 0.25, 0.4, 0.5, 0.75, 0.9, 1];
const frames = STEPS.flatMap((h) =>
  STEPS.flatMap((p) => [
    { h, p, e: 0 },
    { h, p: 1, e: p },
    { h, p, e: p / 2 },
  ])
);

interface ToggleCase {
  name: string;
  toggle: FrameToggleIcon<'unchecked' | 'checked'>;
  carbon: readonly [CarbonIcon, CarbonIcon];
  ends: readonly [FrameHoverIcon, FrameHoverIcon];
}
const TOGGLES: ToggleCase[] = [
  {
    name: 'CheckboxToggle',
    toggle: CheckboxToggle.pick({}),
    carbon: [CCheckbox, CCheckboxCheckedFilled],
    ends: [Checkbox, CheckboxCheckedFilled],
  },
  {
    name: 'CheckboxToggle filled={false}',
    toggle: CheckboxToggle.pick({ filled: false }),
    carbon: [CCheckbox, CCheckboxChecked],
    ends: [Checkbox, CheckboxChecked],
  },
];

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
        noNaN(shapes, `${JSON.stringify(fr)} @${size}`);
      }
    }
  });

  it("rests on Carbon's static icons at both ends and every size", () => {
    for (const size of SIZES) {
      grid(size);
      for (const p of [0, 1] as const) {
        expect(
          delta(
            cover(toggle.geo({ h: 0, p, e: 0 }, size)),
            coverCarbon(carbon[p], size).ink,
            true
          ),
          `p=${p} @${size}`
        ).toBeLessThan(GATE);
      }
    }
  });

  it('both ends are the hover icons, at every h', () => {
    for (const h of HS) {
      const [off, on] = [
        toggle.geo({ h, p: 0, e: 0 }),
        toggle.geo({ h, p: 1, e: 0 }),
      ];
      expect(on, `on h=${h}`).toEqual(ends[1].geo({ h }));
      if (name === 'CheckboxToggle')
        expect(off, `off h=${h}`).toEqual(ends[0].geo({ h }));
      else {
        // The outline toggle's undrawn check is a zero-length dash; the box is checkbox's own path.
        expect(off.box).toEqual(ends[0].geo({ h }).box);
        expect(String(off.check.strokeDasharray).startsWith('0 ')).toBe(true);
      }
    }
  });

  it('keeps its line weight through hover and toggle', () => {
    const rest = toggle.geo({ h: 0, p: 0, e: 0 });
    for (const fr of frames) {
      for (const [k, a] of Object.entries(toggle.geo(fr)))
        expect(a.strokeWidth, `${k} ${JSON.stringify(fr)}`).toBe(
          rest[k].strokeWidth
        );
    }
  });

  it('empties back to the unchecked box', () => {
    for (const size of SIZES) {
      grid(size);
      for (const h of [0, 0.5, 1])
        expect(
          delta(
            cover(toggle.geo({ h, p: 1, e: 1 }, size)),
            cover(toggle.geo({ h, p: 0, e: 0 }, size))
          )
        ).toBe(0);
    }
  });

  it.each(['unchecked', 'checked'] as const)(
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
        initial === 'unchecked' ? 'checked' : 'unchecked',
        initial === 'unchecked'
      );
      const still = render(
        <Icon initial={initial} animated={false} aria-label="t" />
      );
      expect(still.container.querySelector('svg')).not.toBeNull();
    }
  );
});

describe('CheckboxToggle: the check is a knockout as the fill passes', () => {
  it('appears inside the fill only', () => {
    grid(32);
    const gapAt = (p: number) => {
      const { from, dir } = checkGap(0);
      return run(cover(CheckboxToggle.geo({ h: 0, p, e: 0 })), from, dir, 5, 0);
    };
    // Before the fill reaches the arm, the box is empty there (one long empty run); once it has, a 2.25 knockout.
    expect(gapAt(0)).toBeGreaterThan(4);
    expect(gapAt(1)).toBeCloseTo(CHECK_W, 1);
  });
});

// ── Three-state checkbox ─────────────────────────────────────────────────────

const ALL: CheckboxState[] = ['unchecked', 'indeterminate', 'checked'];
interface StateCase {
  name: string;
  icon: FrameStateIcon<CheckboxState>;
  filled: boolean;
  carbon: Record<CheckboxState, CarbonIcon>;
  hovers: Record<CheckboxState, FrameHoverIcon>;
}
const STATE_CASES: StateCase[] = [
  {
    name: 'CheckboxStateToggle',
    icon: CheckboxStateToggle.pick({}),
    filled: true,
    carbon: {
      unchecked: CCheckbox,
      indeterminate: CCheckboxIndeterminateFilled,
      checked: CCheckboxCheckedFilled,
    },
    hovers: {
      unchecked: Checkbox,
      indeterminate: CheckboxIndeterminateFilled,
      checked: CheckboxCheckedFilled,
    },
  },
  {
    name: 'CheckboxStateToggle filled={false}',
    icon: CheckboxStateToggle.pick({ filled: false }),
    filled: false,
    carbon: {
      unchecked: CCheckbox,
      indeterminate: CCheckboxIndeterminate,
      checked: CCheckboxChecked,
    },
    hovers: {
      unchecked: Checkbox,
      indeterminate: CheckboxIndeterminate,
      checked: CheckboxChecked,
    },
  },
];
const restOf = (
  icon: FrameStateIcon<CheckboxState>,
  s: CheckboxState,
  h = 0
): Frame => ({ h, ...icon.rest(s) });
const KS = [0, 0.1, 0.2, 0.35, 0.4, 0.45, 0.6, 0.8, 0.95, 1];
const stateFrames = STEPS.flatMap((h) =>
  KS.flatMap((k) =>
    STEPS.flatMap((p) => [
      { h, p, e: 0, k },
      { h, p: 1, e: p, k },
      { h, p, e: p / 2, k },
    ])
  )
);

type Run = {
  key: string;
  to: number;
  ms: number;
  done?: () => void;
  from: number;
};
/** Runs a change with tweens that record themselves; `play(t)` moves each to fraction t (linear) and finishes it at 1. */
function drive(
  icon: FrameStateIcon<CheckboxState>,
  fr: Frame,
  prev: CheckboxState,
  next: CheckboxState
) {
  const runs: Run[] = [];
  const tween = (
    key: string,
    to: number,
    opts: { duration: number },
    done?: () => void
  ) => {
    runs.push({
      key,
      to,
      ms: Math.round(opts.duration * 1000),
      done,
      from: fr[key],
    });
    return { stop: () => {} } as never;
  };
  icon.change(prev, next, fr, tween, () => {});
  const play = (t: number) => {
    for (const r of runs) fr[r.key] = r.from + (r.to - r.from) * t;
    if (t >= 1) runs.forEach((r) => r.done?.());
  };
  return { runs, play };
}

describe.each(STATE_CASES)('$name', ({ icon, filled, carbon, hovers }) => {
  it('keeps the same shape keys at every frame and size, and never paints NaN or Infinity', () => {
    for (const size of SIZES) {
      const rest = Object.keys(
        icon.geo(restOf(icon, 'unchecked'), size)
      ).sort();
      for (const fr of stateFrames) {
        const shapes = icon.geo(fr, size);
        expect(
          Object.keys(shapes).sort(),
          `${JSON.stringify(fr)} @${size}`
        ).toEqual(rest);
        noNaN(shapes, `${JSON.stringify(fr)} @${size}`);
        for (const [k, a] of Object.entries(shapes))
          expect(a.strokeWidth, `${k} ${JSON.stringify(fr)}`).toBe(
            icon.geo(restOf(icon, 'unchecked'))[k].strokeWidth
          );
      }
    }
  });

  it("rests on Carbon's static icon in every state and at every size", () => {
    for (const size of SIZES) {
      grid(size);
      for (const s of ALL)
        expect(
          delta(
            cover(icon.geo(restOf(icon, s), size)),
            coverCarbon(carbon[s], size).ink,
            true
          ),
          `${s} @${size}`
        ).toBeLessThan(GATE);
    }
  });

  it("hovers as each state's own icon, at every h", () => {
    for (const h of HS) {
      grid(32);
      for (const s of ALL)
        expect(
          delta(
            cover(icon.geo(restOf(icon, s, h))),
            cover(hovers[s].geo({ h }))
          ),
          `${s} h=${h}`
        ).toBe(0);
      // Unchecked and checked are the approved two-state toggles' geometry exactly.
      const two = filled ? checkboxFilledShapes : checkboxOutlineShapes;
      for (const fr of STEPS.flatMap((p) => [
        { h, p, e: 0 },
        { h, p: 1, e: p },
      ])) {
        const mine = icon.geo({ ...fr, k: 1 });
        const theirs = two(fr);
        for (const k of Object.keys(theirs))
          expect(mine[k], `${k} ${JSON.stringify(fr)}`).toEqual(theirs[k]);
      }
      if (!filled)
        expect(icon.geo(restOf(icon, 'indeterminate', h)).bar.d).toBe(
          CheckboxIndeterminate.geo({ h }).bar.d
        );
    }
  });

  it('keeps the bar 4px tall and the check 2.25px wide through the match cut', () => {
    grid(32);
    for (const h of [0, 1]) {
      for (const k of KS) {
        const ink = cover(icon.geo({ h, p: 1, e: 0, k }));
        const g = glyphCut(k);
        const want = filled ? 0 : 1;
        if (g.check) {
          const [, b, c] = checkAt(h, g.small);
          const mid: Pt = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
          const n: Pt = [Math.SQRT1_2, Math.SQRT1_2];
          // The long arm is at least 1.3px long even fully small, so a probe across its middle sees the full weight.
          expect(
            run(ink, [mid[0] - 2.5 * n[0], mid[1] - 2.5 * n[1]], n, 5, want),
            `k=${k} h=${h}`
          ).toBeCloseTo(CHECK_W, 1);
        } else {
          expect(
            run(ink, [16, 9], [0, 1], 14, want),
            `k=${k} h=${h}`
          ).toBeCloseTo(4, 1);
          // Across the box's inside: the bar (ink, or a knockout in the fill) at its length for this frame.
          expect(
            run(ink, [6.5 - 2 * h, 16], [1, 0], 20, want),
            `bar length k=${k} h=${h}`
          ).toBeCloseTo(2 * barHalf(h, g.small), 1);
        }
      }
    }
  });

  // Every transition, both directions: the right tweens on the right timing, and it lands on the next state's icon.
  const PAIRS = ALL.flatMap((a) =>
    ALL.filter((b) => b !== a).map((b) => [a, b] as const)
  );
  const ms = motionTokens.duration;
  it.each(PAIRS)(
    '%s → %s lands on the static icon, on the house timing',
    (prev, next) => {
      const fr = restOf(icon, prev);
      const { runs, play } = drive(icon, fr, prev, next);
      const keys = runs.map((r) => r.key).sort();
      if (prev === 'unchecked')
        expect(keys).toEqual(['p']); // the fill (or draw) comes in
      else if (next === 'unchecked')
        expect(keys).toEqual([filled ? 'e' : 'e']); // the hole (or wipe) takes it out
      else expect(keys).toEqual(['k']); // the match cut; the fill holds
      const timing = runs[0].ms;
      expect(timing).toBe(next === 'unchecked' ? ms.fast02 : ms.moderate01);
      // In between: constant keys, no NaN, and the box never moves.
      const box = Object.keys(icon.geo(fr));
      for (const t of [0.1, 0.3, 0.5, 0.7, 0.9]) {
        play(t);
        const shapes = icon.geo(fr);
        expect(Object.keys(shapes)).toEqual(box);
        noNaN(shapes, `${prev}→${next} t=${t}`);
      }
      play(1);
      expect(icon.geo(fr)).toEqual(icon.geo(restOf(icon, next)));
      for (const size of [16, 32]) {
        grid(size);
        expect(
          delta(
            cover(icon.geo(fr, size)),
            coverCarbon(carbon[next], size).ink,
            true
          ),
          `@${size}`
        ).toBeLessThan(GATE);
      }
    }
  );

  it.each(PAIRS)(
    '%s → %s, turned back half-way, returns to where it started',
    (prev, next) => {
      const fr = restOf(icon, prev);
      drive(icon, fr, prev, next).play(0.5);
      drive(icon, fr, next, prev).play(1);
      expect(icon.geo(fr)).toEqual(icon.geo(restOf(icon, prev)));
    }
  );

  it.each(
    PAIRS.flatMap(([a, b]) =>
      ALL.filter((c) => c !== b).map((c) => [a, b, c] as const)
    )
  )('%s → %s, redirected half-way to %s, lands there', (a, b, c) => {
    const fr = restOf(icon, a);
    drive(icon, fr, a, b).play(0.5);
    drive(icon, fr, b, c).play(1);
    expect(icon.geo(fr)).toEqual(icon.geo(restOf(icon, c)));
  });

  it('is controlled by `value`, cycles on click when uncontrolled, and reports aria-pressed', () => {
    const Icon = icon;
    const onChange = vi.fn();
    const { container, rerender } = render(
      <MotionIconProvider animated>
        <Icon value="unchecked" aria-label="c" />
      </MotionIconProvider>
    );
    expect(container.querySelector('mask, clipPath')).toBeNull();
    act(() => {
      rerender(
        <MotionIconProvider animated>
          <Icon value="indeterminate" aria-label="c" />
        </MotionIconProvider>
      );
    });
    act(() => {
      rerender(
        <MotionIconProvider animated>
          <Icon value="checked" aria-label="c" />
        </MotionIconProvider>
      );
    });
    const un = render(
      <MotionIconProvider animated>
        <Icon initial="unchecked" onChange={onChange} aria-label="c" />
      </MotionIconProvider>
    );
    const svg = un.container.querySelector('svg')!;
    fireEvent.click(svg);
    fireEvent.click(svg);
    fireEvent.click(svg);
    expect(onChange.mock.calls.map((c) => c[0])).toEqual([
      'indeterminate',
      'checked',
      'unchecked',
    ]);
    for (const [s, pressed] of [
      ['unchecked', 'false'],
      ['indeterminate', 'mixed'],
      ['checked', 'true'],
    ] as const) {
      for (const animated of [true, false]) {
        const b = render(
          <Icon value={s} asButton animated={animated} aria-label="c" />
        );
        expect(
          b.container.querySelector('button')!.getAttribute('aria-pressed'),
          `${s} animated=${animated}`
        ).toBe(pressed);
        b.unmount();
      }
    }
  });
});
