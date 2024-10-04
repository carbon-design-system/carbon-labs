/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../tableElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Table',
  tags: ['autodocs'],
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <clabs-chat-table
      content="Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY">
    </clabs-chat-table>`,
};

/** generateTable - make a random table for testing
 * @param {number} N - rows
 * @param {number} M - columns
 */
function generateTable(N, M) {
  /** random word maker
   */
  const randWord = () => Math.random().toString(36).substring(7);
  /** random value maker
   */
  const randValue = () =>
    Math.random() < 0.5 ? (Math.random() * 100).toFixed(2) : randWord();

  const headers = Array.from({ length: N }, randWord).join(',');
  const rows = Array.from({ length: M }, () =>
    Array.from({ length: N }, randValue).join(',')
  ).join('\n');
  return headers + '\n' + rows;
}

const randTable = generateTable(10, 50);

export const SizeTest = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <clabs-chat-table content="${randTable}" max-height="400px">
    </clabs-chat-table>`,
};
