/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import { Button } from '@carbon/react';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import { reflowKey, useListReflow } from '../index';
import mdx from './ListReflow.mdx';

export default {
  title: 'V12/ListReflow',
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['relayout'],
      reduced: { relayout: 'shorter-clock' },
      states: ['rest'],
    },
  },
};

/** A row of items: one leaves or arrives, and the rest move to their places. */
function Row({ mode }: { mode: 'sequence' | 'carry' }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [items, setItems] = useState(['1', '2', '3', '4']);
  const [next, setNext] = useState(5);
  useListReflow(root, { key: items.join(' '), mode, reduced });
  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <Button
          size="sm"
          kind="secondary"
          onClick={() => {
            setItems((list) => [String(next), ...list]);
            setNext((n) => n + 1);
          }}>
          Add
        </Button>
        <Button
          size="sm"
          kind="secondary"
          disabled={items.length < 2}
          onClick={() => setItems((list) => list.slice(1))}>
          Remove
        </Button>
      </div>
      <div ref={root} style={{ display: 'flex', gap: '0.5rem' }}>
        {items.map((item) => (
          <span
            key={item}
            {...reflowKey(item)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--cds-border-subtle)',
            }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export const Default = {
  args: { mode: 'sequence' },
  render: (args) => <Row {...args} />,
};
