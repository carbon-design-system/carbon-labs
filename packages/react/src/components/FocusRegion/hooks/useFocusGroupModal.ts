/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useEffect, useState } from 'react';

export interface ModalStackEntry {
  groupId: string;
  previousFocus: Element | null;
}

export interface PushModalOptions {
  /** A CSS selector or React ref pointing to the element that should receive
   *  focus when the modal opens. Falls back to the first tabbable element in
   *  the group, then the region root, then body (with a dev warning if reached). */
  initialFocus?: string | React.RefObject<HTMLElement>;
}

/**
 * Global modal stack state
 */
class ModalStackManager {
  private stack: ModalStackEntry[] = [];
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  getStack(): ModalStackEntry[] {
    return [...this.stack];
  }

  getActiveGroupId(): string | null {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1].groupId : null;
  }

  push(groupId: string, options?: PushModalOptions): void {
    // Capture current focus
    const previousFocus = document.activeElement;

    // Push to stack
    this.stack.push({
      groupId,
      previousFocus,
    });

    this.notify();

    // Handle initial focus after state update
    requestAnimationFrame(() => {
      this.setInitialFocus(groupId, options);
    });
  }

  private setInitialFocus(groupId: string, options?: PushModalOptions): void {
    let targetElement: HTMLElement | null = null;

    // Try to resolve initialFocus if provided
    if (options?.initialFocus) {
      if (typeof options.initialFocus === 'string') {
        targetElement = document.querySelector(options.initialFocus);
      } else if (options.initialFocus.current) {
        targetElement = options.initialFocus.current;
      }
    }

    // Fallback chain if initialFocus not provided or didn't resolve
    if (!targetElement) {
      // Find first tabbable element in any region with this groupId
      const regions = document.querySelectorAll(`[data-focus-region-group*="${groupId}"]`);
      
      for (const region of Array.from(regions)) {
        if (region instanceof HTMLElement) {
          const tabbable = this.findFirstTabbable(region);
          if (tabbable) {
            targetElement = tabbable;
            break;
          }
        }
      }

      // If still no target, try region root
      if (!targetElement && regions.length > 0) {
        const firstRegion = regions[0];
        if (firstRegion instanceof HTMLElement) {
          targetElement = firstRegion;
        }
      }

      // Last resort: body (with warning)
      if (!targetElement) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[FocusRegion] No valid focus target found for modal group "${groupId}". ` +
            `Falling back to document.body. This may indicate a configuration issue.`
          );
        }
        targetElement = document.body;
      }
    }

    if (targetElement) {
      targetElement.focus();
    }
  }

  private findFirstTabbable(container: HTMLElement): HTMLElement | null {
    const tabbableSelector = [
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
    ].join(',');

    const elements = container.querySelectorAll(tabbableSelector);
    for (const element of Array.from(elements)) {
      if (element instanceof HTMLElement && !element.hidden && element.offsetParent !== null) {
        return element;
      }
    }
    return null;
  }

  pop(groupId?: string): void {
    if (this.stack.length === 0) {
      return;
    }

    let entry: ModalStackEntry | undefined;

    if (groupId) {
      // Find and remove specific group ID
      const index = this.stack.findIndex((e) => e.groupId === groupId);
      if (index === -1) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[FocusRegion] Attempted to pop modal group "${groupId}" which is not in the stack.`
          );
        }
        return;
      }

      // Warn if not popping from top
      if (index !== this.stack.length - 1 && process.env.NODE_ENV === 'development') {
        console.warn(
          `[FocusRegion] Popping modal group "${groupId}" out of order. ` +
          `This may indicate incorrect modal lifecycle management.`
        );
      }

      entry = this.stack.splice(index, 1)[0];
    } else {
      // Pop from top
      entry = this.stack.pop();
    }

    this.notify();

    // Restore focus after state update
    if (entry) {
      requestAnimationFrame(() => {
        this.restoreFocus(entry!.previousFocus);
      });
    }
  }

  private restoreFocus(previousFocus: Element | null): void {
    // Try to restore to previous focus
    if (previousFocus && document.contains(previousFocus) && previousFocus instanceof HTMLElement) {
      previousFocus.focus();
      return;
    }

    // Fallback chain
    const activeGroupId = this.getActiveGroupId();
    
    if (activeGroupId) {
      // Try to focus first region in the now-active modal group
      const regions = document.querySelectorAll(`[data-focus-region-group*="${activeGroupId}"]`);
      if (regions.length > 0 && regions[0] instanceof HTMLElement) {
        regions[0].focus();
        return;
      }
    }

    // Try first tabbable in body
    const firstTabbable = this.findFirstTabbable(document.body);
    if (firstTabbable) {
      firstTabbable.focus();
      return;
    }

    // Last resort: body itself (with warning)
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[FocusRegion] Could not find valid focus restore target. Falling back to document.body.'
      );
    }
    document.body.focus();
  }
}

// Global singleton instance
const modalStackManager = new ModalStackManager();

/**
 * Hook to access modal stack management
 */
export function useFocusGroupModal() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    return modalStackManager.subscribe(() => {
      forceUpdate({});
    });
  }, []);

  const pushModal = useCallback((groupId: string, options?: PushModalOptions) => {
    // Check if any regions exist for this group
    if (process.env.NODE_ENV === 'development') {
      const regions = document.querySelectorAll(`[data-focus-region-group*="${groupId}"]`);
      if (regions.length === 0) {
        console.warn(
          `[FocusRegion] pushModal called for group "${groupId}" but no regions with this group ID are registered.`
        );
      }
    }

    modalStackManager.push(groupId, options);
  }, []);

  const popModal = useCallback((groupId?: string) => {
    modalStackManager.pop(groupId);
  }, []);

  return {
    pushModal,
    popModal,
    activeGroupId: modalStackManager.getActiveGroupId(),
    stack: modalStackManager.getStack(),
  };
}

/**
 * Get the current active group ID without subscribing to changes
 */
export function getActiveGroupId(): string | null {
  return modalStackManager.getActiveGroupId();
}

