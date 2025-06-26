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
import { stylePickerIconModuleTemplate } from './src/style-picker-icon-module.template.js';
import StylePickerIconModule from './src/style-picker-icon-module.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Icon module.
 *
 * @element clabs-style-picker-icon-module
 */
@customElement(`${clabsPrefix}-style-picker-icon-module`)
class CLABSStylePickerIconModule<Icon> extends StylePickerIconModule<Icon> {
  @consume({ context: stylePickerContext, subscribe: true })
  stylePickerContext?: StylePickerContextType;

  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerIconModuleTemplate(this);
  }
}

export default CLABSStylePickerIconModule;
