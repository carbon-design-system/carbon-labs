/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import mdx from './HeaderOverflowPanel.mdx';
import { SideNav } from '../components/SideNav';
import { SideNavItems } from '../components/SideNavItems';
import { SideNavMenu } from '../components/SideNavMenu';
import { SideNavLink } from '../components/SideNavLink';
import { SideNavMenuItem } from '../components/SideNavMenuItem';
import { Profile } from '../index';
import { HeaderContainer } from '../components/HeaderContainer';
import { HeaderOverflowPanel } from '../components/HeaderOverflowPanel';
import { ThemeSettings, ThemeSwitcher } from '../../ThemeSettings';
import {
  SkipToContent,
  Header,
  HeaderName,
  HeaderMenuButton,
  SideNavDivider,
  HeaderGlobalBar,
  ExpandableSearch,
  Theme,
  ContainedList,
  ContainedListItem,
} from '@carbon/react';
import {
  Settings,
  Notification,
  Switcher as SwitcherIcon,
  UserAvatar,
  Help,
  User,
  IbmCloudKeyProtect,
  Group,
  Money,
  Logout,
  Launch,
  ChartCustom,
} from '@carbon/icons-react';

import '../components/ui-shell.scss';
import './UIShell.scss';
import { useMatchMedia } from '../internal/useMatchMedia';
import { breakpoints } from '@carbon/layout';
const smMediaQuery = `(max-width: ${breakpoints.md.width})`;

export default {
  title: 'Components/UIShell/HeaderOverflowPanel',
  component: HeaderOverflowPanel,
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
 * Story for UIShell
 * @returns {React.ReactElement} The JSX for the story
 */
export const Default = () => {
  const { themeSetting, setThemeSetting, themeHeader } = useThemeSettings();

  const isSm = useMatchMedia(smMediaQuery);

  return (
    <Theme theme={themeHeader}>
      <HeaderContainer
        themeSetting={themeSetting}
        render={({
          isSideNavExpanded,
          onClickSideNavExpand,
          isProfileExpanded,
          onClickProfileExpand,
        }) => (
          <Header aria-label="IBM Platform Name">
            <SkipToContent />
            <HeaderMenuButton
              aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
              aria-expanded={isSideNavExpanded}
              isCollapsible //shows menu at desktop
              renderMenuIcon={<SwitcherIcon size={20} />}
            />
            <HeaderName href="#" prefix="IBM">
              [Platform]
            </HeaderName>

            <HeaderGlobalBar>
              <ExpandableSearch
                size="lg"
                labelText="Search"
                closeButtonLabelText="Clear search input"
                id="search-expandable-1"
              />
              <HeaderOverflowPanel label="Options">
                <SideNav
                  isTreeview
                  isFixedNav
                  expanded
                  isChildOfHeader={false}
                  aria-label="Header navigation"
                  headerOverflowPanel>
                  <SideNavItems>
                    {isSm && (
                      <SideNavMenu
                        renderIcon={UserAvatar}
                        title="Profile"
                        primary
                        backButtonTitle="Back">
                        <Profile.UserInfo
                          name="Ruth Leach"
                          email="ruth.leach@ibm.com"
                        />
                        <ThemeSettings legendText="Theme">
                          <ThemeSwitcher
                            lowContrast
                            size="sm"
                            value={themeSetting}
                            onChange={setThemeSetting}
                          />
                        </ThemeSettings>
                        <Profile.ReadOnly items={readOnlyItems} />
                        <ContainedList label="Profile links">
                          <ContainedListItem
                            renderIcon={User}
                            onClick={() =>
                              (window.location.href = 'https://example.com')
                            }>
                            User profile
                          </ContainedListItem>
                          <ContainedListItem
                            renderIcon={IbmCloudKeyProtect}
                            onClick={() =>
                              (window.location.href = 'https://example.com')
                            }>
                            Access keys
                          </ContainedListItem>
                          <ContainedListItem
                            renderIcon={Group}
                            onClick={() =>
                              (window.location.href = 'https://example.com')
                            }>
                            User management
                          </ContainedListItem>
                          <ContainedListItem
                            renderIcon={Money}
                            onClick={() =>
                              (window.location.href = 'https://example.com')
                            }>
                            Plan and billing
                          </ContainedListItem>
                          <ContainedListItem
                            renderIcon={Logout}
                            onClick={() =>
                              (window.location.href = 'https://example.com')
                            }>
                            Log out
                          </ContainedListItem>
                        </ContainedList>
                      </SideNavMenu>
                    )}
                    <SideNavMenu
                      renderIcon={Settings}
                      primary
                      title="Settings"
                      backButtonTitle="Back">
                      <SideNavDivider />
                      <SideNavMenuItem renderIcon={ChartCustom} href="#">
                        Customize
                        <Launch />
                      </SideNavMenuItem>
                    </SideNavMenu>
                    <SideNavLink renderIcon={Notification} href="#">
                      Notifications
                      <Launch />
                    </SideNavLink>
                    <SideNavLink renderIcon={Help} href="#">
                      Help
                      <Launch />
                    </SideNavLink>
                    <SideNavLink renderIcon={ChartCustom} href="#">
                      Custom action
                      <Launch />
                    </SideNavLink>
                    {isSm && (
                      <>
                        <SideNavDivider />
                        <SideNavLink renderIcon={Logout} href="#">
                          Logout
                        </SideNavLink>
                      </>
                    )}
                  </SideNavItems>
                </SideNav>
              </HeaderOverflowPanel>
              <Profile.Root
                open={isProfileExpanded}
                onClick={onClickProfileExpand}
                label="Profile"
                renderIcon={<UserAvatar size={20} />}>
                <Profile.UserInfo
                  name="Ruth Leach"
                  email="ruth.leach@ibm.com"
                />
                <ThemeSettings legendText="Theme">
                  <ThemeSwitcher
                    lowContrast
                    size="sm"
                    value={themeSetting}
                    onChange={setThemeSetting}
                  />
                </ThemeSettings>
                <Profile.ReadOnly items={readOnlyItems} />
                <ContainedList label="Profile links">
                  <ContainedListItem
                    renderIcon={User}
                    onClick={() =>
                      (window.location.href = 'https://example.com')
                    }>
                    User profile
                  </ContainedListItem>
                  <ContainedListItem
                    renderIcon={IbmCloudKeyProtect}
                    onClick={() =>
                      (window.location.href = 'https://example.com')
                    }>
                    Access keys
                  </ContainedListItem>
                  <ContainedListItem
                    renderIcon={Group}
                    onClick={() =>
                      (window.location.href = 'https://example.com')
                    }>
                    User management
                  </ContainedListItem>
                  <ContainedListItem
                    renderIcon={Money}
                    onClick={() =>
                      (window.location.href = 'https://example.com')
                    }>
                    Plan and billing
                  </ContainedListItem>
                  <ContainedListItem
                    renderIcon={Logout}
                    onClick={() =>
                      (window.location.href = 'https://example.com')
                    }>
                    Log out
                  </ContainedListItem>
                </ContainedList>
              </Profile.Root>
            </HeaderGlobalBar>
          </Header>
        )}
      />
    </Theme>
  );
};

Default.parameters = {
  controls: { disable: true },
  actions: { disable: true },
};
