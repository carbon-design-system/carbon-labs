/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import mdx from './Profile.mdx';

import { Profile } from '../index';
import {
  Header,
  HeaderGlobalBar,
  ContainedList,
  ContainedListItem,
  Theme,
} from '@carbon/react';
import {
  UserAvatar,
  User,
  IbmCloudKeyProtect,
  Group,
  Money,
  Logout,
} from '@carbon/icons-react';
import { ThemeSettings, ThemeSwitcher } from '../../ThemeSettings';

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

const readOnlyItems = [
  { label: 'Instance', title: 'APIC-MB-DEV' },
  { label: 'Instance owner', title: 'ruth.leach@ibm.com' },
  { label: 'Region', title: 'us-east-1 (N Virginia)' },
];

/**
 *
 */
function useThemeSettings() {
  const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

  const [themeSetting, setThemeSetting] = useState('system');
  const [themeMenuComplement] = useState(false);
  const [themeSet] = useState('white/g100');
  const [systemDark, setSystemDark] = useState(mediaQueryList.matches);
  const [currentTheme, setCurrentTheme] = useState('white');
  const [themeHeader, setThemeHeader] = useState('g100');

  useEffect(() => {
    /**
     *
     * @param {MediaQueryListEvent} event - The media query change event object.
     */
    const handleMediaQueryEvent = (event) => {
      setSystemDark(event.matches);
    };

    mediaQueryList.addEventListener('change', handleMediaQueryEvent);
    return () =>
      mediaQueryList.removeEventListener('change', handleMediaQueryEvent);
  }, [mediaQueryList]);

  /**
   *
   */
  useEffect(() => {
    const [lightTheme, darkTheme] = themeSet.split('/');

    if (themeSetting === 'system') {
      setCurrentTheme(systemDark ? darkTheme : lightTheme);
      setThemeHeader(
        (systemDark && !themeMenuComplement) ||
          (!systemDark && themeMenuComplement)
          ? darkTheme
          : lightTheme
      );
    } else if (themeSetting === 'light') {
      setCurrentTheme(lightTheme);
      setThemeHeader(themeMenuComplement ? darkTheme : lightTheme);
    } else {
      setCurrentTheme(darkTheme);
      setThemeHeader(themeMenuComplement ? lightTheme : darkTheme);
    }
  }, [systemDark, themeSetting, themeMenuComplement, themeSet]);

  return {
    themeSetting,
    setThemeSetting,
    themeHeader,
    currentTheme,
  };
}

/**
 *
 * @param {{ children: React.ReactNode }} props - The children
 * @returns {JSX.Element} The rendered BaseProfile component.
 */
const BaseProfile = ({ children }) => (
  <Header aria-label="IBM Platform Name">
    <HeaderGlobalBar>
      <Profile.Root label="Profile" renderIcon={<UserAvatar size={20} />}>
        <Profile.UserInfo name="Ruth Leach" email="ruth.leach@ibm.com" />
        {children}
      </Profile.Root>
    </HeaderGlobalBar>
  </Header>
);

/**
 * Story for Profile
 * @returns {React.ReactElement} The JSX for the story
 */
export const Default = () => {
  return <BaseProfile></BaseProfile>;
};

/**
 * Story for Profile with read only items
 * @returns {React.ReactElement} The JSX for the story
 */
export const withReadOnly = () => (
  <BaseProfile>
    <Profile.ReadOnly items={readOnlyItems} />
  </BaseProfile>
);

/**
 * Story for Profile with theme switcher.
 * @returns {React.ReactElement} The rendered story with theme controls and profile layout.
 */
export const WithThemeSwitcher = () => {
  const { themeSetting, setThemeSetting, themeHeader, currentTheme } =
    useThemeSettings();

  return (
    <Theme theme={themeHeader}>
      <Theme
        as="main"
        className="theme-setting-in-context__main"
        theme={currentTheme}>
        <BaseProfile>
          <ThemeSettings legendText="Theme">
            <ThemeSwitcher
              lowContrast
              size="sm"
              value={themeSetting}
              onChange={setThemeSetting}
            />
          </ThemeSettings>
        </BaseProfile>
      </Theme>
    </Theme>
  );
};

/**
 * Story for Profile with links
 * @returns {React.ReactElement} The JSX for the story
 */
export const withLinks = () => {
  return (
    <Header aria-label="IBM Platform Name">
      <HeaderGlobalBar>
        <Profile.Root label="Profile" renderIcon={<UserAvatar size={20} />}>
          <Profile.UserInfo name="Ruth Leach" email="ruth.leach@ibm.com" />
          <ContainedList>
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
