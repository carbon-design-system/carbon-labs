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
import {
  HeaderProps,
  solisDeploymentEnvironment,
} from '../../types/Header.types';

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
    scriptUrl:
      'https://cdn.dev.saas.ibm.com/solis_ui/v1/switcher/solis-switcher.es.js',
    is_prod: false,
    cdn_hostname: 'https://cdn.dev.saas.ibm.com/solis_ui/v1',
    deployment_environment: solisDeploymentEnvironment['local'],
    product_id: 'my_product',
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
  beforeEach(() => {
    // Clean up any existing solis script and window._solis before each test
    const existingScript = document.querySelector(
      'script[src*="solis-switcher"]'
    );
    if (existingScript) {
      existingScript.remove();
    }
    delete (window as any)._solis;
  });

  it('should return "loading" when first run', async () => {
    const status = loadSolisScript.default(propsWithSolisConfig);
    expect(status).to.equal('loading');
  });

  it('should return "idle" when first run', async () => {
    const status = loadSolisScript.default(propsNoSolisConfig);
    expect(status).to.equal('idle');
  });

  it('should create window._solis with correct configuration', async () => {
    // Run the function to load the script
    loadSolisScript.default(propsWithSolisConfig);

    // Check that window._solis exists
    expect((window as any)._solis).to.exist;

    // Check that window._solis has the correct properties
    expect((window as any)._solis.is_prod).to.equal(
      propsWithSolisConfig.solisConfig?.is_prod
    );
    expect((window as any)._solis.cdn_hostname).to.equal(
      propsWithSolisConfig.solisConfig?.cdn_hostname
    );
    expect((window as any)._solis.deployment_environment).to.equal(
      propsWithSolisConfig.solisConfig?.deployment_environment
    );

    expect((window as any)._solis.product_id).to.equal(
      propsWithSolisConfig.solisConfig?.product_id
    );
  });

  it('should not create window._solis when solis is disabled', async () => {
    // Run the function with solis disabled
    loadSolisScript.default(propsNoSolisConfig);

    // Check that window._solis does not exist
    expect((window as any)._solis).to.be.undefined;
  });

  it('should create script element with correct attributes', async () => {
    loadSolisScript.default(propsWithSolisConfig);

    const script = document.querySelector(
      `script[src="${propsWithSolisConfig.solisConfig?.scriptUrl}"]`
    ) as HTMLScriptElement;

    expect(script).to.exist;
    expect(script.type).to.equal('module');
    expect(script.defer).to.be.true;
    expect(script.async).to.be.true;
    expect(script.crossOrigin).to.equal('anonymous');
    expect(script.getAttribute('data-status')).to.equal('loading');
  });
});
