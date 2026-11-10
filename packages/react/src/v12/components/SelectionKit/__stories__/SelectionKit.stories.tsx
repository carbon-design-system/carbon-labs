/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { SelectionPanels } from '../index';
import '../components/selection-kit.scss';
import mdx from './SelectionKit.mdx';

export default {
  title: 'V12/SelectionKit',
  component: SelectionPanels,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['content-swap'],
      reduced: {},
      states: ['rest', 'switching'],
    },
  },
  argTypes: {
    fit: { control: 'inline-radio', options: ['content', 'largest'] },
    axis: { control: 'inline-radio', options: ['x', 'y'] },
    travel: { control: 'inline-radio', options: ['with', 'against'] },
  },
};

const PANELS = [
  { name: 'Overview', body: 'A short summary of the project.' },
  {
    name: 'Activity',
    body: 'The last ten changes, newest first. Each change names who made it and when, and links to what it changed.',
  },
  { name: 'Settings', body: 'Name, owner and visibility.' },
];

/** The panels a selection switches: the old content goes, then the new follows, the way the selection moved. */
export const Panels = {
  args: { fit: 'content', axis: 'x', travel: 'with' },
  render: function PanelsStory(args: {
    fit: 'content' | 'largest';
    axis: 'x' | 'y';
    travel: 'with' | 'against';
  }) {
    const [selected, setSelected] = useState(0);
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 420 }}>
        <div role="tablist" style={{ display: 'flex', gap: 8 }}>
          {PANELS.map((p, i) => (
            <button
              key={p.name}
              type="button"
              role="tab"
              aria-selected={selected === i}
              onClick={() => setSelected(i)}>
              {p.name}
            </button>
          ))}
        </div>
        <SelectionPanels
          selectedIndex={selected}
          fit={args.fit}
          axis={args.axis}
          travel={args.travel}>
          {PANELS.map((p) => (
            <p key={p.name}>{p.body}</p>
          ))}
        </SelectionPanels>
      </div>
    );
  },
};
