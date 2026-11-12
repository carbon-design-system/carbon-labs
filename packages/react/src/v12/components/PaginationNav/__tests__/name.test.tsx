/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PaginationNav } from '../components/PaginationNav';

/** The `<nav>`'s opening tag. */
const nav = (markup: string) => /^<nav\b[^>]*>/.exec(markup)?.[0] ?? '';

describe('PaginationNav: the landmark', () => {
  it('has a name by default', () => {
    const markup = renderToStaticMarkup(<PaginationNav totalItems={5} />);
    expect(nav(markup)).toContain('aria-label="pagination"');
  });

  it("takes the caller's name", () => {
    const markup = renderToStaticMarkup(
      <PaginationNav totalItems={5} aria-label="Results pages" />
    );
    expect(nav(markup)).toContain('aria-label="Results pages"');
    expect(nav(markup)).not.toContain('aria-label="pagination"');
  });
});
