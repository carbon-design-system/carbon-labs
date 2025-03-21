/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react'
import { Title } from './title'
import { P } from '../markdown/p'

export default {
  title: 'MDX Components/Title',
  component: Title,
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
  <>
    <Title {...args}>Lorem ipsum</Title>
    <P>This is the element after the title with its default top margin removed.</P>
  </>
)

export const Default = Template.bind({})
Default.args = {}
