/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import {
  RadioButton,
  RadioButtonGroup,
  RadioButtonSkeleton,
  RadioMark,
} from '../index';
import type { RadioButtonLabelPosition, RadioButtonProps } from '../index';
import mdx from './RadioButton.mdx';

const POSITIONS: RadioButtonLabelPosition[] = ['end', 'start'];

export default {
  title: 'V12/RadioButton',
  component: RadioButton,
  subcomponents: { RadioButtonGroup, RadioButtonSkeleton, RadioMark },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'dot-in',
        'dot-out',
        'hover',
        'press',
        'status-ring',
        'message-line',
      ],
      reduced: {
        'dot-in': 'at-once',
        'dot-out': 'at-once',
        hover: 'at-once',
        press: 'at-once',
        'status-ring': 'at-once',
        'message-line': 'at-once',
      },
      states: ['rest', 'checked', 'disabled', 'readOnly', 'invalid', 'warn'],
    },
  },
  argTypes: {
    labelPosition: { control: 'inline-radio', options: POSITIONS },
    labelText: { control: 'text' },
    invalidText: { control: 'text' },
    warnText: { control: 'text' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
  },
};

const column = { display: 'grid', gap: 24, justifyItems: 'start' };

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise' },
];

/** One radio button: the circle and its label. */
export const Default = {
  args: {
    id: 'radio-default',
    name: 'radio-default',
    labelText: 'Standard shipping',
    value: 'standard',
    defaultChecked: true,
    labelPosition: 'end',
    disabled: false,
    readOnly: false,
    hideLabel: false,
    invalid: false,
    invalidText: 'Choose a shipping method',
    warn: false,
    warnText: 'Arrives after the holiday',
    timeScale: 1,
  },
  render: (args: RadioButtonProps) => <RadioButton {...args} />,
};

/** RadioButtonGroup: one choice from several, under one legend. In a row by default. */
export const Group = {
  render: () => (
    <RadioButtonGroup
      name="radio-group-plan"
      legendText="Plan"
      defaultSelected="team"
      helperText="You can change it later">
      {PLANS.map(({ value, label }) => (
        <RadioButton key={value} value={value} labelText={label} />
      ))}
    </RadioButtonGroup>
  ),
};

/** A stacked group: `orientation="vertical"`. */
export const Vertical = {
  render: () => (
    <RadioButtonGroup
      name="radio-vertical-plan"
      legendText="Plan"
      orientation="vertical"
      defaultSelected="free">
      {PLANS.map(({ value, label }) => (
        <RadioButton key={value} value={value} labelText={label} />
      ))}
    </RadioButtonGroup>
  ),
};

/** `labelPosition="start"`: the label before the circle. It mirrors in right to left. */
export const LabelStart = {
  render: () => (
    <RadioButtonGroup
      name="radio-start-plan"
      legendText="Plan"
      orientation="vertical"
      labelPosition="start"
      defaultSelected="team">
      {PLANS.map(({ value, label }) => (
        <RadioButton key={value} value={value} labelText={label} />
      ))}
    </RadioButtonGroup>
  ),
};

/** Off, on, disabled, read-only, warning and error. */
export const States = {
  render: () => (
    <div style={column}>
      <RadioButton name="radio-state-off" labelText="Off" value="off" />
      <RadioButton
        name="radio-state-on"
        labelText="On"
        value="on"
        defaultChecked
      />
      <RadioButton
        name="radio-state-disabled"
        labelText="Disabled"
        value="disabled"
        disabled
      />
      <RadioButton
        name="radio-state-disabled-on"
        labelText="Disabled, on"
        value="disabled-on"
        disabled
        defaultChecked
      />
      <RadioButton
        name="radio-state-readonly"
        labelText="Read-only, on"
        value="readonly"
        readOnly
        defaultChecked
      />
      <RadioButton
        name="radio-state-warn"
        labelText="Warning"
        value="warn"
        warn
        warnText="Arrives after the holiday"
      />
      <RadioButton
        name="radio-state-invalid"
        labelText="Error"
        value="invalid"
        invalid
        invalidText="This option is no longer available"
      />
    </div>
  ),
};

/** A group's status rings every button in it, with one message for the group. */
export const GroupStatus = {
  render: () => (
    <div style={column}>
      <RadioButtonGroup
        name="radio-status-warn"
        legendText="Delivery"
        warn
        warnText="Express is slower this week">
        <RadioButton value="standard" labelText="Standard" />
        <RadioButton value="express" labelText="Express" />
      </RadioButtonGroup>
      <RadioButtonGroup
        name="radio-status-invalid"
        legendText="Payment"
        invalid
        invalidText="Choose a payment method">
        <RadioButton value="card" labelText="Card" />
        <RadioButton value="invoice" labelText="Invoice" />
      </RadioButtonGroup>
      <RadioButtonGroup
        name="radio-status-disabled"
        legendText="Region"
        disabled
        defaultSelected="eu">
        <RadioButton value="us" labelText="United States" />
        <RadioButton value="eu" labelText="Europe" />
      </RadioButtonGroup>
    </div>
  ),
};

const SIZES = ['Small', 'Medium', 'Large', 'Extra large'];

/** Change the choice: the old dot shrinks and fades, the new one grows. Use the buttons, a click, or the arrow keys in the group. */
export const ChangeChoice = {
  render: function ChangeChoiceStory() {
    const [size, setSize] = useState(SIZES[1]);
    const step = (by: number) =>
      setSize(
        (s) => SIZES[(SIZES.indexOf(s) + by + SIZES.length) % SIZES.length]
      );
    return (
      <div style={column}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => step(-1)}>
            Previous
          </Button>
          <Button size="sm" variant="outlined" onClick={() => step(1)}>
            Next
          </Button>
        </div>
        <RadioButtonGroup
          name="radio-change-size"
          legendText="Size"
          orientation="vertical"
          valueSelected={size}
          onChange={(value) => setSize(String(value))}>
          {SIZES.map((s) => (
            <RadioButton key={s} value={s} labelText={s} />
          ))}
        </RadioButtonGroup>
      </div>
    );
  },
};

/** RadioMark: the circle and dot alone, for a control that draws a radio it doesn't own. */
export const Mark = {
  render: () => (
    <div style={row}>
      <RadioMark checked={false} />
      <RadioMark checked />
      <RadioMark checked={false} disabled />
      <RadioMark checked disabled />
    </div>
  ),
};

/** RadioButtonSkeleton: the circle as a block. Without a label, the circle and a typical label are one bar. */
export const Skeleton = {
  render: () => (
    <div style={column}>
      <RadioButtonSkeleton labelText="Standard shipping" />
      <RadioButtonSkeleton />
    </div>
  ),
};
