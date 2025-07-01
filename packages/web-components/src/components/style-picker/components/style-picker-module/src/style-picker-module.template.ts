/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, nothing, TemplateResult } from 'lit';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import '@carbon/web-components/es/components/accordion/accordion-item.js';
import { Group, Item } from '../../../defs/style-picker-module.types';

import '../../style-picker-option/style-picker-option.js';

const { stablePrefix: clabsPrefix, prefix: carbonPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker-module`;

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult} The template result
 */
export const stylePickerModuleTemplate = <T>(
  customElementClass
): TemplateResult<1> => {
  const {
    items,
    title,
    size,
    renderItem,
    selectedItem,
    handleOptionChange,
    slotIndex,
    _stylePickerContext,
  } = customElementClass;

  const { kind, setActiveModule } = _stylePickerContext;

  /**
   * Checks items are grouped or not
   *
   * @param {object} i - Group item
   * * @returns {boolean} Items grouped or not
   */
  const itemsAreGrouped = (i: typeof items): i is Group<Item<T>>[] => {
    return !(i[0] as Item<T>).value;
  };

  const flattenedItems = !itemsAreGrouped(items)
    ? items
    : // @ts-ignore
      items?.flatMap((group) => group.items);

  /**
   * Render options from items
   *
   * @param {Item<T>[]} items - Items array
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
              handleOptionChange(e, item)}>
            ${renderItem?.(item)}
          </clabs-style-picker-option>
        `
    );
  };

  /**
   * Render ungrouped items
   *
   * @param {Item<T>[]} items - Group items
   */
  const renderUngrouped = (items: Item<T>[]) => {
    return html` <div
      class=${`${blockClass} ${blockClass}--${size}`}
      role="listbox"
      aria-label=${title}
      aria-orientation="horizontal"
      tabindex="0">
      <ul class=${`${blockClass}__items`} role="group">
        ${renderItems(items)}
      </ul>
    </div>`;
  };

  /**
   * Render grouped items
   *
   * @param {Group<T>[]} items - Grouped items array
   */
  const renderGrouped = (items: Group<Item<T>>[]) => {
    return html`
      <div
        class=${`${blockClass} ${blockClass}--${size}`}
        role="listbox"
        aria-label=${title}
        aria-orientation="horizontal"
        tabindex="0">
        ${items.map(
          (group) => html`
            <div
              key=${group.label}
              class=${`cds--contained-list ${carbonPrefix}--contained-list--disclosed ${blockClass}__group`}>
              <div class=${`cds--contained-list__header`} role="presentation">
                ${group.label}
              </div>
              <ul role="group">
                ${renderItems(group.items)}
              </ul>
            </div>
          `
        )}
      </div>
    `;
  };

  /**
   * An internal function to render `flat` variant.
   * Only to organize the code.
   */
  const renderFlatVariant = () => {
    return html`
      <div class=${`${blockClass}--flat`}>
        <div class=${`${blockClass}__header`}>
          <strong class=${`${blockClass}__heading`}> ${title} </strong>
        </div>
        ${renderUngrouped(flattenedItems)}
      </div>
    `;
  };

  /**
   *
   */
  const renderDefault = () => {
    if (itemsAreGrouped(items)) {
      return html`${renderGrouped(items)}`;
    }
    return html`${renderUngrouped(items)}`;
  };

  switch (kind) {
    case 'single':
      return renderDefault();

    case 'flat':
      return renderFlatVariant();

    case 'disclosed':
      return html`<cds-accordion-item
        title=${title}
        class=${`${blockClass}--disclosed`}
        @cds-accordion-item-toggled=${() => {
          setActiveModule?.(slotIndex);
        }}>
        ${renderDefault()}
      </cds-accordion-item>`;

    default:
      return nothing as unknown as TemplateResult<1>;
  }
};
