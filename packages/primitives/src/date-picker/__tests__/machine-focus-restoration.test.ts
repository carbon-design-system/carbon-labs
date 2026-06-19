/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect } from 'vitest';
import { executeAction } from '../actions';
import { DatePickerStateMachine } from '../machine';
import { DatePickerEvent, DatePickerState } from '../states';

describe('DatePickerStateMachine focus restoration', () => {
  it('tracks the focused input when INPUT_FOCUS is sent from idle', () => {
    const machine = new DatePickerStateMachine({
      mode: 'range',
      closeOnSelect: true,
    });

    const context = machine.send(DatePickerEvent.INPUT_FOCUS, {
      inputType: 'to',
    });

    expect(context.isFocused).toBe(true);
    expect(context.lastFocusedInput).toBe('to');
  });

  it('preserves focus restoration intent when CALENDAR_CLOSE runs after single-date selection', () => {
    const updates = executeAction(
      DatePickerState.DATE_SELECTED,
      DatePickerEvent.CALENDAR_CLOSE,
      {
        mode: 'single',
        closeOnSelect: true,
        isOpen: true,
        isFocused: true,
        isDisabled: false,
        isReadonly: false,
        isInvalid: false,
        value: '',
        startDate: null,
        endDate: null,
        viewDate: null,
        focusedDate: null,
        minDate: null,
        maxDate: null,
        dateFormat: 'Y-m-d',
        allowInput: true,
        lastFocusedInput: 'from',
        restoreFocusTo: 'from',
        shouldRestoreFocus: true,
      },
      { type: DatePickerEvent.CALENDAR_CLOSE, timestamp: Date.now() }
    );

    expect(updates.isOpen).toBe(false);
    expect(updates.restoreFocusTo).toBe('from');
    expect(updates.shouldRestoreFocus).toBe(true);
  });

  it('preserves focus restoration intent when CALENDAR_CLOSE runs after range end selection', () => {
    const updates = executeAction(
      DatePickerState.DATE_SELECTED,
      DatePickerEvent.CALENDAR_CLOSE,
      {
        mode: 'range',
        closeOnSelect: true,
        isOpen: true,
        isFocused: true,
        isDisabled: false,
        isReadonly: false,
        isInvalid: false,
        value: '',
        startDate: null,
        endDate: null,
        viewDate: null,
        focusedDate: null,
        minDate: null,
        maxDate: null,
        dateFormat: 'Y-m-d',
        allowInput: true,
        lastFocusedInput: 'to',
        restoreFocusTo: 'to',
        shouldRestoreFocus: true,
      },
      { type: DatePickerEvent.CALENDAR_CLOSE, timestamp: Date.now() }
    );

    expect(updates.isOpen).toBe(false);
    expect(updates.restoreFocusTo).toBe('to');
    expect(updates.shouldRestoreFocus).toBe(true);
  });

  it('clears focus restoration intent when the calendar closes without a selection', () => {
    const updates = executeAction(
      DatePickerState.CALENDAR_OPEN,
      DatePickerEvent.OUTSIDE_CLICK,
      {
        mode: 'single',
        closeOnSelect: true,
        isOpen: true,
        isFocused: true,
        isDisabled: false,
        isReadonly: false,
        isInvalid: false,
        value: '',
        startDate: null,
        endDate: null,
        viewDate: null,
        focusedDate: null,
        minDate: null,
        maxDate: null,
        dateFormat: 'Y-m-d',
        allowInput: true,
        lastFocusedInput: 'from',
        restoreFocusTo: 'from',
        shouldRestoreFocus: true,
      },
      { type: DatePickerEvent.OUTSIDE_CLICK, timestamp: Date.now() }
    );

    expect(updates.isOpen).toBe(false);
    expect(updates.restoreFocusTo).toBeNull();
    expect(updates.shouldRestoreFocus).toBe(false);
  });
});
