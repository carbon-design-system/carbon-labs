/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { motionTokens, type CubicBezier } from '@carbon-labs/v12-motion';
import { EasingGraph } from '../index';
import type { EasingGraphProps } from '../index';
import mdx from './EasingGraph.mdx';

export default {
  title: 'V12/EasingGraph',
  component: EasingGraph,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['handle-ring', 'handle-press', 'arm'],
      reduced: {
        'handle-ring': 'at-once',
        'handle-press': 'at-once',
        arm: 'full',
      },
      states: ['rest', 'hover', 'pressed'],
    },
  },
  argTypes: {
    value: { control: 'object' },
    reference: { control: 'object' },
    label: { control: 'text' },
    onChange: { control: false },
  },
};

const NAMES = [
  'standard-productive',
  'standard-expressive',
  'entrance-productive',
  'entrance-expressive',
  'exit-productive',
  'exit-expressive',
] as const;

const curve = (name: (typeof NAMES)[number]): CubicBezier => [
  ...motionTokens.easing[name],
];

const grid = {
  display: 'grid',
  gap: 32,
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  maxInlineSize: 720,
};
const single = { display: 'grid', gap: 16, maxInlineSize: 320 };
const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** One curve, read only: the graph and the curve's four numbers as text. */
export const Default = {
  args: {
    label: 'standard-productive',
    value: curve('standard-productive'),
    reference: null,
    hideNumbers: false,
  },
  render: (args: EasingGraphProps) => (
    <div style={single}>
      <EasingGraph {...args} />
    </div>
  ),
};

/** The motion tokens' curves, read only. */
export const NamedCurves = {
  render: () => (
    <div style={grid}>
      {NAMES.map((name) => (
        <EasingGraph key={name} label={name} value={curve(name)} />
      ))}
    </div>
  ),
};

/** With `onChange`: drag a handle, use the arrow keys on it (Shift for 0.1), or type the four numbers. The starting curve stays dotted behind. */
export const Editable = {
  render: function EditableStory() {
    const start = curve('standard-productive');
    const [value, setValue] = useState<CubicBezier>(start);
    return (
      <div style={single}>
        <EasingGraph
          label="Custom curve"
          value={value}
          reference={start}
          onChange={setValue}
        />
        <div style={row}>
          {(
            [
              'standard-productive',
              'entrance-expressive',
              'exit-productive',
            ] as const
          ).map((name) => (
            <Button
              size="sm"
              variant="outlined"
              key={name}
              onClick={() => setValue(curve(name))}>
              {name}
            </Button>
          ))}
        </div>
        <p style={{ margin: 0 }}>
          <code>cubic-bezier({value.join(', ')})</code>
        </p>
      </div>
    );
  },
};

/** `reference` draws a second curve dotted behind, to compare. */
export const WithReference = {
  render: () => (
    <div style={grid}>
      <EasingGraph
        label="entrance-expressive against entrance-productive"
        value={curve('entrance-expressive')}
        reference={curve('entrance-productive')}
      />
      <EasingGraph
        label="exit-expressive against exit-productive"
        value={curve('exit-expressive')}
        reference={curve('exit-productive')}
      />
    </div>
  ),
};

/** `hideNumbers`: the graph alone, read only and editable. */
export const HideNumbers = {
  render: function HideNumbersStory() {
    const [value, setValue] = useState<CubicBezier>(
      curve('standard-expressive')
    );
    return (
      <div style={grid}>
        <EasingGraph
          label="standard-productive"
          value={curve('standard-productive')}
          hideNumbers
        />
        <EasingGraph
          label="Custom curve"
          value={value}
          onChange={setValue}
          hideNumbers
        />
      </div>
    );
  },
};
