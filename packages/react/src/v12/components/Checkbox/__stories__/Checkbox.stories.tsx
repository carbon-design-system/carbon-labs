/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Checkbox, CheckboxGroup, CheckboxSkeleton } from '../index';
import type { CheckboxProps } from '../index';
import mdx from './Checkbox.mdx';

export default {
  title: 'V12/Checkbox',
  component: Checkbox,
  subcomponents: { CheckboxGroup, CheckboxSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'check',
        'uncheck',
        'mixed',
        'hover',
        'press',
        'status-ring',
        'message-line',
      ],
      reduced: {
        check: 'at-once',
        uncheck: 'at-once',
        mixed: 'at-once',
        hover: 'at-once',
        press: 'at-once',
        'status-ring': 'at-once',
        'message-line': 'at-once',
      },
      states: [
        'rest',
        'checked',
        'indeterminate',
        'disabled',
        'readOnly',
        'invalid',
        'warn',
      ],
    },
  },
  argTypes: {
    labelText: { control: 'text' },
    helperText: { control: 'text' },
    invalidText: { control: 'text' },
    warnText: { control: 'text' },
    disabledReason: { control: 'text' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
  },
};

const column = { display: 'grid', gap: 16, justifyItems: 'start' };

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** One checkbox: the box, its label and its helper text. */
export const Default = {
  args: {
    id: 'checkbox-default',
    labelText: 'Email me a weekly summary',
    helperText: 'Sent on Mondays',
    indeterminate: false,
    disabled: false,
    readOnly: false,
    hideLabel: false,
    invalid: false,
    invalidText: 'Choose at least one option',
    warn: false,
    warnText: 'Summaries go to every member of the team',
    timeScale: 1,
  },
  render: (args: CheckboxProps) => <Checkbox {...args} />,
};

/** CheckboxGroup: several checkboxes under one legend, stacked by default. */
export const Group = {
  render: () => (
    <CheckboxGroup
      legendText="Notifications"
      helperText="Choose where alerts reach you">
      <Checkbox id="checkbox-group-email" labelText="Email" defaultChecked />
      <Checkbox id="checkbox-group-sms" labelText="Text message" />
      <Checkbox id="checkbox-group-push" labelText="Push notification" />
    </CheckboxGroup>
  ),
};

/** A group in a row: `orientation="horizontal"`. */
export const Horizontal = {
  render: () => (
    <CheckboxGroup legendText="Regions" orientation="horizontal">
      <Checkbox id="checkbox-row-north" labelText="North" defaultChecked />
      <Checkbox id="checkbox-row-south" labelText="South" />
      <Checkbox id="checkbox-row-east" labelText="East" defaultChecked />
      <Checkbox id="checkbox-row-west" labelText="West" />
    </CheckboxGroup>
  ),
};

/** Off, on, mixed, disabled, read-only, warning and error. */
export const States = {
  render: () => (
    <div style={column}>
      <Checkbox id="checkbox-state-off" labelText="Off" />
      <Checkbox id="checkbox-state-on" labelText="On" defaultChecked />
      <Checkbox id="checkbox-state-mixed" labelText="Mixed" indeterminate />
      <Checkbox id="checkbox-state-disabled" labelText="Disabled" disabled />
      <Checkbox
        id="checkbox-state-disabled-on"
        labelText="Disabled, on"
        disabled
        defaultChecked
      />
      <Checkbox id="checkbox-state-readonly" labelText="Read-only" readOnly />
      <Checkbox
        id="checkbox-state-readonly-on"
        labelText="Read-only, on"
        readOnly
        defaultChecked
      />
      <Checkbox
        id="checkbox-state-warn"
        labelText="Warning"
        warn
        warnText="This shares your files with everyone in the team"
      />
      <Checkbox
        id="checkbox-state-invalid"
        labelText="Error"
        invalid
        invalidText="Accept the terms to continue"
      />
      <Checkbox id="checkbox-state-hidden" labelText="Hidden label" hideLabel />
    </div>
  ),
};

const FILES = ['report.pdf', 'budget.xlsx', 'notes.txt', 'photo.png'];

/** Select all: check the files one by one and the parent turns mixed, then on. Check the parent to take them all, or none. */
export const SelectAll = {
  render: function SelectAllStory() {
    const [chosen, setChosen] = useState<string[]>(['budget.xlsx']);
    const all = chosen.length === FILES.length;
    const some = chosen.length > 0 && !all;
    return (
      <CheckboxGroup legendText="Files">
        <Checkbox
          id="checkbox-select-all"
          labelText="Select all"
          checked={all}
          indeterminate={some}
          onChange={() => setChosen(all ? [] : FILES)}
        />
        <div style={{ display: 'grid', gap: 8, paddingInlineStart: 24 }}>
          {FILES.map((file) => (
            <Checkbox
              key={file}
              id={`checkbox-select-${file}`}
              labelText={file}
              checked={chosen.includes(file)}
              onChange={(_, { checked }) =>
                setChosen((c) =>
                  checked ? [...c, file] : c.filter((f) => f !== file)
                )
              }
            />
          ))}
        </div>
      </CheckboxGroup>
    );
  },
};

type Status = 'none' | 'warn' | 'error';

/** Change the status: the ring changes color and the message line swaps out, then in. */
export const StatusChange = {
  render: function StatusChangeStory() {
    const [status, setStatus] = useState<Status>('none');
    return (
      <div style={column}>
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
        <Checkbox
          id="checkbox-status-change"
          labelText="Share with the whole team"
          helperText="Members can view and comment"
          warn={status === 'warn'}
          warnText="Members outside your group will see it"
          invalid={status === 'error'}
          invalidText="Sharing is turned off for this project"
        />
      </div>
    );
  },
};

/** `disabledReason`: the checkbox stays focusable and says why it is disabled in a tooltip on hover and focus. */
export const DisabledReason = {
  render: () => (
    <Checkbox
      id="checkbox-disabled-reason"
      labelText="Back up every night"
      disabled
      disabledReason="Backups need a storage plan"
    />
  ),
};

/** CheckboxSkeleton: the box as a block. Without a label, the box and a typical label are one bar. */
export const Skeleton = {
  render: () => (
    <div style={column}>
      <CheckboxSkeleton labelText="Email me a weekly summary" />
      <CheckboxSkeleton />
    </div>
  ),
};
