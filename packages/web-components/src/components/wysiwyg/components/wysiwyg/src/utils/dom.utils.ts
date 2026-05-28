/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Utility functions for DOM manipulation
 */
export class DOMUtils {
  /**
   * Get focusable elements from shadow root
   * @param {ShadowRoot} shadowRoot - The shadow root to query for focusable elements
   * @param {string} selector - CSS selector for focusable elements
   */
  public static getFocusableElements(
    shadowRoot: ShadowRoot,
    selector: string
  ): HTMLElement[] {
    return Array.from(shadowRoot.querySelectorAll<HTMLElement>(selector));
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
      el.setAttribute('tabindex', i === activeIndex ? '0' : '-1');
    });
  }

  /**
   * Override Carbon stack display to flex with wrap
   * @param {HTMLElement} stackElement - The Carbon stack element to modify
   */
  public static overrideStackDisplay(stackElement: HTMLElement): void {
    if (!stackElement?.shadowRoot) {
      return;
    }

    const stackDiv = stackElement.shadowRoot.querySelector('div');
    if (stackDiv) {
      (stackDiv as HTMLElement).style.display = 'flex';
      (stackDiv as HTMLElement).style.flexWrap = 'wrap';
    }
  }

  /**
   * Wait for next animation frame
   */
  public static waitForAnimationFrame(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
}
