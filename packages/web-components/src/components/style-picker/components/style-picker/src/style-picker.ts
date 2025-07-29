/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, PropertyValues } from 'lit';
import { provide } from '@lit/context';
import { property, state } from 'lit/decorators.js';
// @ts-ignore
import styles from './style-picker.scss?inline';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
import { Kind, prefix } from '../../../defs';

/**
 * Component extending the LitElement class.
 */
class StylePicker extends LitElement {
  static styles = styles;

  /**
   * @internal
   *
   * According to search result decide whether need to show the empty state or not.
   */
  @state()
  showEmptyState = false;

  /**
   * @internal
   *
   * Provide style-picker-context
   */
  @provide({ context: stylePickerContext })
  _stylePickerContext: StylePickerContextType = {
    size: 'sm',
    /**
     * Set the active section index
     * @param {number} index - Index of the section to be set as active
     * @description This method updates the active section index in the context.
     */
    setActiveSection: (index: number) => {
      this._stylePickerContext = {
        ...this._stylePickerContext,
        activeSection: index,
      };
    },

    /**
     * Keep the search text in the context.
     * @param {string} _searchTerm Search text.
     */
    setSearchTerm: (_searchTerm: string) => {
      this._stylePickerContext = {
        ...this._stylePickerContext,
        searchTerm: _searchTerm,
      };
    },

    /**
     * Check the all items are hidden.
     */
    onSectionVisibilityChange: () => {
      this.showEmptyState = Array.from(
        this.querySelectorAll(`${prefix}-section`)
      )?.every((_section) => _section.hasAttribute('hidden'));
    },
  };

  /**
   * Specify direction of alignment
   */
  @property({ reflect: true, type: String, attribute: 'align' })
  align = '';

  /**
   * Define the picker variant
   */
  @property({ reflect: true, attribute: 'kind' })
  kind: Kind = 'single';

  /**
   * Specify whether the component is currently open or closed
   */
  @property({ type: Boolean, reflect: true, attribute: 'open' })
  open = false;

  /**
   * Define heading for the picker
   */
  @property({ type: String, reflect: true, attribute: 'heading' })
  heading = '';

  /**
   * Enable search in the style picker
   */
  @property({ type: Boolean, reflect: true, attribute: 'enable-search' })
  enableSearch = false;

  /**
   * Search close close button label
   */
  @property({
    type: String,
    reflect: true,
    attribute: 'search-close-button-label',
  })
  searchCloseButtonLabel = 'Clear search input';

  /**
   * Search close close button label
   */
  @property({
    type: String,
    reflect: true,
    attribute: 'search-input-placeholder',
  })
  searchInputPlaceholder;

  /**
   * Title for empty state displayed when no items found in search.
   */
  @property({
    type: String,
    reflect: true,
    attribute: 'empty-state-title',
  })
  emptyStateTitle = 'No results found';

  /**
   * Subtitle for empty state displayed when no items found in search.
   */
  @property({
    type: String,
    reflect: true,
    attribute: 'empty-state-subtitle',
  })
  emptyStateSubtitle = 'Try a different search';

  /**
   * Update search term in the context
   * @param {object} e - Event raised when search input is changed
   */
  onChangeSearchInput(e) {
    this._stylePickerContext?.setSearchTerm?.(e.detail?.value);
  }

  /**
   * Invoked whenever the element is updated.
   *
   * @param {PropertyValues<this>} changed - A Map of property keys to values.
   */
  updated(changed: PropertyValues<this>) {
    const _newContextValues: Partial<StylePickerContextType> = {};

    if (changed.has('kind')) {
      _newContextValues.kind = this.kind;
    }

    if (changed.has('enableSearch')) {
      _newContextValues.enableSearch = this.enableSearch;
    }

    if (Object.keys(_newContextValues).length) {
      this._stylePickerContext = {
        ...this._stylePickerContext,
        ..._newContextValues,
      };
    }
  }
}

export default StylePicker;
