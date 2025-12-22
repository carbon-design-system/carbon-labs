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
import '../../messages/messages.js';
import '../../header/header.js';
import '../../footer/footer.js';

import '@carbon/web-components/es/components/icon-button/index.js';
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
    loading,
    closed,
    forceAutoUpdate,
    maxCharacterCount,
    disableHeaderMenu,
    disableHeaderButtons,
    disableHeaderClose,
    disableHeaderMinimize,
    disableHeaderFullscreen,
    headerMenuItems,
    feedbackDefinitions,
    enableFullscreen,
    enableDocking,
    _handleFullscreenMode: handleFullscreenMode,
    _handleChatClosed: handleChatClosed,
    _handleDockingMode: handleDockingMode,
    inputFieldPlaceholder,
    _streamResponses: streamResponses,
    _interruptStreaming: interruptStreaming,
    _endStreaming: endStreaming,
    _streamDelay: streamDelay,
    _handleHeaderDragStart: handleHeaderDragStart,
    _handleHeaderDragCancel: handleHeaderDragCancel,
    _handleHeaderKeyboardDragStart: handleHeaderKeyboardDragStart,
    promptNotificationType,
    promptNotificationMessage,
    _isDragging: isDragging,
    enableFeedbackForm,
    enableTextFeedbackForm,
    aiSlugContent,
    aiSlugObject,
    enableRequestCancelling,
    _handleHeaderEscape,
    _handleFooterEscape,
    _triggerFooterFocus: triggerFooterFocus,
    customLabels,
    setUserMessage,
    enableLauncher,
    _cancelRequest: cancelRequest,
    _handleChatOpened: handleChatOpened,
    _handleComplexFeedback: handleComplexFeedback,
    complexFeedbackCount,
  } = customElementClass;

  return html`<div
    aria-modal="true"
    role="dialog"
    aria-labelledby="${clabsPrefix}--chat-aria-title"
    aria-describedby="${clabsPrefix}--chat-aria-desc"
    class="${clabsPrefix}--chat-container ${closed && !enableLauncher
      ? clabsPrefix + '--chat-closed'
      : closed && enableLauncher
      ? clabsPrefix + '--chat-launcher-container'
      : ''} ${enableDocking ? clabsPrefix + '--chat-docked' : ''} ${isDragging
      ? clabsPrefix + '--chat-docked-dragging'
      : ''}  ${enableFullscreen ? clabsPrefix + '--chat-fullscreen' : ''}">
    ${enableLauncher && closed
      ? html`
          <cds-icon-button
            class="${clabsPrefix}--chat-launcher-button"
            size="md"
            @click="${handleChatOpened}">
            <svg
              slot="icon"
              id="icon"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32">
              <path
                class="${clabsPrefix}--chat-launcher-container-cls-2"
                d="m15,19l-1.4141,1.4141,3.5859,3.5859H4v-13h-2v13c0,1.1046.8954,2,2,2h13.1719l-3.5859,3.5859,1.4141,1.4141,6-6-6-6Z" />
              <path class="cls-2" d="m24,18v-2h2V4h-2v-2h6v2h-2v12h2v2h-6Z" />
              <path
                class="cls-2"
                d="m21,18h2l-5.5-16-3,.0088-5.5,15.9912h2l1.3333-4h7.3335l1.3333,4Zm-8-6l3-9,3,9h-6Z" />
              <rect
                id="_Transparent_Rectangle_"
                data-name="&amp;lt;Transparent Rectangle&amp;gt;"
                class="${clabsPrefix}--chat-launcher-container-cls-1"
                width="32"
                height="32"
                transform="translate(32 32) rotate(180)" />
            </svg>
          </cds-icon-button>
        `
      : html`
          <div class="${clabsPrefix}--chat-content-container">
            <div class="${clabsPrefix}--chat-aria-container">
              <p id="${clabsPrefix}--chat-aria-title">AI Chat</p>
              <p id="${clabsPrefix}--chat-aria-desc">
                AI Chat interface window
              </p>
            </div>
            <slot name="header">
              <clabs-chat-header
                @on-chat-fullscreen-change="${handleFullscreenMode}"
                @on-chat-docking-change="${handleDockingMode}"
                @on-chat-closed="${handleChatClosed}"
                @on-header-drag-initiated="${handleHeaderDragStart}"
                @on-header-drag-cancel="${handleHeaderDragCancel}"
                @on-header-drag-keyboard-initiated="${handleHeaderKeyboardDragStart}"
                @on-header-escape="${_handleHeaderEscape}"
                @on-footer-escape="${_handleFooterEscape}"
                header-slug-content="${aiSlugContent}"
                .headerSlugObject="${aiSlugObject}"
                .menuItems="${headerMenuItems}"
                .customLabels="${customLabels}"
                ?docking-enabled="${enableDocking}"
                ?disable-header-menu="${disableHeaderMenu}"
                ?disable-header-close="${disableHeaderClose}"
                ?disable-header-fullscreen="${disableHeaderFullscreen}"
                ?disable-header-minimize="${disableHeaderMinimize}"
                ?disable-header-buttons="${disableHeaderButtons}">
              </clabs-chat-header>
            </slot>

            <slot name="messages">
              <clabs-chat-messages
                .messages="${messages}"
                user-name="${userName}"
                agent-name="${agentName}"
                ?force-scroll-down="${forceAutoUpdate}"
                ?docking-enabled="${enableDocking}"
                ?loading="${queryInProgress}"
                ?stream-responses="${streamResponses}"
                stream-delay="${streamDelay}"
                ?feedback-form-enabled="${enableFeedbackForm}"
                .feedbackFormDefinitions="${feedbackDefinitions}"
                text-feedback-form-enabled="${enableTextFeedbackForm}"
                ?user-interrupted-streaming="${interruptStreaming}"
                @on-user-complex-feedback-request="${handleComplexFeedback}"
                @on-message-regeneration="${handleUserRegenerationRequest}"
                @on-user-message-update-request="${handleUserUpdateRequest}"
                .customLabels="${customLabels}"
                @on-message-streaming-done="${endStreaming}">
              </clabs-chat-messages>
            </slot>

            <slot name="footer">
              <clabs-chat-footer
                ?disable-input="${loading}"
                @on-user-text-input="${sendInput}"
                @on-user-stream-interrupt="${endStreaming}"
                @on-user-request-interrupt="${cancelRequest}"
                @on-footer-escape="${_handleFooterEscape}"
                context-message="${promptNotificationMessage}"
                context-message-type="${promptNotificationType}"
                .customLabels="${customLabels}"
                ?fullscreen-mode="${enableFullscreen}"
                ?enable-cancellation="${enableRequestCancelling}"
                ?currently-streaming="${streamResponses && !interruptStreaming}"
                input-placeholder="${inputFieldPlaceholder}"
                preset-entry="${setUserMessage}"
                ?focus-prompt="${triggerFooterFocus}"
                notification-count="${complexFeedbackCount}"
                ?query-processing="${queryInProgress}"
                character-limit="${maxCharacterCount}">
              </clabs-chat-footer>
            </slot>
          </div>
        `}
  </div>`;
}
