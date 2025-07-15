/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { HeaderMenu, HeaderMenuItem, HeaderNavigation } from '@carbon/react';
import { Link, useLocation } from 'react-router';
import { routesInHeader } from '../config/routes';

export const HeaderNavigationExample = () => {
  const location = useLocation();

  return (
    <HeaderNavigation aria-label="header navigation routes">
      {routesInHeader.map(({ path, carbon }) =>
        !carbon!.inSubMenu && carbon?.label ? (
          carbon.subMenu ? (
            <HeaderMenu
              aria-label={carbon.label}
              key={path}
              menuLinkName={carbon.label}>
              {carbon.subMenu.map((subRoute) => (
                <HeaderMenuItem
                  as={Link}
                  to={subRoute.path}
                  key={subRoute.path}
                  isActive={subRoute.path === location.pathname}>
                  {subRoute.carbon!.label}
                </HeaderMenuItem>
              ))}
            </HeaderMenu>
          ) : (
            <HeaderMenuItem
              as={Link}
              key={path}
              to={path}
              isActive={path === location.pathname}>
              {carbon?.label}
            </HeaderMenuItem>
          )
        ) : null
      )}
    </HeaderNavigation>
  );
};
