/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon/ai-utilities/es/settings/index.js';
import textElement from './src/textElement.js';
import { textElementTemplate } from './src/textElement.template.js';

const { stablePrefix: c4aiPrefix } = settings;

/**
 * Constructed class functionality for the test input custom element
 */
@customElement(`${c4aiPrefix}--chat-text`)
class C4AITextElement extends textElement {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return textElementTemplate(this);
  }
}

export default C4AITextElement;
