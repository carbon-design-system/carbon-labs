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

/**
 * Lit template for prompt tuning
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function promptTuningTemplate(customElementClass) {
  const {
    text: text,
    isListModalOpen,
    _onListModalClose: onListModalClose,
    _onEditButtonClick: onEditButtonClick,
    isEditModalOpen,
    _onEditModalClose: onEditModalClose,
  } = customElementClass;

  return html` <div class="${clabsPrefix}--prompt-tuning">
    <cds-modal
      id="modal-prompt-list"
      size="lg"
      ?open=${isListModalOpen}
      @cds-modal-closed=${onListModalClose}>
      <cds-modal-header>
        <cds-modal-close-button></cds-modal-close-button>
        <cds-modal-heading>Tune prompts</cds-modal-heading>
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
          <cds-table-body>
            <cds-table-row>
              <cds-table-cell>Load Balancer 1</cds-table-cell>
              <cds-table-cell>Disabled</cds-table-cell>
              <cds-table-cell>Something view</cds-table-cell>
              <cds-table-cell
                ><cds-button @click=${onEditButtonClick} kind="ghost">
                  ${Edit16({ slot: 'icon' })} </cds-button
                ><cds-button kind="danger--ghost">
                  ${TrashCan16({ slot: 'icon' })}
                </cds-button></cds-table-cell
              >
            </cds-table-row>
            <cds-table-row>
              <cds-table-cell>Load Balancer 1</cds-table-cell>
              <cds-table-cell>Disabled</cds-table-cell>
              <cds-table-cell>Something view</cds-table-cell>
              <cds-table-cell
                ><cds-button @click=${onEditButtonClick} kind="ghost">
                  ${Edit16({ slot: 'icon' })} </cds-button
                ><cds-button kind="danger--ghost">
                  ${TrashCan16({ slot: 'icon' })}
                </cds-button></cds-table-cell
              >
            </cds-table-row>
            <cds-table-row>
              <cds-table-cell>Load Balancer 1</cds-table-cell>
              <cds-table-cell>Disabled</cds-table-cell>
              <cds-table-cell>Something view</cds-table-cell>
              <cds-table-cell
                ><cds-button @click=${onEditButtonClick} kind="ghost">
                  ${Edit16({ slot: 'icon' })} </cds-button
                ><cds-button kind="danger--ghost">
                  ${TrashCan16({ slot: 'icon' })}
                </cds-button></cds-table-cell
              >
            </cds-table-row>
          </cds-table-body>
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
        <cds-modal-label>Label (Optional)</cds-modal-label>
        <cds-modal-heading>Modal Title</cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body><p>Modal text description</p></cds-modal-body>
      <cds-modal-footer>
        <cds-modal-footer-button kind="secondary" data-modal-close
          >Cancel</cds-modal-footer-button
        >
        <cds-modal-footer-button kind="primary">Save</cds-modal-footer-button>
      </cds-modal-footer>
    </cds-modal>

    <slot>${text}</slot>
  </div>`;
}
