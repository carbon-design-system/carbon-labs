/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { RadioButton, RadioButtonGroup } from '@carbon-labs/react-radio-button';
import { Checkbox } from '@carbon-labs/react-checkbox';
import { Button } from '@carbon-labs/react-button';
import { Slider, SliderSkeleton } from '../index';
import type { SliderProps, SliderStatus, SliderStep } from '../index';
import mdx from './Slider.mdx';

export default {
  title: 'V12/Slider',
  component: Slider,
  subcomponents: { SliderSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'glide',
        'press',
        'drag',
        'snap',
        'hover-and-press',
        'fill',
        'status',
        'message',
        'meeting',
        'readout',
        'ai',
      ],
      reduced: {
        glide: 'shorter-clock',
        snap: 'shorter-clock',
        'hover-and-press': 'full',
        status: 'at-once',
        message: 'at-once',
        readout: 'at-once',
      },
      states: [
        'rest',
        'hover',
        'pressed',
        'disabled',
        'readOnly',
        'loading',
        'invalid',
        'warn',
      ],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    shape: { control: 'inline-radio', options: ['line', 'track', 'knob'] },
    variant: { control: 'inline-radio', options: ['inverse', 'hero'] },
    fillStyle: {
      control: 'inline-radio',
      options: ['both', 'contrast', 'thickness'],
    },
    knobShape: {
      control: 'inline-radio',
      options: ['round', 'pill', 'triangle'],
    },
    status: {
      control: 'inline-radio',
      options: ['none', 'success', 'warning', 'error', 'info'],
    },
    gradient: {
      control: 'inline-radio',
      options: ['none', 'cold-warm', 'red-green'],
    },
    base: { control: 'inline-radio', options: ['inset', 'flush'] },
    corners: {
      control: 'inline-radio',
      options: ['full', 'rounded', 'square'],
    },
    readoutDirection: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
    },
    labelText: { control: 'text' },
    invalidText: { control: 'text' },
    warnText: { control: 'text' },
    children: { control: false },
    formatLabel: { control: false },
    translateWithId: { control: false },
    motion: { control: false },
    dots: { control: false },
    dotPhysics: { control: false },
  },
};

const stack = { display: 'grid', gap: 32, maxInlineSize: 480 };
const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** One knob on a line, with its number field. Press, drag or use the arrow keys. */
export const Default = {
  args: {
    labelText: 'Volume',
    value: 40,
    min: 0,
    max: 100,
    step: 1,
    size: 'md',
    shape: 'line',
    variant: 'inverse',
    fillStyle: 'both',
    knobShape: 'round',
    status: 'none',
    gradient: 'none',
    snap: false,
    ticks: false,
    hideTextInput: false,
    disabled: false,
    readOnly: false,
    loading: false,
    invalid: false,
    invalidText: 'Enter a value from 0 to 100',
    warn: false,
    warnText: 'Above 80 may distort',
  },
  render: (args: SliderProps) => (
    <div style={stack}>
      <Slider {...args} />
    </div>
  ),
};

/** Controlled: each button sets the value, and the knob glides there. A longer move takes longer. */
export const Controlled = {
  render: function ControlledStory() {
    const [value, setValue] = useState(20);
    return (
      <div style={stack}>
        <Slider
          labelText="Brightness"
          value={value}
          min={0}
          max={100}
          onChange={({ value: v }) => setValue(v)}
        />
        <div style={row}>
          {[0, 25, 50, 100].map((v) => (
            <Button
              size="sm"
              variant="outlined"
              key={v}
              onClick={() => setValue(v)}>
              {v}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setValue((v) => Math.max(0, v - 10))}>
            −10
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setValue((v) => Math.min(100, v + 10))}>
            +10
          </Button>
        </div>
        <p style={{ margin: 0 }}>Value: {value}</p>
      </div>
    );
  },
};

/** Two knobs: a range, each with its own field. Round, pill and triangle knobs. */
export const Range = {
  render: () => (
    <div style={stack}>
      {(['round', 'pill', 'triangle'] as const).map((knobShape) => (
        <Slider
          key={knobShape}
          labelText={`Price, ${knobShape}`}
          ariaLabelInput="Lowest price"
          unstable_ariaLabelInputUpper="Highest price"
          knobShape={knobShape}
          value={20}
          unstable_valueUpper={70}
          min={0}
          max={100}
        />
      ))}
    </div>
  ),
};

type Pair = [number, number];

/** Two knobs meeting. Pills swell into one shape, circles fill their overlap, triangles stop at each other. */
export const Meeting = {
  render: function MeetingStory() {
    const [pair, setPair] = useState<Pair>([30, 70]);
    const [knobShape, setKnobShape] =
      useState<NonNullable<SliderProps['knobShape']>>('pill');
    return (
      <div style={stack}>
        <div style={row}>
          <RadioButtonGroup
            name="slider-meeting-shape"
            legendText="Knob shape"
            orientation="horizontal"
            valueSelected={knobShape}
            onChange={(v) => setKnobShape(v as typeof knobShape)}>
            {(['round', 'pill', 'triangle'] as const).map((s) => (
              <RadioButton key={s} value={s} labelText={s} />
            ))}
          </RadioButtonGroup>
        </div>
        <Slider
          labelText="Range"
          ariaLabelInput="Lower value"
          unstable_ariaLabelInputUpper="Upper value"
          knobShape={knobShape}
          value={pair[0]}
          unstable_valueUpper={pair[1]}
          min={0}
          max={100}
          onChange={({ value, valueUpper }) =>
            setPair([value, valueUpper ?? 100])
          }
        />
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setPair([20, 80])}>
            Apart
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setPair([46, 54])}>
            Close
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setPair([50, 50])}>
            Together
          </Button>
        </div>
        <p style={{ margin: 0 }}>
          Range: {pair[0]} to {pair[1]}
        </p>
      </div>
    );
  },
};

/** The number field: a number in range moves the knob at once. Anything else waits for blur or Enter, then is corrected. */
export const InputField = {
  render: () => (
    <div style={stack}>
      <Slider
        labelText="Opacity"
        value={60}
        min={0}
        max={100}
        minLabel="%"
        maxLabel="%"
      />
      <Slider
        labelText="Opacity, no field"
        value={60}
        min={0}
        max={100}
        hideTextInput
        formatLabel={(v) => `${v}%`}
      />
    </div>
  ),
};

const QUALITY: SliderStep[] = [
  { label: 'Low' },
  { label: 'Medium' },
  { label: 'High' },
  { label: 'Best' },
];

/** `steps`: a few named stops. The value is a step's index; the readout rolls to the new step's label. */
export const Steps = {
  render: () => (
    <div style={stack}>
      <Slider
        labelText="Quality"
        steps={QUALITY}
        stepLabels
        readout
        value={1}
      />
      <Slider
        labelText="Quality, rolling across"
        steps={QUALITY}
        stepLabels
        readout
        readoutDirection="horizontal"
        value={2}
      />
      <Slider labelText="Level, five steps" steps={5} shape="track" value={2} />
    </div>
  ),
};

/** `snap` with `ticks`: the knob moves stop to stop, and holds a little past halfway (`sticky`). `reference` marks a second value. */
export const SnapAndTicks = {
  render: () => (
    <div style={stack}>
      <Slider
        labelText="Snap every 10"
        value={40}
        min={0}
        max={100}
        step={10}
        snap
        ticks
      />
      <Slider
        labelText="Snap every 10, not sticky"
        value={40}
        min={0}
        max={100}
        step={10}
        snap
        sticky={false}
        ticks
      />
      <Slider
        labelText="Ticks every 25, continuous"
        value={40}
        min={0}
        max={100}
        ticks={25}
      />
      <Slider
        labelText="With a reference at 70"
        value={40}
        min={0}
        max={100}
        reference={70}
      />
    </div>
  ),
};

/** `fillStyle`: on hover the fill steps toward the knob's color and thickens (both), the color only (contrast), or the weight only (thickness). */
export const FillStyles = {
  render: () => (
    <div style={stack}>
      {(['both', 'contrast', 'thickness'] as const).map((fillStyle) => (
        <Slider
          key={fillStyle}
          labelText={`Fill, ${fillStyle}`}
          fillStyle={fillStyle}
          value={50}
          min={0}
          max={100}
        />
      ))}
    </div>
  ),
};

/** `shape`: a line, a track filled to the knob, or the track's knob with no fill. The track takes `corners` and `base`. */
export const Shapes = {
  render: () => (
    <div style={stack}>
      <Slider labelText="Line" value={50} min={0} max={100} />
      <Slider labelText="Track" shape="track" value={50} min={0} max={100} />
      <Slider labelText="Knob" shape="knob" value={50} min={0} max={100} />
      <Slider
        labelText="Track, rounded corners"
        shape="track"
        corners="rounded"
        value={50}
        min={0}
        max={100}
      />
      <Slider
        labelText="Track, square, flush base"
        shape="track"
        corners="square"
        base="flush"
        value={50}
        min={0}
        max={100}
      />
    </div>
  ),
};

/** sm, md and lg, on the line and on the track. */
export const Sizes = {
  render: () => (
    <div style={stack}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Slider
          key={size}
          labelText={`Size ${size}`}
          size={size}
          value={50}
          min={0}
          max={100}
        />
      ))}
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Slider
          key={`track-${size}`}
          labelText={`Track, size ${size}`}
          shape="track"
          size={size}
          value={50}
          min={0}
          max={100}
        />
      ))}
    </div>
  ),
};

/** `variant="hero"` puts the knob and fill in the brand. `gradient` is a ramp fixed to the line, shown by the fill. */
export const Variants = {
  render: () => (
    <div style={stack}>
      <Slider labelText="Inverse" value={60} min={0} max={100} />
      <Slider labelText="Hero" variant="hero" value={60} min={0} max={100} />
      <Slider
        labelText="Gradient, cold to warm"
        gradient="cold-warm"
        value={60}
        min={0}
        max={100}
      />
      <Slider
        labelText="Gradient, red to green"
        gradient="red-green"
        value={60}
        min={0}
        max={100}
      />
    </div>
  ),
};

const STATUSES: SliderStatus[] = ['success', 'warning', 'error', 'info'];

/** `status` colors the fill. The knob does not change. */
export const Statuses = {
  render: () => (
    <div style={stack}>
      {STATUSES.map((status) => (
        <Slider
          key={status}
          labelText={`Status, ${status}`}
          status={status}
          value={60}
          min={0}
          max={100}
        />
      ))}
    </div>
  ),
};

/** Change the status: the new color wipes in from the knob along the fill. On a range, the two wipes meet midway. */
export const StatusChange = {
  render: function StatusChangeStory() {
    const [status, setStatus] = useState<SliderStatus>('none');
    return (
      <div style={stack}>
        <div style={row}>
          {(['none', ...STATUSES] as SliderStatus[]).map((s) => (
            <Button
              size="sm"
              variant="outlined"
              key={s}
              onClick={() => setStatus(s)}>
              {s}
            </Button>
          ))}
        </div>
        <Slider
          labelText="Usage"
          status={status}
          value={70}
          min={0}
          max={100}
        />
        <Slider
          labelText="Usage range"
          ariaLabelInput="Lowest usage"
          unstable_ariaLabelInputUpper="Highest usage"
          status={status}
          value={20}
          unstable_valueUpper={80}
          min={0}
          max={100}
        />
        <p style={{ margin: 0 }}>Status: {status}</p>
      </div>
    );
  },
};

type Message = 'none' | 'warn' | 'invalid';

/** `warn` and `invalid` show one message line under the slider. The old message fades out, then the new one fades in. */
export const Messages = {
  render: function MessagesStory() {
    const [message, setMessage] = useState<Message>('none');
    return (
      <div style={stack}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setMessage('none')}>
            None
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setMessage('warn')}>
            Warning
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setMessage('invalid')}>
            Error
          </Button>
        </div>
        <Slider
          labelText="Volume"
          value={85}
          min={0}
          max={100}
          warn={message === 'warn'}
          warnText="Above 80 may distort"
          invalid={message === 'invalid'}
          invalidText="Enter a value from 0 to 100"
        />
      </div>
    );
  },
};

/** Disabled: one knob, a range and steps. */
export const Disabled = {
  render: () => (
    <div style={stack}>
      <Slider labelText="Volume" value={40} min={0} max={100} disabled />
      <Slider
        labelText="Price"
        ariaLabelInput="Lowest price"
        unstable_ariaLabelInputUpper="Highest price"
        value={20}
        unstable_valueUpper={70}
        min={0}
        max={100}
        disabled
      />
      <Slider
        labelText="Quality"
        steps={QUALITY}
        stepLabels
        value={2}
        disabled
      />
    </div>
  ),
};

/** Read-only: a fixed value, not a control. A bar to the value, no knob, the value as text. */
export const ReadOnly = {
  render: () => (
    <div style={stack}>
      <Slider labelText="Volume" value={40} min={0} max={100} readOnly />
      <Slider
        labelText="Price"
        value={20}
        unstable_valueUpper={70}
        min={0}
        max={100}
        readOnly
      />
      <Slider
        labelText="Level"
        shape="knob"
        value={60}
        min={0}
        max={100}
        readOnly
      />
      <Slider
        labelText="Quality"
        steps={QUALITY}
        stepLabels
        value={2}
        readOnly
      />
    </div>
  ),
};

/** Loading: the knob's band is one skeleton block; the line, labels and field frames are drawn. `SliderSkeleton` is the slider, loading. */
export const Loading = {
  render: function LoadingStory() {
    const [loading, setLoading] = useState(true);
    return (
      <div style={stack}>
        <Checkbox
          id="slider-loading"
          labelText="Loading"
          checked={loading}
          onChange={(_e, { checked }) => setLoading(checked)}
        />
        <Slider
          labelText="Volume"
          value={40}
          min={0}
          max={100}
          loading={loading}
        />
        <SliderSkeleton />
        <SliderSkeleton twoHandles />
      </div>
    );
  },
};

const MODES: SliderStep[] = [
  { label: 'Off' },
  { label: 'Low' },
  { label: 'Medium' },
  { label: 'High' },
  { label: 'Auto' },
];

/** `ai` on the track: dots on the fill. On an `ai` slider with more than two steps the last is the special step: there the dots come in from the knob, and leave from the track's start. */
export const Ai = {
  render: function AiStory() {
    const [value, setValue] = useState(2);
    return (
      <div style={stack}>
        <Slider
          labelText="Assist"
          shape="track"
          ai
          steps={MODES}
          stepLabels
          readout
          value={value}
          onChange={({ value: v }) => setValue(v)}
        />
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => setValue(1)}>
            Low
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setValue(MODES.length - 1)}>
            Auto
          </Button>
        </div>
        <p style={{ margin: 0 }}>Step: {value}</p>
      </div>
    );
  },
};
