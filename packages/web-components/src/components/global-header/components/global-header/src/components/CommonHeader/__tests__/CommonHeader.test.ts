/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { html, fixture, expect, elementUpdated } from '@open-wc/testing';
import { CommonHeader } from '../CommonHeader';
import '../CommonHeader';
import sinon from 'sinon';

describe('CommonHeader tests', () => {
  it('renders with no props', async () => {
    const el = await fixture<CommonHeader>(
      html`<clabs-global-header-apaas></clabs-global-header-apaas>`
    );
    expect(el).not.to.be.null;

    // Check that the default header renders
    const header = el.shadowRoot?.querySelector(`[role='banner']`);
    expect(header).to.exist;
    expect(header).to.have.attribute(
      'aria-label',
      'IBM webMethods Hybrid Integration'
    );
  });

  it('renders custom values in the header', async () => {
    const props = {
      brand: {
        company: 'Test Company',
        product: 'Test Product',
      },
      capabilityName: {
        label: 'Test Capability',
      },
    };

    const el = await fixture(
      html`<clabs-global-header-apaas
        .headerProps="${props}"></clabs-global-header-apaas>`
    );
    expect(el).not.to.be.null;

    // Check that the prop values render
    const header = el.shadowRoot?.querySelector(`[role='banner']`);
    expect(header).to.exist;

    const headerName = header?.querySelector('cds-custom-header-name');
    expect(headerName).to.have.attribute('prefix', 'Test Company');

    expect(header?.textContent).contains('Test Product');
    expect(header?.textContent).contains('Test Capability');
  });

  describe('Assist me script loading', () => {
    const props = {
      environment: 'prod',
      brand: {
        company: 'Test Company',
        product: 'Test Product',
      },
      capabilityName: {
        label: 'Test Capability',
      },
      assistMeConfigs: {
        productId: 'a22453643cdb9e22397c6eab9e9da97d',
      },
    };
    it('adds the "assist-me-script-status" event listener when assistMe config is passed in', async () => {
      const el = await fixture<CommonHeader>(
        html`<clabs-global-header-apaas
          .headerProps="${props}"></clabs-global-header-apaas>`
      );
      expect(el).not.to.be.null;

      const addEventListenerSpy = sinon.spy(document, 'addEventListener');
      const connectedCallbackSpy = sinon.spy(el, 'connectedCallback');

      el.connectedCallback();
      await el.updateComplete;

      sinon.assert.calledWith(addEventListenerSpy, 'assist-me-script-status');
      sinon.assert.calledOnce(connectedCallbackSpy);
    });

    it('sets assistMeScriptLoaded to true is event is fired with "load"', async () => {
      const el = await fixture<CommonHeader>(
        html`<clabs-global-header-apaas
          .headerProps="${props}"></clabs-global-header-apaas>`
      );
      expect(el).not.to.be.null;

      el.dispatchEvent(
        new CustomEvent('assist-me-script-status', {
          detail: { message: 'load' },
          bubbles: true,
          composed: true,
        })
      );
      await el.updateComplete;
      expect(el.assistMeScriptLoaded).to.be.true;
    });

    it('throws console error if event is fired with "error"', async () => {
      const consoleErrorStub = sinon.stub(console, 'error');
      const el = await fixture<CommonHeader>(
        html`<clabs-global-header-apaas
          .headerProps="${props}"></clabs-global-header-apaas>`
      );
      expect(el).not.to.be.null;

      el.dispatchEvent(
        new CustomEvent('assist-me-script-status', {
          detail: { message: 'error' },
          bubbles: true,
          composed: true,
        })
      );
      await el.updateComplete;
      expect(el.assistMeScriptLoaded).to.be.false;
      expect(
        consoleErrorStub.calledWith(
          'An error occurred trying to load the assistMe script.'
        )
      ).to.be.true;
      consoleErrorStub.restore();
    });

    it('calls useScript if the assistMe config or environment is changed', async () => {
      const productId = 'abc-123-456';
      const newAssistMeConfigs = {
        productId: productId,
      };

      const el = await fixture<CommonHeader>(
        html`<clabs-global-header-apaas
          .headerProps="${props}"></clabs-global-header-apaas>`
      );

      expect(el).not.to.be.null;
      expect(el.headerProps.assistMeConfigs?.productId).to.equal(
        'a22453643cdb9e22397c6eab9e9da97d'
      );

      const changedProperties = new Map([
        ['environment', 'dev'],
        ['assistMeConfigs', 'newAssistMeConfigs'],
      ]);
      el.headerProps.assistMeConfigs = newAssistMeConfigs;
      el.headerProps.environment = 'dev';

      el.updated(changedProperties);

      await elementUpdated(el);
      expect(el.headerProps.assistMeConfigs?.productId).to.equal(productId);
    });
  });

  describe('Side Nav renders with props', () => {
    it('renders basic side nav', async () => {
      const props = {
        sideNav: {
          isCollapsible: false,
          buttonLabel: 'Open menu',
          sidebarLabel: 'Side navigation',
          links: [
            {
              href: '#',
              label: 'Link 1',
              iconName: 'Settings',
              isActive: true,
              sideNavMenuItems: [],
            },
            {
              href: '#',
              label: 'Link 2',
              iconName: 'Launch',
              sideNavMenuItems: [],
            },
          ],
          isRail: false,
          isChildOfHeader: false,
        },
      };

      const el = await fixture(
        html`<clabs-global-header-apaas
          .headerProps="${props}"></clabs-global-header-apaas>`
      );
      expect(el).not.to.be.null;

      const sideNav = el.shadowRoot?.querySelector(`[role='navigation']`);
      expect(sideNav).to.exist;
      expect(sideNav).to.have.attribute('collapse-mode', 'responsive');
      expect(sideNav).to.have.attribute('aria-label', 'Open menu');

      const navItems = el.shadowRoot?.querySelectorAll(
        'clabs-global-header-side-nav-item'
      );
      expect(navItems?.length).to.equal(2);
    });

    it('renders basic side nav aria-label defaults to "Side navigation"', async () => {
      const props = {
        sideNav: {
          isCollapsible: false,
          sidebarLabel: 'Side navigation',
          links: [
            {
              href: '#',
              label: 'Link 1',
              iconName: 'Settings',
              isActive: true,
              sideNavMenuItems: [],
            },
          ],
          isRail: false,
          isChildOfHeader: false,
        },
      };

      const el = await fixture(
        html`<clabs-global-header-apaas
          .headerProps="${props}"></clabs-global-header-apaas>`
      );
      expect(el).not.to.be.null;

      const sideNav = el.shadowRoot?.querySelector(`[role='navigation']`);
      expect(sideNav).to.exist;
      expect(sideNav).to.have.attribute('aria-label', 'Side navigation');
    });

    it('renders side nav with groups', async () => {
      const props = {
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
                    },
                  ],
                },
                {
                  label: 'App Integration',
                  iconName: 'FlowConnection',
                  isSideNavMenuItems: true,
                  sideNavMenuItems: [
                    {
                      href: '#',
                      label: 'webMethods Integration',
                    },
                    {
                      href: '#',
                      label: 'App Connect',
                    },
                  ],
                },
              ],
            },
          ],
        },
      };
      const el = await fixture(
        html`<clabs-global-header-apaas
          .headerProps="${props}"></clabs-global-header-apaas>`
      );
      expect(el).not.to.be.null;

      const sideNav = el.shadowRoot?.querySelector(`[role='navigation']`);
      expect(sideNav).to.exist;

      const navItems = el.shadowRoot?.querySelectorAll(
        'clabs-global-header-side-nav-item'
      );
      expect(navItems?.length).to.equal(3);
    });

    it('the onClick function in sideNav is called when item is clicked', async () => {
      const sideNavOnClickSpy = sinon.spy();
      const props = {
        sideNav: {
          isCollapsible: true,
          buttonLabel: 'Open menu',
          sidebarLabel: 'Side navigation',
          links: [
            {
              href: '#',
              label: 'Link 1',
              iconName: 'Settings',
              isActive: true,
              isSideNavMenuItems: false,
              sideNavMenuItems: [],
              handleNavItemClick: () => {},
            },
          ],
          onClick: sideNavOnClickSpy,
          isRail: false,
          isChildOfHeader: false,
        },
      };

      const el = await fixture<CommonHeader>(
        html`<clabs-global-header-apaas
          .headerProps="${props}"></clabs-global-header-apaas>`
      );
      expect(el).not.to.be.null;

      const sideNav = el.shadowRoot?.querySelector(`[role='navigation']`);
      expect(sideNav).to.exist;

      const item = sideNav?.querySelector('clabs-global-header-side-nav-item');
      expect(item).to.exist;

      const link = item?.shadowRoot?.querySelector(`[role='link']`);
      expect(link).to.exist;
      link?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );

      await el.updateComplete;
      expect(sideNavOnClickSpy.calledOnce).to.be.true;
    });

    it('correctly sets isActive to false on the sideNavItem', async () => {
      /**
       * There does not appear to be a nice way to mock window.location.href.includes(link.href)
       * so this is just for coverage to make sure that isActive can be assigned a value when:
       * isHybridIpaas is true and isActive is not set on the link
       */
      const props = {
        isHybridIpaas: true,
        sideNav: {
          isCollapsible: false,
          buttonLabel: 'Open menu',
          sidebarLabel: 'Side navigation',
          groups: [
            {
              links: [
                {
                  href: '/home',
                  label: 'Home',
                  iconName: 'Home',
                  isActive: true,
                },
              ],
            },
          ],
          isRail: false,
          isChildOfHeader: false,
        },
      };

      const el = await fixture(
        html`<clabs-global-header-apaas
          .headerProps="${props}"></clabs-global-header-apaas>`
      );
      expect(el).not.to.be.null;

      const sideNavItem = el.shadowRoot?.querySelector(
        'clabs-global-header-side-nav-item'
      );

      const link = sideNavItem?.shadowRoot?.querySelector(`[role="link"]`);
      expect(link).not.to.have.class(
        'ibm-automation-cds--custom-side-nav__link--current'
      );
    });
  });

  describe('Side Nav renders with V2 props', () => {
    it('renders side nav with V2 props', async () => {
      const props = {
        sideNavPropsV2: {
          theme: 'g10',
          isExpandable: true,
          isCollapsible: true,
          autoCollapseOnLeave: true,
          links: [
            {
              label: 'Subscriptions',
              iconName: 'Launch',
              href: '',
              sideNavMenuItems: [],
            },
            {
              iconName: 'Settings',
              label: 'Account settings',
              isSideNavMenuItems: true,
              href: '',
              sideNavMenuItems: [
                {
                  label: 'Details',
                  isActive: false,
                  href: '',
                },
                {
                  label: 'Access management',
                  iconName: 'UserMultiple',
                  isActive: false,
                  href: '',
                },
              ],
            },
          ],
          sideNav: {
            isRail: true,
            isPersistent: true,
            isChildOfHeader: true,
          },
          buttonLabel: 'Side navigation',
          sidebarLabel: 'Side navigation',
          isRail: false,
          isChildOfHeader: false,
        },
      };

      const el = await fixture(
        html`<clabs-global-header-apaas
          .headerProps="${props}"></clabs-global-header-apaas>`
      );
      expect(el).not.to.be.null;

      const sideNav = el.shadowRoot?.querySelector(`[role='navigation']`);
      expect(sideNav).to.exist;
      expect(sideNav).to.have.attribute('collapse-mode', 'rail');
      expect(sideNav).to.have.attribute('aria-label', 'Side navigation');

      const navItems = el.shadowRoot?.querySelectorAll(
        'clabs-global-header-side-nav-item'
      );
      expect(navItems?.length).to.equal(2);
    });

    it('basic side nav V2 aria-label defaults to "Side navigation"', async () => {
      const props = {
        sideNavPropsV2: {
          theme: 'g10',
          isExpandable: true,
          isCollapsible: true,
          autoCollapseOnLeave: true,
          links: [],
          sideNav: {
            isRail: true,
            isPersistent: true,
            isChildOfHeader: true,
          },
          sidebarLabel: 'Side navigation',
          isRail: false,
          isChildOfHeader: false,
        },
      };
      const el = await fixture(
        html`<clabs-global-header-apaas
          .headerProps="${props}"></clabs-global-header-apaas>`
      );
      expect(el).not.to.be.null;

      const sideNav = el.shadowRoot?.querySelector(`[role='navigation']`);
      expect(sideNav).to.have.attribute('aria-label', 'Side navigation');
    });
  });
});
