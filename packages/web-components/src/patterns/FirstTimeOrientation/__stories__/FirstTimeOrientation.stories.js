/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
 import '../../../../../../examples/web-components/first-time-orientation/src/first-time-orientation';

import styles from './story-styles.scss?lit';

export default {
  title: 'Patterns/FirstTimeOrientation',
  parameters: {
    docs: { source: { type: 'code' } },
  },
};

/* eslint-disable jsdoc/require-jsdoc */

export const FirstTimeOrientation = {
  render: () =>
    html`<div class="storyBody">
      <style>
        ${styles}
      </style>
       <clabs-first-time-orientation></clabs-first-time-orientation>
    </div> `,
};
