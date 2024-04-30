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
import '../../messages/messages.js';
import '../../header/header.js';
import '../../footer/footer.js';
const { stablePrefix: clabsPrefix } = settings;

/**
 * Lit template for Chat interface
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function chatTemplate(customElementClass) {
  const {
    _messages: messages,
    _queryInProgress: queryInProgress,
    _handleUserRegenerationRequest: handleUserRegenerationRequest,
    _handleUserUpdateRequest: handleUserUpdateRequest,
    sendInput,
    userName,
    agentName,
    _inputFieldPlaceholder: inputFieldPlaceholder,
    _streamResponses: streamResponses,
  } = customElementClass;

  return html`<div class="${clabsPrefix}--chat-container">
    <clabs--chat-header> </clabs--chat-header>

    <slot name="messages">
      <clabs--chat-messages
        .messages="${messages}"
        user-name="${userName}"
        agent-name="${agentName}"
        ?loading="${queryInProgress}"
        ?stream-responses="${streamResponses}"
        @on-message-regeneration="${handleUserRegenerationRequest}"
        @on-user-message-update-request="${handleUserUpdateRequest}">
      </clabs--chat-messages>
    </slot>

    <clabs--chat-footer
      @on-user-text-input="${sendInput}"
      input-placeholder="${inputFieldPlaceholder}">
    </clabs--chat-footer>
  </div>`;
}
