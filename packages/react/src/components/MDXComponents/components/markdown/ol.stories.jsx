/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { LI } from './li';
import { OL } from './ol';

const stories = {
  title: 'MDX Components/Markdown/OL',
  component: OL,
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
  <div style={{paddingLeft: "1rem"}}>
    <OL {...args}>
      <LI>list item 1</LI>
      <LI>list item 2</LI>
      <LI>list item 3</LI>
    </OL>
  </div>  
)

export const Default = Template.bind({})
Default.args = {}
