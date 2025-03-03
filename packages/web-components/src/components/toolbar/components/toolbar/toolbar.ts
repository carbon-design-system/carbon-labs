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
import Toolbar from './src/toolbar.template.js';
import ToolbarGroup from './src/toolbar-group.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * CLABS Component extending toolbar
 */
@customElement(`${clabsPrefix}-toolbar`)
class CLABSToolbar extends Toolbar {}

/**
 * CLABS Component extending toolbar group
 */
@customElement(`${clabsPrefix}-toolbar-group`)
class CLABSToolbarGroup extends ToolbarGroup {}

export { CLABSToolbar, CLABSToolbarGroup };
