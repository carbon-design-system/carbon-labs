/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { Preview } from './preview'

export default {
  title: 'MDX Components/Preview',
  component: Preview,
  parameters: {},
  argTypes: {
    title: {
      control: false
    }
  }
}

const Template = (args) => (
  <Preview
    {...args}
    height="400"
    title="Carbon Tutorial Step 5"
    src="https://react-step-6--carbon-tutorial.netlify.com"
  />
)

export const Default = Template.bind({})
Default.args = {}
