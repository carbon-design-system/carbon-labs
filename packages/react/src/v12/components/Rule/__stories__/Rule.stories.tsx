/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Rule } from '../components/Rule';
import '../components/rule.scss';
import './Rule.stories.scss';
import mdx from './Rule.mdx';

const meta: Meta<typeof Rule> = {
  title: 'V12/Rule',
  tags: ['squad', 'incubating'],
  component: Rule,
  parameters: {
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    className: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="rule-story__page">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Rule>;

/**
 * One rule, the width of its container.
 */
export const Default: Story = {};
