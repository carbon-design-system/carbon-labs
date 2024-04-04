/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon/ai-utilities/es/settings/index.js';
import footer from './src/footer.js';
import { footerTemplate } from './src/footer.template.js';

const { stablePrefix: c4aiPrefix } = settings;

/**
 * Constructed class functionality for the test input custom element
 */
@customElement(`${c4aiPrefix}--chat-footer`)
class C4AIFooter extends footer {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return footerTemplate(this);
  }
}

export default C4AIFooter;
