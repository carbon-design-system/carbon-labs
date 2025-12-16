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
import '@carbon/web-components/es/components/loading/index.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function diagramElementTemplate(customElementClass) {
  const {
    theme,
    title,
    _uniqueID: uniqueID,
    _handleMouseOver: handleMouseOver,
    _handleMouseOut: handleMouseOut,
    renderedSVG,
  } = customElementClass;

  return html`
    <div
      @mouseout="${handleMouseOut}"
      @mouseover="${handleMouseOver}"
      class="${clabsPrefix}--chat-diagram-container">
      <div class="${clabsPrefix}--chat-diagram-title">${title}</div>

      <div
        @mouseout="${handleMouseOut}"
        @mouseover="${handleMouseOver}"
        id="${clabsPrefix}--chat-diagram-container-id-${uniqueID}"
        class="${clabsPrefix}--chat-diagram-${theme} ${clabsPrefix}--chat-diagram-mermaid">
        ${unsafeHTML(renderedSVG)}
      </div>
    </div>
  `;
}
