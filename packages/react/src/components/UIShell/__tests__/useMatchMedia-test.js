/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable jsdoc/require-jsdoc */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { render, act, screen } from '@testing-library/react';

import { useMatchMedia } from '../internal/useMatchMedia';

const QUERY = '(min-width: 66rem)';

let mediaMatches;
let changeListeners;

// mock `window.matchMedia` with a controllable `matches` value and captured
// `change` listeners so we can simulate viewport changes
function setupMatchMedia(initialMatches) {
  mediaMatches = initialMatches;
  changeListeners = new Set();
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    get matches() {
      return mediaMatches;
    },
    media: query,
    addEventListener: (_event, listener) => changeListeners.add(listener),
    removeEventListener: (_event, listener) => changeListeners.delete(listener),
  }));
}

function emitChange(nextMatches) {
  mediaMatches = nextMatches;
  changeListeners.forEach((listener) => listener({ matches: nextMatches }));
}

function Probe({ query }) {
  const matches = useMatchMedia(query);
  return <span data-testid="result">{String(matches)}</span>;
}

afterEach(() => {
  document.body.innerHTML = '';
  jest.restoreAllMocks();
});

describe('useMatchMedia', () => {
  it('renders `false` on the server even when the query matches on the client', () => {
    // server has no viewport, so the hook must use server snapshot
    // (`false`) rather than reading `window.matchMedia` during SSR. Reading the
    // live value here cant produce `inert` hydration mismatches
    setupMatchMedia(true);

    const html = renderToString(<Probe query={QUERY} />);

    expect(html).toContain('>false<');
  });

  it('hydrates without a mismatch and then reflects the client value', async () => {
    setupMatchMedia(true);

    const container = document.createElement('div');
    container.innerHTML = renderToString(<Probe query={QUERY} />);
    document.body.appendChild(container);
    // server markup reflects the server snapshot
    expect(container.textContent).toBe('false');

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    let root;
    await act(async () => {
      root = hydrateRoot(container, <Probe query={QUERY} />);
    });

    // no hydration warnings expected
    const loggedHydrationWarning = errorSpy.mock.calls
      .flat()
      .some(
        (arg) =>
          typeof arg === 'string' &&
          /hydrat|did not match|server rendered/i.test(arg)
      );
    expect(loggedHydrationWarning).toBe(false);

    // adopt real client value after hydration
    expect(container.textContent).toBe('true');

    act(() => root.unmount());
  });

  it('updates when the media query changes', () => {
    setupMatchMedia(true);

    render(<Probe query={QUERY} />);
    expect(screen.getByTestId('result').textContent).toBe('true');

    act(() => emitChange(false));
    expect(screen.getByTestId('result').textContent).toBe('false');
  });
});
