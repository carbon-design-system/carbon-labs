/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import {
  SIDE_NAV_TYPE,
  SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
  HeaderPanel,
} from '@carbon-labs/react-ui-shell/es/index';
import {
  Content,
  Grid,
  Column,
  SideNavLink,
  SkipToContent,
  HeaderContainer,
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Theme,
  HeaderMenuButton,
  SideNavDivider,
} from '@carbon/react';
import { Fade, SquareOutline } from '@carbon/icons-react';

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
  const [expandedPanel, setExpandedPanel] = useState(false);
  return (
    <Theme theme="g100">
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
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
                  <HeaderGlobalAction
                    aria-label={expandedPanel ? 'Close panel' : 'Open panel'}
                    isActive={expandedPanel}
                    aria-expanded={expandedPanel}
                    tooltipAlignment="end"
                    onClick={() => setExpandedPanel(!expandedPanel)}>
                    <Fade size={20} />
                  </HeaderGlobalAction>
                </HeaderGlobalBar>
                <HeaderPanel expanded={expandedPanel} />
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
                    <SideNavMenuItem href="#">Link level 2</SideNavMenuItem>
                    <SideNavMenuItem href="#">Link level 2</SideNavMenuItem>
                    <SideNavMenu title="Sub-menu level 2">
                      <SideNavMenuItem href="#">Link level 3</SideNavMenuItem>
                      <SideNavMenuItem href="#">Link level 3</SideNavMenuItem>
                      <SideNavMenuItem href="#">Link level 3</SideNavMenuItem>
                    </SideNavMenu>
                  </SideNavMenu>
                  <SideNavMenu renderIcon={SquareOutline} title="Sub-menu">
                    <SideNavMenuItem href="#">Link</SideNavMenuItem>
                  </SideNavMenu>
                  <SideNavMenu renderIcon={SquareOutline} title="Sub-menu">
                    <SideNavMenuItem href="#">Link</SideNavMenuItem>
                  </SideNavMenu>
                  <SideNavMenu renderIcon={SquareOutline} title="Sub-menu">
                    <SideNavMenuItem href="#">Link</SideNavMenuItem>
                  </SideNavMenu>
                  <SideNavMenu renderIcon={SquareOutline} title="Sub-menu">
                    <SideNavMenuItem href="#">Link</SideNavMenuItem>
                  </SideNavMenu>
                  <SideNavDivider />
                  <SideNavLink renderIcon={SquareOutline} href="#">
                    Link
                  </SideNavLink>
                  <SideNavLink renderIcon={SquareOutline} href="#">
                    Link
                  </SideNavLink>
                  <SideNavMenu renderIcon={SquareOutline} title="Sub-menu">
                    <SideNavMenuItem href="#">Link</SideNavMenuItem>
                    <SideNavMenuItem href="#">Link</SideNavMenuItem>
                    <SideNavMenuItem href="#">Link</SideNavMenuItem>
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
                <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
                  <SideNavMenuItem href="#">Link level 2</SideNavMenuItem>
                  <SideNavMenuItem href="#">Link level 2</SideNavMenuItem>
                </SideNavMenu>
                <SideNavItems>
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
