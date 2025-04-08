/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useRef } from 'react';
import mdx from './UIShell.mdx';
import { SIDE_NAV_TYPE, SideNav } from '../components/SideNav';
import { SideNavItems } from '../components/SideNavItems';
import { SideNavMenu } from '../components/SideNavMenu';
import { SideNavMenuItem } from '../components/SideNavMenuItem';
import { HeaderPanel } from '../components/HeaderPanel';
import { SideNavLink } from '../components/SideNavLink';
import {
  HeaderPopover,
  HeaderPopoverActions,
  HeaderPopoverButton,
  HeaderPopoverContent,
} from '../components/HeaderPopover';
import { HeaderContainer } from '../components/HeaderContainer';
import { HeaderDivider } from '../components/HeaderDivider';
import {
  SkipToContent,
  Header,
  HeaderName,
  Theme,
  HeaderMenuButton,
  SideNavDivider,
  Content,
  Grid,
  Column,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Switcher,
  SwitcherItem,
  SwitcherDivider,
  MenuButton,
  MenuItemRadioGroup,
  ExpandableSearch,
  Link,
  Button,
} from '@carbon/react';
import {
  Add,
  Fade,
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
} from '@carbon/icons-react';

import {
  CarbonIBMDotCom,
  CarbonDesignSystem,
  CarbonforIBMProducts,
  IBMTelemetry,
} from './AppIcons';

import '../components/ui-shell.scss';

export default {
  title: 'Components/UIShell',
  component: HeaderContainer,
  subcomponents: {
    HeaderContainer,
    HeaderDivider,
    HeaderPopover,
    HeaderPopoverActions,
    HeaderPopoverButton,
    HeaderPopoverContent,
    SideNav,
    SideNavItems,
    SideNavLink,
    SideNavMenu,
    SideNavMenuItem,
  },
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Story content
 * @returns {React.ReactElement} The JSX for the story
 */
const StoryContent = () => (
  <Theme as={Content} theme="g10">
    <Grid align="start">
      <Column sm={4} md={8} lg={12}>
        <h2 style={{ margin: '0 0 30px 0' }}>Purpose and function</h2>
        <p>
          The shell is perhaps the most crucial piece of any UI built with {''}
          <a href="www.carbondesignsystem.com">Carbon</a>. It contains the
          shared navigation framework for the entire design system and ties the
          products in IBM’s portfolio together in a cohesive and elegant way.
          The shell is the home of the topmost navigation, where users can
          quickly and dependably gain their bearings and move between pages.
          <br />
          <br />
          The shell was designed with maximum flexibility built in, to serve the
          needs of a broad range of products and users. Adopting the shell
          ensures compliance with IBM design standards, simplifies development
          efforts, and provides great user experiences. All IBM products built
          with Carbon are required to use the shell’s header.
          <br />
          <br />
          To better understand the purpose and function of the UI shell,
          consider the “shell” of MacOS, which contains the Apple menu,
          top-level navigation, and universal, OS-level controls at the top of
          the screen, as well as a universal dock along the bottom or side of
          the screen. The Carbon UI shell is roughly analogous in function to
          these parts of the Mac UI. For example, the app switcher portion of
          the shell can be compared to the dock in MacOS.
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
          The side-nav contains secondary navigation and fits below the header.
          It can be configured to be either fixed-width or flexible, with only
          one level of nested items allowed. Both links and category lists can
          be used in the side-nav and may be mixed together. There are several
          configurations of the side-nav, but only one configuration should be
          used per product section. If tabs are needed on a page when using a
          side-nav, then the tabs are secondary in hierarchy to the side-nav.
        </p>
        <h2 style={{ margin: '30px 0' }}>Secondary navigation</h2>
        <p>
          The side-nav contains secondary navigation and fits below the header.
          It can be configured to be either fixed-width or flexible, with only
          one level of nested items allowed. Both links and category lists can
          be used in the side-nav and may be mixed together. There are several
          configurations of the side-nav, but only one configuration should be
          used per product section. If tabs are needed on a page when using a
          side-nav, then the tabs are secondary in hierarchy to the side-nav.
        </p>
      </Column>
      <Column sm={4} md={8} lg={4}>
        <h3 style={{ margin: '0 0 30px 0' }}>Secondary navigation</h3>
        <p>
          The side-nav contains secondary navigation and fits below the header.
          It can be configured to be either fixed-width or flexible, with only
          one level of nested items allowed. Both links and category lists can
          be used in the side-nav and may be mixed together. There are several
          configurations of the side-nav, but only one configuration should be
          used per product section. If tabs are needed on a page when using a
          side-nav, then the tabs are secondary in hierarchy to the side-nav.
        </p>
      </Column>
    </Grid>
  </Theme>
);

/**
 * Story for UIShell
 * @returns {React.ReactElement} The JSX for the story
 */
export const Default = () => {
  const headerRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('');

  const options = {
    Fruits: ['Apple', 'Banana', 'Orange'],
    Vegetables: ['Carrot', 'Broccoli', 'Spinach'],
    Animals: ['Cat', 'Dog', 'Snake'],
  };

  return (
    <HeaderContainer
      render={({
        isSideNavExpanded,
        isSwitcherExpanded,
        onClickSideNavExpand,
        onClickSwitcherExpand,
      }) => (
        <>
          <Theme theme="g100">
            <Header aria-label="IBM Platform Name" ref={headerRef}>
              <SkipToContent />
              <HeaderMenuButton
                aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
                onClick={onClickSideNavExpand}
                isActive={isSideNavExpanded}
                aria-expanded={isSideNavExpanded}
                isCollapsible //shows hamburger menu at desktop
                isFixedNav
              />
              <HeaderName href="http://www.carbondesignsystem.com" prefix="IBM">
                [Platform]
              </HeaderName>
              <HeaderGlobalBar>
                <ExpandableSearch
                  size="lg"
                  labelText="Search"
                  closeButtonLabelText="Clear search input"
                  id="search-expandable-1"
                />
                <HeaderGlobalAction
                  aria-label="Custom action"
                  tooltipHighContrast={false}>
                  <SquareOutline size={20} />
                </HeaderGlobalAction>
                <HeaderPopover align="bottom-right">
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
                <HeaderPopover align="bottom-right">
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
                <HeaderDivider />
                <MenuButton
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
                <HeaderDivider />
                <HeaderPopover align="bottom-right">
                  <HeaderPopoverButton align="bottom" label="Profile">
                    <UserAvatar size={20} />
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
                <HeaderGlobalAction
                  aria-label={
                    isSwitcherExpanded ? 'Close switcher' : 'Open switcher'
                  }
                  aria-expanded={isSwitcherExpanded}
                  isActive={isSwitcherExpanded}
                  onClick={onClickSwitcherExpand}
                  tooltipAlignment="end"
                  tooltipHighContrast={false}
                  id="switcher-button">
                  <SwitcherIcon size={20} />
                </HeaderGlobalAction>
              </HeaderGlobalBar>
              <HeaderPanel
                expanded={isSwitcherExpanded}
                onHeaderPanelFocus={onClickSwitcherExpand}
                href="#switcher-button">
                <Switcher
                  aria-label="Switcher Container"
                  expanded={isSwitcherExpanded}>
                  <SwitcherItem aria-label="Link 1" href="#">
                    Link 1
                  </SwitcherItem>
                  <SwitcherDivider />
                  <SwitcherItem href="#" aria-label="Link 2">
                    Link 2
                  </SwitcherItem>
                  <SwitcherItem href="#" aria-label="Link 3">
                    Link 3
                  </SwitcherItem>
                  <SwitcherItem href="#" aria-label="Link 4">
                    Link 4
                  </SwitcherItem>
                  <SwitcherItem href="#" aria-label="Link 5">
                    Link 5
                  </SwitcherItem>
                  <SwitcherDivider />
                  <SwitcherItem href="#" aria-label="Link 6">
                    Link 6
                  </SwitcherItem>
                </Switcher>
              </HeaderPanel>
            </Header>
            <SideNav
              isTreeview={true}
              aria-label="Main navigation"
              expanded={isSideNavExpanded}
              onSideNavBlur={onClickSideNavExpand}
              isCollapsible
              hideOverlay
              className="nav--global">
              <SideNavItems>
                <SideNavMenu renderIcon={CarbonDesignSystem} title="Product 1">
                  <SideNavMenu renderIcon={Home} title="Home">
                    <SideNavMenuItem href="http://www.carbondesignsystem.com">
                      Item level 3
                    </SideNavMenuItem>
                    <SideNavMenuItem href="http://www.carbondesignsystem.com">
                      Item level 3
                    </SideNavMenuItem>
                    <SideNavMenuItem href="http://www.carbondesignsystem.com">
                      Item level 3
                    </SideNavMenuItem>
                  </SideNavMenu>
                  <SideNavMenuItem
                    href="http://www.carbondesignsystem.com"
                    renderIcon={BusinessProcesses}>
                    Business
                  </SideNavMenuItem>
                  <SideNavMenuItem
                    href="http://www.carbondesignsystem.com"
                    renderIcon={Application}>
                    Applications
                  </SideNavMenuItem>
                  <SideNavMenuItem
                    href="http://www.carbondesignsystem.com"
                    renderIcon={Platforms}>
                    Platforms
                  </SideNavMenuItem>
                  <SideNavMenu renderIcon={Layers} title="Infrastructure">
                    <SideNavMenuItem href="http://www.carbondesignsystem.com">
                      Item level 3
                    </SideNavMenuItem>
                    <SideNavMenuItem href="http://www.carbondesignsystem.com">
                      Item level 3
                    </SideNavMenuItem>
                    <SideNavMenuItem href="http://www.carbondesignsystem.com">
                      Item level 3
                    </SideNavMenuItem>
                  </SideNavMenu>
                </SideNavMenu>
                <SideNavMenu renderIcon={CarbonIBMDotCom} title="Product 2">
                  <SideNavMenuItem
                    renderIcon={Home}
                    href="http://www.carbondesignsystem.com">
                    Link
                  </SideNavMenuItem>
                </SideNavMenu>
                <SideNavMenu
                  renderIcon={CarbonforIBMProducts}
                  title="Product 3">
                  <SideNavMenuItem
                    renderIcon={Home}
                    href="http://www.carbondesignsystem.com">
                    Link
                  </SideNavMenuItem>
                </SideNavMenu>
                <SideNavMenu renderIcon={IBMTelemetry} title="Product 4">
                  <SideNavMenuItem
                    renderIcon={Home}
                    href="http://www.carbondesignsystem.com">
                    Link
                  </SideNavMenuItem>
                </SideNavMenu>
                <SideNavDivider />
                <SideNavLink
                  renderIcon={DocumentMultiple_01}
                  href="http://www.carbondesignsystem.com">
                  Docs
                </SideNavLink>
                <SideNavLink
                  renderIcon={Settings}
                  href="http://www.carbondesignsystem.com">
                  Settings
                </SideNavLink>
              </SideNavItems>
            </SideNav>
          </Theme>
          <Theme theme="g100">
            <SideNav
              navType={SIDE_NAV_TYPE.PANEL}
              isChildOfHeader={false}
              hideOverlay
              aria-label="Product navigation">
              <SideNavItems>
                <SideNavMenu renderIcon={Home} title="Home">
                  <SideNavMenuItem href="http://www.carbondesignsystem.com">
                    Item level 3
                  </SideNavMenuItem>
                  <SideNavMenuItem
                    isActive
                    href="http://www.carbondesignsystem.com">
                    Item level 3
                  </SideNavMenuItem>
                  <SideNavMenuItem href="http://www.carbondesignsystem.com">
                    Item level 3
                  </SideNavMenuItem>
                </SideNavMenu>
                <SideNavLink
                  href="http://www.carbondesignsystem.com"
                  renderIcon={BusinessProcesses}>
                  Business
                </SideNavLink>
                <SideNavLink
                  href="http://www.carbondesignsystem.com"
                  renderIcon={Application}>
                  Applications
                </SideNavLink>
                <SideNavLink
                  href="http://www.carbondesignsystem.com"
                  renderIcon={Platforms}>
                  Platforms
                </SideNavLink>
                <SideNavLink
                  href="http://www.carbondesignsystem.com"
                  renderIcon={Layers}>
                  Infrastructure
                </SideNavLink>
                <SideNavDivider />
                <SideNavLink
                  href="http://www.carbondesignsystem.com"
                  renderIcon={Dashboard}>
                  Dashboard
                </SideNavLink>
                <SideNavLink
                  href="http://www.carbondesignsystem.com"
                  renderIcon={DataAnalytics}>
                  Analytics
                </SideNavLink>
                <SideNavLink
                  href="http://www.carbondesignsystem.com"
                  renderIcon={EventIncident}>
                  Incidents
                </SideNavLink>
                <SideNavLink
                  href="http://www.carbondesignsystem.com"
                  renderIcon={Security}>
                  Security
                </SideNavLink>
                <SideNavLink
                  href="http://www.carbondesignsystem.com"
                  renderIcon={WorkflowAutomation}>
                  Automations
                </SideNavLink>
                <SideNavDivider />
                <SideNavLink
                  href="http://www.carbondesignsystem.com"
                  renderIcon={DocumentMultiple_01}>
                  Docs
                </SideNavLink>
                <SideNavLink
                  href="http://www.carbondesignsystem.com"
                  renderIcon={Settings}>
                  Settings
                </SideNavLink>
                <SideNavLink
                  href="http://www.carbondesignsystem.com"
                  renderIcon={OverflowMenuVertical}>
                  More
                </SideNavLink>
              </SideNavItems>
            </SideNav>
          </Theme>
          <StoryContent />
        </>
      )}
    />
  );
};

Default.parameters = {
  controls: { disable: true },
  actions: { disable: true },
};

/**
 * Story for Header
 * @param {object} args Storybook args that control component props
 * @returns {React.ReactElement} The JSX for the story
 */
export const HeaderStory = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('');

  const options = {
    Fruits: ['Apple', 'Banana', 'Orange'],
    Vegetables: ['Carrot', 'Broccoli', 'Spinach'],
    Animals: ['Cat', 'Dog', 'Snake'],
  };
  return (
    <HeaderContainer
      render={({
        isSideNavExpanded,
        isSwitcherExpanded,
        onClickSideNavExpand,
        onClickSwitcherExpand,
      }) => (
        <Header aria-label="IBM Platform Name">
          <SkipToContent />
          <HeaderMenuButton
            aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
            onClick={onClickSideNavExpand}
            isActive={isSideNavExpanded}
            aria-expanded={isSideNavExpanded}
            isCollapsible //shows hamburger menu at desktop
            isFixedNav
          />
          <HeaderName href="http://www.carbondesignsystem.com" prefix="IBM">
            [Platform]
          </HeaderName>
          <HeaderGlobalBar>
            <ExpandableSearch
              size="lg"
              labelText="Search"
              closeButtonLabelText="Clear search input"
              id="search-expandable-1"
            />
            <HeaderGlobalAction
              aria-label="Custom action"
              tooltipHighContrast={false}>
              <SquareOutline size={20} />
            </HeaderGlobalAction>
            <HeaderPopover align="bottom-right">
              <HeaderPopoverButton align="bottom" label="Help">
                <Help size={20} />
              </HeaderPopoverButton>
              <HeaderPopoverContent>
                <p>
                  Lorem ipsum dolor sit amet, di os consectetur adipiscing elit,
                  sed do eiusmod tempor incididunt ut fsil labore et dolore
                  magna aliqua.
                </p>
                <HeaderPopoverActions>
                  <Link href="#">Link action</Link>
                  <Button size="sm">Button</Button>
                </HeaderPopoverActions>
              </HeaderPopoverContent>
            </HeaderPopover>
            <HeaderPopover align="bottom-right">
              <HeaderPopoverButton align="bottom" label="Notifications">
                <Notification size={20} />
              </HeaderPopoverButton>
              <HeaderPopoverContent>
                <p>
                  Lorem ipsum dolor sit amet, di os consectetur adipiscing elit,
                  sed do eiusmod tempor incididunt ut fsil labore et dolore
                  magna aliqua.
                </p>
                <HeaderPopoverActions>
                  <Link href="#">Link action</Link>
                  <Button size="sm">Button</Button>
                </HeaderPopoverActions>
              </HeaderPopoverContent>
            </HeaderPopover>
            <HeaderDivider />
            <MenuButton
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
            <HeaderDivider />
            <HeaderPopover align="bottom-right">
              <HeaderPopoverButton align="bottom" label="Profile">
                <UserAvatar size={20} />
              </HeaderPopoverButton>
              <HeaderPopoverContent>
                <p>
                  Lorem ipsum dolor sit amet, di os consectetur adipiscing elit,
                  sed do eiusmod tempor incididunt ut fsil labore et dolore
                  magna aliqua.
                </p>
                <HeaderPopoverActions>
                  <Link href="#">Link action</Link>
                  <Button size="sm">Button</Button>
                </HeaderPopoverActions>
              </HeaderPopoverContent>
            </HeaderPopover>
            <HeaderGlobalAction
              aria-label={
                isSwitcherExpanded ? 'Close switcher' : 'Open switcher'
              }
              aria-expanded={isSwitcherExpanded}
              isActive={isSwitcherExpanded}
              onClick={onClickSwitcherExpand}
              tooltipAlignment="end"
              tooltipHighContrast={false}
              id="switcher-button">
              <SwitcherIcon size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
          <HeaderPanel
            expanded={isSwitcherExpanded}
            onHeaderPanelFocus={onClickSwitcherExpand}
            href="#switcher-button">
            <Switcher
              aria-label="Switcher Container"
              expanded={isSwitcherExpanded}>
              <SwitcherItem aria-label="Link 1" href="#">
                Link 1
              </SwitcherItem>
              <SwitcherDivider />
              <SwitcherItem href="#" aria-label="Link 2">
                Link 2
              </SwitcherItem>
              <SwitcherItem href="#" aria-label="Link 3">
                Link 3
              </SwitcherItem>
              <SwitcherItem href="#" aria-label="Link 4">
                Link 4
              </SwitcherItem>
              <SwitcherItem href="#" aria-label="Link 5">
                Link 5
              </SwitcherItem>
              <SwitcherDivider />
              <SwitcherItem href="#" aria-label="Link 6">
                Link 6
              </SwitcherItem>
            </Switcher>
          </HeaderPanel>
        </Header>
      )}
    />
  );
};
HeaderStory.storyName = 'Header';

/**
 * Story for SideNav
 * @returns {React.ReactElement} The JSX for the story
 */
export const SideNavStory = () => (
  <SideNav
    isFixedNav
    expanded
    isChildOfHeader={false}
    aria-label="Side navigation">
    <SideNavItems>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavDivider />
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link
      </SideNavLink>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
      </SideNavMenu>
    </SideNavItems>
  </SideNav>
);
SideNavStory.storyName = 'SideNav';

/**
 * Story for SideNav w/TreeView
 * @returns {React.ReactElement} The JSX for the story
 */
export const SideNavWithThirdLevel = () => (
  <SideNav
    isFixedNav
    expanded={true}
    isChildOfHeader={false}
    aria-label="Side navigation">
    <SideNavItems>
      <SideNavLink renderIcon={Add} href="http://www.carbondesignsystem.com">
        Link level 1
      </SideNavLink>
      <SideNavMenu
        defaultExpanded={true}
        renderIcon={Fade}
        title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenu title="Sub-menu level 2" defaultExpanded={true}>
          <SideNavMenuItem isActive href="http://www.carbondesignsystem.com">
            Item level 3
          </SideNavMenuItem>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 3
          </SideNavMenuItem>
        </SideNavMenu>
      </SideNavMenu>
    </SideNavItems>
  </SideNav>
);
SideNavWithThirdLevel.storyName = 'SideNav With Third Level';

/**
 * Story for SideNav w/TreeView icons
 * @returns {React.ReactElement} The JSX for the story
 */
export const SideNavWithThirdLevelIcons = () => (
  <SideNav
    isFixedNav
    expanded={true}
    isChildOfHeader={false}
    aria-label="Side navigation">
    <SideNavItems>
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link level 1
      </SideNavLink>
      <SideNavMenu
        defaultExpanded={true}
        renderIcon={Fade}
        title="Sub-menu level 1">
        <SideNavMenuItem
          renderIcon={Fade}
          href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem
          renderIcon={Fade}
          href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenu
          renderIcon={Fade}
          title="Sub-menu level 2"
          defaultExpanded={true}>
          <SideNavMenuItem isActive href="http://www.carbondesignsystem.com">
            Item level 3
          </SideNavMenuItem>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 3
          </SideNavMenuItem>
        </SideNavMenu>
      </SideNavMenu>
    </SideNavItems>
  </SideNav>
);
SideNavWithThirdLevelIcons.storyName = 'SideNav With Third Level Icons';

/**
 * Story for SideNav panel
 * @returns {React.ReactElement} The JSX for the story
 */
export const SideNavPanel = () => (
  <>
    <SideNav
      navType={SIDE_NAV_TYPE.PANEL}
      isChildOfHeader={false}
      aria-label="Product navigation">
      <SideNavItems>
        <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 2
          </SideNavMenuItem>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 2
          </SideNavMenuItem>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 2
          </SideNavMenuItem>
        </SideNavMenu>
        <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 2
          </SideNavMenuItem>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 2
          </SideNavMenuItem>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 2
          </SideNavMenuItem>
        </SideNavMenu>
        <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 2
          </SideNavMenuItem>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 2
          </SideNavMenuItem>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 2
          </SideNavMenuItem>
        </SideNavMenu>
        <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 2
          </SideNavMenuItem>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 2
          </SideNavMenuItem>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 2
          </SideNavMenuItem>
        </SideNavMenu>
        <SideNavDivider />
        <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
          Link
        </SideNavLink>
        <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
          Link
        </SideNavLink>
        <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
          Link
        </SideNavLink>
        <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
          Link
        </SideNavLink>
        <SideNavDivider />
        <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
          Link
        </SideNavLink>
        <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
          Link
        </SideNavLink>
      </SideNavItems>
    </SideNav>
    <Content>
      <Grid align="start">
        <Column sm={4} md={8} lg={12}>
          <h2 style={{ margin: '0 0 30px 0' }}>Purpose and function</h2>
          <p>
            The shell is perhaps the most crucial piece of any UI built with{' '}
            {''}
            <a href="www.carbondesignsystem.com">Carbon</a>. It contains the
            shared navigation framework for the entire design system and ties
            the products in IBM’s portfolio together in a cohesive and elegant
            way. The shell is the home of the topmost navigation, where users
            can quickly and dependably gain their bearings and move between
            pages.
            <br />
            <br />
            The shell was designed with maximum flexibility built in, to serve
            the needs of a broad range of products and users. Adopting the shell
            ensures compliance with IBM design standards, simplifies development
            efforts, and provides great user experiences. All IBM products built
            with Carbon are required to use the shell’s header.
            <br />
            <br />
            To better understand the purpose and function of the UI shell,
            consider the “shell” of MacOS, which contains the Apple menu,
            top-level navigation, and universal, OS-level controls at the top of
            the screen, as well as a universal dock along the bottom or side of
            the screen. The Carbon UI shell is roughly analogous in function to
            these parts of the Mac UI. For example, the app switcher portion of
            the shell can be compared to the dock in MacOS.
          </p>
        </Column>
      </Grid>
    </Content>
  </>
);
