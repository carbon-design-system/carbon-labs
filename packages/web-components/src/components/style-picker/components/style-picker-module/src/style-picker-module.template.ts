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
import { classMap } from 'lit/directives/class-map.js';
import { Group, Item } from '../../../defs/style-picker-module.types';
import { Size } from '../../../defs/style-picker-option.types';
// import { Kind } from '../../../defs/style-picker.types';
// import { StylePickerContextType } from '../../../context/style-picker-context';

import '../../style-picker-option/style-picker-option.ts';

const { stablePrefix: clabsPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker-module`;

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerModuleTemplate = <T>(
  customElementClass
): TemplateResult<1> => {
  const kind = customElementClass.stylePickerContext?.kind ?? 'single';
  const { items, title, size, renderItem, selectedItem, handleOptionChange } =
    customElementClass;

  console.log('>> ', size);

  /**
   *
   * @param {object} i - item
   */
  const itemsAreGrouped = (i: typeof items): i is Group<Item<T>>[] => {
    return !(i[0] as Item<T>).value;
  };

  const sizeClass = classMap({
    [`${clabsPrefix}--style-picker-module--small`]: size == 'sm',
    [`${clabsPrefix}--style-picker-module--large`]: size == 'lg',
  });

  /**
   *
   * @param {Item<T>[]} i -
   */
  const renderItems = (i: Item<T>[]) => {
    return i.map(
      (item, index) =>
        html`
          <clabs-style-picker-option
            value=${item.value}
            label=${item.label}
            ?isSelected=${selectedItem === item.value}
            size=${size}
            @clabs-style-picker-option-change=${handleOptionChange}>
            ${renderItem?.(item)}
          </clabs-style-picker-option>
        `
    );
  };

  /**
   *
   * @param {Item<T>[]} i -
   */
  const renderUngrouped = (i: Item<T>[]) => {
    return html` <div
      class=${`${blockClass} ${blockClass}--${size}`}
      role="listbox"
      aria-label="{heading}"
      aria-orientation="horizontal"
      onKeyDown="{handleKeydown}"
      onBlur="{handleBlur}">
      <ul class=${`${blockClass}__items`} role="group">
        ${renderItems(i)}
      </ul>
    </div>`;
  };

  return html`<div>${renderUngrouped(items[0]?.items)}</div>`;
};
