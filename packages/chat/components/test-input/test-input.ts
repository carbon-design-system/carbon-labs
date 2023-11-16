/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
// need to set up package to import global files like the one below. Hardcoding
// the `c4ai` prefixes for now

// import settings from '../../globals/settings.js';
import testInput from './src/test-input.js';
import { testInputTemplate } from './src/test-input.template.js';

// const { stablePrefix: c4aiPrefix } = settings;

/**
 * Constructed class functionality for the test input custom element
 */
@customElement(`c4ai-test-input`)
class C4AITestInput extends testInput {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return testInputTemplate(this);
  }
}

export default C4AITestInput;
