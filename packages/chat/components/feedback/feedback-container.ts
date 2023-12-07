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
import { FeedbackContainer } from './src/feedback-container.template.js';
const { stablePrefix: c4aiPrefix } = settings;

/**
 * Component extending the Feedback Container
 */
@customElement(`${c4aiPrefix}-feedback-container`)
class C4AIFeedbackContainer extends FeedbackContainer {}

export default C4AIFeedbackContainer;
