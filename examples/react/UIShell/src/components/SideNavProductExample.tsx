import { SideNavSlot, SideNavLink } from '@carbon-labs/react-ui-shell';
import { SideNavDivider } from '@carbon/react';
import { Link, useLocation } from 'react-router';
import { SideNavSubMenuExample } from './SideNavSubMenuExample';
import { routesType } from '../config/routes';

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
          <SideNavSubMenuExample path={path} carbon={carbon} />
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
                renderIcon={carbon?.icon}
              >
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
