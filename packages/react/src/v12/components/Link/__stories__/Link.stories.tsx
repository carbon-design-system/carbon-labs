/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { ArrowRight } from '@carbon-labs/react-motion-icons';
import { Link, LinkSizes } from '../index';
import mdx from './Link.mdx';

export default {
  title: 'V12/Link',
  component: Link,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'rollover-link-blue',
        'colours',
        'underline-standalone',
        'underline-inline',
        'motion-icon',
        'slow-motion',
      ],
      reduced: {},
      states: ['rest', 'hover', 'press', 'focus', 'visited', 'disabled'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: LinkSizes },
  },
};

const row = { display: 'flex', gap: 32, alignItems: 'baseline' };

/** A standalone link: hover it for the rollover, press it for the release circle. */
export const Default = {
  args: {
    children: 'Read the guide',
    href: '#',
    size: 'md',
    inline: false,
    disabled: false,
    visited: false,
  },
};

/** v11's three sizes. */
export const Sizes = {
  render: () => (
    <div style={row}>
      {LinkSizes.map((size) => (
        <Link key={size} href="#" size={size}>
          Size {size}
        </Link>
      ))}
    </div>
  ),
};

/** Inside a sentence: always underlined, with no icon. */
export const Inline = {
  render: () => (
    <p style={{ maxWidth: 480 }}>
      Each component follows the motion tokens. See{' '}
      <Link href="#" inline>
        the token reference
      </Link>{' '}
      for the durations and easings.
    </p>
  ),
};

/** A motion icon after the text plays on the link's hover or focus. */
export const WithIcon = {
  render: () => (
    <Link href="#" renderIcon={ArrowRight}>
      Continue
    </Link>
  ),
};

/** Visited and disabled. */
export const VisitedAndDisabled = {
  render: () => (
    <div style={row}>
      <Link href="#" visited>
        Visited
      </Link>
      <Link href="#" disabled>
        Disabled
      </Link>
    </div>
  ),
};
