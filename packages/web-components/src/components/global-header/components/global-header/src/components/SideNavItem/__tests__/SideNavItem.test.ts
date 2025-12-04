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
import '../SideNavItem';
import { AUTOMATION_NAMESPACE_PREFIX } from '../../../constant';
import { SideNavLink } from '../../../types/Header.types';
import sinon from 'sinon';

const sideItem: SideNavLink = {
  href: '#',
  label: 'Link 1',
  iconName: 'Settings',
  isActive: true,
  sideNavMenuItems: [],
};

const sideItemNoIcon: SideNavLink = {
  href: '#',
  label: 'Link 1',
  isActive: true,
  sideNavMenuItems: [],
};

const sideItemWithClickHandler: SideNavLink = {
  href: '#',
  label: 'Link 1',
  iconName: 'Settings',
  isActive: true,
  sideNavMenuItems: [],
  isOnClickAvailable: true,
  onClick: () => console.log('onClick function triggered.'),
  handleNavItemClick: () => {
    console.log('handleNavItemClick triggered.');
  },
};

const sideItemWithMenuItems: SideNavLink = {
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
      newTab: true,
      newTabIcon: true,
    },
  ],
  href: '',
};

describe('SideNavItem Component', () => {
  it('renders side nav item with no props', async () => {
    const el = await fixture(
      html`<clabs-global-header-side-nav-item></clabs-global-header-side-nav-item>`
    );
    expect(el).to.exist;

    const popover = el.shadowRoot?.querySelector(
      `.${AUTOMATION_NAMESPACE_PREFIX}--side-panel-nav-item__popover-content`
    );
    expect(popover).to.exist;
  });

  describe('default behaviour', () => {
    it('renders side nav item no menu items when not collapsable', async () => {
      const el = await fixture(
        html`<clabs-global-header-side-nav-item
          .link="${sideItem}"></clabs-global-header-side-nav-item>`
      );
      expect(el).to.exist;

      const popover = el.shadowRoot?.querySelector(
        `.${AUTOMATION_NAMESPACE_PREFIX}--side-panel-nav-item__popover-content`
      );
      expect(popover).to.exist;
      expect(popover?.textContent?.trim()).to.contain('Link 1');

      const item = el.shadowRoot?.querySelector(`[title='Link 1']`);
      expect(item).to.exist;
      expect(item?.getAttribute('href')).to.equal('#');
    });

    it('renders side nav item with no icon', async () => {
      const el = await fixture(
        html`<clabs-global-header-side-nav-item
          .link="${sideItemNoIcon}"></clabs-global-header-side-nav-item>`
      );
      expect(el).to.exist;

      const popover = el.shadowRoot?.querySelector(
        `.${AUTOMATION_NAMESPACE_PREFIX}--side-panel-nav-item__popover-content`
      );
      expect(popover).to.exist;
    });
  });

  describe('renders when isCollapsible is passed in', () => {
    it('renders side nav item when isCollapsible is true and has handleSideNavLinkClick prop', async () => {
      const el = await fixture(
        html`<clabs-global-header-side-nav-item
          .link="${sideItemWithClickHandler}"
          .isOnClickAvailable="${true}"
          .isCollapsible="${true}"></clabs-global-header-side-nav-item>`
      );
      expect(el).to.exist;

      const item = el.shadowRoot?.querySelector(`[title='Link 1']`);
      expect(item).to.exist;
      expect(item?.textContent?.trim()).to.equal('Link 1');
    });

    it('renders side nav item when isCollapsible is true and has not handleSideNavLinkClick prop', async () => {
      const el = await fixture(
        html`<clabs-global-header-side-nav-item
          .link="${sideItem}"
          .isCollapsible="${true}"></clabs-global-header-side-nav-item>`
      );
      expect(el).to.exist;

      const item = el.shadowRoot?.querySelector(`[title='Link 1']`);
      expect(item).to.exist;
      expect(item?.textContent?.trim()).to.equal('Link 1');
    });
  });

  it('renders side nav item with sub menus', async () => {
    const el = await fixture(
      html`<clabs-global-header-side-nav-item
        .menuOpen="${true}"
        .link="${sideItemWithMenuItems}"
        .isCollapsible="${true}"
        .isSideNavMenuItems="${true}"
        .isActive="${false}"></clabs-global-header-side-nav-item>`
    );
    expect(el).to.exist;

    const navMenu = el.shadowRoot?.querySelector(
      `[title='App Integration']`
    ) as HTMLElement;
    expect(navMenu).to.exist;
    expect(navMenu.getAttribute('expanded')).to.exist;

    const subLinks = navMenu.querySelectorAll(`[role='link']`);
    expect(subLinks.length).to.equal(2);

    expect(subLinks[0].textContent?.trim()).to.contain(
      'webMethods Integration'
    );
    expect(subLinks[0].getAttribute('href')).to.equal('#');
    expect(subLinks[0].getAttribute('target')).to.be.null;
    expect(subLinks[0].querySelector('svg')).not.to.exist;

    expect(subLinks[1].textContent?.trim()).to.contain('App Connect');
    expect(subLinks[1].getAttribute('href')).to.equal('#');
    expect(subLinks[1].getAttribute('target')).to.equal('_blank');
    expect(subLinks[1].querySelector('svg')).to.exist;
  });

  describe('click functions can be triggered', () => {
    it('handleSideNavLinkClick can be called', async () => {
      const onClickSpy = sinon.spy();
      const el = await fixture(
        html`<clabs-global-header-side-nav-item
          .link="${sideItem}"
          .isCollapsible="${true}"
          .isSideNavMenuItems="${false}"
          .isOnClickAvailable="${true}"
          .handleNavItemClick="${onClickSpy}"></clabs-global-header-side-nav-item>`
      );
      expect(el).to.exist;

      const item = el.shadowRoot?.querySelector(`[title='Link 1']`);
      if (!item) {
        throw new Error('link not found in the shadow DOM.');
      }
      item.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );

      expect(onClickSpy).to.have.been.calledOnce;
    });

    it('handleSideNavLinkClick can be called', async () => {
      const onClickSpy = sinon.spy();

      const el = await fixture(
        html`<clabs-global-header-side-nav-item
          .link="${{
            ...sideItem,
            sideNavMenuItems: [
              {
                href: '#',
                label: 'webMethods Integration',
                isActive: false,
                onClick: onClickSpy,
              },
            ],
          }}"
          .isCollapsible="${true}"
          .isSideNavMenuItems="${true}"></clabs-global-header-side-nav-item>`
      );
      expect(el).to.exist;

      const item = el.shadowRoot?.querySelector(
        `cds-custom-side-nav-menu-item`
      );
      if (!item) {
        throw new Error('link not found in the shadow DOM.');
      }
      item.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );

      expect(onClickSpy).to.have.been.calledOnce;
    });
  });
});
