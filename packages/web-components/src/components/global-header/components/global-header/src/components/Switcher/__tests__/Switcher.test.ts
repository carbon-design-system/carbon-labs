/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fixture, html, expect } from '@open-wc/testing';
import '../Switcher';
import { Switcher } from '../Switcher';
import { AUTOMATION_HEADER_BASE_CLASS } from '../../../constant';
import sinon from 'sinon';

describe('Switcher Component', () => {
  const switcherConfigs = {
    iconsLeft: true,
    initialSelectedIndex: 1,
    disabled: true,
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
        label: 'Manage custom environments',
        isHeading: false,
        href: '#',
        id: '',
        text: '',
        carbonIcon: 'Settings',
        isLinkItem: true,
      },
      {
        label: 'Environment 1',
        isHeading: false,
        id: '',
        text: '',
        href: '#',
        carbonIcon: 'Checkmark',
      },
      {
        label: 'Environment 2',
        isHeading: false,
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
        isHeading: false,
        href: '#',
        id: '',
        text: '',
        carbonIcon: 'Checkmark',
        isLastInList: true,
      },
      {
        label: 'Manage environments',
        isHeading: false,
        href: '#',
        id: '',
        text: '',
        carbonIcon: 'Settings',
        isLinkItem: true,
      },
    ],
  };
  it('should render items passed as a property', async () => {
    const el = await fixture<HTMLElement>(
      html` <clabs-global-header-switcher-component
        .items=${switcherConfigs.items}
        .iconsLeft=${switcherConfigs.iconsLeft}
        .disabled=${switcherConfigs.disabled}
        .initialSelectedIndex=${switcherConfigs.initialSelectedIndex}></clabs-global-header-switcher-component>`
    );
    const renderedItems = el.shadowRoot?.querySelectorAll(
      'cds-custom-header-menu-item'
    );
    expect(renderedItems).to.have.lengthOf(5);
  });

  it('should render with default properties', async () => {
    const items = [
      { label: 'Item 1', id: 'item1' },
      { label: 'Item 2', id: 'item2' },
    ];
    const el = await fixture<Switcher>(
      html`<clabs-global-header-switcher-component
        .items=${items}></clabs-global-header-switcher-component>`
    );
    const firstItem = el.shadowRoot?.querySelector(
      'cds-custom-header-menu-item'
    );
    firstItem?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, composed: true })
    );
    expect(el.selectedItem).to.deep.equal(items[0]);
  });

  it('should apply the "selected" class to the selected item', async () => {
    const items = [
      { label: 'Item 1', id: 'item1' },
      { label: 'Item 2', id: 'item2' },
      { label: 'Item 3', id: 'item3' },
    ];
    const el = await fixture<Switcher>(
      html`<clabs-global-header-switcher-component
        .items=${items}></clabs-global-header-switcher-component>`
    );
    await el.updateComplete;
    const secondMenuItem = el.shadowRoot?.querySelectorAll(
      'cds-custom-header-menu-item'
    )[2];

    const clickableDiv = secondMenuItem?.querySelector(
      `.${AUTOMATION_HEADER_BASE_CLASS}__switcher-menu-item`
    );

    if (!clickableDiv) {
      throw new Error('switcher-menu-item not found in the shadow DOM.');
    }
    clickableDiv?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, composed: true })
    );

    await el.updateComplete;
    expect(clickableDiv.classList.contains('selected')).to.be.true;
    expect(el.selectedItem).to.deep.equal(items[2]);
  });

  it('should apply the "selected" class to the item at initialSelectedIndex', async () => {
    const items = [
      { label: 'Item 1', id: 'item1' },
      { label: 'Item 2', id: 'item2' },
    ];
    const el = await fixture<Switcher>(
      html`<clabs-global-header-switcher-component
        .items=${items}
        .initialSelectedIndex=${1}></clabs-global-header-switcher-component>`
    );
    await el.updateComplete;
    const secondItem = el.shadowRoot?.querySelectorAll(
      'cds-custom-header-menu-item'
    )[1];
    const selectedDiv = secondItem?.querySelector(
      `.${AUTOMATION_HEADER_BASE_CLASS}__switcher-menu-item.selected`
    );
    expect(selectedDiv).to.exist;
    expect(el.selectedItem).to.deep.equal(items[1]);
  });

  it('should apply the disabled class when the disabled property is true', async () => {
    const items = [
      { label: 'Item 1', id: 'item1' },
      { label: 'Item 2', id: 'item2' },
    ];
    const el = await fixture<Switcher>(
      html`<clabs-global-header-switcher-component
        .items=${items}
        .disabled=${true}></clabs-global-header-switcher-component>`
    );
    const headerMenu = el.shadowRoot?.querySelector('cds-custom-header-menu');
    expect(headerMenu).to.exist;
    const classList = headerMenu?.classList;
    expect(
      classList?.contains(
        `${AUTOMATION_HEADER_BASE_CLASS}__switcher-menu-disabled`
      )
    ).to.be.true;
  });

  it('should invoke custom onClick handler upon item click', async () => {
    const items = [
      { label: 'Item 1', id: 'item1' },
      { label: 'Item 2', id: 'item2' },
    ];
    const handleClick = sinon.spy();
    const el = await fixture<Switcher>(
      html`<clabs-global-header-switcher-component
        .items=${items}
        .disabled=${false}
        .onClick=${handleClick}></clabs-global-header-switcher-component>`
    );
    await el.updateComplete;
    const secondItem = el.shadowRoot?.querySelectorAll(
      'cds-custom-header-menu-item'
    )[1];
    const clickableDiv = secondItem?.querySelector(
      `.${AUTOMATION_HEADER_BASE_CLASS}__switcher-menu-item`
    );
    clickableDiv?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, composed: true })
    );
    await el.updateComplete;
    expect(handleClick).to.have.been.calledOnce;
  });
});
