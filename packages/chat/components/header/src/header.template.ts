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
const { stablePrefix: c4aiPrefix } = settings;
import Popup16 from '@carbon/web-components/es/icons/popup/16.js';
import '@carbon/web-components/es/components/slug/index.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function headerTemplate(customElementClass) {
  const { title } = customElementClass;
  return html` <div class="${c4aiPrefix}--chat-header-icons">
    <div>
      <cds-slug kind="default" size="md">
        <div slot="body-text">
          <p class="secondary">${title}</p>
        </div>
      </cds-slug>
    </div>
    <div class="${c4aiPrefix}--chat-header-icon">${Popup16()}</div>
  </div>`;
}
