/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSButton from '@carbon/web-components/es/components/button/button.js';
import styles from './extended-button.scss?inline';

/**
 * Component extending the @carbon/web-components' button
 */
class extendedButton extends CDSButton {
  static styles = styles;
}

export default extendedButton;
