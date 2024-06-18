/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

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
    console.log(`after close: this.isListModalOpen=${this.isListModalOpen}`);
  }

  /**
   * Method for closing the Prompt Edit Modal
   */
  _onEditModalClose() {
    this.isEditModalOpen = false;
    console.log(`after close: this.isEditModalOpen=${this.isEditModalOpen}`);
  }

  /**
   * Method for clicking a table row Edit button
   */
  _onEditButtonClick() {
    console.log(`edit button click`);
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
