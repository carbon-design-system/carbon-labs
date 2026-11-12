/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable jsdoc/require-jsdoc, jsdoc/require-param */

import { act, fireEvent } from '@testing-library/react';

/**
 * What the behavior tests need from a DOM that has no layout and no
 * animation engine. Import it once, at the top of a test file, for its side
 * effects; the helpers below are for the tests themselves.
 *
 * - Elements report one client rect, so "visible" checks (tab stops, a
 *   floating layer that is up) hold.
 * - `matchMedia` answers from `setReducedMotion`, so a test picks its clock.
 * - `ResizeObserver` and `IntersectionObserver` do nothing.
 * - `Element.animate` returns an animation that finishes on its own (a
 *   microtask later), so a leave that waits for its animation ends.
 * - `document.elementFromPoint` returns the element a test points at.
 */

let reduced = true;
const mediaListeners = new Set<() => void>();

/** Picks `prefers-reduced-motion` for the page; call it before rendering. */
export function setReducedMotion(on: boolean): void {
  reduced = on;
  mediaListeners.forEach((fn) => fn());
}

/** A list of media query listeners is kept so a late change reaches them. */
function matchMedia(query: string): MediaQueryList {
  const read = () =>
    /prefers-reduced-motion:\s*reduce/.test(query) ? reduced : false;
  const handlers = new Set<(e: MediaQueryListEvent) => void>();
  const list = {
    media: query,
    get matches() {
      return read();
    },
    onchange: null,
    addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
      handlers.add(fn);
      mediaListeners.add(() => fn({ matches: read(), media: query } as never));
    },
    removeEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
      handlers.delete(fn);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  };
  return list as unknown as MediaQueryList;
}

class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

/** An animation that has finished by the time anyone asks. */
function finishedAnimation(): Animation {
  const done = Promise.resolve();
  const a = {
    id: '',
    playState: 'finished',
    currentTime: 0,
    effect: null,
    pending: false,
    finished: undefined as unknown as Promise<Animation>,
    ready: undefined as unknown as Promise<Animation>,
    onfinish: null as null | ((e: unknown) => void),
    oncancel: null,
    play() {},
    pause() {},
    cancel() {},
    finish() {},
    reverse() {},
    commitStyles() {},
    persist() {},
    updatePlaybackRate() {},
    addEventListener(type: string, fn: () => void) {
      if (type === 'finish') {
        void done.then(fn);
      }
    },
    removeEventListener() {},
  };
  a.finished = done.then(() => {
    a.onfinish?.({});
    return a as unknown as Animation;
  });
  a.ready = a.finished;
  return a as unknown as Animation;
}

const protoElement = Element.prototype as unknown as Record<string, unknown>;
protoElement.animate = function animate() {
  return finishedAnimation();
};
protoElement.getAnimations = function getAnimations() {
  return [];
};
Element.prototype.getClientRects = function getClientRects() {
  const rect = { x: 0, y: 0, top: 0, left: 0, width: 100, height: 20 };
  const list = [{ ...rect, right: 100, bottom: 20, toJSON: () => rect }];
  return Object.assign(list, { item: (i: number) => list[i] ?? null });
} as never;

/** jsdom has no PointerEvent: a mouse event that carries a pointer id. */
class PointerEventShim extends MouseEvent {
  pointerId: number;
  pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 0;
    this.pointerType = init.pointerType ?? 'mouse';
  }
}
if (!('PointerEvent' in window)) {
  (window as unknown as Record<string, unknown>).PointerEvent =
    PointerEventShim;
  (globalThis as Record<string, unknown>).PointerEvent = PointerEventShim;
}

window.matchMedia = matchMedia;
// jsdom's selector engine has no `:has()`: a rollover's selector that uses one matches nothing.
const matches = Element.prototype.matches;
Element.prototype.matches = function (this: Element, selector: string) {
  try {
    return matches.call(this, selector);
  } catch (e) {
    if (selector.includes(':has(')) {
      return false;
    }
    throw e;
  }
};
const closest = Element.prototype.closest;
Element.prototype.closest = function (this: Element, selector: string) {
  try {
    return closest.call(this, selector);
  } catch (e) {
    if (selector.includes(':has(')) {
      return null;
    }
    throw e;
  }
} as never;
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: {
      ready: Promise.resolve(),
      addEventListener() {},
      removeEventListener() {},
    },
  });
}
// A range has no box in jsdom; text measures as one rect.
Range.prototype.getBoundingClientRect = () =>
  ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    right: 0,
    bottom: 0,
  }) as DOMRect;
Range.prototype.getClientRects = (() => []) as never;
// jsdom does not do pseudo-element styles, and says so; the plain style it does.
const computed = window.getComputedStyle.bind(window);
window.getComputedStyle = ((el: Element) => computed(el)) as never;
(globalThis as Record<string, unknown>).ResizeObserver ??= Observer;
(globalThis as Record<string, unknown>).IntersectionObserver ??= Observer;
window.scrollTo = (() => {}) as never;
Element.prototype.scrollIntoView = () => {};
Element.prototype.scrollTo = (() => {}) as never;
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = ((fn: FrameRequestCallback) =>
    setTimeout(() => fn(performance.now()), 0)) as never;
}

/** The element `document.elementFromPoint` answers with, while a press runs. */
let under: Element | null = null;
document.elementFromPoint = () => under;

/**
 * A pointer press and release on `el`, as the layers read it: down and up on
 * the window's capture phase, the up over `el`. `over` is what the pointer is
 * over at the release (default `el`: a press that ends where it began).
 */
export function press(
  el: Element,
  { over = el, button = 0 }: { over?: Element; button?: number } = {}
): void {
  const at = { pointerId: 1, button, bubbles: true, cancelable: true };
  under = el;
  act(() => {
    fireEvent(el, new PointerEvent('pointerdown', at));
  });
  under = over;
  act(() => {
    fireEvent(over, new PointerEvent('pointerup', at));
  });
  under = null;
}
