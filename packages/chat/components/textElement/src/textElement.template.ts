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
    _annotationURL: annotationURL,
    _annotationIndex: annotationIndex,
    _handleAnnotationClick,
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
                    class="${clabsPrefix}--chat-text-content-${textPiece.type}">
                    ${textPiece.text}
                  </span>
                  <span
                    class="${clabsPrefix}--chat-text-content-chevron"
                    data-index="${index}"
                    data-source="${textPiece.content}"
                    @click="${_handleAnnotationClick}">
                    ${!textPiece.active
                      ? html` ${ChevronDown16({ slot: 'icon' })} `
                      : html` ${ChevronUp16({ slot: 'icon' })} `}
                  </span>
                  ${index === annotationIndex
                    ? html`
                        <div
                          class="${clabsPrefix}--chat-text-content-annotation-element">
                          <clabs-chat-card
                            type="url"
                            content="${annotationURL}"></clabs-chat-card>
                        </div>
                      `
                    : html``}
                `
              : enableHtmlRendering
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
