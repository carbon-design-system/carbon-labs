/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
// @ts-ignore
import styles from './src/toolbar.scss?inline';
import { toolbarTemplate } from './src/toolbar.template';

const { stablePrefix: clabsPrefix } = settings;

/**
 * CLABS Toolbar component
 * @element clabs-toolbar
 */
@customElement(`${clabsPrefix}-toolbar`)
class CLABSToolbar extends LitElement {
  static styles = [styles];

  @property({ type: String, reflect: true }) orientation = 'horizontal';
  @query('slot') slotElement!: HTMLSlotElement;

  /**
   * Handles the keydown event. also updates the tabindex of the focusable elements.
   */
  async firstUpdated() {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeydown);
    this.setAttribute('role', 'toolbar');
    this._initializeFocusableElements();

    // overriding default border bottom for dropdowns, as it is not needed in the toolbar which already has a default border
    await this.updateComplete;
    this._getFocusableElements()
      .filter((el) => el.tagName.toLowerCase() === 'cds-dropdown')
      .forEach((el) => {
        const shadowRoot = el.shadowRoot;
        const listBox = shadowRoot?.querySelector('.cds--list-box');
        if (listBox) {
          (listBox as HTMLElement).style.borderBlockEnd = 'unset';
        }
      });
  }

  /**
   * Cleans up the event listeners.
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeydown);
  }

  /**
   * Initializes the focusable elements in the toolbar.
   */
  private _initializeFocusableElements() {
    const focusableElements = this._getFocusableElements();

    focusableElements.forEach((el, index) =>
      el.setAttribute('tabindex', index === 0 ? '0' : '-1')
    );
  }

  /**
   * Handles the keydown event. also updates the tabindex of the focusable elements.
   *
   * @param {KeyboardEvent} event - The keyboard event.
   */
  private _handleKeydown(event: KeyboardEvent) {
    const focusableElements = this._getFocusableElements();
    if (
      ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)
    ) {
      event.preventDefault();
    }
    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement
    );
    if (currentIndex === -1) {
      return;
    }

    let nextIndex = currentIndex;
    const isHorizontal = this.orientation === 'horizontal' || undefined;

    switch (event.key) {
      case 'ArrowRight':
        if (isHorizontal) {
          nextIndex = (currentIndex + 1) % focusableElements.length;
        }
        break;
      case 'ArrowLeft':
        if (isHorizontal) {
          nextIndex =
            (currentIndex - 1 + focusableElements.length) %
            focusableElements.length;
        }
        break;
      case 'ArrowDown':
        if (this.orientation === 'vertical') {
          nextIndex = (currentIndex + 1) % focusableElements.length;
        }
        break;
      case 'ArrowUp':
        if (this.orientation === 'vertical') {
          nextIndex =
            (currentIndex - 1 + focusableElements.length) %
            focusableElements.length;
        }
        break;
    }

    this._updateTabIndexes(focusableElements, nextIndex);

    focusableElements[nextIndex]?.focus();
  }

  /**
   * @param {HTMLElement[]} elements - An array of HTML elements to update.
   * @param {number} activeIndex - The index of the active element.
   */
  private _updateTabIndexes(elements: HTMLElement[], activeIndex: number) {
    elements.forEach((el, index) =>
      el.setAttribute('tabindex', index === activeIndex ? '0' : '-1')
    );
  }

  /**
   * @returns {HTMLElement[]} An array of focusable elements in the toolbar.
   */
  private _getFocusableElements(): HTMLElement[] {
    return this.slotElement
      ? this.slotElement
          .assignedElements({ flatten: true })
          // @ts-ignore
          .flatMap((el) => Array.from(el.children) as HTMLElement[])
      : [];
  }

  /**
   * render function 
   */
  render() {
    return toolbarTemplate();
  }
}

export default CLABSToolbar;
