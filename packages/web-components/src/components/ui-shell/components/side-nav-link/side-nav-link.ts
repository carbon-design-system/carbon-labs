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
import sideNavLink from './src/side-nav-link.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the @carbon/web-components' side-nav-link
 */
@customElement(`${clabsPrefix}-side-nav-link`)
class CLABSSideNavLink extends sideNavLink {}

export default CLABSSideNavLink;
