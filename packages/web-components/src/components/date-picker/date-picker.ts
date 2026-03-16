/**
 * Copyright IBM Corp. 2019, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { prefix } from './temp-imports/globals/settings';
import FormMixin from './temp-imports/globals/mixins/form';
import HostListenerMixin from './temp-imports/globals/mixins/host-listener';
import HostListener from './temp-imports/globals/decorators/host-listener';
import CDSDatePickerInput from './date-picker-input';
import CDSDatePickerCalendar from './calendar-renderer';
import { DatePickerMachine } from './state-machine/machine';
import { WebComponentAdapter } from './state-machine/adapters/web-component-adapter';
import type { DatePickerState, DatePickerEvent } from './state-machine/types';
import styles from './date-picker.scss?lit';
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
@customElement(`${prefix}-date-picker`)
class CDSDatePicker extends HostListenerMixin(FormMixin(LitElement)) {
  /**
   * The slotted `<cds-date-input kind="from">`.
   */
  private _dateInteractNode: CDSDatePickerInput | null = null;

  /**
   * The element to put calendar dropdown in.
   */
  @query('#floating-menu-container')
  private _floatingMenuContainerNode!: HTMLDivElement;

  /**
   * The calendar component reference.
   */
  @query(`${prefix}-date-picker-calendar`)
  private _calendarNode?: CDSDatePickerCalendar;

  /**
   * The internal placeholder for the `value` property.
   */
  private _value!: string;

  /**
   * The state machine instance.
   */
  private _machine: DatePickerMachine | null = null;

  /**
   * The adapter for Web Component integration.
   */
  private _adapter: WebComponentAdapter | null = null;

  /**
   * @returns The effective date picker mode, determined by the child `<cds-date-picker-input>`.
   */
  private get _mode() {
    const { selectorInputTo } = this.constructor as typeof CDSDatePicker;
    if (this.querySelector(selectorInputTo)) {
      return DATE_PICKER_MODE.RANGE;
    }
    if (this.querySelector(`${prefix}-date-picker-input[kind="single"]`)) {
      return DATE_PICKER_MODE.SINGLE;
    }
    return DATE_PICKER_MODE.SIMPLE;
  }

  /**
   * Handles `${prefix}-date-picker-changed` event on this element.
   */
  @HostListener('eventChange')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: The decorator refers to this method but TS thinks this method is not referred to
  private _handleChange = ({ detail }: CustomEvent) => {
    const { selectedDates } = detail;
    if (selectedDates && Array.isArray(selectedDates)) {
      this._value = selectedDates
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
   * Handles form data event
   * @param event The form data event
   */
  _handleFormdata(event: FormDataEvent) {
    const { formData } = event;
    const { disabled, name, value } = this;
    if (!disabled) {
      formData.append(name, value);
    }
  }

  /**
   * Handles `slotchange` event in the `<slot>`.
   * @param target The event target
   */
  private _handleSlotChange({ target }: Event) {
    const { _dateInteractNode: oldDateInteractNode } = this;
    const dateInteractNode = (target as HTMLSlotElement)
      .assignedNodes()
      .find(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node as HTMLElement).matches(
            (this.constructor as typeof CDSDatePicker).selectorInputFrom
          )
      );
    if (oldDateInteractNode !== dateInteractNode) {
      this._dateInteractNode = dateInteractNode as CDSDatePickerInput;
      this._initializeDatePicker();
    }
  }

  /**
   * Fires a custom event to notify an error.
   * @param error The error object
   */
  private _handleError = (error: Error) => {
    this.dispatchEvent(
      new CustomEvent(
        (this.constructor as typeof CDSDatePicker).eventError,
        {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: {
            error,
          },
        }
      )
    );
  };

  /**
   * Handles state machine state changes
   * @param state The new state
   */
  private _handleStateChange = (state: DatePickerState) => {
    // Update open property based on state
    if (state.currentState === 'calendar_open') {
      this.open = true;
    } else if (
      state.currentState === 'idle' ||
      state.currentState === 'focused'
    ) {
      this.open = false;
    }

    // Dispatch change event when dates are selected
    if (
      state.currentState === 'date_selected' ||
      state.currentState === 'range_selected'
    ) {
      this.dispatchEvent(
        new CustomEvent(
          (this.constructor as typeof CDSDatePicker).eventChange,
          {
            bubbles: true,
            composed: true,
            detail: {
              selectedDates: state.selectedDates,
              value: this._value,
            },
          }
        )
      );
    }

    // Handle errors
    if (state.currentState === 'error' && state.error) {
      this._handleError(state.error);
    }
  };

  /**
   * Initializes the date picker with state machine.
   */
  private _initializeDatePicker() {
    this._releaseDatePicker();
    const { _dateInteractNode: dateInteractNode, _mode: mode } = this;

    // Don't instantiate in simple mode
    if (!dateInteractNode || !dateInteractNode.input || mode === 'simple') {
      return;
    }

    const { selectorInputFrom, selectorInputTo } = this
      .constructor as typeof CDSDatePicker;
    const inputFrom = this.querySelector(selectorInputFrom) as CDSDatePickerInput;
    const inputTo = this.querySelector(selectorInputTo) as CDSDatePickerInput;

    // Create state machine
    this._machine = new DatePickerMachine({
      mode: mode === DATE_PICKER_MODE.RANGE ? 'range' : 'single',
      dateFormat: this.dateFormat || 'm/d/Y',
      minDate: this.minDate,
      maxDate: this.maxDate,
      allowInput: this.allowInput,
      closeOnSelect: this.closeOnSelect,
    });

    // Create adapter
    this._adapter = new WebComponentAdapter(
      this._machine,
      this,
      inputFrom,
      inputTo || undefined
    );

    // Subscribe to state changes
    this._machine.subscribe(this._handleStateChange);

    // Set initial value if provided
    if (this.value) {
      const dates = this.value.split('/').filter(Boolean);
      if (dates.length > 0) {
        this._machine.send({
          type: mode === DATE_PICKER_MODE.RANGE ? 'RANGE_START_SELECT' : 'DATE_SELECT',
          date: dates[0],
        } as DatePickerEvent);

        if (mode === DATE_PICKER_MODE.RANGE && dates.length > 1) {
          this._machine.send({
            type: 'RANGE_END_SELECT',
            date: dates[1],
          } as DatePickerEvent);
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
    if (this._machine) {
      this._machine = null;
    }
  }

  /**
   * Allows the user to enter a date directly into the input field
   */
  @property({ type: Boolean, reflect: true, attribute: 'allow-input' })
  allowInput = true;

  /**
   * Controls whether the calendar dropdown closes upon selection.
   */
  @property({ type: Boolean, reflect: true, attribute: 'close-on-select' })
  closeOnSelect = true;

  /**
   * The date format.
   */
  @property({ attribute: 'date-format' })
  dateFormat!: string;

  /**
   * Controls the disabled state of the input
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * The date range that a user can pick in calendar dropdown.
   */
  @property({ attribute: 'enabled-range' })
  enabledRange!: string;

  /**
   * The maximum date that a user can start picking from.
   */
  @property({ attribute: 'max-date' })
  maxDate!: string;

  /**
   * The minimum date that a user can start picking from.
   */
  @property({ attribute: 'min-date' })
  minDate!: string;

  /**
   * Name for the input in the `FormData`
   */
  @property()
  name = '';

  /**
   * `true` if the date picker should be open.
   */
  @property({ type: Boolean, reflect: true })
  open = false;

  /**
   * Specify if the component should be read-only
   */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /**
   * The date(s) in ISO8601 format (date portion only), for range mode, '/' is used for separate start/end dates.
   */
  @property()
  get value() {
    return this._value;
  }

  set value(value: string) {
    const { _value: oldValue } = this;
    this._value = value;
    this.requestUpdate('value', oldValue);
  }

  connectedCallback() {
    super.connectedCallback();
    this._initializeDatePicker();
  }

  disconnectedCallback() {
    this._releaseDatePicker();
    super.disconnectedCallback();
  }

  updated(changedProperties) {
    if (this._machine) {
      if (changedProperties.has('minDate') || changedProperties.has('maxDate')) {
        // Update machine config
        this._machine.send({
          type: 'UPDATE_CONFIG',
          config: {
            minDate: this.minDate,
            maxDate: this.maxDate,
          },
        } as DatePickerEvent);
      }

      if (changedProperties.has('open')) {
        if (this.open && !this.readonly) {
          this._machine.send({ type: 'CALENDAR_TOGGLE' } as DatePickerEvent);
        } else if (!this.open) {
          this._machine.send({ type: 'CALENDAR_CLOSE' } as DatePickerEvent);
        }
      }

      if (changedProperties.has('disabled') || changedProperties.has('readonly')) {
        const { selectorInputFrom, selectorInputTo } = this
          .constructor as typeof CDSDatePicker;
        const inputFrom = this.querySelector(selectorInputFrom) as CDSDatePickerInput;
        const inputTo = this.querySelector(selectorInputTo) as CDSDatePickerInput;

        [inputFrom, inputTo].forEach((input) => {
          if (input) {
            input.disabled = this.disabled;
            input.readonly = this.readonly;
          }
        });
      }

      if (changedProperties.has('value') && this.value) {
        const dates = this.value.split('/').filter(Boolean);
        if (dates.length > 0) {
          this._machine.send({
            type: this._mode === DATE_PICKER_MODE.RANGE ? 'RANGE_START_SELECT' : 'DATE_SELECT',
            date: dates[0],
          } as DatePickerEvent);

          if (this._mode === DATE_PICKER_MODE.RANGE && dates.length > 1) {
            this._machine.send({
              type: 'RANGE_END_SELECT',
              date: dates[1],
            } as DatePickerEvent);
          }
        }
      }
    }
  }

  /**
   * Renders the component
   */
  render() {
    const { _handleSlotChange: handleSlotChange, _mode: mode, open } = this;

    return html`
      <a
        class="${prefix}--visually-hidden"
        href="javascript:void 0"
        role="navigation"
        tabindex="-1"></a>
      <slot @slotchange="${handleSlotChange}"></slot>
      <div id="floating-menu-container">
        ${mode !== DATE_PICKER_MODE.SIMPLE && open
          ? html`
              <cds-date-picker-calendar
                .rangeMode="${mode === DATE_PICKER_MODE.RANGE}"
                .dateFormat="${this.dateFormat || 'm/d/Y'}"
                .minDate="${this.minDate}"
                .maxDate="${this.maxDate}">
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

  static styles = styles;
}

export default CDSDatePicker;

// Made with Bob
