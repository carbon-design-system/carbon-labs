/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Button } from '@carbon-labs/react-button';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import { PageHeader } from '../components/PageHeader';

/** The header's class list. */
function classes(el: ReactElement): string[] {
  const m = renderToStaticMarkup(el).match(/<header\sclass="([^"]*)"/);
  return m ? m[1]!.split(/\s+/) : [];
}
const rounded = (el: ReactElement) =>
  classes(el).includes('cds-page-header--rounded');

describe('PageHeader corners', () => {
  it('is square by default (v11)', () => {
    expect(rounded(<PageHeader title="Atlas" />)).toBe(false);
  });

  it('rounds when asked', () => {
    expect(rounded(<PageHeader title="Atlas" corners="rounded" />)).toBe(true);
    expect(rounded(<PageHeader title="Atlas" corners="square" />)).toBe(false);
  });

  it("takes the provider's container corners when it isn't given; a controls' full leaves it square", () => {
    expect(
      rounded(
        <KitDefaults corners="rounded">
          <PageHeader title="Atlas" />
        </KitDefaults>
      )
    ).toBe(true);
    expect(
      rounded(
        <KitDefaults corners="full">
          <PageHeader title="Atlas" />
        </KitDefaults>
      )
    ).toBe(false);
    expect(
      rounded(
        <KitDefaults corners="square">
          <PageHeader title="Atlas" />
        </KitDefaults>
      )
    ).toBe(false);
  });

  it("its own prop wins over the provider's", () => {
    expect(
      rounded(
        <KitDefaults corners="rounded">
          <PageHeader title="Atlas" corners="square" />
        </KitDefaults>
      )
    ).toBe(false);
  });
});

/** The live page actions' markup (the grid's, not the sizer's copy). */
function actions(el: ReactElement): string {
  const html = renderToStaticMarkup(el);
  const at = html.indexOf('cds-page-header__actions');
  return html.slice(at, html.indexOf('cds-page-header__sizer'));
}
const ACTIONS = [{ key: 'deploy', label: 'Deploy' }];

describe('PageHeader buttons: one size down from the density', () => {
  it('are sm at the default density, its own default', () => {
    expect(
      actions(<PageHeader title="Atlas" pageActions={ACTIONS} />)
    ).toContain('cds-btn--sm');
    expect(
      actions(
        <KitDefaults density="compact">
          <PageHeader title="Atlas" pageActions={ACTIONS} />
        </KitDefaults>
      )
    ).toContain('cds-btn--sm');
  });

  it('are md in a spacious region', () => {
    expect(
      actions(
        <KitDefaults density="spacious">
          <PageHeader title="Atlas" pageActions={ACTIONS} />
        </KitDefaults>
      )
    ).toContain('cds-btn--md');
  });

  it('reach page actions given as a node', () => {
    expect(
      actions(<PageHeader title="Atlas" pageActions={<Button>Mine</Button>} />)
    ).toContain('cds-btn--sm');
  });
});

describe('PageHeader frame', () => {
  it('is flush by default; ghost when asked', () => {
    expect(classes(<PageHeader title="Atlas" />)).not.toContain(
      'cds-page-header--ghost'
    );
    expect(renderToStaticMarkup(<PageHeader title="Atlas" />)).toContain(
      'data-frame="flush"'
    );
    expect(classes(<PageHeader title="Atlas" frame="ghost" />)).toContain(
      'cds-page-header--ghost'
    );
  });
});
