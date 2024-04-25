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
import MicrophoneOff16 from '@carbon/web-components/es/icons/microphone--off/16.js';
import Menu24 from '@carbon/web-components/es/icons/Menu/24.js';
import SendFilled16 from '@carbon/web-components/es/icons/Send--filled/16.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/file-uploader/index.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function footerTemplate(customElementClass) {
  const {
    _messageText: messageText,
    _handleInput: handleInput,
    _setMessageText: setMessageText,
    _sendInputToParent: sendInputToParent,
    _handleMenuToggle: handleMenuToggle,
    _toggleMenu: toggleMenu,
    _handleMenuFileUpload: handleMenuFileUpload,
  } = customElementClass;

  return html` 
    <div class="${clabsPrefix}--chat-footer-container">
    ${
      toggleMenu
        ? html` 
      <div class="${clabsPrefix}--chat-footer-menu">
        <cds-file-uploader
          label-description="File must be .csv or .xls"
          @cds-file-uploader-changed="${handleMenuFileUpload}"
          label-title="Upload your files here:">
          <cds-file-uploader-button multiple>
            Click to upload
          </cds-file-drop-container>
        </cds-file-uploader>
      </div>
      `
        : ''
    }
      <div class="${clabsPrefix}--chat-footer-prompt-items">
      <div class="${clabsPrefix}--chat-footer-button">
        <cds-button kind="ghost" size="sm" @click="${handleMenuToggle}">
            ${Menu24({ slot: 'icon' })}
        </cds-button>
      </div>
      <textarea
        class="${clabsPrefix}--chat-search-query"
        rows="1"
        placeholder="Type something..."
        .value="${messageText}"
        @input="${setMessageText}"
        @keydown="${handleInput}"
        @keyup="${handleInput}" />
        </textarea>
      <div class="${clabsPrefix}--chat-footer-button">
        <cds-button kind="ghost" size="sm" disabled>
          ${MicrophoneOff16({ slot: 'icon' })}
        </cds-button>
      </div>
      <div class="${clabsPrefix}--chat-footer-button">
        <cds-button kind="ghost" size="sm" @click="${sendInputToParent}">
            ${SendFilled16({ slot: 'icon' })}
        </cds-button>
      </div>
      </div>
      </div>
    `;
}
