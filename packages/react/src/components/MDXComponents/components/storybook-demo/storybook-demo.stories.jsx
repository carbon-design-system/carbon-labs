/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { StorybookDemo } from './storybook-demo';

export default {
  title: 'Components/MDX Components/StorybookDemo',
  component: StorybookDemo,
  argTypes: {
    fluid: {
      control: 'boolean',
      description: 'Use FluidDropdown instead of regular Dropdown',
    },
    themeSelector: {
      control: 'boolean',
      description: 'Display theme selector dropdown',
    },
    wide: {
      control: 'boolean',
      description: 'Span 12 columns width',
    },
    tall: {
      control: 'boolean',
      description: 'Increase demo height',
    },
  },
};

const variants = [
  {
    label: 'Button',
    variant: 'components-button--default',
  },
  {
    label: 'Secondary',
    variant: 'components-button--secondary',
  },
  {
    label: 'Tertiary',
    variant: 'components-button--tertiary',
  },
  {
    label: 'Ghost',
    variant: 'components-button--ghost',
  },
  {
    label: 'Danger',
    variant: 'components-button--danger',
  },
  {
    label: 'Icon button',
    variant: 'components-button--icon-button',
  },
  {
    label: 'Set of buttons',
    variant: 'components-button--set-of-buttons',
  },
  {
    label: 'Skeleton',
    variant: 'components-button--skeleton',
  },
];

const Template = (args) => (
  <StorybookDemo
    {...args}
    url="https://react.carbondesignsystem.com"
    variants={variants}
  />
);

export const Default = Template.bind({});
Default.args = {
  themeSelector: true,
  wide: false,
  tall: false,
  fluid: false,
};

export const WithFluidDropdown = Template.bind({});
WithFluidDropdown.args = {
  themeSelector: true,
  wide: true,
  tall: true,
  fluid: true,
};
