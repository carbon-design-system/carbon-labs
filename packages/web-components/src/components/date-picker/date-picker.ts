/**
 * Copyright IBM Corp. 2019, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { prefix } from './temp-imports/globals/settings';
import FormMixin from './temp-imports/globals/mixins/form';
import HostListenerMixin from './temp-imports/globals/mixins/host-listener';
import HostListener from './temp-imports/globals/decorators/host-listener';
import CDSDatePickerInput from './date-picker-input';
import { WebComponentAdapter } from './state-machine/adapters/web-component-adapter';
import type { StateTransition } from './state-machine';
import { DatePickerState, DatePickerEvent } from './state-machine';
import { parseDateToPlainDate, parseISOToPlainDate } from './state-machine/temporal-utils';
// @ts-ignore
import styles from './date-picker.scss?inline';
import { carbonElement as customElement } from './temp-imports/globals/decorators/carbon-element';

/**
 * Date picker modes.
 */
enum DATE_PICKER_MODE {
  /**
   * Simple mode, without calendar dropdown.
   */
  SIMPLE = 'simple',

  /**
   * Single date mode.
   */
  SINGLE = 'single',

  /**
   * Range mode.
   */
  RANGE = 'range',
}

/**
 * Date picker.
 *
 * @element cds-date-picker
 * @fires cds-date-picker-changed - The custom event fired when the date selection changes.
 * @fires cds-date-picker-error - The custom event fired when an error occurs.
 */
// @ts-expect-error - Mixin inheritance not fully recognized by TypeScript
@customElement(`${prefix}-date-picker`)
class CDSDatePicker extends HostListenerMixin(FormMixin(LitElement)) {
  /**
   * The slotted `<cds-date-input kind="from">`.
   */
  private _dateInteractNode: CDSDatePickerInput | null = null;

  /**
   * The internal placeholder for the `value` property.
   */
  private _value!: string;

  /**
   * The adapter for Web Component integration.
   */
  private _adapter: WebComponentAdapter | null = null;

  /**
   * Timestamp of when calendar was last closed via Tab key
   */
  private _lastTabCloseTime = 0;

  /**
   * @returns The effective date picker mode, determined by the child `<cds-date-picker-input>`.
   */
  private get _mode() {
    const {selectorInputTo} = this.constructor as typeof CDSDatePicker;
    // @ts-expect-error - querySelector from mixin
    if (this.querySelector(selectorInputTo)) {
      return DATE_PICKER_MODE.RANGE;
    }
    // @ts-expect-error - querySelector from mixin
    if (this.querySelector(`${prefix}-date-picker-input[kind="single"]`)) {
      return DATE_PICKER_MODE.SINGLE;
    }
    return DATE_PICKER_MODE.SIMPLE;
  }

  /**
   * Handles `${prefix}-date-picker-changed` event on this element.
   *
   * @param {CustomEvent} root0 - The event object
   * @param {object} root0.detail - The event detail
   */
  @HostListener('eventChange')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: The decorator refers to this method, but TS thinks this method is not referred to
  private _handleChange = ({detail}: CustomEvent) => {
    const {selectedDates} = detail;
    if (selectedDates && Array.isArray(selectedDates)) {
      this._value = selectedDates
        .filter((date) => date != null) // Filter out null/undefined values
        .map((date) => {
          if (typeof date === 'string') {
            return date;
          }
          // Handle Temporal.PlainDate
          return date.toString();
        })
        .join('/');
    }
  };

  /**
   * Handles calendar icon click event from date-picker-input
   *
   * @param {CustomEvent} _event - The icon click event
   */
  @HostListener('eventIconClick')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: The decorator refers to this method, but TS thinks this method is not referred to
  private _handleIconClick = (_event: CustomEvent) => {
    if (this._adapter && !this.disabled && !this.readonly) {
      this._adapter.send(DatePickerEvent.CALENDAR_ICON_CLICK);
    }
  };

  /**
   * Handles input focus event from date-picker-input
   *
   * @param {CustomEvent} event - The focus event
   */
  @HostListener('eventInputFocus')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: The decorator refers to this method, but TS thinks this method is not referred to
  private _handleInputFocus = (event: CustomEvent) => {
    if (this._adapter && !this.disabled && !this.readonly) {
      const {inputType} = event.detail || {};
      this._adapter.send(DatePickerEvent.INPUT_FOCUS, {inputType});
      
      // Don't auto-open calendar if we JUST closed it via Tab key (within 100ms)
      // This prevents the immediate reopen when Tab moves focus to input,
      // but allows normal opening after that brief window
      const timeSinceTabClose = Date.now() - this._lastTabCloseTime;
      const shouldSkipOpen = timeSinceTabClose < 100;
      
      if (!shouldSkipOpen) {
        // Open calendar when input is focused (matching current Carbon behavior)
        this._adapter.send(DatePickerEvent.CALENDAR_OPEN);
      }
    }
  };

  /**
   * Handles input blur event from date-picker-input
   *
   * @param {CustomEvent} event - The blur event
   */
  @HostListener('eventInputBlur')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: The decorator refers to this method, but TS thinks this method is not referred to
  private _handleInputBlur = (event: CustomEvent) => {
    if (this._adapter) {
      const {inputType} = event.detail || {};
      this._adapter.send(DatePickerEvent.INPUT_BLUR, {inputType});
    }
  };

  /**
   * Handles form data event
   *
   * @param {FormDataEvent} event - The form data event
   */
  _handleFormdata(event: FormDataEvent) {
    const {formData} = event;
    const {disabled, name, value} = this;
    if (!disabled) {
      formData.append(name, value);
    }
  }

  /**
   * Handles `slotchange` event in the `<slot>`.
   *
   * @param {Event} root0 - The event object
   * @param {EventTarget} root0.target - The event target
   */
  private _handleSlotChange({target}: Event) {
    const {_dateInteractNode: oldDateInteractNode} = this;
    const dateInteractNode = (target as HTMLSlotElement)
      .assignedNodes()
      .find(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node as HTMLElement).matches(
            (this.constructor as typeof CDSDatePicker).selectorInputFrom
          )
      );
    // @ts-expect-error - Type comparison between mixin types
    if (oldDateInteractNode !== dateInteractNode) {
      this._dateInteractNode = dateInteractNode as unknown as CDSDatePickerInput;
      this._initializeDatePicker();
    }
  }

  /**
   * Handles state machine state changes
   *
   * @param {StateTransition} transition - The state transition
   * @param {DatePickerState} transition.from - Previous state
   * @param {DatePickerState} transition.to - New state
   * @param {DatePickerContext} transition.context - Current context
   */
  private _handleStateChange = (transition: StateTransition) => {
    const {to, from, context} = transition;
    const newState = to as DatePickerState;

    // Update open property based on state
    if (newState === DatePickerState.CALENDAR_OPEN) {
      this.open = true;
      
      // If we're staying in CALENDAR_OPEN state (keyboard navigation),
      // trigger a re-render to update the calendar with new focusedDate/viewDate
      if (from === DatePickerState.CALENDAR_OPEN) {
        this.requestUpdate();
      }
    } else if (newState === DatePickerState.SELECTING_END) {
      // Keep calendar open while selecting end date in range mode
      this.open = true;
      
      // If we're staying in SELECTING_END state (keyboard navigation),
      // trigger a re-render to update the calendar with new focusedDate/viewDate
      if (from === DatePickerState.SELECTING_END) {
        this.requestUpdate();
      }
    } else if (newState === DatePickerState.IDLE) {
      this.open = false;
    } else if (newState === DatePickerState.FOCUSED) {
      // Only close calendar if not coming from CALENDAR_OPEN (Enter key)
      // When coming from CALENDAR_OPEN, the action sets context.isOpen
      if (from !== DatePickerState.CALENDAR_OPEN && from !== DatePickerState.SELECTING_END) {
        this.open = false;
      } else {
        // Use the isOpen value from context (set by ENTER_KEY action)
        this.open = context.isOpen ?? false;
      }
    } else if (newState === DatePickerState.DATE_SELECTED) {
      // Update open property based on context
      this.open = context.isOpen ?? false;
      // Trigger re-render to update the calendar visibility
      this.requestUpdate();
    }

    // Dispatch change event and update input when dates are selected
    // This handles DATE_SELECTED state, FOCUSED state (from ENTER_KEY), and SELECTING_END state (after start date selected)
    const shouldUpdateInput =
      newState === DatePickerState.DATE_SELECTED ||
      newState === DatePickerState.SELECTING_END ||
      (newState === DatePickerState.FOCUSED && from === DatePickerState.CALENDAR_OPEN && context.startDate);
    
    if (shouldUpdateInput) {
      // Only include non-null dates in selectedDates array
      const selectedDates = context.endDate
        ? [context.startDate, context.endDate].filter((date) => date != null)
        : context.startDate ? [context.startDate] : [];

      // Update input field value with formatted date
      /**
       * Format date as MM/DD/YYYY (matching Carbon's default format)
       *
       * @param {Temporal.PlainDate} date - The date to format
       * @returns {string} Formatted date string
       */
      const formatDate = (date: Temporal.PlainDate) => {
        // Safety check - ensure date is a valid Temporal.PlainDate
        if (!date || typeof date !== 'object' || !('month' in date) || !('day' in date) || !('year' in date)) {
          console.error('formatDate received invalid date:', date);
          return '';
        }
        const month = String(date.month).padStart(2, '0');
        const day = String(date.day).padStart(2, '0');
        const year = date.year;
        return `${month}/${day}/${year}`;
      };

      // For range mode, update the correct input based on state
      if (this._mode === DATE_PICKER_MODE.RANGE) {
        const {selectorInputFrom, selectorInputTo} = this.constructor as typeof CDSDatePicker;
        // @ts-expect-error - querySelector is available from HTMLElement
        const inputFrom = this.querySelector(selectorInputFrom) as CDSDatePickerInput;
        // @ts-expect-error - querySelector is available from HTMLElement
        const inputTo = this.querySelector(selectorInputTo) as CDSDatePickerInput;

        // If we're in DATE_SELECTED state with both dates, update both inputs
        if (newState === DatePickerState.DATE_SELECTED && context.startDate && context.endDate) {
          if (inputFrom) {
            inputFrom.value = formatDate(context.startDate);
          }
          if (inputTo) {
            inputTo.value = formatDate(context.endDate);
          }
        } else if (context.lastFocusedInput === 'to' && inputTo && context.endDate) {
          // Otherwise, update based on lastFocusedInput
          inputTo.value = formatDate(context.endDate);
        } else if (inputFrom && context.startDate) {
          inputFrom.value = formatDate(context.startDate);
        }
      } else {
        // For single mode, update the single input
        if (this._dateInteractNode && context.startDate) {
          this._dateInteractNode.value = formatDate(context.startDate);
        }
      }

      (this as unknown as HTMLElement).dispatchEvent(
        new CustomEvent(
          (this.constructor as typeof CDSDatePicker).eventChange,
          {
            bubbles: true,
            composed: true,
            detail: {
              selectedDates,
              value: this._value,
            },
          }
        )
      );
    }
  };

  /**
   * Handles calendar date selection
   *
   * @param {CustomEvent} event - The date select event
   */
  private _handleCalendarDateSelect = (event: CustomEvent) => {
    const {date} = event.detail;
    if (!this._adapter || !date) {
      return;
    }

    const {_mode: mode} = this;
    const context = this._adapter.getContext();

    if (mode === DATE_PICKER_MODE.RANGE) {
      // Range mode: select start or end date
      if (!context.startDate || context.endDate) {
        // Select start date (or restart selection)
        this._adapter.send(DatePickerEvent.RANGE_START_SELECT, {date});
      } else {
        // Select end date
        this._adapter.send(DatePickerEvent.RANGE_END_SELECT, {date});
      }
    } else {
      // Single mode: select date
      this._adapter.send(DatePickerEvent.DATE_SELECT, {date});
    }
  };

  /**
   * Handles calendar month change
   *
   * @param {CustomEvent} event - The month change event
   */
  private _handleCalendarMonthChange = (event: CustomEvent) => {
    const {month} = event.detail;
    if (!this._adapter || !month) {
      return;
    }

    // Update viewDate in context
    const firstDayOfMonth = month.toPlainDate({day: 1});
    this._adapter.updateContext({viewDate: firstDayOfMonth});
  };

  /**
   * Show the calendar popover using Popover API
   */
  private _showCalendarPopover() {
    const popover = this.shadowRoot?.querySelector(`#${prefix}-date-picker-calendar-popover`) as HTMLElement & { showPopover?: () => void };
    if (popover && typeof popover.showPopover === 'function') {
      try {
        popover.showPopover();
      } catch (e) {
        // Popover might already be showing
        console.warn('Could not show popover:', e);
      }
    }
  }

  /**
   * Hide the calendar popover using Popover API
   */
  private _hideCalendarPopover() {
    const popover = this.shadowRoot?.querySelector(`#${prefix}-date-picker-calendar-popover`) as HTMLElement & { hidePopover?: () => void };
    if (popover && typeof popover.hidePopover === 'function') {
      try {
        popover.hidePopover();
      } catch (e) {
        // Popover might already be hidden
        console.warn('Could not hide popover:', e);
      }
    }
  }

  /**
   * Initializes the date picker with a state machine.
   */
  private _initializeDatePicker() {
    this._releaseDatePicker();
    const {_dateInteractNode: dateInteractNode, _mode: mode} = this;

    // Don't instantiate in simple mode
    if (!dateInteractNode || !dateInteractNode.input || mode === 'simple') {
      return;
    }

    // Create adapter with configuration
    this._adapter = new WebComponentAdapter({
      component: this,
      initialContext: {
        mode: mode === DATE_PICKER_MODE.RANGE ? 'range' : 'single',
        dateFormat: this.dateFormat || 'm/d/Y',
        allowInput: this.allowInput,
        closeOnSelect: this.closeOnSelect,
        value: this.value || '',
        startDate: null,
        endDate: null,
        isOpen: false,
        isFocused: false,
        isDisabled: this.disabled,
        isReadonly: this.readonly,
        isInvalid: false,
        lastFocusedInput: null,
        minDate: parseDateToPlainDate(this.minDate),
        maxDate: parseDateToPlainDate(this.maxDate),
      },
      onStateChange: this._handleStateChange,
    });

    // Set initial value if provided
    if (this.value) {
      const dates = this.value.split('/').filter(Boolean);
      if (dates.length > 0) {
        this._adapter.send(
          mode === DATE_PICKER_MODE.RANGE ? DatePickerEvent.RANGE_START_SELECT : DatePickerEvent.DATE_SELECT,
          {date: dates[0]}
        );

        if (mode === DATE_PICKER_MODE.RANGE && dates.length > 1) {
          this._adapter.send(DatePickerEvent.RANGE_END_SELECT, {date: dates[1]});
        }
      }
    }
  }

  /**
   * Releases the date picker state machine.
   */
  private _releaseDatePicker() {
    if (this._adapter) {
      this._adapter.destroy();
      this._adapter = null;
    }
  }

  /**
   * Allows the user to enter a date directly into the input field
   */
  @property({type: Boolean, reflect: true, attribute: 'allow-input'})
  allowInput = true;

  /**
   * Controls whether the calendar dropdown closes upon selection.
   */
  @property({type: Boolean, reflect: true, attribute: 'close-on-select'})
  closeOnSelect = true;

  /**
   * The date format.
   */
  @property({attribute: 'date-format'})
  dateFormat!: string;

  /**
   * Controls the disabled state of the input
   */
  @property({type: Boolean, reflect: true})
  disabled = false;

  /**
   * The date range that a user can pick in calendar dropdown.
   */
  @property({attribute: 'enabled-range'})
  enabledRange!: string;

  /**
   * The maximum date that a user can start picking from.
   */
  @property({attribute: 'max-date'})
  maxDate!: string;

  /**
   * The minimum date that a user can start picking from.
   */
  @property({attribute: 'min-date'})
  minDate!: string;

  /**
   * Name for the input in the `FormData`
   */
  @property()
  name = '';

  /**
   * `true` if the date picker should be open.
   */
  @property({type: Boolean, reflect: true})
  open = false;

  /**
   * Specify if the component should be read-only
   */
  @property({type: Boolean, reflect: true})
  readonly = false;

  /**
   * The date(s) in ISO8601 format (date portion only), for range mode, '/' is used for separate start/end dates.
   */
  @property()
  get value() {
    return this._value;
  }

  /**
   * Sets the value
   *
   * @param {string} value - The new value
   */
  set value(value: string) {
    const {_value: oldValue} = this;
    this._value = value;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - requestUpdate is available from LitElement
    this.requestUpdate('value', oldValue);
  }

  /**
   * Handle clicks outside the date picker to close the calendar
   *
   * @param {MouseEvent} event - The click event
   */
  private _handleOutsideClick = (event: MouseEvent) => {
    if (!this.open) {
      return;
    }

    const target = event.target as Node;
    // Check if click is outside the date picker component
    if (!this.contains(target) && !this.shadowRoot?.contains(target)) {
      this.open = false;
      if (this._adapter) {
        this._adapter.send(DatePickerEvent.OUTSIDE_CLICK);
      }
    }
  };

  /**
   * Handle keyboard events for calendar navigation
   *
   * @param {KeyboardEvent} event - The keyboard event
   */
  private _handleKeyDown = (event: KeyboardEvent) => {
    if (!this._adapter) {
      return;
    }

    const { key } = event;

    // Handle Tab key
    if (key === 'Tab') {
      const composedPath = event.composedPath();
      const target = composedPath[0] as HTMLElement;
      
      // Get input elements
      const {selectorInputFrom, selectorInputTo} = this.constructor as typeof CDSDatePicker;
      const inputFrom = this.querySelector(selectorInputFrom) as CDSDatePickerInput;
      const inputTo = this.querySelector(selectorInputTo) as CDSDatePickerInput;
      
      // Check if focus is on input fields
      const isOnFirstInput = inputFrom && composedPath.includes(inputFrom);
      const isOnSecondInput = inputTo && composedPath.includes(inputTo);
      
      // Check if the target is the calendar element or within it
      const calendar = this.shadowRoot?.querySelector('cds-date-picker-calendar') as HTMLElement;
      const isFocusInCalendar = target === calendar ||
        target.closest?.('cds-date-picker-calendar') !== null ||
        composedPath.includes(calendar);
      
      // Case 1: Tab FROM first input -> Focus calendar (if open)
      if (this.open && isOnFirstInput && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        const calendarElement = this.shadowRoot?.querySelector('cds-date-picker-calendar') as any;
        const calendarDiv = calendarElement?.shadowRoot?.querySelector('.cds--date-picker__calendar') as HTMLElement;
        if (calendarDiv) {
          setTimeout(() => {
            calendarDiv.focus();
          }, 0);
        }
        return;
      }
      
      // Case 2: Tab FROM second input (range mode) -> Focus calendar (if open)
      if (this.open && isOnSecondInput && !event.shiftKey && this._mode === DATE_PICKER_MODE.RANGE) {
        event.preventDefault();
        event.stopPropagation(); // Prevent input from handling the event
        const calendarElement = this.shadowRoot?.querySelector('cds-date-picker-calendar') as any;
        const calendarDiv = calendarElement?.shadowRoot?.querySelector('.cds--date-picker__calendar') as HTMLElement;
        if (calendarDiv) {
          // Use setTimeout to ensure focus happens after event processing
          setTimeout(() => {
            calendarDiv.focus();
          }, 0);
        }
        return;
      }
      
      // Case 3: Shift+Tab FROM calendar -> Move to appropriate input
      if (this.open && isFocusInCalendar && event.shiftKey) {
        event.preventDefault();
        
        // In range mode, check which input was last focused
        if (this._mode === DATE_PICKER_MODE.RANGE) {
          const context = this._adapter?.getContext();
          const lastFocused = context?.lastFocusedInput;
          
          // If we were on the second input, go back to it
          if (lastFocused === 'to' && inputTo) {
            (inputTo as any).input?.focus();
          } else if (inputFrom) {
            // Otherwise go to first input
            (inputFrom as any).input?.focus();
          }
        } else {
          // Single mode: go to first input
          if (inputFrom) {
            (inputFrom as any).input?.focus();
          }
        }
        return;
      }
      
      // Case 4: Tab FROM calendar -> Move to second input (range) or close (single)
      if (this.open && isFocusInCalendar && !event.shiftKey) {
        event.preventDefault();
        
        // In range mode, check which input was last focused
        if (this._mode === DATE_PICKER_MODE.RANGE) {
          const context = this._adapter?.getContext();
          const lastFocused = context?.lastFocusedInput;
          
          // If we were on the first input, move to second input
          if (lastFocused === 'from' && inputTo) {
            (inputTo as any).input?.focus();
            return;
          }
        }
        
        // Otherwise (single mode or after second input in range mode), close and move to next element
        // Record the time when calendar was closed via Tab
        this._lastTabCloseTime = Date.now();
        
        this._adapter.send(DatePickerEvent.TAB_KEY);
        
        // Find and focus the next tabbable element after this date picker
        this._focusNextElement(false);
        return;
      }
    }

    // Only handle other keyboard events when calendar is open AND focus is in calendar
    if (!this.open) {
      return;
    }
    
    // Get the actual target from the composed path (handles shadow DOM)
    const composedPath = event.composedPath();
    const target = composedPath[0] as HTMLElement;
    const input = this.shadowRoot?.querySelector('input');
    
    // Only handle arrow keys, Page Up/Down, Home/End when focus is in calendar, not on input
    if (target === input) {
      return;
    }
    
    // Check if the target has the calendar class or is within an element with that class
    // The calendar div is inside the calendar renderer's shadow DOM
    const isFocusInCalendar = target.classList?.contains('cds--date-picker__calendar') ||
      target.closest?.('.cds--date-picker__calendar') !== null;
    
    if (!isFocusInCalendar) {
      return;
    }

    // Handle Escape key - close calendar
    if (key === 'Escape') {
      event.preventDefault();
      this.open = false;
      this._adapter.send(DatePickerEvent.ESCAPE_KEY);
      return;
    }

    // Handle Enter key - select focused date
    if (key === 'Enter') {
      event.preventDefault();
      
      // Get the focused date from context
      const context = this._adapter.getContext();
      const focusedDate = context.focusedDate;
      
      if (!focusedDate) {
        return;
      }
      
      // Dispatch the appropriate event based on mode and current state
      const currentState = this._adapter.getState();
      
      if (this._mode === DATE_PICKER_MODE.RANGE) {
        // In range mode, check if we're selecting start or end date
        if (currentState === 'selecting_end') {
          // Selecting end date
          this._adapter.send(DatePickerEvent.RANGE_END_SELECT, {
            date: focusedDate,
          });
        } else {
          // Selecting start date
          this._adapter.send(DatePickerEvent.RANGE_START_SELECT, {
            date: focusedDate,
          });
        }
      } else {
        // Single mode - just select the date
        this._adapter.send(DatePickerEvent.DATE_SELECT, {
          date: focusedDate,
        });
      }
      return;
    }

    // Handle arrow keys - navigate dates
    if (key === 'ArrowUp') {
      event.preventDefault();
      this._adapter.send(DatePickerEvent.ARROW_UP);
      return;
    }

    if (key === 'ArrowDown') {
      event.preventDefault();
      this._adapter.send(DatePickerEvent.ARROW_DOWN);
      return;
    }

    if (key === 'ArrowLeft') {
      event.preventDefault();
      this._adapter.send(DatePickerEvent.ARROW_LEFT);
      return;
    }

    if (key === 'ArrowRight') {
      event.preventDefault();
      this._adapter.send(DatePickerEvent.ARROW_RIGHT);
      return;
    }

    // Handle Page Up/Down - navigate months
    if (key === 'PageUp') {
      event.preventDefault();
      this._adapter.send(DatePickerEvent.PAGE_UP);
      return;
    }

    if (key === 'PageDown') {
      event.preventDefault();
      this._adapter.send(DatePickerEvent.PAGE_DOWN);
      return;
    }

    // Handle Home/End - navigate to start/end of week
    if (key === 'Home') {
      event.preventDefault();
      this._adapter.send(DatePickerEvent.HOME_KEY);
      return;
    }

    if (key === 'End') {
      event.preventDefault();
      this._adapter.send(DatePickerEvent.END_KEY);
      return;
    }
  };

  /**
   * Find and focus the next tabbable element after the date picker
   * @param {boolean} backwards - Whether to tab backwards (Shift+Tab)
   */
  private _focusNextElement(backwards = false) {
    // Get all tabbable elements in the document
    const tabbableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const allTabbable = Array.from(document.querySelectorAll(tabbableSelector)) as HTMLElement[];
    
    // Find the index of this date picker component
    const currentIndex = allTabbable.findIndex(el => this.contains(el) || el === this);
    
    if (currentIndex === -1) {
      return; // Couldn't find current element
    }
    
    // Find the next element after all elements within this date picker
    let nextIndex = currentIndex;
    
    if (backwards) {
      // Tab backwards - find previous element before this date picker
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (!this.contains(allTabbable[i])) {
          nextIndex = i;
          break;
        }
      }
    } else {
      // Tab forwards - find next element after this date picker
      for (let i = currentIndex + 1; i < allTabbable.length; i++) {
        if (!this.contains(allTabbable[i])) {
          nextIndex = i;
          break;
        }
      }
    }
    
    // Focus the next element
    if (nextIndex !== currentIndex && allTabbable[nextIndex]) {
      allTabbable[nextIndex].focus();
    }
  }

  /**
   * Lifecycle callback when element is connected
   */
  connectedCallback() {
    super.connectedCallback();
    this._initializeDatePicker();
    // Add outside click listener
    document.addEventListener('click', this._handleOutsideClick, true);
    // Add keyboard event listener
    document.addEventListener('keydown', this._handleKeyDown, true);
  }

  /**
   * Lifecycle callback when element is disconnected
   */
  disconnectedCallback() {
    // Remove outside click listener
    document.removeEventListener('click', this._handleOutsideClick, true);
    // Remove keyboard event listener
    document.removeEventListener('keydown', this._handleKeyDown, true);
    this._releaseDatePicker();
    super.disconnectedCallback();
  }

  /**
   * Lifecycle callback when properties change
   *
   * @param {Map<string, any>} changedProperties - Map of changed properties
   */
  updated(changedProperties: Map<string, any>) {
    if (this._adapter) {
      if (changedProperties.has('minDate') || changedProperties.has('maxDate')) {
        // Update context
        this._adapter.updateContext({
          minDate: this.minDate ? Temporal.PlainDate.from(this.minDate) : null,
          maxDate: this.maxDate ? Temporal.PlainDate.from(this.maxDate) : null,
        });
      }

      if (changedProperties.has('open')) {
        if (this.open && !this.readonly) {
          this._adapter.send(DatePickerEvent.CALENDAR_OPEN);
          // Show popover using Popover API
          this._showCalendarPopover();
        } else if (!this.open) {
          this._adapter.send(DatePickerEvent.CALENDAR_CLOSE);
          // Hide popover using Popover API
          this._hideCalendarPopover();
        }
      }

      if (changedProperties.has('disabled') || changedProperties.has('readonly')) {
        const {selectorInputFrom, selectorInputTo} = this
          .constructor as typeof CDSDatePicker;
        const inputFrom = this.querySelector(selectorInputFrom) as CDSDatePickerInput;
        const inputTo = this.querySelector(selectorInputTo) as CDSDatePickerInput;

        [inputFrom, inputTo].forEach((input) => {
          if (input) {
            input.disabled = this.disabled;
            input.readonly = this.readonly;
          }
        });

        this._adapter.updateContext({
          isDisabled: this.disabled,
          isReadonly: this.readonly,
        });
      }

      if (changedProperties.has('value') && this.value) {
        const dates = this.value.split('/').filter(Boolean);
        if (dates.length > 0) {
          // Convert ISO string to Temporal.PlainDate
          const startDate = parseISOToPlainDate(dates[0]);
          if (startDate) {
            this._adapter.send(
              this._mode === DATE_PICKER_MODE.RANGE ? DatePickerEvent.RANGE_START_SELECT : DatePickerEvent.DATE_SELECT,
              {date: startDate}
            );

            if (this._mode === DATE_PICKER_MODE.RANGE && dates.length > 1) {
              const endDate = parseISOToPlainDate(dates[1]);
              if (endDate) {
                this._adapter.send(DatePickerEvent.RANGE_END_SELECT, {date: endDate});
              }
            }
          }
        }
      }
    }
  }

  /**
   * Renders the component
   */
  render() {
    const {_handleSlotChange: handleSlotChange, _mode: mode, open} = this;
    const context = this._adapter?.getContext();
    const selectedDates = context?.endDate
      ? [context.startDate, context.endDate].filter(Boolean)
      : context?.startDate
      ? [context.startDate]
      : [];

    return html`
      <a
        class="${prefix}--visually-hidden"
        href="javascript:void 0"
        role="navigation"
        tabindex="-1"></a>
      <slot @slotchange="${handleSlotChange}"></slot>
      <div id="floating-menu-container" class="${prefix}--date-picker__calendar-container">
        ${mode !== DATE_PICKER_MODE.SIMPLE && open
          ? html`
            <cds-date-picker-calendar
              .rangeMode="${mode === DATE_PICKER_MODE.RANGE}"
              .dateFormat="${this.dateFormat || 'm/d/Y'}"
              .minDate="${this.minDate ? Temporal.PlainDate.from(this.minDate) : undefined}"
              .maxDate="${this.maxDate ? Temporal.PlainDate.from(this.maxDate) : undefined}"
              .selectedDates="${selectedDates}"
              .viewDate="${context?.viewDate || null}"
              .focusedDate="${context?.focusedDate || null}"
              @cds-date-picker-calendar-date-select="${this._handleCalendarDateSelect}"
              @cds-date-picker-calendar-month-change="${this._handleCalendarMonthChange}">
            </cds-date-picker-calendar>
          `
          : ''}
      </div>
      <a
        class="${prefix}--visually-hidden"
        href="javascript:void 0"
        role="navigation"
        tabindex="-1"></a>
    `;
  }

  /**
   * The CSS class for the calendar dropdown.
   */
  static get classCalendarContainer() {
    return `${prefix}--date-picker__calendar`;
  }

  /**
   * The CSS class for the month navigator.
   */
  static get classMonth() {
    return `${prefix}--date-picker__month`;
  }

  /**
   * The CSS class for the container of the weekdays.
   */
  static get classWeekdays() {
    return `${prefix}--date-picker__weekdays`;
  }

  /**
   * The CSS class for the container of the days.
   */
  static get classDays() {
    return `${prefix}--date-picker__days`;
  }

  /**
   * The CSS class applied to each weekdays.
   */
  static get classWeekday() {
    return `${prefix}--date-picker__weekday`;
  }

  /**
   * The CSS class applied to each days.
   */
  static get classDay() {
    return `${prefix}--date-picker__day`;
  }

  /**
   * The CSS class applied to the "today" highlight if there are any dates selected.
   */
  static classNoBorder = 'no-border';

  /**
   * The default date format.
   */
  static defaultDateFormat = 'm/d/Y';

  /**
   * A selector that will return the `<input>` to enter starting date.
   */
  static get selectorInputFrom() {
    return `${prefix}-date-picker-input,${prefix}-date-picker-input[kind="from"]`;
  }

  /**
   * A selector that will return the `<input>` to enter end date.
   */
  static get selectorInputTo() {
    return `${prefix}-date-picker-input[kind="to"]`;
  }

  /**
   * The name of the custom event when an error occurs.
   */
  static get eventError() {
    return `${prefix}-date-picker-error`;
  }

  /**
   * The name of the custom event fired when the date selection changes.
   */
  static get eventChange() {
    return `${prefix}-date-picker-changed`;
  }

  /**
   * The name of the custom event fired when the calendar icon is clicked.
   */
  static get eventIconClick() {
    return `${prefix}-date-picker-icon-click`;
  }

  /**
   * The name of the custom event fired when an input receives focus.
   */
  static get eventInputFocus() {
    return `${prefix}-date-picker-input-focus`;
  }

  /**
   * The name of the custom event fired when an input loses focus.
   */
  static get eventInputBlur() {
    return `${prefix}-date-picker-input-blur`;
  }

  static styles = styles;
}

export default CDSDatePicker;

// Made with Bob
