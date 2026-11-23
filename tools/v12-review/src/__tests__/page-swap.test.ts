/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** Each out the swap plays: a stand-in for its Web Animation (jsdom has none). */
const outs: {
  el: HTMLElement;
  playState: string;
  onfinish: (() => void) | null;
  cancel: ReturnType<typeof vi.fn>;
}[] = [];

vi.mock('@carbon-labs/v12-motion', () => ({
  usePrefersReducedMotion: () => false,
  playContentSwap: ({ out }: { out: HTMLElement | null }) => {
    if (!out) {
      return { outAnimation: null };
    }
    const anim = {
      el: out,
      playState: 'running',
      onfinish: null as (() => void) | null,
      cancel: vi.fn(),
    };
    outs.push(anim);
    return { outAnimation: anim };
  },
}));

const { PageSwap } = await import('../PageSwap');

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
let errors: ReturnType<typeof vi.spyOn>;

/** Shows the page of `id`, its text the id's. */
function show(id: string) {
  act(() => {
    root.render(createElement(PageSwap, { id, children: `page ${id}` }));
  });
}

/** The swap's pages, as drawn. */
function pages() {
  return [...host.querySelectorAll<HTMLElement>('.v12r-swap__page')];
}

beforeEach(() => {
  outs.length = 0;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  errors.mockRestore();
});

describe('PageSwap', () => {
  it('swaps out the page shown, then brings in the new one', () => {
    show('home');
    show('button');
    // During the out: home, inert, and an empty place for the new page.
    expect(pages().map((p) => p.textContent)).toEqual(['page home', '']);
    expect(pages()[0].inert).toBe(true);
    act(() => outs[0].onfinish?.());
    expect(pages().map((p) => p.textContent)).toEqual(['page button']);
    expect(errors).not.toHaveBeenCalled();
  });

  it('keeps the page going out when the change goes back to it', () => {
    show('home');
    show('button');
    const home = pages()[0];
    // Back during the out: its out stops and it stays, one page, live.
    show('home');
    expect(pages()).toEqual([home]);
    expect(home.textContent).toBe('page home');
    expect(home.inert).toBe(false);
    expect(home.hasAttribute('aria-hidden')).toBe(false);
    expect(outs[0].cancel).toHaveBeenCalled();
    // The next change swaps it out as any other: no copy of it left behind.
    show('link');
    expect(pages().map((p) => p.textContent)).toEqual(['page home', '']);
    act(() => outs[1].onfinish?.());
    expect(pages().map((p) => p.textContent)).toEqual(['page link']);
    expect(errors).not.toHaveBeenCalled();
  });
});
