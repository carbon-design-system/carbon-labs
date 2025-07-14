/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { stylePickerIconTemplate } from './src/style-picker-icon.template.js';
import StylePickerIcon from './src/style-picker-icon.js';
import { prefix } from '../../defs/index.js';

/**
 * Icon option component class extending the StylePickerIcon base class.
 *
 * @element clabs-style-picker-icon-module
 */
@customElement(`${prefix}-icon`)
class CLABSStylePickerIcon extends StylePickerIcon {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerIconTemplate();
  }
}

export default CLABSStylePickerIcon;
