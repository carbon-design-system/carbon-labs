/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSSideNavLink from '@carbon/web-components/es/components/ui-shell/side-nav-link.js';
// @ts-ignore
import styles from './side-nav-link.scss?inline';

/**
 * Component extending the @carbon/web-components' side-nav-link
 */
class sideNavLink extends CDSSideNavLink {
  static styles = styles;
}

export default sideNavLink;
