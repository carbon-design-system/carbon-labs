/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { ThemeZone } from '../index';
import mdx from './ThemeZone.mdx';

// A theme zone has no motion of its own: it sets the theme the components
// inside draw in.
export default {
  title: 'V12/ThemeZone',
  component: ThemeZone,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: { motion: [], reduced: {}, states: ['rest'] },
  },
};

const box = {
  padding: '1rem',
  background: 'var(--cds-layer-01)',
  color: 'var(--cds-text-primary)',
};

/** Each zone, and an inverse zone inside a dark one. */
export const Default = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {(['page', 'light', 'dark', 'inverse'] as const).map((theme) => (
        <ThemeZone key={theme} theme={theme} style={box}>
          {theme}
        </ThemeZone>
      ))}
      <ThemeZone theme="dark" style={box}>
        dark
        <ThemeZone theme="inverse" style={{ ...box, marginTop: '0.5rem' }}>
          inverse, inside dark
        </ThemeZone>
      </ThemeZone>
    </div>
  ),
};
