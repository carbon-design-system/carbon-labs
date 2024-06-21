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
              ? html`${Object.values(item.input.context_variables).map((item) =>
                  (item as string).length > 0
                    ? html`
                        <cds-tag type="gray" title=${item}
                          ><span
                            class="${clabsPrefix}--truncated-text"
                            title=${item}
                            >${item}</span
                          ></cds-tag
                        >
                      `
                    : html``
                )}`
              : html``}
          </cds-table-cell>
          <cds-table-cell>${item.output.output}</cds-table-cell>
          <cds-table-cell
            >${item.output.view_id}
            ${Object.keys(item.output.parameters).length > 0
              ? html`${Object.values(item.output.parameters).map((item) =>
                  (item as string).length > 0
                    ? html`
                        <cds-tag type="gray" title=${item}
                          ><span
                            class="${clabsPrefix}--truncated-text"
                            title=${item}
                            >${item}</span
                          ></cds-tag
                        >
                      `
                    : html``
                )}`
              : html``}
          </cds-table-cell>
          <cds-table-cell class="${clabsPrefix}--table-actions"
            ><cds-button @click=${onEditButtonClick} kind="ghost">
              ${Edit16({ slot: 'icon' })} </cds-button
            ><cds-button kind="danger--ghost">
              ${TrashCan16({ slot: 'icon' })}
            </cds-button></cds-table-cell
          >
        </cds-table-row>`
    )}
  `;
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
    isListModalOpen,
    _onListModalClose: onListModalClose,
    _onEditButtonClick: onEditButtonClick,
    isEditModalOpen,
    _onEditModalClose: onEditModalClose,
    _onEditModalCancel: onEditModalCancel,
  } = customElementClass;

  const viewName = data[0].input.view_id;
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
        <cds-modal-heading>Tune prompts for ${viewName}</cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body>
        <cds-table>
          <cds-table-head>
            <cds-table-header-row>
              <cds-table-header-cell>Prompt</cds-table-header-cell>
              <cds-table-header-cell>Response</cds-table-header-cell>
              <cds-table-header-cell>Result view</cds-table-header-cell>
              <cds-table-header-cell>Actions</cds-table-header-cell>
            </cds-table-header-row>
          </cds-table-head>

          <cds-table-body> ${getHTMLRows(customElementClass)} </cds-table-body>
        </cds-table>
      </cds-modal-body>
      <cds-modal-footer>
        <cds-modal-footer-button kind="secondary" data-modal-close
          >Import from Daniel...</cds-modal-footer-button
        >
        <cds-modal-footer-button kind="secondary" data-modal-close
          >Review feedback</cds-modal-footer-button
        >
        <cds-modal-footer-button kind="primary"
          >New prompt edit</cds-modal-footer-button
        >
      </cds-modal-footer>
    </cds-modal>

    <cds-modal
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
                helper-text=" ">
              </cds-text-input>
            </cds-form-item>

            <cds-form-item>
              <cds-text-input
                class="${clabsPrefix}--edit-form-item"
                label="Table IDs"
                invalid-text="Error message"
                placeholder="Enter sample value...">
              </cds-text-input>
            </cds-form-item>

            <cds-form-item>
              <cds-text-input
                class="${clabsPrefix}--edit-form-item"
                label="Keyword"
                invalid-text="Error message"
                placeholder="Enter sample value...">
              </cds-text-input>
            </cds-form-item>
          </div>

          <div class="${clabsPrefix}--edit-output">
            <cds-form-item>
              <cds-text-input
                class="${clabsPrefix}--edit-form-item"
                label="Expected message"
                invalid-text="Error message"
                placeholder="Enter expected generated message...">
              </cds-text-input>
            </cds-form-item>

            <cds-form-item>
              <cds-select
                class="${clabsPrefix}--edit-form-item"
                helper-text=" "
                label-text="Select"
                placeholder="Optional placeholder text">
                <cds-select-item-group label="Category 1">
                  <cds-select-item value="all">Option 1</cds-select-item>
                  <cds-select-item value="cloudFoundry"
                    >Option 2</cds-select-item
                  >
                </cds-select-item-group>
                <cds-select-item-group label="Category 2">
                  <cds-select-item value="staging">Option 3</cds-select-item>
                  <cds-select-item value="dea">Option 4</cds-select-item>
                  <cds-select-item value="router">Option 5</cds-select-item>
                </cds-select-item-group>
              </cds-select>
            </cds-form-item>

            <cds-form-item>
              <cds-text-input
                class="${clabsPrefix}--edit-form-item"
                label="Keyword"
                invalid-text="Error message"
                placeholder="Enter expected value...">
              </cds-text-input>
            </cds-form-item>
          </div>
        </div>
      </cds-modal-body>
      <cds-modal-footer>
        <cds-modal-footer-button kind="secondary" @click=${onEditModalCancel}
          >Cancel</cds-modal-footer-button
        >
        <cds-modal-footer-button kind="primary">Save</cds-modal-footer-button>
      </cds-modal-footer>
    </cds-modal>

    <slot>${text}</slot>
  </div>`;
}
