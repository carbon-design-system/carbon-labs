/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The preview's hold on the native page scrollbar: on from load, and let go
// by whatever means the page scroller won't take over (or already has).

import { createElement } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The decorator's Storybook hooks, outside Storybook.
vi.mock('storybook/preview-api', () => ({
  addons: { getChannel: () => ({ emit() {}, on() {}, off() {} }) },
  useGlobals: () => [{}, () => {}],
}));

import { PageScroller, withWorkbench } from '../decorator';
import {
  PAGE_SCROLL_HOLD_MAX,
  holdPageScroll,
  isPageScrollHeld,
  releasePageScroll,
} from '../page-scroll';

/** A channel that keeps its listeners, to emit to them. */
function fakeChannel() {
  const listeners = new Map<string, Set<(...a: unknown[]) => void>>();
  return {
    on(e: string, l: (...a: unknown[]) => void) {
      if (!listeners.has(e)) listeners.set(e, new Set());
      listeners.get(e)!.add(l);
    },
    off(e: string, l: (...a: unknown[]) => void) {
      listeners.get(e)?.delete(l);
    },
    emit(e: string) {
      listeners.get(e)?.forEach((l) => l());
    },
    count: () => [...listeners.values()].reduce((n, s) => n + s.size, 0),
  };
}

let roots: Root[] = [];
function mount(): Root {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  return root;
}

beforeEach(() => {
  vi.stubGlobal('Window', {
    [Symbol.hasInstance]: (v: unknown) => v === window,
  });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

afterEach(async () => {
  await act(async () => roots.forEach((r) => r.unmount()));
  roots = [];
  releasePageScroll();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('the hold on the native page scrollbar', () => {
  it('hides the native scrollbar from load, with one stylesheet', () => {
    holdPageScroll();
    releasePageScroll();
    holdPageScroll();
    expect(isPageScrollHeld()).toBe(true);
    const sheets = document.querySelectorAll('#v12-workbench-page-scroll-hold');
    expect(sheets).toHaveLength(1);
    expect(sheets[0].textContent).toContain('scrollbar-width: none');
  });

  it('is let go when a page scroller mounts', async () => {
    holdPageScroll();
    const root = mount();
    await act(async () => root.render(createElement(PageScroller)));
    expect(isPageScrollHeld()).toBe(false);
    // The page scroller hides the native scrollbar from then on.
    expect(document.documentElement.hasAttribute('data-scroller-window')).toBe(
      true
    );
  });

  it('is let go when an app story runs', async () => {
    holdPageScroll();
    const Story = () => createElement('div', null, 'app');
    const context = {
      id: 'app',
      globals: {},
      parameters: { v12: { app: true } },
    } as unknown as Parameters<typeof withWorkbench>[1];
    const Decorated = () =>
      withWorkbench(Story as Parameters<typeof withWorkbench>[0], context);
    const root = mount();
    await act(async () => root.render(createElement(Decorated)));
    expect(isPageScrollHeld()).toBe(false);
    // And an app story gets no page scroller: the native scrollbar is back.
    expect(document.documentElement.hasAttribute('data-scroller-window')).toBe(
      false
    );
  });

  it.each(['storyErrored', 'storyThrewException', 'storyMissing'])(
    'is let go when the preview says %s',
    (event) => {
      const channel = fakeChannel();
      holdPageScroll(channel);
      channel.emit(event);
      expect(isPageScrollHeld()).toBe(false);
      expect(channel.count()).toBe(0);
    }
  );

  it('is let go when a docs page renders with no story on it', () => {
    const channel = fakeChannel();
    holdPageScroll(channel);
    channel.emit('docsRendered');
    expect(isPageScrollHeld()).toBe(false);
  });

  it('holds while a docs page has stories still to mount', () => {
    const channel = fakeChannel();
    holdPageScroll(channel);
    const block = document.createElement('div');
    block.className = 'docs-story';
    document.body.append(block);
    channel.emit('docsRendered');
    expect(isPageScrollHeld()).toBe(true);
  });

  it('is let go after its longest wait, whatever happens', () => {
    vi.useFakeTimers();
    holdPageScroll(fakeChannel());
    vi.advanceTimersByTime(PAGE_SCROLL_HOLD_MAX - 1);
    expect(isPageScrollHeld()).toBe(true);
    vi.advanceTimersByTime(1);
    expect(isPageScrollHeld()).toBe(false);
  });
});
