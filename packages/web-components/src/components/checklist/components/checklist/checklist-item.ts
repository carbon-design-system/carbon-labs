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

// @ts-ignore
import styles from './checklist.scss?inline';
import { Statuses, Kinds } from './checklist.types.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * A single task row inside a `clabs-checklist-group`.
 *
 * @element clabs-checklist-item
 * @slot icon - Override the default status icon.
 * @slot content - Override the default label.
 * @fires clabs-checklist-item-clicked - Fired when a clickable item is activated.
 */
@customElement(`${clabsPrefix}-checklist-item`)
class CLABSChecklistItem extends LitElement {
  /**
   * Label text for this task.
   */
  @property()
  label: string | undefined;

  /**
   * Task status. One of `not started`, `in progress`, `completed`, `error`,
   * `disabled`.
   */
  @property()
  status: string | undefined;

  /**
   * When `true`, the label is rendered as a clickable link.
   */
  @property({ type: Boolean })
  clickable = false;

  /**
   * Dispatches the item-clicked custom event.
   * @param {Event} event triggering event
   */
  private _handleClick(event: Event) {
    const triggeredBy = event.target;
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent(
        (this.constructor as typeof CLABSChecklistItem).checklistItemClicked,
        {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: { triggeredBy },
        }
      )
    );
  }

  /**
   * Handles keyboard activation for clickable items.
   * @param {KeyboardEvent} event keyboard event
   */
  private _handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this._handleClick(event);
    }
  }

  /**
   * Maps a status string to a Kinds enum value.
   * @param {string | undefined} status task status
   * @returns {string} icon kind
   */
  private _mapStatusToKind(status: string | undefined): string {
    switch (status) {
      case Statuses.NotStarted:
        return Kinds.unchecked;
      case Statuses.InProgress:
        return Kinds.indeterminate;
      case Statuses.Completed:
        return Kinds.checked;
      case Statuses.Error:
        return Kinds.error;
      case Statuses.Disabled:
        return Kinds.disabled;
      default:
        return Kinds.error;
    }
  }

  /** @override */
  firstUpdated() {
    this.setAttribute('role', 'listitem');
    this.classList.add(`${clabsPrefix}--checklist__list-item`);
  }

  /** @override */
  render() {
    const { clickable, label, status } = this;
    const iconKind = this._mapStatusToKind(status);

    const classes = classMap({
      [`${clabsPrefix}--checklist__label`]: true,
      [`${clabsPrefix}--checklist__label--clickable`]: clickable,
      [`${clabsPrefix}--checklist__label--disabled`]:
        status === Statuses.Disabled,
    });

    return html`
      <slot name="icon">
        <clabs-checklist-icon kind="${iconKind}"></clabs-checklist-icon>
      </slot>
      <slot name="content">
        <div
          class="${classes}"
          title=${label ?? ''}
          role=${clickable ? 'link' : ''}
          @click=${clickable ? this._handleClick : undefined}
          @keydown=${clickable ? this._handleKeyDown : undefined}
          tabindex=${clickable ? 0 : -1}>
          ${label}
        </div>
      </slot>
    `;
  }

  /**
   * Name of the custom event fired when a clickable item is activated.
   */
  static get checklistItemClicked() {
    return `${clabsPrefix}-checklist-item-clicked`;
  }

  static styles = styles;
}

export default CLABSChecklistItem;
