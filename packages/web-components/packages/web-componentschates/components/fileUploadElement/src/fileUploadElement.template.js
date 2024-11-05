/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { html } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const {
  stablePrefix: clabsPrefix
} = settings;
import Close16 from '@carbon/web-components/es/icons/close/16.js';
import PDF16 from '@carbon/web-components/es/icons/PDF/24.js';
import CheckMarkOutline16 from '@carbon/web-components/es/icons/checkmark--outline/16.js';
import '@carbon/web-components/es/components/loading/index.js';
/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function fileUploadElementTemplate(customElementClass) {
  const {
    content,
    _status: status,
    _errorMessage: errorMessage
  } = customElementClass;
  return html` <div
    class="${clabsPrefix}--chat-file-upload-container ${status === 'error' ? clabsPrefix + '--chat-file-upload-container-error' : ''}">
    <div class="${clabsPrefix}--chat-file-upload-top-container">
      <div class="${clabsPrefix}--chat-file-upload-container-file-type">
        ${PDF16()}
      </div>
      <div class="${clabsPrefix}--chat-file-upload-container-file-name">
        ${content}
      </div>
      <div
        class="${clabsPrefix}--chat-file-upload-container-file-status${status === 'success' ? '-success' : ''}">
        ${status === 'loading' ? html` <cds-loading type="small"></cds-loading> ` : status === 'success' ? html` ${CheckMarkOutline16()} ` : html` ${Close16()}`}
      </div>
    </div>
    ${status === 'error' ? html`
          <div class="${clabsPrefix}--chat-file-upload-bottom-container">
            ${errorMessage ? errorMessage : 'Default error message'}
          </div>
        ` : html``}
  </div>`;
}
//# sourceMappingURL=fileUploadElement.template.js.map
