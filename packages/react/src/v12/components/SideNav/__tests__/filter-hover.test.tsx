/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom
/** @jsxRuntime automatic */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SideNav, SideNavLink } from '../components/SideNav';

/* A ghost nav's filter field hovers as its rows do: the rows' rollover is
   attached to it (side-nav-filter.scss paints it; the colours are checked in
   the browser). An inset nav's field keeps the field's own hover. */

const FIELD = '.sidenav__filter .cds-text-input__field';

let root: Root | null = null;
let host: HTMLElement | null = null;

beforeAll(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  if (!('fonts' in document))
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        ready: Promise.resolve(),
        load: () => Promise.resolve([]),
        check: () => true,
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
});

function mount(frame: 'ghost' | 'inset') {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  act(() =>
    root!.render(
      <SideNav aria-label="Main" frame={frame} filter>
        <SideNavLink href="#/a">Alpha</SideNavLink>
        <SideNavLink href="#/b">Beta</SideNavLink>
      </SideNav>
    )
  );
  return host.querySelector<HTMLElement>(FIELD)!;
}

/** Whether the rollover took the hover: it measures the field (its glow) or holds it for a still pointer. */
function hovered(field: HTMLElement) {
  act(() => {
    field.dispatchEvent(
      new MouseEvent('pointerover', { bubbles: true, clientX: 40, clientY: 8 })
    );
    field.dispatchEvent(
      new MouseEvent('pointermove', { bubbles: true, clientX: 44, clientY: 8 })
    );
  });
  return (
    field.style.getPropertyValue('--cds-motion-rollover-glow') !== '' ||
    field.hasAttribute('data-rollover-still')
  );
}

describe('SideNav filter: the hover', () => {
  it("a ghost nav's field is ghost, and takes the rows' rollover", () => {
    const field = mount('ghost');
    expect(field.closest('.cds-text-input--ghost')).not.toBeNull();
    expect(hovered(field)).toBe(true);
  });

  it("an inset nav's field keeps the field's own hover", () => {
    const field = mount('inset');
    expect(field.closest('.cds-text-input--ghost')).toBeNull();
    expect(hovered(field)).toBe(false);
  });
});
