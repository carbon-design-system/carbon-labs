/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom
/** @jsxRuntime automatic */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../../vitest.setup';
import { setReducedMotion } from '../../../vitest.dom';
import { SideNav, SideNavGroup, SideNavLink } from '../components/SideNav';

/** A rail needs an icon on every top-level row. */
const Icon = () => <svg aria-hidden="true" />;

setReducedMotion(true);

/** A rail in a page running `dir`; returns its group's header. */
function rail(dir: 'ltr' | 'rtl') {
  render(
    <div dir={dir}>
      <SideNav aria-label="Main" collapsible defaultCollapsed>
        <SideNavGroup title="Overlays" renderIcon={Icon}>
          <SideNavLink href="#/modal">Modal</SideNavLink>
          <SideNavLink href="#/tooltip">Tooltip</SideNavLink>
        </SideNavGroup>
      </SideNav>
    </div>
  );
  return screen.getByRole('button', { name: /Overlays/ });
}

const open = (header: HTMLElement) => header.getAttribute('aria-expanded');

describe("SideNav rail: the arrow that opens a group's flyout", () => {
  it('is the right arrow, left to right', () => {
    const header = rail('ltr');
    expect(header.getAttribute('aria-haspopup')).toBe('menu');
    fireEvent.keyDown(header, { key: 'ArrowLeft' });
    expect(open(header)).toBe('false');
    fireEvent.keyDown(header, { key: 'ArrowRight' });
    expect(open(header)).toBe('true');
  });

  it('is the left arrow, right to left', () => {
    const header = rail('rtl');
    fireEvent.keyDown(header, { key: 'ArrowRight' });
    expect(open(header)).toBe('false');
    fireEvent.keyDown(header, { key: 'ArrowLeft' });
    expect(open(header)).toBe('true');
  });
});
