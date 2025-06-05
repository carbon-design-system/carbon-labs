/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { consume } from '@lit/context';
import { LitElement } from 'lit';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
import styles from './style-picker-module.scss?inline';

/**
 *
 */
class stylePickerModules extends LitElement {
  static styles = styles;

  @consume({ context: stylePickerContext, subscribe: true })
  stylePickerContext?: StylePickerContextType;
}

export default stylePickerModules;
