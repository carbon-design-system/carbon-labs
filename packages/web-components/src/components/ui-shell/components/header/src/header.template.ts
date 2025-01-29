/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSHeader from '@carbon/web-components/es/components/ui-shell/header.js';
// @ts-ignore
import styles from './header.scss?inline';

/**
 * Component extending the @carbon/web-components' header
 */
class header extends CDSHeader {
  static styles = styles;
}

export default header;
