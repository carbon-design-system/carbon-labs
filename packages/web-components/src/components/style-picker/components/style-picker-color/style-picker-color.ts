/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { stylePickerColorTemplate } from './src/style-picker-color.template.js';
import StylePickerColor from './src/style-picker-color.js';
import { prefix } from '../../defs/index.js';

/**
 * Color picker option component extending the StylePickerColor base class.
 *
 * @element clabs-style-picker-color
 */
@customElement(`${prefix}-color`)
class CLABSStylePickerColor extends StylePickerColor {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerColorTemplate(this);
  }
}

export default CLABSStylePickerColor;
