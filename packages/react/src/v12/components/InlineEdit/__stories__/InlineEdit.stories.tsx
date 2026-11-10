/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Checkbox } from '@carbon-labs/react-checkbox';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { InlineEdit, InlineEditSizes } from '../index';
import type { InlineEditOption, InlineEditProps } from '../index';
import mdx from './InlineEdit.mdx';

export default {
  title: 'V12/InlineEdit',
  component: InlineEdit,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'content-swap-in-place',
        'layout-move',
        'mark-snap',
        'status-hand-off',
        'quiet-hover',
      ],
      reduced: {
        'content-swap-in-place': 'at-once',
        'layout-move': 'at-once',
        'mark-snap': 'at-once',
        'status-hand-off': 'at-once',
      },
      states: [
        'view',
        'edit',
        'saving',
        'saved',
        'invalid',
        'readOnly',
        'disabled',
      ],
    },
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['text', 'textarea', 'select'],
    },
    size: { control: 'inline-radio', options: InlineEditSizes },
    fit: { control: 'inline-radio', options: ['fill', 'content'] },
    corners: {
      control: 'inline-radio',
      options: ['rounded', 'full', 'square'],
    },
    labelText: { control: 'text' },
    placeholder: { control: 'text' },
    invalidText: { control: 'text' },
    reason: { control: 'text' },
    savedHold: { control: 'number' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    options: { control: false },
    renderValue: { control: false },
    validate: { control: false },
    onSave: { control: false },
    onCancel: { control: false },
    onChange: { control: false },
    onEditingChange: { control: false },
  },
};

/** A column of values, 24px apart. */
const form = {
  display: 'grid',
  gap: 24,
  maxInlineSize: 360,
};

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

const REGIONS: InlineEditOption[] = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
];

const wait = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/** A text value. Press it or its edit button, change it, then press Enter or Save. Escape cancels. */
export const Default = {
  args: {
    id: 'inline-edit-default',
    labelText: 'Project name',
    defaultValue: 'Northwind portal',
    type: 'text',
    size: 'md',
    fit: 'fill',
    corners: 'rounded',
    placeholder: 'Add a name',
    readOnly: false,
    disabled: false,
    invalid: false,
    savedHold: 1500,
    timeScale: 1,
  },
  render: (args: InlineEditProps) => (
    <div style={form}>
      <InlineEdit {...args} />
    </div>
  ),
};

/** Text, text area and select. */
export const Types = {
  render: () => (
    <div style={form}>
      <InlineEdit
        id="inline-edit-type-text"
        labelText="Title"
        defaultValue="Weekly status report"
      />
      <InlineEdit
        id="inline-edit-type-textarea"
        labelText="Description"
        type="textarea"
        defaultValue={'A summary of the week.\nShared with the whole team.'}
      />
      <InlineEdit
        id="inline-edit-type-select"
        labelText="Region"
        type="select"
        options={REGIONS}
        defaultValue="north"
      />
    </div>
  ),
};

/** The four sizes: xs, sm, md and lg, the field's sizes. */
export const Sizes = {
  render: () => (
    <div style={form}>
      {InlineEditSizes.map((size) => (
        <InlineEdit
          key={size}
          id={`inline-edit-size-${size}`}
          labelText={`Size ${size}`}
          defaultValue={`Size ${size}`}
          size={size}
        />
      ))}
    </div>
  ),
};

/** Fill takes the container's width. Content hugs the value, so the box moves to the field's size and back. */
export const Fit = {
  render: () => (
    <div style={form}>
      <InlineEdit
        id="inline-edit-fit-fill"
        labelText="Owner team"
        defaultValue="Design"
        fit="fill"
      />
      <InlineEdit
        id="inline-edit-fit-content"
        labelText="Owner team"
        defaultValue="Design"
        fit="content"
      />
    </div>
  ),
};

/** Save: the field closes at once, a spinner shows beside the new value, then a check that fades. Turn on Fail: the field reopens with the draft and the error. */
export const Saving = {
  render: function SavingStory() {
    const [fail, setFail] = useState(false);
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <Checkbox
          id="inlineedit-fail-the-next-save"
          labelText="Fail the next save"
          checked={fail}
          onChange={(_e, { checked }) => setFail(checked)}
        />
        <div style={form}>
          <InlineEdit
            id="inline-edit-saving"
            labelText="Display name"
            defaultValue="Team dashboard"
            onSave={async () => {
              await wait(1200);
              if (fail) {
                throw new Error('The server did not answer. Try again.');
              }
            }}
          />
          <InlineEdit
            id="inline-edit-saving-instant"
            labelText="Short name"
            defaultValue="dash"
            onSave={() => undefined}
          />
        </div>
      </div>
    );
  },
};

const NAME = /^[a-z0-9-]+$/i;

/** Clear the value or type a space, then save: the error shows and the field stays open. Fix it: the error goes on that keystroke. */
export const Validation = {
  render: () => (
    <div style={form}>
      <InlineEdit
        id="inline-edit-validation"
        labelText="Project key"
        defaultValue="north-portal"
        validate={(draft) =>
          draft === ''
            ? 'Enter a key'
            : NAME.test(draft)
              ? null
              : 'Use letters, numbers and dashes only'
        }
      />
    </div>
  ),
};

/** Read-only and disabled, each with its reason in a tooltip, an empty value with its placeholder, and an error from outside. */
export const States = {
  render: function StatesStory() {
    const [invalid, setInvalid] = useState(true);
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={row}>
          <Checkbox
            id="inlineedit-error-from-outside"
            labelText="Error from outside"
            checked={invalid}
            onChange={(_e, { checked }) => setInvalid(checked)}
          />
        </div>
        <div style={form}>
          <InlineEdit
            id="inline-edit-readonly"
            labelText="Account ID"
            defaultValue="ACC-20481"
            readOnly
            reason="Set when the account was created"
          />
          <InlineEdit
            id="inline-edit-disabled"
            labelText="Billing plan"
            defaultValue="Standard"
            disabled
            reason="Only an admin can change the plan"
          />
          <InlineEdit
            id="inline-edit-empty"
            labelText="Nickname"
            placeholder="Add a nickname"
          />
          <InlineEdit
            id="inline-edit-invalid"
            labelText="Contact address"
            defaultValue="team@example"
            invalid={invalid}
            invalidText="This address is already in use"
          />
        </div>
      </div>
    );
  },
};
