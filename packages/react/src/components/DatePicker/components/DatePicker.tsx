/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Children, cloneElement, isValidElement, useRef } from 'react';
import classNames from 'classnames';
import { useDatePicker } from '../hooks/useDatePicker';
import { Calendar } from './Calendar';
import type { DatePickerInputProps } from './DatePickerInput';

/**
 * Format Temporal.PlainDate to MM/DD/YYYY string
 */
function formatDate(date: Temporal.PlainDate | null): string {
  if (!date) {
    return '';
  }
  const month = String(date.month).padStart(2, '0');
  const day = String(date.day).padStart(2, '0');
  const year = String(date.year);
  return `${month}/${day}/${year}`;
}

/**
 * DatePicker component props
 * Maintains 100% backwards compatibility with Carbon React v11 API
 */
export interface DatePickerProps {
  /**
   * The type of date picker (Carbon API uses datePickerType, not mode)
   */
  datePickerType?: 'simple' | 'single' | 'range';

  /**
   * The date format string (Flatpickr-compatible format)
   */
  dateFormat?: string;

  /**
   * Minimum selectable date (mm/dd/yyyy format - Carbon API)
   */
  minDate?: string;

  /**
   * Maximum selectable date (mm/dd/yyyy format - Carbon API)
   */
  maxDate?: string;

  /**
   * Locale for date formatting
   */
  locale?: string;

  /**
   * Whether the picker is read-only (Carbon uses readOnly, not readonly)
   */
  readOnly?: boolean;

  /**
   * Whether to use the light variant
   */
  light?: boolean;

  /**
   * Whether to use the short variant
   */
  short?: boolean;

  /**
   * Whether to allow manual input
   */
  allowInput?: boolean;

  /**
   * Whether to close calendar on date selection
   */
  closeOnSelect?: boolean;

  /**
   * Change handler - receives array of Date objects (Carbon API)
   */
  onChange?: (dates: Date[]) => void;

  /**
   * Close handler
   */
  onClose?: () => void;

  /**
   * Open handler
   */
  onOpen?: () => void;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Children (DatePickerInput components)
   */
  children?: React.ReactNode;

  /**
   * Initial value
   */
  value?: string;

  /**
   * Append the calendar to a specific element
   */
  appendTo?: HTMLElement;
}

/**
 * DatePicker component
 * Main wrapper component that orchestrates date picker functionality
 * Maintains 100% backwards compatibility with Carbon React v11
 */
export function DatePicker({
  datePickerType = 'single',
  dateFormat = 'm/d/Y',
  minDate,
  maxDate,
  locale = 'en',
  readOnly = false,
  light = false,
  short = false,
  allowInput = true,
  closeOnSelect = true,
  onChange,
  onClose,
  onOpen,
  className,
  children,
  value,
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use Carbon's standard 'cds' prefix to match Carbon's date-picker styles
  const prefix = 'cds';

  // Use the date picker hook
  const {
    context,
    isOpen,
    selectDate,
    openCalendar,
    closeCalendar,
    handleInputFocus,
    handleInputBlur,
    handleInputChange,
    send,
    startInputRef,
    endInputRef,
    calendarRef,
  } = useDatePicker({
    datePickerType,
    value,
    minDate,
    maxDate,
    dateFormat,
    allowInput,
    closeOnSelect,
    readOnly,
    locale,
    onChange,
    onOpen,
    onClose,
  });

  // Handle calendar navigation
  const handleNavigate = (eventType: string) => {
    send(eventType);
  };

  // Handle calendar icon click - toggle calendar open/close
  const handleIconClick = () => {
    if (isOpen) {
      closeCalendar();
    } else {
      openCalendar();
    }
  };

  // Clone children and inject props
  const childArray = Children.toArray(children);
  const enhancedChildren = childArray.map((child, index) => {
    if (!isValidElement<DatePickerInputProps>(child)) {
      return child;
    }

    // Determine which input this is (start or end for range mode)
    const isStartInput = index === 0;
    const isEndInput = index === 1 && datePickerType === 'range';

    // Get the appropriate ref
    const inputRef = isStartInput ? startInputRef : isEndInput ? endInputRef : undefined;

    // Get the appropriate value - always use a string to keep input controlled
    let inputValue = child.props.value ?? '';
    if (inputValue === '') {
      if (isStartInput && context.startDate) {
        inputValue = formatDate(context.startDate);
      } else if (isEndInput && context.endDate) {
        inputValue = formatDate(context.endDate);
      }
    }

    // Clone the child with enhanced props
    const enhancedProps: Partial<DatePickerInputProps> = {
      ...child.props,
      value: inputValue, // Always a string, never undefined
      disabled: child.props.disabled || context.isDisabled,
      readOnly: child.props.readOnly || readOnly,
      onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
        child.props.onFocus?.(e);
        handleInputFocus(isEndInput ? 'to' : 'from');
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        child.props.onBlur?.(e);
        handleInputBlur();
      },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        child.props.onChange?.(e);
        handleInputChange(e.target.value, isEndInput ? 'to' : 'from');
      },
      onIconClick: () => {
        child.props.onIconClick?.();
        handleIconClick();
      },
      hideIcon: datePickerType === 'simple' || child.props.hideIcon,
    };

    // Wrap each input in a container div with proper Carbon classes
    const containerClasses = classNames(`${prefix}--date-picker-container`, {
      [`${prefix}--date-picker-container--single`]: datePickerType === 'single',
      [`${prefix}--date-picker-container--from`]: isStartInput && datePickerType === 'range',
      [`${prefix}--date-picker-container--to`]: isEndInput && datePickerType === 'range',
    });

    // Use cloneElement with ref separately to avoid TypeScript issues
    return (
      <div key={child.props.id} className={containerClasses}>
        {cloneElement(child, {
          ...enhancedProps,
          // @ts-expect-error - ref is valid but TypeScript doesn't recognize it in cloneElement
          ref: inputRef,
        })}
      </div>
    );
  });

  // Generate class names
  const wrapperClasses = classNames(
    `${prefix}--date-picker`,
    {
      [`${prefix}--date-picker--simple`]: datePickerType === 'simple',
      [`${prefix}--date-picker--single`]: datePickerType === 'single',
      [`${prefix}--date-picker--range`]: datePickerType === 'range',
      [`${prefix}--date-picker--light`]: light,
      [`${prefix}--date-picker--short`]: short,
      [`${prefix}--date-picker--open`]: isOpen,
    },
    className
  );

  // Don't render calendar for simple mode
  const shouldRenderCalendar = datePickerType !== 'simple' && isOpen;

  return (
    <div ref={containerRef} className={wrapperClasses}>
      {/* Input fields - each wrapped in its own container */}
      {enhancedChildren}

      {/* Calendar dropdown */}
      {shouldRenderCalendar && (
        <div
          ref={calendarRef}
          className={`${prefix}--date-picker__calendar-container`}
        >
          <Calendar
            context={context}
            onDateSelect={selectDate}
            onNavigate={handleNavigate}
          />
        </div>
      )}
    </div>
  );
}

DatePicker.displayName = 'DatePicker';

// Made with Bob
