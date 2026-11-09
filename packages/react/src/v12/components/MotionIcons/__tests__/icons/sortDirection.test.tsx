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
  ArrowDown as CArrowDown,
  ArrowUp as CArrowUp,
  ArrowsVertical as CArrowsVertical,
} from '@carbon/icons-react';
import {
  FrameController,
  manualScheduler,
  setScheduler,
  type Shapes,
} from '@carbon-labs/motion-icons-core/engine';
import type { Pt } from '@carbon-labs/motion-icons-core/geometry';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import { ENTRANCE, STANDARD } from '@carbon-labs/motion-icons-core/ease';
import { ArrowsVerticalSpec } from '@carbon-labs/motion-icons-core/icons/operations/opsSort';
import {
  SORT_DIRECTION_REST,
  SortDirectionSpec,
  sortDirectionShapes,
  type SortDirectionFrame,
  type SortDirectionState,
} from '@carbon-labs/motion-icons-core/icons/toggle/sortDirection';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import type { CarbonIcon } from '../../utils/frameIcon';
import { SortDirection } from '../../index';

/**
 * SortDirection (toggle/sortDirection.ts): the data table sort header's
 * icon, driven by `value`. Checked: every state rests on Carbon's icon at
 * every size (and `none` on the set's own ArrowsVertical); all six
 * transitions run and land on their target, from rest and from mid-flight;
 * each runs in two phases through a short line at the centre (only one arm of
 * the drawing is ever away from it); the parts' union is Carbon's art next
 * to rest; line weight holds in every frame; the timing reads the tokens;
 * reduced motion and motion off; and it is an indicator (no clicks, no name).
 */

// ── A small rasteriser (straight-edged paths only: M, L, H, V, Z) ────────────

type Poly = Pt[];

function flatten(d: string): Poly[] {
  const tok =
    d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? [];
  const out: Poly[] = [];
  let [i, cmd] = [0, ''];
  let poly: Pt[] = [];
  let cur: Pt = [0, 0];
  const flush = () => {
    if (poly.length > 2) out.push(poly);
    poly = [];
  };
  while (i < tok.length) {
    if (/^[a-zA-Z]$/.test(tok[i])) cmd = tok[i++];
    const C = cmd.toUpperCase();
    if (C === 'Z') {
      flush();
      continue;
    }
    if (C === 'M') {
      flush();
      cur = [Number(tok[i++]), Number(tok[i++])];
      cmd = 'L';
    } else if (C === 'L') cur = [Number(tok[i++]), Number(tok[i++])];
    else if (C === 'H') cur = [Number(tok[i++]), cur[1]];
    else if (C === 'V') cur = [cur[0], Number(tok[i++])];
    else throw new Error(`flatten: "${cmd}"`);
    poly.push(cur);
  }
  flush();
  return out;
}

/** The parity story's pixels (4× the size) at 8×8 samples each, over −2…34. */
const [LO, SUB] = [-2, 8];
let [STEP, N] = [1 / 32, 1152];
const grid = (size: number) => {
  [STEP, N] = [8 / size / SUB, (36 * size * SUB) / 8];
};
const at = (k: number) => LO + (k + 0.5) * STEP;

function fillInto(ink: Uint8Array, polys: Poly[]) {
  for (let j = 0; j < N; j++) {
    const y = at(j);
    const xs: [number, number][] = [];
    for (const pts of polys) {
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
    let [w, m] = [0, 0];
    for (let k = 0; k < N; k++) {
      const x = at(k);
      while (m < xs.length && xs[m][0] < x) [w, m] = [w + xs[m][1], m + 1];
      if (w) ink[j * N + k] = 1;
    }
  }
}
const cover = (shapes: Shapes) => {
  const ink = new Uint8Array(N * N);
  for (const a of Object.values(shapes))
    fillInto(ink, flatten(String(a.d ?? '')));
  return ink;
};
function coverCarbon(Icon: CarbonIcon, size: number): Uint8Array {
  const { container, unmount } = render(<Icon size={size} />);
  const svg = container.querySelector('svg')!;
  const vb = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const ink = new Uint8Array(N * N);
  svg.querySelectorAll('path').forEach((el) => {
    if (el.getAttribute('opacity') === '0') return;
    fillInto(
      ink,
      flatten(el.getAttribute('d')!).map((p) =>
        p.map(([x, y]) => [(x * 32) / vb, (y * 32) / vb] as Pt)
      )
    );
  });
  unmount();
  return ink;
}
/** The parity story's Δ: the share of ink pixels whose 8×8 coverage differs by more than a quarter. */
function delta(a: Uint8Array, b: Uint8Array): number {
  const P = N / SUB;
  let [diff, ink] = [0, 0];
  for (let pj = 0; pj < P; pj++) {
    for (let pk = 0; pk < P; pk++) {
      let [ca, cb] = [0, 0];
      for (let j = pj * SUB; j < pj * SUB + SUB; j++) {
        for (let k = pk * SUB; k < pk * SUB + SUB; k++)
          [ca, cb] = [ca + a[j * N + k], cb + b[j * N + k]];
      }
      if (ca || cb) ink++;
      if (Math.abs(ca - cb) > (SUB * SUB) / 4) diff++;
    }
  }
  return ink ? diff / ink : 0;
}

const SIZES = [16, 20, 24, 32] as const;
const GATE = 0.005;
const STATES: SortDirectionState[] = ['none', 'ascending', 'descending'];
/** Carbon's TableHeader: ArrowsVertical unsorted, ArrowUp ascending, ArrowUp turned 180° (ArrowDown) descending. */
const CARBON: Record<SortDirectionState, CarbonIcon> = {
  none: CArrowsVertical as unknown as CarbonIcon,
  ascending: CArrowUp as unknown as CarbonIcon,
  descending: CArrowDown as unknown as CarbonIcon,
};
const TRANSITIONS: [SortDirectionState, SortDirectionState][] = [
  ['none', 'ascending'],
  ['ascending', 'descending'],
  ['descending', 'none'],
  ['none', 'descending'],
  ['descending', 'ascending'],
  ['ascending', 'none'],
];
const KEYS = ['up', 'down'];
const FRAME = 1000 / 60;
const rest = (s: SortDirectionState, size?: number) =>
  sortDirectionShapes(SORT_DIRECTION_REST[s], size);
const ds = (sh: Shapes) =>
  Object.fromEntries(Object.entries(sh).map(([k, a]) => [k, String(a.d)]));
const pts = (d: unknown) =>
  [...String(d).matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(
    (m) => [+m[1], +m[2]] as Pt
  );

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

async function play(
  from: SortDirectionState,
  to: SortDirectionState,
  size = 32,
  ms = 500,
  interrupt?: [number, SortDirectionState]
) {
  const clock = manualScheduler(FRAME);
  setScheduler(clock);
  const frames: Shapes[] = [];
  const nums: Record<string, number>[] = [];
  const live: { ctl?: FrameController<SortDirectionState> } = {};
  const ctl = new FrameController<SortDirectionState>(
    SortDirectionSpec as never,
    (s) => {
      frames.push(s);
      if (live.ctl)
        nums.push({ ...(live.ctl.frame as unknown as Record<string, number>) });
    },
    size,
    from
  );
  live.ctl = ctl;
  ctl.setState(to);
  for (let t = 0; t < ms; t += FRAME) {
    if (interrupt && Math.abs(t - interrupt[0]) < FRAME / 2)
      ctl.setState(interrupt[1]);
    clock.advance(FRAME);
    await Promise.resolve();
  }
  return { frames, nums, ctl };
}

describe('SortDirection at rest', () => {
  it("rests on Carbon's TableHeader icon in every state at every size", () => {
    for (const s of STATES) {
      for (const size of SIZES) {
        grid(size);
        expect(
          delta(cover(rest(s, size)), coverCarbon(CARBON[s], size)),
          `${s} @${size}`
        ).toBeLessThan(GATE);
      }
    }
  });

  it("rests on Carbon's points exactly: the pair is the set's ArrowsVertical, descending is ascending turned half a turn", () => {
    for (const size of SIZES) {
      const pair = ArrowsVerticalSpec.geo({ h: 0 }, size);
      const set = (d: unknown) => pts(d).map(String).sort();
      expect(set(rest('none', size).up.d)).toEqual(set(pair.up.d));
      expect(set(rest('none', size).down.d)).toEqual(set(pair.down.d));
      expect(rest('ascending', size).down.d).toBe('');
      expect(rest('descending', size).up.d).toBe('');
      const turned = pts(rest('ascending', size).up.d).map(([x, y]) => [
        +(32 - x).toFixed(3),
        +(32 - y).toFixed(3),
      ]);
      expect(
        pts(rest('descending', size).down.d).map(([x, y]) => [
          +x.toFixed(3),
          +y.toFixed(3),
        ])
      ).toEqual(turned);
    }
  });

  it("leaves rest without a jump: a hair away, the moving parts' union is Carbon's art", () => {
    for (const size of SIZES) {
      grid(size);
      const near: [SortDirectionState, Partial<SortDirectionFrame>][] = [
        ['none', { p: 1e-4, pk: 1 - 1e-4 }],
        ['ascending', { p: 1, pk: 0, u: 1 - 1e-4, uk: 1 - 1e-4 }],
        ['descending', { p: 1, pk: 0, n: 1 - 1e-4, nk: 1 - 1e-4 }],
      ];
      for (const [s, fr] of near) {
        const moving = sortDirectionShapes(fr, size);
        expect(
          Object.values(moving).map((a) => String(a.d)),
          s
        ).not.toEqual(Object.values(rest(s, size)).map((a) => String(a.d)));
        expect(
          delta(cover(moving), cover(rest(s, size))),
          `${s} @${size}`
        ).toBeLessThan(GATE);
      }
    }
  });

  it('meets at the centre as a short line on the single shaft: 2px by 8px, whole pixels at 16 and 32, heads gone', () => {
    for (const size of [16, 32]) {
      const line = sortDirectionShapes(
        { p: 1, pk: 0, u: 0, uk: 0, n: 0, nk: 0 },
        size
      );
      for (const a of Object.values(line)) {
        const q = pts(a.d);
        expect(q).toHaveLength(4);
        const [xs, ys] = [q.map((v) => v[0]), q.map((v) => v[1])];
        expect([
          Math.min(...xs),
          Math.max(...xs),
          Math.min(...ys),
          Math.max(...ys),
        ]).toEqual([15, 17, 12, 20]);
        // At 16 (the 32 frame halved) that is y 6…10, whole pixels; x is the shaft's own 7.5…8.5, as Carbon's ArrowUp 16.
      }
      // The single arrow at the line, its head not yet drawn, is the same line.
      expect(
        sortDirectionShapes({ p: 1, pk: 0, u: 1e-9, uk: 1e-9 }, size).up.d
      ).toBe(line.up.d);
    }
  });

  it('draws the head over a longer span than the shaft: mid-way through the in, the shaft is nearer full than the head', () => {
    const { moderate01, moderate02 } = motionTokens.duration;
    expect(moderate02).toBeGreaterThan(moderate01);
    expect(ENTRANCE(0.5)).toBeGreaterThan(
      STANDARD(0.5 * (moderate01 / moderate02))
    );
  });
});

describe.each(TRANSITIONS)('%s → %s', (from, to) => {
  it('runs, keeps its keys and finite numbers in every frame, and lands exactly on the target', async () => {
    for (const size of [16, 32]) {
      const { frames, ctl } = await play(from, to, size);
      expect(frames.length, 'it animates').toBeGreaterThan(4);
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
      expect(ctl.frame).toMatchObject(SORT_DIRECTION_REST[to]);
      expect(ds(frames[frames.length - 1])).toEqual(ds(rest(to, size)));
      ctl.destroy();
      setScheduler(null);
    }
  });

  it('lands on the target when changed again mid-way, from wherever it is', async () => {
    for (const other of STATES.filter((s) => s !== to)) {
      for (const at of [30, 90, 150]) {
        const { frames, ctl } = await play(from, to, 32, 800, [at, other]);
        expect(ctl.frame, `${other} at ${at}ms`).toMatchObject(
          SORT_DIRECTION_REST[other]
        );
        expect(ds(frames[frames.length - 1]), `${other} at ${at}ms`).toEqual(
          ds(rest(other, 32))
        );
        ctl.destroy();
        setScheduler(null);
      }
    }
  });

  it('goes through the line: only one arm of the drawing is ever away from it, and the new one grows only after', async () => {
    const { nums, ctl } = await play(from, to, 32);
    const away = (f: Record<string, number>) =>
      [
        Math.max(1 - f.p, f.pk),
        Math.max(f.u, f.uk),
        Math.max(f.n, f.nk),
      ].filter((v) => v > 1e-6).length;
    for (const f of nums) expect(away(f)).toBeLessThanOrEqual(1);
    if (from !== 'none' && to !== 'none')
      expect(
        nums.some((f) => away(f) === 0),
        'it reaches the line'
      ).toBe(true);
    ctl.destroy();
    setScheduler(null);
  });

  it('keeps constant line weight: a 2px shaft and 2px arm bands in every frame, never scaled (no transforms)', async () => {
    for (const size of [16, 32]) {
      const { frames, ctl } = await play(from, to, size);
      for (const f of frames) {
        for (const a of Object.values(f)) {
          expect(a.transform).toBeUndefined();
          for (const sub of String(a.d).split('M').filter(Boolean)) {
            const q = pts(sub);
            const xs = q.map((v) => v[0]);
            const w = Math.max(...xs) - Math.min(...xs);
            if (q.length === 9) continue; // Carbon's own outline, at rest
            if (
              q.length === 4 &&
              q.every(
                (v) =>
                  q.filter((u) => Math.abs(u[0] - v[0]) < 1e-6).length === 2
              )
            ) {
              expect(w, 'shaft').toBeCloseTo(2, 6);
              continue;
            }
            // An arm: a band along a 45° line, as wide across as Carbon's (o√2, 1.98 or 1.99), never wider.
            const across = (n: Pt) => {
              const proj = q.map(
                (v) => (v[0] * n[0] + v[1] * n[1]) / Math.SQRT2
              );
              return Math.max(...proj) - Math.min(...proj);
            };
            const [d1, d2] = [across([1, 1]), across([1, -1])];
            const [band, along] = [Math.min(d1, d2), Math.max(d1, d2)];
            expect(band, 'arm').toBeLessThan(2.0);
            // Trimmed shorter than it is wide, what is left is the tip's corner; any longer, the band is whole.
            if (along > 4) expect(band, 'arm').toBeGreaterThan(1.97);
          }
        }
      }
      ctl.destroy();
      setScheduler(null);
    }
  });
});

describe('SortDirection timing', () => {
  const r4 = (x: number) => +x.toFixed(4);
  const { fast01, moderate01, moderate02 } = motionTokens.duration;
  function tweens(from: SortDirectionState, to: SortDirectionState) {
    const runs: Record<string, [number, number, number]> = {};
    const fr = { h: 0, ...SORT_DIRECTION_REST[from] };
    SortDirectionSpec.change(
      from,
      to,
      fr,
      ((
        key: string,
        v: number,
        o: { duration: number; ease: (x: number) => number }
      ) => {
        // [duration, target, the share of it held before the tween starts]
        let held = 0;
        while (held < 1 && o.ease(held + 1e-3) === 0) held += 1e-3;
        runs[key] = [r4(o.duration), v, Math.round(held * 100) / 100];
        return { stop: () => {} };
      }) as never,
      () => {}
    );
    return runs;
  }
  const out = fast01 / 1000;
  const shaft = r4((fast01 + moderate01) / 1000);
  const head = r4((fast01 + moderate02) / 1000);
  const held = (d: number) => Math.round((fast01 / (fast01 + d)) * 100) / 100;
  const [ws, wh] = [held(moderate01), held(moderate02)];
  it('out to the line on fast-01 (shaft and heads together); then the shaft grows on moderate-01 and the head draws on moderate-02, both starting as the out lands (300ms in all)', () => {
    expect(fast01 + moderate02).toBe(300);
    expect(tweens('none', 'ascending')).toEqual({
      p: [out, 1, 0],
      pk: [out, 0, 0],
      u: [shaft, 1, ws],
      uk: [head, 1, wh],
    });
    expect(tweens('none', 'descending')).toEqual({
      p: [out, 1, 0],
      pk: [out, 0, 0],
      n: [shaft, 1, ws],
      nk: [head, 1, wh],
    });
    expect(tweens('ascending', 'none')).toEqual({
      u: [out, 0, 0],
      uk: [out, 0, 0],
      p: [shaft, 0, ws],
      pk: [head, 1, wh],
    });
    expect(tweens('descending', 'none')).toEqual({
      n: [out, 0, 0],
      nk: [out, 0, 0],
      p: [shaft, 0, ws],
      pk: [head, 1, wh],
    });
  });
  it('ascending ⇄ descending: the arrow goes to the line, then grows back the other way, the same speed both ways', () => {
    expect(tweens('ascending', 'descending')).toEqual({
      u: [out, 0, 0],
      uk: [out, 0, 0],
      n: [shaft, 1, ws],
      nk: [head, 1, wh],
    });
    expect(tweens('descending', 'ascending')).toEqual({
      n: [out, 0, 0],
      nk: [out, 0, 0],
      u: [shaft, 1, ws],
      uk: [head, 1, wh],
    });
  });
  it('out on the standard ease (it moves at once); the shaft in on the entrance ease, the head on the standard ease', () => {
    const fr = { h: 0, ...SORT_DIRECTION_REST.none };
    const eases: Record<string, (x: number) => number> = {};
    SortDirectionSpec.change(
      'none',
      'ascending',
      fr,
      ((key: string, _v: number, o: { ease: (x: number) => number }) => {
        eases[key] = o.ease;
        return { stop: () => {} };
      }) as never,
      () => {}
    );
    expect(eases.p(0.5)).toBeCloseTo(STANDARD(0.5), 6);
    expect(eases.pk(0.5)).toBeCloseTo(STANDARD(0.5), 6);
    const s1 = fast01 / (fast01 + moderate01);
    expect(eases.u(s1 + (1 - s1) / 2)).toBeCloseTo(ENTRANCE(0.5), 6);
    const s2 = fast01 / (fast01 + moderate02);
    expect(eases.uk(s2 + (1 - s2) / 2)).toBeCloseTo(STANDARD(0.5), 6);
  });
});

describe('SortDirection in React', () => {
  const painted = (c: HTMLElement) =>
    Object.fromEntries(
      [...c.querySelectorAll('path[data-k]')].map((el) => [
        el.getAttribute('data-k'),
        el.getAttribute('d') ?? '',
      ])
    );

  it('paints each state from `value`, with no accessible name of its own', () => {
    for (const s of STATES) {
      const { container } = render(<SortDirection size={16} value={s} />);
      expect(painted(container)).toEqual(ds(rest(s, 16)));
      const svg = container.querySelector('svg')!;
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.getAttribute('aria-label')).toBeNull();
      cleanup();
    }
  });

  it('is an indicator: clicks never step it or ask to, and hover moves nothing', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SortDirection size={16} initial="none" onChange={onChange} />
    );
    const svg = container.querySelector('svg')!;
    fireEvent.mouseEnter(svg);
    fireEvent.click(svg);
    expect(onChange).not.toHaveBeenCalled();
    expect(painted(container)).toEqual(ds(rest('none', 16)));
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
        <SortDirection size={size} value="none" />
      );
      for (const [, to] of TRANSITIONS) {
        act(() => rerender(<SortDirection size={size} value={to} />));
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
            <SortDirection size={size} value={s} />
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
