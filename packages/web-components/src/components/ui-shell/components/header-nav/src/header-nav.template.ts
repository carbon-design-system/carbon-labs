/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSHeaderNav from '@carbon/web-components/es/components/ui-shell/header-nav.js';
// @ts-ignore
import styles from './header-nav.scss?inline';

/**
 * Component extending the @carbon/web-components' header-nav
 */
class headerNav extends CDSHeaderNav {
  static styles = styles;
}

export default headerNav;
