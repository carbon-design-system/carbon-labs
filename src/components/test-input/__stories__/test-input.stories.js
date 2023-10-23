/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../test-input';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Test input',
  tags: ['autodocs'],
};

export const Default = {
  render: () => html` <c4ai-test-input> </c4ai-test-input>`,
};
