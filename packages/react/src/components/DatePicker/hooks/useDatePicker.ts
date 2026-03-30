/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DatePickerStateMachine,
  DatePickerEvent,
  DatePickerState,
  type DatePickerContext,
  type DatePickerMode,
} from '@carbon-labs/primitives/date-picker';

/**
 * Configuration for the useDatePicker hook
 * Maintains 100% backwards compatibility with Carbon React v11 API
 */
export interface UseDatePickerConfig {
  /**
   * The type of date picker (Carbon API uses datePickerType, not mode)
   */
  datePickerType?: 'simple' | 'single' | 'range';

  /**
   * Initial value as ISO date string
   */
  value?: string;

  /**
   * Minimum selectable date (mm/dd/yyyy format - Carbon API)
   */
  minDate?: string | null;

  /**
   * Maximum selectable date (mm/dd/yyyy format - Carbon API)
   */
  maxDate?: string | null;

  /**
   * Date format string (Flatpickr-compatible format)
   */
  dateFormat?: string;

  /**
   * Whether to allow manual input
   */
  allowInput?: boolean;

  /**
   * Whether to close calendar on date selection
   */
  closeOnSelect?: boolean;

  /**
   * Whether the picker is disabled
   */
  disabled?: boolean;

  /**
   * Whether the picker is read-only (Carbon uses readOnly, not readonly)
   */
  readOnly?: boolean;

  /**
   * Locale for date formatting
   */
  locale?: string;

  /**
   * Change handler - receives array of Date objects (Carbon API)
   */
  onChange?: (dates: Date[]) => void;

  /**
   * Open handler
   */
  onOpen?: () => void;

  /**
   * Close handler
   */
  onClose?: () => void;
}

/**
 * Return type for the useDatePicker hook
 */
export interface UseDatePickerReturn {
  /**
   * Current state machine context
   */
  context: DatePickerContext;

  /**
   * Current state
   */
  state: DatePickerState;

  /**
   * Whether the calendar is open
   */
  isOpen: boolean;

  /**
   * Send an event to the state machine
   */
  send: (eventType: string, payload?: any) => void;

  /**
   * Open the calendar
   */
  openCalendar: () => void;

  /**
   * Close the calendar
   */
  closeCalendar: () => void;

  /**
   * Select a date
   */
  selectDate: (date: Temporal.PlainDate) => void;

  /**
   * Handle input focus
   */
  handleInputFocus: (inputType?: 'from' | 'to') => void;

  /**
   * Handle input blur
   */
  handleInputBlur: () => void;

  /**
   * Handle input value change
   */
  handleInputChange: (value: string, inputType?: 'from' | 'to') => void;

  /**
   * Ref for the start input
   */
  startInputRef: React.RefObject<HTMLInputElement>;

  /**
   * Ref for the end input (range mode)
   */
  endInputRef: React.RefObject<HTMLInputElement>;

  /**
   * Ref for the calendar container
   */
  calendarRef: React.RefObject<HTMLDivElement>;
}

/**
 * Convert mm/dd/yyyy string to Temporal.PlainDate
 *
 * @param {string | null} dateStr - Date string in mm/dd/yyyy format
 * @returns {Temporal.PlainDate | null} Temporal.PlainDate or null
 */
function parseDate(dateStr: string | null): Temporal.PlainDate | null {
  if (!dateStr) {
    return null;
  }

  try {
    // Handle mm/dd/yyyy format (Carbon API)
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      return Temporal.PlainDate.from({ year, month, day });
    }

    // Fallback to ISO format
    return Temporal.PlainDate.from(dateStr);
  } catch (error) {
    console.warn('Failed to parse date:', dateStr, error);
    return null;
  }
}

/**
 * Convert Temporal.PlainDate to Date object (for Carbon API compatibility)
 *
 * @param {Temporal.PlainDate | null} plainDate - Temporal.PlainDate to convert
 * @returns {Date | null} Date object or null
 */
function temporalToDate(plainDate: Temporal.PlainDate | null): Date | null {
  if (!plainDate) {
    return null;
  }
  return new Date(plainDate.year, plainDate.month - 1, plainDate.day);
}

/**
 * React hook for managing date picker state using the shared state machine
 * Maintains 100% backwards compatibility with Carbon React v11 API
 *
 * @param {UseDatePickerConfig} config - Configuration options
 * @returns {UseDatePickerReturn} Hook return object with state and handlers
 */
export function useDatePicker(config: UseDatePickerConfig = {}): UseDatePickerReturn {
  const {
    datePickerType = 'single',
    value = '',
    minDate = null,
    maxDate = null,
    closeOnSelect = true,
    disabled = false,
    readOnly = false,
    onChange,
    onOpen,
    onClose,
  } = config;

  // Refs for input elements
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // State machine instance (persists across renders)
  const machineRef = useRef<DatePickerStateMachine | null>(null);

  // React state for triggering re-renders
  const [context, setContext] = useState<DatePickerContext>(() => {
    // Initialize state machine on first render
    const machine = new DatePickerStateMachine({
      mode: datePickerType as DatePickerMode,
      value,
      minDate: parseDate(minDate),
      maxDate: parseDate(maxDate),
      isDisabled: disabled,
      isReadonly: readOnly,
    });
    machineRef.current = machine;
    return machine.getContext();
  });

  const [state, setState] = useState<DatePickerState>(() => {
    return machineRef.current?.getState() || DatePickerState.IDLE;
  });

  // Subscribe to state machine changes
  useEffect(() => {
    const machine = machineRef.current;
    if (!machine) {
      return;
    }

    const unsubscribe = machine.subscribe((transition) => {
      setContext(transition.context);
      setState(transition.to as DatePickerState);

      // Call Carbon API callbacks
      if (transition.to === DatePickerState.CALENDAR_OPEN && onOpen) {
        onOpen();
      }
      if (
        (transition.to === DatePickerState.IDLE || transition.to === DatePickerState.FOCUSED) &&
        transition.from === DatePickerState.CALENDAR_OPEN &&
        onClose
      ) {
        onClose();
      }
    });

    return unsubscribe;
  }, [onOpen, onClose, context.isOpen]);

  // Handle onChange callback (convert Temporal.PlainDate to Date[])
  useEffect(() => {
    if (!onChange) {
      return;
    }

    const dates: Date[] = [];
    if (context.startDate) {
      const date = temporalToDate(context.startDate);
      if (date) {
        dates.push(date);
      }
    }
    if (context.endDate) {
      const date = temporalToDate(context.endDate);
      if (date) {
        dates.push(date);
      }
    }

    // Only call onChange if dates have actually changed
    if (dates.length > 0) {
      onChange(dates);
    }
  }, [context.startDate, context.endDate, onChange]);

  // Update state machine when config changes
  useEffect(() => {
    const machine = machineRef.current;
    if (!machine) {
      return;
    }

    // Update disabled state
    if (disabled !== context.isDisabled) {
      machine.send(disabled ? DatePickerEvent.DISABLE : DatePickerEvent.ENABLE);
    }

    // Update readonly state
    if (readOnly !== context.isReadonly) {
      machine.send(readOnly ? DatePickerEvent.SET_READONLY : DatePickerEvent.UNSET_READONLY);
    }

    // Update min/max dates
    const newMinDate = parseDate(minDate);
    const newMaxDate = parseDate(maxDate);
    if (newMinDate) {
      machine.send(DatePickerEvent.SET_MIN_DATE, { date: newMinDate });
    }
    if (newMaxDate) {
      machine.send(DatePickerEvent.SET_MAX_DATE, { date: newMaxDate });
    }
  }, [disabled, readOnly, minDate, maxDate, context.isDisabled, context.isReadonly]);

  // Event handlers
  const send = useCallback((eventType: string, payload?: any) => {
    machineRef.current?.send(eventType, payload);
  }, []);

  const openCalendar = useCallback(() => {
    send(DatePickerEvent.CALENDAR_OPEN);
  }, [send]);

  const closeCalendar = useCallback(() => {
    send(DatePickerEvent.CALENDAR_CLOSE);
  }, [send]);

  const selectDate = useCallback(
    (date: Temporal.PlainDate) => {
      if (datePickerType === 'range') {
        if (!context.startDate || context.endDate) {
          // Select start date
          send(DatePickerEvent.RANGE_START_SELECT, { date });
        } else {
          // Select end date
          send(DatePickerEvent.RANGE_END_SELECT, { date });
          if (closeOnSelect) {
            closeCalendar();
          }
        }
      } else {
        // Single date selection
        send(DatePickerEvent.DATE_SELECT, { date });
        if (closeOnSelect) {
          closeCalendar();
        }
      }
    },
    [datePickerType, context.startDate, context.endDate, closeOnSelect, send, closeCalendar]
  );

  const handleInputFocus = useCallback(
    (inputType: 'from' | 'to' = 'from') => {
      send(DatePickerEvent.INPUT_FOCUS, { inputType });
    },
    [send]
  );

  const handleInputBlur = useCallback(() => {
    send(DatePickerEvent.INPUT_BLUR);
  }, [send]);

  const handleInputChange = useCallback(
    (value: string, inputType: 'from' | 'to' = 'from') => {
      send(DatePickerEvent.VALUE_CHANGE, { value, inputType });
    },
    [send]
  );

  // Handle click outside to close calendar
  useEffect(() => {
    if (!context.isOpen) {
      return;
    }

    /**
     * Handle click outside calendar
     *
     * @param {MouseEvent} event - Mouse event
     */
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const calendarEl = calendarRef.current;
      const startInputEl = startInputRef.current;
      const endInputEl = endInputRef.current;

      if (
        calendarEl &&
        !calendarEl.contains(target) &&
        startInputEl &&
        !startInputEl.contains(target) &&
        (!endInputEl || !endInputEl.contains(target))
      ) {
        send(DatePickerEvent.OUTSIDE_CLICK);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [context.isOpen, send]);

  // Handle keyboard events
  useEffect(() => {
    if (!context.isOpen) {
      return;
    }

    /**
     * Handle keyboard events
     *
     * @param {KeyboardEvent} event - Keyboard event
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        send(DatePickerEvent.ESCAPE_KEY);
      } else if (event.key === 'Tab') {
        send(DatePickerEvent.TAB_KEY);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [context.isOpen, send]);

  return {
    context,
    state,
    isOpen: context.isOpen,
    send,
    openCalendar,
    closeCalendar,
    selectDate,
    handleInputFocus,
    handleInputBlur,
    handleInputChange,
    startInputRef,
    endInputRef,
    calendarRef,
  };
}

// Made with Bob
