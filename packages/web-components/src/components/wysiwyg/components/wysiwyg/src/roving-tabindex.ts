/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable jsdoc/require-jsdoc */

import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

const SELECTORS = [
  'cds-icon-button',
  'cds-button',
  'cds-dropdown',
  'cds-text-input',
  'cds-search',
].join(',');

@customElement('clabs-roving-tabindex')
export class ClabsRovingTabindex extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @state()
  private activeIndex = -1;

  private observer?: MutationObserver;

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('focusin', this.handleFocusIn);

    this.refresh();

    this.observer = new MutationObserver(() => this.refresh());

    this.observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled'],
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('focusin', this.handleFocusIn);

    this.observer?.disconnect();
  }

  private getItems(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>(SELECTORS)).filter(
      (el) => {
        for (
          let parent = el.parentElement;
          parent && parent !== this;
          parent = parent.parentElement
        ) {
          if (
            parent.tagName === 'CLABS-ROVING-TABINDEX' ||
            parent.tagName === 'CDS-POPOVER-CONTENT'
          ) {
            return false;
          }
        }
        return true;
      }
    );
  }

  private isEnabled(el?: HTMLElement | null): boolean {
    return (
      !!el &&
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-disabled') !== 'true'
    );
  }

  private applyTabStops(items: HTMLElement[]) {
    items.forEach(
      (item, index) => (item.tabIndex = index === this.activeIndex ? 0 : -1)
    );
  }

  private refresh() {
    const items = this.getItems();

    if (!this.isEnabled(items[this.activeIndex])) {
      this.activeIndex = items.findIndex((el) => this.isEnabled(el));
    }

    this.applyTabStops(items);
  }

  private move(direction: 1 | -1, edge?: 'start' | 'end') {
    const items = this.getItems();
    if (!items.length) {
      return;
    }

    let index =
      edge === 'start' ? -1 : edge === 'end' ? items.length : this.activeIndex;

    for (let i = 0; i < items.length; i++) {
      index =
        edge === 'end'
          ? index - 1
          : (index + direction + items.length) % items.length;

      if (this.isEnabled(items[index])) {
        this.activeIndex = index;
        this.applyTabStops(items);
        items[index].focus();
        return;
      }
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        event.stopPropagation();
        this.move(1);
        break;

      case 'ArrowLeft':
        event.preventDefault();
        event.stopPropagation();
        this.move(-1);
        break;

      case 'Home':
        event.preventDefault();
        event.stopPropagation();
        this.move(1, 'start');
        break;

      case 'End':
        event.preventDefault();
        event.stopPropagation();
        this.move(-1, 'end');
        break;
    }
  };

  private handleFocusIn = ({ target }: FocusEvent) => {
    const items = this.getItems();
    const index = items.indexOf(target as HTMLElement);

    if (index >= 0) {
      this.activeIndex = index;
      this.applyTabStops(items);
      return;
    }

    if (!this.isEnabled(items[this.activeIndex])) {
      this.activeIndex = items.findIndex((el) => this.isEnabled(el));

      if (this.activeIndex >= 0) {
        this.applyTabStops(items);
        items[this.activeIndex].focus();
      }
    }
  };

  render() {
    return html`<slot></slot>`;
  }
}
