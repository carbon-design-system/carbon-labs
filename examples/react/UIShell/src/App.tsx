/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useRef } from 'react';
import {
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  HeaderDivider,
  HeaderContainer,
  HeaderPopover,
  HeaderPopoverActions,
  HeaderPopoverButton,
  HeaderPopoverContent,
  TrialCountdown,
  SideNavSlot,
} from '@carbon-labs/react-ui-shell';
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
} from '@carbon/react';
import {
  Fade,
  SquareOutline,
  Help,
  Notification,
  UserAvatar,
  Share,
  User,
  ShoppingCart,
  Switcher,
  Menu,
} from '@carbon/icons-react';

const StoryContent = () => (
  <Content>
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
  </Content>
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
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <>
          <Header aria-label="IBM Platform Name">
            <SkipToContent />
            <HeaderMenuButton
              aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
              aria-expanded={isSideNavExpanded}
              isCollapsible //shows menu at desktop
              isFixedNav
              renderMenuIcon={<Switcher size={20} />}
            />
            <HeaderName href="#" prefix="IBM">
              [Platform]
            </HeaderName>
            <HeaderPopover align="bottom">
              <HeaderPopoverButton
                label="Trial Countdown"
                as={Button}
                kind="ghost">
                <TrialCountdown count={30} />
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
            </HeaderGlobalBar>
          </Header>
          <SideNav
            aria-label="Side navigation1"
            expanded={isSideNavExpanded}
            onSideNavBlur={onClickSideNavExpand}
            isCollapsible
            isTreeview
            onOverlayClick={onClickSideNavExpand}
            className="nav--global">
            <SideNavItems>
              <SideNavMenu
                renderIcon={SquareOutline}
                title="Sub-menu level 1"
                primary
                defaultExpanded>
                <SideNavSlot renderIcon={Fade}>
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
                  />
                </SideNavSlot>
                <SideNavDivider />
                <SideNavMenuItem renderIcon={SquareOutline} href="#">
                  Item level 2
                </SideNavMenuItem>
                <SideNavMenuItem renderIcon={SquareOutline} href="#">
                  Item level 2
                </SideNavMenuItem>
                <SideNavMenu
                  renderIcon={SquareOutline}
                  title="Sub-menu level 2"
                  defaultExpanded>
                  <SideNavMenuItem isActive href="#">
                    Item level 3
                  </SideNavMenuItem>
                  <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
                  <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
                </SideNavMenu>
              </SideNavMenu>
              <SideNavMenu renderIcon={SquareOutline} title="Sub-menu" primary>
                <SideNavMenuItem href="#">Item</SideNavMenuItem>
              </SideNavMenu>
              <SideNavMenu renderIcon={SquareOutline} title="Sub-menu" primary>
                <SideNavMenuItem href="#">Item</SideNavMenuItem>
              </SideNavMenu>
              <SideNavMenu renderIcon={SquareOutline} title="Sub-menu" primary>
                <SideNavMenuItem href="#">Item</SideNavMenuItem>
              </SideNavMenu>
              <SideNavMenu renderIcon={SquareOutline} title="Sub-menu" primary>
                <SideNavMenuItem href="#">Item</SideNavMenuItem>
              </SideNavMenu>
              <SideNavDivider />
              <SideNavLink renderIcon={SquareOutline} href="#">
                Link
              </SideNavLink>
              <SideNavLink renderIcon={SquareOutline} href="#">
                Link
              </SideNavLink>
              <SideNavMenu renderIcon={SquareOutline} title="Sub-menu" primary>
                <SideNavMenuItem href="#">Item</SideNavMenuItem>
                <SideNavMenuItem href="#">Item</SideNavMenuItem>
                <SideNavMenuItem href="#">Item</SideNavMenuItem>
              </SideNavMenu>
            </SideNavItems>
          </SideNav>
          <SideNav
            hideRailBreakpointDown="md"
            isRail
            isChildOfHeader={false}
            aria-label="Side navigation">
            <SideNavItems>
              <SideNavSlot renderIcon={Menu}>
                <Menu />
              </SideNavSlot>

              <SideNavSlot renderIcon={SquareOutline}>
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
                />
              </SideNavSlot>
              <SideNavDivider />
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
          <StoryContent />
        </>
      )}
    />
  );
}

export default App;
