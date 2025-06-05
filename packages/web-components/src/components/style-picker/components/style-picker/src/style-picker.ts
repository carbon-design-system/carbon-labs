/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-ignore
import styles from './style-picker.scss?inline';
import { LitElement } from 'lit';

/**
 * Component extending the @carbon/web-components' button
 */
class stylePicker extends LitElement {
  static styles = styles;
}

export default stylePicker;
