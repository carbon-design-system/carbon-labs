/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The press in React (the core's press.ts, through useHover), on the
 * engine's manual clock:
 *  - which icons press: `asButton`, `actionOn="click"` (hover and status
 *    icons), a frame marked `"press"`; not inside a rollover button (a
 *    frame) or `cds-icon-button`, nor status, hover-only or decorative
 *    icons; the `press` prop either way;
 *  - the pointer (mouse, touch), Space and Enter on the own button (a held
 *    key's repeats press nothing more);
 *  - during an action, and through a status icon's hand-off;
 *  - reduced motion, `animated={false}`, a disabled button;
 *  - with hover and Renew's turn;
 *  - the scale per size (1px a side).
 * React ↔ web components parity: packages/motion-icons-wc/test/press.test.tsx.
 */
import { createRef } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import { waapi } from '../../../../../../v12-motion-icons-core/test/waapiStub';
import {
  BookmarkToggle,
  Copy,
  Renew,
  Save,
  Settings,
  StarToggle,
  ViewToggle,
  MotionIconProvider,
  type MotionIconHandle,
} from '../index';

let clock = manualScheduler();
const start = () => {
  clock = manualScheduler();
  setScheduler(clock);
};
afterEach(() => {
  cleanup();
  setScheduler(null);
  vi.restoreAllMocks();
});
async function frame(n = 1) {
  for (let i = 0; i < n; i++) {
    await act(async () => {
      clock.advance(1000 / 60);
      await Promise.resolve();
    });
  }
}
const g = (c: Element) => c.querySelector('svg > g[data-mc-ink]')!;
/** The press's transform (null at rest, or with no ink group: Carbon's still art). */
const tf = (c: Element) => g(c)?.getAttribute('transform') ?? null;
const scaleOf = (t: string | null) =>
  Number(/scale\(([^)]+)\)/.exec(t ?? '')?.[1] ?? 1);
function pointer(el: Element, type: string, pointerType = 'mouse') {
  const ev = new MouseEvent(type, {
    bubbles: type !== 'pointerleave',
    button: 0,
  });
  Object.defineProperty(ev, 'pointerType', { value: pointerType });
  act(() => void el.dispatchEvent(ev));
}
const key = (
  el: Element,
  type: 'keydown' | 'keyup',
  k: string,
  repeat = false
) =>
  act(
    () =>
      void el.dispatchEvent(
        new KeyboardEvent(type, { key: k, repeat, bubbles: true })
      )
  );

/** Press where the control is (`at`, else the svg), one frame: whether it pressed. Then release. */
async function presses(ui: React.ReactElement, at?: string) {
  start();
  const { container } = render(ui);
  const target = at
    ? container.querySelector(at)!
    : container.querySelector('svg')!;
  pointer(target, 'pointerdown');
  await frame();
  const did = tf(container) !== null;
  pointer(target, 'pointerup');
  await frame(10);
  expect(tf(container)).toBeNull();
  cleanup();
  return did;
}

describe('which icons press', () => {
  it('the icon is the control: asButton, actionOn="click" (hover and status icons)', async () => {
    expect(
      await presses(
        <BookmarkToggle animated asButton aria-label="Bookmark" />,
        'button'
      )
    ).toBe(true);
    expect(
      await presses(
        <StarToggle animated asButton aria-label="Star" />,
        'button'
      )
    ).toBe(true);
    expect(
      await presses(
        <ViewToggle animated asButton aria-label="Show" />,
        'button'
      )
    ).toBe(true);
    expect(await presses(<Copy animated actionOn="click" />)).toBe(true);
    expect(await presses(<Save animated actionOn="click" />)).toBe(true);
  });

  it('not the control: a plain toggle, a hover-only icon, a status icon without an action on click', async () => {
    expect(await presses(<BookmarkToggle animated />)).toBe(false);
    expect(await presses(<Settings animated />)).toBe(false);
    expect(await presses(<Copy animated />)).toBe(false);
    expect(await presses(<Copy animated status="success" />)).toBe(false);
  });

  it('inside something that presses: a rollover button (a frame), cds-icon-button, a menu item', async () => {
    expect(
      await presses(
        <button className="rollover" data-motion-icon-frame="">
          <Copy animated actionOn="click" />
        </button>,
        'button'
      )
    ).toBe(false);
    expect(
      await presses(
        <button>
          <Save animated actionOn="click" />
        </button>
      )
    ).toBe(false);
    const Cds = 'cds-icon-button' as unknown as 'button';
    expect(
      await presses(
        <Cds data-motion-icon-frame="">
          <Copy animated actionOn="click" />
        </Cds>,
        'cds-icon-button'
      )
    ).toBe(false);
    expect(
      await presses(
        <div role="menuitem">
          <Copy animated actionOn="click" />
        </div>
      )
    ).toBe(false);
  });

  it('a frame marked "press"; the press prop either way', async () => {
    expect(
      await presses(
        <button data-motion-icon-frame="press">
          <Settings animated />
        </button>,
        'button'
      )
    ).toBe(true);
    expect(await presses(<Settings animated press />)).toBe(true);
    expect(
      await presses(
        <button data-motion-icon-frame="">
          <Copy animated press />
        </button>,
        'button'
      )
    ).toBe(true);
    expect(
      await presses(
        <BookmarkToggle animated asButton aria-label="B" press={false} />,
        'button'
      )
    ).toBe(false);
    expect(
      await presses(<Copy animated actionOn="click" press={false} />)
    ).toBe(false);
  });

  it('a frame that turns "press" after mount, with no re-render, presses; turned back, it doesn’t', async () => {
    start();
    const { container } = render(
      <button data-motion-icon-frame="">
        <Settings animated />
      </button>
    );
    const button = container.querySelector('button')!;
    button.setAttribute('data-motion-icon-frame', 'press');
    pointer(button, 'pointerdown');
    await frame();
    expect(tf(container)).not.toBeNull();
    pointer(button, 'pointerup');
    await frame(10);
    expect(tf(container)).toBeNull();
    key(button, 'keydown', ' ');
    await frame();
    expect(tf(container), 'Space on the frame').not.toBeNull();
    key(button, 'keyup', ' ');
    await frame(10);
    button.setAttribute('data-motion-icon-frame', '');
    pointer(button, 'pointerdown');
    await frame();
    expect(tf(container)).toBeNull();
    pointer(button, 'pointerup');
  });
});

describe('input', () => {
  it('mouse and touch: down presses on the next frame, up releases over fast-02', async () => {
    for (const type of ['mouse', 'touch']) {
      start();
      const { container } = render(
        <BookmarkToggle animated asButton aria-label="Bookmark" />
      );
      const button = container.querySelector('button')!;
      pointer(button, 'pointerdown', type);
      expect(tf(container)).toBeNull();
      await frame();
      expect(tf(container), type).toBe('translate(1 1) scale(0.9375)');
      pointer(button, 'pointerup', type);
      const out: number[] = [];
      for (let i = 0; i < 8; i++) {
        await frame();
        out.push(scaleOf(tf(container)));
      }
      expect(out.at(-1)).toBe(1);
      expect(out.filter((s) => s < 1).length).toBeGreaterThanOrEqual(5);
      cleanup();
    }
  });

  it('Space and Enter on its button: keydown presses, keyup releases; repeats press nothing more', async () => {
    for (const k of [' ', 'Enter']) {
      start();
      const { container } = render(
        <BookmarkToggle animated asButton aria-label="Bookmark" />
      );
      const button = container.querySelector('button')!;
      const writes: string[] = [];
      const mo = new MutationObserver((rs) =>
        rs.forEach((r) =>
          writes.push(String((r.target as Element).getAttribute('transform')))
        )
      );
      mo.observe(g(container), {
        attributes: true,
        attributeFilter: ['transform'],
      });
      key(button, 'keydown', k);
      await frame();
      for (let i = 0; i < 6; i++) {
        key(button, 'keydown', k, true);
        await frame();
      }
      expect(writes, k).toEqual(['translate(1 1) scale(0.9375)']);
      key(button, 'keyup', k);
      await frame(10);
      expect(tf(container)).toBeNull();
      mo.disconnect();
      cleanup();
    }
  });

  it('during an action, and through a status icon’s hand-off to its status', async () => {
    start();
    const { container } = render(
      <Copy
        animated
        actionOn="click"
        actionThen={{ status: 'success', for: 2000 }}
      />
    );
    const svg = () => container.querySelector('svg')!;
    pointer(svg(), 'pointerdown');
    pointer(svg(), 'pointerup');
    act(() => svg().dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await frame(3);
    pointer(svg(), 'pointerdown');
    await frame();
    expect(tf(container), 'pressed mid-action').toBe(
      'translate(1 1) scale(0.9375)'
    );
    pointer(svg(), 'pointerup');
    await frame(60);
    expect(
      container.querySelector('[data-k^="status-"][d]:not([d=""])'),
      'the status shows'
    ).not.toBeNull();
    pointer(svg(), 'pointerdown');
    await frame();
    expect(tf(container), 'pressed on the status drawing').toBe(
      'translate(1 1) scale(0.9375)'
    );
  });

  it('reduced motion, animated={false}, a disabled button: no press', async () => {
    expect(
      await presses(
        <BookmarkToggle animated={false} asButton aria-label="B" />,
        'button'
      )
    ).toBe(false);
    expect(
      await presses(
        <BookmarkToggle animated asButton disabled aria-label="B" />,
        'button'
      )
    ).toBe(false);
    expect(
      await presses(
        <button disabled data-motion-icon-frame="press">
          <Settings animated />
        </button>,
        'button'
      )
    ).toBe(false);
    // jsdom has no matchMedia: one that reports reduced motion, for this check only.
    const had = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (q: string) =>
        ({
          matches: q.includes('reduce'),
          media: q,
          addEventListener() {},
          removeEventListener() {},
        }) as unknown as MediaQueryList,
    });
    try {
      expect(
        await presses(
          <MotionIconProvider>
            <Copy actionOn="click" />
          </MotionIconProvider>
        )
      ).toBe(false);
      expect(
        await presses(<BookmarkToggle asButton aria-label="B" />, 'button')
      ).toBe(false);
    } finally {
      if (had) Object.defineProperty(window, 'matchMedia', had);
      else delete (window as { matchMedia?: unknown }).matchMedia;
    }
  });
});

describe('composition', () => {
  it('hover under a held press: the same shapes, the group scaled', async () => {
    const run = async (pressed: boolean) => {
      start();
      const { container } = render(<Save animated actionOn="click" />);
      const svg = container.querySelector('svg')!;
      pointer(svg, 'pointerenter');
      if (pressed) pointer(svg, 'pointerdown');
      const seen: string[] = [];
      for (let i = 0; i < 12; i++) {
        await frame();
        seen.push(g(container).innerHTML);
      }
      const t = tf(container);
      cleanup();
      return { seen, t };
    };
    const plain = await run(false);
    const pressed = await run(true);
    expect(pressed.seen).toEqual(plain.seen);
    expect(new Set(plain.seen).size).toBeGreaterThan(3);
    expect(plain.t).toBeNull();
    expect(pressed.t).toBe('translate(1 1) scale(0.9375)');
  });

  it('Renew’s loop turns the svg, the press scales the group', async () => {
    start();
    const w = waapi(() => clock.time());
    const undo = w.install();
    try {
      const ref = createRef<MotionIconHandle>();
      const { container } = render(<Renew animated press ref={ref} />);
      act(() => void ref.current!.trigger({ loop: true }));
      await frame(45);
      const svg = container.querySelector('svg')!;
      expect(w.live(svg)).toHaveLength(1);
      pointer(svg, 'pointerdown');
      await frame();
      expect(svg.getAttribute('transform')).toBeNull();
      expect(tf(container)).toBe('translate(1 1) scale(0.9375)');
      expect(w.live(svg)).toHaveLength(1);
    } finally {
      undo();
    }
  });
});

describe('the scale per size', () => {
  it('1px a side at 16, 20, 24, 32', async () => {
    const seen: number[] = [];
    for (const size of [16, 20, 24, 32] as const) {
      start();
      const { container } = render(
        <BookmarkToggle animated asButton aria-label="B" size={size} />
      );
      pointer(container.querySelector('button')!, 'pointerdown');
      await frame();
      seen.push(scaleOf(tf(container)));
      cleanup();
    }
    expect(seen).toEqual([0.875, 0.9, 0.9167, 0.9375]);
  });
});
