/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react'
import { Column } from '@carbon/react'

import { CardGroup } from './card-group'
import { ResourceCard } from '../resource-card/resource-card'
import sketchIconPng from './sketch-icon.png'

export default {
  title: 'MDX Components/Cards/CardGroup',
  component: CardGroup,
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
        <img src={sketchIconPng} alt="sketch" />
      </ResourceCard>
    </Column>
    <Column lg={4}>
      <ResourceCard
        subTitle="With subtitle"
        title="Title"
        href="https://www.carbondesignsystem.com"
        {...args}
      >
        <img src={sketchIconPng} alt="sketch" />
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
        <img src={sketchIconPng} alt="sketch" />
      </ResourceCard>
    </Column>
    <Column lg={4}>
      <ResourceCard
        subTitle="With subtitle"
        title="Title"
        href="https://www.carbondesignsystem.com"
        {...args}
      >
        <img src={sketchIconPng} alt="sketch" />
      </ResourceCard>
    </Column>
  </CardGroup>
)

export const Default = Template.bind({})
Default.args = {}
