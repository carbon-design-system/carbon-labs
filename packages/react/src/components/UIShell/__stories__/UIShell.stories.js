/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, useRef } from 'react';
import mdx from './UIShell.mdx';
import { SIDE_NAV_TYPE, SideNav } from '../components/SideNav';
import { SideNavItems } from '../components/SideNavItems';
import { SideNavMenu } from '../components/SideNavMenu';
import { SideNavMenuItem } from '../components/SideNavMenuItem';
import { SideNavLink } from '../components/SideNavLink';
import { SideNavSlot } from '../components/SideNavSlot';
import { SideNavTitle } from '../components/SideNavTitle';
import { Profile } from '../index';
import {
  HeaderPopover,
  HeaderPopoverActions,
  HeaderPopoverButton,
  HeaderPopoverContent,
} from '../components/HeaderPopover';
import { HeaderContainer } from '../components/HeaderContainer';
import { HeaderDivider } from '../components/HeaderDivider';
import { TrialCountdown } from '../components/TrialCountdown';
import { HeaderOverflowPanel } from '../components/HeaderOverflowPanel';
import { ThemeSettings, ThemeSwitcher } from '../../ThemeSettings';
import {
  SkipToContent,
  Header,
  HeaderName,
  HeaderMenuButton,
  SideNavDivider,
  Content,
  Grid,
  Column,
  HeaderGlobalBar,
  HeaderGlobalAction,
  MenuButton,
  MenuItemRadioGroup,
  ExpandableSearch,
  Link,
  Button,
  Dropdown,
  Theme,
  ContainedList,
  ContainedListItem,
} from '@carbon/react';
import {
  Dashboard,
  DataAnalytics,
  Home,
  Settings,
  OverflowMenuVertical,
  DocumentMultiple_01,
  Security,
  Layers,
  BusinessProcesses,
  Application,
  Platforms,
  EventIncident,
  WorkflowAutomation,
  Notification,
  Switcher as SwitcherIcon,
  SquareOutline,
  UserAvatar,
  Help,
  ShoppingCart,
  Share,
  User,
  VirtualColumnKey,
  IbmCloudKeyProtect,
  Group,
  Money,
  Logout,
  Launch,
  ChartCustom,
} from '@carbon/icons-react';

import {
  CarbonIBMDotCom,
  CarbonDesignSystem,
  CarbonforIBMProducts,
  IBMTelemetry,
} from './AppIcons';

import '../components/ui-shell.scss';
import './UIShell.scss';
import { useMatchMedia } from '../internal/useMatchMedia';
import { breakpoints } from '@carbon/layout';
const smMediaQuery = `(max-width: ${breakpoints.md.width})`;

export default {
  title: 'Components/UIShell',
  component: HeaderDivider,
  subcomponents: {
    HeaderDivider,
    HeaderOverflowPanel,
    HeaderPopover,
    HeaderPopoverActions,
    HeaderPopoverButton,
    HeaderPopoverContent,
    SideNav,
    SideNavItems,
    SideNavLink,
    SideNavMenu,
    SideNavMenuItem,
    SideNavSlot,
    TrialCountdown,
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
 * Story content
 * @returns {React.ReactElement} The JSX for the story
 */
const StoryContent = () => (
  <Grid align="start">
    <Column sm={4} md={8} lg={12}>
      <h2 style={{ margin: '0 0 30px 0' }}>Purpose and function</h2>
      <p>
        The shell is perhaps the most crucial piece of any UI built with {''}
        <a href="www.carbondesignsystem.com">Carbon</a>. It contains the shared
        navigation framework for the entire design system and ties the products
        in IBM’s portfolio together in a cohesive and elegant way. The shell is
        the home of the topmost navigation, where users can quickly and
        dependably gain their bearings and move between pages.
        <br />
        <br />
        The shell was designed with maximum flexibility built in, to serve the
        needs of a broad range of products and users. Adopting the shell ensures
        compliance with IBM design standards, simplifies development efforts,
        and provides great user experiences. All IBM products built with Carbon
        are required to use the shell’s header.
        <br />
        <br />
        To better understand the purpose and function of the UI shell, consider
        the “shell” of MacOS, which contains the Apple menu, top-level
        navigation, and universal, OS-level controls at the top of the screen,
        as well as a universal dock along the bottom or side of the screen. The
        Carbon UI shell is roughly analogous in function to these parts of the
        Mac UI. For example, the app switcher portion of the shell can be
        compared to the dock in MacOS.
      </p>
      <h2 style={{ margin: '30px 0' }}>Header responsive behavior</h2>
      <p>
        As a header scales down to fit smaller screen sizes, headers with
        persistent side nav menus should have the side nav collapse into
        “hamburger” menu. See the example to better understand responsive
        behavior of the header.
      </p>
      <h2 style={{ margin: '30px 0' }}>Secondary navigation</h2>
      <p>
        The side-nav contains secondary navigation and fits below the header. It
        can be configured to be either fixed-width or flexible, with only one
        level of nested items allowed. Both links and category lists can be used
        in the side-nav and may be mixed together. There are several
        configurations of the side-nav, but only one configuration should be
        used per product section. If tabs are needed on a page when using a
        side-nav, then the tabs are secondary in hierarchy to the side-nav.
      </p>
      <h2 style={{ margin: '30px 0' }}>Secondary navigation</h2>
      <p>
        The side-nav contains secondary navigation and fits below the header. It
        can be configured to be either fixed-width or flexible, with only one
        level of nested items allowed. Both links and category lists can be used
        in the side-nav and may be mixed together. There are several
        configurations of the side-nav, but only one configuration should be
        used per product section. If tabs are needed on a page when using a
        side-nav, then the tabs are secondary in hierarchy to the side-nav.
      </p>
    </Column>
    <Column sm={4} md={8} lg={4}>
      <h3 style={{ margin: '0 0 30px 0' }}>Secondary navigation</h3>
      <p>
        The side-nav contains secondary navigation and fits below the header. It
        can be configured to be either fixed-width or flexible, with only one
        level of nested items allowed. Both links and category lists can be used
        in the side-nav and may be mixed together. There are several
        configurations of the side-nav, but only one configuration should be
        used per product section. If tabs are needed on a page when using a
        side-nav, then the tabs are secondary in hierarchy to the side-nav.
      </p>
    </Column>
  </Grid>
);

/**
 *
 * @param {boolean} isSm - Indicates whether the viewport is small.
 * @param {string} themeSetting - The current theme setting.
 * @param {(theme: string) => void} setThemeSetting - Function to update the theme setting.
 * @returns {JSX.Element} The rendered HeaderOverflowPanel component.
 */
const headerOverflowPanel = (isSm, themeSetting, setThemeSetting) => (
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
            <Profile.UserInfo name="Ruth Leach" email="ruth.leach@ibm.com" />
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
);

/**
 * Story for UIShell
 * @returns {React.ReactElement} The JSX for the story
 */
export const Demo = () => {
  const headerRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const { themeSetting, setThemeSetting, themeHeader, currentTheme } =
    useThemeSettings();

  const options = {
    Fruits: ['Apple', 'Banana', 'Orange'],
    Vegetables: ['Carrot', 'Broccoli', 'Spinach'],
    Animals: ['Cat', 'Dog', 'Snake'],
  };

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
          <>
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
              <HeaderPopover align="bottom">
                <HeaderPopoverButton
                  label="Trial Countdown"
                  as={Button}
                  kind="ghost">
                  <TrialCountdown count={30} className="hide-at-md" />
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
              <HeaderGlobalBar>
                <ExpandableSearch
                  size="lg"
                  labelText="Search"
                  closeButtonLabelText="Clear search input"
                  id="search-expandable-1"
                />
                <HeaderGlobalAction
                  className="hide-at-md"
                  aria-label="Custom action"
                  tooltipHighContrast={false}>
                  <SquareOutline size={20} />
                </HeaderGlobalAction>
                <HeaderPopover align="bottom-end" className="hide-at-md">
                  <HeaderPopoverButton align="bottom" label="Help">
                    <Help size={20} />
                  </HeaderPopoverButton>
                  <HeaderPopoverContent>
                    <p>
                      Lorem ipsum dolor sit amet, di os consectetur adipiscing
                      elit, sed do eiusmod tempor incididunt ut fsil labore et
                      dolore magna aliqua.
                    </p>
                    <HeaderPopoverActions>
                      <Link href="#">Link action</Link>
                      <Button size="sm">Button</Button>
                    </HeaderPopoverActions>
                  </HeaderPopoverContent>
                </HeaderPopover>
                <HeaderPopover align="bottom-end" className="hide-at-md">
                  <HeaderPopoverButton align="bottom" label="Notifications">
                    <Notification size={20} />
                  </HeaderPopoverButton>
                  <HeaderPopoverContent>
                    <p>
                      Lorem ipsum dolor sit amet, di os consectetur adipiscing
                      elit, sed do eiusmod tempor incididunt ut fsil labore et
                      dolore magna aliqua.
                    </p>
                    <HeaderPopoverActions>
                      <Link href="#">Link action</Link>
                      <Button size="sm">Button</Button>
                    </HeaderPopoverActions>
                  </HeaderPopoverContent>
                </HeaderPopover>
                <HeaderDivider className="hide-at-md" />
                <MenuButton
                  className="hide-at-md"
                  menuTarget={headerRef.current}
                  kind="ghost"
                  menuBackgroundToken="background"
                  menuBorder
                  label={selectedCategory || 'Select Category'}>
                  <MenuItemRadioGroup
                    label="Category"
                    items={Object.keys(options)}
                    selectedItem={selectedCategory || null}
                    onChange={(newCategory) => {
                      setSelectedCategory(newCategory);
                      setSelectedItem('');
                    }}
                  />
                </MenuButton>
                <MenuButton
                  className="hide-at-md"
                  menuTarget={headerRef.current}
                  kind="ghost"
                  menuBackgroundToken="background"
                  menuBorder
                  label={selectedItem || 'Select Item'}
                  disabled={!selectedCategory}>
                  <MenuItemRadioGroup
                    label="Items"
                    items={selectedCategory ? options[selectedCategory] : []}
                    selectedItem={selectedItem || null}
                    onChange={(newItem) => setSelectedItem(newItem)}
                  />
                </MenuButton>
                <HeaderDivider className="hide-at-md" />
                {headerOverflowPanel(isSm, themeSetting, setThemeSetting)}

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
                  <ContainedList>
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

            <SideNav
              isTreeview={true}
              aria-label="Main navigation"
              expanded={isSideNavExpanded}
              onSideNavBlur={onClickSideNavExpand}
              isCollapsible
              onOverlayClick={onClickSideNavExpand}
              className="nav--global">
              <SideNavItems>
                <SideNavMenu
                  renderIcon={CarbonDesignSystem}
                  title="Product 1"
                  primary
                  defaultExpanded>
                  <SideNavSlot renderIcon={VirtualColumnKey}>
                    <Dropdown
                      aria-label="Choose an option"
                      id="default"
                      size="sm"
                      itemToString={(item) => (item ? item.text : '')}
                      items={[
                        { text: 'Option 1' },
                        { text: 'Option 2' },
                        { text: 'Option 3' },
                      ]}
                      label="Choose an option"
                      titleText="Choose an option"
                      hideLabel
                    />
                  </SideNavSlot>
                  <SideNavMenu renderIcon={Home} title="Home" defaultExpanded>
                    <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
                    <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
                    <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
                  </SideNavMenu>
                  <SideNavLink href="#" renderIcon={BusinessProcesses}>
                    Business
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={Application}>
                    Applications
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={Platforms}>
                    Platforms
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={Layers}>
                    Infrastructure
                  </SideNavLink>
                  <SideNavTitle>Experience services</SideNavTitle>
                  <SideNavLink href="#" renderIcon={Dashboard}>
                    Dashboard
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={DataAnalytics}>
                    Analytics
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={EventIncident}>
                    Incidents
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={Security}>
                    Security
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={WorkflowAutomation}>
                    Automations
                  </SideNavLink>
                  <SideNavDivider />
                  <SideNavLink href="#" renderIcon={DocumentMultiple_01}>
                    Docs
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={Settings}>
                    Settings
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={OverflowMenuVertical}>
                    More
                  </SideNavLink>
                </SideNavMenu>
                <SideNavMenu
                  renderIcon={CarbonIBMDotCom}
                  title="Product 2"
                  primary>
                  <SideNavMenuItem renderIcon={Home} href="#">
                    Home product 2
                  </SideNavMenuItem>
                </SideNavMenu>
                <SideNavMenu
                  renderIcon={CarbonforIBMProducts}
                  title="Product 3"
                  primary>
                  <SideNavMenuItem renderIcon={Home} href="#">
                    Home product 3
                  </SideNavMenuItem>
                </SideNavMenu>
                <SideNavMenu
                  renderIcon={IBMTelemetry}
                  title="Product 4"
                  primary>
                  <SideNavMenuItem renderIcon={Home} href="#">
                    Home product 4
                  </SideNavMenuItem>
                </SideNavMenu>
                <SideNavDivider />
                <SideNavLink renderIcon={DocumentMultiple_01} href="#">
                  Docs
                </SideNavLink>
                <SideNavLink renderIcon={Settings} href="#">
                  Settings
                </SideNavLink>
              </SideNavItems>
            </SideNav>
            <Theme theme={currentTheme === 'white' ? 'g10' : 'g90'}>
              <SideNav
                hideRailBreakpointDown="md"
                isChildOfHeader={false}
                navType={SIDE_NAV_TYPE.RAIL_PANEL}
                aria-label="Product navigation">
                <SideNavItems>
                  <SideNavSlot renderIcon={VirtualColumnKey}>
                    <Dropdown
                      id="default"
                      size="sm"
                      itemToString={(item) => (item ? item.text : '')}
                      items={[
                        { text: 'Option 1' },
                        { text: 'Option 2' },
                        { text: 'Option 3' },
                      ]}
                      label="Choose an option"
                      titleText="Choose an option"
                      hideLabel
                    />
                  </SideNavSlot>
                  <SideNavMenu renderIcon={Home} title="Home">
                    <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
                    <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
                    <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
                  </SideNavMenu>
                  <SideNavLink href="#" renderIcon={BusinessProcesses}>
                    Business
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={Application}>
                    Applications
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={Platforms}>
                    Platforms
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={Layers}>
                    Infrastructure
                  </SideNavLink>
                  <SideNavTitle>Experience services</SideNavTitle>
                  <SideNavLink href="#" renderIcon={Dashboard}>
                    Dashboard
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={DataAnalytics}>
                    Analytics
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={EventIncident}>
                    Incidents
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={Security}>
                    Security
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={WorkflowAutomation}>
                    Automations
                  </SideNavLink>
                  <SideNavDivider />
                  <SideNavLink href="#" renderIcon={DocumentMultiple_01}>
                    Docs
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={Settings}>
                    Settings
                  </SideNavLink>
                  <SideNavLink href="#" renderIcon={OverflowMenuVertical}>
                    More
                  </SideNavLink>
                </SideNavItems>
              </SideNav>
            </Theme>
            <Theme
              as={Content}
              theme={currentTheme === 'white' ? 'g10' : 'g90'}>
              <StoryContent />
            </Theme>
          </>
        )}
      />
    </Theme>
  );
};

Demo.parameters = {
  controls: { disable: true },
  actions: { disable: true },
  a11y: { disable: true },
  accessibilityChecker: { disable: true },
};
