/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { StorybookDemo } from './storybook-demo'

export default {
  title: 'MDX Components/StorybookDemo',
  component: StorybookDemo
}

const Template = (args) => (
  <StorybookDemo
    {...args}
    themeSelector={true}
    wide
    tall
    url="https://react.carbondesignsystem.com"
    variants={[
      {
        label: 'Button',
        variant: 'components-button--default'
      },
      {
        label: 'Secondary',
        variant: 'components-button--secondary'
      },
      {
        label: 'Tertiary',
        variant: 'components-button--tertiary'
      },
      {
        label: 'Ghost',
        variant: 'components-button--ghost'
      },
      {
        label: 'Danger',
        variant: 'components-button--danger'
      },
      {
        label: 'Icon button',
        variant: 'components-button--icon-button'
      },
      {
        label: 'Set of buttons',
        variant: 'components-button--set-of-buttons'
      },
      {
        label: 'Skeleton',
        variant: 'components-button--skeleton'
      }
    ]}
  />
)

export const Default = Template.bind({})
Default.args = {}
