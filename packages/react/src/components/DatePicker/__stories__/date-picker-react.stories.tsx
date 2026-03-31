/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import '../components/date-picker.scss';
import { DatePicker, DatePickerInput } from '../index';
import { Layer } from '@carbon/react';

const sizes = {
  'Small (sm)': 'sm',
  'Medium (md)': 'md',
  'Large (lg)': 'lg',
} as const;

const defaultArgs = {
  dateFormat: 'm/d/Y',
  disabled: false,
  minDate: '',
  maxDate: '',
  readOnly: false,
  short: false,
  helperText: '',
  invalid: false,
  invalidText: '',
  warn: false,
  warnText: '',
  placeholder: 'mm/dd/yyyy',
  size: 'md' as const,
};

const controls = {
  dateFormat: {
    control: 'text',
    description: 'The date format (e.g., m/d/Y, Y-m-d).',
  },
  disabled: {
    control: 'boolean',
    description: 'Specify whether the date picker should be disabled.',
  },
  helperText: {
    control: 'text',
    description: 'Helper text to display below the input.',
  },
  invalid: {
    control: 'boolean',
    description: 'Specify if the currently value is invalid.',
  },
  invalidText: {
    control: 'text',
    description: 'Message which is displayed if the value is invalid.',
  },
  maxDate: {
    control: 'text',
    description:
      'The maximum date that a user can pick to (ISO format: YYYY-MM-DD).',
  },
  minDate: {
    control: 'text',
    description:
      'The minimum date that a user can start picking from (ISO format: YYYY-MM-DD).',
  },
  placeholder: {
    control: 'text',
    description: 'Placeholder text for the input field.',
  },
  readOnly: {
    control: 'boolean',
    description:
      'Whether the DatePicker is to be readOnly. If boolean, applies to all inputs; if array, applies to each input in order.',
  },
  short: {
    control: 'boolean',
    description: 'true to use the short version.',
  },
  size: {
    control: 'select',
    options: sizes,
    description: 'Specify the size of the input.',
  },
  warn: {
    control: 'boolean',
    description: 'Specify whether the control is currently in warning state.',
  },
  warnText: {
    control: 'text',
    description:
      'Provide the text that is displayed when the control is in warning state.',
  },
};

const meta: Meta = {
  title: 'Components/Date Picker',
  decorators: [
    (Story) => (
      <div style={{ padding: '3rem' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      controls: { exclude: ['calendar'] },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: { ...defaultArgs, datePickerType: 'single' },
  argTypes: {
    ...controls,
    datePickerType: {
      control: 'radio',
      options: { Single: 'single', Simple: 'simple', Range: 'range' },
      description: `The type of the date picker:
    <ul>
      <li><code>simple</code>
        <ul><li>Without calendar dropdown.</li></ul>
      </li>
      <li><code>single</code>
        <ul><li>With calendar dropdown and single date.</li></ul>
      </li>
      <li><code>range</code>
        <ul><li>With calendar dropdown and a date range.</li></ul>
      </li>
    </ul>`,
    },
  },
  render: function Render(args) {
    const {
      dateFormat,
      disabled,
      invalid,
      invalidText,
      datePickerType,
      maxDate,
      minDate,
      placeholder,
      readOnly,
      size,
      warn,
      warnText,
    } = args;

    return (
      <DatePicker
        dateFormat={dateFormat}
        disabled={disabled}
        maxDate={maxDate}
        minDate={minDate}
        readOnly={readOnly}
        datePickerType={datePickerType}
      >
        <DatePickerInput
          id="date-picker-input-id"
          placeholder={placeholder}
          labelText="Date Picker label"
          size={size}
          invalid={invalid}
          invalidText={invalidText}
          warn={warn}
          warnText={warnText}
        />
        {datePickerType === 'range' && (
          <DatePickerInput
            id="date-picker-input-id-2"
            placeholder={placeholder}
            labelText="End date"
            size={size}
            invalid={invalid}
            invalidText={invalidText}
            warn={warn}
            warnText={warnText}
          />
        )}
      </DatePicker>
    );
  },
};

export const RangeWithCalendar: Story = {
  args: defaultArgs,
  argTypes: controls,
  render: function Render(args) {
    const {
      dateFormat,
      disabled,
      invalid,
      invalidText,
      maxDate,
      minDate,
      placeholder,
      readOnly,
      size,
      warn,
      warnText,
    } = args;

    return (
      <DatePicker
        dateFormat={dateFormat}
        disabled={disabled}
        maxDate={maxDate}
        minDate={minDate}
        readOnly={readOnly}
        datePickerType="range"
      >
        <DatePickerInput
          id="date-picker-input-id-start"
          placeholder={placeholder}
          labelText="Start date"
          size={size}
          invalid={invalid}
          invalidText={invalidText}
          warn={warn}
          warnText={warnText}
        />
        <DatePickerInput
          id="date-picker-input-id-end"
          placeholder={placeholder}
          labelText="End date"
          size={size}
          invalid={invalid}
          invalidText={invalidText}
          warn={warn}
          warnText={warnText}
        />
      </DatePicker>
    );
  },
};

export const RangeWithCalendarWithLayer: Story = {
  args: defaultArgs,
  argTypes: controls,
  render: function Render(args) {
    const {
      dateFormat,
      disabled,
      invalid,
      invalidText,
      maxDate,
      minDate,
      placeholder,
      readOnly,
      size,
      warn,
      warnText,
    } = args;

    return (
      <Layer>
        <Layer>
          <Layer>
            <DatePicker
              dateFormat={dateFormat}
              disabled={disabled}
              maxDate={maxDate}
              minDate={minDate}
              readOnly={readOnly}
              datePickerType="range"
            >
              <DatePickerInput
                id="date-picker-input-id-start-layer"
                placeholder={placeholder}
                labelText="Start date"
                size={size}
                invalid={invalid}
                invalidText={invalidText}
                warn={warn}
                warnText={warnText}
              />
              <DatePickerInput
                id="date-picker-input-id-end-layer"
                placeholder={placeholder}
                labelText="End date"
                size={size}
                invalid={invalid}
                invalidText={invalidText}
                warn={warn}
                warnText={warnText}
              />
            </DatePicker>
          </Layer>
        </Layer>
      </Layer>
    );
  },
};

export const Simple: Story = {
  args: defaultArgs,
  argTypes: controls,
  render: function Render(args) {
    const {
      dateFormat,
      disabled,
      invalid,
      invalidText,
      maxDate,
      minDate,
      placeholder,
      readOnly,
      size,
      warn,
      warnText,
    } = args;

    return (
      <DatePicker
        dateFormat={dateFormat}
        maxDate={maxDate}
        minDate={minDate}
        datePickerType="simple"
      >
        <DatePickerInput
          id="date-picker-input-id"
          disabled={disabled}
          placeholder={placeholder}
          labelText="Date Picker label"
          readOnly={readOnly}
          size={size}
          invalid={invalid}
          invalidText={invalidText}
          warn={warn}
          warnText={warnText}
        />
      </DatePicker>
    );
  },
};

export const SimpleWithLayer: Story = {
  args: defaultArgs,
  argTypes: controls,
  render: function Render(args) {
    const {
      dateFormat,
      disabled,
      invalid,
      invalidText,
      maxDate,
      minDate,
      placeholder,
      readOnly,
      size,
      warn,
      warnText,
    } = args;

    return (
      <Layer>
        <Layer>
          <Layer>
            <DatePicker
              dateFormat={dateFormat}
              maxDate={maxDate}
              minDate={minDate}
              datePickerType="simple"
            >
              <DatePickerInput
                id="date-picker-input-id-simple-layer"
                disabled={disabled}
                placeholder={placeholder}
                labelText="Date Picker label"
                readOnly={readOnly}
                size={size}
                invalid={invalid}
                invalidText={invalidText}
                warn={warn}
                warnText={warnText}
              />
            </DatePicker>
          </Layer>
        </Layer>
      </Layer>
    );
  },
};

export const SingleWithCalendar: Story = {
  args: defaultArgs,
  argTypes: controls,
  render: function Render(args) {
    const {
      dateFormat,
      disabled,
      invalid,
      invalidText,
      maxDate,
      minDate,
      placeholder,
      readOnly,
      size,
      warn,
      warnText,
    } = args;

    return (
      <DatePicker
        dateFormat={dateFormat}
        disabled={disabled}
        maxDate={maxDate}
        minDate={minDate}
        readOnly={readOnly}
        datePickerType="single"
      >
        <DatePickerInput
          id="date-picker-input-id"
          placeholder={placeholder}
          labelText="Date Picker label"
          size={size}
          invalid={invalid}
          invalidText={invalidText}
          warn={warn}
          warnText={warnText}
        />
      </DatePicker>
    );
  },
};

export const SingleWithCalendarWithLayer: Story = {
  args: defaultArgs,
  argTypes: controls,
  render: function Render(args) {
    const {
      dateFormat,
      disabled,
      invalid,
      invalidText,
      maxDate,
      minDate,
      placeholder,
      readOnly,
      size,
      warn,
      warnText,
    } = args;

    return (
      <Layer>
        <Layer>
          <Layer>
            <DatePicker
              dateFormat={dateFormat}
              disabled={disabled}
              maxDate={maxDate}
              minDate={minDate}
              readOnly={readOnly}
              datePickerType="single"
            >
              <DatePickerInput
                id="date-picker-input-id-single-layer"
                placeholder={placeholder}
                labelText="Date Picker label"
                size={size}
                invalid={invalid}
                invalidText={invalidText}
                warn={warn}
                warnText={warnText}
              />
            </DatePicker>
          </Layer>
        </Layer>
      </Layer>
    );
  },
};

export const Skeleton: Story = {
  args: { hideLabel: false, range: true },
  argTypes: {
    hideLabel: {
      control: 'boolean',
      description: 'Specify whether the label should be hidden, or not',
    },
    range: {
      control: 'boolean',
      description: 'Specify whether the skeleton should be of range date picker.',
    },
  },
  render: function Render(args) {
    const { hideLabel, range } = args;
    
    return (
      <div>
        <div className="cds--form-item">
          {!hideLabel && (
            <label className="cds--label cds--skeleton" style={{ width: '75px', height: '14px' }} />
          )}
          <div className="cds--date-picker cds--date-picker--single cds--skeleton">
            <div className="cds--date-picker-container">
              <div className="cds--date-picker-input__wrapper">
                <input className="cds--date-picker__input cds--skeleton" type="text" disabled />
                <svg className="cds--date-picker__icon cds--skeleton" width="16" height="16">
                  <rect width="16" height="16" />
                </svg>
              </div>
            </div>
          </div>
          {range && (
            <div className="cds--date-picker cds--date-picker--single cds--skeleton">
              <div className="cds--date-picker-container">
                <div className="cds--date-picker-input__wrapper">
                  <input className="cds--date-picker__input cds--skeleton" type="text" disabled />
                  <svg className="cds--date-picker__icon cds--skeleton" width="16" height="16">
                    <rect width="16" height="16" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    percy: {
      skip: true,
    },
  },
};

export const WithAILabel: Story = {
  args: defaultArgs,
  argTypes: controls,
  render: function Render(args) {
    const {
      dateFormat,
      disabled,
      invalid,
      invalidText,
      maxDate,
      minDate,
      placeholder,
      readOnly,
      size,
      warn,
      warnText,
    } = args;

    return (
      <DatePicker
        dateFormat={dateFormat}
        disabled={disabled}
        maxDate={maxDate}
        minDate={minDate}
        readOnly={readOnly}
        datePickerType="single"
      >
        <DatePickerInput
          id="date-picker-input-id-ai"
          placeholder={placeholder}
          labelText="Date Picker label"
          size={size}
          invalid={invalid}
          invalidText={invalidText}
          warn={warn}
          warnText={warnText}
        >
          <div slot="slug" style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1L10.5 6L16 7L12 11L13 16L8 13.5L3 16L4 11L0 7L5.5 6L8 1Z" fill="currentColor"/>
            </svg>
          </div>
        </DatePickerInput>
      </DatePicker>
    );
  },
};

// Made with Bob
