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
import CLABSStylePicker from '../style-picker';

/**
 * Component extending the LitElement class.
 */
class StylePicker extends LitElement {
  static styles = styles;

  /**
   * Dispatch an event when closing the style-picker.
   */
  _dispatchCloseEvent() {
    const init = {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        triggeredBy: this,
      },
    };

    const newEvent = new CustomEvent(
      (this.constructor as typeof CLABSStylePicker).eventOptionChange,
      init
    );

    this.dispatchEvent(newEvent);
  }

  /**
   * Close the popover if the click is outside of the style picker.
   * @param {Event} event Event.
   */
  private _handleOutsideClick(event: Event) {
    const target = event.target as Node | null;

    if (this.open && target && !this.contains(target)) {
      this.open = false;
    }
  }

  /**
   *
   */
  constructor() {
    super();

    this._handleOutsideClick = this._handleOutsideClick.bind(this);
  }

  /**
   * Connected callback lifecycle method.
   */
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._handleOutsideClick);
  }

  /**
   * Disconnected callback lifecycle method.
   */
  disconnectedCallback() {
    document.removeEventListener('click', this._handleOutsideClick);
  }

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
    /**
     * Default size of options.
     */
    size: 'sm',
    /**
     * Default active section index.
     */
    activeSection: 0,
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
     *
     * @param {number} _count New count value
     */
    setSectionCount: (_count?: number) => {
      this._stylePickerContext = {
        ...this._stylePickerContext,
        sectionCount: _count,
      };
    },

    /**
     * Check the all items are hidden.
     */
    onSectionVisibilityChange: () => {
      const _sectionElements = this.querySelectorAll(`${prefix}-section`);

      this.showEmptyState = Array.from(_sectionElements)?.every((_section) =>
        _section.hasAttribute('hidden')
      );

      const _sectionCount = Array.from(_sectionElements)?.filter(
        (_section) => !_section.hasAttribute('hidden')
      )?.length;

      this._stylePickerContext?.setSectionCount?.(_sectionCount);
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
   * Show a loading state
   */
  @property({ type: Boolean, reflect: true, attribute: 'loading' })
  isLoading = false;

  /**
   * Search close close button label
   */
  @property({
    type: String,
    reflect: true,
    attribute: 'search-close-button-label',
  })
  searchCloseButtonLabel;

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
  emptyStateTitle;

  /**
   * Subtitle for empty state displayed when no items found in search.
   */
  @property({
    type: String,
    reflect: true,
    attribute: 'empty-state-subtitle',
  })
  emptyStateSubtitle;

  /**
   * Label text for search input.
   */
  @property({
    type: String,
    reflect: true,
    attribute: 'search-label',
  })
  searchLabel;

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

    if (changed.has('open') && !this.open) {
      this._dispatchCloseEvent();
    }
  }

  /**
   * The name of the custom event fired after close.
   */
  static get eventOptionChange() {
    return `${prefix}-close`;
  }
}

export default StylePicker;
