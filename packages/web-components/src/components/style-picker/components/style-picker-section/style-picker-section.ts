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
import { stylePickerSectionTemplate } from './src/style-picker-section.template.js';
import StylePickerSection from './src/style-picker-section.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Accordion item wrapper element.
 *
 * @element clabs-style-picker-section
 */
@customElement(`${clabsPrefix}-style-picker-section`)
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
