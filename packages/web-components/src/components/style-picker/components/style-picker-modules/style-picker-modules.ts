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
import { stylePickerModulesTemplate } from './src/style-picker-modules.template.js';
import { consume } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../context/style-picker-context.js';
import StylePickerModules from './src/style-picker-modules.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * A wrapper wrap multiple `style-picker-module` components
 *
 * @elements clabs-style-picker-modules
 */
@customElement(`${clabsPrefix}-style-picker-modules`)
class CLABSStylePickerModules extends StylePickerModules {
  @consume({ context: stylePickerContext, subscribe: true })
  stylePickerContext?: StylePickerContextType;

  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerModulesTemplate();
  }
}

export default CLABSStylePickerModules;
