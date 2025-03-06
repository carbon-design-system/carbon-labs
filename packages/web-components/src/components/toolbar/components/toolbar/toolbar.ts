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
 * CLABS Component extending toolbar
 */
@customElement(`${clabsPrefix}-toolbar`)
class CLABSToolbar extends LitElement {
  static styles = [styles];

  @property({ type: Boolean, reflect: true }) vertical = false;
  @query('slot') slotElement!: HTMLSlotElement;

  /**
   * Handles the keydown event. also updates the tabindex of the focusable elements.
   */
  firstUpdated() {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeydown);
    this._initializeFocusableElements();
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
    console.log(focusableElements);
    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement
    );
    if (currentIndex === -1) {
      return;
    }

    let nextIndex = currentIndex;
    const isHorizontal = !this.vertical;

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
        if (this.vertical) {
          nextIndex = (currentIndex + 1) % focusableElements.length;
        }
        break;
      case 'ArrowUp':
        if (this.vertical) {
          nextIndex =
            (currentIndex - 1 + focusableElements.length) %
            focusableElements.length;
        }
        break;
    }

    this._updateTabIndexes(focusableElements, nextIndex);
    console.log(focusableElements[nextIndex]);

    focusableElements[nextIndex]?.focus();
    // event.preventDefault();
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
    return (
      (this.slotElement?.assignedElements({ flatten: true }) || [])
        // @ts-ignore
        .flatMap((group) =>
          Array.from(
            // be sure to include all the focusable web components
            group.querySelectorAll(
              'cds-icon-button, clabs-toolbar-button, cds-dropdown, cds-overflow-menu'
            )
          )
        )
        .filter((el) => el instanceof HTMLElement) as HTMLElement[]
    );
  }

  /**
   * render function
   */
  render() {
    return toolbarTemplate(this.vertical);
  }
}

export default CLABSToolbar;
