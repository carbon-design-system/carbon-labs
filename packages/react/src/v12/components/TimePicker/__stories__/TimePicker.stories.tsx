/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { TimePicker, TimePickerSelect } from '../index';
import type { TimePickerProps, TimePickerSize } from '../index';
import mdx from './TimePicker.mdx';

const SIZES: TimePickerSize[] = ['xs', 'sm', 'md', 'lg'];

export default {
  title: 'V12/TimePicker',
  component: TimePicker,
  subcomponents: { TimePickerSelect },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'outline-ladder',
        'error-border',
        'message-line',
        'status-mark',
        'field-width',
        'icon-hover',
      ],
      reduced: {
        'outline-ladder': 'shorter-clock',
        'error-border': 'shorter-clock',
        'message-line': 'at-once',
        'status-mark': 'at-once',
      },
      states: ['rest', 'invalid', 'warning', 'disabled', 'readOnly'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    corners: {
      control: 'inline-radio',
      options: ['rounded', 'full', 'square'],
    },
    labelText: { control: 'text' },
    invalidText: { control: 'text' },
    warningText: { control: 'text' },
    children: { control: false },
  },
};

/** A column of fields, 32px apart: the gap the message line sits in. */
const form = {
  display: 'grid',
  gap: 32,
  maxInlineSize: 400,
  paddingBlockEnd: 32,
};

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** The AM / PM select, its id from the picker's. */
const period = (id: string) => (
  <TimePickerSelect id={`${id}-period`} aria-label="AM or PM" defaultValue="am">
    <option value="am">AM</option>
    <option value="pm">PM</option>
  </TimePickerSelect>
);

/** The time zone select, its id from the picker's. */
const zone = (id: string) => (
  <TimePickerSelect id={`${id}-zone`} aria-label="Time zone" defaultValue="utc">
    <option value="utc">UTC</option>
    <option value="minus-5">UTC−5</option>
    <option value="plus-1">UTC+1</option>
    <option value="plus-9">UTC+9</option>
  </TimePickerSelect>
);

/** One picker: the time field, then its AM / PM and time zone selects. */
export const Default = {
  args: {
    id: 'time-picker-default',
    labelText: 'Start time',
    placeholder: 'hh:mm',
    hideLabel: false,
    disabled: false,
    readOnly: false,
    invalid: false,
    invalidText: 'Enter a time as hh:mm',
    warning: false,
    warningText: 'This time is outside working hours',
  },
  render: (args: TimePickerProps) => (
    <div style={form}>
      <TimePicker {...args}>
        {period(args.id)}
        {zone(args.id)}
      </TimePicker>
    </div>
  ),
};

/** The four sizes: xs 24, sm 32, md 40 and lg 48px. The selects take the picker's size. */
export const Sizes = {
  render: () => (
    <div style={form}>
      {SIZES.map((size) => {
        const id = `time-picker-size-${size}`;
        return (
          <TimePicker key={size} id={id} labelText={`Size ${size}`} size={size}>
            {period(id)}
            {zone(id)}
          </TimePicker>
        );
      })}
    </div>
  ),
};

/** Warning, error, disabled and read-only. Read-only selects hold their value. */
export const States = {
  render: () => (
    <div style={form}>
      <TimePicker
        id="time-picker-warning"
        labelText="Warning"
        defaultValue="7:30"
        warning
        warningText="This time is outside working hours">
        {period('time-picker-warning')}
      </TimePicker>
      <TimePicker
        id="time-picker-invalid"
        labelText="Error"
        defaultValue="13:75"
        invalid
        invalidText="Enter a time as hh:mm">
        {period('time-picker-invalid')}
      </TimePicker>
      <TimePicker
        id="time-picker-disabled"
        labelText="Disabled"
        defaultValue="9:00"
        disabled>
        {period('time-picker-disabled')}
        {zone('time-picker-disabled')}
      </TimePicker>
      <TimePicker
        id="time-picker-readonly"
        labelText="Read-only"
        defaultValue="9:00"
        readOnly>
        {period('time-picker-readonly')}
        {zone('time-picker-readonly')}
      </TimePicker>
    </div>
  ),
};

/** The three corners: rounded (8px, the default), full (a pill) and square. */
export const Corners = {
  render: () => (
    <div style={form}>
      {(['rounded', 'full', 'square'] as const).map((corners) => {
        const id = `time-picker-corners-${corners}`;
        return (
          <TimePicker
            key={corners}
            id={id}
            labelText={`Corners ${corners}`}
            corners={corners}>
            {period(id)}
          </TimePicker>
        );
      })}
    </div>
  ),
};

const TIME = /^(1[012]|[1-9]):[0-5][0-9]$/;

/** Type a time: anything that isn't hh:mm is an error. The field widens for the status mark. */
export const Validation = {
  render: function ValidationStory() {
    const [value, setValue] = useState('');
    const invalid = value !== '' && !TIME.test(value);
    return (
      <div style={form}>
        <TimePicker
          id="time-picker-validation"
          labelText="Reminder"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          invalid={invalid}
          invalidText="Enter a time as hh:mm">
          {period('time-picker-validation')}
          {zone('time-picker-validation')}
        </TimePicker>
      </div>
    );
  },
};

type Status = 'none' | 'warning' | 'error';

/** Set the status from outside: the message line, the mark and the border change. */
export const StatusChange = {
  render: function StatusChangeStory() {
    const [status, setStatus] = useState<Status>('none');
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setStatus('none')}>
            None
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setStatus('warning')}>
            Warning
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setStatus('error')}>
            Error
          </Button>
        </div>
        <div style={form}>
          <TimePicker
            id="time-picker-status"
            labelText="End time"
            defaultValue="6:45"
            warning={status === 'warning'}
            warningText="This time is outside working hours"
            invalid={status === 'error'}
            invalidText="The end time is before the start time">
            {period('time-picker-status')}
            {zone('time-picker-status')}
          </TimePicker>
        </div>
      </div>
    );
  },
};
