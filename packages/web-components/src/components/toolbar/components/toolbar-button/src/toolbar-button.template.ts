/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSIconButton from '@carbon/web-components/es/components/icon-button/icon-button.js';
// @ts-ignore
import styles from './toolbar-button.scss?inline';

/**
 * Extended toolbar button with predefined properties
 */
class toolbarButton extends CDSIconButton {
  static styles = styles;
}

export default toolbarButton;
