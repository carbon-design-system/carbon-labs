/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import ChevronDown16 from '@carbon/icons/es/chevron--down/16.js';
import ChevronUp16 from '@carbon/icons/es/chevron--up/16.js';
import '@carbon/web-components/es/components/tag/index.js';
import '../../cardElement/cardElement.js';
import '../../carouselElement/carouselElement.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function textElementTemplate(customElementClass) {
  const {
    _textElements: textElements,
    alignRight,
    enableHtmlRendering,
    enableSummarization,
    _updateHighlightTarget: updateHighlightTarget,
    _annotationURLs: annotationURLs,
    _annotationIndex: annotationIndex,
    _annotationList: annotationList,
    _handleAnnotationClick,
    enableTextHighlighting,
    selectedAnnotationIndex,
    disableChevrons,
    _toggleSummarization,
    streaming,
    _showSummarization: showSummarization,
  } = customElementClass;

  return html`<div
    class="${clabsPrefix}--chat-text"
    role="textbox"
    aria-readonly="true"
    tabindex="0"
    aria-label="text block">
    <div
      class="${clabsPrefix}--chat-text--float-${alignRight ? 'right' : 'left'}">
      <div class="${clabsPrefix}--chat-text-content">
        ${textElements.map(
          (textPiece, index) =>
            html` ${textPiece.type === 'annotation' || textPiece.type === 'link'
              ? html`
                  <span
                    class="${clabsPrefix}--chat-text-content-${textPiece.type} ${streaming
                      ? clabsPrefix + '--chat-text-fade-in'
                      : ''} ${enableTextHighlighting
                      ? clabsPrefix +
                        '--chat-text-highlighted' +
                        (textPiece.active ? '-active' : '')
                      : ''} "
                    data-index="${index}"
                    data-source="${textPiece.content}"
                    @click="${_handleAnnotationClick}">
                    ${textPiece.text}
                  </span>
                  ${!disableChevrons
                    ? html`
                        <span
                          class="${clabsPrefix}--chat-text-content-chevron-container"
                          role="button"
                          aria-label="Show link as card below">
                          <span
                            class="${clabsPrefix}--chat-text-content-chevron ${index ===
                            annotationIndex
                              ? clabsPrefix +
                                '--chat-text-content-chevron--focused'
                              : ''}"
                            data-index="${index}"
                            data-source="${textPiece.content}"
                            @click="${_handleAnnotationClick}">
                            ${!textPiece.active
                              ? html`
                                  ${iconLoader(ChevronDown16, { slot: 'icon' })}
                                `
                              : html`
                                  ${iconLoader(ChevronUp16, { slot: 'icon' })}
                                `}
                          </span>
                        </span>
                      `
                    : html``}
                  ${index === annotationIndex && !enableSummarization
                    ? html`
                        <slot name="custom-highlight-component">
                          <div
                            class="${clabsPrefix}--chat-text-content-annotation-element">
                            ${annotationURLs.length > 1
                              ? html`
                                  <clabs-chat-carousel
                                    content=${JSON.stringify(annotationURLs)}>
                                  </clabs-chat-carousel>
                                `
                              : html`
                                  <clabs-chat-card
                                    type="url"
                                    content="${annotationURLs[0]}">
                                  </clabs-chat-card>
                                `}
                          </div>
                        </slot>
                      `
                    : html``}
                `
              : alignRight
              ? html` <span
                  class="${streaming
                    ? clabsPrefix + '--chat-text-fade-in'
                    : ''}">
                  ${textPiece.text}</span
                >`
              : enableHtmlRendering || textPiece.type === 'html'
              ? html` <span
                  class="${clabsPrefix}--chat-text-content-${textPiece.type}"
                  >${unsafeHTML(textPiece.text)}</span
                >`
              : textPiece.type === 'new-line'
              ? html`<br />`
              : textPiece.type === 'code'
              ? html`
                  <span
                    class="${clabsPrefix}--chat-text-content-${textPiece.type}"
                    >${textPiece.text}</span
                  >
                `
              : textPiece.type === 'default'
              ? html` <span
                  class="${streaming
                    ? clabsPrefix + '--chat-text-fade-in'
                    : ''}"
                  >${textPiece.text}</span
                >`
              : html`<p class="${clabsPrefix}--chat-text-content-paragraph">
                  ${textPiece.text}
                </p>`}`
        )}
        ${enableSummarization
          ? html`
              <span class="${clabsPrefix}--chat-text-content-chevron-container">
                <span
                  class="${clabsPrefix}--chat-text-content-chevron ${showSummarization
                    ? clabsPrefix + '--chat-text-content-chevron--focused'
                    : ''}"
                  @click="${_toggleSummarization}"
                  role="button"
                  aria-label="show all links as a carousel below">
                  ${!showSummarization
                    ? html` ${iconLoader(ChevronDown16, { slot: 'icon' })} `
                    : html` ${iconLoader(ChevronUp16, { slot: 'icon' })} `}
                </span>
              </span>
              <div
                class="${clabsPrefix}--chat-text-content-summarization-element ${!showSummarization
                  ? clabsPrefix +
                    '--chat-text-content-summarization-element-hidden'
                  : ''}">
                <slot name="custom-highlight-component">
                  <clabs-chat-carousel
                    selected-slide="${selectedAnnotationIndex}"
                    max-slides="${1}"
                    @on-carousel-index-change=${updateHighlightTarget}
                    content=${JSON.stringify(annotationList)}>
                  </clabs-chat-carousel>
                </slot>
              </div>
            `
          : html``}
      </div>
    </div>
  </div>`;
}
