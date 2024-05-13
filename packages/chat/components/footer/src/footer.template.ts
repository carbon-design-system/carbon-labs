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
import MicrophoneFilled16 from '@carbon/web-components/es/icons/microphone--filled/16.js';
import Microphone16 from '@carbon/web-components/es/icons/microphone/16.js';
import Menu24 from '@carbon/web-components/es/icons/menu/24.js';
import SendFilled16 from '@carbon/web-components/es/icons/send--filled/16.js';
import Send16 from '@carbon/web-components/es/icons/send/16.js';

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
    _sendInputToParent: sendInputToParent,
    _handleMenuToggle: handleMenuToggle,
    _toggleMenu: toggleMenu,
    _handleMenuFileUpload: handleMenuFileUpload,
    _inputPlaceholder: inputPlaceholder,
    _disableMenu: disableMenu,
    _disableInput: disableInput,
    _isListening: isListening,
    _voiceAPIAvailable: voiceAPIAvailable,
    _startRecording: startRecording,
    _endRecording: endRecording,
    _expandedWidth: expandedWidth,
    _expandedHeight: expandedHeight,
    _textAreaIsFocused: textAreaIsFocused,
  } = customElementClass;

  return html` 
    <div class="${clabsPrefix}--chat-footer-container${
    expandedHeight ? '-expanded' : ''
  }">
    ${
      toggleMenu
        ? html`
            <div class="${clabsPrefix}--chat-footer-menu">
              <div class="${clabsPrefix}--chat-footer-menu-container">
                <div class="${clabsPrefix}--chat-footer-menu-container-item">
                  <cds-file-uploader
                    label-title="Upload your files here:"
                    @cds-file-uploader-changed="${handleMenuFileUpload}">
                    <cds-file-uploader-button multiple size="sm">
                      Click to upload
                    </cds-file-uploader-button>
                  </cds-file-uploader>
                </div>

                <div class="${clabsPrefix}--chat-footer-menu-container-item">
                  <cds-file-uploader
                    label-title="Or drag & drop here:"
                    @cds-file-uploader-changed="${handleMenuFileUpload}">
                    <cds-file-uploader-drop-container
                      name="Drop files here"
                      @cds-file-uploader-drop-container-changed="${handleMenuFileUpload}">
                    </cds-file-uploader-drop-container>
                  </cds-file-uploader>
                </div>
              </div>
            </div>
          `
        : ''
    }
      <div class="${clabsPrefix}--chat-footer-prompt-items${
    expandedWidth ? '-expanded' : ''
  }">
      ${
        !disableMenu
          ? html`
              <div class="${clabsPrefix}--chat-footer-button">
                <cds-button
                  kind="ghost"
                  size="sm"
                  ?disabled="${disableMenu}"
                  @click="${handleMenuToggle}">
                  ${Menu24({ slot: 'icon' })}
                </cds-button>
              </div>
            `
          : html``
      }
      <textarea
        class="${clabsPrefix}--chat-search-query"
        rows="1"
        ?disabled="${disableInput}"
        placeholder="${
          inputPlaceholder ? inputPlaceholder : 'Type something...'
        }"
        @focus="${textAreaIsFocused}"
        @blur="${textAreaIsFocused}"
        .value="${messageText}"
        @input="${handleInput}"
        @keydown="${handleInput}"/>
        </textarea>
      <div class="${clabsPrefix}--chat-footer-button">
        ${
          !voiceAPIAvailable
            ? html`
                <cds-button
                  disabled
                  kind="ghost"
                  size="sm"
                  tooltip-text="Microphone unavailable"
                  tooltip-position="left"
                  tooltip-alignment="end">
                  ${MicrophoneOff16({ slot: 'icon' })}
                </cds-button>
              `
            : html` ${!isListening
                ? html` <cds-button
                    kind="ghost"
                    tooltip-text="start recording"
                    tooltip-position="left"
                    tooltip-alignment="end"
                    size="sm"
                    @click="${startRecording}">
                    ${Microphone16({ slot: 'icon' })}
                  </cds-button>`
                : html` <cds-button
                    kind="danger"
                    tooltip-text="end recording"
                    tooltip-position="left"
                    tooltip-alignment="end"
                    size="sm"
                    @click="${endRecording}">
                    ${MicrophoneFilled16({ slot: 'icon' })}
                  </cds-button>`}`
        }
      </div>
      <div class="${clabsPrefix}--chat-footer-button">
        <cds-button 
            kind="ghost"
            size="sm" 
            ?disabled="${messageText === ''}"
            @click="${sendInputToParent}">
            ${
              messageText === ''
                ? Send16({ slot: 'icon' })
                : SendFilled16({ slot: 'icon' })
            }
        </cds-button>
      </div>
      </div>
      </div>
    `;
}
