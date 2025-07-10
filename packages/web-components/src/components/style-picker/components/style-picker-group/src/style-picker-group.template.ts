/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, TemplateResult } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import '@carbon/web-components/es/components/accordion/accordion-item.js';

import '../../style-picker-option/style-picker-option.js';

const { stablePrefix: clabsPrefix, prefix: carbonPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker-group`;

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult} The template result
 */
export const stylePickerGroupTemplate = (
  customElementClass
): TemplateResult<1> => {
  const {
    // items,
    heading,
    size,
    isGrouped,
    // renderItem,
    // selectedItem,
    // handleOptionChange,
    // slotIndex,
    _stylePickerContext,
  } = customElementClass;

  const { kind } = _stylePickerContext;

  /**
   * Render ungrouped items.
   */
  const renderUngrouped = () => {
    return html`
      <div
        class=${`${blockClass} ${blockClass}--${size}`}
        role="listbox"
        aria-label=${heading}
        aria-orientation="horizontal"
        tabindex="0">
          <ul class=${`${blockClass}__items`} role="group">
            <slot></slot>
          </ul>
        </div>
      </div>
    `;
  };

  /**
   * Render grouped items.
   */
  const renderGrouped = () => {
    return html`<div
      class=${`${blockClass} ${blockClass}--${size}`}
      role="listbox"
      aria-label=${heading}
      aria-orientation="horizontal"
      tabindex="0">
      <div
        class=${`cds--contained-list ${carbonPrefix}--contained-list--disclosed ${blockClass}__group`}>
        <div class=${`cds--contained-list__header`} role="presentation">
          <slot name="group"></slot>
        </div>
        <ul class=${`${blockClass}__items`} role="group">
          <slot></slot>
        </ul>
      </div>
    </div>`;
  };

  /**
   * Render flat variant.
   */
  const renderFlat = () => {
    return html`
      <div class=${`${blockClass}--flat`}>
        <div class=${`${blockClass}__header`}>
          <strong class=${`${blockClass}__heading`}> ${heading} </strong>
        </div>
        ${renderUngrouped()}
      </div>
    `;
  };

  /**
   * Render grouped or ungrouped items based on the `isGrouped` property.
   */
  const renderDefault = () => {
    if (isGrouped) {
      return renderGrouped();
    }
    return renderUngrouped();
  };

  if (kind === 'flat') {
    return renderFlat();
  }

  if (kind === 'disclosed') {
    return html` ${renderDefault()} `;
  }

  return renderDefault();
};
