/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, nothing, TemplateResult } from 'lit';
import { settings } from '@carbon-labs/utilities';
import '@carbon/web-components/es/components/accordion/accordion-item.js';
import '@carbon/web-components/es/components/tag/index.js';

const { stablePrefix: clabsPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker-section`;

/**
 * Lit template for section item.
 *
 * @param {object} customElementClass Class functionality for the custom element

 * @returns {TemplateResult<1>} Lit html template
 */
export const stylePickerSectionTemplate = (
  customElementClass
): TemplateResult<1> => {
  const {
    heading,
    slotIndex,
    size,
    _stylePickerContext,
    hasGroup,
    itemsCount,
  } = customElementClass;
  const { kind, setActiveSection, enableSearch, searchTerm } =
    _stylePickerContext;

  /**
   * Renders the default slot content.
   * If the section has a group, it renders the slot directly.
   * Otherwise, it wraps the slot in a listbox and show the items.
   * So we can avoid the style-picker-sections wrapper, if not needed.
   */
  const renderDefault = () => {
    if (hasGroup) {
      return html`<slot></slot>`;
    } else {
      return html`
        <div
          class=${`${blockClass} ${blockClass}--${size}`}
          >
            <ul class=${`${blockClass}__items`} role="group">
              <slot></slot>
            </ul>
          </div>
        </div>
      `;
    }
  };

  /**
   * Render tag to item show count after a search.
   */
  const renderTag = () => {
    if (enableSearch && searchTerm?.trim().length) {
      return html` <cds-tag size="sm">${itemsCount}</cds-tag> `;
    }

    return nothing;
  };

  // If the section is disclosed, we use cds-accordion-item to wrap the content.
  if (kind === 'disclosed') {
    return html`<cds-accordion-item
      class=${`${blockClass}--disclosed`}
      @cds-accordion-item-toggled=${() => {
        setActiveSection?.(slotIndex);
      }}
      role="group"
      ?open=${_stylePickerContext?.activeSection === slotIndex}>
      <div slot="title" class=${`${blockClass}__header`}>
        <strong class=${`${blockClass}__heading`}> ${heading} </strong>
        ${renderTag()}
      </div>
      ${renderDefault()}
    </cds-accordion-item>`;
  } else if (kind === 'flat') {
    // If the section is flat, we render it as a simple div with a header.
    return html`
      <div class=${`${blockClass}--flat`}>
        <div class=${`${blockClass}__header`}>
          <strong class=${`${blockClass}__heading`}> ${heading} </strong>
          ${renderTag()}
        </div>
        ${renderDefault()}
      </div>
    `;
  } else {
    return renderDefault();
  }
};
