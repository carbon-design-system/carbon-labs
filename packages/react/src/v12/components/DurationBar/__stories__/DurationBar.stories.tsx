/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { DurationBar } from '../index';
import type { DurationBarProps } from '../index';
import mdx from './DurationBar.mdx';

export default {
  title: 'V12/DurationBar',
  component: DurationBar,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['glide', 'press', 'drag', 'hover-and-press', 'fill'],
      reduced: {
        glide: 'shorter-clock',
        'hover-and-press': 'full',
      },
      states: ['editable', 'fixed', 'reference', 'hideNumber'],
    },
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: { type: 'number', min: 0, step: 5 } },
    max: { control: { type: 'number', min: 100, step: 100 } },
    reference: { control: { type: 'number', min: 0, step: 5 } },
    onChange: { control: false },
  },
};

const stack = { display: 'grid', gap: 16, maxInlineSize: 480 };
const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};
const scaleRow = {
  display: 'grid',
  gridTemplateColumns: '96px 1fr',
  gap: 16,
  alignItems: 'center',
};

/** One editable duration. Drag the knob, press the track, use the arrow keys (5ms; Shift, 50ms) or type in the field. */
export const Default = {
  args: {
    label: 'Fade',
    value: 240,
    max: 1000,
    hideNumber: false,
  },
  render: function DefaultStory(args: DurationBarProps) {
    const [value, setValue] = useState(args.value);
    useEffect(() => setValue(args.value), [args.value]);
    return (
      <div style={stack}>
        <DurationBar {...args} value={value} onChange={setValue} />
        <p style={{ margin: 0 }}>Value: {value}ms</p>
      </div>
    );
  },
};

/** Without `onChange` it is a fixed value: a bar to the value, no knob, the number beside it. */
export const Fixed = {
  render: () => (
    <div style={stack}>
      <DurationBar label="Fade" value={240} />
      <DurationBar label="Slide" value={400} reference={300} />
    </div>
  ),
};

const DURATIONS = [
  { label: 'Short', value: 70 },
  { label: 'Medium', value: 150 },
  { label: 'Long', value: 400 },
  { label: 'Longer', value: 700 },
];

/** A column of rows on one `max`: the dots every 100ms line up, so the column reads as one scale. */
export const Scale = {
  render: function ScaleStory() {
    const [values, setValues] = useState(DURATIONS.map((d) => d.value));
    return (
      <div style={{ display: 'grid', gap: 8, maxInlineSize: 560 }}>
        {DURATIONS.map((d, i) => (
          <div key={d.label} style={scaleRow}>
            <span>{d.label}</span>
            <DurationBar
              label={d.label}
              value={values[i] ?? d.value}
              onChange={(ms) =>
                setValues((v) => v.map((x, j) => (j === i ? ms : x)))
              }
            />
          </div>
        ))}
      </div>
    );
  },
};

/** The buttons set the value, and the knob glides there. A longer move takes longer. */
export const Durations = {
  render: function DurationsStory() {
    const [value, setValue] = useState(100);
    return (
      <div style={stack}>
        <DurationBar label="Expand" value={value} onChange={setValue} />
        <div style={row}>
          {[0, 100, 240, 400, 700, 1000].map((ms) => (
            <Button
              size="sm"
              variant="outlined"
              key={ms}
              onClick={() => setValue(ms)}>
              {ms}ms
            </Button>
          ))}
        </div>
      </div>
    );
  },
};

/** `reference` marks a second value, such as the last saved one. Save marks the current value; Revert goes back to it. */
export const Reference = {
  render: function ReferenceStory() {
    const [value, setValue] = useState(320);
    const [saved, setSaved] = useState(240);
    return (
      <div style={stack}>
        <DurationBar
          label="Fade"
          value={value}
          reference={saved}
          onChange={setValue}
        />
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => setSaved(value)}>
            Save
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setValue(saved)}>
            Revert
          </Button>
        </div>
        <p style={{ margin: 0 }}>
          Value: {value}ms. Saved: {saved}ms.
        </p>
      </div>
    );
  },
};

/** `max` sets the scale's end. Values stay within 0 and `max`. */
export const LongerScale = {
  render: function LongerScaleStory() {
    const [value, setValue] = useState(1200);
    return (
      <div style={stack}>
        <DurationBar
          label="Page change"
          value={value}
          max={2000}
          onChange={setValue}
        />
      </div>
    );
  },
};

/** `hideNumber`: the bar alone, editable and fixed. */
export const HideNumber = {
  render: function HideNumberStory() {
    const [value, setValue] = useState(150);
    return (
      <div style={stack}>
        <DurationBar
          label="Fade"
          value={value}
          onChange={setValue}
          hideNumber
        />
        <DurationBar label="Slide" value={400} hideNumber />
      </div>
    );
  },
};
