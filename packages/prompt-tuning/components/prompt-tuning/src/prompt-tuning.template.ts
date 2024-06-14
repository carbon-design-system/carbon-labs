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

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function promptTuningTemplate(customElementClass) {
  const { text: text } = customElementClass;

  return html` <div class="${clabsPrefix}--prompt-tuning">
    <cds-modal id="modal-example">
      <cds-modal-header>
        <cds-modal-close-button></cds-modal-close-button>
        <cds-modal-label>Label (Optional)</cds-modal-label>
        <cds-modal-heading><slot>${text}</slot></cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body><p>Modal text description</p></cds-modal-body>
      <cds-modal-footer>
        <cds-modal-footer-button kind="secondary" data-modal-close
          >Cancel</cds-modal-footer-button
        >
        <cds-modal-footer-button kind="primary">Save</cds-modal-footer-button>
      </cds-modal-footer>
    </cds-modal>
  </div>`;
}
