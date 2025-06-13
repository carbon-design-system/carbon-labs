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
import { Group, Item } from '../../../defs/style-picker-module.types';

import '../../style-picker-option/style-picker-option.ts';

const { stablePrefix: clabsPrefix, prefix: carbonPrefix } = settings;

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

  /**
   *
   * @param {object} i - item
   */
  const itemsAreGrouped = (i: typeof items): i is Group<Item<T>>[] => {
    return !(i[0] as Item<T>).value;
  };

  /**
   *
   * @param {Item<T>[]} items -
   */
  const renderItems = (items: Item<T>[]) => {
    return items.map(
      (item) =>
        html`
          <clabs-style-picker-option
            .value=${item.value}
            .label=${item.label}
            .isSelected=${selectedItem === item.value}
            .size=${size}
            @clabs-style-picker-option-change=${(e: CustomEvent) =>
              handleOptionChange(e, item)}
            tabindex=${selectedItem === item.value ? '0' : '-1'}>
            ${renderItem?.(item)}
          </clabs-style-picker-option>
        `
    );
  };

  /**
   *
   * @param {Item<T>[]} items -
   */
  const renderUngrouped = (items: Item<T>[]) => {
    return html` <div
      class=${`${blockClass} ${blockClass}--${size}`}
      role="listbox"
      aria-label=${title}
      aria-orientation="horizontal">
      <ul class=${`${blockClass}__items`} role="group">
        ${renderItems(items)}
      </ul>
    </div>`;
  };

  /**
   *
   * @param {Group<T>[]} items -
   */
  const renderGrouped = (items: Group<Item<T>>[]) => {
    return html`
      <div
        class=${`${blockClass} ${blockClass}--${size}`}
        role="listbox"
        aria-label=${title}
        aria-orientation="horizontal"
        onKeyDown="{handleKeydown}"
        onBlur="{handleBlur}">
        ${items.map(
          (group) => html`
            <ul
              key=${group.label}
              class=${`cds--contained-list ${carbonPrefix}--contained-list--disclosed ${blockClass}__group`}
              role="group"
              aria-label=${group.label}>
              <li class=${`cds--contained-list__header`} role="presentation">
                ${group.label}
              </li>
              <ul role="group">
                ${renderItems(group.items)}
              </ul>
            </ul>
          `
        )}
      </div>
    `;
  };

  if (kind === 'single' && itemsAreGrouped(items)) {
    return html`${renderGrouped(items)}`;
  }

  return html`${renderUngrouped(items)}`;
};
