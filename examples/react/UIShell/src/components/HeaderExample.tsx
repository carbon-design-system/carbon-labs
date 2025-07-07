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
  SideNavMenuItem,
  HeaderContainer,
  HeaderPopover,
  HeaderPopoverButton,
  HeaderPopoverContent,
  TrialCountdown,
} from '@carbon-labs/react-ui-shell';
import {
  SkipToContent,
  Header,
  HeaderName,
  HeaderMenuButton,
  Link,
  Button,
  SideNavDivider,
  SideNavLink,
} from '@carbon/react';
import {
  // Fade,
  SquareOutline,
  Share,
  User,
  ShoppingCart,
  Switcher,
  Home,
  DocumentMultiple_01,
  Settings,
  // Menu,
} from '@carbon/icons-react';

import { Link as RouterLink } from 'react-router';
import { HeaderGlobalBarExample } from './HeaderGlobalBarExample';
import { SideNavProductExample } from './SideNavProductExample';
import { routesInSideNav } from '../config/routes';

export const HeaderExample = ({ children }) => {
  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <>
          <Header aria-label='IBM Platform Name'>
            <SkipToContent />
            <HeaderMenuButton
              aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
              aria-expanded={isSideNavExpanded}
              isCollapsible //shows menu at desktop
              renderMenuIcon={<Switcher size={20} />}
            />
            <HeaderName as={RouterLink} to='/' prefix='IBM'>
              [Platform]
            </HeaderName>

            <HeaderPopover align='bottom'>
              <HeaderPopoverButton
                label='Trial Countdown'
                as={Button}
                kind='ghost'
              >
                <TrialCountdown count={30} />
              </HeaderPopoverButton>
              <HeaderPopoverContent>
                <p>Your trial ends on May 13, 2025</p>
                <Link href='#' renderIcon={Share}>
                  Invite team members
                </Link>
                <Link href='#' renderIcon={User}>
                  Contact sales
                </Link>
                <Button size='sm' renderIcon={ShoppingCart}>
                  Buy
                </Button>
              </HeaderPopoverContent>
            </HeaderPopover>

            <HeaderGlobalBarExample />
          </Header>

          {/* Define platform level side nav (multi product) */}
          <SideNav
            isTreeview={true}
            aria-label='Main navigation'
            expanded={isSideNavExpanded}
            onSideNavBlur={onClickSideNavExpand}
            isCollapsible
            onOverlayClick={onClickSideNavExpand}
            className='nav--global'
          >
            <SideNavItems>
              <SideNavMenu
                renderIcon={SquareOutline}
                title='Product 1'
                primary
                defaultExpanded
              >
                <SideNavProductExample routesInSideNav={routesInSideNav} />
              </SideNavMenu>
              <SideNavMenu title='Product 2' primary>
                <SideNavMenuItem
                  renderIcon={Home}
                  href='http://www.carbondesignsystem.com'
                >
                  Home product 2
                </SideNavMenuItem>
              </SideNavMenu>
              <SideNavMenu title='Product 3' primary>
                <SideNavMenuItem
                  renderIcon={Home}
                  href='http://www.carbondesignsystem.com'
                >
                  Home product 3
                </SideNavMenuItem>
              </SideNavMenu>
              <SideNavMenu title='Product 4' primary>
                <SideNavMenuItem
                  renderIcon={Home}
                  href='http://www.carbondesignsystem.com'
                >
                  Home product 4
                </SideNavMenuItem>
              </SideNavMenu>
              <SideNavDivider />
              <SideNavLink
                renderIcon={DocumentMultiple_01}
                href='http://www.carbondesignsystem.com'
              >
                Docs
              </SideNavLink>
              <SideNavLink
                renderIcon={Settings}
                href='http://www.carbondesignsystem.com'
              >
                Settings
              </SideNavLink>
            </SideNavItems>
          </SideNav>

          {/* Define current product side nav */}
          <SideNav
            hideRailBreakpointDown='md'
            isRail
            isChildOfHeader={false}
            aria-label='Side navigation'
          >
            <SideNavItems>
              <SideNavProductExample routesInSideNav={routesInSideNav} />
            </SideNavItems>
          </SideNav>
          {children}
        </>
      )}
    />
  );
};
