/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SELECTORS = [
  'cds-icon-button',
  'cds-button',
  'cds-dropdown',
  'cds-text-input',
  'cds-search',
].join(',');

/**
 * Checks if an element is enabled.
 *
 * @param {Element} el - Element to check
 * @returns {boolean} True if enabled
 */
const isEnabled = (el: Element): boolean =>
  !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true';

/**
 * Core roving tabindex implementation with arrow key navigation.
 *
 * @param {HTMLElement} node - Container element
 * @param {Function} filterFn - Element filter function
 * @returns {Function} Cleanup function
 */
const createRovingTabindexImpl = (
  node: HTMLElement,
  filterFn: (el: Element) => boolean
): (() => void) => {
  const elements = Array.from(node.querySelectorAll(SELECTORS))
    .filter(filterFn)
    .filter(isEnabled) as HTMLElement[];

  if (!elements.length) {
    return () => {};
  }

  /** @param {number} activeIndex - Index of element to make focusable */
  const updateTabIndexes = (activeIndex: number): void => {
    elements.forEach((el, i) => (el.tabIndex = i === activeIndex ? 0 : -1));
  };

  updateTabIndexes(0);

  /** @param {Event} event - Focus event */
  const handleFocus = (event: Event): void => {
    const index = elements.indexOf(event.currentTarget as HTMLElement);
    if (index !== -1) {
      updateTabIndexes(index);
    }
  };

  /** @param {KeyboardEvent} event - Keyboard event */
  const handleKeyDown = (event: KeyboardEvent): void => {
    const index = elements.indexOf(event.currentTarget as HTMLElement);
    if (index === -1 || !['ArrowRight', 'ArrowLeft'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const nextIndex =
      event.key === 'ArrowRight'
        ? (index + 1) % elements.length
        : (index - 1 + elements.length) % elements.length;

    updateTabIndexes(nextIndex);
    elements[nextIndex].focus();
  };

  elements.forEach((el) => {
    el.addEventListener('focus', handleFocus);
    el.addEventListener('keydown', handleKeyDown);
  });

  return () =>
    elements.forEach((el) => {
      el.removeEventListener('focus', handleFocus);
      el.removeEventListener('keydown', handleKeyDown);
    });
};

/**
 * Roving tabindex for elements outside popovers.
 *
 * @param {HTMLElement} node - Container element
 * @returns {Function} Cleanup function
 */
export const toolbarRovingTabindex = (node: HTMLElement): (() => void) =>
  createRovingTabindexImpl(node, (el) => !el.closest('cds-popover-content'));

/**
 * Roving tabindex for elements inside popovers.
 *
 * @param {HTMLElement} node - Container element
 * @returns {Function} Cleanup function
 */
export const popoverRovingTabIndex = (node: HTMLElement): (() => void) =>
  createRovingTabindexImpl(node, (el) => !!el.closest('cds-popover-content'));
