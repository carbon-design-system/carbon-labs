/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import { stylePickerTemplate } from './src/style-picker.template.js';
import StylePicker from './src/style-picker.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Style picker component class extending the base StylePicker class.
 *
 * @element clabs-style-picker
 */
@customElement(`${clabsPrefix}-style-picker`)
class CLABSStylePicker extends StylePicker {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerTemplate(this);
  }
}

export default CLABSStylePicker;
