/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, nothing } from 'lit';
import { settings } from '@carbon-labs/utilities';
import '@carbon/web-components/es/components/notification/index.js';
const { stablePrefix: clabsPrefix } = settings;
import '../../message/message.js';

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function messagesTemplate(customElementClass) {
  const {
    _computedMessages: computedMessages,
    _queryInProgress: queryInProgress,
    _streamResponses: streamResponses,
    _handleInternalChange: handleInternalChange,
    _handleSlotchange,
    _parentTheme: parentTheme,
    _dockingEnabled: dockingEnabled,
    _streamDelay: streamDelay,
    _handleScroll: handleScroll,
    userInterruptedStreaming,
    feedbackFormDefinitions,
    enableFeedbackForm,
    userName,
    customLabels,
  } = customElementClass;

  return html` <div
      class="${clabsPrefix}--chat-messages-hidden-label"
      id="${clabsPrefix}--chat-messages-target-reader-label">
      messages list
    </div>

    <div
      @wheel="${handleScroll}"
      role="tree"
      aria-labelledby="${clabsPrefix}--chat-messages-target-reader-label"
      class="${clabsPrefix}--chat-messages-container ${streamResponses
        ? clabsPrefix + '--chat-messages-container-streaming'
        : ''} 

    ${dockingEnabled ? clabsPrefix + '--chat-messages-container-docked' : ''}">
      <slot name="message-items" @slotchange="${_handleSlotchange}">
        ${computedMessages
          ? html`
              ${computedMessages.map((message, index) =>
                message.hasError
                  ? html` <clabs-chat-message
                      raw-text="${message.text}"
                      origin="${message.origin}"
                      ?user-submitted="${message.userSubmitted ||
                      message.origin === userName}"
                      time-stamp="${message.time}"
                      .customLabels="${customLabels}"
                      error-state
                      stream-delay="${streamDelay}"
                      ?compact-icon="${dockingEnabled}"
                      index="${index}">
                    </clabs-chat-message>`
                  : html` <clabs-chat-message
                      raw-text="${message.text}"
                      origin="${message.origin}"
                      separator="${message.origin === 'separator' || nothing}"
                      time-stamp="${message.time}"
                      ?user-submitted="${message.userSubmitted ||
                      message.origin === userName}"
                      disable-buttons="${message.disableButtons || nothing}"
                      index="${index}"
                      .customLabels="${customLabels}"
                      ?enable-complex-feedback="${enableFeedbackForm}"
                      .feedbackFormDefinitions="${feedbackFormDefinitions}"
                      stream-delay="${streamDelay}"
                      parent-theme="${parentTheme}"
                      @on-structure-change="${handleInternalChange}"
                      ?compact-icon="${dockingEnabled}"
                      ?stream-content="${streamResponses &&
                      !userInterruptedStreaming}"
                      display-name="${message.displayName || nothing}"
                      display-color="${message.displayColor || nothing}"
                      .elements="${message.elements || nothing}">
                    </clabs-chat-message>`
              )}
              ${queryInProgress
                ? html` <clabs-chat-message
                    parent-theme="${parentTheme}"
                    ?compact-icon="${dockingEnabled}"
                    time-stamp=""
                    .customLabels="${customLabels}"
                    loading-state
                    .elements="${[{ type: 'loading', content: '' }]}"
                    error-state="false">
                  </clabs-chat-message>`
                : html``}
            `
          : html``}
      </slot>
    </div>`;
}
