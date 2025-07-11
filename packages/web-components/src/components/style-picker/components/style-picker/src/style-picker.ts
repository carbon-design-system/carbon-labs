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
 * Component extending the @carbon/web-components' button
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
     * Set the active module index
     * @param {number} index - Index of the module to be set as active
     * @description This method updates the active module index in the context.
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
   * Invoked whenever the element is updated.
   *
   * @param {PropertyValues<this>} changed - A Map of property keys to values.
   */
  updated(changed: PropertyValues<this>) {
    if (changed.has('kind')) {
      this._stylePickerContext = {
        kind: this.kind,
        ...this._stylePickerContext,
      };
    }
  }
}

export default StylePicker;
