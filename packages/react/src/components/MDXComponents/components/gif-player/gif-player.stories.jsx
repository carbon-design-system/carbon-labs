/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { GifPlayer } from './gif-player'
import cloudGif from './cloud.gif'
import cloudJpg from './cloud.jpg'

const stories = {
  title: 'MDX Components/Images & Video/GifPlayer',
  component: GifPlayer,
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
  <GifPlayer {...args}>
    <img alt="animated" src={cloudGif} />
    <img alt="static" src={cloudJpg} />
  </GifPlayer>
)

export const Default = Template.bind({})
Default.args = {}
