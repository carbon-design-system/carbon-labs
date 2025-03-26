/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './Processing.mdx';
import Processing from '../components/Processing';
import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import '../components/processing.scss';

const meta: Meta<typeof Processing> = {
  title: 'Components/Processing',
  component: Processing,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Processing>;

const sharedArgTypes = {
  loop: {
    description: 'Specify whether the animation should loop',
  },
};

const linearArgs = {
  loop: true,
};

const linearNoLoopArgs = {
  loop: false,
};

export const LinearLoop = (args) => {
  const [_, updateArgs] = useArgs();

  return <Processing {...args}></Processing>;
};

LinearLoop.argTypes = {
  ...sharedArgTypes,
};

LinearLoop.args = {
  ...linearArgs,
};

export const LinearNoLoop = (args) => {
  const [_, updateArgs] = useArgs();

  return <Processing {...args}></Processing>;
};

LinearNoLoop.argTypes = {
  ...sharedArgTypes,
};

LinearNoLoop.args = {
  ...linearNoLoopArgs,
};
