/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { ImageWrapper } from './image-wrapper'
import accordionStyle3Png from './accordion-style-3.png'

const stories = {
  title: 'MDX Components/Images & Video/ImageWrapper',
  component: ImageWrapper,
  argTypes: {
    children: {
      control: false
    }
  }
}

export default stories

const Template = (args) => (
  <ImageWrapper type="fixed" {...args}>
    <img alt="fixed demo" src={accordionStyle3Png} />
  </ImageWrapper>
)

export const Default = Template.bind({})
Default.args = {}
