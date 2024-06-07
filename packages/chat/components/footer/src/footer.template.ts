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
import SendFilled16 from '@carbon/web-components/es/icons/send--filled/16.js';
import WarningFilled16 from '@carbon/web-components/es/icons/warning--filled/24.js';
import Send16 from '@carbon/web-components/es/icons/send/16.js';
import Close16 from '@carbon/web-components/es/icons/close/24.js';
import Stop16 from '@carbon/web-components/es/icons/stop--filled/16.js';

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
    _inputPlaceholder: inputPlaceholder,
    _disableInput: disableInput,
    _isListening: isListening,
    _voiceAPIAvailable: voiceAPIAvailable,
    _startRecording: startRecording,
    _endRecording: endRecording,
    _expandedWidth: expandedWidth,
    _expandedHeight: expandedHeight,
    _textAreaIsFocused: textAreaIsFocused,
    _contextMessage: contextMessage,
    _contextMessageType: contextMessageType,
    _currentlyStreaming: currentlyStreaming,
    _endStreaming: endStreaming,
    _isPromptFocused: isPromptFocused,
  } = customElementClass;

  return html` 
    <div class="${clabsPrefix}--chat-footer-container${
    expandedHeight ? '-expanded' : ''
  }">
    ${
      contextMessage
        ? html`
            <div class="${clabsPrefix}--chat-footer-menu">
              <div class="${clabsPrefix}--chat-footer-menu-container">
                <div class="${clabsPrefix}--chat-footer-menu-container-item">
                  <cds-button
                    kind="${contextMessageType === 'error'
                      ? 'danger'
                      : 'ghost'}"
                    size="sm">
                    ${WarningFilled16({ slot: 'icon' })}
                  </cds-button>
                </div>

                <div class="${clabsPrefix}--chat-footer-menu-container-message">
                  ${contextMessage}
                </div>
                <div class="${clabsPrefix}--chat-footer-menu-container-item">
                  <cds-button
                    kind="${contextMessageType === 'error'
                      ? 'danger'
                      : 'ghost'}"
                    size="sm">
                    ${Close16({ slot: 'icon' })}
                  </cds-button>
                </div>
              </div>
            </div>
          `
        : ''
    }
      <div class="${clabsPrefix}--chat-footer-prompt-items${
    expandedWidth ? '-expanded' : ''
  } ${isPromptFocused ? clabsPrefix + '--chat-footer-prompt-focused' : ''}">
      <textarea
        class="${clabsPrefix}--chat-search-query ${
    disableInput ? clabsPrefix + '--chat-search-query-disabled' : ''
  }"
        rows="1"
        ?disabled="${disableInput}"
        placeholder="${
          !disableInput
            ? inputPlaceholder
              ? inputPlaceholder
              : 'Type something...'
            : 'Thinking...'
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
                  tooltip-position="top-right"
                  tooltip-alignment="end">
                  ${MicrophoneOff16({ slot: 'icon' })}
                </cds-button>
              `
            : html` ${!isListening
                ? html` <cds-button
                    kind="ghost"
                    tooltip-text="Start listening"
                    tooltip-position="top-right"
                    tooltip-alignment="end"
                    size="sm"
                    @click="${startRecording}">
                    ${Microphone16({ slot: 'icon' })}
                  </cds-button>`
                : html` <cds-button
                    kind="ghost"
                    tooltip-text="Stop listening"
                    class="${clabsPrefix}--chat-footer-button-danger"
                    tooltip-position="top-right"
                    tooltip-alignment="end"
                    size="sm"
                    @click="${endRecording}">
                    ${MicrophoneFilled16({ slot: 'icon' })}
                  </cds-button>`}`
        }
      </div>
      <div class="${clabsPrefix}--chat-footer-button">
        ${
          !currentlyStreaming
            ? html`
                <cds-button
                  kind="ghost"
                  size="sm"
                  tooltip-text="Send response"
                  tooltip-position="top-right"
                  ?disabled="${messageText === ''}"
                  @click="${sendInputToParent}">
                  ${messageText === ''
                    ? Send16({ slot: 'icon' })
                    : SendFilled16({ slot: 'icon' })}
                </cds-button>
              `
            : html`
                <cds-button
                  kind="ghost"
                  size="sm"
                  class="${clabsPrefix}--chat-footer-button-danger"
                  tooltip-text="Stop generating"
                  tooltip-position="top-right"
                  tooltip-alignment="end"
                  @click="${endStreaming}">
                  ${Stop16({ slot: 'icon' })}
                </cds-button>
              `
        }
      </div>
      </div>
      </div>
    `;
}
