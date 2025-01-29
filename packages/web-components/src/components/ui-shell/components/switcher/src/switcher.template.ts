/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSSwitcher from '@carbon/web-components/es/components/ui-shell/switcher.js';
// @ts-ignore
import styles from './switcher.scss?inline';

/**
 * Component extending the @carbon/web-components' switcher
 */
class switcher extends CDSSwitcher {
  static styles = styles;
}

export default switcher;
