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
import message from './src/message.js';
import { messageTemplate } from './src/message.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Constructed class functionality for the message custom element
 */
@customElement(`${clabsPrefix}-chat-message`)
class CLABSMessage extends message {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return messageTemplate(this);
  }
}

export default CLABSMessage;
