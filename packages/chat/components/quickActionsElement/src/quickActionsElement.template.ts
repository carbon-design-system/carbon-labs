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
import '@carbon/web-components/es/components/tile/index.js';
import Send16 from '@carbon/web-components/es/icons/send/16.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Lit template for code
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function quickActionsElementTemplate(customElementClass) {
  const {
    options,
    action,
  }: { options: string[]; action: (option: string) => void } =
    customElementClass;

  return html` <div class="${clabsPrefix}--chat-quick-actions">
    <div class="${clabsPrefix}--chat-quick-actions-container">
      ${options.map(
        (option) => html`
          <cds-clickable-tile
            class="tile"
            aria-label="Quick action"
            @click="${() => action(option)}">
            <div class="tile--content">${option}</div>

            ${Send16({ class: 'tile--icon', slot: 'icon' })}
          </cds-clickable-tile>
        `
      )}
    </div>
  </div>`;
}
