/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { consume, provide } from '@lit/context';
import { CSSResultGroup, LitElement, TemplateResult } from 'lit';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
// @ts-ignore
import styles from './style-picker-group.scss?inline';
import { property } from 'lit/decorators.js';
import { Group, Item, Size } from '../../../defs';

/**
 * Group element.
 *
 * @fires clabs-style-picker-group-option-change - fired when an option is selected/changed.
 */
class StylePickerGroup<T> extends LitElement {
  static styles: CSSResultGroup = [styles];

  // @query('cds-accordion-item') accordionItem;

  /**
   * Consume style-picker-context
   */
  @consume({ context: stylePickerContext, subscribe: true })
  _stylePickerContext?: StylePickerContextType;

  /**
   * Provide style-picker-context
   */
  @provide({ context: stylePickerContext })
  _groupContext: StylePickerContextType = {
    /**
     * Set the size of the group.
     * @description This method updates the group & option size in the context.
     * @param {Size} _size - The size to be set for the group and options.
     * @returns {void}
     */
    setSize: (_size?: Size) => {
      this._groupContext = {
        ...this._groupContext,
        size: _size,
      };
    },
  };

  @property({ type: Array })
  items: Item<T>[] | Group<Item<T>>[] = [];

  @property({ type: String, reflect: true, attribute: 'selected-item' })
  selectedItem = '';

  @property({ type: String, reflect: true, attribute: 'heading' })
  heading = '';

  @property({ type: String, reflect: true, attribute: 'size' })
  size?: Size = 'sm';

  @property({ attribute: false })
  renderItem?: (item: Item<T>) => TemplateResult;

  /**
   * Lifecycle method called after the component is updated.
   * @param {object} changedProperties - Properties that have changed since the last update.
   */
  protected updated(changedProperties) {
    if (changedProperties.has('size')) {
      // Update the group and options size in the context
      this._groupContext?.setSize?.(this.size);
    }
  }
}

export default StylePickerGroup;
