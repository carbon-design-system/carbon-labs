/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './TrialCountdown.mdx';

import {
  HeaderPopover,
  HeaderPopoverButton,
  HeaderPopoverContent,
} from '../components/HeaderPopover';

import { TrialCountdown } from '../components/TrialCountdown';
import { Header, Link, Button } from '@carbon/react';
import { ShoppingCart, Share, User } from '@carbon/icons-react';

import '../components/ui-shell.scss';

export default {
  title: 'Components/UIShell/TrialCountdown',
  component: TrialCountdown,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Story for TrialCountdown
 * @param {object} args Storybook args that control component props
 * @returns {React.ReactElement} The JSX for the story
 */
export const Default = (args) => (
  <Header aria-label="IBM Platform Name">
    <HeaderPopover align="bottom">
      <HeaderPopoverButton label="Trial Countdown" as={Button} kind="ghost">
        <TrialCountdown {...args} />
      </HeaderPopoverButton>
      <HeaderPopoverContent>
        <p>Your trial ends on May 13, 2025</p>
        <Link href="#" renderIcon={Share}>
          Invite team members
        </Link>
        <Link href="#" renderIcon={User}>
          Contact sales
        </Link>
        <Button size="sm" renderIcon={ShoppingCart}>
          Buy
        </Button>
      </HeaderPopoverContent>
    </HeaderPopover>
  </Header>
);

Default.args = {
  count: 30,
  text: 'Trial days left',
  warning: false,
};

Default.argTypes = {
  isSideNavExpanded: { table: { disable: true } },
  isSwitcherExpanded: { table: { disable: true } },
  render: { table: { disable: true } },
};
