/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The story page scrolls on the kit's WindowScroller, mounted by the
// decorator (`PageScroller`): one pill for the page, however many stories
// it renders.

import { createElement, useLayoutEffect } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PAGE_SCROLLER_CLASS, PageScroller } from '../decorator';

const PAGE = `.cds-scroller-window.${PAGE_SCROLLER_CLASS}`;

/** Each page scroller root on the page. */
const pageScrollers = () => document.querySelectorAll(PAGE);

/** Whether the page scroller's vertical pill is active (drawn for a page that scrolls). */
const pillActive = () =>
  !!document.querySelector(`${PAGE} .cds-scroller__rail[data-scroller-active]`);

/** The roots a test mounted, unmounted after it even when it fails. */
let roots: Root[] = [];

/** A React root in a fresh host, for a story mounted on its own. */
function mount(): Root {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  return root;
}

/** A MutationObserver callback's turn. */
const settle = () => act(async () => new Promise((r) => setTimeout(r, 0)));

describe('the story page', () => {
  beforeEach(() => {
    // Under the test runner `window` isn't an instance of the global
    // `Window`, which is how the engine knows the document scrolls.
    vi.stubGlobal('Window', {
      [Symbol.hasInstance]: (v: unknown) => v === window,
    });
    // jsdom has no ResizeObserver; the engine only needs it to exist.
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
    // A second unmount of a root the test unmounted itself does nothing.
    await act(async () => roots.forEach((r) => r.unmount()));
    roots = [];
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('scrolls on the kit’s WindowScroller, with the native scrollbar hidden', async () => {
    const root = mount();
    await act(async () => root.render(createElement(PageScroller)));
    expect(pageScrollers()).toHaveLength(1);
    expect(document.documentElement.hasAttribute('data-scroller-window')).toBe(
      true
    );
    await act(async () => root.unmount());
    expect(document.documentElement.hasAttribute('data-scroller-window')).toBe(
      false
    );
  });

  it('is there on the first commit, so no frame paints the native scrollbar', async () => {
    const seen: { scroller: boolean; hidden: boolean }[] = [];
    // A sibling's layout effect runs in the same commit, before paint and
    // before any update the page scroller schedules.
    function FirstCommit() {
      useLayoutEffect(() => {
        seen.push({
          scroller: pageScrollers().length === 1,
          hidden: document.documentElement.hasAttribute('data-scroller-window'),
        });
      }, []);
      return null;
    }
    const root = mount();
    await act(async () =>
      root.render(
        createElement(
          'div',
          null,
          createElement(PageScroller),
          createElement(FirstCommit)
        )
      )
    );
    expect(seen).toEqual([{ scroller: true, hidden: true }]);
    await act(async () => root.unmount());
  });

  it('draws one pill for several stories on one page', async () => {
    const root = mount();
    await act(async () =>
      root.render(
        createElement(
          'div',
          null,
          createElement(PageScroller, { key: 'a' }),
          createElement(PageScroller, { key: 'b' }),
          createElement(PageScroller, { key: 'c' })
        )
      )
    );
    expect(pageScrollers()).toHaveLength(1);
    await act(async () => root.unmount());
  });

  it('hands the pill to the next story when the first unmounts', async () => {
    const first = mount();
    const second = mount();
    await act(async () => first.render(createElement(PageScroller)));
    await act(async () => second.render(createElement(PageScroller)));
    expect(pageScrollers()).toHaveLength(1);
    await act(async () => first.unmount());
    expect(pageScrollers()).toHaveLength(1);
    expect(document.documentElement.hasAttribute('data-scroller-window')).toBe(
      true
    );
    await act(async () => second.unmount());
    expect(pageScrollers()).toHaveLength(0);
  });

  describe('on a page that scrolls', () => {
    beforeEach(() => {
      const html = document.documentElement;
      Object.defineProperty(html, 'scrollHeight', {
        configurable: true,
        value: 2000,
      });
      Object.defineProperty(html, 'clientHeight', {
        configurable: true,
        value: 600,
      });
    });

    afterEach(() => {
      const html = document.documentElement as unknown as Record<
        string,
        unknown
      >;
      delete html.scrollHeight;
      delete html.clientHeight;
    });

    it('draws its pill', async () => {
      const root = mount();
      await act(async () => root.render(createElement(PageScroller)));
      expect(pillActive()).toBe(true);
      await act(async () => root.unmount());
    });

    it('stands down while another window scroller is mounted', async () => {
      // A story's own WindowScroller (a page shell's), there first.
      const own = document.createElement('div');
      own.className = 'cds-scroller-window';
      document.body.append(own);
      const root = mount();
      await act(async () => root.render(createElement(PageScroller)));
      expect(pillActive()).toBe(false);

      own.remove();
      await settle();
      expect(pillActive()).toBe(true);

      // And one that mounts after.
      document.body.append(own);
      await settle();
      expect(pillActive()).toBe(false);
      await act(async () => root.unmount());
    });
  });
});
