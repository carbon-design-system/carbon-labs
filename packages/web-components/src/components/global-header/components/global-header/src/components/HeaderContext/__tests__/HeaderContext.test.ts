/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { html, fixture, expect } from '@open-wc/testing';
import '../HeaderContext';
import {
  GlobalActionConfig,
  HeaderProps,
  NotificationConfigs,
  SearchConfigs,
  TrialLinkType,
} from '../../../types/Header.types';
import sinon from 'sinon';
import { HeaderContext } from '../HeaderContext';
import { AUTOMATION_HEADER_BASE_CLASS } from '../../../constant';

describe('HeaderContext Component', () => {
  const unauthenticatedProps: HeaderProps = {
    brand: {
      company: 'IBM',
      product: 'SaaS Console',
    },
    noAuthHeaderLinks: [
      {
        text: 'Docs',
        href: '/docs',
        carbonIcon: 'Document',
        arialLabel: 'Docs',
      },
      {
        href: '/login',
        text: 'Log in',
        carbonIcon: 'Login',
        arialLabel: 'Log in',
      },
    ],
  };

  const headerProps: HeaderProps = {
    profile: {
      imageUrl: '',
      email: 'user@test.com',
      displayName: 'Sample User',
    },
    managementConsole: {
      href: 'https://www.ibm.com',
      text: 'IBM SaaS Console',
      newTab: true,
      newTabIcon: true,
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
        newTab: false,
        newTabIcon: false,
      },
    ],
    switcherConfigs: [
      {
        iconsLeft: true,
        initialSelectedIndex: 1,
        items: [
          {
            label: 'Development',
            isHeading: true,
            id: '',
            text: '',
            href: '#',
            carbonIcon: 'Checkmark',
          },
          {
            label: 'Environment 1',
            id: '',
            text: '',
            href: '#',
            carbonIcon: 'Checkmark',
          },
          {
            label: 'Environment 2',
            id: '',
            text: '',
            href: '#',
            carbonIcon: 'Checkmark',
          },
          {
            label: 'Production',
            isHeading: true,
            id: '',
            text: '',
            href: '#',
            carbonIcon: 'Checkmark',
          },
          {
            label: 'Environment 3',
            href: '#',
            id: '',
            text: '',
            carbonIcon: 'Checkmark',
            isLastInList: true,
          },
          {
            label: 'Manage environments',
            href: '#',
            id: '',
            text: '',
            carbonIcon: 'Settings',
            isLinkItem: true,
          },
        ],
      },
    ],
  };

  it('renders the header component without props', async () => {
    const el = await fixture(
      html`<clabs-global-header-context></clabs-global-header-context>`
    );
    expect(el?.shadowRoot).not.to.be.null;
  });

  describe('test isAuthenticated', () => {
    it('renders unauthenticated context when no profile is in header props', async () => {
      const el = await fixture(
        html`<clabs-global-header-context
          .props="${unauthenticatedProps}"></clabs-global-header-context>`
      );

      // make sure that the 'unauthenticated-context' is rendered in this case.
      const unauthenticated = el.shadowRoot?.querySelector(
        'clabs-global-header-unauthenticated-context'
      );
      expect(unauthenticated).not.to.be.null;

      // we're expecting that the header-nav will not render as isAuthenticated is false
      expect(el?.shadowRoot?.querySelector(`[role='navigation']`)).to.be.null;
    });

    it('renders the header nav when a profile is in the header props', async () => {
      const el = await fixture(
        html`<clabs-global-header-context
          .props="${headerProps}"></clabs-global-header-context>`
      );

      // make sure that the 'unauthenticated-context' is not rendered in this case.
      const unauthenticated = el.shadowRoot?.querySelector(
        'clabs-global-header-unauthenticated-context'
      );
      expect(unauthenticated).to.be.null;

      // expect that the environment switcher has been rendered as switcherConfigs is present
      const switcher = el.shadowRoot?.querySelector(
        'clabs-global-header-switcher-component'
      );
      expect(switcher).not.to.be.null;

      // expect the profile popover is present as a profile object is present
      const popover = el.shadowRoot?.querySelector(
        'clabs-global-header-profile-popover'
      );
      expect(popover).not.to.be.null;
    });

    it('profile menu can toggle', async () => {
      const el = await fixture<HeaderContext>(
        html`<clabs-global-header-context
          .props="${{ ...headerProps }}"></clabs-global-header-context>`
      );

      const toggleProfilePopupSpy = sinon.spy(el, '_toggleProfilePopup');
      el?.requestUpdate();
      await el?.updateComplete;
      const button = el?.shadowRoot?.querySelector(
        '[type="button"], [aria-label="Profile"]'
      );
      button?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );

      expect(toggleProfilePopupSpy).to.have.callCount(1);
    });
  });

  describe('check the help content renders', () => {
    const helperLinks = [
      {
        link: 'https://ibm.biz/automation-explorer',
        label: 'Automation Explorer documentation',
        onclick: () => {
          window.open('https://ibm.biz/automation-explorer');
        },
      },
      {
        label: 'Connector Development Kit documentation',
        onclick: () => {
          window.open('https://ibm.biz/connector-development-kit');
        },
      },
      {
        link: 'https://ibm.biz/automationexplorer',
        label: 'Automation Explorer Community',
        target: '_blank',
      },
    ];

    const assistMeConfigs = {
      productId: 'a22453643cdb9e22397c6eab9e9da97d',
    };

    it('renders help links when prop is passed in', async () => {
      const el = await fixture(
        html`<clabs-global-header-context
          .props="${{
            ...headerProps,
            helperLinks,
          }}"></clabs-global-header-context>`
      );

      const helpMenu = el.shadowRoot?.querySelector('[menu-label="Help"]');
      expect(helpMenu).not.to.be.null;

      const helpLinks = helpMenu?.querySelectorAll('[role="listitem"]');
      expect(helpLinks?.length).to.equal(3);
    });

    it('renders assistMe action when prop is passed in', async () => {
      window.initAssistMeController = () => {};
      const initAssistMeControllerStub = sinon.stub(
        window,
        'initAssistMeController'
      );
      const el = await fixture(
        html`<clabs-global-header-context
          .props="${{
            ...headerProps,
            assistMeConfigs,
          }}"></clabs-global-header-context>`
      );

      const helpMenu = el.shadowRoot?.querySelector(
        '[aria-label="open assistance side panel"]'
      );
      expect(helpMenu).not.to.be.null;
      helpMenu?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );

      expect(initAssistMeControllerStub.calledOnce).to.be.true;

      initAssistMeControllerStub.restore();
    });
  });

  describe('check trial menu', () => {
    const trialConfigs = {
      trialCount: 30,
      warning: false,
      trialLabel: 'Trial days left',
      description: `Your trial ends now`,
      links: [
        { type: TrialLinkType.contact, label: 'Invite team member', href: '#' },
        {
          type: TrialLinkType.invite,
          label: 'Contact sales',
          href: 'https://www.ibm.com',
        },
      ],
      actionText: 'Buy',
      actionLink: '#',
    };

    it('renders the trial menu action', async () => {
      const el = await fixture(
        html`<clabs-global-header-context
          .props="${{
            ...headerProps,
            trialConfigs,
          }}"></clabs-global-header-context>`
      );
      const trialMenuAction = el?.shadowRoot?.querySelector(
        '[type="button"], [aria-label="Trial Menu"]'
      );
      expect(trialMenuAction).to.exist;
    });

    it('trial menu action can toggle', async () => {
      const el = await fixture<HeaderContext>(
        html`<clabs-global-header-context
          .props="${{
            ...headerProps,
            trialConfigs,
          }}"></clabs-global-header-context>`
      );
      expect(el.isTrialOpen).to.equal(false);

      const toggleTrialPopupSpy = sinon.spy(el, '_toggleTrialPopup');
      el?.requestUpdate();
      await el?.updateComplete;
      const button = el?.shadowRoot?.querySelector(
        '[type="button"], [aria-label="Trial Menu"]'
      );
      button?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );

      expect(toggleTrialPopupSpy).to.have.callCount(1);
      expect(el.isTrialOpen).to.equal(true);
    });
  });

  describe('chatbot menu action', () => {
    const clickHandler = sinon.spy();
    const chatBotConfigs = {
      onClick: clickHandler,
    };

    it('check the chatbot action renders', async () => {
      const el = await fixture(
        html`<clabs-global-header-context
          .props="${{
            ...headerProps,
            chatBotConfigs,
          }}"></clabs-global-header-context>`
      );
      expect(el).not.to.be.null;

      const chatbotButton = el?.shadowRoot?.querySelector(
        `[aria-label='Launch Chat']`
      );
      expect(chatbotButton).to.exist;
      chatbotButton?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );
      expect(clickHandler).to.have.been.calledOnce;
    });
  });

  describe('notification menu action', () => {
    const clickHandler_notificationConfigs = sinon.spy();
    const notificationConfigs: NotificationConfigs = {
      onClick: clickHandler_notificationConfigs,
    };

    it('renders the notification menu', async () => {
      const el = await fixture(
        html`<clabs-global-header-context
          .props="${{
            ...headerProps,
            notificationConfigs,
          }}"></clabs-global-header-context>`
      );
      expect(el).not.to.be.null;

      const notificationButton = el?.shadowRoot?.querySelector(
        `[aria-label='Notifications']`
      );
      expect(notificationButton).to.exist;

      notificationButton?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );
      expect(clickHandler_notificationConfigs).to.have.been.calledOnce;
    });

    const clickHandler_notificationConfigsNew = sinon.spy();
    const notificationConfigsNew: NotificationConfigs = {
      onClick: clickHandler_notificationConfigsNew,
    };

    it('renders the notification menu', async () => {
      const el = await fixture(
        html`<clabs-global-header-context
          .props="${{
            ...headerProps,
            notificationConfigs: notificationConfigsNew,
          }}"></clabs-global-header-context>`
      );
      expect(el).not.to.be.null;

      const notificationButton = el?.shadowRoot?.querySelector(
        `[aria-label='Notifications']`
      );
      expect(notificationButton).to.exist;

      notificationButton?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );
      expect(clickHandler_notificationConfigs).to.have.been.calledOnce;
    });
  });

  describe('webMethods Hybrid Integration divider', async () => {
    const el = await fixture(
      html`<clabs-global-header-context
        .props="${{
          ...headerProps,
          isHybridIpaas: true,
        }}"></clabs-global-header-context>`
    );
    expect(el).not.to.be.null;

    const divider = el?.shadowRoot?.querySelector(
      `.${AUTOMATION_HEADER_BASE_CLASS}__divider`
    );
    expect(divider).to.exist;
  });

  describe('Search Component', () => {
    const searchConfigs: SearchConfigs = {
      placeholder: 'search term',
      callback: () => {},
    };

    it('renders', async () => {
      const el = await fixture(
        html`<clabs-global-header-context
          .props="${{
            ...headerProps,
            searchConfigs,
          }}"></clabs-global-header-context>`
      );
      expect(el).not.to.be.null;

      const search = el?.shadowRoot?.querySelector(
        'clabs-global-header-search'
      );
      expect(search).to.exist;
    });
  });

  describe('Global Actions', () => {
    const clickHandler_global_action = sinon.spy();
    const globalActionConfigs: GlobalActionConfig[] = [
      {
        label: 'App Connect global action',
        carbonIcon: 'AppConnectivity',
        onClick: clickHandler_global_action,
      },
    ];

    it('renders the notification menu', async () => {
      const el = await fixture(
        html`<clabs-global-header-context
          .props="${{
            ...headerProps,
            globalActionConfigs,
          }}"></clabs-global-header-context>`
      );
      expect(el).not.to.be.null;
      const globalAction = el?.shadowRoot?.querySelector(
        `[aria-label='App Connect global action']`
      );
      expect(globalAction).to.exist;

      globalAction?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );
      expect(clickHandler_global_action).to.have.been.calledOnce;
    });
  });
});
