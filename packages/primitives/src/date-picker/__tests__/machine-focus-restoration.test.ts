/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect } from 'vitest';
import { DatePickerStateMachine } from '../machine';
import { DatePickerEvent } from '../states';
import { parseISOToPlainDate } from '../temporal-utils';

describe('DatePickerStateMachine focus restoration', () => {
  it('requests focus restoration to the last focused input after single-date selection closes the calendar', () => {
    const machine = new DatePickerStateMachine({
      mode: 'single',
      closeOnSelect: true,
    });

    machine.send(DatePickerEvent.INPUT_FOCUS, { inputType: 'from' });
    const context = machine.send(DatePickerEvent.DATE_SELECT, {
      date: parseISOToPlainDate('2026-01-01'),
    });

    expect(context.isOpen).toBe(false);
    expect(context.restoreFocusTo).toBe('from');
    expect(context.shouldRestoreFocus).toBe(true);
  });

  it('requests focus restoration to the end input after range end selection closes the calendar', () => {
    const machine = new DatePickerStateMachine({
      mode: 'range',
      closeOnSelect: true,
    });

    machine.send(DatePickerEvent.INPUT_FOCUS, { inputType: 'from' });
    machine.send(DatePickerEvent.RANGE_START_SELECT, {
      date: parseISOToPlainDate('2026-01-01'),
    });
    machine.send(DatePickerEvent.INPUT_FOCUS, { inputType: 'to' });

    const context = machine.send(DatePickerEvent.RANGE_END_SELECT, {
      date: parseISOToPlainDate('2026-01-02'),
    });

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

    const context = machine.send(DatePickerEvent.OUTSIDE_CLICK);

    expect(context.isOpen).toBe(false);
    expect(context.restoreFocusTo).toBeNull();
    expect(context.shouldRestoreFocus).toBe(false);
  });
});
