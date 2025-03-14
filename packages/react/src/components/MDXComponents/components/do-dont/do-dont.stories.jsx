/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { DoDont } from './do-dont'
import { DoDontRow } from './do-dont-row'
import lightTheme from './light-theme.jpg'

export default {
  title: 'MDX Components/DoDont',
  component: DoDontRow,
  subcomponents: { DoDont },
  argTypes: {
    children: {
      control: false
    },
    className: {
      control: false
    }
  }
}

const Template = (args) => (
  <DoDontRow>
    <DoDont
      aspectRatio="1:1"
      text="DoDont example"
      captionTitle="Caption title"
      caption="This is a caption."
      type="do"
      {...args}
    ></DoDont>
    <DoDont aspectRatio="1:1" type="dont" {...args}>
      <img alt="Use markdown in mdx files. ![](dodont.png)" src={lightTheme} />
    </DoDont>
  </DoDontRow>
)

export const Default = Template.bind({})
Default.args = {}
