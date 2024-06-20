/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import ChevronDown16 from '@carbon/web-components/es/icons/chevron--down/16.js';
import ChevronUp16 from '@carbon/web-components/es/icons/chevron--up/16.js';
import '@carbon/web-components/es/components/tag/index.js';
import '../../cardElement/cardElement.js';
import '../../carouselElement/carouselElement.js';

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
    _annotationURLs: annotationURLs,
    _annotationIndex: annotationIndex,
    _handleAnnotationClick,
    enableTextHighlighting,
  } = customElementClass;

  return html`<div class="${clabsPrefix}--chat-text">
    <div
      class="${clabsPrefix}--chat-text--float-${alignRight ? 'right' : 'left'}">
      <div class="${clabsPrefix}--chat-text-content">
        ${textElements.map(
          (textPiece, index) =>
            html` ${textPiece.type === 'annotation' || textPiece.type === 'link'
              ? html`
                  <span
                    class="${clabsPrefix}--chat-text-content-${textPiece.type} ${enableTextHighlighting
                      ? clabsPrefix + '--chat-text-highlighted'
                      : ''}"
                    data-index="${index}"
                    data-source="${textPiece.content}"
                    @click="${_handleAnnotationClick}">
                    ${textPiece.text}
                  </span>
                  ${!enableTextHighlighting
                    ? html`
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
                            ? html` ${ChevronDown16({ slot: 'icon' })} `
                            : html` ${ChevronUp16({ slot: 'icon' })} `}
                        </span>
                      `
                    : html``}
                  ${index === annotationIndex
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
              : enableHtmlRendering || textPiece.type === 'html'
              ? html` <span
                  class="${clabsPrefix}--chat-text-content-${textPiece.type}"
                  >${unsafeHTML(textPiece.text)}</span
                >`
              : html` ${textPiece.text}`}`
        )}
      </div>
    </div>
  </div>`;
}
