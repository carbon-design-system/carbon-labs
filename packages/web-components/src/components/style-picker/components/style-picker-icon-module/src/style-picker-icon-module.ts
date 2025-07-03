/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-ignore
import styles from './style-picker-icon-module.scss?inline';
import StylePickerModule from '../../style-picker-module/src/style-picker-module';

/**
 * Icon picker module
 */
class StylePickerIconModule<Icon> extends StylePickerModule<Icon> {
  static styles = styles;

  /**
   * Return the slot index from the custom attribute set in the parent module
   */
  get moduleIndex() {
    return this.getAttribute('data-slot-index');
  }
}

export default StylePickerIconModule;
