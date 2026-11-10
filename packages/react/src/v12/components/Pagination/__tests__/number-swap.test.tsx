/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Pagination } from '../components/Pagination';

const bar = (props: { numberSwap?: boolean; pagesUnknown?: boolean }) =>
  renderToStaticMarkup(
    <Pagination page={2} pageSize={10} totalItems={103} {...props} />
  );

describe('Pagination numbers', () => {
  it('change at once by default: no swap slot round the range or the page', () => {
    const html = bar({});
    expect(html).toContain('11–20 of 103 items');
    expect(html).not.toContain('cds-pagination__swap');
    expect(bar({ pagesUnknown: true })).toContain('page 2');
    expect(bar({ pagesUnknown: true })).not.toContain('cds-pagination__swap');
  });

  it('swap, out then in, with numberSwap', () => {
    const html = bar({ numberSwap: true });
    expect(html).toContain('cds-pagination__swap');
    expect(html).toMatch(/data-swap-face="in"[^>]*>11–20</);
    expect(bar({ numberSwap: true, pagesUnknown: true })).toMatch(
      /data-swap-face="in"[^>]*>2</
    );
  });
});
