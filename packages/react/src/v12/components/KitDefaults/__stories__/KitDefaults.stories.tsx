/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { BrandZone, KIT_BRANDS, KitDefaults, useKitDefaults } from '../index';
import mdx from './KitDefaults.mdx';

// KitDefaults has no motion of its own: it sets the defaults the components
// inside read.
export default {
  title: 'V12/KitDefaults',
  component: KitDefaults,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: { motion: [], reduced: {}, states: ['rest'] },
  },
};

/** What a component inside reads: the nearest provider's values, then the outer one's. */
function Readout() {
  return <code>{JSON.stringify(useKitDefaults())}</code>;
}

/** The hero fill in one brand. */
function Hero({ label }: { label: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <span
        style={{
          display: 'inline-block',
          inlineSize: 48,
          blockSize: 24,
          background: 'var(--cds-hero-fill)',
        }}
      />
      {label}
    </span>
  );
}

/** A provider nested in another, and the hero fill in each brand. */
export const Default = {
  render: () => (
    <KitDefaults density="compact" corners="rounded">
      <p>
        <Readout />
      </p>
      <KitDefaults density="spacious">
        <p>
          <Readout />
        </p>
      </KitDefaults>
      <p style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {KIT_BRANDS.map((brand) => (
          <BrandZone key={brand} brand={brand}>
            <Hero label={brand} />
          </BrandZone>
        ))}
      </p>
    </KitDefaults>
  ),
};
