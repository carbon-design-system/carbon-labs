/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import { TagSet } from '../components/TagSet';

const TAGS = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
];

/** The "+N" in the row (the button), not the measuring copy. */
const more = (html: string) =>
  html.match(/<button[^>]*class="([^"]*cds-tag-set__overflow[^"]*)"/)?.[1] ??
  '';

describe('TagSet', () => {
  it('the "+N" is the pill by default', () => {
    const html = renderToStaticMarkup(<TagSet tags={TAGS} maxVisible={1} />);
    expect(more(html)).toMatch(
      /cds-tag cds-tag--md cds-tag--selectable cds-tag-set__overflow/
    );
  });

  it('the "+N" takes the provider’s corners, as the tags do', () => {
    const html = renderToStaticMarkup(
      <KitDefaults corners="rounded">
        <TagSet tags={TAGS} maxVisible={1} />
      </KitDefaults>
    );
    expect(html).toMatch(
      /class="cds-tag cds-tag--gray cds-tag--md cds-tag--rounded cds-tag-set__tag"/
    );
    expect(more(html)).toMatch(
      /cds-tag--md cds-tag--rounded cds-tag--selectable/
    );
  });
});
