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
import wysiwyg from './src/wysiwyg.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * WYSIWYG editor component
 */
@customElement(`${clabsPrefix}-wysiwyg`)
class CLABSWysiwyg extends wysiwyg {}

declare global {
  interface HTMLElementTagNameMap {
    'clabs-wysiwyg': CLABSWysiwyg;
  }
}

export default CLABSWysiwyg;
