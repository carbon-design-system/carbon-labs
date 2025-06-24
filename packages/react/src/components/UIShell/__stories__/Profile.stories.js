/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './Profile.mdx';

import { Profile } from '../index';
import { Header, HeaderGlobalBar } from '@carbon/react';
import { UserAvatar } from '@carbon/icons-react';

import '../components/ui-shell.scss';
import {
  Profile as ProfileDirect,
  ProfileUserInfo,
} from '../components/Profile';

export default {
  title: 'Components/UIShell/Profile',
  component: ProfileDirect,
  subcomponents: {
    ProfileUserInfo,
  },
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Story for Profile
 * @returns {React.ReactElement} The JSX for the story
 */
export const Default = () => {
  return (
    <Header aria-label="IBM Platform Name">
      <HeaderGlobalBar>
        <Profile.Root label="Profile" renderIcon={<UserAvatar size={20} />}>
          <Profile.UserInfo
            name="Thomas J. Watson"
            email="thomas.watson@ibm.com"
          />
        </Profile.Root>
      </HeaderGlobalBar>
    </Header>
  );
};
