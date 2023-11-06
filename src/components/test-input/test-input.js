/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import settings from '../../globals/settings.js';
import testInput from './src/test-input.js';
import { testInputTemplate } from './src/test-input.template.js';

const { stablePrefix: c4aiPrefix } = settings;

/**
 * Constructed class functionality for the test input custom element
 */
export default class C4AITestInput extends testInput {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return testInputTemplate(this);
  }
}

customElements.define(`${c4aiPrefix}-test-input`, C4AITestInput);
