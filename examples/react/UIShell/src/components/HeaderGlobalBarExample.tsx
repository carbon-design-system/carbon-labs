/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavLink,
  HeaderDivider,
  HeaderPopover,
  HeaderPopoverActions,
  HeaderPopoverButton,
  HeaderPopoverContent,
  HeaderOverflowPanel,
  Profile,
} from '@carbon-labs/react-ui-shell';
import {
  ThemeSettings,
  ThemeSwitcher,
} from '@carbon-labs/react-theme-settings';
import {
  Button,
  ExpandableSearch,
  HeaderGlobalAction,
  HeaderGlobalBar,
  MenuButton,
  MenuItemRadioGroup,
  ContainedList,
  ContainedListItem,
  SideNavDivider,
} from '@carbon/react';
import {
  Help,
  Notification,
  UserAvatar,
  SquareOutline,
  User,
  IbmCloudKeyProtect,
  Group,
  Money,
  Logout,
  Launch,
  ChartCustom,
  Settings,
} from '@carbon/react/icons';
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { breakpoints } from '@carbon/layout';
const smMediaQuery = `(max-width: ${breakpoints.md.width})`;

const options = {
  Fruits: ['Apple', 'Banana', 'Orange'],
  Vegetables: ['Carrot', 'Broccoli', 'Spinach'],
  Animals: ['Cat', 'Dog', 'Snake'],
};

const readOnlyItems = [
  { label: 'Instance', title: 'APIC-MB-DEV' },
  { label: 'Instance owner', title: 'ruth.leach@ibm.com' },
  { label: 'Region', title: 'us-east-1 (N Virginia)' },
];

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
          <SideNavLink renderIcon={ChartCustom} href="#">
            Customize
            <Launch />
          </SideNavLink>
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

export const HeaderGlobalBarExample = ({
  isProfileExpanded,
  onClickProfileExpand,
  themeSetting,
  setThemeSetting,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const headerRef = useRef(null);

  const isSm = window.matchMedia(smMediaQuery);

  return (
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
            Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut fsil labore et dolore magna aliqua.
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
            Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut fsil labore et dolore magna aliqua.
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
  );
};
