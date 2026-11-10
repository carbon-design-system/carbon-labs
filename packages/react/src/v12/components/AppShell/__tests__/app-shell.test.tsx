/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setReducedMotion } from '../../../vitest.dom';
import { SideNav, SideNavLink } from '@carbon-labs/react-side-nav';
import { SidePanel } from '@carbon-labs/react-side-panel';
import {
  APP_SHELL_LAYOUT,
  AppShell,
  Header,
  SIZE_CLASSES,
  SIZE_CLASS_EDGES,
  sizeClassOf,
  type SizeClass,
} from '../index';

setReducedMotion(true);

const root = () => document.documentElement;
const shell = () => document.querySelector('.cds-app-shell') as HTMLElement;

const header = <Header aria-label="Product" name="Carbon" />;
const nav = (
  <SideNav aria-label="Main">
    <SideNavLink href="#home">Home</SideNavLink>
    <SideNavLink href="#reports">Reports</SideNavLink>
  </SideNav>
);

// The page's window scroller drives `window` itself, which is not a jsdom `Window`: left out.
function Shell(props: Partial<React.ComponentProps<typeof AppShell>> = {}) {
  return (
    <AppShell header={header} nav={nav} windowScroller={false} {...props}>
      <p>Page content</p>
    </AppShell>
  );
}

/** The shell measures its own width: a layout box jsdom does not have. */
function widthOf(px: number) {
  const proto = HTMLElement.prototype;
  const had = Object.getOwnPropertyDescriptor(proto, 'offsetWidth');
  Object.defineProperty(proto, 'offsetWidth', {
    configurable: true,
    get: () => px,
  });
  return () => {
    if (had) Object.defineProperty(proto, 'offsetWidth', had);
    else delete (proto as unknown as Record<string, unknown>).offsetWidth;
  };
}

let restore: (() => void) | null = null;
afterEach(() => {
  restore?.();
  restore = null;
});

describe('AppShell landmarks', () => {
  it('has a banner (the header, named), the navigation and main', () => {
    render(<Shell sizeClass="large" />);
    expect(screen.getByRole('banner', { name: 'Product' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy();
    expect(screen.getByRole('main')).toBeTruthy();
  });

  it('puts the page content in main, and only there', () => {
    render(<Shell sizeClass="large" />);
    expect(screen.getByRole('main')).toHaveTextContent('Page content');
    expect(screen.getByRole('banner')).not.toHaveTextContent('Page content');
  });

  it('passes `mainProps` to main (an id, a label)', () => {
    render(
      <Shell
        sizeClass="large"
        mainProps={{ id: 'content', 'aria-label': 'Reports' }}
      />
    );
    expect(screen.getByRole('main', { name: 'Reports' })).toHaveAttribute(
      'id',
      'content'
    );
  });

  it('has one main and one banner, in every size class', () => {
    for (const sizeClass of SIZE_CLASSES) {
      const { unmount } = render(<Shell sizeClass={sizeClass} />);
      expect(screen.getAllByRole('main')).toHaveLength(1);
      expect(screen.getAllByRole('banner')).toHaveLength(1);
      unmount();
    }
  });
});

describe('AppShell size classes', () => {
  it('sizeClassOf takes the 2x Grid edges: 672, 1056, 1312', () => {
    expect(SIZE_CLASS_EDGES).toEqual({
      medium: 672,
      expanded: 1056,
      large: 1312,
    });
    expect(sizeClassOf(671)).toBe('compact');
    expect(sizeClassOf(672)).toBe('medium');
    expect(sizeClassOf(1055)).toBe('medium');
    expect(sizeClassOf(1056)).toBe('expanded');
    expect(sizeClassOf(1311)).toBe('expanded');
    expect(sizeClassOf(1312)).toBe('large');
  });

  it.each([
    ['compact', 'overlay', 'sheet'],
    ['medium', 'rail', 'over'],
    ['expanded', 'panel', 'push'],
    ['large', 'panel', 'push'],
  ] as const)(
    'a forced %s shell has its nav as %s and its panel as %s',
    (sizeClass, navMode, panelMode) => {
      render(<Shell sizeClass={sizeClass} />);
      expect(shell()).toHaveAttribute('data-size-class', sizeClass);
      expect(shell()).toHaveAttribute('data-nav-mode', navMode);
      expect(shell()).toHaveAttribute('data-panel-mode', panelMode);
      expect(APP_SHELL_LAYOUT[sizeClass].nav).toBe(navMode);
      expect(APP_SHELL_LAYOUT[sizeClass].panel).toBe(panelMode);
    }
  );

  it.each([
    [600, 'compact'],
    [800, 'medium'],
    [1100, 'expanded'],
    [1400, 'large'],
  ] as const)('measures its own width: %spx is %s', (px, expected) => {
    restore = widthOf(px);
    render(<Shell />);
    expect(shell()).toHaveAttribute('data-size-class', expected);
  });

  it('a flush shell keeps main flush; an inset one goes inset from medium up, flush at compact', () => {
    const frames = (frame: 'flush' | 'inset') =>
      SIZE_CLASSES.map((sizeClass) => {
        const { unmount } = render(
          <Shell sizeClass={sizeClass} frame={frame} />
        );
        const f = shell().getAttribute('data-main-frame');
        unmount();
        return f;
      });
    expect(frames('flush')).toEqual(['flush', 'flush', 'flush', 'flush']);
    expect(frames('inset')).toEqual(['flush', 'inset', 'inset', 'inset']);
  });

  it('a header placed in the nav is a bar again at compact', () => {
    const placed = (sizeClass: SizeClass) => {
      const { unmount } = render(
        <Shell sizeClass={sizeClass} headerPlacement="nav" />
      );
      const p = shell().getAttribute('data-header-placement');
      unmount();
      return p;
    };
    expect(placed('compact')).toBe('bar');
    expect(placed('large')).toBe('nav');
  });

  it('takes a class’s layout from `layout` over the default', () => {
    render(
      <Shell sizeClass="medium" layout={{ medium: { nav: 'overlay' } }} />
    );
    expect(shell()).toHaveAttribute('data-nav-mode', 'overlay');
  });

  it('`sizeClass` forces the class whatever the width', () => {
    restore = widthOf(1400);
    render(<Shell sizeClass="compact" />);
    expect(shell()).toHaveAttribute('data-size-class', 'compact');
  });
});

describe('AppShell overlay nav (compact)', () => {
  it('shows the menu button, with the nav out of the page until it opens', () => {
    render(<Shell sizeClass="compact" />);
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull();
  });

  it('opens a dialog named by `navLabel` holding the nav, and Escape closes it', async () => {
    render(<Shell sizeClass="compact" navLabel="Site navigation" />);
    const menu = screen.getByRole('button', { name: 'Open menu' });
    menu.focus();
    fireEvent.click(menu);
    const dialog = await screen.findByRole('dialog', {
      name: 'Site navigation',
    });
    expect(dialog.querySelector('nav')).toBeTruthy();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(menu).toHaveFocus();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('holds the page still while the nav is open, and lets go once it has left', async () => {
    render(<Shell sizeClass="compact" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    await screen.findByRole('dialog');
    await waitFor(() => expect(root().style.overflow).toBe('hidden'));
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(root().style.overflow).toBe(''));
  });

  it('has no menu button from medium up', () => {
    render(<Shell sizeClass="large" />);
    expect(screen.queryByRole('button', { name: 'Open menu' })).toBeNull();
  });
});

describe('AppShell panel mode', () => {
  function WithPanel({ sizeClass }: { sizeClass: SizeClass }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open panel</button>
        <Shell
          sizeClass={sizeClass}
          panel={
            <SidePanel
              open={open}
              title="Details"
              onRequestClose={() => setOpen(false)}>
              <button>Inside</button>
            </SidePanel>
          }
        />
      </>
    );
  }

  it('at compact the panel is a sheet: modal, with the page held still', async () => {
    render(<WithPanel sizeClass="compact" />);
    fireEvent.click(screen.getByText('Open panel'));
    const dialog = await screen.findByRole('dialog', { name: 'Details' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveClass('cds-app-shell__sheet');
    await waitFor(() => expect(root().style.overflow).toBe('hidden'));
  });

  it('at medium the panel lies over the page, not modal', async () => {
    render(<WithPanel sizeClass="medium" />);
    fireEvent.click(screen.getByText('Open panel'));
    const dialog = await screen.findByRole('dialog', { name: 'Details' });
    expect(dialog).not.toHaveAttribute('aria-modal');
    expect(dialog).not.toHaveClass('cds-app-shell__sheet');
    expect(root().style.overflow).toBe('');
  });

  it('at large the panel is pushed beside main, not modal, the page free to scroll', async () => {
    render(<WithPanel sizeClass="large" />);
    fireEvent.click(screen.getByText('Open panel'));
    const dialog = await screen.findByRole('dialog', { name: 'Details' });
    expect(dialog).not.toHaveAttribute('aria-modal');
    expect(shell()).toHaveAttribute('data-panel-mode', 'push');
    expect(root().style.overflow).toBe('');
  });

  it('the panel asks its own `onRequestClose` on Escape, in any mode', async () => {
    const onRequestClose = vi.fn();
    render(
      <Shell
        sizeClass="large"
        panel={
          <SidePanel open title="Details" onRequestClose={onRequestClose} />
        }
      />
    );
    await screen.findByRole('dialog', { name: 'Details' });
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
