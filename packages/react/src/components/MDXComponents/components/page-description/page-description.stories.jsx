/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { PageDescription } from './page-description'

const stories = {
  title: 'MDX Components/PageDescription',
  component: PageDescription
}

export default stories

const Template = (args) => (
  <PageDescription {...args}>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean feugiat ex massa, in tincidunt
    ipsum tempor in. Maecenas ultrices sem nec blandit dictum. Fermentum ullamcorper pretium. Duis
    turpis elit.
  </PageDescription>
)

export const Default = Template.bind({})
Default.args = {}
