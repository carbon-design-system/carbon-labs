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
    lazy: {
      control: 'boolean',
      description: 'Defer iframe loading until it enters the viewport',
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
  lazy: false,
};

const actionableNotificationVariants = [
  {
    label: 'Default',
    variant: 'components-notifications-actionable--default',
  },
  {
    label: 'Low contrast',
    variant: 'components-notifications-actionable--low-contrast',
  },
];

/* eslint-disable react/forbid-dom-props */
/**
 * Scroll down to see the StorybookDemo iframe below the fold.
 * With lazy=true the iframe src is only set once the "full demo" Link at the
 * bottom of the component enters the viewport — by that point the page is
 * already scrolled to the demo, so focus-stealing stories can't cause a jump.
 */
export const LazyLoadTest = (args) => (
  <div>
    <div
      style={{
        height: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px dashed #8d8d8d',
      }}>
      <p style={{ fontFamily: 'sans-serif', color: '#525252' }}>
        ↓ Scroll down — the StorybookDemo iframe is below this spacer. With
        lazy=true the iframe src should only be set once the component is fully
        in view. Check the Network tab before scrolling to confirm.
      </p>
    </div>
    <StorybookDemo
      {...args}
      url="https://react.carbondesignsystem.com"
      variants={actionableNotificationVariants}
    />
  </div>
);
/* eslint-enable react/forbid-dom-props */
LazyLoadTest.args = {
  themeSelector: true,
  wide: false,
  tall: false,
  lazy: true,
};
LazyLoadTest.storyName = 'Lazy load test (iframe below fold)';
