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
import { Tag } from './src/tag.js';
import { TemplateResult } from 'lit';
import { tagTemplate } from './src/tag.template.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Component extending the Tag component
 *
 * @element clabs-tag
 */
@customElement(`${clabsPrefix}-tag`)
class CLABSTag extends Tag {
  /**
   * Renders the template while passing in class functionality
   */
  render(): TemplateResult<1> {
    return tagTemplate(this);
  }
}

export default CLABSTag;
