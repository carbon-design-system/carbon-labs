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
import { Feedback } from './src/feedback';
import { TemplateResult } from 'lit';
import { feedbackTemplate } from './src/feedback.template.js';

const { stablePrefix: c4aiPrefix } = settings;

/**
 * Component extending the Feedback component
 */
@customElement(`${c4aiPrefix}-feedback`)
class C4AIFeedback extends Feedback {
  /**
   * Renders the template while passing in class functionality
   */
  render(): TemplateResult<1> {
    return feedbackTemplate(this);
  }
}

export default C4AIFeedback;
