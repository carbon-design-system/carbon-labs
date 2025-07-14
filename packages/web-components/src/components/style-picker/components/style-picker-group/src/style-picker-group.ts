/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { consume } from '@lit/context';
import { CSSResultGroup, LitElement } from 'lit';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
// @ts-ignore
import styles from './style-picker-group.scss?inline';
import { property } from 'lit/decorators.js';

/**
 * Group element extending LitElement.
 */
class StylePickerGroup extends LitElement {
  static styles: CSSResultGroup = [styles];

  /**
   * Consume style-picker-context
   */
  @consume({ context: stylePickerContext, subscribe: true })
  _stylePickerContext?: StylePickerContextType;

  @property({ type: String, reflect: true, attribute: 'heading' })
  heading = '';
}

export default StylePickerGroup;
