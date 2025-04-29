/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react'
import { Video } from './video'
import localPoster from './local-poster.jpeg'
import localVideo from './local-video.mp4'

export default {
  title: 'MDX Components/Images & Video/Video',
  component: Video,
  argTypes: {
    poster: {
      type: 'string'
    },
    src: {
      type: 'string'
    },
    vimeoId: {
      type: 'string'
    }
  }
}

const Template = (args) => <Video src={localVideo} poster={localPoster} {...args} />

export const Default = Template.bind({})
Default.args = {
  width: 720,
  height: 405
}
