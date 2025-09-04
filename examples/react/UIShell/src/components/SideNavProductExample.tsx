/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SideNavSlot, SideNavLink } from '@carbon-labs/react-ui-shell';
import { SideNavDivider } from '@carbon/react';
import { Link, useLocation } from 'react-router';
import { SideNavSubMenuExample } from './SideNavSubMenuExample';
import type { routesType } from '../config/routes';

type SideNavProductExampleProps = {
  routesInSideNav: routesType[];
};

export const SideNavProductExample = ({
  routesInSideNav,
}: SideNavProductExampleProps) => {
  const location = useLocation();

  return (
    <>
      {routesInSideNav.map((route) => {
        const { path, carbon } = route;

        return carbon?.subMenu ? (
          <SideNavSubMenuExample path={path} carbon={carbon} key={path} />
        ) : (
          <div key={path}>
            {carbon?.slot ? (
              <SideNavSlot renderIcon={carbon.icon}>
                {carbon.slot()}
              </SideNavSlot>
            ) : (
              <SideNavLink
                as={Link}
                to={path}
                isActive={path === location.pathname}
                renderIcon={carbon?.icon}>
                {carbon?.label}
              </SideNavLink>
            )}
            {carbon?.separator && <SideNavDivider />}
          </div>
        );
      })}
    </>
  );
};
