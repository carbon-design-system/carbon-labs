/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { RollText } from '../index';
import mdx from './RollText.mdx';

export default {
  title: 'V12/RollText',
  component: RollText,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'duration-moderate-01',
        'easing-standard-productive',
        'easing-entrance-productive',
      ],
      reduced: {
        'duration-moderate-01': 'at-once',
        'easing-standard-productive': 'at-once',
        'easing-entrance-productive': 'at-once',
      },
      states: ['rest'],
    },
  },
};

/** A count that rolls up or down a step at a time. */
function Counter(args: { direction?: 'vertical' | 'horizontal' }) {
  const [n, setN] = useState(12);
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button kind="secondary" size="sm" onClick={() => setN((v) => v - 1)}>
        Down
      </Button>
      <span style={{ fontSize: '2rem' }}>
        <RollText text={String(n)} order={n} {...args} />
      </span>
      <Button kind="secondary" size="sm" onClick={() => setN((v) => v + 1)}>
        Up
      </Button>
    </div>
  );
}

export const Default = {
  args: { direction: 'vertical' },
  render: (args) => <Counter {...args} />,
};
