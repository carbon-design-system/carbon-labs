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

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function imageElementTemplate(customElementClass) {
  const { content } = customElementClass;

  return html`<div class="${clabsPrefix}--chat-image-container">
    <img class="${clabsPrefix}--chat-image-img" src="${content}" />
  </div>`;
}
