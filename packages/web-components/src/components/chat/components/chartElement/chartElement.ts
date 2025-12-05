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
import chartElement from './src/chartElement.js';
import { chartElementTemplate } from './src/chartElement.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Constructed class functionality for the test input custom element
 *
 * @element clabs-chat-chart
 */
@customElement(`${clabsPrefix}-chat-chart`)
class CLABSChartElement extends chartElement {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return chartElementTemplate(this);
  }
}

export default CLABSChartElement;
