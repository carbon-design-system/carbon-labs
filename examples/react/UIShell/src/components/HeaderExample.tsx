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
  HeaderNavigation,
  HeaderMenuItem,
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

import { Link as RouterLink, useLocation } from 'react-router';
import { HeaderGlobalBarExample } from './HeaderGlobalBarExample';
import { SideNavProductExample } from './SideNavProductExample';
import { routesInSideNav } from '../config/routes';
import { HeaderNavigationExample } from './HeaderNavigationExample';
import { useEffect, useMemo, useState } from 'react';

export const HeaderExample = ({ children }) => {
  const location = useLocation();
  const [productPath, setProductPath] = useState('/product-1');

  useEffect(() => {
    const productPathMaybe = location.pathname.split('/')[1];
    if (productPathMaybe.startsWith('product')) {
      setProductPath(`/${productPathMaybe}`);
    }
  }, [location.pathname]);

  const currentProductSubMenu = routesInSideNav.find(({ path }) => {
    // a better mechanism to switch product would be useful
    return path.startsWith(productPath);
  });

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
              renderMenuIcon={<Switcher size={20} />}
            />
            <HeaderName as={RouterLink} to="/" prefix="IBM">
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

            <HeaderNavigationExample />

            <HeaderGlobalBarExample />
          </Header>

          {/* Define platform level side nav (multi product) */}
          <SideNav
            isTreeview={true}
            aria-label="Main navigation"
            expanded={isSideNavExpanded}
            onSideNavBlur={onClickSideNavExpand}
            isCollapsible
            onOverlayClick={onClickSideNavExpand}
            className="nav--global">
            <SideNavItems>
              {routesInSideNav.map(({ path, carbon }) =>
                carbon?.subMenu ? (
                  <SideNavMenu
                    renderIcon={carbon?.icon}
                    title={carbon?.label!}
                    primary
                    defaultExpanded={carbon?.product?.defaultExpanded}>
                    <SideNavProductExample routesInSideNav={carbon?.subMenu!} />
                  </SideNavMenu>
                ) : (
                  <SideNavLink
                    renderIcon={carbon?.icon}
                    as={RouterLink}
                    to={path}>
                    {carbon?.label!}
                  </SideNavLink>
                )
              )}
            </SideNavItems>
          </SideNav>

          {/* Define current product side nav */}
          <SideNav
            hideRailBreakpointDown="md"
            isRail
            isChildOfHeader={false}
            aria-label="Side navigation">
            <SideNavItems>
              <SideNavProductExample
                routesInSideNav={currentProductSubMenu?.carbon?.subMenu!}
              />
            </SideNavItems>
          </SideNav>
          {children}
        </>
      )}
    />
  );
};
