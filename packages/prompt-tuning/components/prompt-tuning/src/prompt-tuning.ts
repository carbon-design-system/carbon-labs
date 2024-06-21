/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

// @ts-ignore
import styles from './prompt-tuning.scss?inline';
/**
 * Input component using search typeahead api
 */
export class PromptTuning extends LitElement {
  static styles = styles;

  /**
   * Text inside the prompt-tuning
   */
  @property({ attribute: 'text', type: String })
  text;

  /**
   * Model ID or Model Name for which feedback is recording
   */
  @property({ attribute: 'data', type: Array })
  data;

  /**
   * Whether the prompt list modal is open or not
   */
  @property({ type: Boolean })
  isListModalOpen = false;

  /**
   * Whether the prompt edit modal is open or not
   */
  @property({ type: Boolean })
  isEditModalOpen = false;

  /**
   * Method for closing the Prompt List Modal
   */
  _onListModalClose() {
    this.isListModalOpen = false;
  }

  /**
   * Method for closing the Prompt Edit Modal
   */
  _onEditModalClose() {
    this.isEditModalOpen = false;
  }

  /**
   * Method for clicking the Cancel button on the Prompt Edit Modal
   */
  _onEditModalCancel() {
    this.isEditModalOpen = false;
    this.isListModalOpen = true;
  }

  /**
   * Method for clicking a table row Edit button
   */
  _onEditButtonClick() {
    this.isListModalOpen = false;
    this.isEditModalOpen = true;
  }

  // /**
  //  * updated - check changed properties
  //  * @param {object} changedProperties - LIT object denoting changed attributes
  //  */
  // updated(changedProperties) {
  //   console.log(`updated`);
  //   super.updated(changedProperties);
  //   if (changedProperties.has('isListModalOpen')) {
  //     console.log(`updated isListModalOpen: ${this.isListModalOpen}`);
  //     // this.isListModalOpen = this.isListModalOpen;
  //   }
  // }
}
