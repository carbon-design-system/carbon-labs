/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Caption } from './caption';

export default {
  title: 'MDX Components/Caption',
  component: Caption,
  argTypes: {}
}

const Template = (args) => (
  <Caption {...args}>Lorem ipsum dolor sit amet Lorem Lorem Lorem Lorem Lorem Lorem ipsum.</Caption>
)

export const Default = Template.bind({})
Default.args = {}
