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
import { property } from 'lit/decorators.js';
// @ts-ignore
import styles from './style-picker.scss?inline';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
import { Kind } from '../../../defs';

/**
 * Component extending the LitElement class.
 */
class StylePicker extends LitElement {
  static styles = styles;

  /**
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
   * Update search term in the context
   * @param {object} e - Event raised when search input is changed
   */
  searchInput(e) {
    const _searchTerm = e.detail?.value;

    this._stylePickerContext = {
      ...this._stylePickerContext,
      searchTerm: _searchTerm,
    };
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
