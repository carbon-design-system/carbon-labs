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
import { stylePickerDisclosedTemplate } from './src/style-picker-disclosed.template.js';
import StylePickerDisclosed from './src/style-picker-disclosed.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Accordion item wrapper element.
 *
 * @element clabs-style-picker-disclosed
 */
@customElement(`${clabsPrefix}-style-picker-disclosed`)
class CLABSStylePickerDisclosed extends StylePickerDisclosed {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerDisclosedTemplate(this);
  }
}

export default CLABSStylePickerDisclosed;
