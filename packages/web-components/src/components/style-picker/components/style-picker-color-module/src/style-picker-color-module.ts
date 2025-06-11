/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { consume } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
import styles from './style-picker-color-module.scss?inline';
import { property } from 'lit/decorators';
import StylePickerModule from '../../style-picker-module/src/style-picker-module';
import { LitElement } from 'lit';

/**
 * Color picker module
 */
class StylePickerColorModule<Color> extends StylePickerModule<Color> {
  static styles = styles;
}

export default StylePickerColorModule;
