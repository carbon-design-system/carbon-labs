/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { stylePickerGroupTemplate } from './src/style-picker-group.template';
import { consume } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../context/style-picker-context.js';
import StylePickerGroup from './src/style-picker-group';
import { TemplateResult } from 'lit';
import { prefix } from '../../defs';

/**
 * StylePickerGroup component class extending the StylePickerGroup base class.
 *
 * @elements clabs-style-picker-group
 */
@customElement(`${prefix}-group`)
class CLABSStylePickerGroup extends StylePickerGroup {
  @consume({ context: stylePickerContext, subscribe: true })
  stylePickerContext?: StylePickerContextType;

  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render(): TemplateResult<1> {
    return stylePickerGroupTemplate(this);
  }
}

export default CLABSStylePickerGroup;
