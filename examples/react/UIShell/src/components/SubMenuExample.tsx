import { ReactNode } from 'react';
import { carbonRouteType, routesType } from '../config/routes';
import { SideNavDivider, SideNavMenu, SideNavMenuItem } from '@carbon/react';
import { Link } from 'react-router';

type subMenuPartsProps = {
  path: string;
  carbon: carbonRouteType;
};

export const subMenuParts = ({ path, carbon }: subMenuPartsProps) => {
  const parts: Array<ReactNode> = [];

  if (!carbon || !carbon.subMenu || path === undefined) {
    return;
  }

  const part = (
    <SideNavMenu renderIcon={carbon?.icon} title={carbon?.label} key={path}>
      {carbon.subMenu.map((subRoute: routesType) => {
        const carbonSub = subRoute.carbon;
        const subPath = path + subRoute.path;

        return carbonSub && carbonSub.subMenu ? (
          subMenuParts({ path: subPath, carbon: carbonSub })
        ) : (
          <>
            <SideNavMenuItem
              as={Link}
              to={subRoute.path}
              isActive={subRoute.path === location.pathname}
              key={subRoute.path}
            >
              {carbonSub?.label}
            </SideNavMenuItem>
            {carbonSub?.separator && (
              <SideNavDivider key={`${path}--divider`} />
            )}
          </>
        );
      })}
    </SideNavMenu>
  );

  parts.push(part);

  if (carbon?.separator) {
    parts.push(<SideNavDivider data-key={path} key={`${path}--divider`} />);
  }

  return parts;
};
