/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
// need to set up package to import global files like the one below. Hardcoding
//the `c4ai`prefixes for now

// import settings from '../../globals/settings.js';
import extendedButton from './src/extended-button.template.js';

/**
 * Component extending the @carbon/web-components' button
 */
@customElement(`c4ai-extended-button`)
class C4AIExtendedButton extends extendedButton {}

export default C4AIExtendedButton;
