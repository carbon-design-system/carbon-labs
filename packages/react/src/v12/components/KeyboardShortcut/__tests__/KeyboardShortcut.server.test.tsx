/**
 * @jest-environment node
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { KeyboardShortcut } from '../components/KeyboardShortcut';

// A real server: no window, no document, no navigator. The jsdom suite cannot
// prove this, because jsdom always has a window.
describe('KeyboardShortcut on a server', () => {
  it('has no window to read', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders auto as the non-mac words without touching the browser', () => {
    const html = renderToString(<KeyboardShortcut keys={['mod', 'K']} />);
    expect(html).toContain('Ctrl');
    expect(html).toContain('Control K');
    expect(html).toMatch(/^<kbd class="cds--keyboard-shortcut /);
  });

  it('renders an explicit platform, as a server that read the User-Agent would', () => {
    const html = renderToString(
      <KeyboardShortcut keys={['mod', 'K']} platform="mac" kind="plain" />
    );
    expect(html).toContain('⌘');
    expect(html).toContain('Command K');
  });
});
