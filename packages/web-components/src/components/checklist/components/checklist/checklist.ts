/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { settings } from '@carbon-labs/utilities';
import ChevronIcon16 from '@carbon/icons/es/chevron--up/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/link/index.js';
import './checklist-chart.js';
import './checklist-icon.js';

// @ts-ignore
import styles from './checklist.scss?inline';

const { stablePrefix: clabsPrefix } = settings;
const blockClass = `${clabsPrefix}--checklist`;

/**
 * Checklist component for tracking a user's onboarding progress.
 *
 * @element clabs-checklist
 * @slot checklist-header - Replaces the entire header area.
 * @slot header-chart - Replaces the chart portion of the header.
 * @slot header-title - Replaces the title within the header.
 * @slot header-chartLabel - Replaces the chart label within the header.
 * @slot default - One or more `clabs-checklist-group` elements.
 * @slot checklist-footer - Replaces the footer area.
 * @fires clabs-checklist-view-all - Fired when the "View all" link is activated.
 * @fires clabs-checklist-toggle - Fired when the toggle button is clicked.
 */
@customElement(`${clabsPrefix}-checklist`)
class CLABSChecklist extends LitElement {
  /**
   * Whether the checklist body is visible.
   */
  @property({ type: Boolean, reflect: true })
  open = false;

  /**
   * Main title displayed in the header.
   */
  @property({ type: String })
  title: string | undefined;

  /**
   * Label text shown next to the progress chart.
   */
  @property({ type: String, attribute: 'chart-label' })
  chartLabel: string | undefined;

  /**
   * Progress value between 0 and 1.
   */
  @property({ type: Number, attribute: 'chart-value' })
  chartValue: number | undefined;

  /**
   * When `true`, hides the open/close toggle button.
   */
  @property({ type: Boolean, attribute: 'disable-toggle' })
  disableToggle = false;

  /**
   * Tooltip label for the toggle button.
   */
  @property({ type: String, attribute: 'toggle-label' })
  toggleLabel: string | undefined;

  /**
   * Tooltip alignment for the toggle button.
   */
  @property({ type: String, attribute: 'toggle-label-align' })
  toggleLabelAlign: string | undefined;

  /**
   * `aria-label` for the toggle button.
   */
  @property({ type: String, attribute: 'toggle-aria-label' })
  toggleAriaLabel: string | undefined;

  /**
   * When set, shows a "View all" link in the footer.
   */
  @property({ type: String, attribute: 'view-all-label' })
  viewAllLabel: string | undefined;

  /**
   * Dispatches the view-all custom event.
   * @param {Event} event triggering event
   */
  private _onViewAll(event: Event) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent(
        (this.constructor as typeof CLABSChecklist).checklistViewAll,
        {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: { triggeredBy: event.target },
        }
      )
    );
  }

  /**
   * Handles keyboard activation for the view-all link.
   * @param {KeyboardEvent} event keyboard event
   */
  private _onViewAllKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this._onViewAll(event);
    }
  }

  /**
   * Toggles open state and dispatches the toggle custom event.
   * @param {Event} event triggering event
   */
  private _onToggle(event: Event) {
    this.open = !this.open;
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent(
        (this.constructor as typeof CLABSChecklist).checklistToggle,
        {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: { triggeredBy: event.target },
        }
      )
    );
  }

  /** @override */
  render() {
    const {
      open,
      chartLabel,
      chartValue,
      title,
      disableToggle,
      toggleLabel,
      toggleLabelAlign,
      toggleAriaLabel,
      viewAllLabel,
    } = this;

    const classes = classMap({
      [`${blockClass}`]: true,
      [`${blockClass}__closed`]: !open,
    });

    return html`
      <aside class=${classes} aria-label="Checklist">
        <header class="${blockClass}__header">
          <slot name="checklist-header">
            <slot name="header-chart">
              ${chartValue !== undefined
                ? html`<clabs-checklist-chart
                    value=${chartValue}></clabs-checklist-chart>`
                : ''}
            </slot>
            <div class="${blockClass}__titles">
              <slot name="header-title">
                ${title
                  ? html`<h2 class="${blockClass}__title">${title}</h2>`
                  : ''}
              </slot>
              <slot name="header-chartLabel">
                ${chartLabel
                  ? html`<p class="${blockClass}__chart-label">
                      ${chartLabel}
                    </p>`
                  : ''}
              </slot>
            </div>
          </slot>

          ${!disableToggle
            ? html`<cds-icon-button
                kind="ghost"
                size="sm"
                align=${toggleLabelAlign ?? 'top'}
                aria-label=${toggleAriaLabel ?? ''}
                class="${blockClass}__toggle"
                @click=${this._onToggle}>
                ${iconLoader(ChevronIcon16, {
                  slot: 'icon',
                  class: `${blockClass}__chevron`,
                })}
                <span slot="tooltip-content">${toggleLabel}</span>
              </cds-icon-button>`
            : ''}
        </header>

        <div class="${blockClass}__content-outer">
          <div class="${blockClass}__content-inner">
            <slot></slot>
            <div class="${blockClass}__footer">
              <slot name="checklist-footer">
                ${viewAllLabel
                  ? html`<cds-link
                      role="link"
                      @click=${this._onViewAll}
                      @keydown=${this._onViewAllKeyDown}>
                      ${viewAllLabel}
                    </cds-link>`
                  : ''}
              </slot>
            </div>
          </div>
        </div>
      </aside>
    `;
  }

  /**
   * Name of the custom event fired when "View all" is activated.
   */
  static get checklistViewAll() {
    return `${clabsPrefix}-checklist-view-all`;
  }

  /**
   * Name of the custom event fired when the toggle button is clicked.
   */
  static get checklistToggle() {
    return `${clabsPrefix}-checklist-toggle`;
  }

  static styles = styles;
}

export default CLABSChecklist;
