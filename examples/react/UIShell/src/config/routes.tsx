/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Home } from '../pages/Home';
import { About } from '../pages/About';
import { GenericPage } from '../pages/GenericPage';
import { CarbonIconType, Fade } from '@carbon/icons-react';

type carbonRouteType = {
  label: string;
  inHeader?: boolean;
  inSideNav?: boolean;
  separator?: boolean;
  icon?: CarbonIconType;
  subMenu?: routesType[];
  inSubMenu?: boolean;
};

type routesType = {
  path: string;
  index?: boolean;
  element?: ({ usingOutlet }: { usingOutlet?: boolean }) => JSX.Element;
  carbon?: carbonRouteType;
};

export const routes: routesType[] = [
  {
    path: '/',
    index: true,
    element: Home,
  },
  {
    path: '/about',
    element: About,
    carbon: {
      label: 'About',
      separator: true,
      inHeader: true,
    },
  },
  {
    path: '/sub-menu-1',
    carbon: {
      label: 'Sub menu level 1',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    // flat so processed correctly by react router - declare after parent
    path: '/sub-menu-1/link-1',
    element: GenericPage,
    carbon: {
      label: 'Sub link 1',
      inSideNav: true,
    },
  },
  {
    // flat so processed correctly by react router - declare after parent
    path: '/sub-menu-1/link-2',
    element: GenericPage,
    carbon: {
      label: 'Sub Link 2',
      inSideNav: true,
    },
  },
  {
    path: '/link-1',
    element: GenericPage,
    carbon: {
      label: 'Link 1',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    path: '/link-2',
    element: GenericPage,
    carbon: {
      label: 'Link 2',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    path: '/link-3',
    element: GenericPage,
    carbon: {
      label: 'Link 3',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    path: '/link-4',
    element: GenericPage,
    carbon: {
      label: 'Link 4',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    path: '/link-5',
    element: GenericPage,
    carbon: {
      label: 'Link 5',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    path: '/link-6',
    element: GenericPage,
    carbon: {
      label: 'Link 6',
      inSideNav: true,
      icon: Fade,
      separator: true,
    },
  },
  {
    path: '/link-7',
    element: GenericPage,
    carbon: {
      label: 'Link 7',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    path: '/link-8',
    element: GenericPage,
    carbon: {
      label: 'Link 8',
      inSideNav: true,
      icon: Fade,
    },
  },
];

// The routes config is a flat structure defined for use with react-router.
// Here we organize the routes into a hierarchy for use by the Carbon header and sidenav
// NOTE: The routes are processed outside of a component as they are not dynamic.
const routesProcessed = routes.map((route) => {
  if (!route.carbon) {
    return route;
  }

  const subMenu = routes.filter(
    (subRoute) => !route.index && subRoute.path.startsWith(`${route.path}/`)
  );

  if (subMenu && subMenu.length > 0) {
    // add sub menu to parent
    route.carbon = route.carbon ?? {};
    route.carbon.subMenu = subMenu;

    // mark child as in sub menu
    subMenu.forEach((menu) => {
      // Carbon should never by blank
      menu.carbon = menu.carbon ?? { label: menu.path };
      menu.carbon.inSubMenu = true;
    });
  }

  return route;
});

export const routesInHeader = routesProcessed.filter(
  (route) => route?.carbon?.inHeader && !route?.carbon?.inSubMenu
);
export const routesInSideNav = routesProcessed.filter(
  (route) => route?.carbon?.inSideNav && !route?.carbon?.inSubMenu
);
