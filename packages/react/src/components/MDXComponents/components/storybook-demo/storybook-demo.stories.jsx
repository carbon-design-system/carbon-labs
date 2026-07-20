/* eslint-disable react/forbid-dom-props */
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
  fluid: false,
  lazy: false,
};

export const WithFluidDropdown = Template.bind({});
WithFluidDropdown.args = {
  themeSelector: true,
  wide: true,
  tall: true,
  fluid: true,
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

/**
 * Scroll down to see the StorybookDemo iframe below the fold.
 * Uses the Actionable Notification component (which contains interactive
 * action buttons) to make the tabIndex="-1" test meaningful — Tab through
 * the page and confirm focus jumps over the entire iframe, skipping the
 * notification's own action buttons inside it.
 */
export const TabIndexTest = (args) => (
  <div>
    <div
      // eslint-disable-next-line react/forbid-dom-props
      style={{
        height: '110vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px dashed #8d8d8d',
      }}>
      <p style={{ fontFamily: 'sans-serif', color: '#525252' }}>
        ↓ Scroll down — the StorybookDemo iframe is below this spacer. The
        iframe embeds an Actionable Notification (which has focusable action
        buttons inside it). Tab through the page to confirm the iframe and all
        its inner focusable elements are skipped in the tab order.
      </p>
    </div>
    <StorybookDemo
      {...args}
      url="https://react.carbondesignsystem.com"
      variants={actionableNotificationVariants}
    />
  </div>
);
TabIndexTest.args = {
  themeSelector: true,
  wide: false,
  tall: false,
  fluid: false,
  lazy: true,
};
TabIndexTest.storyName = 'Tab index test (iframe below fold)';

const popoverVariants = [
  {
    label: 'Experimental auto-align',
    variant: 'components-popover--experimental-auto-align',
  },
];

/**
 * Scroll down to see the StorybookDemo iframe below the fold.
 * Uses the Popover (experimental-auto-align) story which opens and focuses
 * inside the popover on mount — the same focus-stealing problem as
 * ActionableNotification. Confirm the page does not scroll to the iframe
 * and that focus stays in the host document.
 */
export const TabIndexTestPopover = (args) => (
  <div>
    <div
      // eslint-disable-next-line react/forbid-dom-props
      style={{
        height: '110vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px dashed #8d8d8d',
      }}>
      <p style={{ fontFamily: 'sans-serif', color: '#525252' }}>
        ↓ Scroll down — the StorybookDemo iframe is below this spacer. The
        iframe embeds a Popover (experimental auto-align) which focuses inside
        the popover on mount. Confirm the page does not scroll to the iframe and
        that focus stays in the host document.
      </p>
    </div>
    <StorybookDemo
      {...args}
      url="https://react.carbondesignsystem.com"
      variants={popoverVariants}
    />
  </div>
);
TabIndexTestPopover.args = {
  themeSelector: true,
  wide: false,
  tall: true,
  fluid: false,
  lazy: true,
};
TabIndexTestPopover.storyName = 'Tab index test — popover (iframe below fold)';

/**
 * Same 110vh spacer pattern but uses plain Button variants — no lazy:true flag.
 * The iframe should load immediately when the page renders (not deferred),
 * confirming that lazy loading does not leak onto components that have not
 * opted in.
 *
 * How to verify:
 * 1. Open this story.
 * 2. Check the Network tab — the iframe src should be set on first paint,
 *    before you scroll at all.
 * 3. Scroll down — the Button iframe should already be loaded and visible
 *    with no delay.
 */
export const NoLazyLeakTest = (args) => (
  <div>
    <div
      // eslint-disable-next-line react/forbid-dom-props
      style={{
        height: '110vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px dashed #8d8d8d',
      }}>
      <p style={{ fontFamily: 'sans-serif', color: '#525252' }}>
        ↓ Scroll down — the Button iframe below has no lazy:true flag. It should
        already be loaded before you get here (check the Network tab). Lazy
        loading must not leak onto variants that have not opted in.
      </p>
    </div>
    <StorybookDemo
      {...args}
      url="https://react.carbondesignsystem.com"
      variants={variants}
    />
  </div>
);
NoLazyLeakTest.args = {
  themeSelector: true,
  wide: false,
  tall: false,
  fluid: false,
  lazy: false,
};
NoLazyLeakTest.storyName = 'No lazy leak test — button (iframe below fold)';
