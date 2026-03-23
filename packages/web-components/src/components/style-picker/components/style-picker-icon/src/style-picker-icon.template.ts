/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, TemplateResult } from 'lit';
import { settings } from '@carbon-labs/utilities';

const { stablePrefix: clabsPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker-icon`;

/**
 * Template for the style-picker-icon component.
 *
 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerIconTemplate = (): TemplateResult<1> => {
  return html`<div part=${`${blockClass}__item`}>
    <slot></slot>
  </div> `;
};
