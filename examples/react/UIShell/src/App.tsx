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
  SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
  HeaderPanel,
} from '@carbon-labs/react-ui-shell/es/index';
import {
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

function App() {
  const [expandedPanel, setExpandedPanel] = useState(false);
  return (
    <Theme theme="g100">
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
            <Theme theme="white">
              <p>Content</p>
            </Theme>
          </>
        )}
      />
    </Theme>
  );
}

export default App;
