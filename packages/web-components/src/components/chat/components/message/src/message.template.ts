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
import Renew16 from '@carbon/icons/es/renew/16.js';
import Edit16 from '@carbon/icons/es/edit/16.js';
import ThumbsUp16 from '@carbon/icons/es/thumbs-up/16.js';
import ThumbsDown16 from '@carbon/icons/es/thumbs-down/16.js';
import ThumbsUpFilled16 from '@carbon/icons/es/thumbs-up--filled/16.js';
import ThumbsDownFilled16 from '@carbon/icons/es/thumbs-down--filled/16.js';
import CheckMark16 from '@carbon/icons/es/checkmark/16.js';
import Undo16 from '@carbon/icons/es/undo/16.js';
import WatsonxData24 from '@carbon/icons/es/watsonx-data/24.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import '@carbon/web-components/es/components/slug/index.js';
import '../../chartElement/chartElement.js';
import '../../tableElement/tableElement.js';
import '../../cardElement/cardElement.js';
import '../../codeElement/codeElement.js';
import '../../tagListElement/tagListElement.js';
import '../../listElement/listElement.js';
import '../../textElement/textElement.js';
import '../../imageElement/imageElement.js';
import '../../editableTextElement/editableTextElement.js';
import '../../errorElement/errorElement.js';
import '../../loadingElement/loadingElement.js';
import '../../carouselElement/carouselElement.js';
import '../../linkListElement/linkListElement.js';
import '../../molecularElement/molecularElement.js';
import '../../formulaElement/formulaElement.js';
import '../../fileUploadElement/fileUploadElement.js';
import '../../popupElement/popupElement.js';
import '../../diagramElement/diagramElement.js';

/**
 * Lit template for message
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function messageTemplate(customElementClass) {
  const {
    _messageElements: messageElements,
    userSubmitted,
    isSeparator,
    timeStamp: timeStamp,
    loadingState: loadingState,
    index,
    displayName: displayName,
    disableButtons: disableButtons,
    _editing: editing,
    _handleEdit: handleEdit,
    _cancelEdit: cancelEdit,
    _setEditedMessage: setEditedMessage,
    _validateEdit: validateEdit,
    _handlePositiveFeedback: handlePositiveFeedback,
    _handleNegativeFeedback: handleNegativeFeedback,
    _handleRegenerate: handleRegenerate,
    _onTagSelected: onTagSelected,
    temporaryMessage,
    showFeedBackForm,
    _parentTheme: parentTheme,
    _childLinkClicked: childLinkClicked,
    displayColor,
    currentlyStreaming,
    _handleSlotchange,
    _hideFeedBackForm: hideFeedBackForm,
    disableFeedbackButtons,
    positiveFeedbackSelected,
    negativeFeedbackSelected,
    enableComplexFeedback,
    handlePositiveKeyboardInput,
    handleNegativeKeyboardInput,
    compactIcon,
    _feedbackFormValues: feedbackFormValues,
    popupTargetElement,
    _renderLabel: renderLabel,
    customLabels,
    _readerContent: readerContent,
    previousMessageWidth,
    uniqueIconId,
    rawText,
  } = customElementClass;

  return html` <div
      class="${clabsPrefix}--chat-message-hidden-label"
      aria-hidden="${!readerContent}"
      role="${readerContent ? 'alert' : 'heading'}"
      id="${clabsPrefix}--chat-message-${index}-target-reader-label">
      ${readerContent
        ? html` ${loadingState
            ? html`Message sent, please wait...`
            : `Message from
      ${
        userSubmitted
          ? displayName
            ? displayName
            : 'You'
          : !displayName
          ? 'Watson X'
          : displayName === 'watsonx'
          ? 'Watson X'
          : displayName
      }
      at ${timeStamp}: ${readerContent}`}`
        : ''}
    </div>
    <div
      aria-labelledby="${clabsPrefix}--chat-message-${index}-target-reader-label"
      role="treeitem"
      aria-label="message"
      tabindex="0"
      class="${clabsPrefix}--chat-message ${clabsPrefix}--chat-message-user-message">
      <div class="${clabsPrefix}--chat-message-container">
        ${isSeparator
          ? html`<div class="${clabsPrefix}--chat-message-content">
              <div class="${clabsPrefix}--chat-message-separator">
                ${rawText}
              </div>
            </div>`
          : userSubmitted
          ? html` <div class="${clabsPrefix}--chat-message-content">
              <div
                class="${clabsPrefix}--chat-message-timestamp-user"
                aria-hidden="true">
                ${displayName ? displayName : 'You'} ${timeStamp}
              </div>
              <div class="${clabsPrefix}--chat-message-response-user">
                <slot
                  name="message-item-content"
                  @slotchange="${_handleSlotchange}">
                  ${messageElements.map(
                    (message) =>
                      html` ${editing
                        ? html` <clabs-chat-editable-text
                            content="${message.content}"
                            preset-width="${previousMessageWidth}"
                            @message-edited="${setEditedMessage}">
                          </clabs-chat-editable-text>`
                        : html`<clabs-chat-text
                            align-right
                            content="${message.content}">
                          </clabs-chat-text>`}`
                  )}
                </slot>
              </div>
              ${!disableButtons
                ? html` <div class="${clabsPrefix}--chat-message-dropdown-user">
                    ${editing === true
                      ? html` <cds-icon-button
                            size="sm"
                            kind="ghost"
                            align="left"
                            label="Undo edit"
                            @click="${cancelEdit}">
                            ${iconLoader(Undo16, { slot: 'icon' })}
                            <span slot="tooltip-content"
                              >${renderLabel('message-undo-edit')}</span
                            >
                          </cds-icon-button>
                          <cds-icon-button
                            size="sm"
                            kind="ghost"
                            align="left"
                            label="Send edit"
                            @click="${validateEdit}">
                            ${iconLoader(CheckMark16, { slot: 'icon' })}
                            <span slot="tooltip-content"
                              >${renderLabel('message-validate-edit')}</span
                            >
                          </cds-icon-button>`
                      : html` <cds-icon-button
                          size="sm"
                          kind="ghost"
                          align="left"
                          label="Edit Code"
                          @click="${handleEdit}">
                          ${iconLoader(Edit16, { slot: 'icon' })}
                          <span slot="tooltip-content"
                            >${renderLabel('message-enable-editing')}</span
                          >
                        </cds-icon-button>`}
                  </div>`
                : html` <div
                    class="${clabsPrefix}--chat-message-dropdown-user"></div>`}
            </div>`
          : html` ${!compactIcon
                ? html`<div class="${clabsPrefix}--chat-message-icon">
                    ${displayColor
                      ? html` <div
                          class="${clabsPrefix}--chat-message-agent-icon">
                          ${iconLoader(WatsonxData24())}
                        </div>`
                      : html`
                          <div class="${clabsPrefix}--chat-message-bot-icon">
                            ${parentTheme === 'white'
                              ? html` <svg
                                  aria-hidden="true"
                                  role="presentation"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 32 32">
                                  <defs>
                                    <linearGradient
                                      id="${uniqueIconId}_ik7o2yqk8a"
                                      x1="1186.526"
                                      y1="2863.168"
                                      x2="1199.825"
                                      y2="2845.109"
                                      gradientTransform="matrix(.8312 .55596 -.27409 .40979 -198.894 -1827.398)"
                                      gradientUnits="userSpaceOnUse">
                                      <stop offset=".3" />
                                      <stop offset="1" stop-opacity="0" />
                                    </linearGradient>
                                    <linearGradient
                                      id="${uniqueIconId}_9hg0dg6llb"
                                      x1="1189.388"
                                      y1="2911.794"
                                      x2="1200.478"
                                      y2="2896.735"
                                      gradientTransform="rotate(146.223 380.87 -882.286) scale(1 -.493)"
                                      gradientUnits="userSpaceOnUse">
                                      <stop offset=".3" />
                                      <stop offset=".9" stop-opacity="0" />
                                    </linearGradient>
                                    <linearGradient
                                      id="${uniqueIconId}_q1snp4vndc"
                                      x1="-4995.033"
                                      y1="-20162.835"
                                      x2="-4981.733"
                                      y2="-20180.895"
                                      gradientTransform="rotate(-146.223 -971.422 -5714.55) scale(1 .493)"
                                      gradientUnits="userSpaceOnUse">
                                      <stop offset=".32" />
                                      <stop offset=".354" stop-opacity=".798" />
                                      <stop offset=".7" stop-opacity="0" />
                                    </linearGradient>
                                    <linearGradient
                                      id="${uniqueIconId}_8ak2l80n4e"
                                      x1="0"
                                      y1="32"
                                      x2="32"
                                      y2="0"
                                      gradientUnits="userSpaceOnUse">
                                      <stop offset=".1" stop-color="#a56eff" />
                                      <stop offset=".9" stop-color="#0f62fe" />
                                    </linearGradient>
                                    <mask
                                      id="${uniqueIconId}_eelbk9r8md"
                                      x="0"
                                      y="0"
                                      width="32"
                                      height="32"
                                      maskUnits="userSpaceOnUse">
                                      <path
                                        d="M16 1A14.915 14.915 0 0 0 5.502 5.286l1.4 1.429A12.922 12.922 0 0 1 16 3.001c.977 0 1.929.109 2.845.315-3.402.921-5.916 4.026-5.916 7.715 0 .782.118 1.537.328 2.252a7.978 7.978 0 0 0-2.188-.312c-3.704 0-6.819 2.534-7.726 5.957a12.954 12.954 0 0 1-.345-2.927c0-2.117.492-4.134 1.462-5.996l-1.773-.924A15.037 15.037 0 0 0 .999 16c0 8.271 6.729 15 15 15 3.949 0 7.678-1.522 10.498-4.286l-1.4-1.428A12.926 12.926 0 0 1 15.999 29c-3.648 0-6.945-1.516-9.309-3.945a5.959 5.959 0 0 1-1.621-4.086c0-3.309 2.691-6 6-6a6.006 6.006 0 0 1 5.897 7.107l1.967.367a7.971 7.971 0 0 0-.192-3.726 7.976 7.976 0 0 0 2.187.312c3.71 0 6.829-2.542 7.73-5.974.22.947.34 1.931.34 2.944 0 2.117-.492 4.134-1.462 5.995l1.773.924a15.034 15.034 0 0 0 1.688-6.919C31 7.729 24.272 1 16 1zm4.93 16.03c-3.309 0-6-2.692-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z"
                                        fill="#ffffff"
                                        stroke-width="0" />
                                      <path
                                        fill="url(#${uniqueIconId}_ik7o2yqk8a)"
                                        stroke-width="0"
                                        d="M8 9 0 0h16l2.305 3.304L8 9z" />
                                      <path
                                        fill="url(#${uniqueIconId}_9hg0dg6llb)"
                                        stroke-width="0"
                                        d="m12 31 4.386-9L6 21 2 31h10z" />
                                      <path
                                        fill="url(#${uniqueIconId}_q1snp4vndc)"
                                        stroke-width="0"
                                        d="m24 23 8 9H16l-2.304-3.305L24 23z" />
                                      <path
                                        stroke-width="0"
                                        d="M16 31h-4.283L15 22h2l-1 9z" />
                                    </mask>
                                  </defs>
                                  <g mask="url(#${uniqueIconId}_eelbk9r8md)">
                                    <path
                                      stroke-width="0"
                                      fill="url(#${uniqueIconId}_8ak2l80n4e)"
                                      d="M0 0h32v32H0z" />
                                  </g>
                                  <circle
                                    cx="6"
                                    cy="6"
                                    r="2"
                                    stroke-width="0"
                                    fill="#001d6c" />
                                  <circle
                                    cx="26"
                                    cy="26"
                                    r="2"
                                    stroke-width="0"
                                    fill="#001d6c" />
                                  <path
                                    d="M16 31c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z"
                                    stroke-width="0"
                                    fill="#001d6c" />
                                </svg>`
                              : html`<svg
                                  aria-hidden="true"
                                  role="presentation"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 32 32">
                                  <defs>
                                    <linearGradient
                                      id="${uniqueIconId}_8913t7g6za"
                                      x1="1196.653"
                                      y1="2930.892"
                                      x2="1209.953"
                                      y2="2912.832"
                                      gradientTransform="matrix(.8312 .55596 -.27409 .40979 -188.767 -1860.755)"
                                      gradientUnits="userSpaceOnUse">
                                      <stop offset=".3" />
                                      <stop offset="1" stop-opacity="0" />
                                    </linearGradient>
                                    <linearGradient
                                      id="${uniqueIconId}_woevpxiuib"
                                      x1="1299.261"
                                      y1="2844.072"
                                      x2="1310.351"
                                      y2="2829.012"
                                      gradientTransform="rotate(146.223 440.869 -882.286) scale(1 -.493)"
                                      gradientUnits="userSpaceOnUse">
                                      <stop offset=".3" />
                                      <stop offset=".9" stop-opacity="0" />
                                    </linearGradient>
                                    <linearGradient
                                      id="${uniqueIconId}_je2bg9iagc"
                                      x1="-4885.16"
                                      y1="-20230.559"
                                      x2="-4871.86"
                                      y2="-20248.618"
                                      gradientTransform="rotate(-146.223 -911.421 -5714.55) scale(1 .493)"
                                      gradientUnits="userSpaceOnUse">
                                      <stop offset=".32" />
                                      <stop offset=".354" stop-opacity=".798" />
                                      <stop offset=".7" stop-opacity="0" />
                                    </linearGradient>
                                    <linearGradient
                                      id="${uniqueIconId}_2co5q30b1e"
                                      x1="0"
                                      y1="32"
                                      x2="32"
                                      y2="0"
                                      gradientUnits="userSpaceOnUse">
                                      <stop offset=".1" stop-color="#be95ff" />
                                      <stop offset=".9" stop-color="#4589ff" />
                                    </linearGradient>
                                    <mask
                                      id="${uniqueIconId}_brch21jdod"
                                      x="0"
                                      y="0"
                                      width="32"
                                      height="32"
                                      maskUnits="userSpaceOnUse">
                                      <path
                                        d="M16 1A14.915 14.915 0 0 0 5.502 5.286l1.4 1.429A12.922 12.922 0 0 1 16 3.001c.977 0 1.929.109 2.845.315-3.402.921-5.916 4.026-5.916 7.715 0 .782.118 1.537.328 2.252a7.978 7.978 0 0 0-2.188-.312c-3.704 0-6.819 2.534-7.726 5.957a12.954 12.954 0 0 1-.345-2.927c0-2.117.492-4.134 1.462-5.996l-1.773-.924A15.037 15.037 0 0 0 .999 16c0 8.271 6.729 15 15 15 3.949 0 7.678-1.522 10.498-4.286l-1.4-1.428A12.926 12.926 0 0 1 15.999 29c-3.648 0-6.945-1.516-9.309-3.945a5.959 5.959 0 0 1-1.621-4.086c0-3.309 2.691-6 6-6a6.006 6.006 0 0 1 5.897 7.107l1.967.367a7.971 7.971 0 0 0-.192-3.726 7.976 7.976 0 0 0 2.187.312c3.71 0 6.829-2.542 7.73-5.974.22.947.34 1.931.34 2.944 0 2.117-.492 4.134-1.462 5.995l1.773.924a15.034 15.034 0 0 0 1.688-6.919c0-8.271-6.729-15-15-15zm4.93 16.03c-3.309 0-6-2.692-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z"
                                        stroke-width="0"
                                        fill="#ffffff" />
                                      <path
                                        stroke-width="0"
                                        fill="url(#${uniqueIconId}_8913t7g6za)"
                                        d="M8 9 0 0h16l2.305 3.305L8 9z" />
                                      <path
                                        stroke-width="0"
                                        fill="url(#${uniqueIconId}_woevpxiuib)"
                                        d="m12 31 4.386-9L6 21 2 31h10z" />
                                      <path
                                        stroke-width="0"
                                        fill="url(#${uniqueIconId}_je2bg9iagc)"
                                        d="m24 23 8 9H16l-2.305-3.305L24 23z" />
                                      <path
                                        stroke-width="0"
                                        d="M16 31h-4.283L15 22h2l-1 9z" />
                                    </mask>
                                  </defs>
                                  <g mask="url(#${uniqueIconId}_brch21jdod)">
                                    <path
                                      stroke-width="0"
                                      fill="url(#${uniqueIconId}_2co5q30b1e)"
                                      d="M0 0h32v32H0z" />
                                  </g>
                                  <circle
                                    cx="6"
                                    cy="6"
                                    r="2"
                                    stroke-width="0"
                                    fill="#f4f4f4" />
                                  <circle
                                    cx="26"
                                    cy="26"
                                    r="2"
                                    stroke-width="0"
                                    fill="#f4f4f4" />
                                  <path
                                    d="M16 31c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z"
                                    stroke-width="0"
                                    fill="#f4f4f4" />
                                </svg>`}
                          </div>
                        `}
                  </div> `
                : html``}
              <div
                class="${clabsPrefix}--chat-message-content ${compactIcon
                  ? clabsPrefix + '--chat-message-content-compact'
                  : ''}">
                ${!compactIcon
                  ? html` <div
                      class="${clabsPrefix}--chat-message-timestamp-bot"
                      aria-hidden="true">
                      ${displayName == null ? 'watsonx' : displayName}
                      ${timeStamp}
                    </div>`
                  : html` <div
                      class="${clabsPrefix}--chat-message-header-bot-compact">
                      <div
                        class="${clabsPrefix}--chat-message-bot-icon-compact">
                        ${parentTheme === 'white'
                          ? html`<svg
                              aria-hidden="true"
                              role="presentation"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 32 32">
                              <defs>
                                <linearGradient
                                  id="${uniqueIconId}_ik7o2yqk8a"
                                  x1="1186.526"
                                  y1="2863.168"
                                  x2="1199.825"
                                  y2="2845.109"
                                  gradientTransform="matrix(.8312 .55596 -.27409 .40979 -198.894 -1827.398)"
                                  gradientUnits="userSpaceOnUse">
                                  <stop offset=".3" />
                                  <stop offset="1" stop-opacity="0" />
                                </linearGradient>
                                <linearGradient
                                  id="${uniqueIconId}_9hg0dg6llb"
                                  x1="1189.388"
                                  y1="2911.794"
                                  x2="1200.478"
                                  y2="2896.735"
                                  gradientTransform="rotate(146.223 380.87 -882.286) scale(1 -.493)"
                                  gradientUnits="userSpaceOnUse">
                                  <stop offset=".3" />
                                  <stop offset=".9" stop-opacity="0" />
                                </linearGradient>
                                <linearGradient
                                  id="${uniqueIconId}_q1snp4vndc"
                                  x1="-4995.033"
                                  y1="-20162.835"
                                  x2="-4981.733"
                                  y2="-20180.895"
                                  gradientTransform="rotate(-146.223 -971.422 -5714.55) scale(1 .493)"
                                  gradientUnits="userSpaceOnUse">
                                  <stop offset=".32" />
                                  <stop offset=".354" stop-opacity=".798" />
                                  <stop offset=".7" stop-opacity="0" />
                                </linearGradient>
                                <linearGradient
                                  id="${uniqueIconId}_8ak2l80n4e"
                                  x1="0"
                                  y1="32"
                                  x2="32"
                                  y2="0"
                                  gradientUnits="userSpaceOnUse">
                                  <stop offset=".1" stop-color="#a56eff" />
                                  <stop offset=".9" stop-color="#0f62fe" />
                                </linearGradient>
                                <mask
                                  id="${uniqueIconId}_eelbk9r8md"
                                  x="0"
                                  y="0"
                                  width="32"
                                  height="32"
                                  maskUnits="userSpaceOnUse">
                                  <path
                                    d="M16 1A14.915 14.915 0 0 0 5.502 5.286l1.4 1.429A12.922 12.922 0 0 1 16 3.001c.977 0 1.929.109 2.845.315-3.402.921-5.916 4.026-5.916 7.715 0 .782.118 1.537.328 2.252a7.978 7.978 0 0 0-2.188-.312c-3.704 0-6.819 2.534-7.726 5.957a12.954 12.954 0 0 1-.345-2.927c0-2.117.492-4.134 1.462-5.996l-1.773-.924A15.037 15.037 0 0 0 .999 16c0 8.271 6.729 15 15 15 3.949 0 7.678-1.522 10.498-4.286l-1.4-1.428A12.926 12.926 0 0 1 15.999 29c-3.648 0-6.945-1.516-9.309-3.945a5.959 5.959 0 0 1-1.621-4.086c0-3.309 2.691-6 6-6a6.006 6.006 0 0 1 5.897 7.107l1.967.367a7.971 7.971 0 0 0-.192-3.726 7.976 7.976 0 0 0 2.187.312c3.71 0 6.829-2.542 7.73-5.974.22.947.34 1.931.34 2.944 0 2.117-.492 4.134-1.462 5.995l1.773.924a15.034 15.034 0 0 0 1.688-6.919C31 7.729 24.272 1 16 1zm4.93 16.03c-3.309 0-6-2.692-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z"
                                    fill="#ffffff"
                                    stroke-width="0" />
                                  <path
                                    fill="url(#${uniqueIconId}_ik7o2yqk8a)"
                                    stroke-width="0"
                                    d="M8 9 0 0h16l2.305 3.304L8 9z" />
                                  <path
                                    fill="url(#${uniqueIconId}_9hg0dg6llb)"
                                    stroke-width="0"
                                    d="m12 31 4.386-9L6 21 2 31h10z" />
                                  <path
                                    fill="url(#${uniqueIconId}_q1snp4vndc)"
                                    stroke-width="0"
                                    d="m24 23 8 9H16l-2.304-3.305L24 23z" />
                                  <path
                                    stroke-width="0"
                                    d="M16 31h-4.283L15 22h2l-1 9z" />
                                </mask>
                              </defs>
                              <g mask="url(#${uniqueIconId}_eelbk9r8md)">
                                <path
                                  stroke-width="0"
                                  fill="url(#${uniqueIconId}_8ak2l80n4e)"
                                  d="M0 0h32v32H0z" />
                              </g>
                              <circle
                                cx="6"
                                cy="6"
                                r="2"
                                stroke-width="0"
                                fill="#001d6c" />
                              <circle
                                cx="26"
                                cy="26"
                                r="2"
                                stroke-width="0"
                                fill="#001d6c" />
                              <path
                                d="M16 31c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z"
                                stroke-width="0"
                                fill="#001d6c" />
                            </svg>`
                          : html`<svg
                              aria-hidden="true"
                              role="presentation"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 32 32">
                              <defs>
                                <linearGradient
                                  id="${uniqueIconId}_8913t7g6za"
                                  x1="1196.653"
                                  y1="2930.892"
                                  x2="1209.953"
                                  y2="2912.832"
                                  gradientTransform="matrix(.8312 .55596 -.27409 .40979 -188.767 -1860.755)"
                                  gradientUnits="userSpaceOnUse">
                                  <stop offset=".3" />
                                  <stop offset="1" stop-opacity="0" />
                                </linearGradient>
                                <linearGradient
                                  id="${uniqueIconId}_woevpxiuib"
                                  x1="1299.261"
                                  y1="2844.072"
                                  x2="1310.351"
                                  y2="2829.012"
                                  gradientTransform="rotate(146.223 440.869 -882.286) scale(1 -.493)"
                                  gradientUnits="userSpaceOnUse">
                                  <stop offset=".3" />
                                  <stop offset=".9" stop-opacity="0" />
                                </linearGradient>
                                <linearGradient
                                  id="${uniqueIconId}_je2bg9iagc"
                                  x1="-4885.16"
                                  y1="-20230.559"
                                  x2="-4871.86"
                                  y2="-20248.618"
                                  gradientTransform="rotate(-146.223 -911.421 -5714.55) scale(1 .493)"
                                  gradientUnits="userSpaceOnUse">
                                  <stop offset=".32" />
                                  <stop offset=".354" stop-opacity=".798" />
                                  <stop offset=".7" stop-opacity="0" />
                                </linearGradient>
                                <linearGradient
                                  id="${uniqueIconId}_2co5q30b1e"
                                  x1="0"
                                  y1="32"
                                  x2="32"
                                  y2="0"
                                  gradientUnits="userSpaceOnUse">
                                  <stop offset=".1" stop-color="#be95ff" />
                                  <stop offset=".9" stop-color="#4589ff" />
                                </linearGradient>
                                <mask
                                  id="${uniqueIconId}_brch21jdod"
                                  x="0"
                                  y="0"
                                  width="32"
                                  height="32"
                                  maskUnits="userSpaceOnUse">
                                  <path
                                    d="M16 1A14.915 14.915 0 0 0 5.502 5.286l1.4 1.429A12.922 12.922 0 0 1 16 3.001c.977 0 1.929.109 2.845.315-3.402.921-5.916 4.026-5.916 7.715 0 .782.118 1.537.328 2.252a7.978 7.978 0 0 0-2.188-.312c-3.704 0-6.819 2.534-7.726 5.957a12.954 12.954 0 0 1-.345-2.927c0-2.117.492-4.134 1.462-5.996l-1.773-.924A15.037 15.037 0 0 0 .999 16c0 8.271 6.729 15 15 15 3.949 0 7.678-1.522 10.498-4.286l-1.4-1.428A12.926 12.926 0 0 1 15.999 29c-3.648 0-6.945-1.516-9.309-3.945a5.959 5.959 0 0 1-1.621-4.086c0-3.309 2.691-6 6-6a6.006 6.006 0 0 1 5.897 7.107l1.967.367a7.971 7.971 0 0 0-.192-3.726 7.976 7.976 0 0 0 2.187.312c3.71 0 6.829-2.542 7.73-5.974.22.947.34 1.931.34 2.944 0 2.117-.492 4.134-1.462 5.995l1.773.924a15.034 15.034 0 0 0 1.688-6.919c0-8.271-6.729-15-15-15zm4.93 16.03c-3.309 0-6-2.692-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z"
                                    stroke-width="0"
                                    fill="#ffffff" />
                                  <path
                                    stroke-width="0"
                                    fill="url(#${uniqueIconId}_8913t7g6za)"
                                    d="M8 9 0 0h16l2.305 3.305L8 9z" />
                                  <path
                                    stroke-width="0"
                                    fill="url(#${uniqueIconId}_woevpxiuib)"
                                    d="m12 31 4.386-9L6 21 2 31h10z" />
                                  <path
                                    stroke-width="0"
                                    fill="url(#${uniqueIconId}_je2bg9iagc)"
                                    d="m24 23 8 9H16l-2.305-3.305L24 23z" />
                                  <path
                                    stroke-width="0"
                                    d="M16 31h-4.283L15 22h2l-1 9z" />
                                </mask>
                              </defs>
                              <g mask="url(#${uniqueIconId}_brch21jdod)">
                                <path
                                  stroke-width="0"
                                  fill="url(#${uniqueIconId}_2co5q30b1e)"
                                  d="M0 0h32v32H0z" />
                              </g>
                              <circle
                                cx="6"
                                cy="6"
                                r="2"
                                stroke-width="0"
                                fill="#f4f4f4" />
                              <circle
                                cx="26"
                                cy="26"
                                r="2"
                                stroke-width="0"
                                fill="#f4f4f4" />
                              <path
                                d="M16 31c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z"
                                stroke-width="0"
                                fill="#f4f4f4" />
                            </svg>`}
                      </div>
                      <div
                        class="${clabsPrefix}--chat-message-timestamp-bot-compact"
                        id="message${index}-origin">
                        ${displayName == null ? 'watsonx' : displayName}
                        ${timeStamp}
                      </div>
                    </div>`}

                <div
                  class="${clabsPrefix}--chat-message-response-bot ${currentlyStreaming
                    ? clabsPrefix + '--chat-message-streaming'
                    : ''}">
                  <slot
                    name="message-item-content"
                    @slotchange="${_handleSlotchange}">
                    ${messageElements.map(
                      (message) => html`
                        ${message.type === 'img'
                          ? html`
                              <clabs-chat-image content="${message.content}">
                              </clabs-chat-image>
                            `
                          : message.type === 'chart'
                          ? html`
                              <clabs-chat-chart
                                content="${message.content}"
                                container-height="320px">
                              </clabs-chat-chart>
                            `
                          : message.type === 'link-list'
                          ? html`
                              <clabs-chat-link-list
                                @on-link-list-item-selected="${childLinkClicked}"
                                .customLabels="${customLabels}"
                                content="${message.content}">
                              </clabs-chat-link-list>
                            `
                          : message.type === 'carousel'
                          ? html`
                              <clabs-chat-carousel content="${message.content}">
                              </clabs-chat-carousel>
                            `
                          : message.type === 'molecule'
                          ? html`
                              <clabs-chat-molecule
                                height="${369}"
                                content="${message.content}">
                              </clabs-chat-molecule>
                            `
                          : message.type === 'formula'
                          ? html`
                              <clabs-chat-formula content="${message.content}">
                              </clabs-chat-formula>
                            `
                          : message.type === 'file-upload'
                          ? html`
                              <clabs-chat-file-upload
                                content="${message.content}">
                              </clabs-chat-file-upload>
                            `
                          : message.type === 'table'
                          ? html`
                              <clabs-chat-table
                                max-height="246px"
                                content="${message.content}">
                              </clabs-chat-table>
                            `
                          : message.type === 'url' ||
                            message.type === 'video' ||
                            message.type === 'file' ||
                            message.type === 'audio'
                          ? html`
                              <clabs-chat-card
                                type="${message.type}"
                                content="${message.content}">
                              </clabs-chat-card>
                            `
                          : message.type === 'card'
                          ? html`
                              <clabs-chat-card content="${message.content}">
                              </clabs-chat-card>
                            `
                          : message.type === 'text'
                          ? html`
                              <clabs-chat-text
                                capitalize
                                content="${message.content}">
                              </clabs-chat-text>
                            `
                          : message.type === 'annotated-text'
                          ? html`
                              <clabs-chat-text
                                capitalize
                                enable-annotations
                                content="${message.content}">
                              </clabs-chat-text>
                            `
                          : message.type === 'highlight-text'
                          ? html`
                              <clabs-chat-text
                                enable-text-highlighting
                                content="${message.content}">
                              </clabs-chat-text>
                            `
                          : message.type === 'summarized-text'
                          ? html`
                              <clabs-chat-text
                                enable-summarization
                                content="${message.content}">
                              </clabs-chat-text>
                            `
                          : message.type === 'html-text'
                          ? html`
                              <clabs-chat-text
                                capitalize
                                enable-html-rendering
                                content="${message.content}">
                              </clabs-chat-text>
                            `
                          : message.type === 'diagram'
                          ? html` <clabs-chat-diagram
                              definition="${message.content}">
                            </clabs-chat-diagram>`
                          : message.type === 'list'
                          ? html`
                              <clabs-chat-list content="${message.content}">
                              </clabs-chat-list>
                            `
                          : message.type === 'loading'
                          ? html` <clabs-chat-loading> </clabs-chat-loading> `
                          : message.type === 'code'
                          ? html`
                              <clabs-chat-code
                                content="${message.content}"
                                .customLabels="${customLabels}"
                                max-height="246px">
                              </clabs-chat-code>
                            `
                          : message.type === 'editable-code'
                          ? html`
                              <clabs-chat-code
                                content="${message.content}"
                                .customLabels="${customLabels}"
                                editable
                                max-height="369px">
                              </clabs-chat-code>
                            `
                          : message.type === 'tags'
                          ? html`
                              <clabs-chat-tag-list
                                content="${message.content}"
                                @tag-selected="${onTagSelected}">
                              </clabs-chat-tag-list>
                            `
                          : message.type === 'error'
                          ? html`
                              <clabs-chat-error
                                content="${message.content}"
                                capitalize>
                              </clabs-chat-error>
                            `
                          : html`
                            <p class="${clabsPrefix}--chat-message-warning">
                              [Warning] No valid block-type specified, rendering as type 'text':
                            </p>
                            <clabs-chat-text
                              capitalize
                              content="${message.content}">
                            </clabs-chat-text>
                          </div>`}
                      `
                    )}
                  </slot>
                  ${currentlyStreaming
                    ? html`
                        ${temporaryMessage.type === 'table'
                          ? html`
                              <clabs-chat-table
                                max-height="246px"
                                content="${temporaryMessage.content}">
                              </clabs-chat-table>
                            `
                          : temporaryMessage.type === 'list'
                          ? html`
                              <clabs-chat-list
                                content="${temporaryMessage.content}">
                              </clabs-chat-list>
                            `
                          : temporaryMessage.type === 'code'
                          ? html`
                              <clabs-chat-code
                                streaming
                                .customLabels="${customLabels}"
                                content="${temporaryMessage.content}">
                              </clabs-chat-code>
                            `
                          : temporaryMessage.type === 'chart'
                          ? html`
                              <clabs-chat-chart
                                ?streaming="${true}"
                                content="${temporaryMessage.content}">
                              </clabs-chat-chart>
                            `
                          : temporaryMessage.type === 'carousel'
                          ? html`
                              <clabs-chat-carousel
                                content="${temporaryMessage.content}">
                              </clabs-chat-carousel>
                            `
                          : temporaryMessage.type === 'molecule'
                          ? html`
                              <clabs-chat-molecule
                                streaming
                                height="${369}"
                                content="${temporaryMessage.content}">
                              </clabs-chat-molecule>
                            `
                          : temporaryMessage.type === 'formula'
                          ? html`
                              <clabs-chat-formula
                                content="${temporaryMessage.content}">
                              </clabs-chat-formula>
                            `
                          : temporaryMessage.type === 'tags'
                          ? html`
                              <clabs-chat-tag-list
                                content="${temporaryMessage.content}"
                                @tag-selected="${onTagSelected}">
                              </clabs-chat-tag-list>
                            `
                          : html`
                              <clabs-chat-text
                                streaming
                                content="${temporaryMessage.content}">
                              </clabs-chat-text>
                            `}
                      `
                    : html``}
                </div>

                ${!loadingState && !disableButtons && !currentlyStreaming
                  ? html`
                      <div class="${clabsPrefix}--chat-message-dropdown-bot">
                        ${userSubmitted
                          ? editing === true
                            ? html` <cds-icon-button
                                  size="sm"
                                  kind="ghost"
                                  align="left"
                                  label="Undo Edit"
                                  @click="${cancelEdit}">
                                  ${iconLoader(Undo16, { slot: 'icon' })}
                                  <span slot="tooltip-content"
                                    >${renderLabel('message-undo-edit')}</span
                                  >
                                </cds-icon-button>
                                <cds-icon-button
                                  size="sm"
                                  kind="ghost"
                                  align="left"
                                  label="Send edit"
                                  @click="${validateEdit}">
                                  ${iconLoader(CheckMark16, { slot: 'icon' })}
                                  <span slot="tooltip-content"
                                    >${renderLabel(
                                      'message-validate-edit'
                                    )}</span
                                  >
                                </cds-icon-button>`
                            : html` <cds-icon-button
                                size="sm"
                                kind="ghost"
                                align="left"
                                label="Edit message"
                                @click="${handleEdit}">
                                ${iconLoader(Edit16, { slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >${renderLabel(
                                    'message-enable-editing'
                                  )}</span
                                >
                              </cds-icon-button>`
                          : html`
                              <cds-icon-button
                                size="sm"
                                kind="${disableFeedbackButtons
                                  ? 'danger-ghost'
                                  : 'ghost'}"
                                align="right"
                                role="button"
                                aria-expanded="${positiveFeedbackSelected}"
                                ?disabled="${disableFeedbackButtons}"
                                aria-controls="${showFeedBackForm
                                  ? clabsPrefix +
                                    '--chat-popup-unique-feedback-' +
                                    index
                                  : ''}"
                                @keydown="${handlePositiveKeyboardInput}"
                                @click="${handlePositiveFeedback}">
                                ${positiveFeedbackSelected
                                  ? iconLoader(ThumbsUpFilled16, {
                                      slot: 'icon',
                                    })
                                  : iconLoader(ThumbsUp16, { slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >${disableFeedbackButtons
                                    ? renderLabel('message-feedback-disabled')
                                    : renderLabel(
                                        positiveFeedbackSelected
                                          ? 'message-undo-like-button'
                                          : 'message-like-button'
                                      )}</span
                                >
                              </cds-icon-button>

                              <cds-icon-button
                                size="sm"
                                kind="${disableFeedbackButtons
                                  ? 'danger-ghost'
                                  : 'ghost'}"
                                align="right"
                                role="button"
                                ?disabled="${disableFeedbackButtons}"
                                aria-expanded="${negativeFeedbackSelected}"
                                aria-controls="${showFeedBackForm
                                  ? clabsPrefix +
                                    '--chat-popup-unique-feedback-' +
                                    index
                                  : ''}"
                                label="Thumbs down"
                                @keydown="${handleNegativeKeyboardInput}"
                                @click="${handleNegativeFeedback}">
                                ${negativeFeedbackSelected
                                  ? iconLoader(ThumbsDownFilled16, {
                                      slot: 'icon',
                                    })
                                  : iconLoader(ThumbsDown16, { slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >${disableFeedbackButtons
                                    ? renderLabel('message-feedback-disabled')
                                    : renderLabel(
                                        negativeFeedbackSelected
                                          ? 'message-undo-dislike-button'
                                          : 'message-dislike-button'
                                      )}</span
                                >
                              </cds-icon-button>
                              <cds-icon-button
                                size="sm"
                                kind="ghost"
                                align="right"
                                label="Regenerate"
                                @click="${handleRegenerate}">
                                ${iconLoader(Renew16, { slot: 'icon' })}
                                <span slot="tooltip-content"
                                  >${renderLabel(
                                    'message-regenerate-button'
                                  )}</span
                                >
                              </cds-icon-button>
                            `}
                      </div>
                    `
                  : html`<div
                      class="${clabsPrefix}--chat-message-dropdown-bot"></div>`}
              </div>`}
      </div>
      ${showFeedBackForm || enableComplexFeedback
        ? html`
            <clabs-chat-popup
              @on-feedback-popup-closed="${hideFeedBackForm}"
              ?is-open="${showFeedBackForm}"
              id="${clabsPrefix}--chat-popup-unique-feedback-${index}"
              .feedbackFormValues="${feedbackFormValues}"
              .targetElement="${popupTargetElement}"
              .customLabels="${customLabels}"
              parent-message-id="${index}"
              ?compact-mode="${compactIcon}"
              type="${positiveFeedbackSelected
                ? 'thumbs-up'
                : negativeFeedbackSelected
                ? 'thumbs-down'
                : 'custom'}">
            </clabs-chat-popup>
          `
        : html``}
    </div>`;
}
