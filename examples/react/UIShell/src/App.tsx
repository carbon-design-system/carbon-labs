/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useRef } from 'react';
import {
  SIDE_NAV_TYPE,
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  HeaderDivider,
  HeaderContainer,
  HeaderPanel,
  HeaderPopover,
  HeaderPopoverActions,
  HeaderPopoverButton,
  HeaderPopoverContent,
} from '@carbon-labs/react-ui-shell/es/index';
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
  Fade,
  SquareOutline,
  Help,
  Notification,
  Switcher as SwitcherIcon,
  UserAvatar,
} from '@carbon/icons-react';

const StoryContent = () => (
  <Theme as={Content} theme="g10">
    <Grid align="start">
      <Column sm={4} md={8} lg={12}>
        <h2 style={{ margin: '0 0 30px 0' }}>Purpose and function</h2>
        <p>
          The shell is perhaps the most crucial piece of any UI built with
          <a href="www.carbondesignsystem.com"> Carbon</a>. It contains the
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

function App() {
  const headerRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('');

  const options = {
    Fruits: ['Apple', 'Banana', 'Orange'],
    Vegetables: ['Carrot', 'Broccoli', 'Spinach'],
    Animals: ['Cat', 'Dog', 'Snake'],
  };

  return (
    <Theme theme="g100">
      <HeaderContainer
        render={({
          isSideNavExpanded,
          isSwitcherExpanded,
          onClickSideNavExpand,
          onClickSwitcherExpand,
        }) => (
          <>
            <Theme theme="g100">
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
                  {/* <HeaderGlobalAction
                    aria-label="Custom action"
                    tooltipHighContrast={false}
                  >
                    <SwitcherIcon size={20} />
                  </HeaderGlobalAction> */}
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
                aria-label="Side navigation1"
                expanded={isSideNavExpanded}
                onSideNavBlur={onClickSideNavExpand}
                isCollapsible
                isTreeview
                hideOverlay
                className="nav--global">
                <SideNavItems>
                  <SideNavMenu
                    renderIcon={SquareOutline}
                    title="Sub-menu level 1">
                    <SideNavMenuItem renderIcon={SquareOutline} href="#">
                      Item level 2
                    </SideNavMenuItem>
                    <SideNavMenuItem renderIcon={SquareOutline} href="#">
                      Item level 2
                    </SideNavMenuItem>
                    <SideNavMenu
                      renderIcon={SquareOutline}
                      title="Sub-menu level 2">
                      <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
                      <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
                      <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
                    </SideNavMenu>
                  </SideNavMenu>
                  <SideNavMenu renderIcon={SquareOutline} title="Sub-menu">
                    <SideNavMenuItem href="#">Item</SideNavMenuItem>
                  </SideNavMenu>
                  <SideNavMenu renderIcon={SquareOutline} title="Sub-menu">
                    <SideNavMenuItem href="#">Item</SideNavMenuItem>
                  </SideNavMenu>
                  <SideNavMenu renderIcon={SquareOutline} title="Sub-menu">
                    <SideNavMenuItem href="#">Item</SideNavMenuItem>
                  </SideNavMenu>
                  <SideNavMenu renderIcon={SquareOutline} title="Sub-menu">
                    <SideNavMenuItem href="#">Item</SideNavMenuItem>
                  </SideNavMenu>
                  <SideNavDivider />
                  <SideNavLink renderIcon={SquareOutline} href="#">
                    Link
                  </SideNavLink>
                  <SideNavLink renderIcon={SquareOutline} href="#">
                    Link
                  </SideNavLink>
                  <SideNavMenu renderIcon={SquareOutline} title="Sub-menu">
                    <SideNavMenuItem href="#">Item</SideNavMenuItem>
                    <SideNavMenuItem href="#">Item</SideNavMenuItem>
                    <SideNavMenuItem href="#">Item</SideNavMenuItem>
                  </SideNavMenu>
                </SideNavItems>
              </SideNav>
            </Theme>
            <Theme theme="g100">
              <SideNav
                navType={SIDE_NAV_TYPE.PANEL}
                isChildOfHeader={false}
                hideOverlay
                aria-label="Side navigation">
                <SideNavItems>
                  <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
                    <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
                    <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
                  </SideNavMenu>
                  <SideNavLink renderIcon={Fade} href="#">
                    Link
                  </SideNavLink>
                  <SideNavLink renderIcon={Fade} href="#">
                    Link
                  </SideNavLink>
                  <SideNavLink renderIcon={Fade} href="#">
                    Link
                  </SideNavLink>
                  <SideNavLink renderIcon={Fade} href="#">
                    Link
                  </SideNavLink>
                  <SideNavDivider />
                  <SideNavLink renderIcon={Fade} href="#">
                    Link
                  </SideNavLink>
                  <SideNavLink renderIcon={Fade} href="#">
                    Link
                  </SideNavLink>
                </SideNavItems>
              </SideNav>
            </Theme>
            <StoryContent />
          </>
        )}
      />
    </Theme>
  );
}

export default App;
