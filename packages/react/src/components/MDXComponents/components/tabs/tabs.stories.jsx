/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { Tab } from './tab'
import { Tabs } from './tabs'

export default {
  title: 'MDX Components/Tabs',
  component: Tabs,
  subcomponents: { Tab }
}

const Template = (args) => (
  <Tabs {...args}>
    <Tab label="Tab 1">
      Maecenas ultrices sem nec blandit dictum. ermentum ullamcorper pretium. Duis turpis elit,
      facilisis nec elit id, fermentum porttitor nisl. Nulla dignissim euismod maximus. Cras euismod
      facilisis rutrum. Etiam nisi sem, malesuada auctor pretium vel, ullamcorper sed mi. In hac
      habitasse platea dictumst.
    </Tab>
    <Tab label="Tab 2">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean feugiat ex massa, in tincidunt
      ipsum tempor in. Maecenas ultrices sem nec blandit dictum. ermentum ullamcorper pretium. Duis
      turpis elit, facilisis nec elit id, fermentum porttitor nisl. Nulla dignissim euismod maximus.
      Cras euismod facilisis rutrum.
    </Tab>
    <Tab label="Tab 3">
      Duis turpis elit, facilisis nec elit id, fermentum porttitor nisl. Nulla dignissim euismod
      maximus. Cras euismod facilisis rutrum. Etiam nisi sem, malesuada auctor pretium vel,
      ullamcorper sed mi. In hac habitasse platea dictumst. Lorem ipsum dolor sit amet, consectetur
      adipiscing elit. Aenean feugiat ex massa, in tincidunt ipsum tempor in.
    </Tab>
  </Tabs>
)

export const Default = Template.bind({})
Default.args = {}
