/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { EditorOrientation } from '../types/editor.types.js';

/**
 * Utility functions for DOM manipulation and keyboard navigation
 */
export class DOMUtils {
  /**
   * Check if an element is disabled
   * @param {HTMLElement} element - The element to check
   * @returns {boolean} True if the element is disabled
   */
  private static isElementDisabled(element: HTMLElement): boolean {
    // Check for disabled attribute
    if (element.hasAttribute('disabled')) {
      return true;
    }

    // Check for aria-disabled
    if (element.getAttribute('aria-disabled') === 'true') {
      return true;
    }

    // For custom elements like cds-icon-button, check the disabled property
    if ('disabled' in element && (element as any).disabled === true) {
      return true;
    }

    return false;
  }

  /**
   * Get focusable elements from shadow root, excluding disabled elements and nested elements eg. popover internals.
   * @param {ShadowRoot} shadowRoot - The shadow root to query for focusable elements
   * @param {string} selector - CSS selector for focusable elements
   * @returns {HTMLElement[]} Array of focusable, non-disabled, top-level elements
   */
  public static getFocusableElements(
    shadowRoot: ShadowRoot,
    selector: string
  ): HTMLElement[] {
    const allElements = Array.from(
      shadowRoot.querySelectorAll<HTMLElement>(selector)
    );
    return allElements.filter(
      (el) => !this.isElementDisabled(el) && !el.closest('cds-popover-content')
    );
  }

  /**
   * Find the first non-disabled element index
   * @param {HTMLElement[]} elements - Array of HTML elements
   * @returns {number} Index of the first non-disabled element, or 0 if all are disabled
   */
  public static findFirstEnabledIndex(elements: HTMLElement[]): number {
    const index = elements.findIndex((el) => !this.isElementDisabled(el));
    return index === -1 ? 0 : index;
  }

  /**
   * Update tab indexes for keyboard navigation
   * @param {HTMLElement[]} elements - Array of HTML elements to update
   * @param {number} activeIndex - Index of the currently active element
   */
  public static updateTabIndexes(
    elements: HTMLElement[],
    activeIndex: number
  ): void {
    elements.forEach((el, i) => {
      const tabindexValue = i === activeIndex ? '0' : '-1';

      // For cds-icon-button, set tabindex on the button inside shadow DOM
      if (el.tagName.toLowerCase() === 'cds-icon-button') {
        const button = el.shadowRoot?.querySelector('button');
        if (button) {
          button.setAttribute('tabindex', tabindexValue);
        }
      } else {
        // For other elements, set on the element itself
        el.setAttribute('tabindex', tabindexValue);
      }
    });
  }

  /**
   * Calculate next focusable element index based on arrow key and orientation
   * @param {string} key - The arrow key pressed
   * @param {number} currentIndex - Current focused element index
   * @param {number} totalElements - Total number of focusable elements
   * @param {EditorOrientation} orientation - Toolbar orientation
   * @returns {number} Next element index to focus
   */
  public static getNextFocusIndex(
    key: string,
    currentIndex: number,
    totalElements: number,
    orientation: EditorOrientation
  ): number {
    const horizontal = orientation === 'horizontal';

    switch (key) {
      case 'ArrowRight':
        return horizontal ? (currentIndex + 1) % totalElements : currentIndex;
      case 'ArrowLeft':
        return horizontal
          ? (currentIndex - 1 + totalElements) % totalElements
          : currentIndex;
      case 'ArrowDown':
        return !horizontal ? (currentIndex + 1) % totalElements : currentIndex;
      case 'ArrowUp':
        return !horizontal
          ? (currentIndex - 1 + totalElements) % totalElements
          : currentIndex;
      default:
        return currentIndex;
    }
  }

  /**
   * Check if the active element is within the editor content area
   * @param {Element | null} editorContent - The editor content element
   * @param {Element | null} activeElement - The currently active element
   * @returns {boolean} True if active element is in editor content
   */
  public static isActiveElementInEditor(
    editorContent: Element | null,
    activeElement: Element | null
  ): boolean {
    if (!editorContent || !activeElement) {
      return false;
    }

    return (
      editorContent.contains(activeElement) ||
      editorContent === activeElement ||
      editorContent.querySelector('.ProseMirror')?.contains(activeElement) ||
      false
    );
  }
}
