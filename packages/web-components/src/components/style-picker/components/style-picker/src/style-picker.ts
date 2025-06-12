/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { provide } from '@lit/context';
import { property } from 'lit/decorators.js';
import styles from './style-picker.scss?inline';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
import { Kind } from '../../../defs/style-picker.types';

/**
 * Component extending the @carbon/web-components' button
 */
class StylePicker extends LitElement {
  static styles = styles;

  /**
   * Provide style-picker-context
   */
  @provide({ context: stylePickerContext })
  _stylePickerContext: StylePickerContextType = { kind: 'single' };

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
   * Define title for the picker
   */
  @property({ type: String, reflect: true, attribute: 'title' })
  title = '';
}

export default StylePicker;
