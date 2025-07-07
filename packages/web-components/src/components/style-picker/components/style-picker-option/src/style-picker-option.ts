/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
// @ts-ignore
import styles from './style-picker-option.scss?inline';
import { property } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import CLABSStylePickerOption from '../style-picker-option';
import { Size } from '../../../defs/style-picker-option.types';
import { consume } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Style picker option.
 *
 * @fires clabs-style-picker-option-change - fired when an option is selected/changed.
 */
class StylePickerOption extends LitElement {
  static styles = styles;

  /**
   * Consume style-picker-context
   */
  @consume({ context: stylePickerContext, subscribe: true })
  _stylePickerContext?: StylePickerContextType;

  @property({ type: String, reflect: true, attribute: 'label' })
  label = '';

  @property({ type: String, reflect: true, attribute: 'value' })
  value = '';

  @property({ type: Boolean, reflect: true, attribute: 'selected' })
  selected = false;

  // TODO: Remove if not needed
  // @property({ reflect: true, attribute: 'size' })
  // size: Size = 'sm';

  /**
   * @param {string} triggeredBy - the element that triggered the change.
   */
  protected handleClick(triggeredBy: EventTarget | null) {
    const init = {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        triggeredBy,
        value: this.value,
      },
    };

    const newEvent = new CustomEvent(
      (this.constructor as typeof CLABSStylePickerOption).eventOptionChange,
      init
    );

    this.dispatchEvent(newEvent);
  }

  /**
   * The name of the custom event fired after an option is changed.
   */
  static get eventOptionChange() {
    return `${clabsPrefix}-style-picker-option-change`;
  }
}

export default StylePickerOption;
