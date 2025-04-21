/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Code } from './code'

export default {
  title: 'MDX Components/Markdown/Code',
  component: Code
}

const Template = (args) => (
  <Code {...args}>
    <code>const a = 16</code>
  </Code>
)

export const Default = Template.bind({})
Default.args = {}
