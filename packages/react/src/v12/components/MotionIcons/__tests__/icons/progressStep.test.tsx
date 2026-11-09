/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CheckmarkOutline as CCheckmarkOutline,
  CircleDash as CCircleDash,
  Incomplete as CIncomplete,
  Warning as CWarning,
} from '@carbon/icons-react';
import {
  FrameController,
  manualScheduler,
  setScheduler,
  type Shapes,
} from '@carbon-labs/motion-icons-core/engine';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import {
  CircleDashSpec,
  IncompleteSpec,
} from '@carbon-labs/motion-icons-core/icons/status/carbonInternals';
import { WarningSpec } from '@carbon-labs/motion-icons-core/icons/status/alerts';
import { CheckmarkOutlineToggleSpec } from '@carbon-labs/motion-icons-core/icons/toggle/checkToggles';
import {
  CHECK_SMALL,
  PROGRESS_STEP_REST,
  ProgressStepSpec,
  bangSmall,
  progressStepShapes,
  type ProgressStepState,
} from '@carbon-labs/motion-icons-core/icons/status/progressStep';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon } from '../../utils/frameIcon';
import { ProgressStep } from '../../index';

/**
 * ProgressStep (status/progressStep.ts): one icon for a progress step's
 * state, driven by `value`. Checked: every state rests on Carbon's icon at
 * every size (and on the set's own CircleDash, Incomplete, CheckmarkOutline
 * and Warning geometry); every transition the kit makes runs and lands on
 * its target, from rest and from mid-flight; line weight holds in every
 * frame; the timing reads the tokens; reduced motion and motion off; and it
 * is an indicator (no clicks, no name, disabled holds still).
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

const SIZES = [16, 20, 24, 32] as const;
const GATE = 0.005;
const STATES: ProgressStepState[] = [
  'incomplete',
  'current',
  'complete',
  'invalid',
];
const CARBON: Record<ProgressStepState, CarbonIcon> = {
  incomplete: CCircleDash as unknown as CarbonIcon,
  current: CIncomplete as unknown as CarbonIcon,
  complete: CCheckmarkOutline as unknown as CarbonIcon,
  invalid: CWarning as unknown as CarbonIcon,
};
/** Every transition the kit's ProgressIndicator makes. */
const TRANSITIONS: [ProgressStepState, ProgressStepState][] = [
  ['incomplete', 'current'],
  ['current', 'complete'],
  ['complete', 'current'],
  ['current', 'incomplete'],
  ['incomplete', 'invalid'],
  ['current', 'invalid'],
  ['complete', 'invalid'],
  ['invalid', 'incomplete'],
  ['invalid', 'current'],
  ['invalid', 'complete'],
  ['complete', 'incomplete'],
  ['incomplete', 'complete'],
];
const KEYS = ['ring', 'fill', 'check', 'bang'];
const FRAME = 1000 / 60;
const rest = (s: ProgressStepState, size?: number) =>
  progressStepShapes(PROGRESS_STEP_REST[s], size);
/** A path's subpaths, in any order. */
const subs = (d: unknown) => String(d).split(/(?=M)/).filter(Boolean).sort();
const ds = (sh: Shapes) =>
  Object.fromEntries(Object.entries(sh).map(([k, a]) => [k, String(a.d)]));

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
afterEach(() => {
  cleanup();
  setScheduler(null);
});

/** Run a change on the engine with a manual clock; every frame's shapes, and the controller. */
async function play(
  from: ProgressStepState,
  to: ProgressStepState,
  size = 32,
  ms = 700,
  interrupt?: [number, ProgressStepState]
) {
  const clock = manualScheduler(FRAME);
  setScheduler(clock);
  const frames: Shapes[] = [];
  const ctl = new FrameController<ProgressStepState>(
    ProgressStepSpec as never,
    (s) => frames.push(s),
    size,
    from
  );
  ctl.setState(to);
  for (let t = 0; t < ms; t += FRAME) {
    if (interrupt && Math.abs(t - interrupt[0]) < FRAME / 2)
      ctl.setState(interrupt[1]);
    clock.advance(FRAME);
    // Each frame ends with a microtask turn, as in a browser (a tween completes in one).
    await Promise.resolve();
  }
  return { frames, ctl };
}

describe('ProgressStep at rest', () => {
  it("rests on Carbon's icon in every state at every size (as the parity story measures)", () => {
    for (const s of STATES) {
      for (const size of SIZES) {
        grid(size);
        expect(
          delta(cover(rest(s, size)), coverCarbon(CARBON[s], size).ink),
          `${s} @${size}`
        ).toBeLessThan(GATE);
      }
    }
  });

  it("rests on the set's own CircleDash, Incomplete, CheckmarkOutline and Warning drawings", () => {
    for (const size of SIZES) {
      expect(subs(rest('incomplete', size).ring.d)).toEqual(
        subs(CircleDashSpec.geo({ h: 0 }, size).dashes.d)
      );
      const inc = IncompleteSpec.geo({ h: 0 }, size);
      expect(subs(rest('current', size).ring.d)).toEqual(subs(inc.dashes.d));
      expect(rest('current', size).fill.d).toBe(inc.half.d);
      const check = CheckmarkOutlineToggleSpec.geo({ h: 0, p: 1, e: 0 }, size);
      expect(rest('complete', size).ring.d).toBe(check.ring.d);
      expect(rest('complete', size).check.d).toBe(check.check.d);
      const warn = WarningSpec.geo({ h: 0 }, size);
      expect(rest('invalid', size).ring.d).toBe(warn.ring.d);
      // Warning's "!" is the knockout path of its (empty) fill: the same subpaths after the fill's.
      expect(
        String(warn.fill.d).endsWith(String(rest('invalid', size).bang.d))
      ).toBe(true);
    }
  });
});

describe.each(TRANSITIONS)('%s → %s', (from, to) => {
  it('runs, keeps its keys and finite numbers in every frame, and lands exactly on the target', async () => {
    for (const size of [16, 32]) {
      const { frames, ctl } = await play(from, to, size);
      expect(frames.length, 'it animates').toBeGreaterThan(4);
      // It moves: some frame differs from both ends.
      const [a, b] = [
        JSON.stringify(ds(rest(from, size))),
        JSON.stringify(ds(rest(to, size))),
      ];
      expect(
        frames.some((f) => {
          const j = JSON.stringify(ds(f));
          return j !== a && j !== b;
        })
      ).toBe(true);
      for (const f of frames) {
        expect(Object.keys(f)).toEqual(KEYS);
        for (const a of Object.values(f))
          for (const v of Object.values(a))
            expect(/NaN|Infinity|undefined/.test(String(v))).toBe(false);
      }
      expect(ctl.frame).toMatchObject(PROGRESS_STEP_REST[to]);
      expect(ds(frames[frames.length - 1])).toEqual(ds(rest(to, size)));
      ctl.destroy();
      setScheduler(null);
    }
  });

  it('lands on the target when changed again mid-way, from wherever it is', async () => {
    for (const other of STATES.filter((s) => s !== to)) {
      for (const at of [30, 90, 150, 300]) {
        const { frames, ctl } = await play(from, to, 32, 1100, [at, other]);
        expect(ctl.frame, `${other} at ${at}ms`).toMatchObject(
          PROGRESS_STEP_REST[other]
        );
        expect(ds(frames[frames.length - 1]), `${other} at ${at}ms`).toEqual(
          ds(rest(other, 32))
        );
        ctl.destroy();
        setScheduler(null);
      }
    }
  });

  it('keeps constant line weight: the ring on its 2px band, the check a 2px stroke, the "!" its 2px bar and dot', async () => {
    for (const size of [16, 32]) {
      const { frames, ctl } = await play(from, to, size);
      for (const f of frames) {
        // Ring: each stretch on a 2px band (its arcs 2px apart, its corners on them; Carbon's dashes within ±0.1),
        // at r 12–14 or, shrunk before the ring opens, 10–12.
        for (const sub of String(f.ring.d).split(/(?=M)/).filter(Boolean)) {
          const radii = [...sub.matchAll(/A([\d.]+) /g)].map((m) => +m[1]);
          const [lo, hi] = [Math.min(...radii), Math.max(...radii)];
          if (hi > lo) expect(hi - lo, 'band width').toBeCloseTo(2, 1);
          expect(hi).toBeLessThan(14.12);
          expect(lo).toBeGreaterThan(9.88);
          for (const m of sub.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)) {
            const r = Math.hypot(+m[1] - 16, +m[2] - 16);
            expect(
              Math.min(Math.abs(r - lo), Math.abs(r - hi)),
              `ring corner r ${r}`
            ).toBeLessThan(0.12);
          }
        }
        expect(f.check.strokeWidth).toBe(2);
        expect(f.check.transform).toBeUndefined();
        if (f.bang.d) {
          // The bar: a 2px-wide rect (x 15–17); the dot keeps Carbon's radius.
          const bar = /^M([\d.]+) [\d.]+H([\d.]+)/.exec(String(f.bang.d))!;
          expect(+bar[2] - +bar[1]).toBeCloseTo(2, 3);
          // The dot (once the "!" has drawn down to it) keeps Carbon's radius.
          for (const r of String(f.bang.d).matchAll(/A([\d.]+) /g))
            expect(+r[1]).toBeCloseTo(size === 16 ? 1.6 : 1.5, 3);
        }
        for (const a of Object.values(f)) expect(a.transform).toBeUndefined();
      }
      ctl.destroy();
      setScheduler(null);
    }
  });
});

describe('ProgressStep timing', () => {
  const IN = motionTokens.duration.moderate01 / 1000;
  const OUT = motionTokens.duration.fast02 / 1000;
  const QUICK = motionTokens.duration.fast02 / 1000;
  const QUICKER = motionTokens.duration.fast01 / 1000;
  const r4 = (x: number) => +x.toFixed(4);
  /** The tweens a change starts, by key: [duration, to]. */
  function tweens(from: ProgressStepState, to: ProgressStepState) {
    const runs: Record<string, [number, number]> = {};
    const fr = { h: 0, ...PROGRESS_STEP_REST[from] };
    ProgressStepSpec.change(
      from,
      to,
      fr,
      ((key: string, v: number, o: { duration: number }) => {
        runs[key] = [r4(o.duration), v];
        return { stop: () => {} };
      }) as never,
      () => {}
    );
    return runs;
  }
  it('steps forward in phases (spin moderate-01, close fast-02, open moderate-01), the glyph drawing fast-00 into the open; back plays them backwards', () => {
    const [SPIN, CLOSE, OPEN, LAG] = [
      IN,
      QUICK,
      IN,
      motionTokens.duration.fast00 / 1000,
    ];
    const SPAN = Math.max(OPEN, LAG + IN); // the open with the glyph's draw
    expect(tweens('incomplete', 'current')).toEqual({ t: [SPIN, 1] });
    expect(tweens('current', 'incomplete')).toEqual({ t: [SPIN, 0] });
    expect(tweens('current', 'complete')).toEqual({
      q: [CLOSE, 1],
      o: [r4(CLOSE + OPEN), 1],
      c: [r4(CLOSE + LAG + IN), 1],
    });
    expect(tweens('complete', 'current')).toEqual({
      o: [r4(SPAN), 0],
      q: [r4(SPAN + CLOSE), 0],
      c: [IN, 0],
    });
    expect(tweens('current', 'invalid')).toEqual({
      q: [CLOSE, 1],
      o: [r4(CLOSE + OPEN), 1],
      b: [r4(CLOSE + LAG + IN), 1],
    });
    expect(tweens('invalid', 'current')).toEqual({
      o: [r4(SPAN), 0],
      q: [r4(SPAN + CLOSE), 0],
      b: [IN, 0],
    });
  });
  it('skipping a step, the ring closes on fast-02 and opens on fast-01; the glyphs keep the standard draw', () => {
    expect(tweens('incomplete', 'complete')).toEqual({
      j: [QUICK, 1],
      c: [IN, 1],
    });
    expect(tweens('complete', 'incomplete')).toEqual({
      j: [QUICKER, 0],
      w: [OUT, 1],
    });
    expect(tweens('incomplete', 'invalid')).toEqual({
      j: [QUICK, 1],
      b: [IN, 1],
    });
    expect(tweens('invalid', 'incomplete')).toEqual({
      j: [QUICKER, 0],
      b: [OUT, 0],
    });
    // Check ⇄ "!": the match cut, 160ms both ways.
    expect(tweens('complete', 'invalid')).toEqual({ k: [IN, 1] });
    expect(tweens('invalid', 'complete')).toEqual({ k: [IN, 0] });
    expect(QUICK).toBeGreaterThan(QUICKER);
  });

  it('cuts check ⇄ "!" at their shrunk sizes: 4px off each end of each glyph', () => {
    expect(CHECK_SMALL).toBeCloseTo((12.586 - 8) / 12.586, 3);
    expect(bangSmall(32)).toBeCloseTo(9 / 17, 3);
    expect(bangSmall(16)).toBeCloseTo((15.6 - 8) / 15.6, 3);
  });
});

describe('ProgressStep in React', () => {
  const painted = (c: HTMLElement) =>
    Object.fromEntries(
      [...c.querySelectorAll('path[data-k]')].map((el) => [
        el.getAttribute('data-k'),
        el.getAttribute('d') ?? '',
      ])
    );

  it('paints each state from `value`, with no accessible name of its own', () => {
    for (const s of STATES) {
      const { container } = render(<ProgressStep size={16} value={s} />);
      expect(painted(container)).toEqual(ds(rest(s, 16)));
      const svg = container.querySelector('svg')!;
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.getAttribute('aria-label')).toBeNull();
      cleanup();
    }
  });

  it('is an indicator: clicks never step it or ask to (controlled or not)', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ProgressStep size={16} initial="current" onChange={onChange} />
    );
    fireEvent.click(container.querySelector('svg')!);
    expect(onChange).not.toHaveBeenCalled();
    expect(painted(container)).toEqual(ds(rest('current', 16)));
  });

  it('disabled (the host keeps `incomplete`): CircleDash, still, through clicks and hover', () => {
    const { container } = render(
      <ProgressStep size={16} value="incomplete" disabled />
    );
    const before = painted(container);
    expect(before).toEqual(ds(rest('incomplete', 16)));
    const svg = container.querySelector('svg')!;
    fireEvent.mouseEnter(svg);
    fireEvent.click(svg);
    fireEvent.mouseLeave(svg);
    expect(painted(container)).toEqual(before);
  });

  it('under reduced motion, a change lands on the new state at once', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    for (const size of [16, 32] as const) {
      const { container, rerender } = render(
        <ProgressStep size={size} value="incomplete" />
      );
      for (const [, to] of TRANSITIONS) {
        act(() => rerender(<ProgressStep size={size} value={to} />));
        expect(painted(container), `${to} @${size}`).toEqual(
          ds(rest(to, size))
        );
      }
      cleanup();
    }
  });

  it("draws Carbon's art in every state with motion off", () => {
    for (const s of STATES) {
      for (const size of SIZES) {
        const { container } = render(
          <MotionIconProvider animated={false}>
            <ProgressStep size={size} value={s} />
          </MotionIconProvider>
        );
        const C = CARBON[s] as unknown as React.ComponentType<{ size: number }>;
        const { container: c2 } = render(<C size={size} />);
        expect(container.querySelector('svg')!.innerHTML, `${s} @${size}`).toBe(
          c2.querySelector('svg')!.innerHTML
        );
        cleanup();
      }
    }
  });
});

const _pt: Pt = [0, 0];
void _pt;
