/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Temporal API utilities for date picker
 * Uses the modern Temporal API for robust date handling
 */

/**
 * Convert a Date object to Temporal.PlainDate
 *
 * @param date - JavaScript Date object
 * @returns Temporal.PlainDate
 */
export function dateToPlainDate(date: Date): Temporal.PlainDate {
  return Temporal.PlainDate.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}

/**
 * Convert Temporal.PlainDate to Date object
 *
 * @param plainDate - Temporal.PlainDate
 * @returns JavaScript Date object
 */
export function plainDateToDate(plainDate: Temporal.PlainDate): Date {
  return new Date(plainDate.year, plainDate.month - 1, plainDate.day);
}

/**
 * Convert Temporal.PlainDate to ISO date string (YYYY-MM-DD)
 *
 * @param plainDate - Temporal.PlainDate
 * @returns ISO date string
 */
export function plainDateToISOString(plainDate: Temporal.PlainDate): string {
  return plainDate.toString();
}

/**
 * Parse ISO date string to Temporal.PlainDate
 *
 * @param isoString - ISO date string (YYYY-MM-DD)
 * @returns Temporal.PlainDate or null if invalid
 */
export function parseISOToPlainDate(
  isoString: string
): Temporal.PlainDate | null {
  try {
    return Temporal.PlainDate.from(isoString);
  } catch {
    return null;
  }
}

/**
 * Compare two Temporal.PlainDate objects
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function comparePlainDates(
  date1: Temporal.PlainDate,
  date2: Temporal.PlainDate
): number {
  return Temporal.PlainDate.compare(date1, date2);
}

/**
 * Check if a date is within a range
 *
 * @param date - Date to check
 * @param minDate - Minimum date (inclusive)
 * @param maxDate - Maximum date (inclusive)
 * @returns True if date is within range
 */
export function isDateInRange(
  date: Temporal.PlainDate,
  minDate: Temporal.PlainDate | null,
  maxDate: Temporal.PlainDate | null
): boolean {
  if (minDate && comparePlainDates(date, minDate) < 0) {
    return false;
  }
  if (maxDate && comparePlainDates(date, maxDate) > 0) {
    return false;
  }
  return true;
}

/**
 * Format a Temporal.PlainDate according to a format string
 * Supports common format tokens: Y, m, d
 *
 * @param date - Date to format
 * @param format - Format string (e.g., 'm/d/Y', 'Y-m-d')
 * @returns Formatted date string
 */
export function formatPlainDate(
  date: Temporal.PlainDate,
  format: string
): string {
  const year = date.year.toString();
  const month = date.month.toString().padStart(2, '0');
  const day = date.day.toString().padStart(2, '0');

  return format
    .replace('Y', year)
    .replace('m', month)
    .replace('d', day);
}

/**
 * Get today's date as Temporal.PlainDate
 *
 * @returns Today's date
 */
export function getToday(): Temporal.PlainDate {
  return Temporal.Now.plainDateISO();
}

/**
 * Add days to a date
 *
 * @param date - Starting date
 * @param days - Number of days to add (can be negative)
 * @returns New date
 */
export function addDays(
  date: Temporal.PlainDate,
  days: number
): Temporal.PlainDate {
  return date.add({ days });
}

/**
 * Add months to a date
 *
 * @param date - Starting date
 * @param months - Number of months to add (can be negative)
 * @returns New date
 */
export function addMonths(
  date: Temporal.PlainDate,
  months: number
): Temporal.PlainDate {
  return date.add({ months });
}

/**
 * Get the number of days between two dates
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days (positive if date2 is after date1)
 */
export function daysBetween(
  date1: Temporal.PlainDate,
  date2: Temporal.PlainDate
): number {
  return date1.until(date2).days;
}

/**
 * Check if two dates are equal
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are equal
 */
export function areDatesEqual(
  date1: Temporal.PlainDate | null,
  date2: Temporal.PlainDate | null
): boolean {
  if (date1 === null && date2 === null) {
    return true;
  }
  if (date1 === null || date2 === null) {
    return false;
  }
  return comparePlainDates(date1, date2) === 0;
}

/**
 * Get the start of the month for a given date
 *
 * @param date - Input date
 * @returns First day of the month
 */
export function getMonthStart(date: Temporal.PlainDate): Temporal.PlainDate {
  return date.with({ day: 1 });
}

/**
 * Get the end of the month for a given date
 *
 * @param date - Input date
 * @returns Last day of the month
 */
export function getMonthEnd(date: Temporal.PlainDate): Temporal.PlainDate {
  return date.with({ day: date.daysInMonth });
}

/**
 * Check if a date is today
 *
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Temporal.PlainDate): boolean {
  return areDatesEqual(date, getToday());
}

/**
 * Check if a date is in the past
 *
 * @param date - Date to check
 * @returns True if date is before today
 */
export function isPast(date: Temporal.PlainDate): boolean {
  return comparePlainDates(date, getToday()) < 0;
}

/**
 * Check if a date is in the future
 *
 * @param date - Date to check
 * @returns True if date is after today
 */
export function isFuture(date: Temporal.PlainDate): boolean {
  return comparePlainDates(date, getToday()) > 0;
}

/**
 * Parse a date string with a specific format
 * Supports common format tokens: Y, m, d
 *
 * @param dateString - Date string to parse
 * @param format - Format string (e.g., 'm/d/Y', 'Y-m-d')
 * @returns Temporal.PlainDate or null if invalid
 */
export function parseDateString(
  dateString: string,
  format: string
): Temporal.PlainDate | null {
  try {
    // Simple parser for common formats
    // In production, consider using a more robust parser
    const formatParts = format.split(/[^YmdHis]/);
    const dateParts = dateString.split(/[^0-9]/);

    if (formatParts.length !== dateParts.length) {
      return null;
    }

    let year = 0;
    let month = 0;
    let day = 0;

    formatParts.forEach((part, index) => {
      const value = parseInt(dateParts[index], 10);
      if (part === 'Y') {
        year = value;
      } else if (part === 'm') {
        month = value;
      } else if (part === 'd') {
        day = value;
      }
    });

    return Temporal.PlainDate.from({ year, month, day });
  } catch {
    return null;
  }
}

/**
 * Polyfill check for Temporal API
 *
 * @returns True if Temporal API is available
 */
export function isTemporalAvailable(): boolean {
  return typeof Temporal !== 'undefined' && typeof Temporal.PlainDate !== 'undefined';
}

/**
 * Get a fallback date handler if Temporal is not available
 * This provides a migration path for browsers without Temporal support
 */
export function getDateHandler() {
  if (isTemporalAvailable()) {
    return {
      type: 'temporal' as const,
      toISOString: plainDateToISOString,
      fromISOString: parseISOToPlainDate,
      compare: comparePlainDates,
      format: formatPlainDate,
      isInRange: isDateInRange,
    };
  }

  // Fallback to Date objects
  return {
    type: 'date' as const,
    toISOString: (date: Date) => date.toISOString().split('T')[0],
    fromISOString: (str: string) => {
      const date = new Date(str);
      return isNaN(date.getTime()) ? null : date;
    },
    compare: (d1: Date, d2: Date) => d1.getTime() - d2.getTime(),
    format: (date: Date, format: string) => {
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return format.replace('Y', year).replace('m', month).replace('d', day);
    },
    isInRange: (date: Date, min: Date | null, max: Date | null) => {
      if (min && date < min) {
        return false;
      }
      if (max && date > max) {
        return false;
      }
      return true;
    },
  };
}

// Made with Bob
