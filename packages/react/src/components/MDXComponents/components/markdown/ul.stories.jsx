/*
 * Copyright IBM Corp. 2022, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react'
import { LI } from './li';
import { UL } from './ul';

const stories = {
  title: 'Components/MDX Components/Markdown/UL',
  component: UL,
  argTypes: {
    children: {
      control: false
    },
    className: {
      control: false
    }
  }
}

export default stories

const Template = (args) => (
  <UL {...args}>
    <LI>list item 1</LI>
    <LI>list item 2</LI>
    <LI>list item 3</LI>
  </UL>
)

export const Default = Template.bind({})
Default.args = {}
