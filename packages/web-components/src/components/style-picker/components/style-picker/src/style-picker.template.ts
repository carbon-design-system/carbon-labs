/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, nothing } from 'lit';

import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/layer/index.js';
import '@carbon/web-components/es/components/search/index.js';
import '@carbon/web-components/es/components/heading/index.js';
import '@carbon/web-components/es/components/progress-bar/index.js';
import '@carbon-labs/wc-empty-state/es/index.js';
import { settings } from '@carbon-labs/utilities';
import spread from '@carbon/web-components/es/globals/directives/spread.js';

const { stablePrefix: clabsPrefix } = settings;

export const blockClass = `${clabsPrefix}--style-picker`;

/**
 * Lit template for style-picker component.
 *
 * @param {object} customElementClass Class functionality for the custom element
 */
export const stylePickerTemplate = (customElementClass) => {
  const {
    align,
    open,
    heading,
    isLoading,
    enableSearch,
    onChangeSearchInput,
    showEmptyState,
    searchLabel,
    searchInputPlaceholder,
    searchCloseButtonLabel,
    emptyStateTitle,
    emptyStateSubtitle,
  } = customElementClass;

  return html`<cds-popover ?open=${open} align=${align}>
    <slot name="trigger"></slot>
    <cds-popover-content>
      <div class=${`${blockClass}__content`}>
        <div class=${`${blockClass}__header`}>
          <div class=${`${blockClass}__heading`}>${heading}</div>
          ${enableSearch
            ? html`
                <div class=${`${blockClass}__search`}>
                  <cds-search
                    expandable
                    type="text"
                    label-text=${searchLabel}
                    @cds-search-input="${onChangeSearchInput}"
                    close-button-label-text=${searchCloseButtonLabel}
                    ...="${spread({
                      placeholder: searchInputPlaceholder,
                    })}"></cds-search>
                </div>
              `
            : nothing}
        </div>
        <cds-layer class=${`${blockClass}__sections`} level="1">
          ${isLoading
            ? html`<cds-progress-bar size="small"></cds-progress-bar>`
            : showEmptyState
            ? html`
                <div class=${`${blockClass}__empty-state`}>
                  <clabs-empty-state
                    kind="notFound"
                    title=${emptyStateTitle}
                    subtitle=${emptyStateSubtitle}></clabs-empty-state>
                </div>
              `
            : html`<slot></slot>`}
        </cds-layer>
      </div>
    </cds-popover-content>
  </cds-popover>`;
};
