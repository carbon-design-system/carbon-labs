/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;
import Close16 from '@carbon/icons/es/close/16.js';

import PDF16 from '@carbon/icons/es/PDF/24.js';
import CheckMarkOutline16 from '@carbon/icons/es/checkmark--outline/16.js';
import '@carbon/web-components/es/components/loading/index.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

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
    _errorMessage: errorMessage,
  } = customElementClass;

  return html` <div
    class="${clabsPrefix}--chat-file-upload-container ${status === 'error'
      ? clabsPrefix + '--chat-file-upload-container-error'
      : ''}">
    <div class="${clabsPrefix}--chat-file-upload-top-container">
      <div class="${clabsPrefix}--chat-file-upload-container-file-type">
        ${iconLoader(PDF16())}
      </div>
      <div class="${clabsPrefix}--chat-file-upload-container-file-name">
        ${content}
      </div>
      <div
        class="${clabsPrefix}--chat-file-upload-container-file-status${status ===
        'success'
          ? '-success'
          : ''}">
        ${status === 'loading'
          ? html` <cds-loading type="small"></cds-loading> `
          : status === 'success'
          ? html` ${iconLoader(CheckMarkOutline16())} `
          : html` ${iconLoader(Close16())}`}
      </div>
    </div>
    ${status === 'error'
      ? html`
          <div class="${clabsPrefix}--chat-file-upload-bottom-container">
            ${errorMessage ? errorMessage : 'Default error message'}
          </div>
        `
      : html``}
  </div>`;
}
