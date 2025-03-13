/*
 * Copyright IBM Corp. 2022, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react'
import { Video } from './video'
import localPoster from '../../../../../.storybook/storybook-images/local-poster.jpeg'
import localVideo from '../../../../../.storybook/storybook-images/local-video.mp4'

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

export const Vimeo = Template.bind({})
Vimeo.args = {
  title: 'Vimeo example',
  vimeoId: '310583077',
  src: undefined,
  poster: undefined
}
