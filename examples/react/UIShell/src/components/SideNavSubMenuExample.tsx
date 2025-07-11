/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { routesType } from '../config/routes';
import { SideNavDivider, SideNavMenu, SideNavMenuItem } from '@carbon/react';
import { Link, useLocation } from 'react-router';

export const SideNavSubMenuExample = (route: routesType) => {
  const location = useLocation();
  const { path, carbon } = route;

  if (!carbon || !carbon.subMenu || path === undefined) {
    return;
  }

  return (
    <>
      <SideNavMenu renderIcon={carbon?.icon} title={carbon?.label} key={path}>
        {carbon.subMenu.map((subRoute: routesType) => {
          const carbonSub = subRoute.carbon;
          const subPath = path + subRoute.path;

          return carbonSub && carbonSub.subMenu ? (
            <SideNavSubMenuExample path={subPath} carbon={carbonSub} />
          ) : (
            <div key={subRoute.path}>
              <SideNavMenuItem
                as={Link}
                to={subRoute.path}
                isActive={subRoute.path === location.pathname}>
                {carbonSub?.label}
              </SideNavMenuItem>
              {carbonSub?.separator && <SideNavDivider />}
            </div>
          );
        })}
      </SideNavMenu>
      {carbon?.separator && (
        <SideNavDivider data-key={path} key={`${path}--divider`} />
      )}
    </>
  );
};
