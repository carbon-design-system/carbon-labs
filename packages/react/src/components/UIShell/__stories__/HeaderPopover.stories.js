/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './HeaderPopover.mdx';

import {
  HeaderPopover,
  HeaderPopoverActions,
  HeaderPopoverButton,
  HeaderPopoverContent,
} from '../components/HeaderPopover';

import { Header, HeaderGlobalBar, Link, Button } from '@carbon/react';
import { Fade } from '@carbon/icons-react';

import '../components/ui-shell.scss';

export default {
  title: 'Components/UIShell/HeaderPopover',
  component: HeaderPopover,
  subcomponents: {
    HeaderPopoverActions,
    HeaderPopoverButton,
    HeaderPopoverContent,
  },
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Story for HeaderPopover
 * @param {object} args Storybook args that control component props
 * @returns {React.ReactElement} The JSX for the story
 */
export const Default = (args) => (
  <Header aria-label="IBM Platform Name">
    <HeaderGlobalBar>
      <HeaderPopover {...args}>
        <HeaderPopoverButton align="bottom" label="Profile">
          <Fade size={20} />
        </HeaderPopoverButton>
        <HeaderPopoverContent>
          <p>
            Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut fsil labore et dolore magna aliqua.
          </p>
          <HeaderPopoverActions>
            <Link href="#">Link action</Link>
            <Button size="sm">Button</Button>
          </HeaderPopoverActions>
        </HeaderPopoverContent>
      </HeaderPopover>
    </HeaderGlobalBar>
  </Header>
);

Default.args = {
  dropShadow: true,
  highContrast: false,
  open: true,
  align: 'bottom-end',
  backgroundToken: 'background',
  border: true,
};

Default.argTypes = {
  isSideNavExpanded: { table: { disable: true } },
  isSwitcherExpanded: { table: { disable: true } },
  render: { table: { disable: true } },
  dropShadow: {
    control: {
      type: 'boolean',
    },
  },
  highContrast: {
    control: {
      type: 'boolean',
    },
  },
  open: {
    control: {
      type: 'boolean',
    },
  },
  border: {
    control: {
      type: 'boolean',
    },
  },
  align: {
    options: [
      'top',
      'top-start',
      'top-end',

      'bottom',
      'bottom-start',
      'bottom-end',

      'left',
      'left-end',
      'left-start',

      'right',
      'right-end',
      'right-start',
    ],
    control: {
      type: 'select',
    },
  },
};
