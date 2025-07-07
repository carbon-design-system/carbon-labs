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
import styles from './style-picker-modules.scss?inline';
import { query, state } from 'lit/decorators.js';

/**
 * Modules wrapper.
 */
class StylePickerModules extends LitElement {
  static styles = styles;

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
    this.defaultSlot.addEventListener('slotchange', () =>
      this.updateSlotIndexes()
    );
  }
}

export default StylePickerModules;
