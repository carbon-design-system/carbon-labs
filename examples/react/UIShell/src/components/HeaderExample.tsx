/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  SIDE_NAV_TYPE,
  SideNav,
  SideNavItems,
  SideNavMenu,
  HeaderContainer,
  HeaderPopover,
  HeaderPopoverButton,
  HeaderPopoverContent,
  TrialCountdown,
} from '@carbon-labs/react-ui-shell';
import {
  ThemeSettings,
  ThemeSwitcher,
} from '@carbon-labs/react-theme-settings';
import {
  SkipToContent,
  Header,
  HeaderName,
  HeaderMenuButton,
  Link,
  Button,
  SideNavLink,
  Theme,
  Content,
} from '@carbon/react';
import { Share, User, ShoppingCart, Switcher } from '@carbon/icons-react';

import { Link as RouterLink, useLocation } from 'react-router';
import { HeaderGlobalBarExample } from './HeaderGlobalBarExample';
import { SideNavProductExample } from './SideNavProductExample';
import { routesInSideNav } from '../config/routes';
import { HeaderNavigationExample } from './HeaderNavigationExample';
import { useEffect, useState } from 'react';

/**
 *
 */
function useThemeSettings() {
  const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

  const [themeSetting, setThemeSetting] = useState('system');
  const [themeMenuComplement] = useState(false);
  const [themeSet] = useState('white/g100');
  const [systemDark, setSystemDark] = useState(mediaQueryList.matches);
  const [currentTheme, setCurrentTheme] = useState('white');
  const [themeHeader, setThemeHeader] = useState('g100');

  useEffect(() => {
    /**
     *
     * @param {MediaQueryListEvent} event - The media query change event object.
     */
    const handleMediaQueryEvent = (event) => {
      setSystemDark(event.matches);
    };

    mediaQueryList.addEventListener('change', handleMediaQueryEvent);
    return () =>
      mediaQueryList.removeEventListener('change', handleMediaQueryEvent);
  }, [mediaQueryList]);

  useEffect(() => {
    const [lightTheme, darkTheme] = themeSet.split('/');

    if (themeSetting === 'system') {
      setCurrentTheme(systemDark ? darkTheme : lightTheme);
      setThemeHeader(
        (systemDark && !themeMenuComplement) ||
          (!systemDark && themeMenuComplement)
          ? darkTheme
          : lightTheme
      );
    } else if (themeSetting === 'light') {
      setCurrentTheme(lightTheme);
      setThemeHeader(themeMenuComplement ? darkTheme : lightTheme);
    } else {
      setCurrentTheme(darkTheme);
      setThemeHeader(themeMenuComplement ? lightTheme : darkTheme);
    }
  }, [systemDark, themeSetting, themeMenuComplement, themeSet]);

  return {
    themeSetting,
    setThemeSetting,
    themeHeader,
    currentTheme,
  };
}

export const HeaderExample = ({ children }) => {
  const { themeSetting, setThemeSetting, themeHeader, currentTheme } =
    useThemeSettings();
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
    <Theme theme={themeHeader}>
      <HeaderContainer
        render={({
          isSideNavExpanded,
          onClickSideNavExpand,
          isProfileExpanded,
          onClickProfileExpand,
        }) => (
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

              <HeaderGlobalBarExample
                isProfileExpanded={isProfileExpanded}
                onClickProfileExpand={onClickProfileExpand}
                themeSetting={themeSetting}
                setThemeSetting={setThemeSetting}
              />
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
                      key={path}
                      renderIcon={carbon?.icon}
                      title={carbon?.label!}
                      primary
                      defaultExpanded={carbon?.product?.defaultExpanded}>
                      <SideNavProductExample
                        routesInSideNav={carbon?.subMenu!}
                      />
                    </SideNavMenu>
                  ) : (
                    <SideNavLink
                      key={path}
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
            <Theme theme={currentTheme === 'white' ? 'g10' : 'g90'}>
              <SideNav
                hideRailBreakpointDown="md"
                navType={SIDE_NAV_TYPE.RAIL_PANEL}
                isChildOfHeader={false}
                aria-label="Side navigation">
                <SideNavItems>
                  <SideNavProductExample
                    routesInSideNav={currentProductSubMenu?.carbon?.subMenu!}
                  />
                </SideNavItems>
              </SideNav>
            </Theme>
            <Theme
              as={Content}
              theme={currentTheme === 'white' ? 'g10' : 'g90'}>
              {children}
            </Theme>
          </>
        )}
      />
    </Theme>
  );
};
