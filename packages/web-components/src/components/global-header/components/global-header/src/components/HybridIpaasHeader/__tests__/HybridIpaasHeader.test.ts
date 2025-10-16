/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { fixture, html, expect } from '@open-wc/testing';
import sinon from 'sinon';
import { waitUntil } from '@open-wc/testing';

import '../HybridIpaasHeader';
import { HybridIpaasHeader } from '../HybridIpaasHeader';
import '../HybridIpaasHeader';
import {
  GlobalActionConfig,
  ProfileFooterLinks,
  SearchConfigs,
} from '../../../types/Header.types';

describe('HybridIpaasHeader Component', () => {
  const fetchResp = {
    brand: {
      company: 'companyName',
      product: 'productName',
    },
    managementConsoleHref: '#',
    profile: {
      displayName: 'John Doe',
      email: 'John.doe@email.com',
    },
    profileFooterLinks: [],
    switcherConfigs: [
      {
        iconsLeft: true,
        initialSelectedIndex: 1,
        items: [
          {
            label: 'Development',
            isHeading: true,
          },
          {
            label: 'ibmusdev',
            href: 'https://xxxm.com',
            carbonIcon: 'Checkmark',
          },
          {
            label: 'Production',
            isHeading: true,
          },
          {
            label: 'prod1',
            href: 'https://yyy.com',
            carbonIcon: 'Checkmark',
            isLastInList: true,
          },
          {
            label: 'Manage environments',
            href: '#',
            carbonIcon: 'Settings',
            isLinkItem: true,
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
              href: 'https://eyebee.ibm.com',
              label: 'Home',
              iconName: 'Home',
            },
            {
              label: ' xxxcontrol',
              isSideNavMenuItems: true,
              sideNavMenuItems: [
                {
                  href: 'https://eyebeemdev/ibm.com',
                  label: 'Endnd',
                },
                {
                  href: 'https://eyebeemdevhh.com',
                  label: 'APIt',
                },
              ],
              iconName: 'ScisControlTower',
            },
            {
              label: 'Applications',
              isSideNavMenuItems: true,
              sideNavMenuItems: [
                {
                  href: 'https://eyebeemdev.com',
                  label: 'webMethods Integration',
                },
                {
                  href: 'https://eyebeemdev-d.com',
                  label: 'Connect',
                },
              ],
              iconName: '',
            },
          ],
        },
      ],
    },
  };
  it('renders the component', async () => {
    const element = await fixture(
      html`<clabs-global-header-hybrid-ipaas></clabs-global-header-hybrid-ipaas>`
    );

    expect(element).to.exist;
  });

  it('should log an error if productKey is missing', async () => {
    const consoleErrorStub = sinon.stub(console, 'error');
    await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas></clabs-global-header-hybrid-ipaas>`
    );

    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(
      consoleErrorStub.calledWith(
        'A product key is required for the environment switcher to function.'
      )
    ).to.be.true;

    consoleErrorStub.restore();
  });

  it('should log an error if productKey is missing', async () => {
    const consoleErrorStub = sinon.stub(console, 'error');
    await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas></clabs-global-header-hybrid-ipaas>`
    );

    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(
      consoleErrorStub.calledWith(
        'A product key is required for the environment switcher to function.'
      )
    ).to.be.true;

    consoleErrorStub.restore();
  });

  it('should log an error if resonse is not OK', async () => {
    const consoleErrorStub = sinon.stub(console, 'error');
    const fetchStub = sinon.stub(window, 'fetch').resolves(
      new Response(null, {
        status: 401,
        statusText: 'unauthorized',
      })
    );

    await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas
        productKey="valid-key"></clabs-global-header-hybrid-ipaas>`
    );

    expect(consoleErrorStub.calledOnce).to.be.true;

    fetchStub.restore();
    consoleErrorStub.restore();
  });
  it('should call fetch with correct headers and URL', async () => {
    const fetchStub = sinon
      .stub(window, 'fetch')
      .resolves(new Response('{}', { status: 200 }));
    await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas
        .fetchHeaders=${{ 'Content-Type': 'application/json' }}
        basePath="/api"
        productKey="test-productKey"></clabs-global-header-hybrid-ipaas>`
    );

    expect(fetchStub.calledOnce).to.be.true;
    const fetchArgs = fetchStub.getCall(0).args;
    expect(fetchArgs[0]).to.equal('/api/hybrid-ipaas/v1/header/options');
    expect(fetchArgs[1]?.headers).to.include({
      'x-hybrid-ipaas-product-key': 'test-productKey',
    });

    fetchStub.restore();
  });

  it('should update headerOptions correctly', async () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves(
      new Response(JSON.stringify(fetchResp), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const el = await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas
        productName="Test Product"
        productKey="test-productKey"
        basePath="/base"
        displayName="Test User"
        userEmail="test@example.com"
        productVersion="2.0.0"
        assistMeKey="assist-key"></clabs-global-header-hybrid-ipaas>`
    );
    await waitUntil(
      () => el.headerOptions.profile?.email === 'test@example.com',
      'headerOptions were not updated as expected'
    );

    expect(el.headerOptions.brand?.company).to.equal('companyName');
    expect(el.headerOptions.capabilityName?.label).to.equal('Test Product');
    expect(el.headerOptions.profile?.email).to.equal('test@example.com');
    expect(el.headerOptions.profile?.displayName).to.equal('Test User');
    expect(el.headerOptions.mainSectionItems).to.deep.equal([
      { label: 'Product', text: 'Test Product' },
      { label: 'Version', text: '2.0.0' },
    ]);
    expect(el.headerOptions.assistMeConfigs).to.deep.equal({
      productId: 'assist-key',
    });

    fetchStub.restore();
  });

  it('should handle logoutCallback passed in', async () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves(
      new Response(JSON.stringify(fetchResp), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const logoutCallbackSpy = sinon.spy();

    const el = await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas
        productName="Test Product"
        productKey="test-productKey"
        basePath="/base"
        assistMeKey="assist-key"
        .logoutCallback="${logoutCallbackSpy}"></clabs-global-header-hybrid-ipaas>`
    );
    await waitUntil(
      () => el.headerOptions.capabilityName?.label === 'Test Product',
      'headerOptions were not updated as expected'
    );
    expect(el.headerOptions?.profileFooterLinks?.length).to.equal(1);

    expect(el.headerOptions?.profileFooterLinks).to.have.deep.members([
      {
        arialLabel: 'Logout',
        carbonIcon: 'Logout',
        onClickHandler: logoutCallbackSpy,
        text: 'Log out',
      },
    ]);

    fetchStub.restore();
  });

  it('should handle notificationOpenCallback', async () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves(
      new Response(JSON.stringify(fetchResp), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const notificationCallbackSpy = sinon.spy();

    const el = await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas
        productName="Test Product"
        productKey="test-productKey"
        basePath="/base"
        assistMeKey="assist-key"
        .notificationOpenCallback="${notificationCallbackSpy}"
        .hasNewNotifications="${false}"></clabs-global-header-hybrid-ipaas>`
    );
    await waitUntil(
      () => el.headerOptions.capabilityName?.label === 'Test Product',
      'headerOptions were not updated as expected'
    );

    expect(el.headerOptions?.notificationConfigs).to.exist;
    expect(el.hasNewNotifications).to.equal(false);
    expect(el.headerOptions.notificationConfigs?.onClick).to.equal(
      notificationCallbackSpy
    );

    fetchStub.restore();
  });

  it('should handle aiCallback', async () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves(
      new Response(JSON.stringify(fetchResp), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const aiCallbackSpy = sinon.spy();

    const el = await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas
        productName="Test Product"
        productKey="test-productKey"
        basePath="/base"
        assistMeKey="assist-key"
        .aiCallback="${aiCallbackSpy}"></clabs-global-header-hybrid-ipaas>`
    );
    await waitUntil(
      () => el.headerOptions.capabilityName?.label === 'Test Product',
      'headerOptions were not updated as expected'
    );

    expect(el.headerOptions?.chatBotConfigs).to.exist;
    expect(el.headerOptions.chatBotConfigs?.onClick).to.equal(aiCallbackSpy);

    fetchStub.restore();
  });

  describe('aiCallbackEvent', () => {
    let fetchStub: sinon.SinonStub<
      [input: RequestInfo | URL, init?: RequestInit | undefined],
      Promise<Response>
    >;
    let eventReceived: boolean;

    const eventListener = () => {
      eventReceived = true;
    };

    beforeEach(() => {
      fetchStub = sinon.stub(window, 'fetch').resolves(
        new Response(JSON.stringify(fetchResp), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
      eventReceived = false;
      document.addEventListener('ai-callback-event', eventListener);
    });

    afterEach(() => {
      fetchStub.restore();
    });

    it('should handle aiCallbackEvent', async () => {
      const el = await fixture<HybridIpaasHeader>(
        html`<clabs-global-header-hybrid-ipaas
          productName="Test Product"
          productKey="test-productKey"
          basePath="/base"
          assistMeKey="assist-key"
          aiCallbackEvent="ai-callback-event"></clabs-global-header-hybrid-ipaas>`
      );
      await waitUntil(
        () => el.headerOptions.capabilityName?.label === 'Test Product',
        'headerOptions were not updated as expected'
      );

      const onClick = el.headerOptions?.chatBotConfigs?.onClick;
      expect(typeof onClick).to.equal('function');
      onClick && onClick();

      await waitUntil(() => eventReceived, 'Custom event was not received');
    });
  });

  it('should handle searchConfigs', async () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves(
      new Response(JSON.stringify(fetchResp), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const searchCallbackSpy = sinon.spy();
    const submitCallbackSpy = sinon.spy();

    const searchConfigs: SearchConfigs = {
      callback: searchCallbackSpy,
      submitCallback: submitCallbackSpy,
      placeholder: 'Test Placeholder',
    };
    const el = await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas
        productName="Test Product"
        productKey="test-productKey"
        basePath="/base"
        assistMeKey="assist-key"
        .searchConfigs="${searchConfigs}"></clabs-global-header-hybrid-ipaas>`
    );
    await waitUntil(
      () => el.headerOptions.capabilityName?.label === 'Test Product',
      'headerOptions were not updated as expected'
    );

    expect(el.headerOptions?.searchConfigs).to.exist;
    expect(el.headerOptions.searchConfigs?.callback).to.equal(
      searchCallbackSpy
    );
    expect(el.headerOptions.searchConfigs?.submitCallback).to.equal(
      submitCallbackSpy
    );
    expect(el.headerOptions.searchConfigs?.placeholder).to.equal(
      'Test Placeholder'
    );

    fetchStub.restore();
  });

  it('should handle custom capabilityProfileFooterLinks', async () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves(
      new Response(JSON.stringify(fetchResp), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const capabilityProfileFooterLinks: ProfileFooterLinks[] = [
      {
        text: 'About Us',
        href: '/aboutus',
        arialLabel: 'About us',
      },
      {
        text: 'Information',
        href: '/info',
        arialLabel: 'Informatation',
      },
    ];
    const el = await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas
        productName="Test Product"
        productKey="test-productKey"
        basePath="/base"
        assistMeKey="assist-key"
        .capabilityProfileFooterLinks="${capabilityProfileFooterLinks}"></clabs-global-header-hybrid-ipaas>`
    );
    await waitUntil(
      () => el.headerOptions.capabilityName?.label === 'Test Product',
      'headerOptions were not updated as expected'
    );

    expect(el.headerOptions?.profileFooterLinks).to.exist;
    expect(el.headerOptions.profileFooterLinks?.length).to.equal(3);
    expect(el.headerOptions.profileFooterLinks).to.deep.include({
      text: 'About Us',
      href: '/aboutus',
      arialLabel: 'About us',
    });

    expect(el.headerOptions.profileFooterLinks).to.deep.include({
      text: 'Information',
      href: '/info',
      arialLabel: 'Informatation',
    });

    expect(el.headerOptions.profileFooterLinks).to.deep.include({
      text: 'Log out',
      href: '/base/logout',
      carbonIcon: 'Logout',
      arialLabel: 'Logout',
    });

    fetchStub.restore();
  });

  it('should handle searchConfigs', async () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves(
      new Response(JSON.stringify(fetchResp), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const globalActionCallbackSpy = sinon.spy();

    const globalActionConfigs: GlobalActionConfig[] = [
      {
        label: 'Test',
        carbonIcon: 'Test',
        onClick: globalActionCallbackSpy,
      },
    ];

    const el = await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas
        productName="Test Product"
        productKey="test-productKey"
        basePath="/base"
        assistMeKey="assist-key"
        .capabilityGlobalActions="${globalActionConfigs}"></clabs-global-header-hybrid-ipaas>`
    );
    await waitUntil(
      () => el.headerOptions.capabilityName?.label === 'Test Product',
      'headerOptions were not updated as expected'
    );

    expect(el.headerOptions?.globalActionConfigs).to.exist;
    expect(el.headerOptions?.globalActionConfigs?.length).to.equal(1);
    expect(el.headerOptions?.globalActionConfigs).to.deep.include({
      label: 'Test',
      carbonIcon: 'Test',
      onClick: globalActionCallbackSpy,
    });

    fetchStub.restore();
  });
});
