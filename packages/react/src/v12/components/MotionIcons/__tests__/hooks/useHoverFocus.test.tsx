/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Keyboard focus plays the hover, through useHover (the
 * core's bindHover): focus on the marked frame, or on a toggle's own
 * `asButton` button. Pointer hover and focus together play once, and the
 * icon leaves only when both have ended. A mouse-click focus (not
 * `:focus-visible`) adds nothing. jsdom matches `:focus-visible` like
 * `:focus`, so mouse focus is modelled by making it not match.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import { useHover } from '../../hooks/useHover';
import { BookmarkToggle } from '../../icons/toggle/opsFillToggles';
import * as Lib from '../../index';

afterEach(() => {
  vi.restoreAllMocks();
  setScheduler(null);
});

function Framed({
  onEnter,
  onLeave,
}: {
  onEnter?: () => void;
  onLeave?: () => void;
}) {
  const { ref, isHovering } = useHover({ onEnter, onLeave });
  return (
    <button type="button" data-motion-icon-frame="" data-testid="frame">
      <svg ref={ref} data-testid="svg" role="presentation" />
      <i data-testid="hovering">{String(isHovering)}</i>
    </button>
  );
}

function mouseFocus(el: HTMLElement) {
  const matches = Element.prototype.matches;
  const spy = vi
    .spyOn(Element.prototype, 'matches')
    .mockImplementation(function (this: Element, s: string) {
      return s === ':focus-visible' ? false : matches.call(this, s);
    });
  act(() => el.focus());
  spy.mockRestore();
}

describe('useHover · keyboard focus', () => {
  it('focus on the frame hovers; blur ends it', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    render(<Framed onEnter={onEnter} onLeave={onLeave} />);
    const frame = screen.getByTestId('frame');
    act(() => frame.focus());
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('hovering').textContent).toBe('true');
    act(() => frame.blur());
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('hovering').textContent).toBe('false');
  });

  it('pointer and focus together hover once; the icon leaves when both have ended', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    render(<Framed onEnter={onEnter} onLeave={onLeave} />);
    const frame = screen.getByTestId('frame');
    fireEvent.mouseEnter(frame);
    act(() => frame.focus());
    fireEvent.mouseLeave(frame);
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onLeave).not.toHaveBeenCalled();
    act(() => frame.blur());
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('a mouse click that focuses the frame does not keep the hover after the pointer leaves', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    render(<Framed onEnter={onEnter} onLeave={onLeave} />);
    const frame = screen.getByTestId('frame');
    fireEvent.mouseEnter(frame);
    mouseFocus(frame);
    fireEvent.mouseLeave(frame);
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('an asButton toggle: keyboard focus on its own button plays the hover, blur plays it back', async () => {
    const clock = manualScheduler();
    setScheduler(clock);
    render(<BookmarkToggle asButton aria-label="Bookmark" />);
    const button = screen.getByRole('button', { name: 'Bookmark' });
    const drawing = () => button.querySelector('svg')!.innerHTML;
    const rest = drawing();
    act(() => button.focus());
    clock.advance(400);
    await Promise.resolve();
    const hovered = drawing();
    expect(hovered).not.toBe(rest);
    act(() => button.blur());
    clock.advance(400);
    await Promise.resolve();
    expect(drawing()).toBe(rest);
  });
});

/**
 * Chrome makes an svg focusable once it has a focus listener, so a click on
 * a bare icon (no frame, no asButton) focused it and drew the UA's `:focus`
 * outline. The binding hears a bare svg's focus from its document instead.
 */
describe('useHover · a bare icon gets no focus listener on its svg', () => {
  const FOCUS = ['focus', 'blur', 'focusin', 'focusout'];
  /** Every focus-family listener added to an svg element while `fn` runs. */
  function svgFocusListeners(fn: () => void): string[] {
    const add = EventTarget.prototype.addEventListener;
    const seen: string[] = [];
    vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(
      function (this: EventTarget, type: string, ...rest) {
        if (this instanceof SVGElement && FOCUS.includes(type))
          seen.push(`${(this as Element).localName} ${type}`);
        return add.call(this, type, ...(rest as [EventListener]));
      }
    );
    fn();
    return seen;
  }
  // Every exported component (each icon, toggle and status icon), rendered bare.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ICONS = Object.entries(
    Lib as unknown as Record<string, React.ComponentType<any>>
  ).filter(
    ([n, C]) =>
      /^[A-Z]/.test(n) &&
      n !== 'MotionIconProvider' &&
      (typeof C === 'function' || (typeof C === 'object' && C !== null))
  );

  it('every exported icon, rendered bare', () => {
    expect(ICONS.length, 'the whole package').toBeGreaterThan(50);
    const offenders: string[] = [];
    for (const [name, Icon] of ICONS) {
      let svgs = 0;
      const added = svgFocusListeners(() => {
        const { container } = render(<Icon size={20} />);
        svgs = container.querySelectorAll('svg').length;
      });
      vi.restoreAllMocks();
      cleanup();
      if (!svgs) offenders.push(`${name}: no svg`);
      if (added.length) offenders.push(`${name}: ${added.join(', ')}`);
    }
    expect(offenders).toEqual([]);
  });

  it('bare, it still hovers under the pointer; with a tabindex, keyboard focus still plays it', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    function Bare() {
      const { ref } = useHover({ onEnter, onLeave });
      return <svg ref={ref} data-testid="bare" tabIndex={0} />;
    }
    render(<Bare />);
    const svg = screen.getByTestId('bare');
    fireEvent.mouseEnter(svg);
    fireEvent.mouseLeave(svg);
    act(() => svg.focus());
    act(() => svg.blur());
    expect(onEnter).toHaveBeenCalledTimes(2);
    expect(onLeave).toHaveBeenCalledTimes(2);
  });
});
