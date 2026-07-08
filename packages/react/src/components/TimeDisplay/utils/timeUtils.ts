/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { TimeValues, TimeUnit } from '../components/TimeDisplay.types';

/**
 * Convert various time input formats to a Date object.
 */
export function parseTimeInput(input: Date | number | string): Date {
  if (input instanceof Date) {
    return input;
  }
  return new Date(input);
}

/**
 * Calculate time values from total seconds.
 */
export function calculateTimeValues(totalSeconds: number): TimeValues {
  const absoluteSeconds = Math.abs(Math.floor(totalSeconds));

  const days = Math.floor(absoluteSeconds / 86400);
  const hours = Math.floor((absoluteSeconds % 86400) / 3600);
  const minutes = Math.floor((absoluteSeconds % 3600) / 60);
  const seconds = absoluteSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds: absoluteSeconds };
}

/**
 * Calculate elapsed time from a start time to the current time (count-up mode).
 */
export function calculateElapsedTime(
  startTime: Date | number | string,
  currentTime: Date
): TimeValues {
  const start = parseTimeInput(startTime);
  const elapsedMs = currentTime.getTime() - start.getTime();
  return calculateTimeValues(Math.max(0, Math.floor(elapsedMs / 1000)));
}

/**
 * Calculate remaining time from the current time to an end time (count-down mode).
 */
export function calculateRemainingTime(
  endTime: Date | number | string,
  currentTime: Date
): TimeValues {
  const end = parseTimeInput(endTime);
  const remainingMs = end.getTime() - currentTime.getTime();
  return calculateTimeValues(Math.max(0, Math.floor(remainingMs / 1000)));
}

/**
 * Format a time value with optional zero-padding.
 */
export function formatTimeValue(
  value: number,
  padWithZero: boolean = true
): string {
  return padWithZero ? value.toString().padStart(2, '0') : value.toString();
}

const UNIT_LABELS: Record<
  TimeUnit,
  {
    short: { singular: string; plural: string };
    full: { singular: string; plural: string };
  }
> = {
  days: {
    short: { singular: 'day', plural: 'days' },
    full: { singular: 'day', plural: 'days' },
  },
  hours: {
    short: { singular: 'hr', plural: 'hr' },
    full: { singular: 'hour', plural: 'hours' },
  },
  minutes: {
    short: { singular: 'min', plural: 'min' },
    full: { singular: 'minute', plural: 'minutes' },
  },
  seconds: {
    short: { singular: 'sec', plural: 'sec' },
    full: { singular: 'second', plural: 'seconds' },
  },
};

/**
 * Get the abbreviated unit label for visual display.
 */
export function getUnitLabel(unit: TimeUnit, value: number): string {
  const label = UNIT_LABELS[unit].short;
  return value === 1 ? label.singular : label.plural;
}

/**
 * Get the full unit label for accessible text.
 */
export function getFullUnitLabel(unit: TimeUnit, value: number): string {
  const label = UNIT_LABELS[unit].full;
  return value === 1 ? label.singular : label.plural;
}

/**
 * Filter time values based on selected units and zero-unit visibility.
 * Always returns at least the smallest requested unit.
 */
export function filterTimeUnits(
  timeValues: TimeValues,
  units: TimeUnit[],
  keepZeroValueUnits: boolean
): Array<{ unit: TimeUnit; value: number }> {
  const result: Array<{ unit: TimeUnit; value: number }> = [];

  for (const unit of units) {
    const value = timeValues[unit];
    if (keepZeroValueUnits || value > 0) {
      result.push({ unit, value });
    }
  }

  // Always show at least the smallest unit
  if (result.length === 0 && units.length > 0) {
    const smallestUnit = units[units.length - 1];
    result.push({ unit: smallestUnit, value: 0 });
  }

  return result;
}

/**
 * Generate accessible text for screen readers.
 */
export function generateAccessibleText(
  label: string,
  timeValues: TimeValues,
  units: TimeUnit[],
  keepZeroValueUnits: boolean
): string {
  const filteredUnits = filterTimeUnits(timeValues, units, keepZeroValueUnits);

  if (filteredUnits.length === 0) {
    return `${label}: 0 seconds`;
  }

  const parts = filteredUnits.map(
    ({ unit, value }) => `${value} ${getFullUnitLabel(unit, value)}`
  );

  return `${label}: ${parts.join(', ')}`;
}

/**
 * Format time as a colon-separated string (e.g. `12:34:56`).
 */
export function formatColonTime(
  timeValues: TimeValues,
  units: TimeUnit[],
  padWithZero: boolean = true
): string {
  return units.map((unit) => formatTimeValue(timeValues[unit], padWithZero)).join(':');
}

/**
 * Returns `true` when a countdown has reached zero.
 */
export function isCountdownComplete(timeValues: TimeValues): boolean {
  return timeValues.totalSeconds === 0;
}

/**
 * Returns `true` when a threshold value has been crossed from above to at-or-below.
 */
export function hasThresholdBeenCrossed(
  currentSeconds: number,
  previousSeconds: number,
  thresholdValue: number
): boolean {
  return previousSeconds > thresholdValue && currentSeconds <= thresholdValue;
}

/**
 * Validate required props for each mode.
 */
export function validateTimeDisplayProps(
  mode: string,
  startTime?: Date | number | string,
  endTime?: Date | number | string,
  duration?: number
): { valid: boolean; error?: string } {
  if (mode === 'count-up' && !startTime) {
    return { valid: false, error: 'count-up mode requires startTime' };
  }
  if (mode === 'count-down' && !endTime) {
    return { valid: false, error: 'count-down mode requires endTime' };
  }
  if (mode === 'duration' && duration === undefined) {
    return { valid: false, error: 'duration mode requires duration' };
  }
  if (mode === 'duration' && duration !== undefined && duration < 0) {
    return { valid: false, error: 'duration must be non-negative' };
  }
  return { valid: true };
}
