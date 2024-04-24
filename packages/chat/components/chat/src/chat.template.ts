/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon/ai-utilities/es/settings/index.js';
import '../../messages/messages.js';
import '../../header/header.js';
import '../../footer/footer.js';
const { stablePrefix: c4aiPrefix } = settings;

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
    _streamResponses: streamResponses,
  } = customElementClass;

  return html`<div class="${c4aiPrefix}--chat-container">
    <c4ai--chat-header> </c4ai--chat-header>

    <c4ai--chat-messages
      .messages="${messages}"
      user-name="${userName}"
      agent-name="${agentName}"
      ?loading="${queryInProgress}"
      ?stream-responses="${streamResponses}"
      @on-user-regeneration-request="${handleUserRegenerationRequest}"
      @on-user-message-update-request="${handleUserUpdateRequest}">
    </c4ai--chat-messages>

    <c4ai--chat-footer @user-input="${sendInput}"> </c4ai--chat-footer>
  </div>`;
}
