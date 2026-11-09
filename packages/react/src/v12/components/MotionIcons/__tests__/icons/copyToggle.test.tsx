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
} from '@carbon-labs/motion-icons-core/engine';
import {
  CopyToggleSpec,
  copyCheckShapes,
} from '@carbon-labs/motion-icons-core/icons/toggle/copyToggle';
import { CopySpec } from '@carbon-labs/motion-icons-core/icons/formatting/fmtTools';
import {
  CHECK_CENTRE,
  CheckmarkSpec,
} from '@carbon-labs/motion-icons-core/icons/status/states';
import { CUT_AT } from '@carbon-labs/motion-icons-core/icons/controls/playback';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import { MotionIconProvider } from '../../context/MotionIconProvider';
import { CopyToggle } from '../../index';

/**
 * Copy ⇄ Checkmark (toggle/copyToggle.ts): Link ⇄ Unlink's match cut. The
 * back page slides onto the front page as it shrinks to a 12px square on the
 * check's centre; cut at 6/15 to the check at half size, which grows to
 * Carbon's. 220ms in, 160ms back.
 *
 * Checked: both ends are Copy's and Checkmark's own geometry at every size
 * and hover (and Carbon's art with motion off and under reduced motion); one
 * glyph at a time; the pages keep their 2px walls and the check its stroke
 * through the cut; at the cut the pages are one square, and just past it the
 * check is half size on the same centre; the timing reads the tokens; and
 * each end hovers exactly as Copy and Checkmark do, frame by frame.
 */

type Pt = [number, number];
type Comp = React.ComponentType<Record<string, unknown>>;
const SIZES = [16, 20, 24, 32];
const STEPS = Array.from({ length: 61 }, (_, i) => i / 60);
const HS = [0, 0.5, 1];
const geo = (h: number, p: number, size?: number) =>
  copyCheckShapes({ h, p }, size);

/** Every number pair in a path, in order (M, L, H-free paths: the back page's arc end counts as a point). */
const nums = (d: string) =>
  (d.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
/** The back page's corner and arms, read back from its path. */
function backOf(d: string): { x: number; y: number; l: number } {
  const n = nums(d);
  // M x y+2 A 2 2 0 0 1 x+2 y L x+l y …
  return { x: n[0], y: n[8], l: n[9] - n[0] };
}
/** A subpath's bounding box, from its absolute M, L, H, V and A (an arc's end point) commands. */
function box(d: string): number[] {
  const toks = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const [xs, ys]: [number[], number[]] = [[], []];
  let [x, y, c] = [0, 0, ''];
  for (let i = 0; i < toks.length; ) {
    if (/[A-Za-z]/.test(toks[i])) {
      c = toks[i++];
      continue;
    }
    if (c === 'M' || c === 'L') [x, y] = [+toks[i], +toks[(i += 2) - 1]];
    else if (c === 'H') x = +toks[i++];
    else if (c === 'V') y = +toks[i++];
    else if (c === 'A') [x, y] = [+toks[i + 5], +toks[(i += 7) - 1]];
    else throw new Error(`unsupported command ${c}`);
    xs.push(x);
    ys.push(y);
  }
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
/** The front page's frame: its outer and inner squares. */
function frontOf(d: string): { outer: number[]; inner: number[] } {
  const [outerD, innerD] = d
    .split('M')
    .filter(Boolean)
    .map((p) => `M${p}`);
  return { outer: box(outerD), inner: box(innerD) };
}
/** The check's centreline points. */
const checkPts = (d: string): Pt[] => {
  const n = nums(d);
  return [0, 2, 4].map((i) => [n[i], n[i + 1]] as Pt);
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

afterEach(() => {
  cleanup();
  setScheduler(null);
  vi.restoreAllMocks();
});

describe('CopyToggle', () => {
  it("rests exactly on Copy's and Checkmark's own geometry at every size and hover", () => {
    for (const size of SIZES) {
      for (const h of HS) {
        const [copy, check] = [
          CopySpec.geo({ h }, size),
          CheckmarkSpec.geo({ h }, size),
        ];
        expect(geo(h, 0, size).back.d, `back @${size} h${h}`).toBe(copy.back.d);
        expect(geo(h, 0, size).front.d, `front @${size} h${h}`).toBe(
          copy.front.d
        );
        expect(geo(h, 1, size).check, `check @${size} h${h}`).toEqual(
          check.check
        );
      }
    }
  });

  it("draws Carbon's art in each state with motion off", () => {
    for (const [state, icon] of [
      ['copy', 'Copy'],
      ['checkmark', 'Checkmark'],
    ] as const) {
      for (const size of SIZES) {
        const { container } = render(
          <MotionIconProvider animated={false}>
            <CopyToggle size={size as 16} initial={state} />
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

  it('under reduced motion, changes to the other end at once', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    for (const size of SIZES) {
      const { container, rerender } = render(
        <CopyToggle size={size as 16} value="copy" aria-label="Copy" />
      );
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
      expect(painted(), `copy @${size}`).toEqual(rest(0));
      act(() =>
        rerender(
          <CopyToggle size={size as 16} value="checkmark" aria-label="Copied" />
        )
      );
      expect(painted(), `checkmark @${size}`).toEqual(rest(1));
      act(() =>
        rerender(
          <CopyToggle size={size as 16} value="copy" aria-label="Copy" />
        )
      );
      expect(painted(), `back @${size}`).toEqual(rest(0));
      cleanup();
    }
  });

  it('keeps its keys and finite numbers at every frame, and shows one glyph at a time: the pages to the cut at 6/15, the check after', () => {
    for (const size of SIZES) {
      for (const h of HS) {
        for (const p of STEPS) {
          const s = geo(h, p, size);
          expect(Object.keys(s)).toEqual(['back', 'front', 'check']);
          for (const a of Object.values(s))
            expect(nums(String(a.d)).every(Number.isFinite)).toBe(true);
          expect(s.back.d !== '' && s.front.d !== '', `p ${p}`).toBe(
            p <= CUT_AT
          );
          expect(s.check.d !== '', `p ${p}`).toBe(p > CUT_AT);
        }
      }
    }
  });

  it('keeps its line weight: the front page 2px walls, the back page 2px arms, the check its stroke', () => {
    for (const size of SIZES) {
      const w = CheckmarkSpec.geo({ h: 0 }, size).check.strokeWidth;
      for (const h of HS) {
        for (const p of STEPS) {
          const s = geo(h, p, size);
          if (p <= CUT_AT) {
            const { outer, inner } = frontOf(String(s.front.d));
            for (let i = 0; i < 2; i++)
              expect(inner[i] - outer[i], `wall @${size} p${p}`).toBeCloseTo(
                2,
                3
              );
            for (let i = 2; i < 4; i++)
              expect(outer[i] - inner[i], `wall @${size} p${p}`).toBeCloseTo(
                2,
                3
              );
            // The back page: its arm's outer and inner edges 2px apart (y and y + 2).
            const n = nums(String(s.back.d));
            expect(n[1] - n[8], `arm @${size} p${p}`).toBeCloseTo(2, 3);
          } else {
            expect(s.check.strokeWidth, `check @${size} p${p}`).toBe(w);
            expect(s.check.strokeLinejoin).toBe('miter');
          }
        }
      }
    }
  });

  it('closes to one 12px square on the check’s centre at the cut, and cuts to the check at half size on the same centre', () => {
    for (const h of HS) {
      const s = geo(h, CUT_AT);
      const { outer } = frontOf(String(s.front.d));
      const [cx, cy] = CHECK_CENTRE;
      expect(outer.map((v) => +v.toFixed(3))).toEqual(
        [cx - 6, cy - 6, cx + 6, cy + 6].map((v) => +v.toFixed(3))
      );
      // The back page lies on the square's top and left walls: its corner the square's, its arms the square's side.
      const b = backOf(String(s.back.d));
      expect(b.x).toBeCloseTo(cx - 6, 3);
      expect(b.y).toBeCloseTo(cy - 6, 3);
      expect(b.l).toBeCloseTo(12, 3);
      // Just past the cut: Carbon's check, its centreline at half size about the same centre, whatever the hover.
      const small = checkPts(String(geo(h, CUT_AT + 1e-9).check.d));
      const full = checkPts(String(CheckmarkSpec.geo({ h: 0 }).check.d));
      small.forEach(([x, y], i) => {
        expect(x).toBeCloseTo(cx + (full[i][0] - cx) * 0.5, 2);
        expect(y).toBeCloseTo(cy + (full[i][1] - cy) * 0.5, 2);
      });
    }
  });

  it('runs 220ms (moderate-02) in and 160ms (moderate-01) back, on linear progress; hovers on the standard hover', () => {
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
      CopyToggleSpec.change!(
        on,
        { h: 0, p: on ? 0 : 1, e: 0 },
        tween as never,
        () => {}
      );
      const ms = on
        ? motionTokens.duration.moderate02
        : motionTokens.duration.moderate01;
      expect(runs).toEqual([
        { key: 'p', to: on ? 1 : 0, duration: ms / 1000, ease: [0, 0, 1, 1] },
      ]);
    }
    expect(CopyToggleSpec.hover).toBeUndefined();
    expect(CopySpec.hover).toBeUndefined();
    expect(CheckmarkSpec.hover).toBeUndefined();
  });

  it('hovers as Copy in the copy state and as Checkmark in the checkmark state, frame by frame on the engine', async () => {
    const FRAME = 1000 / 60;
    for (const size of [16, 20, 32]) {
      for (const [state, Spec, keys] of [
        ['copy', CopySpec, ['back', 'front']],
        ['checkmark', CheckmarkSpec, ['check']],
      ] as const) {
        const clock = manualScheduler();
        setScheduler(clock);
        const toggle = new FrameController(
          fromToggle(CopyToggleSpec as never),
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
});
