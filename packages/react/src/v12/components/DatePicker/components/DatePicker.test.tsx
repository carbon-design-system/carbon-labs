/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';
import { DatePickerInput } from './DatePickerInput';

const mockTemporal = {
  PlainDate: {
    from(input: string | { year: number; month: number; day: number }) {
      const date =
        typeof input === 'string'
          ? new Date(`${input}T00:00:00.000Z`)
          : new Date(
              Date.UTC(input.year, input.month - 1, input.day, 0, 0, 0, 0)
            );

      return createPlainDate(date);
    },
    compare(a: any, b: any) {
      return a.toString().localeCompare(b.toString());
    },
  },
  Now: {
    plainDateISO() {
      return createPlainDate(new Date('2026-01-01T00:00:00.000Z'));
    },
  },
};

function createPlainDate(date: Date) {
  const normalized = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  return {
    year: normalized.getUTCFullYear(),
    month: normalized.getUTCMonth() + 1,
    day: normalized.getUTCDate(),
    daysInMonth: new Date(
      Date.UTC(normalized.getUTCFullYear(), normalized.getUTCMonth() + 1, 0)
    ).getUTCDate(),
    toString() {
      const year = normalized.getUTCFullYear();
      const month = String(normalized.getUTCMonth() + 1).padStart(2, '0');
      const day = String(normalized.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    with(dateLike: { year?: number; month?: number; day?: number }) {
      return createPlainDate(
        new Date(
          Date.UTC(
            dateLike.year ?? normalized.getUTCFullYear(),
            (dateLike.month ?? normalized.getUTCMonth() + 1) - 1,
            dateLike.day ?? normalized.getUTCDate()
          )
        )
      );
    },
    add(duration: { days?: number; months?: number; years?: number }) {
      const next = new Date(normalized);
      if (duration.years) {
        next.setUTCFullYear(next.getUTCFullYear() + duration.years);
      }
      if (duration.months) {
        next.setUTCMonth(next.getUTCMonth() + duration.months);
      }
      if (duration.days) {
        next.setUTCDate(next.getUTCDate() + duration.days);
      }
      return createPlainDate(next);
    },
    until(other: any) {
      const otherDate = new Date(`${other.toString()}T00:00:00.000Z`);
      const diffMs = otherDate.getTime() - normalized.getTime();
      return { days: Math.round(diffMs / 86400000) };
    },
  };
}

(globalThis as any).Temporal = mockTemporal;

describe('DatePicker v12 focus restoration', () => {
  it('returns focus to the input after selecting a date', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker datePickerType="single" closeOnSelect>
        <DatePickerInput id="single-date" labelText="Date input" />
      </DatePicker>
    );

    const dateInput = screen.getByLabelText('Date input');

    await user.click(dateInput);

    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeTruthy();

    const dateButton = await screen.findByRole('button', {
      name: 'January 1, 2026',
    });

    await user.click(dateButton);

    await waitFor(() => {
      expect(document.activeElement).toBe(dateInput);
      expect(screen.queryByRole('grid', { name: 'Calendar' })).toBe(null);
      expect(screen.queryByRole('button', { name: 'January 1, 2026' })).toBe(
        null
      );
    });
  });

  it('returns focus to the end input after selecting a range end date', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker datePickerType="range" closeOnSelect>
        <DatePickerInput id="range-start" labelText="Start date" />
        <DatePickerInput id="range-end" labelText="End date" />
      </DatePicker>
    );

    const startInput = screen.getByLabelText('Start date');
    const endInput = screen.getByLabelText('End date');

    await user.click(startInput);

    const startDateButton = await screen.findByRole('button', {
      name: 'January 1, 2026',
    });
    await user.click(startDateButton);

    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeTruthy();

    await user.click(endInput);

    const endDateButton = await screen.findByRole('button', {
      name: 'January 2, 2026',
    });
    await user.click(endDateButton);

    await waitFor(() => {
      expect(document.activeElement).toBe(endInput);
      expect(screen.queryByRole('grid', { name: 'Calendar' })).toBe(null);
      expect(screen.queryByRole('button', { name: 'January 2, 2026' })).toBe(
        null
      );
    });
  });

  it('reopens the calendar on first tab after selection closes it and moves focus into it on second tab', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <DatePicker datePickerType="single" closeOnSelect>
          <DatePickerInput id="single-date-tab-reopen" labelText="Date input" />
        </DatePicker>
        <button type="button">After date picker</button>
      </div>
    );

    const dateInput = screen.getByLabelText('Date input');

    await user.click(dateInput);

    const dateButton = await screen.findByRole('button', {
      name: 'January 1, 2026',
    });

    await user.click(dateButton);

    await waitFor(() => {
      expect(document.activeElement).toBe(dateInput);
      expect(screen.queryByRole('grid', { name: 'Calendar' })).toBe(null);
    });

    await user.keyboard('{Tab}');

    await waitFor(() => {
      expect(document.activeElement).toBe(dateInput);
      expect(screen.getByRole('grid', { name: 'Calendar' })).toBeTruthy();
    });

    await user.keyboard('{Tab}');

    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('grid', { name: 'Calendar' })
      );
    });
  });

  it('does not trap focus: Tab from calendar moves focus to the next page element', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <DatePicker datePickerType="single">
          <DatePickerInput id="single-date-tab-trap" labelText="Date input" />
        </DatePicker>
        <button type="button">After date picker</button>
      </div>
    );

    const dateInput = screen.getByLabelText('Date input');
    const afterButton = screen.getByRole('button', {
      name: 'After date picker',
    });

    // Tab onto the input — calendar opens
    await user.tab();
    expect(document.activeElement).toBe(dateInput);
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeTruthy();

    // Tab again — focus moves into the calendar grid
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('grid', { name: 'Calendar' })
    );

    // Tab once more — focus must leave the date picker entirely
    await user.tab();

    await waitFor(() => {
      // Calendar should be closed
      expect(screen.queryByRole('grid', { name: 'Calendar' })).toBe(null);
      // Focus must be on the element after the date picker, not back on the input
      expect(document.activeElement).toBe(afterButton);
    });
  });

  describe('DatePicker v12 input click reopens calendar', () => {
    it('reopens the calendar when clicking the input after a date has been selected', async () => {
      const user = userEvent.setup();

      render(
        <DatePicker datePickerType="single" closeOnSelect>
          <DatePickerInput id="single-date-reopen" labelText="Date input" />
        </DatePicker>
      );

      const dateInput = screen.getByLabelText('Date input');

      // Step 1: Click input to open calendar
      await user.click(dateInput);
      expect(screen.getByRole('grid', { name: 'Calendar' })).toBeTruthy();

      // Step 2: Select a date — calendar should close
      const dateButton = await screen.findByRole('button', {
        name: 'January 1, 2026',
      });
      await user.click(dateButton);

      await waitFor(() => {
        expect(screen.queryByRole('grid', { name: 'Calendar' })).toBe(null);
      });

      // Step 3: Click the input again — calendar should reopen
      // The input already has focus, so only a click event fires (no onFocus)
      await user.click(dateInput);

      await waitFor(() => {
        expect(screen.getByRole('grid', { name: 'Calendar' })).toBeTruthy();
      });
    });

    it('reopens the calendar when clicking the range start input after a full range has been selected', async () => {
      const user = userEvent.setup();

      render(
        <DatePicker datePickerType="range" closeOnSelect>
          <DatePickerInput id="range-reopen-start" labelText="Start date" />
          <DatePickerInput id="range-reopen-end" labelText="End date" />
        </DatePicker>
      );

      const startInput = screen.getByLabelText('Start date');

      // Step 1: Open calendar and select start date
      await user.click(startInput);
      const startDateButton = await screen.findByRole('button', {
        name: 'January 1, 2026',
      });
      await user.click(startDateButton);

      // Step 2: Select end date — calendar should close
      const endDateButton = await screen.findByRole('button', {
        name: 'January 2, 2026',
      });
      await user.click(endDateButton);

      await waitFor(() => {
        expect(screen.queryByRole('grid', { name: 'Calendar' })).toBe(null);
      });

      // Step 3: Click the start input again — calendar should reopen
      await user.click(startInput);

      await waitFor(() => {
        expect(screen.getByRole('grid', { name: 'Calendar' })).toBeTruthy();
      });
    });
  });
});
