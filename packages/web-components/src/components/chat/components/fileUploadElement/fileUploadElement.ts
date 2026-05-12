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
import fileUploadElement from './src/fileUploadElement.js';
import { fileUploadElementTemplate } from './src/fileUploadElement.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Constructed class functionality for the test input custom element
 */
@customElement(`${clabsPrefix}-chat-file-upload`)
class CLABSFileUploadElement extends fileUploadElement {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return fileUploadElementTemplate(this);
  }
}

export default CLABSFileUploadElement;
