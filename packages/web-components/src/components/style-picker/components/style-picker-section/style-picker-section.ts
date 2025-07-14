/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { stylePickerSectionTemplate } from './src/style-picker-section.template.js';
import StylePickerSection from './src/style-picker-section.js';
import { prefix } from '../../defs/index.js';

/**
 * Section element extends StylePickerSection base components
 * Denotes the each section of a style picker.
 * Can use to distinguish between different sections of a style picker.
 *
 * @element clabs-style-picker-section
 */
@customElement(`${prefix}-section`)
class CLABSStylePickerSection extends StylePickerSection {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerSectionTemplate(this);
  }
}

export default CLABSStylePickerSection;
