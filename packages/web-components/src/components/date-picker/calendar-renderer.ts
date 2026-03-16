/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
// Temporal API is available globally via polyfill
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const Temporal: typeof import('@js-temporal/polyfill').Temporal;
import { prefix } from './temp-imports/globals/settings';
import { carbonElement as customElement } from './temp-imports/globals/decorators/carbon-element';
import ChevronLeft16 from '@carbon/icons/es/chevron--left/16.js';
import ChevronRight16 from '@carbon/icons/es/chevron--right/16.js';
import { iconLoader } from './temp-imports/globals/internal/icon-loader';

/**
 * Calendar renderer for date picker.
 * Replaces Flatpickr's calendar UI with a lightweight, framework-agnostic implementation.
 *
 * @element cds-date-picker-calendar
 * @fires cds-date-picker-calendar-date-select - Fired when a date is selected
 * @fires cds-date-picker-calendar-month-change - Fired when the month changes
 */
@customElement(`${prefix}-date-picker-calendar`)
class CDSDatePickerCalendar extends LitElement {
  /**
   * The currently displayed month (Temporal.PlainYearMonth)
   */
  @state()
  private _currentMonth: Temporal.PlainYearMonth = Temporal.Now.plainDateISO().toPlainYearMonth();

  /**
   * The selected date(s)
   */
  @property({ type: Array })
  selectedDates: Temporal.PlainDate[] = [];

  /**
   * The minimum selectable date
   */
  @property({ type: Object })
  minDate?: Temporal.PlainDate;

  /**
   * The maximum selectable date
   */
  @property({ type: Object })
  maxDate?: Temporal.PlainDate;

  /**
   * Whether range selection is enabled
   */
  @property({ type: Boolean })
  rangeMode = false;

  /**
   * The date format for display
   */
  @property({ type: String })
  dateFormat = 'm/d/Y';

  /**
   * Locale for date formatting
   */
  @property({ type: String })
  locale = 'en-US';

  /**
   * Navigate to previous month
   */
  private _handlePrevMonth() {
    this._currentMonth = this._currentMonth.subtract({ months: 1 });
    this._dispatchMonthChange();
  }

  /**
   * Navigate to next month
   */
  private _handleNextMonth() {
    this._currentMonth = this._currentMonth.add({ months: 1 });
    this._dispatchMonthChange();
  }

  /**
   * Handle date selection
   * @param date - The date to select
   */
  private _handleDateSelect(date: Temporal.PlainDate) {
    if (this._isDateDisabled(date)) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(`${prefix}-date-picker-calendar-date-select`, {
        bubbles: true,
        composed: true,
        detail: { date },
      })
    );
  }

  /**
   * Dispatch month change event
   */
  private _dispatchMonthChange() {
    this.dispatchEvent(
      new CustomEvent(`${prefix}-date-picker-calendar-month-change`, {
        bubbles: true,
        composed: true,
        detail: { month: this._currentMonth },
      })
    );
  }

  /**
   * Check if a date is disabled
   * @param date - The date to check
   */
  private _isDateDisabled(date: Temporal.PlainDate): boolean {
    if (this.minDate && Temporal.PlainDate.compare(date, this.minDate) < 0) {
      return true;
    }
    if (this.maxDate && Temporal.PlainDate.compare(date, this.maxDate) > 0) {
      return true;
    }
    return false;
  }

  /**
   * Check if a date is selected
   * @param date - The date to check
   */
  private _isDateSelected(date: Temporal.PlainDate): boolean {
    return this.selectedDates.some((selected) =>
      selected.equals(date)
    );
  }

  /**
   * Check if a date is in range (for range mode)
   * @param date - The date to check
   */
  private _isDateInRange(date: Temporal.PlainDate): boolean {
    if (!this.rangeMode || this.selectedDates.length !== 2) {
      return false;
    }

    const [start, end] = this.selectedDates.sort((a, b) =>
      Temporal.PlainDate.compare(a, b)
    );

    return (
      Temporal.PlainDate.compare(date, start) >= 0 &&
      Temporal.PlainDate.compare(date, end) <= 0
    );
  }

  /**
   * Check if a date is today
   * @param date - The date to check
   */
  private _isToday(date: Temporal.PlainDate): boolean {
    const today = Temporal.Now.plainDateISO();
    return date.equals(today);
  }

  /**
   * Get the days to display in the calendar grid
   */
  private _getCalendarDays(): Temporal.PlainDate[] {
    const firstDayOfMonth = this._currentMonth.toPlainDate({ day: 1 });
    // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.dayOfWeek % 7;

    // Calculate the start date (may be in previous month)
    const startDate = firstDayOfMonth.subtract({ days: firstDayOfWeek });

    // Generate 42 days (6 weeks) for consistent grid
    const days: Temporal.PlainDate[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(startDate.add({ days: i }));
    }

    return days;
  }

  /**
   * Get weekday names
   */
  private _getWeekdayNames(): string[] {
    // Start from Sunday
    const baseDate = Temporal.PlainDate.from('2024-01-07'); // A Sunday
    const weekdays: string[] = [];

    for (let i = 0; i < 7; i++) {
      const date = baseDate.add({ days: i });
      const formatter = new Intl.DateTimeFormat(this.locale, { weekday: 'short' });
      let name = formatter.format(new Date(date.toString()));
      
      // Special handling for Thursday to match Carbon's "Th" format
      if (name === 'Thu') {
        name = 'Th';
      } else {
        name = name.charAt(0);
      }
      
      weekdays.push(name);
    }

    return weekdays;
  }

  /**
   * Render the calendar header with month/year and navigation
   */
  private _renderHeader() {
    const monthName = new Intl.DateTimeFormat(this.locale, {
      month: 'long',
      year: 'numeric',
    }).format(new Date(this._currentMonth.toString()));

    return html`
      <div class="${prefix}--date-picker__month">
        <button
          type="button"
          class="${prefix}--date-picker__month-nav ${prefix}--date-picker__month-nav--prev"
          @click="${this._handlePrevMonth}"
          aria-label="Previous month">
          ${iconLoader(ChevronLeft16)}
        </button>
        <div class="${prefix}--date-picker__current-month">
          <span class="cur-month">${monthName}</span>
        </div>
        <button
          type="button"
          class="${prefix}--date-picker__month-nav ${prefix}--date-picker__month-nav--next"
          @click="${this._handleNextMonth}"
          aria-label="Next month">
          ${iconLoader(ChevronRight16)}
        </button>
      </div>
    `;
  }

  /**
   * Render the weekday headers
   */
  private _renderWeekdays() {
    const weekdays = this._getWeekdayNames();

    return html`
      <div class="${prefix}--date-picker__weekdays">
        ${weekdays.map(
          (day) => html`
            <span class="${prefix}--date-picker__weekday">${day}</span>
          `
        )}
      </div>
    `;
  }

  /**
   * Render the calendar days grid
   */
  private _renderDays() {
    const days = this._getCalendarDays();
    const currentMonthValue = this._currentMonth.month;

    return html`
      <div class="${prefix}--date-picker__days">
        ${days.map((date) => {
          const isCurrentMonth = date.month === currentMonthValue;
          const isDisabled = this._isDateDisabled(date);
          const isSelected = this._isDateSelected(date);
          const isInRange = this._isDateInRange(date);
          const isToday = this._isToday(date);

          const dayClasses = classMap({
            [`${prefix}--date-picker__day`]: true,
            'prevMonthDay': !isCurrentMonth && date.month < currentMonthValue,
            'nextMonthDay': !isCurrentMonth && date.month > currentMonthValue,
            'disabled': isDisabled,
            'selected': isSelected,
            'inRange': isInRange,
            'today': isToday && !isSelected,
            'no-border': isToday && isSelected,
          });

          return html`
            <button
              type="button"
              class="${dayClasses}"
              ?disabled="${isDisabled}"
              @click="${() => this._handleDateSelect(date)}"
              aria-label="${date.toString()}">
              ${date.day}
            </button>
          `;
        })}
      </div>
    `;
  }

  /**
   * Renders the calendar component
   */
  render() {
    return html`
      <div class="${prefix}--date-picker__calendar">
        ${this._renderHeader()} ${this._renderWeekdays()} ${this._renderDays()}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
  `;
}

export default CDSDatePickerCalendar;

// Made with Bob
