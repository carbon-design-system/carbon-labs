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
 * Calculate elapsed time from a start time (ms timestamp) to the current time.
 */
export function calculateElapsedTime(
  startTimeMs: number,
  currentTime: Date
): TimeValues {
  const elapsedMs = currentTime.getTime() - startTimeMs;
  return calculateTimeValues(Math.max(0, Math.floor(elapsedMs / 1000)));
}

/**
 * Calculate remaining time from the current time to an end time (ms timestamp).
 */
export function calculateRemainingTime(
  endTimeMs: number,
  currentTime: Date
): TimeValues {
  const remainingMs = endTimeMs - currentTime.getTime();
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

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when a Date object represents a valid point in time.
 */
function isValidDate(d: Date): boolean {
  return !isNaN(d.getTime());
}

/**
 * Validates that a numeric timestamp is a 13-digit millisecond Unix timestamp.
 * Returns an error string when invalid, undefined when valid.
 */
function validateTimestamp(
  value: number,
  propName: string
): string | undefined {
  const digits = String(Math.floor(Math.abs(value))).length;
  if (digits !== 13) {
    return `${propName} must be a 13-digit millisecond Unix timestamp (got ${digits} digits). For dates before 2001 use a Date object or ISO string instead.`;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Hard-error validation — returns null-render when invalid
// ---------------------------------------------------------------------------

/**
 * Validates required and structurally critical props.
 * Returns { valid: false, error } for any condition that makes rendering
 * impossible or meaningless. The component returns null on failure.
 */
export function validateTimeDisplayProps(
  mode: string,
  startTime: Date | number | string | undefined,
  endTime: Date | number | string | undefined,
  duration: number | undefined,
  units: string[]
): { valid: boolean; error?: string } {
  // units: must be non-empty
  if (units.length === 0) {
    return { valid: false, error: 'units must contain at least one time unit.' };
  }

  // units: each entry must be a valid TimeUnit
  const VALID_UNITS = new Set(['days', 'hours', 'minutes', 'seconds']);
  for (const unit of units) {
    if (!VALID_UNITS.has(unit)) {
      return {
        valid: false,
        error: `Invalid unit "${unit}". Must be one of: days, hours, minutes, seconds.`,
      };
    }
  }

  // mode-specific required props
  if (mode === 'count-up' && !startTime) {
    return { valid: false, error: 'count-up mode requires startTime.' };
  }
  if (mode === 'count-down' && !endTime) {
    return { valid: false, error: 'count-down mode requires endTime.' };
  }
  if (mode === 'duration' && duration === undefined) {
    return { valid: false, error: 'duration mode requires a duration value.' };
  }
  if (mode === 'duration' && duration !== undefined && duration < 0) {
    return { valid: false, error: 'duration must be non-negative.' };
  }

  // numeric timestamps: must be 13-digit milliseconds
  if (startTime !== undefined && typeof startTime === 'number') {
    const err = validateTimestamp(startTime, 'startTime');
    if (err) return { valid: false, error: err };
  }
  if (endTime !== undefined && typeof endTime === 'number') {
    const err = validateTimestamp(endTime, 'endTime');
    if (err) return { valid: false, error: err };
  }

  // date/string inputs: must parse to a valid Date
  if (startTime !== undefined && typeof startTime !== 'number') {
    if (!isValidDate(new Date(startTime as string | Date))) {
      return { valid: false, error: 'startTime could not be parsed as a valid date.' };
    }
  }
  if (endTime !== undefined && typeof endTime !== 'number') {
    if (!isValidDate(new Date(endTime as string | Date))) {
      return { valid: false, error: 'endTime could not be parsed as a valid date.' };
    }
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Suspicious-prop warnings — render continues, developer is notified
// ---------------------------------------------------------------------------

/**
 * Emits console.warn for prop combinations that are valid but likely wrong.
 * Called after validateTimeDisplayProps passes. Never blocks rendering.
 */
export function warnOnSuspiciousProps({
  mode,
  startTime,
  endTime,
  duration,
  units,
  format,
  announcementMode,
  thresholds,
  completeLabel,
  onComplete,
}: {
  mode: string;
  startTime?: Date | number | string;
  endTime?: Date | number | string;
  duration?: number;
  units: string[];
  format: string;
  announcementMode: string;
  thresholds: Array<{ value: number }>;
  completeLabel?: string;
  onComplete?: unknown;
}): void {
  // units: duplicates
  if (new Set(units).size !== units.length) {
    console.warn(
      'TimeDisplay: units contains duplicate entries. Each unit should appear at most once.'
    );
  }

  // units: wrong canonical order
  const CANONICAL_ORDER = ['days', 'hours', 'minutes', 'seconds'];
  const validUnits = units.filter((u) => CANONICAL_ORDER.includes(u));
  const sortedUnits = [...validUnits].sort(
    (a, b) => CANONICAL_ORDER.indexOf(a) - CANONICAL_ORDER.indexOf(b)
  );
  if (validUnits.join(',') !== sortedUnits.join(',')) {
    console.warn(
      `TimeDisplay: units are out of canonical order. Expected [${sortedUnits.join(', ')}]. Wrong order causes incorrect colon format and visual layout.`
    );
  }

  // startTime: in the future for count-up
  if (mode === 'count-up' && startTime !== undefined) {
    const start = new Date(startTime as string | number | Date);
    if (isValidDate(start) && start > new Date()) {
      console.warn(
        'TimeDisplay: startTime is in the future. The display will show 00:00:00 until then.'
      );
    }
  }

  // endTime: already in the past for count-down
  if (mode === 'count-down' && endTime !== undefined) {
    const end = new Date(endTime as string | number | Date);
    if (isValidDate(end) && end <= new Date()) {
      console.warn(
        'TimeDisplay: endTime is in the past. The countdown will complete immediately.'
      );
    }
  }

  // duration: decimal value will be truncated
  if (mode === 'duration' && duration !== undefined && !Number.isInteger(duration)) {
    console.warn(
      `TimeDisplay: duration should be a whole number of seconds. ${duration} will be truncated to ${Math.floor(duration)}.`
    );
  }

  // duration: unusually large (> 10 years in seconds)
  if (mode === 'duration' && duration !== undefined && duration > 315_360_000) {
    console.warn(
      `TimeDisplay: duration of ${duration}s is unusually large (> 10 years). Did you pass milliseconds instead of seconds?`
    );
  }

  // format: unknown value
  const VALID_FORMATS = new Set(['split', 'boxed', 'colon', 'inline']);
  if (!VALID_FORMATS.has(format)) {
    console.warn(
      `TimeDisplay: Unknown format "${format}". Falling back to "split".`
    );
  }

  // announcementMode: unknown value
  const VALID_ANNOUNCEMENT_MODES = new Set(['off', 'threshold']);
  if (!VALID_ANNOUNCEMENT_MODES.has(announcementMode)) {
    console.warn(
      `TimeDisplay: Unknown announcementMode "${announcementMode}". Falling back to "off".`
    );
  }

  // thresholds: used with a mode that is not count-down
  if (thresholds.length > 0 && mode !== 'count-down') {
    console.warn(
      `TimeDisplay: thresholds only apply to count-down mode. They will have no effect in "${mode}" mode.`
    );
  }

  // thresholds: duplicate values
  const thresholdValues = thresholds.map((t) => t.value);
  if (new Set(thresholdValues).size !== thresholdValues.length) {
    console.warn(
      'TimeDisplay: thresholds contains duplicate value entries. Only the first entry for each value will fire.'
    );
  }

  // completeLabel / onComplete: no effect outside count-down
  if (completeLabel && mode !== 'count-down') {
    console.warn(
      `TimeDisplay: completeLabel has no effect in "${mode}" mode. It only applies when mode="count-down".`
    );
  }
  if (onComplete && mode !== 'count-down') {
    console.warn(
      `TimeDisplay: onComplete has no effect in "${mode}" mode. It is only called when mode="count-down" reaches zero.`
    );
  }
}
