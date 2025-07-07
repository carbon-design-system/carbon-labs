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
import {
  Header,
  HeaderGlobalBar,
  ContainedList,
  ContainedListItem,
} from '@carbon/react';
import {
  UserAvatar,
  User,
  IbmCloudKeyProtect,
  Group,
  Money,
  Logout,
} from '@carbon/icons-react';

import '../components/ui-shell.scss';
import {
  Profile as ProfileDirect,
  ProfileReadOnly,
  ProfileUserInfo,
} from '../components/Profile';

export default {
  title: 'Components/UIShell/Profile',
  component: ProfileDirect,
  subcomponents: {
    ProfileUserInfo,
    ProfileReadOnly,
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

/**
 * Story for Profile with read only items
 * @returns {React.ReactElement} The JSX for the story
 */
export const withReadOnly = () => {
  return (
    <Header aria-label="IBM Platform Name">
      <HeaderGlobalBar>
        <Profile.Root label="Profile" renderIcon={<UserAvatar size={20} />}>
          <Profile.UserInfo
            name="Thomas J. Watson"
            email="thomas.watson@ibm.com"
          />
          <Profile.ReadOnly
            items={[
              { label: 'Instance', title: 'APIC-MB-DEV' },
              { label: 'Instance owner', title: 'thomas.j.watson@ibm.com' },
              { label: 'Region', title: 'us-east-1 (N Virgina)' },
            ]}
          />
        </Profile.Root>
      </HeaderGlobalBar>
    </Header>
  );
};

/**
 * Story for Profile with read only items
 * @returns {React.ReactElement} The JSX for the story
 */
export const withLinks = () => {
  return (
    <Header aria-label="IBM Platform Name">
      <HeaderGlobalBar>
        <Profile.Root label="Profile" renderIcon={<UserAvatar size={20} />}>
          <Profile.UserInfo
            name="Thomas J. Watson"
            email="thomas.watson@ibm.com"
          />
          <ContainedList label="Profile links">
            <ContainedListItem
              renderIcon={User}
              onClick={() => (window.location.href = 'https://example.com')}>
              User profile
            </ContainedListItem>
            <ContainedListItem
              renderIcon={IbmCloudKeyProtect}
              onClick={() => (window.location.href = 'https://example.com')}>
              Access keys
            </ContainedListItem>
            <ContainedListItem
              renderIcon={Group}
              onClick={() => (window.location.href = 'https://example.com')}>
              User management
            </ContainedListItem>
            <ContainedListItem
              renderIcon={Money}
              onClick={() => (window.location.href = 'https://example.com')}>
              Plan and billing
            </ContainedListItem>
            <ContainedListItem
              renderIcon={Logout}
              onClick={() => (window.location.href = 'https://example.com')}>
              Log out
            </ContainedListItem>
          </ContainedList>
        </Profile.Root>
      </HeaderGlobalBar>
    </Header>
  );
};
