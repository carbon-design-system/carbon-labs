/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-ignore
import { property, query, state } from 'lit/decorators.js';
import styles from './style-picker-section.scss?inline';
import { LitElement, PropertyValues } from 'lit';
import { consume, provide } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
import { Size } from '../../../defs';

/**
 * style-picker-section extends LitElement.
 */
class StylePickerSection extends LitElement {
  static styles = styles;

  @query('cds-accordion-item') accordionItem;

  /**
   * Consume style-picker-context
   */
  @consume({ context: stylePickerContext, subscribe: true })
  _stylePickerContext?: StylePickerContextType;

  /**
   * Provide style-picker-context
   */
  @provide({ context: stylePickerContext })
  _sectionContext: StylePickerContextType = {
    /**
     * Set the size of the section. So preceding options and groups could use this size.
     * @param {Size} _size - The size to be set for the options.
     * @returns {void}
     */
    setSize: (_size?: Size) => {
      this._sectionContext = {
        ...this._sectionContext,
        size: _size,
      };
    },
  };

  @property({ type: String, reflect: true, attribute: 'heading' })
  heading = '';

  @property({ type: String, reflect: true, attribute: 'size' })
  size?: Size = 'sm';

  /**
   * Indicates whether the section has a group of items.
   * This is set to true if there are any `clabs-style-picker-group` elements inside the section.
   */
  @state()
  hasGroup = false;

  /**
   * Lifecycle method called when the component is first updated.
   */
  protected firstUpdated() {
    if (this.querySelectorAll(`clabs-style-picker-group`).length > 0) {
      this.hasGroup = true;
    }
  }

  /**
   * Lifecycle method called after the component is updated.
   * @param {object} changedProperties - Properties that have changed since the last update.
   */
  protected updated(changedProperties: PropertyValues): void {
    if (
      this._stylePickerContext?.kind === 'disclosed' &&
      !this.hasAttribute('open')
    ) {
      this.accordionItem.removeAttribute('open');
    }

    if (changedProperties.has('size')) {
      // Update the options size in the context
      this._sectionContext?.setSize?.(this.size);
    }
  }

  /**
   * Getter for the slot index from the custom attribute set in the parent module.
   */
  get slotIndex() {
    return Number(this.getAttribute('data-slot-index'));
  }
}

export default StylePickerSection;
