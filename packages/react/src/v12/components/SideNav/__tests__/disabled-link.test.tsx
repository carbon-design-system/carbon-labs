/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SideNav, SideNavLink } from '../components/SideNav';

/** The opening tag of the link whose text is `label`. */
const anchor = (markup: string, label: string) =>
  [...markup.matchAll(/<a\b[^>]*>(?=(?:(?!<\/a>)[\s\S])*<\/a>)/g)]
    .map(([tag]) => tag)
    .find((tag) =>
      markup.slice(markup.indexOf(tag)).split('</a>')[0].includes(label)
    ) ?? '';

describe('SideNav: a disabled link', () => {
  it('stays a link with no href, and says it is disabled', () => {
    const markup = renderToStaticMarkup(
      <SideNav aria-label="Main">
        <SideNavLink href="#/a">Alpha</SideNavLink>
        <SideNavLink href="#/b" disabled>
          Beta
        </SideNavLink>
      </SideNav>
    );
    const on = anchor(markup, 'Alpha');
    expect(on).toContain('href="#/a"');
    expect(on).not.toContain('role=');
    expect(on).not.toContain('aria-disabled');

    const off = anchor(markup, 'Beta');
    expect(off).not.toContain('href=');
    expect(off).toContain('role="link"');
    expect(off).toContain('aria-disabled="true"');
  });
});
