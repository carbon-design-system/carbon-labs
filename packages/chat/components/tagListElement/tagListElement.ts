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
import tagListElement from './src/tagListElement.js';
import { tagListElementTemplate } from './src/tagListElement.template.js';

const { stablePrefix: c4aiPrefix } = settings;

/**
 * Constructed class functionality for the test input custom element
 */
@customElement(`${c4aiPrefix}--chat-tag-list`)
class C4AITagListElement extends tagListElement {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return tagListElementTemplate(this);
  }
}

export default C4AITagListElement;
