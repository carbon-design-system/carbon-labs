/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { InlineNotification } from './inline-notification'

const stories = {
  title: 'MDX Components/InlineNotification',
  component: InlineNotification,
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
  <InlineNotification {...args}>
    Lorem ipsum: dolor sit amet, elit. Curabitur ac odio arcu. Vestibulum egestas eleifend
    porttitor. Quisque malesuada pulvinar pellentesque. Nunc dictum odio eu enim venenatis
    fringilla. Nunc finibus enim dui, a tempus quam commodo vitae. Donec non eros gravida dolor
    porta suscipit non vel quam.
  </InlineNotification>
)

export const Default = Template.bind({})
Default.args = {}

export const Warning = Template.bind({})
Warning.args = {
  kind: 'warning'
}

export const Info = Template.bind({})
Info.args = {
  kind: 'info'
}

// Note: This is a lowercase "e" so it doesn't collide with the built-in JS Error class
export const error = Template.bind({})
error.args = {
  kind: 'error'
}

export const Success = Template.bind({})
Success.args = {
  kind: 'success'
}
