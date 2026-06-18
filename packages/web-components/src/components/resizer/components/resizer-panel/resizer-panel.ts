/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import ResizerPanelTemplate from './src/resizer-panel.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Resizer panel component for resizable content areas
 */
@customElement(`${clabsPrefix}-resizer-panel`)
class CLABSResizerPanel extends ResizerPanelTemplate {}

export default CLABSResizerPanel;
