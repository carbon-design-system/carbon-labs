/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect } from 'vitest';
import { DatePickerStateMachine } from '../machine';
import { DatePickerEvent } from '../states';

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

  it('requests focus restoration to the last focused input after single-date selection closes the calendar', () => {
    const machine = new DatePickerStateMachine({
      mode: 'single',
      closeOnSelect: true,
    });

    machine.updateContext({
      lastFocusedInput: 'from',
      restoreFocusTo: 'from',
      shouldRestoreFocus: true,
      isOpen: true,
    });
    machine.send(DatePickerEvent.INPUT_FOCUS);

    const context = machine.send(DatePickerEvent.CALENDAR_CLOSE);

    expect(context.isOpen).toBe(false);
    expect(context.restoreFocusTo).toBe('from');
    expect(context.shouldRestoreFocus).toBe(true);
  });

  it('requests focus restoration to the end input after range end selection closes the calendar', () => {
    const machine = new DatePickerStateMachine({
      mode: 'range',
      closeOnSelect: true,
    });

    machine.updateContext({
      lastFocusedInput: 'to',
      restoreFocusTo: 'to',
      shouldRestoreFocus: true,
      isOpen: true,
    });
    machine.send(DatePickerEvent.INPUT_FOCUS);

    const context = machine.send(DatePickerEvent.CALENDAR_CLOSE);

    expect(context.isOpen).toBe(false);
    expect(context.restoreFocusTo).toBe('to');
    expect(context.shouldRestoreFocus).toBe(true);
  });

  it('clears focus restoration intent when the calendar closes without a selection', () => {
    const machine = new DatePickerStateMachine({
      mode: 'single',
      closeOnSelect: true,
    });

    machine.updateContext({
      restoreFocusTo: 'from',
      shouldRestoreFocus: true,
      isOpen: true,
    });
    machine.send(DatePickerEvent.INPUT_FOCUS);
    machine.send(DatePickerEvent.CALENDAR_OPEN);

    const context = machine.send(DatePickerEvent.OUTSIDE_CLICK);

    expect(context.isOpen).toBe(false);
    expect(context.restoreFocusTo).toBeNull();
    expect(context.shouldRestoreFocus).toBe(false);
  });
});
