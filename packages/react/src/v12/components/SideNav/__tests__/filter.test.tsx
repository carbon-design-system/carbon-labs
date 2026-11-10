/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SideNav, SideNavGroup, SideNavLink } from '../components/SideNav';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import {
  filterCountText,
  filterFieldCorners,
  filterRows,
  normalizeFilter,
  textOf,
} from '../components/filter';

/* SideNav's filter: the matching on the nav's own elements, and the nav as
   it renders with a query (the keys, the snap and the live count run in the
   browser: apps/prototypes/tests/nav-filter.spec.ts). */

const ROWS = { link: SideNavLink, group: SideNavGroup };

const nav = (
  <>
    <SideNavLink href="#/">Overview</SideNavLink>
    <li className="label">Components</li>
    <SideNavGroup key="overlays" title="Overlays">
      <SideNavLink key="modal" href="#/modal" keywords={['dialog']}>
        Modal
      </SideNavLink>
      <SideNavLink key="tooltip" href="#/tooltip">
        Tooltip
      </SideNavLink>
    </SideNavGroup>
    <SideNavGroup key="inputs" title="Inputs">
      <SideNavLink key="select" href="#/select" keywords={['dropdown']}>
        Select
      </SideNavLink>
      <SideNavLink key="search" href="#/search">
        Search
      </SideNavLink>
    </SideNavGroup>
    <li className="label">Elsewhere</li>
    <SideNavLink href="https://example.com" external>
      Repository
    </SideNavLink>
  </>
);

/** The labels left, in order: links, group titles (as `[title]`) and other rows' text. */
function labels(nodes: ReactNode[]): string[] {
  return nodes.flatMap((n) => {
    if (!isValidElement<{ children?: ReactNode; title?: ReactNode }>(n))
      return [];
    if (n.type === SideNavGroup)
      return [
        `[${textOf(n.props.title)}]`,
        ...labels([n.props.children].flat()),
      ];
    if (n.type === SideNavLink || typeof n.type === 'string')
      return [textOf(n.props.children)];
    return labels([n.props.children].flat());
  });
}

const filter = (q: string) => filterRows(nav, normalizeFilter(q), ROWS);

describe('SideNav filter: matching', () => {
  it('no query keeps everything', () => {
    const { nodes, count } = filter('  ');
    expect(count).toBe(6);
    expect(labels(nodes)).toEqual([
      'Overview',
      'Components',
      '[Overlays]',
      'Modal',
      'Tooltip',
      '[Inputs]',
      'Select',
      'Search',
      'Elsewhere',
      'Repository',
    ]);
  });

  it('a link by its label, case-insensitive; a group goes when none of its links match', () => {
    const { nodes, count } = filter('TOOL');
    expect(count).toBe(1);
    expect(labels(nodes)).toEqual(['Components', '[Overlays]', 'Tooltip']);
  });

  it('a link by one of its keywords (v11 and common names), at the start of a word', () => {
    expect(labels(filter('dialog').nodes)).toEqual([
      'Components',
      '[Overlays]',
      'Modal',
    ]);
    expect(labels(filter('dropdown').nodes)).toEqual([
      'Components',
      '[Inputs]',
      'Select',
    ]);
    expect(labels(filter('DROP').nodes)).toEqual([
      'Components',
      '[Inputs]',
      'Select',
    ]);
    // Inside a word, a keyword doesn't match ("ialog" isn't a word's start); a label still does.
    expect(filter('ialog').count).toBe(0);
    expect(labels(filter('odal').nodes)).toEqual([
      'Components',
      '[Overlays]',
      'Modal',
    ]);
  });

  it("a group's title keeps all its links", () => {
    const { nodes, count } = filter('input');
    expect(count).toBe(2);
    expect(labels(nodes)).toEqual([
      'Components',
      '[Inputs]',
      'Select',
      'Search',
    ]);
  });

  it('a label goes with the rows after it', () => {
    expect(labels(filter('repo').nodes)).toEqual(['Elsewhere', 'Repository']);
    expect(labels(filter('over').nodes)).toEqual([
      'Overview',
      'Components',
      '[Overlays]',
      'Modal',
      'Tooltip',
    ]);
  });

  it('nothing matches: no rows, no labels', () => {
    expect(filter('xyz')).toEqual({ nodes: [], count: 0 });
  });

  it('the count says pages, by default', () => {
    expect(filterCountText(0)).toBe('No pages match');
    expect(filterCountText(1)).toBe('1 page matches');
    expect(filterCountText(3)).toBe('3 pages match');
    expect(filterCountText(2, { one: 'item', other: 'items' })).toBe(
      '2 items match'
    );
  });
});

const render = (filterProp: Parameters<typeof SideNav>[0]['filter']) =>
  renderToStaticMarkup(
    <SideNav aria-label="Pages" filter={filterProp}>
      {nav.props.children}
    </SideNav>
  );

describe('SideNav filter: the nav', () => {
  it('no filter: no field, every row', () => {
    const html = render(undefined);
    expect(html).not.toContain('sidenav__filter');
    expect(html).toContain('Tooltip');
  });

  it('`filter`: the field at the top of the track, "Filter pages", a live region', () => {
    const html = render(true);
    expect(html).toMatch(
      /class="[^"]*sidenav__track[^"]*"[^>]*><div class="sidenav__filter">/
    );
    expect(html).toContain('placeholder="Filter pages"');
    expect(html).toContain('Clear filter');
    expect(html).toContain('role="status"');
    expect(html).not.toContain('keywords');
  });

  it('a query: only the matches, their group open', () => {
    const html = render({ defaultValue: 'dialog' });
    expect(html).toContain('Modal');
    expect(html).not.toContain('Tooltip');
    expect(html).not.toContain('Inputs');
    expect(html).toContain('data-open="true"');
  });

  it('no match: the quiet line, in the words given', () => {
    expect(render({ defaultValue: 'xyz' })).toContain('No pages match ‘xyz’');
    expect(
      render({ defaultValue: 'xyz', noun: { one: 'item', other: 'items' } })
    ).toContain('No items match ‘xyz’');
  });

  it('groups keep their own state, unfiltered: open when they hold the current page', () => {
    const html = renderToStaticMarkup(
      <SideNav aria-label="Pages" filter>
        <SideNavGroup key="a" title="A">
          <SideNavLink key="a1" href="#a1">
            A1
          </SideNavLink>
        </SideNavGroup>
        <SideNavGroup key="b" title="B">
          <SideNavLink key="b1" href="#b1" current>
            B1
          </SideNavLink>
        </SideNavGroup>
      </SideNav>
    );
    expect(html.match(/data-open="true"/g)).toHaveLength(1);
    expect(html.indexOf('data-open="true"')).toBeGreaterThan(
      html.indexOf('>A<')
    );
  });
});

describe("SideNav filter: the field's corners are the rows'", () => {
  /** The field's corner class: full, square, or neither (rounded, drawn at the rows' inner corner). */
  const fieldCorners = (html: string) => {
    const cls = /class="(cds-text-input [^"]*)"/.exec(html)?.[1] ?? '';
    return cls.includes('cds-text-input--full')
      ? 'full'
      : cls.includes('cds-text-input--square')
        ? 'square'
        : 'rounded';
  };
  const navWith = (props: {
    corners?: 'full' | 'rounded' | 'square';
    frame?: 'inset' | 'ghost' | 'flush';
  }) => (
    <SideNav aria-label="Pages" filter {...props}>
      <SideNavLink href="#a">A</SideNavLink>
    </SideNav>
  );

  it('the map: full and square as the rows, rounded otherwise', () => {
    expect(filterFieldCorners(undefined)).toBe('rounded');
    expect(filterFieldCorners('rounded')).toBe('rounded');
    expect(filterFieldCorners('full')).toBe('full');
    expect(filterFieldCorners('square')).toBe('square');
  });

  it("under every KitDefaults corners, the field follows the nav's rows, never the provider", () => {
    for (const provider of [undefined, 'full', 'rounded', 'square'] as const) {
      for (const rows of [undefined, 'full', 'rounded', 'square'] as const) {
        for (const frame of ['inset', 'ghost', 'flush'] as const) {
          const node = navWith({ corners: rows, frame });
          const html = renderToStaticMarkup(
            provider ? (
              <KitDefaults corners={provider}>{node}</KitDefaults>
            ) : (
              node
            )
          );
          // A flush nav's rows are square.
          const want = frame === 'flush' ? 'square' : (rows ?? 'rounded');
          expect(
            fieldCorners(html),
            `provider ${provider}, rows ${rows}, ${frame}`
          ).toBe(want);
        }
      }
    }
  });
});
