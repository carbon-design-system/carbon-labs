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
import card from './src/card.js';
import { cardTemplate } from './src/card.template.js';

const { stablePrefix: c4aiPrefix } = settings;

/**
 * Constructed class functionality for the test input custom element
 */
@customElement(`${c4aiPrefix}--chat-card`)
class C4AICard extends card {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return cardTemplate(this);
  }
}

export default C4AICard;
