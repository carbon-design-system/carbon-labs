/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSHeaderGlobalAction from '@carbon/web-components/es/components/ui-shell/header-global-action.js';
// @ts-ignore
import styles from './header-global-action.scss?inline';

/**
 * Component extending the @carbon/web-components' header-global-action
 */
class headerGlobalAction extends CDSHeaderGlobalAction {
  static styles = styles;
}

export default headerGlobalAction;
