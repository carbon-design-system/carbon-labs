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
import sideNavItems from './src/side-nav-items.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the @carbon/web-components' side-nav-items
 */
@customElement(`${clabsPrefix}-side-nav-items`)
class CLABSSideNavItems extends sideNavItems {}

export default CLABSSideNavItems;
