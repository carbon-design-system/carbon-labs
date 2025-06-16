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
import { stylePickerModuleTemplate } from './src/style-picker-module.template.js';
import { consume } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../context/style-picker-context.js';
import StylePickerModule from './src/style-picker-module.js';
import { TemplateResult } from 'lit';

const { stablePrefix: clabsPrefix } = settings;

/**
 * The base component for different modules eg: color, icon, pictogram, etc.
 * 
 * @elements clabs-style-picker-module
 */
@customElement(`${clabsPrefix}-style-picker-module`)
class CLABSStylePickerModule<T> extends StylePickerModule<T> {
  @consume({ context: stylePickerContext, subscribe: true })
  stylePickerContext?: StylePickerContextType;

  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render(): TemplateResult<1> {
    return stylePickerModuleTemplate(this);
  }
}

export default CLABSStylePickerModule;
