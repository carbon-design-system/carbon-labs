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
import loadingElement from './src/loadingElement.js';
import { loadingElementTemplate } from './src/loadingElement.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Constructed class functionality for the test input custom element
 */
@customElement(`${clabsPrefix}-chat-loading`)
class CLABSLoadingElement extends loadingElement {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return loadingElementTemplate(this);
  }
}

export default CLABSLoadingElement;
