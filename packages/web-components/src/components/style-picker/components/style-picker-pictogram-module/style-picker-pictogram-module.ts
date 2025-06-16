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
import { stylePickerPictogramModuleTemplate } from './src/style-picker-pictogram-module.template.js';
import StylePickerPictogramModule from './src/style-picker-pictogram-module.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Pictogram module
 * 
 * @elements clabs-style-picker-pictogram-module
 */
@customElement(`${clabsPrefix}-style-picker-pictogram-module`)
class CLABSStylePickerPictogramModule<
  Pictogram
> extends StylePickerPictogramModule<Pictogram> {
  @consume({ context: stylePickerContext, subscribe: true })
  stylePickerContext?: StylePickerContextType;

  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerPictogramModuleTemplate(this);
  }
}

export default CLABSStylePickerPictogramModule;
