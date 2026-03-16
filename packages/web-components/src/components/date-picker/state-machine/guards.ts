/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DatePickerState } from './states';
import { isDateInRange } from './temporal-utils';
import type {
  DatePickerContext,
  DatePickerEvent,
  StateGuard,
  DateSelectPayload,
} from './types';

/**
 * Guard map - determines if transitions are allowed
 */
type GuardMap = Record<
  DatePickerState,
  Partial<Record<string, StateGuard>>
>;

/**
 * Check if component is interactive (not disabled or readonly)
 */
const isInteractive = (context: DatePickerContext): boolean => {
  return !context.isDisabled && !context.isReadonly;
};


/**
 * Check if component is in range mode
 */
const isRangeMode = (context: DatePickerContext): boolean => {
  return context.mode === 'range';
};

/**
 * Check if component is in single mode
 */
const isSingleMode = (context: DatePickerContext): boolean => {
  return context.mode === 'single';
};

/**
 * Guards for state transitions
 */
export const guards: GuardMap = {
  [DatePickerState.IDLE]: {},

  [DatePickerState.FOCUSED]: {
    INPUT_FOCUS: isInteractive,
  },

  [DatePickerState.CALENDAR_OPEN]: {
    CALENDAR_OPEN: isInteractive,
    CALENDAR_ICON_CLICK: isInteractive,
    TAB_KEY: isInteractive,
  },

  [DatePickerState.SELECTING_START]: {
    CALENDAR_OPEN: (context) => isInteractive(context) && isRangeMode(context),
  },

  [DatePickerState.SELECTING_END]: {
    RANGE_START_SELECT: (context, event) => {
      if (!isInteractive(context) || !isRangeMode(context)) {
        return false;
      }

      const payload = event.payload as DateSelectPayload;
      if (!payload?.date) return false;

      return isDateInRange(
        payload.date,
        context.minDate,
        context.maxDate
      );
    },
  },

  [DatePickerState.DATE_SELECTED]: {
    DATE_SELECT: (context, event) => {
      if (!isInteractive(context)) return false;

      const payload = event.payload as DateSelectPayload;
      if (!payload?.date) return false;

      return isDateInRange(
        payload.date,
        context.minDate,
        context.maxDate
      );
    },

    RANGE_END_SELECT: (context, event) => {
      if (!isInteractive(context) || !isRangeMode(context)) {
        return false;
      }

      const payload = event.payload as DateSelectPayload;
      if (!payload?.date) return false;

      // Must have a start date selected
      if (!context.startDate) return false;

      return isDateInRange(
        payload.date,
        context.minDate,
        context.maxDate
      );
    },
  },

  [DatePickerState.DISABLED]: {},

  [DatePickerState.READONLY]: {},

  [DatePickerState.ERROR]: {},
};

/**
 * Get guard for a specific state and event
 *
 * @param {DatePickerState} state - The current state
 * @param {string} eventType - The event type
 * @returns {StateGuard | undefined} The guard function or undefined
 */
export function getGuard(
  state: DatePickerState,
  eventType: string
): StateGuard | undefined {
  return guards[state]?.[eventType];
}

/**
 * Check if a transition is guarded and allowed
 *
 * @param {DatePickerState} state - The current state
 * @param {string} eventType - The event type
 * @param {DatePickerContext} context - The current context
 * @param {DatePickerEvent} event - The event
 * @returns {boolean} True if guard passes
 */
export function checkGuard(
  state: DatePickerState,
  eventType: string,
  context: DatePickerContext,
  event: DatePickerEvent
): boolean {
  const guard = getGuard(state, eventType);
  if (!guard) {
    return true; // No guard means transition is allowed
  }
  return guard(context, event);
}

// Made with Bob
