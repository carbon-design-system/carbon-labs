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
const { stablePrefix: clabsPrefix } = settings;
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
    alignRight,
    content,
    _loadingStatus: loadingStatus,
  } = customElementClass;

  return html`<div class="${clabsPrefix}--chat-file-upload">
    <div
      class="${clabsPrefix}--chat-file-upload--float-${alignRight
        ? 'right'
        : 'left'}">
      <div class="${clabsPrefix}--chat-file-upload-container">
        <div class="${clabsPrefix}--chat-file-upload-container-file-type">
          ${PDF16()}
        </div>
        <div class="${clabsPrefix}--chat-file-upload-container-file-name">
          ${content}
        </div>
        <div class="${clabsPrefix}--chat-file-upload-container-file-status">
          ${loadingStatus === 'loading'
            ? html` <cds-loading></cds-loading> `
            : loadingStatus === 'success'
            ? html` ${CheckMarkOutline16()} `
            : html` ${Close16()}`}
        </div>
      </div>
    </div>
  </div>`;
}
