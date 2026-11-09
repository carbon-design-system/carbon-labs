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
import { Processing } from '../components/Processing';

/** The mark's root classes. */
const classes = (html: string) =>
  /class="(cds-processing[^"]*)"/.exec(html)?.[1]?.split(' ') ?? [];

describe('Processing variant', () => {
  it('is neutral by default: the host’s colour', () => {
    expect(classes(renderToStaticMarkup(<Processing />))).not.toContain(
      'cds-processing--hero'
    );
  });

  it('takes hero, the kit’s brand, at both sizes', () => {
    expect(
      classes(renderToStaticMarkup(<Processing variant="hero" />))
    ).toContain('cds-processing--hero');
    const small = classes(
      renderToStaticMarkup(<Processing variant="hero" size={16} />)
    );
    expect(small).toContain('cds-processing--hero');
    expect(small).toContain('cds-processing--solid');
  });

  it('follows KitDefaults variant when none is given, as every loader, and its own over it', () => {
    expect(
      classes(
        renderToStaticMarkup(
          <KitDefaults variant="hero">
            <Processing />
          </KitDefaults>
        )
      )
    ).toContain('cds-processing--hero');
    expect(
      classes(
        renderToStaticMarkup(
          <KitDefaults variant="hero">
            <Processing variant="neutral" />
          </KitDefaults>
        )
      )
    ).not.toContain('cds-processing--hero');
    // Not a loader's treatment: ignored.
    expect(
      classes(
        renderToStaticMarkup(
          <KitDefaults variant="inverse">
            <Processing />
          </KitDefaults>
        )
      )
    ).not.toContain('cds-processing--hero');
  });
});
