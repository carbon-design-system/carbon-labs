/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';

/**
 * Generates a template for a toolbar component.
 *
 * @param {boolean} vertical - Determines the orientation of the toolbar. If true, the toolbar will be displayed vertically; otherwise, it will be displayed horizontally.
 * @returns {TemplateResult} The HTML template for the toolbar component.
 */
export const toolbarTemplate = (vertical: boolean) => html`
  <style>
    :host {
      display: flex;
      background: var(--cds-layer-01, #f4f4f4);
      flex-direction: ${vertical ? 'column' : 'row'};
    }
  </style>
  <slot></slot>
`;
