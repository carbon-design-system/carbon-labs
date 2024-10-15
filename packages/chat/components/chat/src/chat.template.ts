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
    loading,
    closed,
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
    customLabels,
    setUserMessage,
    _cancelRequest: cancelRequest,
  } = customElementClass;

  return html`<div
    aria-modal="true"
    role="dialog"
    aria-labelledby="${clabsPrefix}--chat-aria-title"
    aria-describedby="${clabsPrefix}--chat-aria-desc"
    class="${clabsPrefix}--chat-container ${closed
      ? clabsPrefix + '--chat-closed'
      : ''} ${enableDocking ? clabsPrefix + '--chat-docked' : ''} ${isDragging
      ? clabsPrefix + '--chat-docked-dragging'
      : ''}  ${enableFullscreen ? clabsPrefix + '--chat-fullscreen' : ''}">
    <div class="${clabsPrefix}--chat-content-container">
      <div class="${clabsPrefix}--chat-aria-container">
        <p id="${clabsPrefix}--chat-aria-title">AI Chat</p>
        <p id="${clabsPrefix}--chat-aria-desc">AI Chat interface window</p>
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
          ?docking-enabled="${enableDocking}"
          ?loading="${queryInProgress}"
          ?stream-responses="${streamResponses}"
          stream-delay="${streamDelay}"
          ?feedback-form-enabled="${enableFeedbackForm}"
          .feedbackFormDefinitions="${feedbackDefinitions}"
          text-feedback-form-enabled="${enableTextFeedbackForm}"
          ?user-interrupted-streaming="${interruptStreaming}"
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
          ?query-processing="${queryInProgress}"
          character-limit="${maxCharacterCount}">
        </clabs-chat-footer>
      </slot>
    </div>
  </div>`;
}
