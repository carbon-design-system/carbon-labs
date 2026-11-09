/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The React package's lifecycle checks:
 *  - under StrictMode (mount, destroy, mount) and `<Activity>` (hide,
 *    show) a status set after mount draws its mark, and pending turns;
 *  - a value outside a toggle's states is ignored with a warning: the
 *    drawing and aria-pressed are kept, and VolumeLevelToggle doesn't throw.
 * Phase 2:
 *  - G: bare icons share one delegated focusin / focusout pair per root.
 */
import React, { Activity, StrictMode } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import {
  BookmarkToggle,
  Renew,
  Save,
  Settings,
  StatusPip,
  TrashCan,
  VolumeLevelToggle,
} from '../index';

afterEach(() => {
  cleanup();
  setScheduler(null);
  vi.restoreAllMocks();
});

function clock() {
  const c = manualScheduler();
  setScheduler(c);
  return async (ms: number) => {
    for (let t = 0; t < ms; t += 1000 / 60) {
      await act(async () => {
        c.advance(1000 / 60);
        await Promise.resolve();
      });
    }
  };
}
const ink = (c: HTMLElement) => c.querySelector('[data-mc-ink]')!.innerHTML;

describe('StrictMode', () => {
  for (const status of ['success', 'error', 'warning'] as const) {
    it(`a ${status} set after mount draws its mark, as without StrictMode`, async () => {
      const run = clock();
      const strict = render(
        <StrictMode>
          <Save animated />
        </StrictMode>
      );
      const plain = render(<Save animated />);
      strict.rerender(
        <StrictMode>
          <Save animated status={status} />
        </StrictMode>
      );
      plain.rerender(<Save animated status={status} />);
      await run(1000);
      expect(ink(plain.container)).not.toBe(
        ink(render(<Save animated />).container)
      );
      expect(ink(strict.container)).toBe(ink(plain.container));
    });
  }

  it('pending set after mount turns', async () => {
    const run = clock();
    const { container, rerender } = render(
      <StrictMode>
        <Settings animated />
      </StrictMode>
    );
    rerender(
      <StrictMode>
        <Settings animated status="pending" />
      </StrictMode>
    );
    await run(600);
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      await run(1000 / 60);
      seen.add(ink(container));
    }
    expect(seen.size).toBeGreaterThan(5);
  });

  // `<Activity>` is React 19's; on React 18 there is none to hide the icon.
  ((Activity as unknown) !== undefined ? it : it.skip)(
    '<Activity> hidden and shown: pending turns again',
    async () => {
      const run = clock();
      const view = (mode: 'visible' | 'hidden') => (
        <Activity mode={mode}>
          <Settings animated status="pending" />
        </Activity>
      );
      const { container, rerender } = render(view('visible'));
      await run(300);
      rerender(view('hidden'));
      await run(300);
      rerender(view('visible'));
      const seen = new Set<string>();
      for (let i = 0; i < 20; i++) {
        await run(1000 / 60);
        seen.add(ink(container));
      }
      expect(seen.size).toBeGreaterThan(5);
    }
  );
});

describe('a value outside the states', () => {
  it('on a toggle: ignored with a warning; the drawing and aria-pressed kept', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const off = render(
      <BookmarkToggle animated asButton aria-label="b" value="off" />
    );
    const typo = render(
      <BookmarkToggle animated asButton aria-label="b" value={'off' as never} />
    );
    typo.rerender(
      <BookmarkToggle
        animated
        asButton
        aria-label="b"
        value={'typo' as never}
      />
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"typo"'));
    expect(ink(typo.container)).toBe(ink(off.container));
    expect(
      typo.container.querySelector('button')!.getAttribute('aria-pressed')
    ).toBe('false');
    // From the first render, still (Carbon's art) too.
    for (const animated of [true, false]) {
      expect(
        render(<BookmarkToggle animated={animated} value={'typo' as never} />)
          .container.innerHTML
      ).toBe(
        render(<BookmarkToggle animated={animated} value="off" />).container
          .innerHTML
      );
    }
  });

  it('on VolumeLevelToggle: no throw, the level kept', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const run = clock();
    const loud = render(<VolumeLevelToggle animated value="loud" />);
    const { container, rerender } = render(
      <VolumeLevelToggle animated value="loud" />
    );
    rerender(<VolumeLevelToggle animated value={'typo' as never} />);
    await run(500);
    expect(ink(container)).toBe(ink(loud.container));
    for (const animated of [true, false]) {
      expect(() =>
        render(
          <VolumeLevelToggle animated={animated} value={'typo' as never} />
        )
      ).not.toThrow();
      expect(() =>
        render(
          <VolumeLevelToggle animated={animated} initial={'typo' as never} />
        )
      ).not.toThrow();
    }
  });
});

describe('G: focus listeners', () => {
  it('a page of bare icons adds one delegated focusin / focusout pair to its document, not one per icon', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <Settings key={i} />
        ))}
      </>
    );
    const count = (spy: typeof add, type: string) =>
      spy.mock.calls.filter(([t]) => t === type).length;
    expect(count(add, 'focusin')).toBeLessThanOrEqual(1);
    expect(count(add, 'focusout')).toBeLessThanOrEqual(1);
    unmount();
    expect(count(remove, 'focusin')).toBe(0);
  });

  it('keyboard focus on a bare icon given a tabindex still plays its hover', async () => {
    const run = clock();
    const { container } = render(<Settings animated />);
    const svg = container.querySelector('svg')!;
    svg.setAttribute('tabindex', '0');
    const rest = ink(container);
    // jsdom matches :focus-visible as :focus (see useHoverFocus.test.tsx).
    act(() => svg.focus());
    await run(300);
    expect(ink(container)).not.toBe(rest);
  });
});

describe('a disabled asButton', () => {
  it('is a disabled button: no toggling, no hover; enabled again, it toggles', async () => {
    const run = clock();
    const onChange = vi.fn();
    const { container, rerender } = render(
      <BookmarkToggle
        animated
        asButton
        aria-label="b"
        disabled
        onChange={onChange}
      />
    );
    const button = container.querySelector('button')!;
    expect(button.disabled).toBe(true);
    const rest = ink(container);
    act(() => button.click());
    container.querySelector('svg')!.dispatchEvent(new MouseEvent('mouseenter'));
    await run(300);
    expect(onChange).not.toHaveBeenCalled();
    expect(ink(container)).toBe(rest);
    rerender(
      <BookmarkToggle animated asButton aria-label="b" onChange={onChange} />
    );
    expect(button.disabled).toBe(false);
    act(() => button.click());
    expect(onChange).toHaveBeenCalledWith('on');
    // Still (Carbon's art) and on a state icon too.
    expect(
      render(
        <BookmarkToggle animated={false} asButton aria-label="b" disabled />
      ).container.querySelector('button')!.disabled
    ).toBe(true);
    expect(
      render(
        <VolumeLevelToggle asButton aria-label="v" disabled />
      ).container.querySelector('button')!.disabled
    ).toBe(true);
  });
});

describe('the other props pass through, as @carbon/icons-react', () => {
  const extra = {
    id: 'i',
    title: 'T',
    'aria-describedby': 'd',
    'data-test': 'x',
    tabIndex: 0,
  } as const;
  const svgOf = (c: HTMLElement) => c.querySelector('svg')!;
  const check = (el: Element, what: string) => {
    expect(el.getAttribute('id'), what).toBe('i');
    expect(el.getAttribute('title'), what).toBe('T');
    expect(el.getAttribute('aria-describedby'), what).toBe('d');
    expect(el.getAttribute('data-test'), what).toBe('x');
    expect(el.getAttribute('tabindex'), what).toBe('0');
  };

  it('onto the svg of hover, toggle, state, status and pip icons, animated, reduced and still', () => {
    for (const animated of [true, false]) {
      check(
        svgOf(render(<Settings animated={animated} {...extra} />).container),
        `Settings ${animated}`
      );
      check(
        svgOf(
          render(<Save animated={animated} status="success" {...extra} />)
            .container
        ),
        `Save status ${animated}`
      );
      check(
        svgOf(
          render(<BookmarkToggle animated={animated} {...extra} />).container
        ),
        `BookmarkToggle ${animated}`
      );
      check(
        svgOf(
          render(<VolumeLevelToggle animated={animated} {...extra} />).container
        ),
        `VolumeLevelToggle ${animated}`
      );
    }
    check(
      svgOf(render(<StatusPip count={3} {...extra} />).container),
      'StatusPip'
    );
  });

  it('onto the button with asButton', () => {
    for (const animated of [true, false]) {
      const { container } = render(
        <BookmarkToggle
          animated={animated}
          asButton
          aria-label="b"
          {...extra}
        />
      );
      check(container.querySelector('button')!, `button ${animated}`);
    }
  });

  it('an accessible name (aria-label, aria-labelledby or title) makes the svg an image, not hidden', () => {
    for (const name of [
      { 'aria-label': 'n' },
      { 'aria-labelledby': 'x' },
      { title: 'n' },
    ]) {
      for (const el of [
        <Settings animated {...name} />,
        <Settings animated={false} {...name} />,
        <Save animated status="success" {...name} />,
        <BookmarkToggle animated {...name} />,
      ]) {
        const svg = svgOf(render(el).container);
        expect(
          svg.getAttribute('aria-hidden'),
          JSON.stringify(name)
        ).toBeNull();
        expect(svg.getAttribute('role'), JSON.stringify(name)).toBe('img');
      }
    }
    const bare = svgOf(render(<Settings animated />).container);
    expect(bare.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('a loop when motion comes back', () => {
  for (const [name, Icon] of [
    ['Renew', Renew],
    ['TrashCan', TrashCan],
  ] as const) {
    it(`${name}: loop still set, animated off and back on: it loops again (no hand-off)`, async () => {
      const run = clock();
      const view = (animated: boolean) => (
        <Icon animated={animated} loop actionThen={{ status: 'success' }} />
      );
      const { container, rerender } = render(view(true));
      const seen = async (ms: number) => {
        const s = new Set<string>();
        for (let t = 0; t < ms; t += 1000 / 60) {
          await run(1000 / 60);
          s.add(ink(container));
        }
        return s;
      };
      expect((await seen(400)).size, 'looping').toBeGreaterThan(3);
      rerender(view(false));
      await run(100);
      rerender(view(true));
      expect((await seen(600)).size, 'looping again').toBeGreaterThan(3);
      expect(
        container.querySelector('[data-k="status-check"]')?.getAttribute('d') ??
          '',
        'no hand-off'
      ).toBe('');
    });
  }
});

describe('tones under forced colors', () => {
  it('a status icon or pip adds the forced-colors rules once per document', () => {
    const count = () =>
      document.querySelectorAll('style[data-motion-icons="forced-colors"]')
        .length;
    render(<Save animated status="warning" tone />);
    render(<Save animated={false} status="warning" tone />);
    render(<StatusPip count={2} tone="warning" />);
    expect(count()).toBe(1);
  });

  it('the toned warning is filled like Carbon: the "!" a dark path in a hole of the fill, which forced colors drops', () => {
    for (const animated of [true, false]) {
      const { container, unmount } = render(
        <Save animated={animated} status="warning" tone size={16} />
      );
      const warn = container.querySelector('[data-k="status-warn"]')!;
      const bang = container.querySelector('[data-k="status-bang"]')!;
      expect(warn.getAttribute('fill')).toBe(
        'var(--cds-support-warning, #f1c21b)'
      );
      expect(warn.getAttribute('fill-rule')).toBe('evenodd');
      expect(warn.getAttribute('stroke')).toBe('none');
      expect(bang.getAttribute('fill')).toBe('#000000');
      expect(bang.getAttribute('d')).not.toBe('');
      expect(warn.getAttribute('d')!.endsWith(bang.getAttribute('d')!)).toBe(
        true
      );
      unmount();
    }
    const style = document.querySelector(
      'style[data-motion-icons="forced-colors"]'
    )!.textContent!;
    expect(style).toContain('[data-k$="-bang"] { fill: none; }');
    // Untoned: the outline in currentColor, no "!".
    const { container } = render(<Save animated={false} status="warning" />);
    expect(
      container.querySelector('[data-k="status-warn"]')!.getAttribute('stroke')
    ).toBe('currentColor');
    expect(
      container.querySelector('[data-k="status-bang"]')!.getAttribute('d')
    ).toBe('');
  });
});

describe('off screen', () => {
  // jsdom has no IntersectionObserver: a fake one reports what the test says is on screen. (Last in the file: the
  // core keeps the document's observer.)
  class FakeIO {
    static all: FakeIO[] = [];
    observed = new Set<Element>();
    constructor(
      private cb: (
        entries: { target: Element; isIntersecting: boolean }[]
      ) => void
    ) {
      FakeIO.all.push(this);
    }
    observe(el: Element) {
      this.observed.add(el);
    }
    unobserve(el: Element) {
      this.observed.delete(el);
    }
    disconnect() {}
    show(els: Element[], on: boolean) {
      this.cb(els.map((target) => ({ target, isIntersecting: on })));
    }
  }

  it('one observer for every icon; hidden, a pending spinner and a loop hold; shown, they carry on', async () => {
    vi.stubGlobal('IntersectionObserver', FakeIO);
    const run = clock();
    const { container } = render(
      <>
        <Settings animated status="pending" />
        <Save animated status="pending" />
        <TrashCan animated loop />
        <Renew animated loop />
      </>
    );
    const svgs = [...container.querySelectorAll('svg')];
    expect(FakeIO.all).toHaveLength(1);
    const io = FakeIO.all[0];
    expect(svgs.every((s) => io.observed.has(s))).toBe(true);
    await run(200);
    act(() => io.show(svgs, false));
    await new Promise((r) => setTimeout(r, 0));
    const inks = () =>
      svgs.map((s) => s.querySelector('[data-mc-ink]')!.innerHTML);
    const held = inks();
    await run(500);
    expect(inks()).toEqual(held);
    act(() => io.show(svgs, true));
    await new Promise((r) => setTimeout(r, 0));
    const seen = svgs.map(() => new Set<string>());
    for (let i = 0; i < 20; i++) {
      await run(1000 / 60);
      inks().forEach((x, k) => seen[k].add(x));
    }
    expect(seen.map((s) => s.size > 3)).toEqual(svgs.map(() => true));
    vi.unstubAllGlobals();
  });
});
