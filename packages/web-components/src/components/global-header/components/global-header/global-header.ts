/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import globalHeader from './src/global-header.template.js';

export { CommonHeader } from './src/components/CommonHeader/CommonHeader.js';
export { HybridIpaasHeader } from './src/components/HybridIpaasHeader/HybridIpaasHeader.js';
export { LogoutHeader } from './src/components/LogoutHeader/LogoutHeader.js';
export { LogoutTile } from './src/components/LogoutTile/LogoutTile.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Top-level component implementing the global header
 */
@customElement(`${clabsPrefix}-global-header`)
class CLABSGlobalHeader extends globalHeader {}

export default CLABSGlobalHeader;
