/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// NOTE: The route config in this file is a flat structure as used by React Router.
// It contains information for Carbon and is processed to make it easier for Carbon to consume.

import { Home as HomePage } from '../pages/Home';
import { About } from '../pages/About';
import { Placeholder } from '../pages/Placeholder';
import type { CarbonIconType } from '@carbon/icons-react';
import {
  Home,
  VirtualColumnKey,
  BusinessProcesses,
  Application,
  Platforms,
  Layers,
  Dashboard,
  DataAnalytics,
  EventIncident,
  Security,
  WorkflowAutomation,
  DocumentMultiple_01,
  Settings,
  OverflowMenuVertical,
  Bee,
  Box,
  BoxPlot,
} from '@carbon/icons-react';
import { NotFound } from '../pages/NotFound';
import { DropdownExample } from '../components/DropdownExample';

export type carbonRouteType = {
  label: string;
  inHeader?: boolean;
  inSideNav?: boolean;
  separator?: boolean;
  icon?: CarbonIconType;
  subMenu?: routesType[];
  inSubMenu?: boolean;
  slot?: () => JSX.Element;

  // platform level
  product?: { defaultExpanded?: boolean };
};

export type routesType = {
  path: string;
  index?: boolean;
  element?: ({ usingOutlet }: { usingOutlet?: boolean }) => JSX.Element;
  carbon?: carbonRouteType;
};

export const routes: routesType[] = [
  {
    path: '/',
    index: true,
    element: HomePage,
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
    path: '/product-1',
    carbon: {
      label: 'Product 1',
      inSideNav: true,
      icon: Bee,
      product: { defaultExpanded: true },
    },
  },
  {
    path: '/product-1/slot-1',
    carbon: {
      label: '',
      inSideNav: true,
      slot: DropdownExample,
      icon: VirtualColumnKey,
      separator: true,
    },
  },
  {
    path: '/product-1/home',
    carbon: {
      label: 'Home',
      inSideNav: true,
      icon: Home,
      separator: true,
    },
  },
  {
    // flat so processed correctly by react router - declare after parent
    path: '/product-1/home/sub-menu-1',
    element: Placeholder,
    carbon: {
      label: 'Sub menu 1',
      inSideNav: true,
    },
  },
  {
    path: '/product-1/home/sub-menu-2',
    element: Placeholder,
    carbon: {
      label: 'Sub menu 2',
      inSideNav: true,
    },
  },
  {
    path: '/product-1/home/sub-menu-3',
    element: Placeholder,
    carbon: {
      label: 'Sub menu 3',
      inSideNav: true,
    },
  },
  {
    path: '/product-1/business',
    element: Placeholder,
    carbon: {
      label: 'Business',
      inSideNav: true,
      icon: BusinessProcesses,
    },
  },
  {
    path: '/product-1/applications',
    element: Placeholder,
    carbon: {
      label: 'Applications',
      inSideNav: true,
      icon: Application,
    },
  },
  {
    path: '/product-1/platforms',
    element: Placeholder,
    carbon: {
      label: 'Platforms',
      inSideNav: true,
      icon: Platforms,
    },
  },
  {
    path: '/product-1/infrastructure',
    element: Placeholder,
    carbon: {
      label: 'Infrastructure',
      inSideNav: true,
      icon: Layers,
      separator: true,
    },
  },
  {
    path: '/product-1/dashboard',
    element: Placeholder,
    carbon: {
      label: 'Dashboard',
      inSideNav: true,
      icon: Dashboard,
    },
  },
  {
    path: '/product-1/analytics',
    element: Placeholder,
    carbon: {
      label: 'Analytics',
      inSideNav: true,
      icon: DataAnalytics,
    },
  },
  {
    path: '/product-1/incidents',
    element: Placeholder,
    carbon: {
      label: 'Incidents',
      inSideNav: true,
      icon: EventIncident,
    },
  },
  {
    path: '/product-1/security',
    element: Placeholder,
    carbon: {
      label: 'Security',
      inSideNav: true,
      icon: Security,
    },
  },
  {
    path: '/product-1/automations',
    element: Placeholder,
    carbon: {
      label: 'Automations',
      inSideNav: true,
      icon: WorkflowAutomation,
      separator: true,
    },
  },
  {
    path: '/product-1/docs',
    element: Placeholder,
    carbon: {
      label: 'Docs',
      inSideNav: true,
      icon: DocumentMultiple_01,
    },
  },
  {
    path: '/product-1/settings',
    element: Placeholder,
    carbon: {
      label: 'Settings',
      inSideNav: true,
      icon: Settings,
    },
  },
  {
    path: '/product-1/more',
    element: Placeholder,
    carbon: {
      label: 'More',
      inSideNav: true,
      icon: OverflowMenuVertical,
    },
  },
  {
    path: '/product-2',
    carbon: {
      label: 'Product 2',
      inSideNav: true,
      icon: Application,
      product: {},
    },
  },
  {
    path: '/product-2/home',
    element: Placeholder,
    carbon: {
      label: 'Home product 2',
      inSideNav: true,
      icon: Home,
    },
  },
  {
    path: '/product-3',
    carbon: {
      label: 'Product 3',
      inSideNav: true,
      icon: Box,
      product: {},
    },
  },
  {
    path: '/product-3/home',
    element: Placeholder,
    carbon: {
      label: 'Home product 3',
      inSideNav: true,
      icon: Home,
    },
  },
  {
    path: '/product-4',
    carbon: {
      label: 'Product 4',
      inSideNav: true,
      icon: BoxPlot,
      product: {},
    },
  },
  {
    path: '/product-4/home',
    element: Placeholder,
    carbon: {
      label: 'Home product 4',
      inSideNav: true,
      icon: Home,
    },
  },
  {
    path: '/docs',
    element: Placeholder,
    carbon: {
      label: 'Docs',
      inSideNav: true,
      icon: DocumentMultiple_01,
    },
  },
  {
    path: '/settings',
    element: Placeholder,
    carbon: {
      label: 'Settings',
      inSideNav: true,
      icon: Settings,
    },
  },
  {
    path: '*',
    element: NotFound,
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
    (subRoute) => !route.index && subRoute.path.startsWith(`${route.path}/`),
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
  (route) => route?.carbon?.inHeader && !route?.carbon?.inSubMenu,
);
export const routesInSideNav = routesProcessed.filter(
  (route) => route?.carbon?.inSideNav && !route?.carbon?.inSubMenu,
);
