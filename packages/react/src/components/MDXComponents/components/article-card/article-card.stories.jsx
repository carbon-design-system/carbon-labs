/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react'
import { Column, Grid } from '@carbon/react'

import { ArticleCard } from './article-card'
import article06 from './article06.png'

const stories = {
  title: 'MDX Components/Cards/ArticleCard',
  component: ArticleCard,
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
  <Grid narrow>
    <Column lg={4}>
      <ArticleCard
        subTitle="Sub title"
        title="Title"
        author="Author"
        date="July 4, 1975"
        readTime="Read time: 5 min"
        href="/"
        {...args}
      >
        <img src={article06} alt="Use markdown for images in mdx files. ![](img.png)" />
      </ArticleCard>
    </Column>
  </Grid>
)

export const Default = Template.bind({})
Default.args = {}
