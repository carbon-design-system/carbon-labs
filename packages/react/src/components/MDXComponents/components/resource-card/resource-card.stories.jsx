/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { Column } from '@carbon/react'

import { CardGroup } from '../card-group/card-group'
import { ResourceCard } from './resource-card'
import sketchIconPng from '../card-group/sketch-icon.png'

const stories = {
  title: 'MDX Components/Cards/ResourceCard',
  component: ResourceCard,
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
  <CardGroup>
    <Column lg={4}>
      <ResourceCard
        subTitle="With subtitle"
        title="Title"
        aspectRatio="2:1"
        actionIcon="arrowRight"
        href="https://www.carbondesignsystem.com"
        {...args}
      >
        <img src={sketchIconPng} alt="Use markdown for images in mdx files. ![](img.png)" />
      </ResourceCard>
    </Column>
    <Column lg={4}>
      <ResourceCard
        subTitle="With subtitle"
        title="Title"
        href="https://www.carbondesignsystem.com"
        {...args}
      >
        <img src={sketchIconPng} alt="Use markdown for images in mdx files. ![](img.png)" />
      </ResourceCard>
    </Column>
    <Column lg={4}>
      <ResourceCard
        title="Title"
        aspectRatio="2:1"
        actionIcon="arrowRight"
        href="https://www.carbondesignsystem.com"
        {...args}
      >
        <img src={sketchIconPng} alt="Use markdown for images in mdx files. ![](img.png)" />
      </ResourceCard>
    </Column>
    <Column lg={4}>
      <ResourceCard
        subTitle="With subtitle"
        title="Title"
        href="https://www.carbondesignsystem.com"
        {...args}
      >
        <img src={sketchIconPng} alt="Use markdown for images in mdx files. ![](img.png)" />
      </ResourceCard>
    </Column>
  </CardGroup>
)

export const Default = Template.bind({})
Default.args = {}
