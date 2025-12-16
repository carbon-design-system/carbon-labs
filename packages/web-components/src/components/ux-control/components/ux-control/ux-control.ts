/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import { UXControl } from './src/ux-control.js';
import { TemplateResult } from 'lit';
import { uxControlTemplate } from './src/ux-control.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the UXControl component
 *
 * @element clabs-ux-control
 */
@customElement(`${clabsPrefix}-ux-control`)
class CLABSUXControl extends UXControl {
  /**
   * Renders the template while passing in class functionality
   */
  render(): TemplateResult<1> {
    return uxControlTemplate(this);
  }
}

export default CLABSUXControl;
