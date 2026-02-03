/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;
import MicrophoneOff16 from '@carbon/icons/es/microphone--off/16.js';
import MicrophoneFilled16 from '@carbon/icons/es/microphone--filled/16.js';
import Microphone16 from '@carbon/icons/es/microphone/16.js';
import SendFilled16 from '@carbon/icons/es/send--filled/16.js';
import WarningFilled16 from '@carbon/icons/es/warning--filled/16.js';
import InformationFilled16 from '@carbon/icons/es/information--filled/16.js';

import Send16 from '@carbon/icons/es/send/16.js';
import Close16 from '@carbon/icons/es/close/24.js';
import Stop16 from '@carbon/icons/es/stop--filled/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

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
    _checkKeyboardEscape: checkKeyboardEscape,
    _handleContextMessageClose: handleContextMessageClose,
    _checkKeyboardEscapeB: checkKeyboardEscapeB,
    _renderLabel: renderLabel,
    queryProcessing,
    enableCancellation,
    showNotification,
  } = customElementClass;

  return html`
    <div
      class="${clabsPrefix}--chat-footer-container${expandedHeight
        ? '-expanded'
        : ''}">
      ${!hideContextMessage && isPromptFocused && contextMessage
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
                        ${iconLoader(WarningFilled16())}
                      </div>`
                    : contextMessageType === 'info'
                    ? html`<div
                        class="${clabsPrefix}--chat-footer-menu-container-item-icon-info">
                        ${iconLoader(InformationFilled16())}
                      </div>`
                    : contextMessageType === 'warning'
                    ? html`<div
                        class="${clabsPrefix}--chat-footer-menu-container-item-icon-warning">
                        ${iconLoader(WarningFilled16())}
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
                          aria-label="Close context message"
                          kind="ghost"
                          size="sm"
                          @click="${handleContextMessageClose}">
                          ${iconLoader(Close16, { slot: 'icon' })}
                          <span slot="tooltip-content">
                            ${renderLabel('prompt-close-warning')}
                            ${contextMessageType}
                          </span>
                        </cds-icon-button>
                      `}
                </div>
              </div>
            </div>
          `
        : ''}
      ${showNotification
        ? html`
            <cds-inline-notification
              title="${renderLabel('complex-feedback-notification-title')}"
              timeout="1200"
              aria-label="${renderLabel(
                'complex-feedback-notification-close-label'
              )}"
              low-contrast
              subtitle="${renderLabel(
                'complex-feedback-notification-subtitle'
              )}">
            </cds-inline-notification>
          `
        : ''}
      <div
        class="${clabsPrefix}--chat-footer-prompt-items-target ${clabsPrefix}--chat-footer-prompt-items${expandedWidth
          ? contextMessageType
            ? '-expanded-error'
            : '-expanded'
          : ''} ${isPromptFocused
          ? clabsPrefix + '--chat-footer-prompt-focused'
          : ''} ${isPromptFocused && contextMessageType
          ? clabsPrefix +
            '--chat-footer-prompt-focused' +
            '-' +
            contextMessageType
          : ''}">
        <label
          class="${clabsPrefix}--chat-search-query-label"
          for="${clabsPrefix}--chat-footer-prompt-text-area"
          >Chat text prompt area</label
        >
        <textarea
          class="${clabsPrefix}--chat-search-query ${disableInput
            ? clabsPrefix + '--chat-search-query-disabled'
            : ''}"
          rows="1"
          id="${clabsPrefix}--chat-footer-prompt-text-area"
          placeholder="${!disableInput
            ? inputPlaceholder
              ? inputPlaceholder
              : renderLabel('prompt-entry-placeholder')
            : renderLabel('prompt-loading-state-placeholder')}"
          aria-label="Chat text prompt area"
          @focus="${textAreaIsFocused}"
          @blur="${textAreaIsFocused}"
          .value="${messageText}"
          @input="${handleInput}"
          @keydown="${handleInput}">
        </textarea>

        <div class="${clabsPrefix}--chat-footer-button">
          ${!voiceAPIAvailable
            ? html`
                <cds-icon-button
                  disabled
                  kind="ghost"
                  aria-label="No microphone available"
                  @keydown="${checkKeyboardEscapeB}"
                  size="sm"
                  align="top-right">
                  ${iconLoader(MicrophoneOff16, { slot: 'icon' })}
                  <span slot="tooltip-content"
                    >${renderLabel('prompt-microphone-unavailable')}</span
                  >
                </cds-icon-button>
              `
            : html`<cds-icon-button
                kind="ghost"
                align="top-right"
                class="${isListening
                  ? clabsPrefix + '--chat-footer-button-danger'
                  : ''}"
                aria-label="${isListening
                  ? 'Stop listening'
                  : 'Start listening'}"
                @keydown="${checkKeyboardEscapeB}"
                size="sm"
                @click="${isListening ? endRecording : startRecording}">
                ${isListening
                  ? iconLoader(MicrophoneFilled16, { slot: 'icon' })
                  : iconLoader(Microphone16, { slot: 'icon' })}
                <span slot="tooltip-content"
                  >${renderLabel(
                    isListening
                      ? 'prompt-stop-listening'
                      : 'prompt-start-listening'
                  )}</span
                >
              </cds-icon-button>`}
        </div>
        <div class="${clabsPrefix}--chat-footer-button">
          ${!currentlyStreaming && !(queryProcessing && enableCancellation)
            ? html`
                <cds-icon-button
                  kind="ghost"
                  size="sm"
                  aria-label="Send"
                  class="${clabsPrefix}--chat-footer-send-button"
                  align="top-right"
                  @keydown="${checkKeyboardEscape}"
                  ?disabled="${messageText === '' || forceDisableInput}"
                  @click="${sendInputToParent}">
                  ${messageText === '' || forceDisableInput
                    ? iconLoader(Send16, {
                        slot: 'icon',
                        class: clabsPrefix + '--chat-footer-send-inactive',
                      })
                    : iconLoader(SendFilled16, {
                        slot: 'icon',
                        class: clabsPrefix + '--chat-footer-send-active',
                      })}
                  <span slot="tooltip-content">
                    ${messageText === '' || forceDisableInput
                      ? renderLabel('prompt-send-blocked-button')
                      : renderLabel('prompt-send-button')}
                  </span>
                </cds-icon-button>
              `
            : html`
                <cds-icon-button
                  kind="ghost"
                  size="sm"
                  aria-label="Stop streaming"
                  align="top-right"
                  class="${clabsPrefix + '--chat-footer-button-danger'}"
                  @keydown="${checkKeyboardEscape}"
                  @click="${endStreaming}">
                  ${iconLoader(Stop16, {
                    slot: 'icon',
                  })}
                  <span slot="tooltip-content"
                    >${renderLabel('prompt-cancel-button')}</span
                  >
                </cds-icon-button>
              `}
        </div>
      </div>
    </div>
  `;
}
