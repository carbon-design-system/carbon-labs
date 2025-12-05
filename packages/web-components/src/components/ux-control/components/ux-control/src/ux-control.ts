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
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;

// @ts-ignore
import styles from './ux-control.scss?inline';
/**
 * Input component using search typeahead api
 */
export class UXControl extends LitElement {
  static styles = styles;

  /**
   * Prompt samples data
   */
  @property({ attribute: 'prompt-samples', type: Array })
  promptSamples;

  /**
   * Whether the prompt list modal is open or not
   */
  @property({ type: Boolean })
  open = true;

  /**
   * Prompt samples data
   */
  @property({ attribute: 'current-view', type: Object })
  currentView = {
    name: '',
    contextVariables: [],
    parameters: [],
  };

  /**
   * Prompt samples data
   */
  @property({ attribute: 'view-list', type: Array })
  viewList = [];

  /**
   * Whether the prompt edit modal is open or not
   */
  @property({ type: Boolean })
  isEditModalOpen = false;

  /**
   * New view name
   */
  @property({ type: String })
  private _newName = '';

  /**
   * Current prompt
   */
  @property({ type: String })
  // @ts-ignore: Used in template.ts
  private _currentPrompt = '';

  /**
   * Current context variables
   */
  @property({ type: Object })
  // @ts-ignore: Used in template.ts
  private _currentContextVariables = {};

  /**
   * Current response
   */
  @property({ type: String })
  // @ts-ignore: Used in template.ts
  private _currentResponse = '';

  /**
   * Current response view
   */
  @property({ type: String })
  // @ts-ignore: Used in template.ts
  private _currentResponseView = '';

  /**
   * Current parameters
   */
  @property({ type: Object })
  // @ts-ignore: Used in template.ts
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
   * New context variable to add
   */
  @property({ type: String })
  private _newContextVariable = '';

  /**
   * New parameter to add
   */
  @property({ type: String })
  private _newParameter = '';

  /**
   * Whether to show new prompt as opposed to edit prompt
   */
  @property({ type: Boolean })
  private _isNewPrompt = false;

  /**
   * Method for closing the Prompt List Modal
   */
  _onListModalClose() {
    this.open = false;
  }

  /**
   * Method for closing the Prompt Edit Modal
   */
  _onEditModalClose() {
    this._currentPrompt = '';
    this._currentContextVariables = {};
    this._currentResponse = '';
    this._currentResponseView = '';
    this._currentParameters = {};
    this.isEditModalOpen = false;
    this._isNewPrompt = false;
  }

  /**
   * Method for clicking the Cancel button on the Prompt Edit Modal
   */
  _onEditModalCancel() {
    this._currentPrompt = '';
    this._currentContextVariables = {};
    this._currentResponse = '';
    this._currentResponseView = '';
    this._currentParameters = {};
    this.isEditModalOpen = false;
    this.open = true;
    this._isNewPrompt = false;
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
    this.open = false;
    this.isEditModalOpen = true;
    this._currentPrompt = prompt;
    this._currentContextVariables = contextVariables;
    this._currentResponse = response;
    this._currentResponseView = responseView;
    this._currentParameters = parameters;
  }

  /**
   * Method when Add new prompt is clicked
   */
  _onNewPrompt() {
    this.open = false;
    this.isEditModalOpen = true;
    this._isNewPrompt = true;
  }

  /**
   * Method for clicking a table row Delete button
   * @param {string} prompt prompt
   * @param {Object} contextVariables context variables
   * @param {string} response response
   * @param {string} responseView response view
   * @param {Object} parameters parameters
   */
  onDeleteButtonClick(
    prompt,
    contextVariables,
    response,
    responseView,
    parameters
  ) {
    this.dispatchEvent(
      new CustomEvent('delete-prompt', {
        detail: {
          message: `Deleting prompt.`,
          prompt: {
            prompt: prompt,
            contextVariables: contextVariables,
            response: response,
            intentView: responseView,
            parameters: parameters,
          },
        },
      })
    );
  }

  /**
   * Method for toggling view rename
   */
  _toggleRename() {
    this._showRename = !this._showRename;
  }

  /**
   * Method for toggling if add context variable is clicked
   */
  _toggleAddContextVariable() {
    this._showAddContextVariable = !this._showAddContextVariable;
  }

  /**
   * Method for toggling if add parameter is clicked
   */
  _toggleAddParameter() {
    this._showAddParameter = !this._showAddParameter;
  }

  /**
   * Event handler to handle new view name input field updates
   * @param {event} event event
   */
  _handleNameInput(event) {
    this._newName = event.target.value;
  }

  /**
   * fire event when view rename is saved
   *
   */
  onSaveRename() {
    this.dispatchEvent(
      new CustomEvent('save-rename', {
        detail: {
          message: `Rename saved: ${this._newName}`,
          newName: this._newName,
        },
      })
    );
    this._toggleRename();
  }

  /**
   * Handle when close button on tag is clicked
   * @param {event} event event
   */
  handleCloseTag(event) {
    this.dispatchEvent(
      new CustomEvent('close-tag', {
        detail: {
          message: `Tag closed: ${event.target.title}`,
          closedTag: event.target.title,
          tagType: event.target.ariaLabel,
        },
      })
    );
  }

  /**
   * fire event when new context variable is added to the view
   *
   */
  addContextVariable() {
    this.dispatchEvent(
      new CustomEvent('add-context-variable', {
        detail: {
          message: `Add context variable: ${this._newContextVariable}`,
          newContextVariable: this._newContextVariable,
        },
      })
    );
    this._toggleAddContextVariable();
  }

  /**
   * fire event when new parameter is added to the view
   *
   */
  addParameter() {
    this.dispatchEvent(
      new CustomEvent('add-parameter', {
        detail: {
          message: `Add parameter: ${this._newParameter}`,
          newParameter: this._newParameter,
        },
      })
    );
    this._toggleAddParameter();
  }

  /**
   * Event handler to handle new context variable name
   * @param {event} event event
   */
  _handleContextVariableInput(event) {
    this._newContextVariable = event.target.value;
  }

  /**
   * Event handler to handle new parameter name
   * @param {event} event event
   */
  _handleParameterInput(event) {
    this._newParameter = event.target.value;
  }

  /**
   * fire event when save button when editing prompt is triggered
   *
   */
  triggerSubmit() {
    const form = this.shadowRoot?.getElementById(
      `${clabsPrefix}--edit-prompt-form`
    );
    if (form) {
      form.dispatchEvent(new Event('submit'));
    }
    this._onEditModalCancel();
  }

  /**
   * Event handler when prompt edit is saved
   * @param {event} event event
   */
  onSavePrompt(event) {
    event.preventDefault();
    const form = event.target;

    if (form) {
      const className = `.${clabsPrefix}--edit-form-item`;
      const items = form.querySelectorAll(className);
      const data = {};
      items.forEach((item) => {
        let key = '';

        if (item.classList.contains(`${clabsPrefix}--edit-context-variable`)) {
          key += '(context variable) ';
        } else if (item.classList.contains(`${clabsPrefix}--edit-parameter`)) {
          key += '(parameter) ';
        }

        if (item.tagName === 'CDS-TEXT-INPUT') {
          key += item.__label;
          data[key] = item._value;
        } else if (item.tagName === 'CDS-SELECT') {
          key += item.__labelText;
          data[key] = item.__value;
        } else {
          key += item.__label;
          data[key] = item._value;
        }
      });

      if (this._isNewPrompt) {
        this.dispatchEvent(
          new CustomEvent('add-prompt', {
            detail: { formData: data },
          })
        );
      } else {
        this.dispatchEvent(
          new CustomEvent('save-prompt', {
            detail: { formData: data },
          })
        );
      }
    }
  }

  /**
   * Event handler to handle user changing current view
   * @param {event} event event
   */
  onChangeView(event) {
    this.dispatchEvent(
      new CustomEvent('change-view', {
        detail: { newView: event.target.value },
      })
    );
  }
}
