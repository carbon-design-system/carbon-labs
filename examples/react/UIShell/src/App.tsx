/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { SideNav } from '../components/SideNav';
import { SideNavItems } from '../components/SideNavItems';
import { SideNavMenu } from '../components/SideNavMenu';
import { SideNavMenuItem } from '../components/SideNavMenuItem';
import {
  SideNavLink,
  SkipToContent,
  HeaderContainer,
  Header,
  HeaderName,
  Theme,
  HeaderMenuButton,
  SideNavDivider,
} from '@carbon/react';
import { Fade } from '@carbon/icons-react';

function App() {
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
            </Header>
            <SideNav
              aria-label="Side navigation1"
              expanded={isSideNavExpanded}
              onSideNavBlur={onClickSideNavExpand}
              isCollapsible
              hideOverlay
              className="nav--global">
              <SideNavItems>
                <SideNavMenu renderIcon={Fade} title="Link">
                  <SideNavMenuItem href="#">Link</SideNavMenuItem>
                  <SideNavMenuItem href="#">Link</SideNavMenuItem>
                  <SideNavMenuItem href="#">Link</SideNavMenuItem>
                </SideNavMenu>
                <SideNavMenu renderIcon={Fade} title="Link">
                  <SideNavMenuItem href="#">Link</SideNavMenuItem>
                </SideNavMenu>
                <SideNavMenu renderIcon={Fade} title="Link">
                  <SideNavMenuItem href="#">Link</SideNavMenuItem>
                </SideNavMenu>
                <SideNavMenu renderIcon={Fade} title="Link">
                  <SideNavMenuItem href="#">Link</SideNavMenuItem>
                </SideNavMenu>
                <SideNavMenu renderIcon={Fade} title="Link">
                  <SideNavMenuItem href="#">Link</SideNavMenuItem>
                </SideNavMenu>
                <SideNavDivider />
                <SideNavLink renderIcon={Fade} href="#">
                  Link
                </SideNavLink>
                <SideNavLink renderIcon={Fade} href="#">
                  Link
                </SideNavLink>
                <SideNavMenu renderIcon={Fade} title="Link">
                  <SideNavMenuItem href="#">Link</SideNavMenuItem>
                  <SideNavMenuItem href="#">Link</SideNavMenuItem>
                  <SideNavMenu title="Sub-menu level 2">
                    <SideNavMenuItem href="#">Link level 3</SideNavMenuItem>
                    <SideNavMenuItem href="#">Link level 3</SideNavMenuItem>
                    <SideNavMenuItem href="#">Link level 3</SideNavMenuItem>
                  </SideNavMenu>
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
