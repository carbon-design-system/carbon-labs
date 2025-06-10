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

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerTemplate = (customElementClass) => {
  const { align, kind, open, title } = customElementClass;

  return html`<cds-popover
    ?open=${open}
    align=${align}
    kind=${kind}
    title=${title}>
    <slot name="trigger"></slot>
    <cds-popover-content>
      <slot name="modules"></slot>
    </cds-popover-content>
  </cds-popover>`;
};
