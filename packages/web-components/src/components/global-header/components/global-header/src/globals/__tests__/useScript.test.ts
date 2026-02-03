/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import * as useScript from '../useScript';
import { HeaderProps } from '../../types/Header.types';

const propsWithAssisitMeConfig: HeaderProps = {
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
  assistMeConfigs: {
    productId: 'a22453643cdb9e22397c6eab9e9da97d',
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

const propsNoAssisitMe: HeaderProps = {
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

const assistMeDevSrc =
  'https://ibmassistme-dev.zll1vg8lrcq.us-south.codeengine.appdomain.cloud/resources/assist-me/controller.js';

describe('useScript function', () => {
  it('should return "loading" when first run', async () => {
    const status = useScript.default(propsWithAssisitMeConfig);
    expect(status).to.equal('loading');
  });

  it('should return "idle" when first run', async () => {
    const status = useScript.default(propsNoAssisitMe);
    expect(status).to.equal('idle');
  });
  // this test is failing with .only (I expect it's relient on earlier test).
  it('should return status of "loading" or "ready" when script is in DOM an function is called', async () => {
    const el = await fixture(html`
      <script
        src="${assistMeDevSrc}"
        defer=""
        async=""
        crossorigin="anonymous"
        data-status=""></script>
    `);
    expect(el).to.exist;

    const status = useScript.default(propsWithAssisitMeConfig);
    expect(status).to.be.oneOf(['ready', 'loading']);
  });
});
