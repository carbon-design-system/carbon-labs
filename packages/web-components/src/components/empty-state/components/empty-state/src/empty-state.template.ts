/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;
import '@carbon/web-components/es/components/link/index.js';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function emptyStateTemplate(customElementClass) {
  const { title, subtitle, size } = customElementClass;
  const titleClasses = classMap({
    [`${clabsPrefix}--empty-state__header`]: true,
    [`${clabsPrefix}--empty-state__header--small`]: size === 'sm',
  });
  const subTitleClasses = classMap({
    [`${clabsPrefix}--empty-state___subtitle`]: true,
    [`${clabsPrefix}--empty-state__subtitle--small`]: size === 'sm',
  });

  return html`<div class="${clabsPrefix}--empty-state__content">
    <h3 class="${titleClasses}">${title}</h3>
    ${subtitle && html`<p class="${subTitleClasses}">${subtitle}</p>`}
    <slot name="action"></slot>
    <slot name="link"></slot>
  </div>`;
}
