/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-ignore
import styles from './style-picker-pictogram-module.scss?inline';
import StylePickerModule from '../../style-picker-module/src/style-picker-module';

/**
 * Pictogram picker module
 */
class StylePickerPictogramModule<
  Pictogram
> extends StylePickerModule<Pictogram> {
  static styles = styles;
}

export default StylePickerPictogramModule;
