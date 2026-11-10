/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { Select, SelectItem, SelectItemGroup, SelectSkeleton } from '../index';
import type { SelectProps, SelectSize } from '../index';
import mdx from './Select.mdx';

const SIZES: SelectSize[] = ['xs', 'sm', 'md', 'lg'];

export default {
  title: 'V12/Select',
  component: Select,
  subcomponents: { SelectItem, SelectItemGroup, SelectSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'outline-ladder',
        'message-line',
        'status-mark',
        'error-border',
        'icon-hover',
        'list-snap-in',
        'list-snap-out',
        'list-fade',
      ],
      reduced: {
        'outline-ladder': 'shorter-clock',
        'error-border': 'shorter-clock',
        'message-line': 'at-once',
        'status-mark': 'at-once',
        'list-snap-in': 'shorter-clock',
        'list-snap-out': 'at-once',
      },
      states: ['rest', 'invalid', 'warn', 'disabled', 'readOnly'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    corners: {
      control: 'inline-radio',
      options: ['rounded', 'full', 'square'],
    },
    frame: { control: 'inline-radio', options: ['inset', 'ghost'] },
    variant: { control: 'inline-radio', options: ['neutral', 'hero'] },
    messagePlacement: { control: 'inline-radio', options: ['gap', 'flow'] },
    aiState: {
      control: 'select',
      options: ['suggested', 'filled', 'edited'],
    },
    labelText: { control: 'text' },
    helperText: { control: 'text' },
    invalidText: { control: 'text' },
    warnText: { control: 'text' },
    decorator: { control: false },
    slug: { control: false },
    aiText: { control: false },
  },
};

/** A column of fields, 32px apart: the gap the message line sits in. */
const form = {
  display: 'grid',
  gap: 32,
  maxInlineSize: 320,
  paddingBlockEnd: 32,
};

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

const PLANS = [
  { value: 'starter', text: 'Starter' },
  { value: 'team', text: 'Team' },
  { value: 'business', text: 'Business' },
  { value: 'custom', text: 'Custom' },
];

const planItems = () =>
  PLANS.map((p) => <SelectItem key={p.value} value={p.value} text={p.text} />);

/** One field: its label, the select with its chevron, and its helper text. */
export const Default = {
  args: {
    id: 'select-default',
    labelText: 'Plan',
    helperText: 'You can change it later',
    defaultValue: 'team',
    frame: 'inset',
    variant: 'neutral',
    inline: false,
    disabled: false,
    readOnly: false,
    invalid: false,
    invalidText: 'Choose a plan',
    warn: false,
    warnText: 'This plan has a seat limit',
    messagePlacement: 'gap',
    statusBeat: false,
  },
  render: (args: SelectProps) => (
    <div style={form}>
      <Select {...args}>{planItems()}</Select>
    </div>
  ),
};

/** The four sizes: xs 24, sm 32, md 40 and lg 48px. */
export const Sizes = {
  render: () => (
    <div style={form}>
      {SIZES.map((size) => (
        <Select
          key={size}
          id={`select-size-${size}`}
          labelText={`Size ${size}`}
          defaultValue="team"
          size={size}>
          {planItems()}
        </Select>
      ))}
    </div>
  ),
};

/** Warning, error, disabled and read-only. Read-only takes focus but never opens. */
export const States = {
  render: () => (
    <div style={form}>
      <Select
        id="select-warn"
        labelText="Warning"
        defaultValue="starter"
        warn
        warnText="This plan has a seat limit">
        {planItems()}
      </Select>
      <Select
        id="select-invalid"
        labelText="Error"
        defaultValue=""
        invalid
        invalidText="Choose a plan">
        <SelectItem value="" text="Choose a plan" disabled hidden />
        {planItems()}
      </Select>
      <Select
        id="select-disabled"
        labelText="Disabled"
        defaultValue="team"
        helperText="Set by your administrator"
        disabled>
        {planItems()}
      </Select>
      <Select
        id="select-readonly"
        labelText="Read-only"
        defaultValue="team"
        readOnly>
        {planItems()}
      </Select>
    </div>
  ),
};

/** Groups and a disabled option. */
export const Groups = {
  render: () => (
    <div style={form}>
      <Select id="select-groups" labelText="Time zone" defaultValue="utc">
        <SelectItemGroup label="Common">
          <SelectItem value="utc" text="Coordinated universal time" />
          <SelectItem value="local" text="This device's time zone" />
        </SelectItemGroup>
        <SelectItemGroup label="Offsets">
          <SelectItem value="minus-5" text="UTC minus 5 hours" />
          <SelectItem value="plus-1" text="UTC plus 1 hour" />
          <SelectItem value="plus-9" text="UTC plus 9 hours" />
          <SelectItem value="plus-14" text="UTC plus 14 hours" disabled />
        </SelectItemGroup>
      </Select>
    </div>
  ),
};

/** Inline: the label beside a quiet field, with no fill or hairline until hover. The message sits beside it. */
export const Inline = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <Select
        id="select-inline"
        labelText="Rows per page"
        defaultValue="25"
        inline>
        {['10', '25', '50', '100'].map((n) => (
          <SelectItem key={n} value={n} text={n} />
        ))}
      </Select>
      <Select
        id="select-inline-warn"
        labelText="Sort"
        defaultValue="oldest"
        inline
        warn
        warnText="Oldest first is slower">
        <SelectItem value="newest" text="Newest first" />
        <SelectItem value="oldest" text="Oldest first" />
      </Select>
    </div>
  ),
};

/**
 * Change the value: no choice is an error, Starter is a warning, and any other
 * plan is fine. The message line swaps out then in, the status mark swaps, and
 * an error's border settles in. A choice is one act, so the status shows at
 * once.
 */
export const Validation = {
  render: function ValidationStory() {
    const [plan, setPlan] = useState('');
    return (
      <div style={form}>
        <Select
          id="select-validation"
          labelText="Plan"
          helperText="Every plan includes support"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          invalid={plan === ''}
          invalidText="Choose a plan to continue"
          warn={plan === 'starter'}
          warnText="Starter has a limit of three seats">
          <SelectItem value="" text="Choose a plan" />
          {planItems()}
        </Select>
      </div>
    );
  },
};

type Status = 'none' | 'warn' | 'error';

/** Set the status from outside: the message line, the mark and the border change without a new value. */
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
            Helper
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setStatus('warn')}>
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
          <Select
            id="select-status"
            labelText="Region"
            helperText="Where your data is stored"
            defaultValue="north"
            warn={status === 'warn'}
            warnText="This region is near capacity"
            invalid={status === 'error'}
            invalidText="This region is not available">
            <SelectItem value="north" text="North" />
            <SelectItem value="south" text="South" />
            <SelectItem value="east" text="East" />
            <SelectItem value="west" text="West" />
          </Select>
        </div>
      </div>
    );
  },
};

/** The select while its value loads: the label, field and chevron are drawn, and the value is a bar at the expected width. */
export const Skeleton = {
  render: () => (
    <div style={form}>
      <SelectSkeleton
        labelText="Plan"
        helperText="You can change it later"
        skeletonValue="Business"
      />
      <SelectSkeleton labelText="Region" size="lg" skeletonValue="North" />
    </div>
  ),
};
