/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DatePickerState } from './states';
import {
  plainDateToISOString,
  comparePlainDates,
} from './temporal-utils';
import type {
  DatePickerContext,
  DatePickerEvent,
  StateAction,
  DateSelectPayload,
  InputFocusPayload,
  ValidationErrorPayload,
} from './types';

/**
 * Action map - updates context during transitions
 */
type ActionMap = Record<
  DatePickerState,
  Partial<Record<string, StateAction>>
>;


/**
 * Actions for state transitions
 */
export const actions: ActionMap = {
  [DatePickerState.IDLE]: {
    /**
     * Action for CALENDAR_ICON_CLICK event
     *
     * @param {DatePickerContext} context - Current context
     * @returns {Partial<DatePickerContext>} Updated context
     */
    CALENDAR_ICON_CLICK: (context) => {
      // Initialize viewDate to today if not set
      const viewDate = context.viewDate || context.startDate || Temporal.Now.plainDateISO();
      return {
        isOpen: true,
        viewDate,
      };
    },
    /** Action for INPUT_BLUR event */
    INPUT_BLUR: () => ({
      isFocused: false,
    }),
    /** Action for OUTSIDE_CLICK event */
    OUTSIDE_CLICK: () => ({
      isOpen: false,
      isFocused: false,
    }),
    /** Action for CALENDAR_CLOSE event */
    CALENDAR_CLOSE: () => ({
      isOpen: false,
    }),
  },

  [DatePickerState.FOCUSED]: {
    /**
     * Action for INPUT_FOCUS event
     *
     * @param _context
     * @param {DatePickerEvent} event - The event
     * @returns {Partial<DatePickerContext>} Updated context
     */
    INPUT_FOCUS: (_context, event: DatePickerEvent): Partial<DatePickerContext> => {
      const payload = event.payload as InputFocusPayload;
      return {
        isFocused: true,
        lastFocusedInput: payload?.inputType || 'from',
      };
    },
    /**
     * Action for CALENDAR_OPEN event from FOCUSED state
     *
     * @param {DatePickerContext} context - Current context
     * @returns {Partial<DatePickerContext>} Updated context
     */
    CALENDAR_OPEN: (context) => {
      // Initialize viewDate to today if not set
      const viewDate = context.viewDate || context.startDate || Temporal.Now.plainDateISO();
      return {
        isOpen: true,
        viewDate,
      };
    },
  },

  [DatePickerState.CALENDAR_OPEN]: {
    /**
     * Action for CALENDAR_OPEN event
     *
     * @param {DatePickerContext} context - Current context
     * @returns {Partial<DatePickerContext>} Updated context
     */
    CALENDAR_OPEN: (context) => {
      // Initialize viewDate to today if not set
      const viewDate = context.viewDate || context.startDate || Temporal.Now.plainDateISO();
      return {
        isOpen: true,
        viewDate,
      };
    },
    /**
     * Action for CALENDAR_ICON_CLICK event
     *
     * @param {DatePickerContext} context - Current context
     * @returns {Partial<DatePickerContext>} Updated context
     */
    CALENDAR_ICON_CLICK: (context) => {
      // Initialize viewDate to today if not set
      const viewDate = context.viewDate || context.startDate || Temporal.Now.plainDateISO();
      return {
        isOpen: true,
        viewDate,
      };
    },
    /** Action for TAB_KEY event */
    TAB_KEY: () => ({
      isOpen: true,
      isFocused: true,
    }),
    /**
     * Action for PREV_MONTH event
     *
     * @param {DatePickerContext} context - Current context
     * @returns {Partial<DatePickerContext>} Updated context
     */
    PREV_MONTH: (context) => {
      if (!context.viewDate) {
        return {};
      }
      return {
        viewDate: context.viewDate.add({ months: -1 }),
      };
    },
    /**
     * Action for NEXT_MONTH event
     *
     * @param {DatePickerContext} context - Current context
     * @returns {Partial<DatePickerContext>} Updated context
     */
    NEXT_MONTH: (context) => {
      if (!context.viewDate) {
        return {};
      }
      return {
        viewDate: context.viewDate.add({ months: 1 }),
      };
    },
    /**
     * Action for PREV_YEAR event
     *
     * @param {DatePickerContext} context - Current context
     * @returns {Partial<DatePickerContext>} Updated context
     */
    PREV_YEAR: (context) => {
      if (!context.viewDate) {
        return {};
      }
      return {
        viewDate: context.viewDate.add({ years: -1 }),
      };
    },
    /**
     * Action for NEXT_YEAR event
     *
     * @param {DatePickerContext} context - Current context
     * @returns {Partial<DatePickerContext>} Updated context
     */
    NEXT_YEAR: (context) => {
      if (!context.viewDate) {
        return {};
      }
      return {
        viewDate: context.viewDate.add({ years: 1 }),
      };
    },
    /** Action for GO_TO_TODAY event */
    GO_TO_TODAY: () => ({
      viewDate: Temporal.Now.plainDateISO(),
    }),
  },

  [DatePickerState.SELECTING_START]: {
    /**
     * Action for CALENDAR_OPEN event
     *
     * @param {DatePickerContext} context - Current context
     * @returns {Partial<DatePickerContext>} Updated context
     */
    CALENDAR_OPEN: (context) => {
      if (context.mode === 'range') {
        return {
          isOpen: true,
          startDate: null,
          endDate: null,
        };
      }
      return { isOpen: true };
    },
  },

  [DatePickerState.SELECTING_END]: {
    /**
     * Action for RANGE_START_SELECT event
     *
     * @param {DatePickerContext} _context - Current context
     * @param {DatePickerEvent} event - The event
     * @returns {Partial<DatePickerContext>} Updated context
     */
    RANGE_START_SELECT: (_context: DatePickerContext, event: DatePickerEvent): Partial<DatePickerContext> => {
      const payload = event.payload as DateSelectPayload;
      const startDate = payload?.date;

      if (!startDate) {
        return {};
      }

      return {
        startDate,
        endDate: null, // Reset end date when selecting a new start
        value: plainDateToISOString(startDate),
      };
    },
  },

  [DatePickerState.DATE_SELECTED]: {
    /**
     * Action for DATE_SELECT event
     *
     * @param {DatePickerContext} context - Current context
     * @param {DatePickerEvent} event - The event
     * @returns {Partial<DatePickerContext>} Updated context
     */
    DATE_SELECT: (context, event) => {
      const payload = event.payload as DateSelectPayload;
      const date = payload?.date;

      if (!date) {
        return {};
      }

      if (context.mode === 'single') {
        return {
          startDate: date,
          value: plainDateToISOString(date),
          isOpen: context.closeOnSelect ? false : context.isOpen,
        };
      }

      return {};
    },

    /**
     * Action for RANGE_END_SELECT event
     *
     * @param {DatePickerContext} context - Current context
     * @param {DatePickerEvent} event - The event
     * @returns {Partial<DatePickerContext>} Updated context
     */
    RANGE_END_SELECT: (context, event) => {
      const payload = event.payload as DateSelectPayload;
      const endDate = payload?.date;
      const { startDate } = context;

      if (!endDate || !startDate) {
        return {};
      }

      // Ensure end date is after start date, swap if needed
      let finalStartDate = startDate;
      let finalEndDate = endDate;

      if (comparePlainDates(endDate, startDate) < 0) {
        finalStartDate = endDate;
        finalEndDate = startDate;
      }

      return {
        startDate: finalStartDate,
        endDate: finalEndDate,
        value: `${plainDateToISOString(finalStartDate)}/${plainDateToISOString(finalEndDate)}`,
        isOpen: context.closeOnSelect ? false : context.isOpen,
      };
    },

    /** Action for CALENDAR_CLOSE event */
    CALENDAR_CLOSE: () => ({
      isOpen: false,
    }),
  },

  [DatePickerState.DISABLED]: {
    /** Action for a DISABLE event */
    DISABLE: () => ({
      isDisabled: true,
      isOpen: false,
    }),
    /** Action for ENABLE event */
    ENABLE: () => ({
      isDisabled: false,
    }),
  },

  [DatePickerState.READONLY]: {
    /** Action for SET_READONLY event */
    SET_READONLY: () => ({
      isReadonly: true,
      isOpen: false,
    }),
    /** Action for UNSET_READONLY event */
    UNSET_READONLY: () => ({
      isReadonly: false,
    }),
  },

  [DatePickerState.ERROR]: {
    /**
     * Action for VALIDATION_ERROR event
     *
     * @param {DatePickerContext} _context - Current context (unused)
     * @param {DatePickerEvent} event - The event
     * @returns {Partial<DatePickerContext>} Updated context
     */
    VALIDATION_ERROR: (_context, event) => {
      const payload = event.payload as ValidationErrorPayload;
      return {
        isInvalid: true,
        errorMessage: payload?.message || 'Invalid date',
      };
    },
    /** Action for CLEAR_ERROR event */
    CLEAR_ERROR: () => ({
      isInvalid: false,
      errorMessage: undefined,
    }),
    /** Action for VALUE_CHANGE event */
    VALUE_CHANGE: () => ({
      isInvalid: false,
      errorMessage: undefined,
    }),
  },
};

/**
 * Get action for a specific state and event
 *
 * @param {DatePickerState} state - The current state
 * @param {string} eventType - The event type
 * @returns {StateAction | undefined} The action function or undefined
 */
export function getAction(
  state: DatePickerState,
  eventType: string
): StateAction | undefined {
  return actions[state]?.[eventType];
}

/**
 * Execute an action and return context updates
 *
 * @param {DatePickerState} state - The current state
 * @param {string} eventType - The event type
 * @param {DatePickerContext} context - The current context
 * @param {DatePickerEvent} event - The event
 * @returns {Partial<DatePickerContext>} Partial context updates
 */
export function executeAction(
  state: DatePickerState,
  eventType: string,
  context: DatePickerContext,
  event: DatePickerEvent
): Partial<DatePickerContext> {
  const action = getAction(state, eventType);
  if (!action) {
    return {};
  }
  return action(context, event);
}

// Made with Bob
