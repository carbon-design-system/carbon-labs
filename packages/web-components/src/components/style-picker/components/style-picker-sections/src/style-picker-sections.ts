/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
// @ts-ignore
import styles from './style-picker-sections.scss?inline';
import { query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
import { prefix } from '../../../defs';

/**
 * Sections wrapper.
 */
class StylePickerSections extends LitElement {
  static styles = styles;

  /**
   * Consume style-picker-context
   */
  @consume({ context: stylePickerContext, subscribe: true })
  _stylePickerContext?: StylePickerContextType;

  /**
   * The tag name of the custom element.
   * @type {string}
   */
  @query('slot') defaultSlot;

  @state()
  /**
   * The number of slots assigned to the component.
   * @type {number}
   */
  slotCount = 0;

  /**
   *
   * @param {object} e - Event triggered when the slot changes
   * @description Updates the slot count based on the assigned elements in the slot.
   * @returns {void}
   */
  updateSlotCount = (e) => {
    const slot = e.target;
    this.slotCount = slot.assignedElements({ flatten: true }).length;
  };

  /**
   * Updates the slot indexes for each assigned element.
   */
  updateSlotIndexes() {
    const assignedElements = this.defaultSlot.assignedElements({
      flatten: true,
    });
    assignedElements.forEach((el, index) => {
      el.setAttribute('data-slot-index', index); // Set a custom attribute for slot index
    });
  }

  /**
   * @description Lifecycle method that runs after the component has been updated.
   */
  firstUpdated() {
    this.updateSlotIndexes();
  }

  /**
   * Lifecycle method called after the component is updated.
   * @param {object} changedProperties - Properties that have changed since the last update.
   */
  protected updated() {
    const sectionElements = this.querySelectorAll(`${prefix}-section`);

    sectionElements.forEach((item) => {
      if (
        this._stylePickerContext?.activeSection ===
        Number(item.getAttribute('data-slot-index'))
      ) {
        item.setAttribute('open', '');
      } else {
        item.removeAttribute('open');
      }
    });

    if (
      this._stylePickerContext?.sectionCount !== undefined &&
      this._stylePickerContext?.sectionCount !== this.slotCount
    ) {
      this.slotCount = this._stylePickerContext?.sectionCount;
    }
  }
}

export default StylePickerSections;
