/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { createRef } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MenuItem, OverflowMenu } from '@carbon-labs/react-menu';
import { setReducedMotion } from '../../../vitest.dom';
import { Breadcrumb, BreadcrumbItem } from '../index';

setReducedMotion(true);

describe('Breadcrumb', () => {
  it('is a navigation landmark named "Breadcrumb" unless the caller names it', () => {
    const { rerender } = render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBe(
      screen.getByRole('navigation')
    );

    rerender(
      <Breadcrumb aria-label="You are here">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole('navigation', { name: 'You are here' })).toBe(
      screen.getByRole('navigation')
    );
  });

  it('holds its crumbs as the items of one list, in order', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/reports">Reports</BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>Q3</BreadcrumbItem>
      </Breadcrumb>
    );
    const list = within(screen.getByRole('navigation')).getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items.map((li) => li.parentElement)).toEqual([list, list, list]);
    expect(
      items.map((li) => within(li).queryByRole('link')?.textContent ?? null)
    ).toEqual(['Home', 'Reports', null]);
    expect(items[2]).toHaveTextContent('Q3');
  });

  it('forwards its ref to the nav, and an item’s to its list item', () => {
    const nav = createRef<HTMLElement>();
    const item = createRef<HTMLLIElement>();
    render(
      <Breadcrumb ref={nav}>
        <BreadcrumbItem ref={item} href="/">
          Home
        </BreadcrumbItem>
      </Breadcrumb>
    );
    expect(nav.current).toBe(screen.getByRole('navigation'));
    expect(item.current).toBe(screen.getByRole('listitem'));
  });

  it('drops a crumb that leaves the trail and keeps the rest in order', async () => {
    const trail = (names: string[]) => (
      <Breadcrumb>
        {names.map((name) => (
          <BreadcrumbItem key={name} href={`/${name}`}>
            {name}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    );
    const { rerender } = render(trail(['Home', 'Reports', 'Q3']));
    rerender(trail(['Home', 'Q3']));
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Reports' })).toBeNull()
    );
    expect(screen.getAllByRole('link').map((a) => a.textContent)).toEqual([
      'Home',
      'Q3',
    ]);
  });
});

describe('BreadcrumbItem: a string child', () => {
  it('is a link to `href`', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/reports">Reports</BreadcrumbItem>
      </Breadcrumb>
    );
    const link = screen.getByRole('link', { name: 'Reports' });
    expect(link).toHaveAttribute('href', '/reports');
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('is plain text, not a link, without `href`', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>Reports</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(
      within(screen.getByRole('listitem')).getByText('Reports')
    ).not.toHaveAttribute('aria-current');
  });

  it('is marked current with `isCurrentPage`, as a link and as text', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/reports" isCurrentPage>
          Reports
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>Q3</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole('link', { name: 'Reports' })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(screen.getByText('Q3')).toHaveAttribute('aria-current', 'true');
  });

  it('takes an explicit `aria-current` over `isCurrentPage`', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/reports" isCurrentPage aria-current="page">
          Reports
        </BreadcrumbItem>
        <BreadcrumbItem href="/q3" aria-current="step">
          Q3
        </BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole('link', { name: 'Reports' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Q3' })).toHaveAttribute(
      'aria-current',
      'step'
    );
  });
});

describe('BreadcrumbItem: an element child', () => {
  it('keeps the caller’s link, its `href` and its name', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>
          <a href="/reports" data-route="reports">
            Reports
          </a>
        </BreadcrumbItem>
      </Breadcrumb>
    );
    const link = screen.getByRole('link', { name: 'Reports' });
    expect(link).toHaveAttribute('href', '/reports');
    expect(link).toHaveAttribute('data-route', 'reports');
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('is marked current with `isCurrentPage`', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <a href="/reports">Reports</a>
        </BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole('link', { name: 'Reports' })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('takes an explicit `aria-current` over `isCurrentPage`', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem isCurrentPage aria-current="page">
          <a href="/reports">Reports</a>
        </BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole('link', { name: 'Reports' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});

describe('BreadcrumbItem: an OverflowMenu child', () => {
  it('stays a menu button that lists the collapsed crumbs', async () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>
          <OverflowMenu label="More levels">
            <MenuItem label="Reports" />
            <MenuItem label="2026" />
          </OverflowMenu>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>Q3</BreadcrumbItem>
      </Breadcrumb>
    );
    const more = screen.getByRole('button', { name: 'More levels' });
    expect(more).toHaveAttribute('aria-haspopup', 'menu');
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(more).not.toHaveAttribute('aria-current');
    expect(screen.getAllByRole('link')).toHaveLength(1);

    fireEvent.click(more);
    const menu = await screen.findByRole('menu');
    expect(more).toHaveAttribute('aria-expanded', 'true');
    const items = within(menu).getAllByRole('menuitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAccessibleName('Reports');
    expect(items[1]).toHaveAccessibleName('2026');
  });
});
