/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import settings from '../../globals/settings.js';
import CDSButton from '@carbon/web-components/es/components/button/button.js';
import styles from './extended-button.scss?inline';

const { stablePrefix: c4aiPrefix } = settings;

/**
 * Component extending the @carbon/web-components' button
 */
export default class C4AIExtendedButton extends CDSButton {
  static styles = styles;
}

customElements.define(`${c4aiPrefix}-extended-button`, C4AIExtendedButton);
