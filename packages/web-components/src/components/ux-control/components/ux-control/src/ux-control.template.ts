/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;
import '@carbon/web-components/es/components/modal/index.js';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/form-group/index.js';
import Edit16 from '@carbon/icons/es/edit/16.js';
import TrashCan16 from '@carbon/icons/es/trash-can/16.js';
import Add16 from '@carbon/icons/es/add/16.js';
import RequestQuote16 from '@carbon/icons/es/request-quote/16.js';
import Close16 from '@carbon/icons/es/close/16.js';
import Checkmark16 from '@carbon/icons/es/checkmark/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

import '@carbon/web-components/es/components/tag/index.js';

import '@carbon/web-components/es/components/text-input/index.js';
import '@carbon/web-components/es/components/select/index.js';
import '@carbon/web-components/es/components/form/index.js';
import '@carbon/web-components/es/components/tooltip/index.js';

/**
 * Render HTML rows
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
function getHTMLRows(customElementClass) {
  const {
    promptSamples: promptSamples,
    _onEditButtonClick: onEditButtonClick,
    onDeleteButtonClick: onDeleteButtonClick,
  } = customElementClass;

  return html`
    ${promptSamples.map(
      (item) =>
        html`<cds-table-row>
          <cds-table-cell
            >${item.input.input}
            ${Object.keys(item.input.context_variables).length > 0
              ? html`${Object.entries(item.input.context_variables).map(
                  (item) =>
                    item.length > 0
                      ? html`
                          <cds-tooltip align="bottom">
                            <div
                              class="sb-tooltip-trigger"
                              aria-labelledby="content">
                              <cds-tag type="gray"
                                ><span>${item[1]}</span></cds-tag
                              >
                            </div>
                            <cds-tooltip-content id="content">
                              ${item[0]}: ${item[1]}
                            </cds-tooltip-content>
                          </cds-tooltip>
                        `
                      : html``
                )}`
              : html``}
          </cds-table-cell>
          <cds-table-cell>${item.output.output}</cds-table-cell>
          <cds-table-cell
            >${item.output.view_id}
            ${Object.keys(item.output.parameters).length > 0
              ? html`${Object.entries(item.output.parameters).map((item) =>
                  item.length > 0
                    ? html`
                        <cds-tooltip align="bottom">
                          <div
                            class="sb-tooltip-trigger"
                            aria-labelledby="content">
                            <cds-tag type="gray"
                              ><span>${item[1]}</span></cds-tag
                            >
                          </div>
                          <cds-tooltip-content id="content">
                            ${item[0]}: ${item[1]}
                          </cds-tooltip-content>
                        </cds-tooltip>
                      `
                    : html``
                )}`
              : html``}
          </cds-table-cell>
          <cds-table-cell class="${clabsPrefix}--table-actions"
            ><cds-button
              @click=${onEditButtonClick.bind(
                customElementClass,
                item.input.input,
                item.input.context_variables,
                item.output.output,
                item.output.view_id,
                item.output.parameters
              )}
              kind="ghost">
              ${iconLoader(Edit16())} </cds-button
            ><cds-button
              @click=${onDeleteButtonClick.bind(
                customElementClass,
                item.input.input,
                item.input.context_variables,
                item.output.output,
                item.output.view_id,
                item.output.parameters
              )}
              kind="danger--ghost">
              ${iconLoader(TrashCan16())}
            </cds-button></cds-table-cell
          >
        </cds-table-row>`
    )}
  `;
}

/**
 * Render views for select
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
function getSelectViews(customElementClass) {
  const { viewList: viewList } = customElementClass;

  const views = viewList.map((view) => {
    return html`<cds-select-item value="${view}">${view}</cds-select-item>`;
  });

  return views;
}

/**
 * Render HTML rows
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
function getEditModal(customElementClass) {
  const {
    viewList: viewList,
    _currentPrompt: currentPrompt,
    _currentContextVariables: currentContextVariables,
    _currentResponse: currentResponse,
    _currentResponseView: currentResponseView,
    _currentParameters: currentParameters,
    isEditModalOpen,
    _onEditModalClose: onEditModalClose,
    _onEditModalCancel: onEditModalCancel,
    onSavePrompt: onSavePrompt,
    triggerSubmit: triggerSubmit,
    _isNewPrompt: isNewPrompt,
    currentView: currentView,
  } = customElementClass;

  let modalHeader, selectedView, contextVariables, parameters;

  if (isNewPrompt) {
    modalHeader = `Add new prompt for ${currentView.name}`;
    selectedView = currentView.name;
    contextVariables =
      currentView.contextVariables.length <= 0
        ? html`<div>
            This intent/view does not provide any context variables.
          </div>`
        : currentView.contextVariables.map(
            (variable) => html` <cds-text-input
              class="${clabsPrefix}--edit-form-item ${clabsPrefix}--edit-context-variable"
              label=${variable}
              invalid-text="Error message"
              placeholder="Enter sample value...">
            </cds-text-input>`
          );
    parameters =
      currentView.parameters.length <= 0
        ? html`<div>This intent/view does not provide any parameters.</div>`
        : currentView.parameters.map(
            (parameter) => html` <cds-text-input
              class="${clabsPrefix}--edit-form-item ${clabsPrefix}--edit-parameter"
              label=${parameter}
              invalid-text="Error message"
              placeholder="Enter expected value...">
            </cds-text-input>`
          );
  } else {
    modalHeader = 'Edit prompt';
    selectedView = currentResponseView;
    contextVariables =
      Object.keys(currentContextVariables).length <= 0
        ? html`<div>
            This intent/view does not provide any context variables.
          </div>`
        : Object.entries(currentContextVariables).map(
            ([key, value]) => html` <cds-text-input
              class="${clabsPrefix}--edit-form-item ${clabsPrefix}--edit-context-variable"
              label=${key}
              invalid-text="Error message"
              placeholder="Enter sample value..."
              value=${value}>
            </cds-text-input>`
          );
    parameters =
      Object.keys(currentParameters).length <= 0
        ? html`<div>This intent/view does not provide any parameters.</div>`
        : Object.entries(currentParameters).map(
            ([key, value]) => html` <cds-text-input
              class="${clabsPrefix}--edit-form-item ${clabsPrefix}--edit-parameter"
              label=${key}
              invalid-text="Error message"
              placeholder="Enter expected value..."
              value=${value}>
            </cds-text-input>`
          );
  }

  return html`<cds-modal
    id="modal-edit-prompt"
    size="lg"
    ?open=${isEditModalOpen}
    @cds-modal-closed=${onEditModalClose}>
    <cds-modal-header>
      <cds-modal-close-button></cds-modal-close-button>
      <cds-modal-heading>${modalHeader}</cds-modal-heading>
    </cds-modal-header>
    <cds-modal-body>
      <cds-form-group
        id="${clabsPrefix}--edit-prompt-form"
        @submit=${onSavePrompt}>
        <cds-stack gap="10">
          <div class="${clabsPrefix}--prompt-edit-form">
            <div class="${clabsPrefix}--edit-input">
              <cds-text-input
                class="${clabsPrefix}--edit-form-item"
                label="Sample prompt"
                invalid-text="Error message"
                placeholder="Enter sample prompt..."
                helper-text=" "
                value=${currentPrompt}>
              </cds-text-input>

              <h4>Context variables</h4>
              ${contextVariables}
            </div>
            <div class="${clabsPrefix}--edit-output">
              <cds-text-input
                class="${clabsPrefix}--edit-form-item"
                label="Expected message"
                invalid-text="Error message"
                placeholder="Enter expected generated message..."
                value=${currentResponse}>
              </cds-text-input>

              <cds-select
                class="${clabsPrefix}--edit-form-item"
                helper-text=" "
                label-text="Intent/View"
                value=${selectedView}>
                ${viewList.map(
                  (view) =>
                    html`<cds-select-item value="${view}"
                      >${view}</cds-select-item
                    >`
                )}
              </cds-select>

              <h4>Expected intent/view parameters</h4>
              ${parameters}
            </div>
          </div>
        </cds-stack>
      </cds-form-group>
    </cds-modal-body>
    <cds-modal-footer>
      <cds-modal-footer-button kind="secondary" @click=${onEditModalCancel}
        >Cancel</cds-modal-footer-button
      >
      <cds-modal-footer-button @click=${triggerSubmit} kind="primary"
        >Save</cds-modal-footer-button
      >
    </cds-modal-footer>
  </cds-modal>`;
}

/**
 * Lit template for UX Control
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function uxControlTemplate(customElementClass) {
  const {
    currentView: currentView,
    open,
    _onListModalClose: onListModalClose,
    _showRename: showRename,
    _showAddContextVariable: showAddContextVariable,
    _showAddParameter: showAddParameter,
    _toggleRename: toggleRename,
    _toggleAddContextVariable: toggleAddContextVariable,
    _toggleAddParameter: toggleAddParameter,
    addContextVariable: addContextVariable,
    addParameter: addParameter,
    _handleContextVariableInput: handleContextVariableInput,
    _handleParameterInput: handleParameterInput,
    onSaveRename: onSaveRename,
    _handleNameInput: handleNameInput,
    onChangeView: onChangeView,
    _onNewPrompt: onNewPrompt,
    handleCloseTag: handleCloseTag,
  } = customElementClass;

  return html` <div class="${clabsPrefix}--ux-control">
    <cds-modal
      id="modal-prompt-list"
      size="lg"
      ?has-scrolling-content=${true}
      ?open=${open}
      @cds-modal-closed=${onListModalClose}>
      <cds-modal-header>
        <cds-modal-close-button></cds-modal-close-button>
        <cds-modal-heading class="${clabsPrefix}--heading-container">
          <div class="${clabsPrefix}--heading">
            <div class="${clabsPrefix}--heading-tune-prompts">
              Tune prompts for
            </div>
            ${!showRename
              ? html`<cds-select
                    class="${clabsPrefix}--view-dropdown"
                    inline="true"
                    value=${currentView.name}
                    @cds-select-selected=${onChangeView}>
                    ${getSelectViews(customElementClass)}
                  </cds-select>

                  <cds-tooltip align="bottom">
                    <div class="sb-tooltip-trigger" aria-labelledby="content">
                      <cds-button @click=${toggleRename} kind="ghost">
                        ${iconLoader(RequestQuote16())}
                      </cds-button>
                    </div>
                    <cds-tooltip-content id="content">
                      Rename intent/view</cds-tooltip-content
                    >
                  </cds-tooltip>`
              : html`
                  <div class="${clabsPrefix}--rename">
                    <cds-form-item>
                      <cds-text-input
                        class="${clabsPrefix}--rename-text"
                        invalid-text="Error message"
                        placeholder="Enter new view name..."
                        value=${currentView.name}
                        @input=${handleNameInput}>
                      </cds-text-input>
                    </cds-form-item>
                  </div>
                  <cds-tooltip align="bottom">
                    <div class="sb-tooltip-trigger" aria-labelledby="content">
                      <cds-button @click=${toggleRename} kind="danger--ghost">
                        ${iconLoader(Close16())}
                      </cds-button>
                    </div>
                    <cds-tooltip-content id="content">
                      Cancel rename</cds-tooltip-content
                    >
                  </cds-tooltip>
                  <cds-tooltip align="bottom">
                    <div class="sb-tooltip-trigger" aria-labelledby="content">
                      <cds-button @click=${onSaveRename} kind="ghost">
                        ${iconLoader(Checkmark16())}
                      </cds-button>
                    </div>
                    <cds-tooltip-content id="content">
                      Save rename</cds-tooltip-content
                    >
                  </cds-tooltip>
                `}
          </div>

          <div class="${clabsPrefix}--header-view-info">
            <div class="${clabsPrefix}--header-context-variables">
              <h6 style="margin:0;">Context Variables:</h6>
              ${currentView.contextVariables.length <= 0
                ? html`<div>
                    This intent/view does not provide any parameters.
                  </div>`
                : currentView.contextVariables.map(
                    (variable) => html`<cds-tag
                      filter
                      type="gray"
                      title="${variable}"
                      textContent="${variable}"
                      aria-label="Context variable"
                      @cds-tag-closed=${handleCloseTag}>
                      ${variable}
                    </cds-tag>`
                  )}
              ${!showAddContextVariable
                ? html` <cds-tag
                    class="${clabsPrefix}--add-context-variable-tag"
                    @click=${toggleAddContextVariable}
                    type="gray">
                    ${iconLoader(Add16, { slot: 'icon' })} Add context variable
                  </cds-tag>`
                : html`
                    <div class="${clabsPrefix}--enter-new">
                      <cds-form-item>
                        <cds-text-input
                          class="${clabsPrefix}--new-context-variable"
                          invalid-text="Error message"
                          placeholder="Enter new context variable name..."
                          @input=${handleContextVariableInput}>
                        </cds-text-input>
                      </cds-form-item>
                      <cds-tooltip align="bottom">
                        <div
                          class="sb-tooltip-trigger"
                          aria-labelledby="content">
                          <cds-button
                            @click=${toggleAddContextVariable}
                            kind="danger--ghost">
                            ${iconLoader(Close16())}
                          </cds-button>
                        </div>
                        <cds-tooltip-content id="content">
                          Cancel</cds-tooltip-content
                        >
                      </cds-tooltip>
                      <cds-tooltip align="bottom">
                        <div
                          class="sb-tooltip-trigger"
                          aria-labelledby="content">
                          <cds-button @click=${addContextVariable} kind="ghost">
                            ${iconLoader(Checkmark16())}
                          </cds-button>
                        </div>
                        <cds-tooltip-content id="content">
                          Save new context variable</cds-tooltip-content
                        >
                      </cds-tooltip>
                    </div>
                  `}
            </div>
            <div class="${clabsPrefix}--header-parameters">
              <h6 style="margin:0;">Parameters:</h6>

              ${currentView.parameters.length <= 0
                ? html`<div>
                    This intent/view does not provide any parameters.
                  </div>`
                : currentView.parameters.map(
                    (parameter) => html`<cds-tag
                      filter
                      type="gray"
                      title="${parameter}"
                      textContent="${parameter}"
                      aria-label="Parameter"
                      @cds-tag-closed=${handleCloseTag}>
                      ${parameter}
                    </cds-tag>`
                  )}
              ${!showAddParameter
                ? html`<cds-tag
                    class="${clabsPrefix}--add-parameter-tag"
                    @click=${toggleAddParameter}
                    type="gray"
                    >${iconLoader(Add16())} Add parameter
                  </cds-tag>`
                : html`<div class="${clabsPrefix}--enter-new">
                    <cds-form-item>
                      <cds-text-input
                        class="${clabsPrefix}--new-parameter"
                        invalid-text="Error message"
                        placeholder="Enter new parameter name..."
                        @input=${handleParameterInput}>
                      </cds-text-input>
                    </cds-form-item>
                    <cds-tooltip align="bottom">
                      <div class="sb-tooltip-trigger" aria-labelledby="content">
                        <cds-button
                          @click=${toggleAddParameter}
                          kind="danger--ghost">
                          ${iconLoader(Close16())}
                        </cds-button>
                      </div>
                      <cds-tooltip-content id="content">
                        Cancel</cds-tooltip-content
                      >
                    </cds-tooltip>
                    <cds-tooltip align="bottom">
                      <div class="sb-tooltip-trigger" aria-labelledby="content">
                        <cds-button @click=${addParameter} kind="ghost">
                          ${iconLoader(Checkmark16())}
                        </cds-button>
                      </div>
                      <cds-tooltip-content id="content">
                        Save new parameter</cds-tooltip-content
                      >
                    </cds-tooltip>
                  </div>`}
            </div>
          </div>
        </cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body>
        <cds-table>
          <cds-table-head>
            <cds-table-header-row>
              <cds-table-header-cell>Prompt</cds-table-header-cell>
              <cds-table-header-cell>Response</cds-table-header-cell>
              <cds-table-header-cell>Intent/View</cds-table-header-cell>
              <cds-table-header-cell>Actions</cds-table-header-cell>
            </cds-table-header-row>
          </cds-table-head>

          <cds-table-body> ${getHTMLRows(customElementClass)} </cds-table-body>
        </cds-table>
      </cds-modal-body>
      <cds-modal-footer>
        <cds-modal-footer-button @click=${onNewPrompt} kind="primary"
          >Add new prompt</cds-modal-footer-button
        >
      </cds-modal-footer>
    </cds-modal>

    ${getEditModal(customElementClass)}
  </div>`;
}
