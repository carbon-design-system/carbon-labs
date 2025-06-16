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
import { consume } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../context/style-picker-context.js';
import { stylePickerColorModuleTemplate } from './src/style-picker-color-module.template.js';
import StylePickerColorModule from './src/style-picker-color-module.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Color module
 * 
 * @element clabs-style-picker-color-module
 */
@customElement(`${clabsPrefix}-style-picker-color-module`)
class CLABSStylePickerColorModule<Color> extends StylePickerColorModule<Color> {
  @consume({ context: stylePickerContext, subscribe: true })
  stylePickerContext?: StylePickerContextType;

  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerColorModuleTemplate(this);
  }
}

export default CLABSStylePickerColorModule;
