/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Link } from './link'

export default {
  title: 'MDX Components/Markdown/Link',
  component: Link,
  argTypes: {
    className: {
      control: false
    }
  }
}

const Template = (args) => (
  <Link href="https://platform.carbondesignsystem.com" {...args}>
    Carbon Platform Storybook
  </Link>
)

export const Default = Template.bind({})
Default.args = {}
