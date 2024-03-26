/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import extendedButton from './src/extended-button.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the @carbon/web-components' button
 */
@customElement(`${clabsPrefix}-extended-button`)
class CLABSExtendedButton extends extendedButton {}

export default CLABSExtendedButton;
