/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';

import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/layer/index.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';

const { stablePrefix: clabsPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker`;

/**
 * Lit template for style-picker component.
 *
 * @param {object} customElementClass Class functionality for the custom element
 */
export const stylePickerTemplate = (customElementClass) => {
  const { align, open, heading } = customElementClass;

  return html`<cds-popover ?open=${open} align=${align}>
    <slot name="trigger"></slot>
    <cds-popover-content>
      <div class=${`${blockClass}__content`}>
        <div class=${`${blockClass}__header`}>
          <strong class=${`${blockClass}__heading`}>${heading}</strong>
        </div>
        <cds-layer class=${`${blockClass}__sections`} level="1">
          <slot></slot>
        </cds-layer>
      </div>
    </cds-popover-content>
  </cds-popover>`;
};
