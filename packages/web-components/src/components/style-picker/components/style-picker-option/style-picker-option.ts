/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { stylePickerOptionTemplate } from './src/style-picker-option.template.js';
import { consume } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../context/style-picker-context.js';
import StylePickerOption from './src/style-picker-option.js';
import { prefix } from '../../defs/index.js';

/**
 * Style picker option extends StylePickerOption base class.
 *
 * @elements clabs-style-picker-option
 */
@customElement(`${prefix}-option`)
class CLABSStylePickerOption extends StylePickerOption {
  @consume({ context: stylePickerContext, subscribe: true })
  stylePickerContext?: StylePickerContextType;

  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerOptionTemplate(this);
  }
}

export default CLABSStylePickerOption;
