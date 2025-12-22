/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, PropertyValues } from 'lit';
// @ts-ignore
import styles from './style-picker-option.scss?inline';
import { property } from 'lit/decorators.js';
import CLABSStylePickerOption from '../style-picker-option';
import { consume } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
import { prefix } from '../../../defs';
import { settings } from '@carbon-labs/utilities';
import HostListener from '@carbon/web-components/es/globals/decorators/host-listener.js';
import HostListenerMixin from '@carbon/web-components/es/globals/mixins/host-listener.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * style-picker-option extends LitElement.
 *
 * @fires clabs-style-picker-option-change - fired when an option is selected/changed.
 */
class StylePickerOption extends HostListenerMixin(LitElement) {
  static styles = styles;
  blockClass = `${clabsPrefix}--style-picker-option`;

  /**
   * Consume style-picker-context
   */
  @consume({ context: stylePickerContext, subscribe: true })
  _stylePickerContext?: StylePickerContextType;

  @property({ type: String, reflect: true, attribute: 'label' })
  label = '';

  @property({ type: String, reflect: true, attribute: 'value' })
  value = '';

  @property({ type: Boolean, reflect: true, attribute: 'selected' })
  selected = false;

  /**
   * @param {string} triggeredBy - the element that triggered the change.
   */
  @HostListener('click', { capture: true })
  handleClick() {
    this.handleSelection();
  }

  /**
   * @param {KeyboardEvent} event - the element that triggered the change.
   */
  @HostListener('keydown', { capture: true })
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      this.handleSelection();
    }
  }

  /**
   * Handle 'click' or 'Enter' key selection
   */
  handleSelection() {
    this.selected = true;
    this.setAttribute('aria-selected', 'true');

    const section = this.closest(`${prefix}-section`);
    const allOptions = section?.querySelectorAll(`${prefix}-option`);

    allOptions?.forEach((optionEl) => {
      if (optionEl?.getAttribute('value') === this.value) {
        optionEl.setAttribute('selected', '');
      } else {
        optionEl.removeAttribute('selected');
      }
    });

    const init = {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        triggeredBy: this,
        value: this.value,
        label: this.label,
        selected: true,
      },
    };

    const newEvent = new CustomEvent(
      (this.constructor as typeof CLABSStylePickerOption).eventOptionChange,
      init
    );

    this.dispatchEvent(newEvent);
  }

  /**
   * The name of the custom event fired after an option is changed.
   */
  static get eventOptionChange() {
    return `${prefix}-option-select`;
  }

  /**
   * Set attributes and classes.
   */
  _updateAttributes() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'option');
    }

    if (!this.hasAttribute('aria-label') && this.label?.trim()?.length) {
      this.setAttribute('aria-label', this.label);
    }

    if (!this.hasAttribute('title') && this.label?.trim()?.length) {
      this.setAttribute('title', this.label);
    }

    if (!this.hasAttribute('data-value') && this.value?.trim()?.length) {
      this.setAttribute('data-value', this.value);
    }

    this.classList.add(this.blockClass);
    this.classList.add(`${this.blockClass}--${this._stylePickerContext?.size}`);
  }

  /**
   * Invoked whenever the element is updated.
   * @param {PropertyValues} _changedProperties - Changed properties with old values.
   */
  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('selected')) {
      this.setAttribute('aria-selected', `${this.selected}`);
      this.setAttribute('tabindex', this.selected ? '0' : '-1');
    }
  }

  /**
   * Lifecycle method called when the element is added to a document.
   */
  protected firstUpdated(): void {
    this._updateAttributes();
  }
}

export default StylePickerOption;
