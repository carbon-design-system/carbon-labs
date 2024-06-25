/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;
import '@carbon/web-components/es/components/modal/index.js';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/button/index.js';
import Edit16 from '@carbon/web-components/es/icons/edit/16';
import TrashCan16 from '@carbon/web-components/es/icons/trash-can/16';
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
  const { data: data, _onEditButtonClick: onEditButtonClick } =
    customElementClass;

  return html`
    ${data.map(
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
              ${Edit16()} </cds-button
            ><cds-button kind="danger--ghost">
              ${TrashCan16()}
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
    text: text,
    data: data,
    viewName: viewName,
    viewList: viewList,
    _currentPrompt: currentPrompt,
    _currentContextVariables: currentContextVariables,
    _currentResponse: currentResponse,
    _currentResponseView: currentResponseView,
    _currentParameters: currentParameters,
    isListModalOpen,
    _onListModalClose: onListModalClose,
    _onEditButtonClick: onEditButtonClick,
    isEditModalOpen,
    _onEditModalClose: onEditModalClose,
    _onEditModalCancel: onEditModalCancel,
  } = customElementClass;

  return html`<cds-modal
    id="modal-edit-prompt"
    size="lg"
    ?open=${isEditModalOpen}
    @cds-modal-closed=${onEditModalClose}>
    <cds-modal-header>
      <cds-modal-close-button></cds-modal-close-button>
      <cds-modal-heading>Edit prompt</cds-modal-heading>
    </cds-modal-header>
    <cds-modal-body>
      <div class="${clabsPrefix}--prompt-edit-form">
        <div class="${clabsPrefix}--edit-input">
          <cds-form-item>
            <cds-text-input
              class="${clabsPrefix}--edit-form-item"
              label="Sample prompt"
              invalid-text="Error message"
              placeholder="Enter sample prompt..."
              helper-text=" "
              value=${currentPrompt}>
            </cds-text-input>
          </cds-form-item>

          <h4>Context variables</h4>

          ${Object.keys(currentContextVariables).length <= 0
            ? html`<div>
                This intent/view does not provide any context variables.
              </div>`
            : Object.entries(currentContextVariables).map(
                ([key, value]) => html`<cds-form-item
                  class="${clabsPrefix}--edit-context-variable">
                  <cds-text-input
                    class="${clabsPrefix}--edit-form-item"
                    label=${key}
                    invalid-text="Error message"
                    placeholder="Enter sample value..."
                    value=${value}>
                  </cds-text-input>
                </cds-form-item>`
              )}
        </div>

        <div class="${clabsPrefix}--edit-output">
          <cds-form-item>
            <cds-text-input
              class="${clabsPrefix}--edit-form-item"
              label="Expected message"
              invalid-text="Error message"
              placeholder="Enter expected generated message..."
              value=${currentResponse}>
            </cds-text-input>
          </cds-form-item>

          <cds-form-item>
            <cds-select
              class="${clabsPrefix}--edit-form-item"
              helper-text=" "
              label-text="Intent/View"
              placeholder="Optional placeholder text"
              value=${currentResponseView}>
              ${viewList.map(
                (view) =>
                  html`<cds-select-item value="${view}"
                    >${view}</cds-select-item
                  >`
              )}
            </cds-select>
          </cds-form-item>

          <h4>Expected intent/view parameters</h4>
          ${Object.keys(currentParameters).length <= 0
            ? html`<div>This intent/view does not provide any parameters.</div>`
            : Object.entries(currentParameters).map(
                ([key, value]) => html`<cds-form-item>
                  <cds-text-input
                    class="${clabsPrefix}--edit-form-item"
                    label=${key}
                    invalid-text="Error message"
                    placeholder="Enter expected value..."
                    value=${value}>
                  </cds-text-input>
                </cds-form-item>`
              )}
        </div>
      </div>
    </cds-modal-body>
    <cds-modal-footer>
      <cds-modal-footer-button kind="secondary" @click=${onEditModalCancel}
        >Cancel</cds-modal-footer-button
      >
      <cds-modal-footer-button kind="primary">Save</cds-modal-footer-button>
    </cds-modal-footer>
  </cds-modal>`;
}

/**
 * Lit template for prompt tuning
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function promptTuningTemplate(customElementClass) {
  const {
    text: text,
    data: data,
    viewName: viewName,
    viewList: viewList,
    _currentPrompt: currentPrompt,
    _currentContextVariables: currentContextVariables,
    isListModalOpen,
    _onListModalClose: onListModalClose,
    _onEditButtonClick: onEditButtonClick,
    isEditModalOpen,
    _onEditModalClose: onEditModalClose,
    _onEditModalCancel: onEditModalCancel,
  } = customElementClass;

  const numRows = data.length;

  return html` <div class="${clabsPrefix}--prompt-tuning">
    <cds-modal
      id="modal-prompt-list"
      size="lg"
      ?has-scrolling-content=${true}
      ?open=${isListModalOpen}
      @cds-modal-closed=${onListModalClose}>
      <cds-modal-header>
        <cds-modal-close-button></cds-modal-close-button>
        <cds-modal-heading>
          <div class="${clabsPrefix}--heading">
            <div class="${clabsPrefix}--heading-tune-prompts">
              Tune prompts for
            </div>

            <cds-select inline="true" value=${viewName}>
              ${getSelectViews(customElementClass)}
            </cds-select>
          </div>

          Edit ${viewName}:

          <cds-form-item>
            <cds-text-input
              inline="true"
              class="${clabsPrefix}--rename-view"
              label="Rename"
              invalid-text="Error message"
              placeholder="Enter expected generated message..."
              value=${viewName}>
            </cds-text-input>
          </cds-form-item>

          Context Variables: List...
          <cds-form-item>
            <cds-text-input
              inline="true"
              class="${clabsPrefix}--add-context-variable"
              label="Add context variable"
              invalid-text="Error message"
              placeholder="Enter new context variable name...">
            </cds-text-input>
          </cds-form-item>

          Parameters List...
          <cds-form-item>
            <cds-text-input
              inline="true"
              class="${clabsPrefix}--add-parameter"
              label="Add parameter"
              invalid-text="Error message"
              placeholder="Enter parameter name...">
            </cds-text-input>
          </cds-form-item>
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
        <cds-modal-footer-button kind="primary"
          >Add new prompt</cds-modal-footer-button
        >
      </cds-modal-footer>
    </cds-modal>

    ${getEditModal(customElementClass)}

    <slot>${text}</slot>
  </div>`;
}
