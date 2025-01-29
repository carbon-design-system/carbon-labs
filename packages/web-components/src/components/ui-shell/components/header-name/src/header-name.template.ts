/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSHeaderName from '@carbon/web-components/es/components/ui-shell/header-name.js';
// @ts-ignore
import styles from './header-name.scss?inline';

/**
 * Component extending the @carbon/web-components' header-name
 */
class headerName extends CDSHeaderName {
  static styles = styles;
}

export default headerName;
