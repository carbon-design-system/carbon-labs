/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { RadioButton, RadioButtonGroup } from '@carbon-labs/react-radio-button';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import {
  ComboBox,
  ComboBoxSkeleton,
  Dropdown,
  DropdownSkeleton,
  FilterableMultiSelect,
  MultiSelect,
  MultiSelectSkeleton,
} from '../index';
import type { DropdownProps, ListboxSize, SelectionFeedback } from '../index';
import mdx from './Dropdown.mdx';

const SIZES: ListboxSize[] = ['xs', 'sm', 'md', 'lg'];

export default {
  title: 'V12/Dropdown',
  component: Dropdown,
  subcomponents: {
    ComboBox,
    MultiSelect,
    FilterableMultiSelect,
    DropdownSkeleton,
    ComboBoxSkeleton,
    MultiSelectSkeleton,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'snap',
        'fold',
        'highlight',
        'press',
        'chevron',
        'filter',
        'typing-burst',
        'reorder',
        'count-tag',
        'check',
        'soft-edge',
        'outline-ladder',
        'error-border',
        'message-line',
        'status-mark',
        'late-status',
      ],
      reduced: {
        snap: 'at-once',
        fold: 'at-once',
        highlight: 'shorter-clock',
        filter: 'shorter-clock',
        reorder: 'shorter-clock',
        'count-tag': 'at-once',
        check: 'at-once',
        'outline-ladder': 'shorter-clock',
        'error-border': 'shorter-clock',
        'message-line': 'at-once',
        'status-mark': 'at-once',
        'late-status': 'full',
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
    type: { control: 'inline-radio', options: ['default', 'inline'] },
    direction: { control: 'inline-radio', options: ['bottom', 'top'] },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    titleText: { control: 'text' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    invalidText: { control: 'text' },
    warnText: { control: 'text' },
    itemToString: { control: false },
    itemToElement: { control: false },
    renderSelectedItem: { control: false },
    decorator: { control: false },
    slug: { control: false },
    aiText: { control: false },
  },
};

/** A column of fields, 32px apart, with room under the last for its open list. */
const form = {
  display: 'grid',
  gap: 32,
  maxInlineSize: 320,
  paddingBlockEnd: 280,
};

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

interface Region {
  id: string;
  label: string;
  disabled?: boolean;
  isSelectAll?: boolean;
}

const REGIONS: Region[] = [
  { id: 'north', label: 'North' },
  { id: 'south', label: 'South' },
  { id: 'east', label: 'East' },
  { id: 'west', label: 'West' },
  { id: 'central', label: 'Central' },
  { id: 'coastal', label: 'Coastal' },
  { id: 'highlands', label: 'Highlands' },
  { id: 'islands', label: 'Islands', disabled: true },
];

const ALL: Region = { id: 'all', label: 'All regions', isSelectAll: true };

/** The Dropdown: press the field to open its list, then choose one option. */
export const Default = {
  args: {
    id: 'dropdown-default',
    titleText: 'Region',
    label: 'Choose a region',
    helperText: 'Where your data is stored',
    items: REGIONS,
    frame: 'inset',
    type: 'default',
    direction: 'bottom',
    disabled: false,
    readOnly: false,
    invalid: false,
    invalidText: 'Choose a region',
    warn: false,
    warnText: 'This region is near capacity',
    shadow: false,
    timeScale: 1,
  },
  render: (args: DropdownProps<Region>) => (
    <div style={form}>
      <Dropdown {...args} />
    </div>
  ),
};

/** The ComboBox: type to filter the list. Leaving the field chooses an exact match, or puts the text back. */
export const ComboBoxForm = {
  name: 'ComboBox',
  render: () => (
    <div style={form}>
      <ComboBox
        id="combo-box"
        titleText="Region"
        placeholder="Type a region"
        helperText="Type to filter"
        items={REGIONS}
      />
      <ComboBox
        id="combo-box-custom"
        titleText="Team"
        placeholder="Type or choose a team"
        helperText="A new name is kept"
        items={['Design', 'Research', 'Platform', 'Support']}
        allowCustomValue
      />
    </div>
  ),
};

/** The MultiSelect: the list stays open while you choose. The count tag snaps in with the first choice. */
export const MultiSelectForm = {
  name: 'MultiSelect',
  render: () => (
    <div style={form}>
      <MultiSelect
        id="multi-select"
        titleText="Regions"
        label="Choose regions"
        helperText="Choose one or more"
        items={[ALL, ...REGIONS]}
        initialSelectedItems={REGIONS.slice(1, 2)}
      />
    </div>
  ),
};

/** The FilterableMultiSelect: type to filter, and choose many. */
export const FilterableMultiSelectForm = {
  name: 'FilterableMultiSelect',
  render: () => (
    <div style={form}>
      <FilterableMultiSelect
        id="filterable-multi-select"
        titleText="Regions"
        placeholder="Filter regions"
        helperText="Type to filter, choose one or more"
        items={[ALL, ...REGIONS]}
      />
    </div>
  ),
};

const FEEDBACK: SelectionFeedback[] = ['top-after-reopen', 'top', 'fixed'];

/** Where chosen items sort while open. With `top`, a choice goes out, the list makes room at the top, and it comes back in there. */
export const SelectionOrder = {
  render: function SelectionOrderStory() {
    const [feedback, setFeedback] = useState<SelectionFeedback>('top');
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={row}>
          <RadioButtonGroup
            name="selection-feedback"
            legendText="Selection feedback"
            orientation="horizontal"
            valueSelected={feedback}
            onChange={(v) => setFeedback(v as SelectionFeedback)}>
            {FEEDBACK.map((f) => (
              <RadioButton
                key={f}
                value={f}
                id={`selection-feedback-${f}`}
                labelText={f}
              />
            ))}
          </RadioButtonGroup>
        </div>
        <div style={form}>
          <MultiSelect
            key={feedback}
            id="multi-select-feedback"
            titleText="Regions"
            label="Choose regions"
            items={REGIONS}
            selectionFeedback={feedback}
          />
        </div>
      </div>
    );
  },
};

/** The four sizes: xs 24, sm 32, md 40 and lg 48px. */
export const Sizes = {
  render: () => (
    <div style={form}>
      {SIZES.map((size) => (
        <Dropdown
          key={size}
          id={`dropdown-size-${size}`}
          titleText={`Size ${size}`}
          label="Choose a region"
          items={REGIONS}
          initialSelectedItem={REGIONS[0]}
          size={size}
        />
      ))}
    </div>
  ),
};

/** Warning, error, disabled and read-only, on each form. */
export const States = {
  render: () => (
    <div style={form}>
      <Dropdown
        id="dropdown-warn"
        titleText="Warning"
        label="Choose a region"
        items={REGIONS}
        initialSelectedItem={REGIONS[2]}
        warn
        warnText="This region is near capacity"
      />
      <ComboBox
        id="combo-box-invalid"
        titleText="Error"
        placeholder="Type a region"
        items={REGIONS}
        invalid
        invalidText="Choose a region"
        lateErrors={false}
      />
      <MultiSelect
        id="multi-select-disabled"
        titleText="Disabled"
        label="Choose regions"
        items={REGIONS}
        initialSelectedItems={REGIONS.slice(0, 2)}
        disabled
      />
      <MultiSelect
        id="multi-select-readonly"
        titleText="Read-only"
        label="Choose regions"
        items={REGIONS}
        initialSelectedItems={REGIONS.slice(0, 2)}
        readOnly
      />
      <Dropdown
        id="dropdown-readonly"
        titleText="Read-only"
        label="Choose a region"
        items={REGIONS}
        initialSelectedItem={REGIONS[0]}
        readOnly
      />
    </div>
  ),
};

type Status = 'none' | 'warn' | 'error';

/** Set the status from outside: the message line swaps out then in, the mark swaps, and an error's border settles in. */
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
          <Dropdown
            id="dropdown-status"
            titleText="Region"
            label="Choose a region"
            helperText="Where your data is stored"
            items={REGIONS}
            initialSelectedItem={REGIONS[0]}
            warn={status === 'warn'}
            warnText="This region is near capacity"
            invalid={status === 'error'}
            invalidText="This region is not available"
          />
        </div>
      </div>
    );
  },
};

/** Inline: the label beside a quiet field, with no fill or hairline until hover. The list hugs its options. */
export const Inline = {
  render: () => (
    <div style={{ display: 'grid', gap: 32, paddingBlockEnd: 280 }}>
      <Dropdown
        id="dropdown-inline"
        titleText="Sort"
        label="Choose an order"
        type="inline"
        items={['Newest first', 'Oldest first', 'Name', 'Size']}
        initialSelectedItem="Newest first"
      />
      <MultiSelect
        id="multi-select-inline"
        titleText="Show"
        label="Kinds"
        type="inline"
        items={['Files', 'Folders', 'Links', 'Shortcuts']}
      />
    </div>
  ),
};

/** The three corners. A pill field opens a fully rounded list. */
export const Corners = {
  render: () => (
    <div style={form}>
      {(['rounded', 'full', 'square'] as const).map((corners) => (
        <Dropdown
          key={corners}
          id={`dropdown-corners-${corners}`}
          titleText={`Corners ${corners}`}
          label="Choose a region"
          items={REGIONS}
          corners={corners}
        />
      ))}
    </div>
  ),
};

/** The forms while their values load: the label, field and chevron are drawn, and the value is a bar. */
export const Skeleton = {
  render: () => (
    <div style={{ ...form, paddingBlockEnd: 32 }}>
      <DropdownSkeleton titleText="Region" skeletonValue="Highlands" />
      <ComboBoxSkeleton titleText="Team" skeletonValue="Platform" />
      <MultiSelectSkeleton titleText="Regions" skeletonValue="Choose regions" />
    </div>
  ),
};
