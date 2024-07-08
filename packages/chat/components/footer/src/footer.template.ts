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
import WarningFilled16 from '@carbon/web-components/es/icons/warning--filled/16.js';
import InformationFilled16 from '@carbon/web-components/es/icons/information--filled/16.js';

import Send16 from '@carbon/web-components/es/icons/send/16.js';
import Close16 from '@carbon/web-components/es/icons/close/24.js';
import Stop16 from '@carbon/web-components/es/icons/stop--filled/16.js';

import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
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
    _forceDisableInput: forceDisableInput,
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
    hideContextMessage,
    _handleContextMessageClose: handleContextMessageClose,
  } = customElementClass;

  return html` 
    <div class="${clabsPrefix}--chat-footer-container${
    expandedHeight ? '-expanded' : ''
  }">
    ${
      !hideContextMessage &&
      ((contextMessageType === 'error' && isPromptFocused && contextMessage) ||
        (contextMessageType !== 'error' && contextMessage))
        ? html`
            <div
              class="${clabsPrefix}--chat-footer-menu ${clabsPrefix}--chat-footer-menu${contextMessageType ===
              'error'
                ? '-error'
                : contextMessageType === 'info'
                ? '-info'
                : contextMessageType === 'warning'
                ? '-warning'
                : ''}">
              <div class="${clabsPrefix}--chat-footer-menu-container">
                <div class="${clabsPrefix}--chat-footer-menu-container-item">
                  ${contextMessageType === 'error'
                    ? html`<div
                        class="${clabsPrefix}--chat-footer-menu-container-item-icon-error">
                        ${WarningFilled16()}
                      </div>`
                    : contextMessageType === 'info'
                    ? html`<div
                        class="${clabsPrefix}--chat-footer-menu-container-item-icon-info">
                        ${InformationFilled16()}
                      </div>`
                    : contextMessageType === 'warning'
                    ? html`<div
                        class="${clabsPrefix}--chat-footer-menu-container-item-icon-warning">
                        ${WarningFilled16()}
                      </div>`
                    : html``}
                </div>

                <div
                  class="${clabsPrefix}--chat-footer-menu-container-message${contextMessageType ===
                  'error'
                    ? '-error'
                    : contextMessageType === 'info'
                    ? '-info'
                    : contextMessageType === 'warning'
                    ? '-warning'
                    : ''}">
                  ${contextMessage}
                </div>
                <div
                  class="${clabsPrefix}--chat-footer-menu-container-item-icon-${contextMessageType}">
                  ${contextMessageType === 'unknown'
                    ? html``
                    : html`
                        <cds-icon-button
                          kind="ghost"
                          size="sm"
                          @click="${handleContextMessageClose}">
                          ${Close16({ slot: 'icon' })}
                          <span slot="tooltip-content">
                            Close ${contextMessageType}
                          </span>
                        </cds-icon-button>
                      `}
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
                <cds-icon-button
                  disabled
                  kind="ghost"
                  size="sm"
                  align="top-right">
                  ${MicrophoneOff16({ slot: 'icon' })}
                  <span slot="tooltip-content">Microphone unavailable</span>
                </cds-icon-button>
              `
            : html` ${!isListening
                ? html` <cds-icon-button
                    kind="ghost"
                    align="top-right"
                    size="sm"
                    @click="${startRecording}">
                    ${Microphone16({ slot: 'icon' })}
                    <span slot="tooltip-content">Start listening</span>
                  </cds-icon-button>`
                : html` <cds-icon-button
                    kind="ghost"
                    class="${clabsPrefix}--chat-footer-button-danger"
                    align="top-right"
                    size="sm"
                    @click="${endRecording}">
                    ${MicrophoneFilled16({ slot: 'icon' })}
                    <span slot="tooltip-content">Stop listening</span>
                  </cds-icon-button>`}`
        }
      </div>
      <div class="${clabsPrefix}--chat-footer-button">
        ${
          !currentlyStreaming
            ? html`
                <cds-icon-button
                  kind="ghost"
                  size="sm"
                  align="top-right"
                  ?disabled="${messageText === '' || forceDisableInput}"
                  @click="${sendInputToParent}">
                  ${messageText === '' || forceDisableInput || !isPromptFocused
                    ? Send16({
                        slot: 'icon',
                        class: clabsPrefix + '--chat-footer-send-inactive',
                      })
                    : SendFilled16({
                        slot: 'icon',
                        class: clabsPrefix + '--chat-footer-send-active',
                      })}
                  <span slot="tooltip-content">Send response</span>
                </cds-icon-button>
              `
            : html`
                <cds-icon-button
                  kind="ghost"
                  size="sm"
                  align="top-right"
                  @click="${endStreaming}">
                  ${Stop16({
                    slot: 'icon',
                    class: clabsPrefix + '--chat-footer-button-danger',
                  })}
                  <span slot="tooltip-content">Stop generating</span>
                </cds-icon-button>
              `
        }
      </div>
      </div>
      </div>
    `;
}
