/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import chartElementV2 from './src/chartElementV2.js';
import { chartElementV2Template } from './src/chartElementV2.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Constructed class functionality for the test input custom element
 *
 * @element clabs-chat-chart
 */
@customElement(`${clabsPrefix}-chat-chart-v2`)
class CLABSChartElementV2 extends chartElementV2 {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return chartElementV2Template(this);
  }
}

export default CLABSChartElementV2;
