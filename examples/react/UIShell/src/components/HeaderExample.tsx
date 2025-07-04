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
  // SideNavSlot,
} from '@carbon-labs/react-ui-shell';
import {
  SkipToContent,
  Header,
  HeaderName,
  HeaderMenuButton,
  SideNavDivider,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderNavigation,
  HeaderMenuItem,
  MenuButton,
  MenuItemRadioGroup,
  ExpandableSearch,
  Link,
  Button,
  // Dropdown,
} from '@carbon/react';
import {
  // Fade,
  SquareOutline,
  Help,
  Notification,
  UserAvatar,
  Share,
  User,
  ShoppingCart,
  Switcher,
  // Menu,
} from '@carbon/icons-react';
import { useRef, useState } from 'react';

import { routesInHeader, routesInSideNav } from '../config/routes';
import { useLocation, Link as RouterLink } from 'react-router';
import { subMenuParts } from './SubMenuExample';
import { HeaderGlobalBarExample } from './HeaderGlobalBarExample';

export const HeaderExample = ({ children }) => {
  let location = useLocation();

  console.log(routesInSideNav);

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

            {routesInHeader.length > 0 && (
              <HeaderNavigation aria-label="IBM [Platform]">
                {routesInHeader.map(({ path, carbon }) =>
                  carbon?.label ? (
                    <HeaderMenuItem
                      as={RouterLink}
                      to={path}
                      isActive={path === location.pathname}
                      data-test={location}
                      key={path}>
                      {carbon?.label}
                    </HeaderMenuItem>
                  ) : null
                )}
              </HeaderNavigation>
            )}

            <HeaderGlobalBarExample />
          </Header>
          <SideNav
            hideRailBreakpointDown="md"
            isRail
            isChildOfHeader={false}
            aria-label="Side navigation">
            <SideNavItems>
              {routesInSideNav.map(({ path, carbon }) => {
                return carbon?.subMenu ? (
                  subMenuParts({ path, carbon })
                ) : (
                  <>
                    {carbon?.slot ? (
                      <SideNavSlot key={path} renderIcon={carbon.icon}>
                        {carbon.slot()}
                      </SideNavSlot>
                    ) : (
                      <SideNavLink
                        data-key={path}
                        key={path}
                        as={RouterLink}
                        to={path}
                        isActive={path === location.pathname}
                        renderIcon={carbon?.icon}>
                        {carbon?.label}
                      </SideNavLink>
                    )}
                    {carbon?.separator && (
                      <SideNavDivider
                        data-key={path}
                        key={`${path}--divider`}
                      />
                    )}
                  </>
                );
              })}
              {/* {routesInSideNav.map(({ path, carbon }) => (
                <>
                  {carbon?.subMenu ? (
                    <SideNavMenu
                      data-key={path}
                      renderIcon={carbon?.icon}
                      title={carbon?.label}
                      key={path}
                    >
                      {carbon?.subMenu.map((subRoute) => (
                        <SideNavMenuItem
                          as={RouterLink}
                          to={subRoute.path}
                          isActive={subRoute.path === location.pathname}
                          key={subRoute.path}
                        >
                          {subRoute.carbon?.label}
                        </SideNavMenuItem>
                      ))}
                    </SideNavMenu>
                  ) : carbon?.slot ? (
                    <SideNavSlot key={path}>{carbon.slot()}</SideNavSlot>
                  ) : (
                    <SideNavLink
                      data-key={path}
                      key={path}
                      as={RouterLink}
                      to={path}
                      isActive={path === location.pathname}
                      renderIcon={carbon?.icon}
                    >
                      {carbon?.label}
                    </SideNavLink>
                  )}

                  {carbon?.separator && (
                    <SideNavDivider data-key={path} key={`${path}--divider`} />
                  )}
                </>
              ))} */}
            </SideNavItems>
          </SideNav>
          {children}
        </>
      )}
    />
  );
};
