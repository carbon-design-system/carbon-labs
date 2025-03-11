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
    this.addEventListener('focusin', this._handleFocusIn);
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
    this.removeEventListener('focusin', this._handleFocusIn);
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
    const isHorizontal = this.orientation === 'horizontal';
    const isVertical = this.orientation === 'vertical';

    /**
     * Moves the focus to the next or previous focusable element.
     *
     * @param {number} direction - The direction to move the focus. Positive for next, negative for previous.
     */
    const moveFocus = (direction: number) => {
      nextIndex += direction;
      nextIndex = Math.max(
        0,
        Math.min(nextIndex, focusableElements.length - 1)
      );
    };

    switch (event.key) {
      case 'ArrowRight':
        if (isHorizontal) {
          moveFocus(1);
        }
        break;
      case 'ArrowLeft':
        if (isHorizontal) {
          moveFocus(-1);
        }
        break;
      case 'ArrowDown':
        if (isVertical) {
          moveFocus(1);
        }
        break;
      case 'ArrowUp':
        if (isVertical) {
          moveFocus(-1);
        }
        break;
    }

    this._updateTabIndexes(focusableElements, nextIndex);
    focusableElements[nextIndex]?.focus();
  }

  /**
   * Handles the focusin event and updates the tabindex of the focusable elements.
   *
   * @param {FocusEvent} event - The focus event.
   */
  private _handleFocusIn(event: FocusEvent) {
    const focusableElements = this._getFocusableElements();
    const focusedElement = event.target as HTMLElement;
    const focusedIndex = focusableElements.indexOf(focusedElement);

    if (focusedIndex !== -1) {
      this._updateTabIndexes(focusableElements, focusedIndex);
    }
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
