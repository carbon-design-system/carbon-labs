/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-ignore
import { property, query } from 'lit/decorators.js';
import styles from './style-picker-disclosed.scss?inline';
import { LitElement, PropertyValues } from 'lit';
import { consume } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';

/**
 * Disclosed accordion element.
 */
class StylePickerDisclosed extends LitElement {
  static styles = styles;

  @query('cds-accordion-item') accordionItem;

  /**
   * Consume style-picker-context
   */
  @consume({ context: stylePickerContext, subscribe: true })
  _stylePickerContext?: StylePickerContextType;

  @property({ type: String, reflect: true, attribute: 'heading' })
  heading = '';

  // @property({ type: Number, reflect: true, attribute: 'slot-index' })
  // slotIndex?: number;

  /**
   * Lifecycle method called after the component is updated.
   * @param {object} changedProperties - Properties that have changed since the last update.
   */
  protected updated(): void {
    if (this.hasAttribute('open')) {
      this.accordionItem.setAttribute('open', '');
    } else {
      this.accordionItem.removeAttribute('open');
    }
  }

  /**
   * Getter for the slot index from the custom attribute set in the parent module.
   */
  get slotIndex() {
    return Number(this.getAttribute('data-slot-index'));
  }

  /**
   * Getter for the open state of the disclosed component.
   */
  // get open() {
  //   return this.accordionItem?.hasAttribute('open');
  // }
}

export default StylePickerDisclosed;
