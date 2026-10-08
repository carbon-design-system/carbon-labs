/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ---------------------------------------------------------------------------
// Tabbable element selector shared across registry helpers
// ---------------------------------------------------------------------------

const TABBABLE_SELECTOR = [
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

// ---------------------------------------------------------------------------
// Visibility helper
// ---------------------------------------------------------------------------

function isElementVisible(element: HTMLElement): boolean {
  if (element.hidden) return false;
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;

  let current: HTMLElement | null = element;
  while (current) {
    if (current.hasAttribute('inert') || (current as any).inert === true) {
      return false;
    }
    current = current.parentElement;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Tabbable helpers (shadow-DOM aware)
// ---------------------------------------------------------------------------

export function getTabbableElements(container: HTMLElement): HTMLElement[] {
  const tabbable: HTMLElement[] = [];

  function traverse(root: HTMLElement | ShadowRoot) {
    const elements = root.querySelectorAll(TABBABLE_SELECTOR);
    for (const el of Array.from(elements)) {
      if (el instanceof HTMLElement && isElementVisible(el)) {
        tabbable.push(el);
      }
      if ((el as HTMLElement).shadowRoot) {
        traverse((el as HTMLElement).shadowRoot!);
      }
    }
  }

  traverse(container);
  if (container.shadowRoot) {
    traverse(container.shadowRoot);
  }
  return tabbable;
}

export function getFirstTabbable(container: HTMLElement): HTMLElement | null {
  const els = getTabbableElements(container);
  return els.length > 0 ? els[0] : null;
}

// ---------------------------------------------------------------------------
// FocusRegion registry
// ---------------------------------------------------------------------------

export interface FocusRegionRegistration {
  id: string;
  element: HTMLElement;
  enabled: boolean;
  groupIds: string[];
  focusLocation: HTMLElement | null;
}

class FocusRegionRegistry {
  private regions: Map<string, FocusRegionRegistration> = new Map();
  private defaultRegionId: string | null = null;
  private hasWarnedMultipleDefaults = false;
  private singletonRoles = new Map<string, string>();

  register(
    id: string,
    element: HTMLElement,
    enabled: boolean,
    groupIds: string[],
    isDefault: boolean,
    role?: string
  ): void {
    const existing = this.regions.get(id);
    const focusLocation = existing?.focusLocation ?? null;

    this.regions.set(id, { id, element, enabled, groupIds, focusLocation });

    if (isDefault) {
      if (this.defaultRegionId === null) {
        this.defaultRegionId = id;
      } else if (!this.hasWarnedMultipleDefaults) {
        console.warn(
          '[FocusRegion] Multiple regions declared with default-focus. ' +
            'Only the first region in DOM order will be used as the default.'
        );
        this.hasWarnedMultipleDefaults = true;
      }
    }

    if (role && ['main', 'banner', 'contentinfo'].includes(role)) {
      const existingId = this.singletonRoles.get(role);
      if (existingId && existingId !== id) {
        console.warn(
          `[FocusRegion] Multiple regions with singleton role="${role}" detected. ` +
            `This role should only appear once per page.`
        );
      }
      this.singletonRoles.set(role, id);
    }
  }

  unregister(id: string): void {
    this.singletonRoles.forEach((regionId, role) => {
      if (regionId === id) this.singletonRoles.delete(role);
    });
    this.regions.delete(id);
    if (this.defaultRegionId === id) {
      this.defaultRegionId = null;
      this.hasWarnedMultipleDefaults = false;
    }
  }

  update(id: string, enabled: boolean, groupIds: string[]): void {
    const region = this.regions.get(id);
    if (region) {
      region.enabled = enabled;
      region.groupIds = groupIds;
    }
  }

  setFocusLocation(id: string, element: HTMLElement | null): void {
    const region = this.regions.get(id);
    if (region) region.focusLocation = element;
  }

  getFocusLocation(id: string): HTMLElement | null {
    return this.regions.get(id)?.focusLocation ?? null;
  }

  getEnabledRegions(activeGroupId: string | null): FocusRegionRegistration[] {
    return Array.from(this.regions.values())
      .filter((r) => {
        if (!r.enabled) return false;
        if (!activeGroupId) return true;
        return r.groupIds.includes(activeGroupId);
      })
      .sort((a, b) => {
        const pos = a.element.compareDocumentPosition(b.element);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
  }

  getDefaultRegionId(): string | null {
    return this.defaultRegionId;
  }

  getRegion(id: string): FocusRegionRegistration | undefined {
    return this.regions.get(id);
  }
}

// Page-level singleton registry
export const focusRegionRegistry = new FocusRegionRegistry();

// ---------------------------------------------------------------------------
// Modal stack
// ---------------------------------------------------------------------------

class ModalStackManager {
  private stack: Array<{ groupId: string; previousFocus: Element | null }> = [];
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getActiveGroupId(): string | null {
    return this.stack.length > 0
      ? this.stack[this.stack.length - 1].groupId
      : null;
  }

  getStack() {
    return [...this.stack];
  }

  push(groupId: string, initialFocusSelector?: string): void {
    const previousFocus = document.activeElement;
    this.stack.push({ groupId, previousFocus });
    this.notify();

    requestAnimationFrame(() => {
      let target: HTMLElement | null = null;
      if (initialFocusSelector) {
        target = document.querySelector(initialFocusSelector);
      }
      if (!target) {
        const regions = document.querySelectorAll(
          `[data-focus-region-group*="${groupId}"]`
        );
        for (const r of Array.from(regions)) {
          if (r instanceof HTMLElement) {
            target = getFirstTabbable(r);
            if (target) break;
          }
        }
      }
      if (!target && document.body) {
        target = getFirstTabbable(document.body) ?? document.body;
      }
      target?.focus();
    });
  }

  pop(groupId?: string): void {
    if (this.stack.length === 0) return;

    let entry: { groupId: string; previousFocus: Element | null } | undefined;
    if (groupId) {
      const idx = this.stack.findIndex((e) => e.groupId === groupId);
      if (idx === -1) return;
      entry = this.stack.splice(idx, 1)[0];
    } else {
      entry = this.stack.pop();
    }

    this.notify();

    if (entry) {
      requestAnimationFrame(() => {
        const prev = entry!.previousFocus;
        if (
          prev &&
          document.contains(prev) &&
          prev instanceof HTMLElement
        ) {
          prev.focus();
        } else {
          (getFirstTabbable(document.body) ?? document.body)?.focus();
        }
      });
    }
  }
}

export const modalStackManager = new ModalStackManager();

// ---------------------------------------------------------------------------
// Global F6 keyboard handler (attached once per page)
// ---------------------------------------------------------------------------

export const F6_NAVIGATION_EVENT = 'clabs-focus-region-f6-navigation';

let globalF6HandlerAttached = false;

export function attachGlobalF6Handler(): void {
  if (globalF6HandlerAttached) return;
  globalF6HandlerAttached = true;

  document.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (event.key !== 'F6') return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const activeElement = document.activeElement as HTMLElement;
      if (!activeElement) return;

      const activeGroupId = modalStackManager.getActiveGroupId();
      const enabledRegions = focusRegionRegistry.getEnabledRegions(activeGroupId);
      if (enabledRegions.length === 0) return;

      const currentRegion = activeElement.closest(
        '[data-focus-region]'
      ) as HTMLElement | null;
      let currentIndex = -1;
      let currentRegionId: string | null = null;

      if (currentRegion) {
        currentRegionId = currentRegion.getAttribute('data-focus-region-id');
        if (currentRegionId) {
          currentIndex = enabledRegions.findIndex((r) => r.id === currentRegionId);
        }
      }

      let target: FocusRegionRegistration;
      if (event.shiftKey) {
        target =
          currentIndex > 0
            ? enabledRegions[currentIndex - 1]
            : enabledRegions[enabledRegions.length - 1];
      } else {
        target =
          currentIndex >= 0 && currentIndex < enabledRegions.length - 1
            ? enabledRegions[currentIndex + 1]
            : enabledRegions[0];
      }

      // Focus stored location, first tabbable, or region container
      const focusLocation = target.focusLocation;
      if (
        focusLocation &&
        target.element.contains(focusLocation) &&
        document.body.contains(focusLocation)
      ) {
        focusLocation.focus();
      } else {
        const first = getFirstTabbable(target.element);
        if (first) {
          first.focus();
          focusRegionRegistry.setFocusLocation(target.id, first);
        } else {
          target.element.focus();
        }
      }

      document.dispatchEvent(
        new CustomEvent(F6_NAVIGATION_EVENT, {
          detail: { sourceRegionId: currentRegionId },
        })
      );
    },
    true
  );
}
