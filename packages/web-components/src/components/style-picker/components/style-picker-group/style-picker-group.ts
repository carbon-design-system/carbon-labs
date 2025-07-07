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
import { stylePickerGroupTemplate } from './src/style-picker-group.template.js';
import StylePickerGroup from './src/style-picker-group.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Group wrapper element.
 *
 * @element clabs-style-picker-group
 */
@customElement(`${clabsPrefix}-style-picker-group`)
class CLABSStylePickerGroup extends StylePickerGroup {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerGroupTemplate(this);
  }
}

export default CLABSStylePickerGroup;
