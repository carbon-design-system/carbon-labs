/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * What an icon binds, and to which svg:
 *  - the press is bound only on icons that may press; at rest it
 *    hears only what starts a press (a frame may turn "press" later,
 *    so an icon in any frame binds that much);
 *  - a hover icon binds no click on its frame;
 *  - a looping toggle's visibility observer follows the svg when
 *    `asButton` swaps it.
 */
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BookmarkToggle, Edit, MicrophoneVoiceModeToggle } from '../index';

// jsdom has no IntersectionObserver: a fake one records what is observed. (The core keeps the document's observer,
// so it is stubbed for the whole file.)
class FakeIO {
  static observed = new Set<Element>();
  observe(el: Element) {
    FakeIO.observed.add(el);
  }
  unobserve(el: Element) {
    FakeIO.observed.delete(el);
  }
  disconnect() {}
}
vi.stubGlobal('IntersectionObserver', FakeIO);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** The listeners on each element, as added and removed: each listener's type, sorted. */
function listeners() {
  const on = new Map<EventTarget, Map<string, number>>();
  const add = EventTarget.prototype.addEventListener;
  const remove = EventTarget.prototype.removeEventListener;
  const bump = (t: EventTarget, type: string, by: number) => {
    const m = on.get(t) ?? new Map<string, number>();
    on.set(t, m);
    m.set(type, (m.get(type) ?? 0) + by);
    if (!m.get(type)) m.delete(type);
  };
  vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(
    function (this: EventTarget, type, fn, o) {
      bump(this, type, 1);
      return add.call(this, type, fn, o);
    }
  );
  vi.spyOn(EventTarget.prototype, 'removeEventListener').mockImplementation(
    function (this: EventTarget, type, fn, o) {
      bump(this, type, -1);
      return remove.call(this, type, fn, o);
    }
  );
  return (el: EventTarget | null) =>
    [...(on.get(el!) ?? [])]
      .flatMap(([type, n]) => Array<string>(n).fill(type))
      .sort();
}

const HOVER = [
  'mouseenter',
  'mouseleave',
  'pointerdown',
  'pointerenter',
  'pointerleave',
  'pointerover',
];
const FOCUS = ['focusin', 'focusout'];
const INK = ['transitioncancel', 'transitionend', 'transitionrun'];
/** The press at rest: what starts one. What ends one (keyup, pointerup, pointercancel, pointerleave, focusout) is heard while it is held. */
const PRESS = ['keydown', 'pointerdown'];
const sorted = (...types: string[][]) => types.flat().sort();

describe('what an icon binds', () => {
  it('a hover icon in a frame: hover, focus and the press’s start on the frame (it may turn "press"), no click', () => {
    const on = listeners();
    const { getByRole, container } = render(
      <button data-motion-icon-frame>
        <Edit />
      </button>
    );
    expect(on(getByRole('button'))).toEqual(sorted(HOVER, FOCUS, PRESS));
    expect(on(container.querySelector('svg'))).toEqual(INK);
  });

  it('a hover icon in a plain button or a menu item that isn’t a frame: no press', () => {
    const on = listeners();
    const a = render(
      <button>
        <Edit />
      </button>
    );
    expect(on(a.container.querySelector('svg'))).toEqual(sorted(HOVER, INK));
    expect(on(a.container.querySelector('button'))).toEqual([]);
    const b = render(
      <div role="menuitem">
        <Edit />
      </div>
    );
    expect(on(b.container.querySelector('[role=menuitem]'))).toEqual([]);
  });

  it('a held press hears its end, and lets go of it on release', () => {
    const on = listeners();
    const { getByRole } = render(
      <div role="button" tabIndex={0} data-motion-icon-frame="press">
        <Edit />
      </div>
    );
    const frame = getByRole('button');
    const ev = new MouseEvent('pointerdown', { bubbles: true, button: 0 });
    frame.dispatchEvent(ev);
    expect(on(frame)).toEqual(
      sorted(HOVER, FOCUS, PRESS, [
        'focusout',
        'keyup',
        'pointercancel',
        'pointerleave',
        'pointerup',
      ])
    );
    frame.dispatchEvent(
      new MouseEvent('pointerup', { bubbles: true, button: 0 })
    );
    expect(on(frame)).toEqual(sorted(HOVER, FOCUS, PRESS));
  });

  it('a bare hover icon: hover and ink on the svg, no press', () => {
    const on = listeners();
    const { container } = render(<Edit />);
    expect(on(container.querySelector('svg'))).toEqual(sorted(HOVER, INK));
  });

  it('a toggle in a frame: its click on the frame, and the press’s start', () => {
    const on = listeners();
    const { getByRole } = render(
      <button data-motion-icon-frame>
        <BookmarkToggle />
      </button>
    );
    expect(on(getByRole('button'))).toEqual(
      sorted(HOVER, FOCUS, ['click'], PRESS)
    );
  });

  it('presses where it can: a frame marked "press", its own button, the `press` prop', () => {
    const on = listeners();
    const a = render(
      <div role="button" tabIndex={0} data-motion-icon-frame="press">
        <Edit />
      </div>
    );
    expect(on(a.getByRole('button'))).toEqual(sorted(HOVER, FOCUS, PRESS));
    const b = render(<BookmarkToggle asButton aria-label="Bookmark" />);
    expect(on(b.getByRole('button', { name: 'Bookmark' }))).toEqual(
      sorted(FOCUS, PRESS)
    );
    const c = render(<Edit press />);
    expect(on(c.container.querySelector('svg'))).toEqual(
      sorted(HOVER, INK, PRESS)
    );
  });

  it('the press follows the `press` prop', () => {
    const on = listeners();
    const { container, rerender } = render(<Edit />);
    const svg = container.querySelector('svg');
    expect(on(svg)).toEqual(sorted(HOVER, INK));
    rerender(<Edit press />);
    expect(on(svg)).toEqual(sorted(HOVER, INK, PRESS));
    rerender(<Edit press={false} />);
    expect(on(svg)).toEqual(sorted(HOVER, INK));
  });
});

describe('a looping toggle swapped by `asButton`', () => {
  it('observes the svg it draws now, not the one it replaced', () => {
    const { container, rerender } = render(
      <MicrophoneVoiceModeToggle toggled />
    );
    const before = container.querySelector('svg')!;
    expect(FakeIO.observed.has(before)).toBe(true);
    rerender(
      <MicrophoneVoiceModeToggle toggled asButton aria-label="Listen" />
    );
    const after = container.querySelector('svg')!;
    expect(after).not.toBe(before);
    expect(FakeIO.observed.has(after)).toBe(true);
    expect(FakeIO.observed.has(before)).toBe(false);
  });
});
