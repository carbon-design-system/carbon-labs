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
import tableElement from './src/tableElement.js';
import { tableElementTemplate } from './src/tableElement.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Constructed class functionality for the test input custom element
 */
@customElement(`${clabsPrefix}-chat-table`)
class CLABSTableElement extends tableElement {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return tableElementTemplate(this);
  }
}

export default CLABSTableElement;
