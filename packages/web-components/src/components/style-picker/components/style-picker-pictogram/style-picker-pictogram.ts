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
import { stylePickerPictogramTemplate } from './src/style-picker-pictogram.template.js';
import StylePickerPictogram from './src/style-picker-pictogram.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Pictogram element
 *
 * @elements clabs-style-picker-pictogram
 */
@customElement(`${clabsPrefix}-style-picker-pictogram`)
class CLABSStylePickerPictogram extends StylePickerPictogram {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerPictogramTemplate(this);
  }
}

export default CLABSStylePickerPictogram;
