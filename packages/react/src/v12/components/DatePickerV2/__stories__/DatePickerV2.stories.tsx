/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { DatePicker, DatePickerInput, DatePickerSkeleton } from '../index';
import type { DateMark, DatePickerInputSize, DatePickerProps } from '../index';
import mdx from './DatePickerV2.mdx';

const SIZES: DatePickerInputSize[] = ['xs', 'sm', 'md', 'lg'];

export default {
  title: 'V12/DatePickerV2',
  component: DatePicker,
  subcomponents: { DatePickerInput, DatePickerSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'snap-floating-profile',
        'selection-hero',
        'range-ends',
        'band',
        'rollover',
        'today-picked',
        'tooltip',
        'content-swap',
        'roll',
      ],
      reduced: {
        'snap-floating-profile': 'at-once',
        'selection-hero': 'shorter-clock',
        'range-ends': 'shorter-clock',
        band: 'shorter-clock',
        'today-picked': 'shorter-clock',
        tooltip: 'at-once',
        'content-swap': 'at-once',
        roll: 'at-once',
      },
      states: ['rest', 'open', 'invalid', 'warning', 'disabled', 'readOnly'],
    },
  },
  argTypes: {
    datePickerType: {
      control: 'inline-radio',
      options: ['simple', 'single', 'range'],
    },
    children: { control: false },
    markedDates: { control: false },
  },
};

/** A day in the current month, so the examples stay current. */
const thisMonth = (day: number) => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), day);
};

/** Today, `n` days on (or back). */
const fromToday = (n: number) => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate() + n);
};

/** A day in next month. */
const nextMonth = (day: number) => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth() + 1, day);
};

/** Events this month and next, one of each kind and a day with three. */
const MARKS: DateMark[] = [
  { date: thisMonth(3), kind: 'info', label: 'Sprint review' },
  { date: thisMonth(9), kind: 'success', label: 'Release shipped' },
  { date: thisMonth(14), kind: 'warning', label: 'Change freeze' },
  { date: thisMonth(14), label: 'Team lunch' },
  { date: thisMonth(21), kind: 'error', label: 'Outage window' },
  { date: thisMonth(21), kind: 'info', label: 'Planning' },
  { date: thisMonth(21), kind: 'success', label: 'Audit passed' },
  { date: thisMonth(27), label: 'Offsite' },
  { date: nextMonth(4), kind: 'warning', label: 'Quarter close' },
  { date: nextMonth(12), kind: 'info', label: 'All hands' },
];

/** Room below for the calendar that opens under the fields. */
const row = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 32,
  alignItems: 'flex-start',
  paddingBlockEnd: 400,
};

const column = {
  display: 'grid',
  gap: 32,
  justifyItems: 'start',
  paddingBlockEnd: 32,
};

/** A single date. Focus or press the field: the calendar grows from the press and folds back into it. */
export const Default = {
  args: {
    datePickerType: 'single',
  },
  render: (args: DatePickerProps) => (
    <div style={row}>
      <DatePicker {...args}>
        <DatePickerInput
          id="dp2-default"
          labelText="Start date"
          placeholder="mm/dd/yyyy"
        />
      </DatePicker>
    </div>
  ),
};

/** A range with events: press a start and an end, or press, drag and release. Days with events carry status pips and name them in a tooltip. */
export const Range = {
  render: () => (
    <div style={row}>
      <DatePicker
        datePickerType="range"
        value={[thisMonth(8), thisMonth(14)]}
        markedDates={MARKS}>
        <DatePickerInput
          id="dp2-range-from"
          labelText="Check in"
          placeholder="mm/dd/yyyy"
        />
        <DatePickerInput
          id="dp2-range-to"
          labelText="Check out"
          placeholder="mm/dd/yyyy"
        />
      </DatePicker>
    </div>
  ),
};

/** The calendar in the page. The first pick grows in; each later one glides to the day picked. A neighboring month's day turns to that month, its name rolling. */
export const Inline = {
  render: () => (
    <div style={{ ...row, paddingBlockEnd: 32 }}>
      <DatePicker datePickerType="single" inline value={thisMonth(12)}>
        <DatePickerInput
          id="dp2-inline"
          labelText="Delivery date"
          placeholder="mm/dd/yyyy"
        />
      </DatePicker>
      <DatePicker
        datePickerType="range"
        inline
        value={[fromToday(-4), fromToday(0)]}
        markedDates={MARKS}>
        <DatePickerInput
          id="dp2-inline-from"
          labelText="From"
          placeholder="mm/dd/yyyy"
        />
        <DatePickerInput
          id="dp2-inline-to"
          labelText="To"
          placeholder="mm/dd/yyyy"
        />
      </DatePicker>
    </div>
  ),
};

/** The three kinds: a typed date (and a short one, month and year), a single date and a range. */
export const Kinds = {
  render: () => (
    <div style={row}>
      <DatePicker datePickerType="simple">
        <DatePickerInput
          id="dp2-kind-simple"
          labelText="Date"
          placeholder="mm/dd/yyyy"
        />
      </DatePicker>
      <DatePicker datePickerType="simple" short>
        <DatePickerInput
          id="dp2-kind-short"
          labelText="Expiry"
          placeholder="mm/yy"
        />
      </DatePicker>
      <DatePicker datePickerType="single">
        <DatePickerInput
          id="dp2-kind-single"
          labelText="Date"
          placeholder="mm/dd/yyyy"
        />
      </DatePicker>
      <DatePicker datePickerType="range">
        <DatePickerInput
          id="dp2-kind-from"
          labelText="From"
          placeholder="mm/dd/yyyy"
        />
        <DatePickerInput
          id="dp2-kind-to"
          labelText="To"
          placeholder="mm/dd/yyyy"
        />
      </DatePicker>
    </div>
  ),
};

/** The field's sizes, xs (24px) to lg (48px). */
export const Sizes = {
  render: () => (
    <div style={column}>
      {SIZES.map((size) => (
        <DatePicker key={size} datePickerType="single">
          <DatePickerInput
            id={`dp2-size-${size}`}
            labelText={`Size ${size}`}
            placeholder="mm/dd/yyyy"
            size={size}
          />
        </DatePicker>
      ))}
    </div>
  ),
};

/** Disabled, read-only, a warning and an error. Read-only never opens. */
export const States = {
  render: () => (
    <div style={column}>
      <DatePicker datePickerType="single" value={thisMonth(9)}>
        <DatePickerInput
          id="dp2-state-disabled"
          labelText="Disabled"
          disabled
          helperText="Set by your plan."
        />
      </DatePicker>
      <DatePicker datePickerType="single" readOnly value={thisMonth(9)}>
        <DatePickerInput id="dp2-state-readonly" labelText="Read-only" />
      </DatePicker>
      <DatePicker datePickerType="single" value={thisMonth(25)}>
        <DatePickerInput
          id="dp2-state-warn"
          labelText="Warning"
          warn
          warnText="The office is closed."
        />
      </DatePicker>
      <DatePicker datePickerType="single" value={thisMonth(2)}>
        <DatePickerInput
          id="dp2-state-invalid"
          labelText="Error"
          invalid
          invalidText="Pick a date after today."
        />
      </DatePicker>
    </div>
  ),
};

/** The loading shape, single and range. */
export const Skeleton = {
  render: () => (
    <div style={column}>
      <DatePickerSkeleton />
      <DatePickerSkeleton range />
    </div>
  ),
};
