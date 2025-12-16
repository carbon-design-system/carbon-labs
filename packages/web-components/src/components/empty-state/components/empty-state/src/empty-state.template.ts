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
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;
import '@carbon/web-components/es/components/link/index.js';
import errorIllustration from './assets/error-illustration';
import noDataIllustration from './assets/no-data-illustration';
import noTagsIllustration from './assets/no-tags-illustration';
import noFoundIllustration from './assets/not-found-illustration';
import notificationsIllustration from './assets/notifications-illustration';
import unauthorizedIllustration from './assets/unauthorized-illustration';

/**
 * Lit template for card
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function emptyStateTemplate(customElementClass) {
  const { title, subtitle, size, kind, illustrationTheme, hasIllustration } =
    customElementClass;
  const titleClasses = classMap({
    [`${clabsPrefix}--empty-state__header`]: true,
    [`${clabsPrefix}--empty-state__header--small`]: size === 'sm',
  });
  const subTitleClasses = classMap({
    [`${clabsPrefix}--empty-state___subtitle`]: true,
    [`${clabsPrefix}--empty-state__subtitle--small`]: size === 'sm',
  });
  let emptyStateSVg;
  if (!hasIllustration) {
    switch (kind) {
      case 'error':
        emptyStateSVg = errorIllustration(illustrationTheme, size);
        break;
      case 'noData':
        emptyStateSVg = noDataIllustration(illustrationTheme, size);
        break;
      case 'noTags':
        emptyStateSVg = noTagsIllustration(illustrationTheme, size);
        break;
      case 'notFound':
        emptyStateSVg = noFoundIllustration(illustrationTheme, size);
        break;
      case 'notifications':
        emptyStateSVg = notificationsIllustration(illustrationTheme, size);
        break;
      case 'unauthorized':
        emptyStateSVg = unauthorizedIllustration(illustrationTheme, size);
        break;
    }
  }
  return html`
    <slot name="illustration"></slot>
    ${!hasIllustration ? emptyStateSVg : ''}
    <div class="${clabsPrefix}--empty-state__content">
      <h3 class="${titleClasses}">${title}</h3>
      ${subtitle && html`<p class="${subTitleClasses}">${subtitle}</p>`}
      <slot name="action"></slot>
      <slot name="link"></slot>
    </div>
  `;
}
