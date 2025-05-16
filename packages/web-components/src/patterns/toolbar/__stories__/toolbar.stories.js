/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import '../../../../../../examples/web-components/toolbar/src/toolbar';
import '../../../../../../examples/web-components/toolbar/src/toolbar-vertical';
export default {
  title: 'Patterns/Toolbar',
  parameters: {
    docs: { source: { type: 'code' } },
  },
};

const defaultArgs = {
  orientation: 'horizontal',
};

const defaultControls = {
  orientation: {
    control: { type: 'select' },
    options: ['horizontal', 'vertical'],
  },
};

/* eslint-disable jsdoc/require-jsdoc */
export const Horizontal = {
  argTypes: defaultControls,
  args: defaultArgs,
  render: ({ orientation }) =>
    html` <clabs-toolbar orientation=${orientation}></clabs-toolbar> `,
};

export const Vertical = {
  argTypes: defaultControls,
  args: {
    orientation: 'vertical',
  },
  render: ({ orientation }) =>
    html`
      <clabs-toolbar-vertical
        orientation=${orientation}></clabs-toolbar-vertical>
    `,
};
