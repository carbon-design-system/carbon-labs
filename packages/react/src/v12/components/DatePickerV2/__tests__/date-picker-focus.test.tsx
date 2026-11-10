/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom
/** @jsxRuntime automatic */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../vitest.setup';
import { setReducedMotion } from '../../../vitest.dom';
import { DatePicker, DatePickerInput } from '../index';

setReducedMotion(true);

// The month the calendar opens on is today's: fixed, with only the clock's date faked.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 0, 1, 12));
});
afterEach(() => {
  vi.useRealTimers();
});

const calendar = () => screen.queryByRole('dialog', { name: 'Calendar' });
// A day's name leads with its weekday: "Thursday, January 1, 2026".
const day = (date: string) =>
  screen.findByRole('gridcell', { name: new RegExp(date) });

describe('DatePickerV2 focus restoration', () => {
  it('returns focus to the input after selecting a date', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker datePickerType="single" closeOnSelect>
        <DatePickerInput id="single-date" labelText="Date input" />
      </DatePicker>
    );

    const dateInput = screen.getByLabelText('Date input');

    await user.click(dateInput);

    expect(calendar()).toBeTruthy();

    await user.click(await day('January 1, 2026'));

    await waitFor(() => {
      expect(document.activeElement).toBe(dateInput);
      expect(calendar()).toBe(null);
      expect(screen.queryByRole('gridcell', { name: /January 1, 2026/ })).toBe(
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
    await user.click(await day('January 1, 2026'));

    expect(calendar()).toBeTruthy();

    await user.click(endInput);
    await user.click(await day('January 2, 2026'));

    await waitFor(() => {
      expect(document.activeElement).toBe(endInput);
      expect(calendar()).toBe(null);
      expect(screen.queryByRole('gridcell', { name: /January 2, 2026/ })).toBe(
        null
      );
    });
  });

  it('does not reopen on a Tab after a selection closed it: Tab leaves the field', async () => {
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
    await user.click(await day('January 1, 2026'));

    await waitFor(() => {
      expect(document.activeElement).toBe(dateInput);
      expect(calendar()).toBe(null);
    });

    await user.keyboard('{Tab}');

    // The labs picker reopens its calendar here and a second Tab enters it;
    // this one has closed, so the Tab goes on to the next control.
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'After date picker' })
      );
    });
    expect(calendar()).toBe(null);
  });

  it('does not trap focus: Tab from the field enters the calendar, Tab again closes it and goes on', async () => {
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

    // Tab onto the input: the calendar opens.
    await user.tab();
    expect(document.activeElement).toBe(dateInput);
    expect(calendar()).toBeTruthy();

    // Tab again: focus moves into the calendar, onto a day.
    await user.tab();
    await waitFor(() => {
      expect(calendar()!.contains(document.activeElement)).toBe(true);
    });

    // Tab once more: the calendar closes and focus is back on the input, not
    // on the page's body.
    await user.tab();
    await waitFor(() => {
      expect(calendar()).toBe(null);
      expect(document.activeElement).toBe(dateInput);
    });

    // The next Tab leaves the date picker.
    await user.tab();
    await waitFor(() => {
      expect(document.activeElement).toBe(afterButton);
    });
  });

  it('has no exit sentinel: nothing aria-hidden is a tab stop', () => {
    const { container } = render(
      <DatePicker datePickerType="single">
        <DatePickerInput id="sentinel-check" labelText="Date input" />
      </DatePicker>
    );
    expect(container.querySelector('span[aria-hidden="true"][tabindex]')).toBe(
      null
    );
  });

  it('Escape closes the calendar and goes back to the input', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker datePickerType="single">
        <DatePickerInput id="escape" labelText="Date input" />
      </DatePicker>
    );

    const dateInput = screen.getByLabelText('Date input');
    await user.click(dateInput);
    await user.tab();
    await waitFor(() => {
      expect(calendar()!.contains(document.activeElement)).toBe(true);
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(calendar()).toBe(null);
      expect(document.activeElement).toBe(dateInput);
    });
  });

  describe('input click reopens calendar', () => {
    it('reopens the calendar when clicking the input after a date has been selected', async () => {
      const user = userEvent.setup();

      render(
        <DatePicker datePickerType="single" closeOnSelect>
          <DatePickerInput id="single-date-reopen" labelText="Date input" />
        </DatePicker>
      );

      const dateInput = screen.getByLabelText('Date input');

      // Click the input to open the calendar.
      await user.click(dateInput);
      expect(calendar()).toBeTruthy();

      // Select a date: the calendar closes.
      await user.click(await day('January 1, 2026'));

      await waitFor(() => {
        expect(calendar()).toBe(null);
      });

      // Click the input again: it already has focus, so only a click fires
      // (no focus event), and the calendar reopens.
      await user.click(dateInput);

      await waitFor(() => {
        expect(calendar()).toBeTruthy();
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

      // Open the calendar and select the start date.
      await user.click(startInput);
      await user.click(await day('January 1, 2026'));

      // Select the end date: the calendar closes.
      await user.click(await day('January 2, 2026'));

      await waitFor(() => {
        expect(calendar()).toBe(null);
      });

      // Click the start input again: the calendar reopens.
      await user.click(startInput);

      await waitFor(() => {
        expect(calendar()).toBeTruthy();
      });
    });
  });
});
