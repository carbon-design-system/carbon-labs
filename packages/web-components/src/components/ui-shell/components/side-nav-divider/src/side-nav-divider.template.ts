/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSSideNavDivider from '@carbon/web-components/es/components/ui-shell/side-nav-divider.js';
// @ts-ignore
import styles from './side-nav-divider.scss?inline';

/**
 * Component extending the @carbon/web-components' side-nav-divider
 */
class sideNavDivider extends CDSSideNavDivider {
  static styles = styles;
}

export default sideNavDivider;
