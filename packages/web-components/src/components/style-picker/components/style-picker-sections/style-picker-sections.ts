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
import { stylePickerSectionsTemplate } from './src/style-picker-sections.template.js';
import { consume } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../context/style-picker-context.js';
import StylePickerSections from './src/style-picker-sections.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * A wrapper wraps multiple `style-picker-section` components
 *
 * @elements clabs-style-picker-sections
 */
@customElement(`${clabsPrefix}-style-picker-sections`)
class CLABSStylePickerSections extends StylePickerSections {
  @consume({ context: stylePickerContext, subscribe: true })
  stylePickerContext?: StylePickerContextType;

  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return stylePickerSectionsTemplate(this);
  }
}

export default CLABSStylePickerSections;
