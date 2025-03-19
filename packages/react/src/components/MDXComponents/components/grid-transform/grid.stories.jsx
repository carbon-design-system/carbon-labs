/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { Column } from './column'
import { Grid } from './grid'
import { Row } from './row'

export default {
  title: 'MDX Components/Grid',
  component: Grid,
  argTypes: {
    children: {
      control: false
    },
    className: {
      control: false
    }
  }
}

const Template = () => (
  <Grid>
    <Column sm={4} md={4} lg={4}>
      Span 4
    </Column>
    <Column sm={4} md={4} lg={4}>
      Span 4
    </Column>
    <Column sm={4} md={4} lg={4}>
      Span 4
    </Column>
    <Column sm={4} md={4} lg={4}>
      Span 4
    </Column>
  </Grid>
)

const GatsbyTemplate = () => (
  <Row>
    <Column sm={4} md={4} lg={4}>
      Span 4
    </Column>
    <Column sm={4} md={4} lg={4}>
      Span 4
    </Column>
    <Column sm={4} md={4} lg={4}>
      Span 4
    </Column>
    <Column sm={4} md={4} lg={4}>
      Span 4
    </Column>
  </Row>
)

export const Default = Template.bind({})
Default.args = {}

export const Gatsby = GatsbyTemplate.bind({});