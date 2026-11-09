/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Ink on a still drawing that appears after the icon has mounted:
 * reduced motion or `animated` changing mid-session, and hydration on a client
 * that prefers reduced motion (the server renders the animated markup). The
 * still svg follows a consumer's `fill`; going back to the animated drawing
 * leaves no ink listeners on the detached still svg.
 *
 * Also: attaching ink resolves the svg's style once, reading
 * everything before it writes.
 */
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setReducedMotionSource } from '@carbon-labs/motion-icons-core/engine/env';
import { Edit, HomeFilled } from '../index';

/** The reduced-motion preference, flipped by the test. */
function reducedMotion(initial: boolean) {
  let on = initial;
  let notify: (() => void) | undefined;
  setReducedMotionSource({
    get: () => on,
    subscribe: (cb) => ((notify = cb), () => (notify = undefined)),
  });
  return (next: boolean) =>
    act(() => {
      on = next;
      notify?.();
    });
}

/** Ink listeners (transitionrun / transitionend / transitioncancel) per element, as added and removed. */
function countInkListeners() {
  const n = new Map<EventTarget, number>();
  const add = EventTarget.prototype.addEventListener;
  const remove = EventTarget.prototype.removeEventListener;
  const inkType = (t: string) => t.startsWith('transition');
  vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(
    function (this: EventTarget, type, fn, o) {
      if (inkType(type)) n.set(this, (n.get(this) ?? 0) + 1);
      return add.call(this, type, fn, o);
    }
  );
  vi.spyOn(EventTarget.prototype, 'removeEventListener').mockImplementation(
    function (this: EventTarget, type, fn, o) {
      if (inkType(type)) n.set(this, (n.get(this) ?? 0) - 1);
      return remove.call(this, type, fn, o);
    }
  );
  return (el: EventTarget) => n.get(el) ?? 0;
}

const settle = () =>
  act(async () => {
    await Promise.resolve();
  });
const svgOf = (c: HTMLElement) => c.querySelector('svg')!;
const inkOf = (c: HTMLElement) =>
  c.querySelector<SVGGElement>('svg > [data-mc-ink]')!;
const FILL = { fill: 'red' };

afterEach(() => {
  cleanup();
  setReducedMotionSource(null);
  vi.restoreAllMocks();
});

describe('ink on a still drawing shown after mount', () => {
  it('reduced motion turning on: the still icon takes a consumer fill', async () => {
    const set = reducedMotion(false);
    const { container } = render(<Edit style={FILL} />);
    await settle();
    const animated = svgOf(container);
    expect(inkOf(container).style.color).toBe('red');
    set(true);
    await settle();
    expect(svgOf(container)).not.toBe(animated);
    expect(inkOf(container).style.color).toBe('red');
  });

  it('`animated` turning off (an icon without Carbon art): the still icon takes a consumer fill', async () => {
    const { container, rerender } = render(<HomeFilled style={FILL} />);
    await settle();
    rerender(<HomeFilled style={FILL} animated={false} />);
    await settle();
    expect(inkOf(container).style.color).toBe('red');
  });

  it('hydrating on a client that prefers reduced motion: the still icon takes a consumer fill', async () => {
    const { renderToString } = await import('react-dom/server');
    const { hydrateRoot } = await import('react-dom/client');
    const set = reducedMotion(false);
    const html = renderToString(<Edit style={FILL} />);
    set(true);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <Edit style={FILL} />);
    });
    await settle();
    expect(inkOf(container).style.color).toBe('red');
    act(() => root?.unmount());
    container.remove();
  });

  it('the reverse: back to the animated drawing, the detached still svg keeps no ink listeners', async () => {
    const listeners = countInkListeners();
    const set = reducedMotion(true);
    const { container } = render(<Edit style={FILL} />);
    await settle();
    const still = svgOf(container);
    expect(listeners(still)).toBe(3);
    expect(still.style.transition).toContain('fill 1ms');
    set(false);
    await settle();
    const animated = svgOf(container);
    expect(animated).not.toBe(still);
    expect(listeners(still)).toBe(0);
    expect(still.style.transition).not.toContain('fill 1ms');
    expect(listeners(animated)).toBe(3);
    expect(inkOf(container).style.color).toBe('red');
  });

  it('a re-render keeps the still drawing inked once (the ref is stable)', async () => {
    const listeners = countInkListeners();
    reducedMotion(true);
    const { container, rerender } = render(<Edit style={FILL} />);
    await settle();
    rerender(<Edit style={FILL} className="x" />);
    await settle();
    expect(listeners(svgOf(container))).toBe(3);
  });
});

describe('ink at attach', () => {
  it('reads the style once per icon, before its writes, and inks at once', () => {
    const reads = new Map<Element, number>();
    const cs = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el, p) => {
      reads.set(el, (reads.get(el) ?? 0) + 1);
      return cs.call(window, el, p);
    });
    const { container } = render(
      <>
        <Edit style={FILL} />
        <Edit style={FILL} />
        <Edit style={FILL} />
      </>
    );
    const svgs = [...container.querySelectorAll('svg')];
    expect(svgs.map((s) => reads.get(s))).toEqual([1, 1, 1]);
    expect(
      svgs.map(
        (s) =>
          s.querySelector<SVGGElement>(':scope > [data-mc-ink]')!.style.color
      )
    ).toEqual(['red', 'red', 'red']);
    expect(svgs.every((s) => s.style.transition.includes('fill 1ms'))).toBe(
      true
    );
  });
});
