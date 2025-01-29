/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CDSHeaderPanel from '@carbon/web-components/es/components/ui-shell/header-panel.js';
// @ts-ignore
import styles from './header-panel.scss?inline';

/**
 * Component extending the @carbon/web-components' header-panel
 */
class headerPanel extends CDSHeaderPanel {
  static styles = styles;
}

export default headerPanel;
