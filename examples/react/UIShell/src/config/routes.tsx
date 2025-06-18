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
import { Fade } from '@carbon/icons-react';

export const routes = [
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
      seperator: true,
      inHeader: true,
    },
  },
  {
    path: '/sub-menu-1',
    carbon: {
      label: 'Sub menu level 1',
      inSideNav: true,
      icon: Fade,
      subMenu: [],
    },
  },
  {
    // flat so processed correctly by react router - declare after parent
    path: '/sub-menu-1/link-1',
    element: (props) => <GenericPage {...props} />,
    carbon: {
      label: 'Sub link 1',
      inSideNav: true,
      inSubMenu: true,
    },
  },
  {
    // flat so processed correctly by react router - declare after parent
    path: '/sub-menu-1/link-2',
    element: (props) => <GenericPage {...props} />,
    carbon: {
      label: 'Sub Link 2',
      inSideNav: true,
      inSubMenu: true,
    },
  },
  {
    path: '/link-1',
    element: (props) => <GenericPage {...props} />,
    carbon: {
      label: 'Link 1',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    path: '/link-2',
    element: (props) => <GenericPage {...props} />,
    carbon: {
      label: 'Link 2',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    path: '/link-3',
    element: (props) => <GenericPage {...props} />,
    carbon: {
      label: 'Link 3',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    path: '/link-4',
    element: (props) => <GenericPage {...props} />,
    carbon: {
      label: 'Link 4',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    path: '/link-5',
    element: (props) => <GenericPage {...props} />,
    carbon: {
      label: 'Link 5',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    path: '/link-6',
    element: (props) => <GenericPage {...props} />,
    carbon: {
      label: 'Link 6',
      inSideNav: true,
      icon: Fade,
      separator: true,
    },
  },
  {
    path: '/link-7',
    element: (props) => <GenericPage {...props} />,
    carbon: {
      label: 'Link 7',
      inSideNav: true,
      icon: Fade,
    },
  },
  {
    path: '/link-8',
    element: (props) => <GenericPage {...props} />,
    carbon: {
      label: 'Link 8',
      inSideNav: true,
      icon: Fade,
    },
  },
];
