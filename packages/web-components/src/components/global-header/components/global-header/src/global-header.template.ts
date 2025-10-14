/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CommonHeader } from './components/CommonHeader/CommonHeader';
// @ts-ignore
import styles from './index.scss?inline';

/**
 * Component extending the @carbon/web-components' button
 */
class globalHeader extends CommonHeader {
  static styles = styles;
}

export default globalHeader;
