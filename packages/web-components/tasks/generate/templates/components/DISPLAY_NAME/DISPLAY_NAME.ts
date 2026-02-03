/**
 * @license
 *
 * Copyright IBM Corp. FULL_YEAR
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import CAMEL_CASE from './src/DISPLAY_NAME.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the @carbon/web-components' button
 */
@customElement(`${clabsPrefix}-DISPLAY_NAME`)
class CLABSPASCAL_CASE extends CAMEL_CASE {}

export default CLABSPASCAL_CASE;
