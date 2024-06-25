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
   * Current prompt
   */
  @property({ type: String })
  private _currentPrompt = '';

  /**
   * Current context variables
   */
  @property({ type: Object })
  private _currentContextVariables = {};

  /**
   * Current response
   */
  @property({ type: String })
  private _currentResponse = '';

  /**
   * Current response view
   */
  @property({ type: String })
  private _currentResponseView = '';

  /**
   * Current parameters
   */
  @property({ type: Object })
  private _currentParameters = {};

  /**
   * Current response view
   */
  @property({ type: Boolean })
  private _showRename = false;

  /**
   * Show add context variable
   */
  @property({ type: Boolean })
  private _showAddContextVariable = false;

  /**
   * Show add parameter
   */
  @property({ type: Boolean })
  private _showAddParameter = false;

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
   * @param {string} prompt prompt
   * @param {Object} contextVariables context variables
   * @param {string} response response
   * @param {string} responseView response view
   * @param {Object} parameters parameters
   */
  _onEditButtonClick(
    prompt,
    contextVariables,
    response,
    responseView,
    parameters
  ) {
    this.isListModalOpen = false;
    this.isEditModalOpen = true;
    this._currentPrompt = prompt;
    this._currentContextVariables = contextVariables;
    this._currentResponse = response;
    this._currentResponseView = responseView;
    this._currentParameters = parameters;
  }

  /**
   * Method for toggling view rename
   */
  _toggleRename() {
    this._showRename = !this._showRename;
  }

  /**
   * Method for toggling view rename
   */
  _toggleAddContextVariable() {
    this._showAddContextVariable = !this._showAddContextVariable;
  }

  /**
   * Method for toggling view rename
   */
  _toggleAddParameter() {
    this._showAddParameter = !this._showAddParameter;
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
