/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';

import '@carbon/web-components/es/components/popover/popover';
import '@carbon/web-components/es/components/popover/popover-content';
import '@carbon/web-components/es/components/layer/index.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';

const { stablePrefix: clabsPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker`;

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerTemplate = (customElementClass) => {
  const { align, open, title } = customElementClass;

  return html`<cds-popover ?open=${open} align=${align} title=${title}>
    <slot name="trigger"></slot>
    <cds-popover-content>
      <div class=${`${blockClass}__content`}>
        <div class=${`${blockClass}__header`}>
          <strong class=${`${blockClass}__heading`}>${title}</strong>
        </div>
        <cds-layer class=${`${blockClass}__modules`} level="1">
          <slot name="modules"></slot>
        </cds-layer>
      </div>
    </cds-popover-content>
  </cds-popover>`;
};
