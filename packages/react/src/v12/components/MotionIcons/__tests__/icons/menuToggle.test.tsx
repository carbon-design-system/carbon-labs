/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as CarbonIcons from '@carbon/icons-react';
import {
  FrameController,
  fromHover,
  fromToggle,
  manualScheduler,
  setScheduler,
  type Shapes,
} from '@carbon-labs/motion-icons-core/engine';
import {
  MenuToggleSpec,
  menuCloseShapes,
} from '@carbon-labs/motion-icons-core/icons/toggle/menuToggle';
import {
  MenuSpec,
  menuBars,
} from '@carbon-labs/motion-icons-core/icons/navigation/navZoom';
import { CloseSpec } from '@carbon-labs/motion-icons-core/icons/operations/signs';
import {
  CUT_AT,
  CUT_SHRINK,
} from '@carbon-labs/motion-icons-core/icons/controls/playback';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import { MenuToggle } from '../../index';

/**
 * Menu ⇄ Close (toggle/menuToggle.ts): Play ⇄ Pause's match cut. The bars
 * shrink (4px off each end, the stack closing up by the same ratio), cut at
 * 6/15 to an X whose arms are as long as the shrunk bars, and the X grows to
 * full; 160ms both ways.
 *
 * Checked: both ends are Carbon's Menu and Close at every size (as geometry,
 * and as Carbon's own art with motion off and under reduced motion); one
 * glyph at a time; the bars keep their height and the arms their width
 * through the cut; the timing reads the tokens; and each end hovers exactly
 * as Menu and Close do, frame by frame on the engine.
 */

type Pt = [number, number];
type Comp = React.ComponentType<Record<string, unknown>>;
const SIZES = [16, 20, 24, 32];
const STEPS = Array.from({ length: 61 }, (_, i) => i / 60);
const HS = [0, 0.5, 1];
const BARS = ['b0', 'b1', 'b2', 'b3'];
const geo = (h: number, p: number, size?: number) =>
  menuCloseShapes({ h, p }, size);

/** A path's subpaths as polygons (M, L, H, V and Z, absolute: what rectPath, the X and Carbon's two icons use). */
function polys(d: string): Pt[][] {
  const out: Pt[][] = [];
  let cur: Pt[] = [];
  let [x, y, cmd] = [0, 0, ''];
  const toks = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  for (let i = 0; i < toks.length; ) {
    const t = toks[i];
    if (/[A-Za-z]/.test(t)) {
      cmd = t.toUpperCase();
      i++;
      if (cmd === 'Z' && cur.length) [out[out.length], cur] = [cur, []];
      continue;
    }
    if (cmd === 'M' || cmd === 'L') {
      if (cmd === 'M' && cur.length) [out[out.length], cur] = [cur, []];
      [x, y] = [+toks[i], +toks[i + 1]];
      cur.push([x, y]);
      i += 2;
      cmd = 'L';
    } else if (cmd === 'H') cur.push([(x = +toks[i++]), y]);
    else if (cmd === 'V') cur.push([x, (y = +toks[i++])]);
    else throw new Error(`unsupported command ${cmd}`);
  }
  if (cur.length) out.push(cur);
  return out;
}
const ptsOf = (d: string) => polys(d).flat();
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ── A small rasteriser over the 36×36 box ────────────────────────────────────
const N = 288;
const at = (k: number, off: number) => -2 + ((k + 0.5 + off) * 36) / N;
const inside = (poly: Pt[], [x, y]: Pt) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      c = !c;
  }
  return c;
};
function raster(all: Pt[][]): Uint8Array {
  const ink = new Uint8Array(N * N);
  for (let j = 0; j < N; j++)
    for (let k = 0; k < N; k++)
      if (all.some((p) => inside(p, [at(k, 0.137), at(j, 0.311)])))
        ink[j * N + k] = 1;
  return ink;
}
const ours = (s: Shapes) =>
  raster(Object.values(s).flatMap((a) => (a.d ? polys(String(a.d)) : [])));
function carbon(name: string, size: number): Uint8Array {
  const { container, unmount } = render(
    React.createElement(
      (CarbonIcons as unknown as Record<string, Comp>)[name],
      { size }
    )
  );
  const svg = container.querySelector('svg')!;
  const k = 32 / Number(svg.getAttribute('viewBox')!.split(' ')[2]);
  const all = [...svg.querySelectorAll('path')].flatMap((p) =>
    polys(p.getAttribute('d')!).map((poly) =>
      poly.map(([x, y]) => [x * k, y * k] as Pt)
    )
  );
  unmount();
  return raster(all);
}
const delta = (a: Uint8Array, b: Uint8Array) => {
  let [diff, ink] = [0, 0];
  for (let i = 0; i < a.length; i++) {
    if (a[i] || b[i]) ink++;
    if (a[i] !== b[i]) diff++;
  }
  return diff / ink;
};
const carbonSvg = (name: string, size: number) => {
  const { container, unmount } = render(
    React.createElement(
      (CarbonIcons as unknown as Record<string, Comp>)[name],
      { size }
    )
  );
  const html = container.querySelector('svg')!.innerHTML;
  unmount();
  return html;
};

/** A bar's rect: [x0, y0, x1, y1]. */
const rect = (d: string) => {
  const p = ptsOf(d);
  const xs = p.map((q) => q[0]);
  const ys = p.map((q) => q[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};

afterEach(() => {
  cleanup();
  setScheduler(null);
  vi.restoreAllMocks();
});

describe('MenuToggle', () => {
  it("rests on Carbon's Menu and Close at both ends and every size", () => {
    for (const size of SIZES) {
      expect(
        delta(ours(geo(0, 0, size)), carbon('Menu', size)),
        `Menu @${size}`
      ).toBe(0);
      expect(
        delta(ours(geo(0, 1, size)), carbon('Close', size)),
        `Close @${size}`
      ).toBe(0);
    }
  });

  it("rests exactly on Menu's and Close's own geometry (the hover icons, at h 0)", () => {
    for (const size of SIZES) {
      const [menu, close] = [
        MenuSpec.geo({ h: 0 }, size),
        CloseSpec.geo({ h: 0 }, size),
      ];
      for (const k of BARS)
        expect(geo(0, 0, size)[k].d, `${k} @${size}`).toBe(menu[k].d);
      expect(geo(0, 1, size).sign.d, `@${size}`).toBe(close.sign.d);
    }
  });

  it("draws Carbon's art in each state with motion off", () => {
    for (const [state, icon] of [
      ['menu', 'Menu'],
      ['close', 'Close'],
    ] as const) {
      for (const size of SIZES) {
        const { container } = render(
          <MotionIconProvider animated={false}>
            <MenuToggle size={size as 16} initial={state} />
          </MotionIconProvider>
        );
        expect(
          container.querySelector('svg')!.innerHTML,
          `${state} @${size}`
        ).toBe(carbonSvg(icon, size));
        cleanup();
      }
    }
  });

  it("under reduced motion, starts on Menu's rest and changes to the other end at once", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    for (const size of [16, 20, 24, 32]) {
      const { container, rerender } = render(
        <MenuToggle size={size as 16} value="menu" aria-label="Open menu" />
      );
      // The rest geometry, as the reduced-motion binding draws it (Carbon's drawing: the first test).
      const painted = () =>
        Object.fromEntries(
          [...container.querySelectorAll('path[data-k]')].map((el) => [
            el.getAttribute('data-k'),
            el.getAttribute('d') ?? '',
          ])
        );
      const rest = (p: number) =>
        Object.fromEntries(
          Object.entries(geo(0, p, size)).map(([k, a]) => [k, String(a.d)])
        );
      expect(painted(), `menu @${size}`).toEqual(rest(0));
      act(() =>
        rerender(
          <MenuToggle size={size as 16} value="close" aria-label="Close menu" />
        )
      );
      expect(painted(), `close @${size}`).toEqual(rest(1));
      act(() =>
        rerender(
          <MenuToggle size={size as 16} value="menu" aria-label="Open menu" />
        )
      );
      expect(painted(), `back @${size}`).toEqual(rest(0));
      cleanup();
    }
  });

  it('keeps its keys and finite numbers at every frame, and shows one glyph at a time: the bars to the cut at 6/15, the X after', () => {
    for (const size of SIZES) {
      for (const h of HS) {
        for (const p of STEPS) {
          const s = geo(h, p, size);
          expect(Object.keys(s)).toEqual([...BARS, 'sign']);
          for (const a of Object.values(s))
            expect(ptsOf(String(a.d)).flat().every(Number.isFinite)).toBe(true);
          const menu = BARS.every((k) => s[k].d !== '');
          expect(menu, `p ${p}`).toBe(p <= CUT_AT);
          expect(
            BARS.every((k) => s[k].d === ''),
            `p ${p}`
          ).toBe(p > CUT_AT);
          expect(s.sign.d === '', `p ${p}`).toBe(p <= CUT_AT);
        }
      }
    }
  });

  it('keeps its line weight through the cut: each bar its height, each arm its 2px width, the gaps between the bars open', () => {
    for (const size of SIZES) {
      const b = menuBars(size);
      for (const h of HS) {
        for (const p of STEPS) {
          const s = geo(h, p, size);
          if (p <= CUT_AT) {
            const rs = BARS.map((k) => rect(String(s[k].d)));
            for (const [, y0, , y1] of rs) expect(y1 - y0).toBeCloseTo(b.t, 3);
            for (let i = 1; i < rs.length; i++)
              expect(
                rs[i][1] - rs[i - 1][3],
                `gap @${size} p${p}`
              ).toBeGreaterThanOrEqual(1.999);
          } else {
            // The X: a plus turned 45°, its twelve corners; each arm's end (corners 0–1, 3–4, 6–7, 9–10) is 2px across.
            const q = ptsOf(String(s.sign.d));
            expect(q.length).toBe(12);
            for (const i of [0, 3, 6, 9])
              expect(
                dist(q[i], q[i + 1]),
                `arm ${i} @${size} p${p}`
              ).toBeCloseTo(2, 2);
            // And it never thins where the arms cross: the inner corners sit √2 from the centre.
            for (const i of [2, 5, 8, 11])
              expect(dist(q[i], [16, 16])).toBeCloseTo(Math.SQRT2, 2);
          }
        }
      }
    }
  });

  it("shrinks as a whole: the bars lose 4px at each end and close up by the same ratio, and at the cut the X's arms are as long as the bars", () => {
    for (const size of SIZES) {
      const b = menuBars(size);
      const half = (b.x1 - b.x0) / 2;
      const sigma = (half - CUT_SHRINK) / half;
      const small = BARS.map((k) => rect(String(geo(0, CUT_AT, size)[k].d)));
      small.forEach(([x0, y0, x1], i) => {
        expect(x0).toBeCloseTo(b.x0 + CUT_SHRINK, 3);
        expect(x1).toBeCloseTo(b.x1 - CUT_SHRINK, 3);
        expect(y0 + b.t / 2 - 16).toBeCloseTo(
          (b.ys[i] + b.t / 2 - 16) * sigma,
          3
        );
      });
      // Just past the cut: each arm, end to end along its centreline, is as long as a shrunk bar.
      const q = ptsOf(String(geo(0, CUT_AT + 1e-9, size).sign.d));
      const end = (i: number): Pt => [
        (q[i][0] + q[i + 1][0]) / 2,
        (q[i][1] + q[i + 1][1]) / 2,
      ];
      expect(dist(end(0), end(6))).toBeCloseTo(2 * (half - CUT_SHRINK), 2);
      expect(dist(end(3), end(9))).toBeCloseTo(2 * (half - CUT_SHRINK), 2);
    }
  });

  it('runs 160ms (moderate-01) both ways on linear progress; the hovers are Menu’s and Close’s own timings', () => {
    for (const on of [true, false]) {
      const runs: {
        key: string;
        to: number;
        duration: number;
        ease: unknown;
      }[] = [];
      const tween = (
        key: string,
        to: number,
        opts: { duration: number; ease: unknown }
      ) => {
        runs.push({ key, to, ...opts });
        return { stop: () => {} } as never;
      };
      MenuToggleSpec.change!(
        on,
        { h: 0, p: on ? 0 : 1, e: 0 },
        tween as never,
        () => {}
      );
      expect(runs).toEqual([
        {
          key: 'p',
          to: on ? 1 : 0,
          duration: motionTokens.duration.moderate01 / 1000,
          ease: [0, 0, 1, 1],
        },
      ]);
    }
    expect(MenuToggleSpec.hovers!.menu.hover).toBe(MenuSpec.hover);
    expect(MenuSpec.hover!.duration).toBe(
      motionTokens.duration.moderate01 / 1000
    );
    // Close hovers on the standard hover, as Close does (neither sets its own).
    expect(MenuToggleSpec.hover).toBeUndefined();
    expect(CloseSpec.hover).toBeUndefined();
  });

  it('hovers as Menu in the menu state and as Close in the close state, frame by frame on the engine', async () => {
    const FRAME = 1000 / 60;
    for (const size of [16, 20, 32]) {
      for (const [state, Spec, keys] of [
        ['menu', MenuSpec, BARS],
        ['close', CloseSpec, ['sign']],
      ] as const) {
        const clock = manualScheduler();
        setScheduler(clock);
        const toggle = new FrameController(
          fromToggle(MenuToggleSpec as never),
          () => {},
          size,
          state
        );
        const icon = new FrameController(
          fromHover(Spec as never),
          () => {},
          size
        );
        const compare = (label: string) => {
          const [a, b] = [toggle.shapes(), icon.shapes()];
          for (const k of keys)
            expect(a[k].d, `${state} @${size} ${label} ${k}`).toBe(b[k].d);
        };
        compare('rest');
        void toggle.enter();
        void icon.enter();
        for (let t = 0; t < 200; t += FRAME) {
          clock.advance(FRAME);
          await Promise.resolve();
          compare(`in ${t.toFixed(0)}ms`);
        }
        void toggle.leave();
        void icon.leave();
        for (let t = 0; t < 160; t += FRAME) {
          clock.advance(FRAME);
          await Promise.resolve();
          compare(`out ${t.toFixed(0)}ms`);
        }
        toggle.destroy();
        icon.destroy();
        setScheduler(null);
      }
    }
  });

  it('through the cut, the hover follows the glyph that shows', () => {
    const b = menuBars(32);
    // Before the cut: each bar 1.5px further at each end (Menu's reach), the X hidden.
    const [r0, r1] = [
      rect(String(geo(0, 0.2).b0.d)),
      rect(String(geo(1, 0.2).b0.d)),
    ];
    expect(r0[0] - r1[0]).toBeCloseTo(1.5, 3);
    expect(r1[2] - r0[2]).toBeCloseTo(1.5, 3);
    expect(r1[3] - r1[1]).toBeCloseTo(b.t, 3);
    // After it: each arm 2px further (Close's reach).
    const tip = (h: number) => {
      const q = ptsOf(String(geo(h, 0.7).sign.d));
      return dist([(q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2], [16, 16]);
    };
    expect(tip(1) - tip(0)).toBeCloseTo(2, 2);
  });
});
