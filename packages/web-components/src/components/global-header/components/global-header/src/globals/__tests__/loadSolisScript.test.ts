/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect } from '@open-wc/testing';
import * as loadSolisScript from '../loadSolisScript';
import { HeaderProps, solisDeploymentEnvironment } from '../../types/Header.types';

const propsWithSolisConfig: HeaderProps = {
  brand: {
    company: 'IBM',
    product: 'webMethods Hybrid Integration',
  },
  capabilityName: {
    label: 'App Connect',
  },
  profile: {
    imageUrl: undefined,
    email: 'user@test.com',
    displayName: 'Sample User',
  },
  mainSectionItems: [
    { label: 'Instance name', text: 'APIC-MB-DEV' },
    { label: 'Region', text: 'us-east-1 (N Virginia)' },
    { label: 'Instance owner', text: 'user@ibm.com' },
  ],
  profileFooterLinks: [
    {
      text: 'Log out',
      href: '/logout',
      carbonIcon: 'Logout',
      arialLabel: 'Logout',
    },
  ],
  solisConfig: {
    isEnabled: true,
    scriptUrl: 'https://cdn.dev.saas.ibm.com/solis_ui/v1/switcher/solis-switcher.es.js',
    is_prod: false,
    cdn_hostname: 'https://cdn.dev.saas.ibm.com/solis_ui/v1',
    deployment_environment: solisDeploymentEnvironment['local']
  },
  switcherConfigs: [
    {
      floatLeft: true,
      iconsLeft: true,
      items: [
        {
          label: 'Environment 1',
          href: '#',
          carbonIcon: 'Checkmark',
          id: '',
          text: '',
        },
        {
          label: 'Environment 2',
          href: '#',
          carbonIcon: 'Checkmark',
          id: '',
          text: '',
        },
        {
          label: 'Environment 3',
          href: '#',
          carbonIcon: 'Checkmark',
          isLastInList: true,
          id: '',
          text: '',
        },
        {
          label: 'Manage environments',
          href: '#',
          carbonIcon: 'Settings',
          isLinkItem: true,
          id: '',
          text: '',
        },
      ],
    },
  ],
  sideNav: {
    isCollapsible: true,
    autoCollapseOnLeave: true,
    buttonLabel: 'Open menu',
    sidebarLabel: 'Side navigation',
    groups: [
      {
        links: [
          {
            href: '#',
            label: 'Home',
            iconName: 'Home',
            isActive: true,
            sideNavMenuItems: [],
          },
          {
            href: '#',
            label: 'Access management',
            iconName: 'User',
            isActive: false,
            sideNavMenuItems: [],
          },
        ],
      },
      {
        links: [
          {
            label: 'APIs',
            iconName: 'Api',
            isSideNavMenuItems: true,
            sideNavMenuItems: [
              {
                href: '#',
                label: 'API Connect',
                isActive: false,
              },
            ],
            href: '',
          },
          {
            label: 'App Integration',
            iconName: 'FlowConnection',
            isSideNavMenuItems: true,
            sideNavMenuItems: [
              {
                href: '#',
                label: 'webMethods Integration',
                isActive: false,
              },
              {
                href: '#',
                label: 'App Connect',
                isActive: false,
              },
            ],
            href: '',
          },
          {
            href: '#',
            label: 'Event endpoint management',
            iconName: 'IbmEventAutomation',
            sideNavMenuItems: [],
          },
        ],
      },
      {
        links: [
          {
            href: '#',
            label: 'Metering',
            iconName: 'Meter',
            sideNavMenuItems: [],
          },
          {
            href: '#',
            label: 'End-to-end monitoring',
            iconName: 'Analytics',
            sideNavMenuItems: [],
          },
        ],
      },
    ],
    isRail: false,
    links: [],
    isChildOfHeader: false,
  },
};

const propsNoSolisConfig: HeaderProps = {
  brand: {
    company: 'IBM',
    product: 'webMethods Hybrid Integration',
  },
  capabilityName: {
    label: 'App Connect',
  },
  profile: {
    imageUrl: undefined,
    email: 'user@test.com',
    displayName: 'Sample User',
  },
  mainSectionItems: [
    { label: 'Instance name', text: 'APIC-MB-DEV' },
    { label: 'Region', text: 'us-east-1 (N Virginia)' },
    { label: 'Instance owner', text: 'user@ibm.com' },
  ],
  profileFooterLinks: [
    {
      text: 'Log out',
      href: '/logout',
      carbonIcon: 'Logout',
      arialLabel: 'Logout',
    },
  ],
  switcherConfigs: [
    {
      floatLeft: true,
      iconsLeft: true,
      items: [
        {
          label: 'Environment 1',
          href: '#',
          carbonIcon: 'Checkmark',
          id: '',
          text: '',
        },
        {
          label: 'Environment 2',
          href: '#',
          carbonIcon: 'Checkmark',
          id: '',
          text: '',
        },
        {
          label: 'Environment 3',
          href: '#',
          carbonIcon: 'Checkmark',
          isLastInList: true,
          id: '',
          text: '',
        },
        {
          label: 'Manage environments',
          href: '#',
          carbonIcon: 'Settings',
          isLinkItem: true,
          id: '',
          text: '',
        },
      ],
    },
  ],
  sideNav: {
    isCollapsible: true,
    autoCollapseOnLeave: true,
    buttonLabel: 'Open menu',
    sidebarLabel: 'Side navigation',
    groups: [
      {
        links: [
          {
            href: '#',
            label: 'Home',
            iconName: 'Home',
            isActive: true,
            sideNavMenuItems: [],
          },
          {
            href: '#',
            label: 'Access management',
            iconName: 'User',
            isActive: false,
            sideNavMenuItems: [],
          },
        ],
      },
      {
        links: [
          {
            label: 'APIs',
            iconName: 'Api',
            isSideNavMenuItems: true,
            sideNavMenuItems: [
              {
                href: '#',
                label: 'API Connect',
                isActive: false,
              },
            ],
            href: '',
          },
          {
            label: 'App Integration',
            iconName: 'FlowConnection',
            isSideNavMenuItems: true,
            sideNavMenuItems: [
              {
                href: '#',
                label: 'webMethods Integration',
                isActive: false,
              },
              {
                href: '#',
                label: 'App Connect',
                isActive: false,
              },
            ],
            href: '',
          },
          {
            href: '#',
            label: 'Event endpoint management',
            iconName: 'IbmEventAutomation',
            sideNavMenuItems: [],
          },
        ],
      },
      {
        links: [
          {
            href: '#',
            label: 'Metering',
            iconName: 'Meter',
            sideNavMenuItems: [],
          },
          {
            href: '#',
            label: 'End-to-end monitoring',
            iconName: 'Analytics',
            sideNavMenuItems: [],
          },
        ],
      },
    ],
    isRail: false,
    links: [],
    isChildOfHeader: false,
  },
};

describe('loadSolisScript function', () => {
  it('should return "loading" when first run', async () => {
    const status = loadSolisScript.default(propsWithSolisConfig);
    expect(status).to.equal('loading');
  });

  it('should return "idle" when first run', async () => {
    const status = loadSolisScript.default(propsNoSolisConfig);
    expect(status).to.equal('idle');
  });
});
