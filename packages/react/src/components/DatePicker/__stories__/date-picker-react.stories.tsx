/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker, DatePickerInput } from '../index';
import '../components/date-picker.scss';

/**
 * Date picker component for React
 *
 * ## Overview
 * The DatePicker component allows users to select dates using a calendar interface.
 * It maintains 100% backwards compatibility with Carbon React v11 API while using
 * a modern state machine architecture shared with Web Components.
 *
 * ## Features
 * - Single date selection
 * - Date range selection
 * - Simple mode (no calendar)
 * - Min/max date constraints
 * - Validation states (invalid, warn)
 * - Keyboard navigation
 * - Accessibility compliant
 * - Shared state machine with Web Components
 *
 * ## Usage
 * ```tsx
 * import { DatePicker, DatePickerInput } from '@carbon/web-components/date-picker/react';
 *
 * function MyComponent() {
 *   return (
 *     <DatePicker datePickerType="single" onChange={(dates) => console.log(dates)}>
 *       <DatePickerInput
 *         id="date-picker-single"
 *         placeholder="mm/dd/yyyy"
 *         labelText="Date Picker label"
 *       />
 *     </DatePicker>
 *   );
 * }
 * ```
 */
const meta: Meta = {
  title: 'Components/Date Picker',
  parameters: {
    component: 'DatePicker',
    docs: {
      description: {
        component: 'Date picker component for selecting dates with a calendar interface.',
      },
    },
  },
  argTypes: {
    datePickerType: {
      control: 'select',
      options: ['simple', 'single', 'range'],
      description: 'The type of date picker',
      table: {
        defaultValue: { summary: 'single' },
      },
    },
    dateFormat: {
      control: 'text',
      description: 'The date format string (Flatpickr-compatible)',
      table: {
        defaultValue: { summary: 'm/d/Y' },
      },
    },
    minDate: {
      control: 'text',
      description: 'Minimum selectable date (mm/dd/yyyy format)',
    },
    maxDate: {
      control: 'text',
      description: 'Maximum selectable date (mm/dd/yyyy format)',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the picker is read-only',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    light: {
      control: 'boolean',
      description: 'Whether to use the light variant',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    short: {
      control: 'boolean',
      description: 'Whether to use the short variant',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    allowInput: {
      control: 'boolean',
      description: 'Whether to allow manual input',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    closeOnSelect: {
      control: 'boolean',
      description: 'Whether to close calendar on date selection',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

/**
 * Default single date picker with calendar
 */
export const Default: Story = {
  args: {
    datePickerType: 'single',
  },
  render: function Render(args) {
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    return (
      <div>
        <DatePicker
          {...args}
          onChange={(dates) => {
            setSelectedDates(dates);
            console.log('Selected dates:', dates);
          }}
        >
          <DatePickerInput
            id="date-picker-single"
            placeholder="mm/dd/yyyy"
            labelText="Date Picker label"
            size="md"
          />
        </DatePicker>
        {selectedDates.length > 0 && (
          <div className="selected-date-display">
            <strong>Selected date:</strong> {selectedDates[0].toLocaleDateString()}
          </div>
        )}
      </div>
    );
  },
};

/**
 * Simple date picker without calendar (manual input only)
 */
export const Simple: Story = {
  args: {
    datePickerType: 'simple',
  },
  render: (args) => (
    <DatePicker {...args}>
      <DatePickerInput
        id="date-picker-simple"
        placeholder="mm/dd/yyyy"
        labelText="Date Picker label"
        helperText="Enter date manually"
      />
    </DatePicker>
  ),
};

/**
 * Date range picker with start and end dates
 */
export const RangeWithCalendar: Story = {
  args: {
    datePickerType: 'range',
  },
  render: function Render(args) {
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    return (
      <div>
        <DatePicker
          {...args}
          onChange={(dates) => {
            setSelectedDates(dates);
            console.log('Selected range:', dates);
          }}
        >
          <DatePickerInput
            id="date-picker-start"
            placeholder="mm/dd/yyyy"
            labelText="Start date"
          />
          <DatePickerInput
            id="date-picker-end"
            placeholder="mm/dd/yyyy"
            labelText="End date"
          />
        </DatePicker>
        {selectedDates.length === 2 && (
          <div className="selected-date-display">
            <strong>Selected range:</strong>{' '}
            {selectedDates[0].toLocaleDateString()} -{' '}
            {selectedDates[1].toLocaleDateString()}
          </div>
        )}
      </div>
    );
  },
};

/**
 * Date picker with min and max date constraints
 */
export const WithMinMax: Story = {
  args: {
    datePickerType: 'single',
    minDate: '01/01/2024',
    maxDate: '12/31/2024',
  },
  render: (args) => (
    <DatePicker {...args}>
      <DatePickerInput
        id="date-picker-minmax"
        placeholder="mm/dd/yyyy"
        labelText="Date Picker (2024 only)"
        helperText="Only dates in 2024 are selectable"
      />
    </DatePicker>
  ),
};

/**
 * Date picker with validation states
 */
export const WithValidation: Story = {
  render: () => (
    <div className="story-container">
      {/* Invalid state */}
      <DatePicker datePickerType="single">
        <DatePickerInput
          id="date-picker-invalid"
          placeholder="mm/dd/yyyy"
          labelText="Invalid date"
          invalid
          invalidText="Please enter a valid date"
        />
      </DatePicker>

      {/* Warning state */}
      <DatePicker datePickerType="single">
        <DatePickerInput
          id="date-picker-warn"
          placeholder="mm/dd/yyyy"
          labelText="Date with warning"
          warn
          warnText="This date is in the past"
        />
      </DatePicker>

      {/* With helper text */}
      <DatePicker datePickerType="single">
        <DatePickerInput
          id="date-picker-helper"
          placeholder="mm/dd/yyyy"
          labelText="Date with helper text"
          helperText="Select your preferred date"
        />
      </DatePicker>
    </div>
  ),
};

/**
 * Date picker with different sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="story-container">
      {/* Small */}
      <DatePicker datePickerType="single">
        <DatePickerInput
          id="date-picker-sm"
          placeholder="mm/dd/yyyy"
          labelText="Small size"
          size="sm"
        />
      </DatePicker>

      {/* Medium (default) */}
      <DatePicker datePickerType="single">
        <DatePickerInput
          id="date-picker-md"
          placeholder="mm/dd/yyyy"
          labelText="Medium size (default)"
          size="md"
        />
      </DatePicker>

      {/* Large */}
      <DatePicker datePickerType="single">
        <DatePickerInput
          id="date-picker-lg"
          placeholder="mm/dd/yyyy"
          labelText="Large size"
          size="lg"
        />
      </DatePicker>
    </div>
  ),
};

/**
 * Date picker with light theme
 */
export const LightTheme: Story = {
  args: {
    datePickerType: 'single',
    light: true,
  },
  render: (args) => (
    <div className="light-theme-container">
      <DatePicker {...args}>
        <DatePickerInput
          id="date-picker-light"
          placeholder="mm/dd/yyyy"
          labelText="Light theme date picker"
        />
      </DatePicker>
    </div>
  ),
};

/**
 * Date picker with short variant
 */
export const ShortVariant: Story = {
  args: {
    datePickerType: 'single',
    short: true,
  },
  render: (args) => (
    <DatePicker {...args}>
      <DatePickerInput
        id="date-picker-short"
        placeholder="mm/dd/yyyy"
        labelText="Short variant"
      />
    </DatePicker>
  ),
};

/**
 * Read-only date picker
 */
export const ReadOnly: Story = {
  args: {
    datePickerType: 'single',
    readOnly: true,
  },
  render: (args) => (
    <DatePicker {...args}>
      <DatePickerInput
        id="date-picker-readonly"
        placeholder="mm/dd/yyyy"
        labelText="Read-only date picker"
        value="03/30/2026"
      />
    </DatePicker>
  ),
};

/**
 * Disabled date picker
 */
export const Disabled: Story = {
  render: () => (
    <DatePicker datePickerType="single">
      <DatePickerInput
        id="date-picker-disabled"
        placeholder="mm/dd/yyyy"
        labelText="Disabled date picker"
        disabled
      />
    </DatePicker>
  ),
};

/**
 * Controlled date picker example
 */
export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = useState('');

    return (
      <div>
        <DatePicker
          datePickerType="single"
          onChange={(dates) => {
            if (dates.length > 0) {
              const date = dates[0];
              setValue(
                `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
                  .getDate()
                  .toString()
                  .padStart(2, '0')}/${date.getFullYear()}`
              );
            }
          }}
        >
          <DatePickerInput
            id="date-picker-controlled"
            placeholder="mm/dd/yyyy"
            labelText="Controlled date picker"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </DatePicker>
        <div className="button-group">
          <button
            type="button"
            onClick={() => setValue('12/25/2024')}
          >
            Set to Christmas 2024
          </button>
          <button
            type="button"
            onClick={() => setValue('')}
          >
            Clear
          </button>
        </div>
      </div>
    );
  },
};

/**
 * Date picker with custom date format
 */
export const CustomFormat: Story = {
  args: {
    datePickerType: 'single',
    dateFormat: 'Y-m-d',
  },
  render: (args) => (
    <DatePicker {...args}>
      <DatePickerInput
        id="date-picker-format"
        placeholder="yyyy-mm-dd"
        labelText="ISO format (YYYY-MM-DD)"
        helperText="Using Y-m-d format"
      />
    </DatePicker>
  ),
};

// Made with Bob
