/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import { Button } from '@carbon/react';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { ShimmerText, playShimmerReveal } from '../index';
import mdx from './ShimmerText.mdx';

// Under reduced motion the label is plain text in its host's colour and the
// reveal shows the words at once: every pattern lands at once.
const PATTERNS = [
  'pass',
  'speed',
  'band',
  'colours',
  'start',
  'wave',
  'active-off',
  'reveal',
  'off-screen',
];

export default {
  title: 'V12/ShimmerText',
  component: ShimmerText,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: PATTERNS,
      reduced: Object.fromEntries(PATTERNS.map((p) => [p, 'at-once'])),
      states: ['rest'],
    },
  },
};

/** A label at work: the band on and off, and the words revealed again. */
function Working(args: { children?: string }) {
  const [active, setActive] = useState(true);
  const host = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const reveal = () => {
    const el = host.current?.firstElementChild;
    if (el instanceof HTMLElement) {
      playShimmerReveal(el, { reduced });
    }
  };
  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
      <div ref={host} style={{ fontSize: '1rem' }}>
        <ShimmerText active={active}>{args.children}</ShimmerText>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button kind="secondary" size="sm" onClick={() => setActive((a) => !a)}>
          {active ? 'Stop' : 'Start'}
        </Button>
        <Button kind="secondary" size="sm" onClick={reveal}>
          Reveal
        </Button>
      </div>
    </div>
  );
}

export const Default = {
  args: { children: 'Reading the attached files' },
  render: (args) => <Working {...args} />,
};
