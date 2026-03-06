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
import {
  CUSTOM_EVENT_NAME,
  CUSTOM_EVENT_DETAIL_REFRESH_OPTIONS,
} from '../../../constant';

describe('HybridIpaasHeader Component', () => {
  let fetchStub: sinon.SinonStub<
    [input: RequestInfo | URL, init?: RequestInit | undefined],
    Promise<Response>
  >;

  beforeEach(() => {
    fetchStub = sinon
      .stub(window, 'fetch')
      .resolves(new Response('{}', { status: 200 }));
  });
  afterEach(() => {
    fetchStub.restore();
  });

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
              iconName: 'Settings',
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

  it('should log an error if response is not OK', async () => {
    const consoleErrorStub = sinon.stub(console, 'error');
    fetchStub.resolves(
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

    consoleErrorStub.restore();
  });
  it('should call fetch with correct headers and URL', async () => {
    fetchStub.resolves(new Response('{}', { status: 200 }));
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
  });

  it('should update headerOptions correctly', async () => {
    fetchStub.resolves(
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
  });

  it('should use the brand product name if the product (capability) name is blank', async () => {
    fetchStub.resolves(
      new Response(JSON.stringify(fetchResp), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const el = await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas
        productName=""
        productKey="test-productKey"
        displayName="Test User"
        userEmail="test@example.com"
        productVersion="2.0.0"></clabs-global-header-hybrid-ipaas>`
    );
    await waitUntil(
      () => el.headerOptions.profile?.email === 'test@example.com',
      'headerOptions were not updated as expected'
    );

    expect(el.headerOptions.mainSectionItems).to.deep.equal([
      { label: 'Product', text: 'productName' },
      { label: 'Version', text: '2.0.0' },
    ]);
  });

  it('should handle logoutCallback passed in', async () => {
    fetchStub.resolves(
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
  });

  it('should handle notificationOpenCallback', async () => {
    fetchStub.resolves(
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
  });

  it('should handle aiCallback', async () => {
    fetchStub.resolves(
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
  });

  it('should handle solis switcher rendering', async () => {
    fetchStub.resolves(
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
        assistMeKey="assist-key"
        solisDevMode
        solisSwitcherEnabled></clabs-global-header-hybrid-ipaas>`
    );
    await waitUntil(
      () => el.headerOptions.capabilityName?.label === 'Test Product',
      'headerOptions were not updated as expected'
    );
    expect(el.headerOptions?.solisConfig).to.exist;
    expect(el.headerOptions.solisConfig?.isEnabled).to.be.true;
    expect(el.headerOptions.solisConfig?.is_prod).to.be.false;
  });

  it('should handle solis sidekick rendering', async () => {
    fetchStub.resolves(
      new Response(JSON.stringify(fetchResp), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const el = await fixture<HybridIpaasHeader>(
      html`<clabs-global-header-hybrid-ipaas
        productName="Test Product"
        productKey="test-productKey"
        assistMeKey="assist-key"
        solisSidekickEnabled></clabs-global-header-hybrid-ipaas>`
    );
    await waitUntil(
      () => el.headerOptions.capabilityName?.label === 'Test Product',
      'headerOptions were not updated as expected'
    );

    expect(el.headerOptions?.sidekickConfig).to.exist;
    expect(el.headerOptions.sidekickConfig?.isEnabled).to.be.true;
  });

  it('should handle solis rendering in an environment other than local', async () => {
    fetchStub.resolves(
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
        assistMeKey="assist-key"
        solisEnvironment="prod"
        solisSwitcherEnabled
        solisSidekickEnabled></clabs-global-header-hybrid-ipaas>`
    );
    await waitUntil(
      () => el.headerOptions.capabilityName?.label === 'Test Product',
      'headerOptions were not updated as expected'
    );
    expect(el.headerOptions?.sidekickConfig).to.exist;
    expect(el.headerOptions.sidekickConfig?.isEnabled).to.be.true;
    expect(el.headerOptions?.solisConfig).to.exist;
    expect(el.headerOptions.solisConfig?.isEnabled).to.be.true;
    expect(el.headerOptions.solisConfig?.is_prod).to.be.true;
    expect(el.headerOptions.solisConfig?.cdn_hostname).to.equal(
      'https://cdn.saas.ibm.com'
    );
    expect(el.headerOptions.solisConfig?.deployment_environment).to.equal(
      'prod'
    );
  });

  describe('aiCallbackEvent', () => {
    let eventReceived: boolean;

    const eventListener = () => {
      eventReceived = true;
    };

    beforeEach(() => {
      eventReceived = false;
      document.addEventListener('ai-callback-event', eventListener);
    });

    afterEach(() => {
      document.removeEventListener('ai-callback-event', eventListener);
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
    fetchStub.resolves(
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
  });

  it('should handle custom capabilityProfileFooterLinks', async () => {
    fetchStub.resolves(
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
  });

  it('should handle searchConfigs', async () => {
    fetchStub.resolves(
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
  });

  describe('when a CustomEvent is received', () => {
    it('should reload the header options', async () => {
      fetchStub.resolves(
        new Response(JSON.stringify(fetchResp), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const el = await fixture<HybridIpaasHeader>(
        html`<clabs-global-header-hybrid-ipaas
          productKey="valid-key"></clabs-global-header-hybrid-ipaas>`
      );

      expect(fetchStub.calledOnce).to.be.true;

      await waitUntil(
        () => el.headerOptions.brand?.company === 'companyName',
        'headerOptions were not updated as expected'
      );

      const fetchResp2 = { ...fetchResp };
      fetchResp2.brand.company = 'newCompany';
      fetchStub.resolves(
        new Response(JSON.stringify(fetchResp2), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      document.dispatchEvent(
        new CustomEvent(CUSTOM_EVENT_NAME, {
          detail: CUSTOM_EVENT_DETAIL_REFRESH_OPTIONS,
        })
      );

      await waitUntil(
        () => el.headerOptions.brand?.company === 'newCompany',
        'headerOptions were not updated after a refresh custom event'
      );

      expect(fetchStub.calledTwice).to.be.true;
    });

    it('should not reload the header options if the event detail does not match', async () => {
      fetchStub.resolves(
        new Response(JSON.stringify(fetchResp), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await fixture<HybridIpaasHeader>(
        html`<clabs-global-header-hybrid-ipaas
          productKey="valid-key"></clabs-global-header-hybrid-ipaas>`
      );

      expect(fetchStub.calledOnce).to.be.true;

      document.dispatchEvent(
        new CustomEvent(CUSTOM_EVENT_NAME, { detail: 'DO NOT REFRESH!' })
      );

      expect(fetchStub.calledOnce).to.be.true;
    });
  });
});
