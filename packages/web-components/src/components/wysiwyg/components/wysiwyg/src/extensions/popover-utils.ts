/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Shared utility for handling popover behavior across extensions.
 * Provides consistent Escape key handling and focus management.
 */

/**
 * Sets up popover content with Escape key handling and focus management.
 * @param {Element | undefined} element - Popover content element
 * @param {string} [focusSelector] - Optional selector for element to focus when opened
 */
export const setupPopoverContent = (
  element: Element | undefined,
  focusSelector = 'cds-icon-button:not([disabled])'
) => {
  if (!element) {
    return;
  }

  const popover = element.closest('cds-popover') as any;
  if (!popover) {
    return;
  }

  /**
   * Handles Escape key to close popover
   * @param {Event} event - Keyboard event
   */
  const handleKeyDown = (event: Event) => {
    if ((event as KeyboardEvent).key !== 'Escape' || !popover.open) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    popover.open = false;
    (popover.querySelector('cds-icon-button') as HTMLElement)?.focus();
  };

  /**
   * Manages focus and keyboard listeners based on popover state
   * @param {boolean} isOpen - Whether popover is open
   */
  const handleOpenChange = (isOpen: boolean) => {
    element[`${isOpen ? 'add' : 'remove'}EventListener`](
      'keydown',
      handleKeyDown
    );
    isOpen &&
      requestAnimationFrame(() =>
        (element.querySelector(focusSelector) as HTMLElement)?.focus()
      );
  };

  new MutationObserver((mutations) => {
    mutations.some(
      (m) => m.type === 'attributes' && m.attributeName === 'open'
    ) && handleOpenChange(popover.open);
  }).observe(popover, { attributes: true, attributeFilter: ['open'] });

  popover.open && handleOpenChange(true);
};

/**
 * Toggles a popover's open state.
 * @param {any} popoverRef - Reference to the popover element
 */
export const togglePopover = (popoverRef: any) => {
  popoverRef?.value && (popoverRef.value.open = !popoverRef.value.open);
};

/**
 * Closes a popover.
 * @param {any} popoverRef - Reference to the popover element
 */
export const closePopover = (popoverRef: any) => {
  popoverRef?.value && (popoverRef.value.open = false);
};
