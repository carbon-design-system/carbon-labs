/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import CheckmarkFilled16 from '@carbon/web-components/es/icons/checkmark--filled/16.js';

/**
 * Lit template for style-picker-option component
 *
 * @param {object} customElementClass Class functionality for the custom element
 *
 */
export const stylePickerOptionTemplate = (customElementClass) => {
  const { blockClass, _stylePickerContext } = customElementClass;
  const { size } = _stylePickerContext;

  return html`
    <div class=${`${blockClass}__container ${blockClass}__container--${size}`}>
      <slot></slot>
      <div class=${`${blockClass}__selection-indicator`} aria-hidden=${false}>
        ${CheckmarkFilled16()}
      </div>
    </div>
  `;
};
