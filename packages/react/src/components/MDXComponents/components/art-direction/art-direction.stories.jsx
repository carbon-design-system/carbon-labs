/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { ArtDirection } from './art-direction'
import desktop from './desktop.jpg'
import mobile from './mobile.jpg'
import tablet from './tablet.jpg'

export default {
  title: 'MDX Components/Images & Video/ArtDirection',
  component: ArtDirection,
  argTypes: {
    children: {
      control: false
    }
  }
}

const Template = (args) => (
  <div style={{ minHeight: '500px' }}>
    <ArtDirection {...args}>
      <img alt="mobile" src={mobile} />
      <img alt="tablet" src={tablet} />
      <img alt="desktop" src={desktop} />
    </ArtDirection>
  </div>
)

export const Default = Template.bind({})
Default.args = {}
