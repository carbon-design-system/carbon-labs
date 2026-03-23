/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';

/* c8 ignore next */
import cx from 'classnames';
import { AUTOMATION_HEADER_BASE_CLASS } from '../../constant';
import { ItemLink } from './Switcher.types';
import { unsafeCSS } from 'lit';

import styles from './_index.scss?inline';
import { renderCarbonIcon, trackEvent } from '../../globals/utils';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Environment switcher
 */
@customElement(`${clabsPrefix}-global-header-switcher-component`)
export class Switcher extends LitElement {
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  @property({ type: Array }) items: ItemLink[] = [];
  @property({ type: Boolean }) iconsLeft = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) isTrialOpen = false;
  @property({ type: Number }) initialSelectedIndex = 0;
  @property({ type: Function }) onClick = (
    event: MouseEvent,
    value: ItemLink,
    idx: number
  ) => {
    console.log(`default onClick called with: ${event}, ${value}, ${idx}`);
  };

  get selectedItem(): ItemLink | null {
    return this.items[this.initialSelectedIndex || 0] ?? null;
  }

  constructor() {
    super();
  }

  // emit an event (does nothing if analytics has not been configured)
  private clickEventAnalytics = (label: string) => {
    trackEvent('UI Interaction', {
      action: 'clicked',
      CTA: label,
      elementId: 'common header - env switcher',
    });
  };

  handleItemSelection(event: MouseEvent, value: ItemLink, idx: number) {
    this.clickEventAnalytics(value.label);
    if (this.onClick) {
      this.onClick(event, value, idx); // Need to add event in this
    }
    if (!value.isLinkItem || !value.isHeading) {
      if (this.items[idx] !== this.selectedItem) {
        this.initialSelectedIndex = idx;
      }
    }

    //Switcher closes upon selecting an option
    const headerMenu = this.shadowRoot?.querySelector(
      'cds-custom-header-menu'
    ) as HTMLElement & { expanded: boolean };
    headerMenu.expanded = false;
  }

  renderItem(item: ItemLink, idx: number) {
    const isSelected = item.id
      ? item.id === this.selectedItem?.id
      : item.label === this.selectedItem?.label;
    const selectedClass = isSelected ? 'selected' : '';
    return html`
      <div>
        <div
          class="${cx({
            [`${AUTOMATION_HEADER_BASE_CLASS}__switcher-menu-item`]: true,
            [selectedClass]: true,
          })}"
          @click="${(event: MouseEvent) => {
            if (this.disabled) {
              return;
            }
            this.handleItemSelection(event, item, idx);
          }}"
          title="${item.label}">
          ${this.iconsLeft
            ? html`
                <span
                  class="${AUTOMATION_HEADER_BASE_CLASS}__switcher-menu-item-title-icons-left">
                  ${!item.isLinkItem
                    ? html`
                        <div
                          class="${!isSelected
                            ? `${AUTOMATION_HEADER_BASE_CLASS}__switcher-menu-item-title-hidden-checkmark`
                            : nothing}">
                          ${renderCarbonIcon(
                            item.carbonIcon || 'Checkmark',
                            16
                          )}
                        </div>
                      `
                    : ''}
                  ${item.isLinkItem
                    ? html`<div>
                        ${renderCarbonIcon(item.carbonIcon || 'Checkmark', 16)}
                      </div>`
                    : ''}
                  <span>${item.label}</span>
                  ${item.isLinkItem
                    ? html`<div>${renderCarbonIcon('Launch', 16)}</div>`
                    : ''}
                </span>
              `
            : html`
                <span
                  class="${AUTOMATION_HEADER_BASE_CLASS}__switcher-menu-item-title">
                  <span>${item.label}</span>
                  ${isSelected
                    ? renderCarbonIcon(item.carbonIcon || 'Checkmark', 16)
                    : ''}
                </span>
              `}
        </div>
        ${item.isLastInList ? html`<div class="switcher-divider"></div>` : ''}
      </div>
    `;
  }

  renderItems() {
    return this.items.map((item, idx) => {
      if (item.isHeading) {
        return html`<div
          class="${AUTOMATION_HEADER_BASE_CLASS}__switcher-menu-group-title">
          ${item.label}
        </div>`;
      } else {
        return html`<cds-custom-header-menu-item href="${item?.href ?? '#'}">
          ${this.renderItem(item, idx)}
        </cds-custom-header-menu-item>`;
      }
    });
  }

  render() {
    const labelMaxLength = 22;
    const switcherLabel =
      this.selectedItem?.label &&
      this.selectedItem?.label.length < labelMaxLength
        ? this.selectedItem?.label
        : this.selectedItem?.label.slice(0, labelMaxLength) + '...'; // need to manually reduce length of label to fit the max width

    return html`<div class="${AUTOMATION_HEADER_BASE_CLASS}__switcher">
      <cds-custom-header-menu
        role="button"
        tabindex="${this.isTrialOpen ? -1 : 0}"
        .menuLabel=${switcherLabel}
        .triggerContent=${switcherLabel}
        title="${switcherLabel.length > labelMaxLength
          ? this.selectedItem?.label
          : null}"
        class="${cx({
          [`${AUTOMATION_HEADER_BASE_CLASS}__switcher-menu hybrid-ipaas`]: true,
          [`${AUTOMATION_HEADER_BASE_CLASS}__switcher-menu-disabled`]:
            this.disabled,
        })}">
        ${this.renderItems()}
      </cds-custom-header-menu>
    </div>`;
  }
}
