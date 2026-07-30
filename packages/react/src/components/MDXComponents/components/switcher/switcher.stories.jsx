/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Switcher, SwitcherDivider, SwitcherLink } from './switcher';

export default {
  title: 'Components/MDX Components/Switcher',
  component: Switcher,
  subcomponents: { SwitcherDivider, SwitcherLink },
  argTypes: {
    children: {
      control: false,
    },
    isOpen: {
      control: 'boolean',
    },
    onToggle: {
      control: false,
    },
  },
};

const Template = (args) => <Switcher {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
};
Default.storyName = 'Default (with default links)';

export const CustomLinks = (args) => (
  <Switcher {...args}>
    <SwitcherDivider>Design Systems</SwitcherDivider>
    <SwitcherLink href="https://www.carbondesignsystem.com/">
      Carbon Design System
    </SwitcherLink>
    <SwitcherLink href="https://ibm.com/design/language">
      IBM Design Language
    </SwitcherLink>
    <SwitcherDivider>IBM Internal</SwitcherDivider>
    <SwitcherLink href="https://ibm.com/brand" isInternal>
      IBM Brand Center
    </SwitcherLink>
    <SwitcherLink href="https://w3.ibm.com/design/" isInternal>
      IBM Design
    </SwitcherLink>
    <SwitcherDivider>States</SwitcherDivider>
    <SwitcherLink disabled href="https://www.example.com">
      Disabled link
    </SwitcherLink>
  </Switcher>
);
CustomLinks.args = {
  isOpen: true,
};
CustomLinks.storyName = 'Custom links';
