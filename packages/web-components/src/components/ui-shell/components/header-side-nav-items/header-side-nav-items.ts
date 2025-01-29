/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import headerSideNavItems from './src/header-side-nav-items.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the @carbon/web-components' header-side-nav-items
 */
@customElement(`${clabsPrefix}-header-side-nav-items`)
class CLABSHeaderSideNavItems extends headerSideNavItems {}

export default CLABSHeaderSideNavItems;
